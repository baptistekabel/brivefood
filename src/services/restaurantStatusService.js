import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Forçage manuel (ouverture / fermeture) partagé par TOUS les postes admin.
//
// Il ne vivait que dans l'AsyncStorage du poste qui l'avait déclenché. Les
// autres postes admin, eux, recalculaient le statut sur les horaires toutes les
// minutes et republiaient « ouvert » dans Firestore : fermer le restaurant
// depuis une tablette était défait dans la minute par n'importe quelle autre
// tablette admin connectée.
//
// Document séparé de `settings/restaurant_status`, que le monitoring réécrit
// intégralement chaque minute (setDoc sans merge).
const OVERRIDE_DOC = ['settings', 'restaurant_override'];

// Un forçage expiré ne vaut plus rien
const isOverrideExpired = (override) =>
  !!override?.expiresAt && new Date() > new Date(override.expiresAt);

// `active: false` vaut « aucun forçage » : le document existe toujours, ce qui
// évite d'avoir à distinguer « supprimé » de « jamais écrit »
const parseOverride = (snapshot) => {
  if (!snapshot?.exists?.()) return null;

  const data = snapshot.data();
  if (data?.active !== true) return null;

  return {
    active: true,
    forceOpen: data.forceOpen === true,
    reason: data.reason || null,
    createdAt: data.createdAt || null,
    expiresAt: data.expiresAt || null,
  };
};

class RestaurantStatusService {
  constructor() {
    this.storageKey = '@restaurant_status';
    this.scheduleKey = '@restaurant_schedule';
    this.overrideKey = '@restaurant_override';
    this.firestoreUnsubscribe = null;
    this.overrideUnsubscribe = null;
    this.scheduleUnsubscribe = null;
    // undefined = pas encore lu, null = aucun forçage, objet = forçage actif
    this.sharedOverride = undefined;
    // Horaires publiés, tenus à jour par un listener : évite une lecture
    // Firestore à chaque passage du monitoring (toutes les minutes)
    this.sharedSchedule = null;
    this.isClientMode = false; // true = lecture seule depuis Firestore, jamais d'écriture

    // Horaires par défaut (format 24h) - Service continu 11h-01h55
    this.defaultSchedule = {
      monday: { open: '11:00', close: '01:50', enabled: true },
      tuesday: { open: '11:00', close: '01:50', enabled: true },
      wednesday: { open: '11:00', close: '01:50', enabled: true },
      thursday: { open: '11:00', close: '01:50', enabled: true },
      friday: { open: '11:00', close: '01:50', enabled: true },
      saturday: { open: '11:00', close: '01:50', enabled: true },
      sunday: { open: '11:00', close: '01:50', enabled: true }
    };

    this.statusListeners = [];
    this.intervalId = null;
    this.currentStatus = null;
  }

  // Initialiser le service
  async initialize() {
    try {
      console.log('🏪 Initialisation du service de statut restaurant');

      // Le service est un singleton : si l'appareil est passé par l'interface
      // client, il est resté en lecture seule. On repasse en mode admin, sinon
      // le restaurant ne publierait plus son statut.
      this.isClientMode = false;
      if (this.firestoreUnsubscribe) {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
      }

      // Forçage manuel en cours, décidé depuis n'importe quel poste admin.
      // Lu AVANT le premier calcul de statut, sinon ce poste publierait
      // « ouvert » dans Firestore et annulerait la fermeture d'un collègue.
      await this.readOverride();
      this.subscribeToOverride();
      this.subscribeToSchedule();

      // Charger les horaires personnalisés ou utiliser les défauts
      const schedule = await this.getSchedule();
      const needsMigration = !schedule
        || schedule.monday?.open === '18:00'   // ancien service du soir
        || schedule.monday?.close === '01:55'; // ancienne fermeture
      if (needsMigration) {
        // Migrer vers les horaires actuels 11h-01h50
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

  // Forcer le statut manuellement, pour tous les postes admin à la fois
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

      // L'écriture partagée d'abord : si elle échoue, on le signale à l'admin
      // plutôt que d'afficher une fermeture que les autres postes ignorent et
      // défont à la minute suivante.
      await this.writeOverride(override);

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

  // Annuler le forçage manuel, pour tous les postes admin à la fois
  async clearOverride() {
    try {
      await this.writeOverride(null);
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

      // En mode client, lire depuis Firestore (jamais écrire)
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

          // Le document n'existe pas : le restaurant n'a jamais publié son statut.
          // Ce n'est PAS une fermeture — bloquer tous les clients ici reviendrait
          // à couper les commandes sans que personne ne s'en aperçoive.
          console.warn('⚠️ Client: statut absent dans Firestore, calcul sur les horaires');
          const fallback = await this.calculateAutoStatus();
          return {
            isOpen: fallback.isOpen,
            mode: 'schedule-fallback',
            reason: fallback.reason,
            lastUpdated: new Date().toISOString(),
            nextChange: fallback.nextChange || null
          };
        } catch (firestoreError) {
          console.error('❌ Client: Erreur lecture Firestore:', firestoreError);

          // Coupure réseau : on se rabat sur les horaires plutôt que de
          // refuser toutes les commandes
          try {
            const fallback = await this.calculateAutoStatus();
            return {
              isOpen: fallback.isOpen,
              mode: 'offline-fallback',
              reason: fallback.reason,
              lastUpdated: new Date().toISOString(),
              nextChange: fallback.nextChange || null
            };
          } catch (scheduleError) {
            console.error('❌ Client: calcul horaires impossible:', scheduleError);
            return { isOpen: false, mode: 'error', reason: 'Impossible de vérifier le statut' };
          }
        }
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

  // Gestion des horaires.
  //
  // Les horaires ne vivaient que dans l'AsyncStorage de la tablette admin. Les
  // repli du client (`schedule-fallback` / `offline-fallback`) calculaient donc
  // l'ouverture sur les horaires par défaut du code, et non sur ceux du
  // restaurant. Ils sont désormais publiés avec le reste des réglages.
  // Les horaires publiés font foi pour tout le monde, clients comme postes
  // admin. Les admins ne lisaient que leur AsyncStorage : deux tablettes aux
  // horaires différents calculaient deux statuts différents et se les
  // écrasaient mutuellement dans Firestore, exactement comme le forçage manuel.
  // L'AsyncStorage ne sert plus que de cache hors ligne.
  async getSchedule() {
    // Tenus à jour par subscribeToSchedule côté admin : pas de lecture réseau
    // à chaque passage du monitoring
    if (this.sharedSchedule) return this.sharedSchedule;

    try {
      const snapshot = await getDoc(doc(db, 'settings', 'restaurant_schedule'));
      const published = snapshot.exists() ? snapshot.data()?.schedule : null;

      if (published) {
        this.sharedSchedule = published;
        await AsyncStorage.setItem(this.scheduleKey, JSON.stringify(published));
        return published;
      }
    } catch (error) {
      console.warn('⚠️ Horaires Firestore indisponibles, repli local:', error.message);
    }

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
      // Valeur en mémoire alignée avant le recalcul : getSchedule() la sert en
      // priorité et renverrait sinon les anciens horaires
      this.sharedSchedule = schedule;
      await AsyncStorage.setItem(this.scheduleKey, JSON.stringify(schedule));

      // Publication pour les clients et les autres postes admin. Jamais depuis
      // un appareil en mode client, qui est en lecture seule.
      if (!this.isClientMode) {
        try {
          await setDoc(
            doc(db, 'settings', 'restaurant_schedule'),
            { schedule, updatedAt: serverTimestamp() },
            { merge: true }
          );
          console.log('☁️ Horaires publiés pour les clients');
        } catch (firestoreError) {
          console.error('❌ Publication des horaires impossible:', firestoreError.message);
        }
      }

      await this.updateStatus(); // Recalculer le statut
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde horaires:', error);
      return { success: false, error: error.message };
    }
  }

  // Copie locale du forçage partagé, utilisée uniquement quand Firestore est
  // injoignable. Ce n'est jamais une source de vérité : c'est le dernier état
  // partagé connu, pas un état propre à cet appareil.
  async cacheOverride(override) {
    try {
      if (override) {
        await AsyncStorage.setItem(this.overrideKey, JSON.stringify(override));
      } else {
        await AsyncStorage.removeItem(this.overrideKey);
      }
    } catch (error) {
      console.error('❌ Erreur cache forçage:', error);
    }
  }

  async readCachedOverride() {
    try {
      const overrideJson = await AsyncStorage.getItem(this.overrideKey);
      return overrideJson ? JSON.parse(overrideJson) : null;
    } catch (error) {
      console.error('❌ Erreur lecture cache forçage:', error);
      return null;
    }
  }

  // Lecture ponctuelle du forçage partagé
  async readOverride() {
    try {
      const snapshot = await getDoc(doc(db, ...OVERRIDE_DOC));
      const override = parseOverride(snapshot);
      this.sharedOverride = override;
      await this.cacheOverride(override);
      return override;
    } catch (error) {
      console.warn('⚠️ Forçage Firestore illisible, repli sur le dernier état connu:', error.message);
      return await this.readCachedOverride();
    }
  }

  // Écriture du forçage partagé. Toute modification passe par ici pour que les
  // autres postes admin la voient immédiatement.
  async writeOverride(override) {
    if (this.isClientMode) {
      throw new Error('Un appareil client ne peut pas modifier le statut du restaurant');
    }

    const payload = override
      ? {
          active: true,
          forceOpen: !!override.forceOpen,
          reason: override.reason || null,
          createdAt: override.createdAt || new Date().toISOString(),
          expiresAt: override.expiresAt || null,
          updatedAt: serverTimestamp(),
        }
      : {
          active: false,
          forceOpen: null,
          reason: null,
          createdAt: null,
          expiresAt: null,
          updatedAt: serverTimestamp(),
        };

    await setDoc(doc(db, ...OVERRIDE_DOC), payload);
    this.sharedOverride = override || null;
    await this.cacheOverride(this.sharedOverride);
  }

  // Écoute temps réel : un admin ferme, tous les autres postes s'alignent sans
  // attendre le prochain passage du monitoring
  subscribeToOverride() {
    try {
      if (this.overrideUnsubscribe) {
        this.overrideUnsubscribe();
        this.overrideUnsubscribe = null;
      }

      this.overrideUnsubscribe = onSnapshot(
        doc(db, ...OVERRIDE_DOC),
        async (snapshot) => {
          const override = parseOverride(snapshot);
          const previous = this.sharedOverride === undefined ? null : this.sharedOverride;
          const hasChanged = JSON.stringify(override) !== JSON.stringify(previous);

          this.sharedOverride = override;
          await this.cacheOverride(override);

          if (hasChanged) {
            console.log(
              '☁️ Forçage restaurant reçu:',
              override ? (override.forceOpen ? 'OUVERT' : 'FERMÉ') : 'automatique'
            );
            await this.updateStatus();
          }
        },
        (error) => {
          console.error('❌ Erreur écoute forçage restaurant:', error);
        }
      );

      console.log('🔄 Écoute du forçage partagé activée');
    } catch (error) {
      console.error('❌ Erreur souscription forçage:', error);
    }
  }

  // Écoute des horaires publiés : un admin change les horaires, les autres
  // postes recalculent sur les mêmes valeurs au lieu de leur copie locale
  subscribeToSchedule() {
    try {
      if (this.scheduleUnsubscribe) {
        this.scheduleUnsubscribe();
        this.scheduleUnsubscribe = null;
      }

      this.scheduleUnsubscribe = onSnapshot(
        doc(db, 'settings', 'restaurant_schedule'),
        async (snapshot) => {
          const published = snapshot.exists() ? snapshot.data()?.schedule : null;
          if (!published) return;

          const hasChanged = JSON.stringify(published) !== JSON.stringify(this.sharedSchedule);
          this.sharedSchedule = published;
          await AsyncStorage.setItem(this.scheduleKey, JSON.stringify(published));

          if (hasChanged) {
            console.log('☁️ Horaires restaurant mis à jour');
            await this.updateStatus();
          }
        },
        (error) => {
          console.error('❌ Erreur écoute horaires restaurant:', error);
        }
      );

      console.log('🔄 Écoute des horaires partagés activée');
    } catch (error) {
      console.error('❌ Erreur souscription horaires:', error);
    }
  }

  // Obtenir l'override actuel (partagé entre tous les postes admin)
  async getOverride() {
    try {
      const override = this.sharedOverride === undefined
        ? await this.readOverride()
        : this.sharedOverride;

      if (override && isOverrideExpired(override)) {
        // Expiré : on le lève pour tout le monde, pas seulement ici.
        // `writeOverride` plutôt que `clearOverride` : ce dernier rappellerait
        // updateStatus(), qui rappelle getOverride() — récursion sans fin.
        console.log('⏱️ Forçage expiré, retour au mode automatique');
        await this.writeOverride(null);
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

    // L'heure de fermeture est exclue : « ouvert jusqu'à 01h50 » signifie
    // que la commande n'est plus possible à 01h50 pile
    // Gérer le cas où on ferme après minuit (ex: 23:00 - 01:00)
    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
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

      // Le service est un singleton : un appareil qui quitte l'interface admin
      // ne doit plus écouter le forçage, réservé au calcul de statut des admins
      if (this.overrideUnsubscribe) {
        this.overrideUnsubscribe();
        this.overrideUnsubscribe = null;
      }
      if (this.scheduleUnsubscribe) {
        this.scheduleUnsubscribe();
        this.scheduleUnsubscribe = null;
      }
      this.sharedOverride = undefined;

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
    if (this.overrideUnsubscribe) {
      this.overrideUnsubscribe();
      this.overrideUnsubscribe = null;
    }
    if (this.scheduleUnsubscribe) {
      this.scheduleUnsubscribe();
      this.scheduleUnsubscribe = null;
    }
    this.statusListeners = [];
    this.currentStatus = null;
    this.sharedOverride = undefined;
    this.sharedSchedule = null;
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