import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const FIRESTORE_DOC = 'settings/restaurant_status';

class RestaurantStatusService {
  constructor() {
    this.storageKey = '@restaurant_status';
    this.scheduleKey = '@restaurant_schedule';
    this.overrideKey = '@restaurant_override';
    this.firestoreUnsubscribe = null;
    this.isClientMode = false; // true = lecture seule depuis Firestore, jamais d'écriture

    // Horaires par défaut (format 24h) - Service journée 11h-18h + soirée 18h-01h55
    this.defaultSchedule = {
      monday: { open: '11:00', close: '01:55', enabled: true },
      tuesday: { open: '11:00', close: '01:55', enabled: true },
      wednesday: { open: '11:00', close: '01:55', enabled: true },
      thursday: { open: '11:00', close: '01:55', enabled: true },
      friday: { open: '11:00', close: '01:55', enabled: true },
      saturday: { open: '11:00', close: '01:55', enabled: true },
      sunday: { open: '11:00', close: '01:55', enabled: true }
    };

    this.statusListeners = [];
    this.intervalId = null;
    this.currentStatus = null;
  }

  // Initialiser le service
  async initialize() {
    try {
      console.log('🏪 Initialisation du service de statut restaurant');

      // Charger les horaires personnalisés ou utiliser les défauts
      const schedule = await this.getSchedule();
      if (!schedule || schedule.monday?.open === '18:00') {
        // Migrer vers les nouveaux horaires 11h-01h55
        await this.setSchedule(this.defaultSchedule);
      }

      // Calculer le statut initial
      const status = await this.updateStatus();

      // Synchroniser le statut initial vers Firestore
      if (status) {
        await this.syncStatusToFirestore(status);
      }

      // Démarrer le monitoring automatique (vérification toutes les minutes)
      this.startAutoMonitoring();

      console.log('✅ Service de statut restaurant initialisé');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur initialisation service statut:', error);
      return { success: false, error: error.message };
    }
  }

  // Démarrer le monitoring automatique
  startAutoMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Vérifier le statut toutes les minutes
    this.intervalId = setInterval(async () => {
      await this.updateStatus();
    }, 60 * 1000); // 1 minute

    console.log('🔄 Monitoring automatique du statut démarré');
  }

  // Arrêter le monitoring
  stopAutoMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Monitoring automatique arrêté');
    }
  }

  // Mettre à jour le statut automatiquement
  async updateStatus() {
    try {
      const override = await this.getOverride();
      let newStatus;

      if (override && override.active) {
        // Forçage manuel actif
        newStatus = {
          isOpen: override.forceOpen,
          mode: 'manual',
          reason: override.reason || (override.forceOpen ? 'Ouvert manuellement' : 'Fermé manuellement'),
          lastUpdated: new Date().toISOString(),
          nextChange: override.expiresAt || null
        };
      } else {
        // Calcul automatique basé sur les horaires
        const autoStatus = await this.calculateAutoStatus();
        newStatus = {
          isOpen: autoStatus.isOpen,
          mode: 'automatic',
          reason: autoStatus.reason,
          lastUpdated: new Date().toISOString(),
          nextChange: autoStatus.nextChange
        };
      }

      // Sauvegarder et notifier si changement
      const previousStatus = this.currentStatus;
      const hasChanged = !previousStatus ||
        previousStatus.isOpen !== newStatus.isOpen ||
        previousStatus.mode !== newStatus.mode ||
        previousStatus.reason !== newStatus.reason;

      this.currentStatus = newStatus;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(newStatus));

      if (hasChanged) {
        console.log(`🏪 Statut restaurant changé: ${newStatus.isOpen ? 'OUVERT' : 'FERMÉ'} (${newStatus.mode})`);
        this.notifyListeners(newStatus, previousStatus);
        // Synchroniser vers Firestore pour que les clients le voient
        await this.syncStatusToFirestore(newStatus);
      }

      return newStatus;
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      return this.currentStatus || { isOpen: false, mode: 'error', reason: 'Erreur système' };
    }
  }

  // Calculer le statut automatique selon les horaires
  async calculateAutoStatus() {
    try {
      const schedule = await this.getSchedule();
      const now = new Date();
      const currentDay = this.getDayKey(now);
      const currentTime = this.formatTime(now);

      const todaySchedule = schedule[currentDay];

      if (!todaySchedule || !todaySchedule.enabled) {
        return {
          isOpen: false,
          reason: 'Fermé aujourd\'hui',
          nextChange: this.getNextOpenTime(schedule, now)
        };
      }

      const isCurrentlyOpen = this.isTimeInRange(currentTime, todaySchedule.open, todaySchedule.close);

      if (isCurrentlyOpen) {
        const closeTime = this.parseTime(todaySchedule.close);
        const closeDateTime = new Date(now);
        closeDateTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);

        return {
          isOpen: true,
          reason: `Ouvert jusqu'à ${todaySchedule.close}`,
          nextChange: closeDateTime.toISOString()
        };
      } else {
        return {
          isOpen: false,
          reason: this.getClosedReason(currentTime, todaySchedule),
          nextChange: this.getNextOpenTime(schedule, now)
        };
      }
    } catch (error) {
      console.error('❌ Erreur calcul statut automatique:', error);
      return {
        isOpen: false,
        reason: 'Erreur de calcul',
        nextChange: null
      };
    }
  }

  // Forcer le statut manuellement
  async forceStatus(isOpen, reason = null, durationMinutes = null) {
    try {
      const override = {
        active: true,
        forceOpen: isOpen,
        reason: reason || (isOpen ? 'Ouvert manuellement' : 'Fermé manuellement'),
        createdAt: new Date().toISOString(),
        expiresAt: durationMinutes ?
          new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() :
          null
      };

      await AsyncStorage.setItem(this.overrideKey, JSON.stringify(override));

      // Mettre à jour immédiatement le statut et forcer la notification
      await this.updateStatus();

      // Forcer une seconde notification pour s'assurer que les listeners sont mis à jour
      if (this.currentStatus) {
        this.notifyListeners(this.currentStatus, null);
      }

      console.log(`🔧 Statut forcé: ${isOpen ? 'OUVERT' : 'FERMÉ'} ${durationMinutes ? `pour ${durationMinutes}min` : 'indéfiniment'}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur forçage statut:', error);
      return { success: false, error: error.message };
    }
  }

  // Annuler le forçage manuel
  async clearOverride() {
    try {
      await AsyncStorage.removeItem(this.overrideKey);
      await this.updateStatus();

      // Forcer une notification pour s'assurer que les listeners sont mis à jour
      if (this.currentStatus) {
        this.notifyListeners(this.currentStatus, null);
      }

      console.log('🔄 Forçage annulé, retour au mode automatique');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur annulation forçage:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir le statut actuel
  async getStatus() {
    try {
      if (this.currentStatus) {
        return this.currentStatus;
      }

      // En mode client, lire UNIQUEMENT depuis Firestore (jamais calculer/écrire)
      if (this.isClientMode) {
        try {
          const docRef = doc(db, 'settings', 'restaurant_status');
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            this.currentStatus = {
              isOpen: data.isOpen,
              mode: data.mode,
              reason: data.reason,
              lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
              nextChange: data.nextChange || null
            };
            return this.currentStatus;
          }
        } catch (firestoreError) {
          console.error('❌ Client: Erreur lecture Firestore:', firestoreError);
        }
        // Firestore indisponible côté client → fermé par sécurité
        return { isOpen: false, mode: 'error', reason: 'Impossible de vérifier le statut' };
      }

      // Mode admin : fallback AsyncStorage puis calcul
      const statusJson = await AsyncStorage.getItem(this.storageKey);
      if (statusJson) {
        this.currentStatus = JSON.parse(statusJson);
        return this.currentStatus;
      }

      // Première utilisation admin, calculer le statut
      return await this.updateStatus();
    } catch (error) {
      console.error('❌ Erreur récupération statut:', error);
      return { isOpen: false, mode: 'error', reason: 'Erreur de récupération' };
    }
  }

  // Gestion des horaires
  async getSchedule() {
    try {
      const scheduleJson = await AsyncStorage.getItem(this.scheduleKey);
      return scheduleJson ? JSON.parse(scheduleJson) : this.defaultSchedule;
    } catch (error) {
      console.error('❌ Erreur récupération horaires:', error);
      return this.defaultSchedule;
    }
  }

  async setSchedule(schedule) {
    try {
      await AsyncStorage.setItem(this.scheduleKey, JSON.stringify(schedule));
      await this.updateStatus(); // Recalculer le statut
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde horaires:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir l'override actuel
  async getOverride() {
    try {
      const overrideJson = await AsyncStorage.getItem(this.overrideKey);
      if (!overrideJson) return null;

      const override = JSON.parse(overrideJson);

      // Vérifier si l'override a expiré
      if (override.expiresAt && new Date() > new Date(override.expiresAt)) {
        await AsyncStorage.removeItem(this.overrideKey);
        return null;
      }

      return override;
    } catch (error) {
      console.error('❌ Erreur récupération override:', error);
      return null;
    }
  }

  // Synchroniser le statut vers Firestore (appelé côté admin)
  async syncStatusToFirestore(status) {
    try {
      const docRef = doc(db, 'settings', 'restaurant_status');
      await setDoc(docRef, {
        isOpen: status.isOpen,
        mode: status.mode,
        reason: status.reason,
        lastUpdated: serverTimestamp(),
        nextChange: status.nextChange || null
      });
      console.log('☁️ Statut synchronisé vers Firestore:', status.isOpen ? 'OUVERT' : 'FERMÉ');
    } catch (error) {
      console.error('❌ Erreur sync Firestore:', error);
    }
  }

  // Écouter le statut depuis Firestore en temps réel (côté client)
  subscribeToFirestoreStatus() {
    try {
      // Éviter les doublons de listeners
      if (this.firestoreUnsubscribe) {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
      }
      const docRef = doc(db, 'settings', 'restaurant_status');
      this.firestoreUnsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const newStatus = {
            isOpen: data.isOpen,
            mode: data.mode,
            reason: data.reason,
            lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
            nextChange: data.nextChange || null
          };

          const previousStatus = this.currentStatus;
          this.currentStatus = newStatus;

          console.log('☁️ Statut Firestore reçu:', newStatus.isOpen ? 'OUVERT' : 'FERMÉ', `(${newStatus.mode})`);
          this.notifyListeners(newStatus, previousStatus);
        }
      }, (error) => {
        console.error('❌ Erreur listener Firestore statut:', error);
      });

      console.log('🔄 Écoute Firestore du statut restaurant activée');
    } catch (error) {
      console.error('❌ Erreur setup listener Firestore:', error);
    }
  }

  // Écouter les changements de statut
  addStatusListener(callback) {
    this.statusListeners.push(callback);

    // Retourner une fonction pour supprimer l'écouteur
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  // Notifier tous les écouteurs
  notifyListeners(newStatus, previousStatus) {
    this.statusListeners.forEach(callback => {
      try {
        callback(newStatus, previousStatus);
      } catch (error) {
        console.error('❌ Erreur notification listener:', error);
      }
    });
  }

  // Fonctions utilitaires
  getDayKey(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  isTimeInRange(currentTime, openTime, closeTime) {
    const current = this.parseTime(currentTime);
    const open = this.parseTime(openTime);
    const close = this.parseTime(closeTime);

    const currentMinutes = current.hours * 60 + current.minutes;
    const openMinutes = open.hours * 60 + open.minutes;
    const closeMinutes = close.hours * 60 + close.minutes;

    // Gérer le cas où on ferme après minuit (ex: 23:00 - 01:00)
    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  getClosedReason(currentTime, schedule) {
    const current = this.parseTime(currentTime);
    const open = this.parseTime(schedule.open);
    const close = this.parseTime(schedule.close);

    const currentMinutes = current.hours * 60 + current.minutes;
    const openMinutes = open.hours * 60 + open.minutes;
    const closeMinutes = close.hours * 60 + close.minutes;

    if (currentMinutes < openMinutes) {
      return `Ouvre à ${schedule.open}`;
    } else {
      return `Fermé depuis ${schedule.close}`;
    }
  }

  getNextOpenTime(schedule, fromDate) {
    // Logique pour calculer la prochaine ouverture
    const currentDay = this.getDayKey(fromDate);
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Chercher le prochain jour d'ouverture
    for (let i = 0; i < 7; i++) {
      const dayIndex = (days.indexOf(currentDay) + i) % 7;
      const dayKey = days[dayIndex];
      const daySchedule = schedule[dayKey];

      if (daySchedule && daySchedule.enabled) {
        const nextDate = new Date(fromDate);
        nextDate.setDate(nextDate.getDate() + i);
        const openTime = this.parseTime(daySchedule.open);
        nextDate.setHours(openTime.hours, openTime.minutes, 0, 0);

        return nextDate.toISOString();
      }
    }

    return null;
  }

  // Initialisation côté client (lecture seule depuis Firestore, jamais d'écriture)
  async initializeClient() {
    try {
      console.log('🏪 Initialisation client du service de statut restaurant');
      this.isClientMode = true; // IMPORTANT : empêche le client d'écrire dans Firestore

      // Lire le statut actuel depuis Firestore (lecture unique)
      const docRef = doc(db, 'settings', 'restaurant_status');
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        this.currentStatus = {
          isOpen: data.isOpen,
          mode: data.mode,
          reason: data.reason,
          lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
          nextChange: data.nextChange || null
        };
        console.log('☁️ Client: Statut initial Firestore:', this.currentStatus.isOpen ? 'OUVERT' : 'FERMÉ');
      }

      // Écouter les mises à jour en temps réel depuis Firestore
      this.subscribeToFirestoreStatus();

      console.log('✅ Service de statut restaurant initialisé (mode client)');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur initialisation client statut:', error);
      return { success: false, error: error.message };
    }
  }

  // Nettoyage
  cleanup() {
    this.stopAutoMonitoring();
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    this.statusListeners = [];
    this.currentStatus = null;
    this.isClientMode = false;
    console.log('🧹 Service de statut restaurant nettoyé');
  }
}

// Instance singleton
const restaurantStatusService = new RestaurantStatusService();

export default restaurantStatusService;

// Fonctions utilitaires exportées
export const initializeRestaurantStatus = () => restaurantStatusService.initialize();
export const getRestaurantStatus = () => restaurantStatusService.getStatus();
export const forceRestaurantStatus = (isOpen, reason, duration) =>
  restaurantStatusService.forceStatus(isOpen, reason, duration);
export const clearRestaurantOverride = () => restaurantStatusService.clearOverride();
export const addRestaurantStatusListener = (callback) =>
  restaurantStatusService.addStatusListener(callback);
export const getRestaurantSchedule = () => restaurantStatusService.getSchedule();
export const setRestaurantSchedule = (schedule) => restaurantStatusService.setSchedule(schedule);