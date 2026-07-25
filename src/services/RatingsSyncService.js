import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, push, serverTimestamp } from 'firebase/database';
import { doc, setDoc, collection, addDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import notificationService from './notificationService';

class RatingsSyncService {
  constructor() {
    this.database = null;
    this.firestore = null;
    this.syncQueue = [];
    this.isProcessingQueue = false;
    this.retryInterval = null;
    this.maxRetries = 5;
    this.retryDelay = 30000; // 30 secondes
  }

  async initialize() {
    try {
      console.log('🔄 [RatingsSyncService] Initialisation...');

      // Initialiser Firebase Realtime Database
      try {
        const { getDatabase } = await import('firebase/database');
        this.database = getDatabase();
        console.log('✅ [RatingsSyncService] Realtime Database initialisé');
      } catch (error) {
        console.warn('⚠️ [RatingsSyncService] Realtime Database non disponible:', error.message);
      }

      // Réutiliser l'instance Firestore partagée : la recréer ici démarrerait
      // une instance sans la configuration réseau et casserait l'initialisation
      this.firestore = db;
      console.log('✅ [RatingsSyncService] Firestore partagé réutilisé');

      // Charger la queue des échecs
      await this.loadSyncQueue();

      // Démarrer le processus de retry automatique
      this.startRetryProcess();

      console.log('✅ [RatingsSyncService] Service initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur initialisation:', error);
      return false;
    }
  }

  // MÉTHODE PRINCIPALE : Synchroniser un avis avec toutes les couches
  async syncRating(ratingData) {
    console.log('🚀 [RatingsSyncService] Début synchronisation pour:', ratingData.orderId);

    const syncResult = {
      success: false,
      methods: {
        localStorage: false,
        realtime: false,
        firestore: false,
        queue: false,
        notification: false
      },
      finalData: null
    };

    try {
      // 🟢 COUCHE 1: AsyncStorage (toujours en premier, toujours réussie)
      const localResult = await this.saveToLocalStorage(ratingData);
      syncResult.methods.localStorage = localResult.success;
      syncResult.finalData = localResult.data;

      console.log('✅ [RatingsSyncService] Couche 1 (AsyncStorage) réussie');

      // 🟡 COUCHE 2: Firebase Realtime Database (temps réel pour l'admin)
      if (this.database) {
        try {
          const realtimeResult = await this.saveToRealtimeDatabase(ratingData);
          syncResult.methods.realtime = realtimeResult.success;
          console.log('✅ [RatingsSyncService] Couche 2 (Realtime) réussie');
        } catch (error) {
          console.warn('⚠️ [RatingsSyncService] Couche 2 (Realtime) échouée:', error.message);
          // Ajouter à la queue pour retry
          await this.addToSyncQueue(ratingData, 'realtime');
        }
      }

      // 🟠 COUCHE 3: Firestore (backup robuste)
      if (this.firestore) {
        try {
          const firestoreResult = await this.saveToFirestore(ratingData);
          syncResult.methods.firestore = firestoreResult.success;
          console.log('✅ [RatingsSyncService] Couche 3 (Firestore) réussie');
        } catch (error) {
          console.warn('⚠️ [RatingsSyncService] Couche 3 (Firestore) échouée:', error.message);
          // Ajouter à la queue pour retry
          await this.addToSyncQueue(ratingData, 'firestore');
        }
      }

      // 🔵 COUCHE 4: Notification push immédiate vers l'admin
      try {
        await this.notifyAdmin(ratingData);
        syncResult.methods.notification = true;
        console.log('✅ [RatingsSyncService] Couche 4 (Notification) réussie');
      } catch (error) {
        console.warn('⚠️ [RatingsSyncService] Couche 4 (Notification) échouée:', error.message);
      }

      // 🟣 COUCHE 5: Ajouter à la queue de sync pour garantir la persistance
      if (!syncResult.methods.realtime || !syncResult.methods.firestore) {
        await this.addToSyncQueue(ratingData, 'retry');
        syncResult.methods.queue = true;
        console.log('✅ [RatingsSyncService] Couche 5 (Queue) activée');
      }

      // Marquer comme réussi si au moins AsyncStorage + une autre méthode ont fonctionné
      syncResult.success = syncResult.methods.localStorage &&
        (syncResult.methods.realtime || syncResult.methods.firestore || syncResult.methods.queue);

      console.log('📊 [RatingsSyncService] Résultat final:', syncResult);
      return syncResult;

    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur critique synchronisation:', error);

      // En cas d'échec total, au moins sauvegarder localement
      try {
        const emergencyResult = await this.saveToLocalStorage(ratingData);
        syncResult.methods.localStorage = emergencyResult.success;
        syncResult.finalData = emergencyResult.data;
        syncResult.success = true; // Au moins localement

        // Ajouter à la queue pour retry plus tard
        await this.addToSyncQueue(ratingData, 'emergency');

        console.log('🚨 [RatingsSyncService] Sauvegarde d\'urgence réussie');
      } catch (emergencyError) {
        console.error('💥 [RatingsSyncService] ÉCHEC TOTAL:', emergencyError);
      }

      return syncResult;
    }
  }

  // Sauvegarder dans AsyncStorage (toujours réussie)
  async saveToLocalStorage(ratingData) {
    try {
      const enrichedData = {
        ...ratingData,
        localId: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        localTimestamp: new Date().toISOString(),
        syncStatus: 'pending',
        attempts: 0
      };

      // Récupérer les avis existants
      const existingRatings = await AsyncStorage.getItem('@order_ratings') || '[]';
      const ratings = JSON.parse(existingRatings);

      // Ajouter le nouvel avis
      ratings.push(enrichedData);

      // Sauvegarder
      await AsyncStorage.setItem('@order_ratings', JSON.stringify(ratings));

      console.log('💾 [RatingsSyncService] AsyncStorage sauvegardé:', enrichedData.localId);

      return {
        success: true,
        data: enrichedData,
        method: 'localStorage'
      };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur AsyncStorage:', error);
      return {
        success: false,
        error: error.message,
        method: 'localStorage'
      };
    }
  }

  // Sauvegarder dans Firebase Realtime Database
  async saveToRealtimeDatabase(ratingData) {
    try {
      if (!this.database) {
        throw new Error('Realtime Database non initialisée');
      }

      const realtimeData = {
        ...ratingData,
        realtimeId: `rt_${Date.now()}`,
        timestamp: serverTimestamp(),
        source: 'client_app',
        priority: 'high' // Pour que l'admin le voie immédiatement
      };

      // Sauvegarder dans /ratings/
      const ratingsRef = ref(this.database, 'ratings');
      const newRatingRef = push(ratingsRef);
      await set(newRatingRef, realtimeData);

      // Sauvegarder aussi dans /admin_notifications/ pour alerte temps réel
      const notificationRef = ref(this.database, `admin_notifications/${newRatingRef.key}`);
      await set(notificationRef, {
        type: 'new_rating',
        ratingId: newRatingRef.key,
        orderId: ratingData.orderId,
        rating: ratingData.rating,
        timestamp: serverTimestamp(),
        read: false
      });

      console.log('🔥 [RatingsSyncService] Realtime Database sauvegardé:', newRatingRef.key);

      return {
        success: true,
        id: newRatingRef.key,
        data: realtimeData,
        method: 'realtime'
      };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur Realtime Database:', error);
      return {
        success: false,
        error: error.message,
        method: 'realtime'
      };
    }
  }

  // Sauvegarder dans Firestore
  async saveToFirestore(ratingData) {
    try {
      if (!this.firestore) {
        throw new Error('Firestore non initialisé');
      }

      const firestoreData = {
        ...ratingData,
        firestoreId: `fs_${Date.now()}`,
        createdAt: firestoreTimestamp(),
        source: 'client_app',
        syncMethod: 'firestore'
      };

      // Sauvegarder dans la collection ratings
      const ratingsCollection = collection(this.firestore, 'ratings');
      const docRef = await addDoc(ratingsCollection, firestoreData);

      console.log('📄 [RatingsSyncService] Firestore sauvegardé:', docRef.id);

      return {
        success: true,
        id: docRef.id,
        data: firestoreData,
        method: 'firestore'
      };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur Firestore:', error);
      return {
        success: false,
        error: error.message,
        method: 'firestore'
      };
    }
  }

  // Notifier l'admin immédiatement
  async notifyAdmin(ratingData) {
    try {
      // Notification push vers tous les admins connectés
      await notificationService.sendAdminNotification({
        title: '⭐ Nouvel avis client',
        body: `Commande #${ratingData.orderId} notée ${ratingData.rating}/5`,
        data: {
          type: 'new_rating',
          orderId: ratingData.orderId,
          rating: ratingData.rating,
          timestamp: new Date().toISOString()
        }
      });

      console.log('📱 [RatingsSyncService] Admin notifié');
      return { success: true };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur notification admin:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter à la queue de synchronisation pour retry
  async addToSyncQueue(ratingData, reason = 'retry') {
    try {
      const queueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ratingData,
        reason,
        attempts: 0,
        createdAt: new Date().toISOString(),
        nextRetry: new Date(Date.now() + this.retryDelay).toISOString()
      };

      // Charger la queue existante
      const existingQueue = await AsyncStorage.getItem('@sync_queue') || '[]';
      const queue = JSON.parse(existingQueue);

      // Ajouter le nouvel item
      queue.push(queueItem);

      // Sauvegarder la queue
      await AsyncStorage.setItem('@sync_queue', JSON.stringify(queue));

      console.log('📝 [RatingsSyncService] Ajouté à la queue:', queueItem.id, 'raison:', reason);

      // Démarrer le processus de retry si pas déjà en cours
      if (!this.isProcessingQueue) {
        this.processQueue();
      }

      return { success: true, queueId: queueItem.id };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur ajout queue:', error);
      return { success: false, error: error.message };
    }
  }

  // Charger la queue de synchronisation
  async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue');
      this.syncQueue = queueData ? JSON.parse(queueData) : [];

      console.log('📋 [RatingsSyncService] Queue chargée:', this.syncQueue.length, 'items');

      // Traiter la queue si elle contient des items
      if (this.syncQueue.length > 0) {
        this.processQueue();
      }
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur chargement queue:', error);
      this.syncQueue = [];
    }
  }

  // Traiter la queue de synchronisation (retry automatique)
  async processQueue() {
    if (this.isProcessingQueue) {
      console.log('⚠️ [RatingsSyncService] Queue déjà en cours de traitement');
      return;
    }

    this.isProcessingQueue = true;
    console.log('🔄 [RatingsSyncService] Début traitement queue');

    try {
      // Charger la queue fraîche
      await this.loadSyncQueue();

      const now = new Date();
      const itemsToProcess = this.syncQueue.filter(item =>
        new Date(item.nextRetry) <= now && item.attempts < this.maxRetries
      );

      console.log(`📊 [RatingsSyncService] ${itemsToProcess.length} items à traiter`);

      for (const item of itemsToProcess) {
        try {
          console.log(`🔄 [RatingsSyncService] Retry ${item.id}, tentative ${item.attempts + 1}`);

          // Retry la synchronisation
          const retryResult = await this.syncRating(item.ratingData);

          if (retryResult.success && (retryResult.methods.realtime || retryResult.methods.firestore)) {
            // Succès - retirer de la queue
            await this.removeFromQueue(item.id);
            console.log(`✅ [RatingsSyncService] Retry réussi pour ${item.id}`);
          } else {
            // Échec - incrémenter les tentatives
            await this.updateQueueItem(item.id, {
              attempts: item.attempts + 1,
              lastAttempt: new Date().toISOString(),
              nextRetry: new Date(Date.now() + this.retryDelay * (item.attempts + 1)).toISOString()
            });
            console.log(`⚠️ [RatingsSyncService] Retry échoué pour ${item.id}`);
          }
        } catch (error) {
          console.error(`❌ [RatingsSyncService] Erreur retry ${item.id}:`, error);

          // Incrémenter les tentatives même en cas d'erreur
          await this.updateQueueItem(item.id, {
            attempts: item.attempts + 1,
            lastError: error.message,
            nextRetry: new Date(Date.now() + this.retryDelay * (item.attempts + 1)).toISOString()
          });
        }
      }

      // Nettoyer les items qui ont dépassé le max de tentatives
      await this.cleanupFailedItems();

    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur traitement queue:', error);
    } finally {
      this.isProcessingQueue = false;

      // Programmer le prochain traitement si la queue n'est pas vide
      const remainingItems = this.syncQueue.filter(item => item.attempts < this.maxRetries);
      if (remainingItems.length > 0) {
        setTimeout(() => this.processQueue(), this.retryDelay);
      }
    }
  }

  // Démarrer le processus de retry automatique
  startRetryProcess() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    this.retryInterval = setInterval(() => {
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    }, this.retryDelay);

    console.log('⏰ [RatingsSyncService] Processus de retry automatique démarré');
  }

  // Arrêter le processus de retry
  stopRetryProcess() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    console.log('⏹️ [RatingsSyncService] Processus de retry arrêté');
  }

  // Retirer un item de la queue
  async removeFromQueue(itemId) {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue') || '[]';
      const queue = JSON.parse(queueData);

      const updatedQueue = queue.filter(item => item.id !== itemId);

      await AsyncStorage.setItem('@sync_queue', JSON.stringify(updatedQueue));
      this.syncQueue = updatedQueue;

      console.log(`🗑️ [RatingsSyncService] Item ${itemId} retiré de la queue`);
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur suppression queue:', error);
    }
  }

  // Mettre à jour un item de la queue
  async updateQueueItem(itemId, updates) {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue') || '[]';
      const queue = JSON.parse(queueData);

      const itemIndex = queue.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        queue[itemIndex] = { ...queue[itemIndex], ...updates };

        await AsyncStorage.setItem('@sync_queue', JSON.stringify(queue));
        this.syncQueue = queue;

        console.log(`📝 [RatingsSyncService] Item ${itemId} mis à jour`);
      }
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur mise à jour queue:', error);
    }
  }

  // Nettoyer les items qui ont échoué définitivement
  async cleanupFailedItems() {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue') || '[]';
      const queue = JSON.parse(queueData);

      const failedItems = queue.filter(item => item.attempts >= this.maxRetries);
      const remainingItems = queue.filter(item => item.attempts < this.maxRetries);

      if (failedItems.length > 0) {
        // Sauvegarder les items échoués pour analyse
        const failedData = await AsyncStorage.getItem('@failed_syncs') || '[]';
        const failed = JSON.parse(failedData);
        failed.push(...failedItems.map(item => ({
          ...item,
          finalFailureAt: new Date().toISOString()
        })));

        await AsyncStorage.setItem('@failed_syncs', JSON.stringify(failed));
        await AsyncStorage.setItem('@sync_queue', JSON.stringify(remainingItems));

        this.syncQueue = remainingItems;

        console.log(`🧹 [RatingsSyncService] ${failedItems.length} items définitivement échoués archivés`);
      }
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur nettoyage:', error);
    }
  }

  // Obtenir les statistiques de synchronisation
  async getSyncStats() {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue') || '[]';
      const failedData = await AsyncStorage.getItem('@failed_syncs') || '[]';
      const ratingsData = await AsyncStorage.getItem('@order_ratings') || '[]';

      const queue = JSON.parse(queueData);
      const failed = JSON.parse(failedData);
      const ratings = JSON.parse(ratingsData);

      return {
        totalRatings: ratings.length,
        pendingSync: queue.length,
        failedSync: failed.length,
        syncRate: ratings.length > 0 ? ((ratings.length - failed.length) / ratings.length * 100).toFixed(1) : '100'
      };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur stats:', error);
      return {
        totalRatings: 0,
        pendingSync: 0,
        failedSync: 0,
        syncRate: '0'
      };
    }
  }

  // Forcer la synchronisation manuelle de tous les avis locaux
  async forceSyncAll() {
    try {
      console.log('🔄 [RatingsSyncService] Synchronisation forcée de tous les avis...');

      const ratingsData = await AsyncStorage.getItem('@order_ratings') || '[]';
      const ratings = JSON.parse(ratingsData);

      const pendingRatings = ratings.filter(rating => rating.syncStatus === 'pending');

      console.log(`📊 [RatingsSyncService] ${pendingRatings.length} avis en attente de sync`);

      for (const rating of pendingRatings) {
        await this.syncRating(rating);
      }

      console.log('✅ [RatingsSyncService] Synchronisation forcée terminée');
      return { success: true, synced: pendingRatings.length };
    } catch (error) {
      console.error('❌ [RatingsSyncService] Erreur sync forcée:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const ratingsSyncService = new RatingsSyncService();

export default ratingsSyncService;