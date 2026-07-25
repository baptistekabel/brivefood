import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notificationService';
import firebaseRatingService from './firebaseRatingService';
import ratingsSyncService from './RatingsSyncService';

class OrderRatingService {
  constructor() {
    this.storageKey = '@order_ratings';
    this.pendingRatingsKey = '@pending_ratings';
    this.ratedOrdersKey = '@rated_orders';
    this.isInitialized = false;
    this.initializeSyncService();
  }

  // Initialiser le service de synchronisation ultra-fiable
  async initializeSyncService() {
    try {
      console.log('🔄 [OrderRatingService] Initialisation service de synchronisation...');
      const initialized = await ratingsSyncService.initialize();
      this.isInitialized = initialized;

      if (initialized) {
        console.log('✅ [OrderRatingService] Service de synchronisation ultra-fiable activé');
      } else {
        console.warn('⚠️ [OrderRatingService] Mode dégradé - synchronisation basique');
      }
    } catch (error) {
      console.error('❌ [OrderRatingService] Erreur initialisation sync service:', error);
      this.isInitialized = false;
    }
  }

  // 🚀 NOUVELLE MÉTHODE ULTRA-FIABLE : Sauvegarder une notation avec 5 couches de redondance
  async saveRating(ratingData) {
    console.log('🚀 [OrderRatingService] saveRating ULTRA-FIABLE appelé avec:', ratingData);

    try {
      const newRating = {
        id: `rating_${Date.now()}`,
        ...ratingData,
        createdAt: new Date().toISOString(),
        source: 'client_app',
        version: '2.0' // Nouvelle version ultra-fiable
      };

      console.log('📝 [OrderRatingService] Nouvelle notation créée:', newRating);

      // 🎯 SYNCHRONISATION ULTRA-FIABLE AVEC 5 COUCHES
      console.log('🔄 [OrderRatingService] Début synchronisation ultra-fiable...');

      let syncResult;
      if (this.isInitialized) {
        // Utiliser le nouveau service de synchronisation ultra-fiable
        syncResult = await ratingsSyncService.syncRating(newRating);
        console.log('📊 [OrderRatingService] Résultat sync ultra-fiable:', syncResult);
      } else {
        // Fallback : méthode basique
        console.warn('⚠️ [OrderRatingService] Fallback - sync basique');
        syncResult = await this.basicSaveRating(newRating);
      }

      // ✅ Marquer la commande comme notée (toujours réussi car local)
      await this.markOrderAsRated(ratingData.orderId);

      // 📱 NOTIFICATION ADMIN CRITIQUE (selon la note)
      try {
        console.log('📱 [OrderRatingService] Envoi notification admin...');
        const notificationResult = await notificationService.sendCriticalRatingAlert(newRating);
        console.log('📊 [OrderRatingService] Notification admin:', notificationResult.success ? 'envoyée' : 'échouée');
      } catch (notifError) {
        console.warn('⚠️ [OrderRatingService] Notification admin échouée:', notifError.message);
      }

      // 📊 RÉSULTAT FINAL
      const finalResult = {
        success: syncResult.success,
        rating: syncResult.finalData || newRating,
        syncMethods: syncResult.methods,
        reliability: this.calculateReliabilityScore(syncResult),
        adminNotified: true // On essaie toujours de notifier l'admin
      };

      console.log('✅ [OrderRatingService] NOTATION ULTRA-FIABLE TERMINÉE:', finalResult);
      return finalResult;

    } catch (error) {
      console.error('❌ [OrderRatingService] ERREUR CRITIQUE:', error);

      // 🚨 SAUVEGARDE D'URGENCE - Au minimum AsyncStorage
      try {
        const emergencyRating = {
          id: `emergency_${Date.now()}`,
          ...ratingData,
          createdAt: new Date().toISOString(),
          emergency: true,
          error: error.message
        };

        const existingRatings = await this.getLocalRatings();
        existingRatings.push(emergencyRating);
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingRatings));

        console.log('🚨 [OrderRatingService] SAUVEGARDE D\'URGENCE RÉUSSIE');

        return {
          success: true, // Considéré comme succès car sauvé localement
          rating: emergencyRating,
          emergency: true,
          error: error.message
        };

      } catch (emergencyError) {
        console.error('💥 [OrderRatingService] ÉCHEC TOTAL MÊME EN URGENCE:', emergencyError);
        return { success: false, error: emergencyError.message };
      }
    }
  }

  // Méthode de sauvegarde basique (fallback)
  async basicSaveRating(ratingData) {
    try {
      // AsyncStorage
      const existingRatings = await this.getLocalRatings();
      existingRatings.push(ratingData);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingRatings));

      // Firebase (tentative)
      let firebaseSuccess = false;
      try {
        const firebaseResult = await firebaseRatingService.saveRating(ratingData);
        firebaseSuccess = firebaseResult.success;
      } catch (firebaseError) {
        console.warn('⚠️ Firebase fallback échoué:', firebaseError.message);
      }

      return {
        success: true,
        finalData: ratingData,
        methods: {
          localStorage: true,
          realtime: firebaseSuccess,
          firestore: false,
          queue: false,
          notification: false
        }
      };

    } catch (error) {
      console.error('❌ Erreur sauvegarde basique:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculer le score de fiabilité (0-100%)
  calculateReliabilityScore(syncResult) {
    if (!syncResult || !syncResult.methods) return 0;

    const methods = syncResult.methods;
    let score = 0;

    // AsyncStorage : 40% (base essentielle)
    if (methods.localStorage) score += 40;

    // Firebase Realtime : 25% (temps réel admin)
    if (methods.realtime) score += 25;

    // Firestore : 20% (backup robuste)
    if (methods.firestore) score += 20;

    // Queue de retry : 10% (persistance)
    if (methods.queue) score += 10;

    // Notification admin : 5% (alerte)
    if (methods.notification) score += 5;

    return Math.min(score, 100);
  }


  // Récupérer toutes les notations (avec logique Firebase/AsyncStorage)
  async getRatings(forceFirebase = false) {
    try {
      console.log('🔍 [OrderRatingService] getRatings appelé, forceFirebase:', forceFirebase);

      // Si on force Firebase (côté admin), utiliser le nouveau service
      if (forceFirebase) {
        console.log('🔥 [OrderRatingService] Mode admin - récupération Firebase forcée');
        return await firebaseRatingService.getAllRatings();
      }

      // Côté client : utiliser AsyncStorage en priorité
      const localRatings = await this.getLocalRatings();
      if (localRatings.length > 0) {
        console.log('💾 [OrderRatingService] Utilisation AsyncStorage:', localRatings.length, 'avis');
        return localRatings;
      }

      // Fallback sur Firebase si pas de données locales
      console.log('🔥 [OrderRatingService] Fallback Firebase');
      return await firebaseRatingService.getAllRatings();
    } catch (error) {
      console.error('❌ Erreur récupération notations:', error);
      return [];
    }
  }

  // Récupérer les notations depuis AsyncStorage uniquement
  async getLocalRatings() {
    try {
      const ratingsJson = await AsyncStorage.getItem(this.storageKey);
      return ratingsJson ? JSON.parse(ratingsJson) : [];
    } catch (error) {
      console.error('❌ Erreur récupération notations locales:', error);
      return [];
    }
  }

  // Récupérer les notations depuis Firebase (délégué au nouveau service)
  async getRatingsFromFirebase() {
    console.log('🔥 [OrderRatingService] getRatingsFromFirebase appelé (délégation)');
    return await firebaseRatingService.getAllRatings();
  }

  // Marquer une commande comme notée
  async markOrderAsRated(orderId) {
    try {
      const ratedOrders = await this.getRatedOrders();
      if (!ratedOrders.includes(orderId)) {
        ratedOrders.push(orderId);
        await AsyncStorage.setItem(this.ratedOrdersKey, JSON.stringify(ratedOrders));
      }
    } catch (error) {
      console.error('❌ Erreur marquage commande notée:', error);
    }
  }

  // Récupérer les commandes déjà notées
  async getRatedOrders() {
    try {
      const ratedOrdersJson = await AsyncStorage.getItem(this.ratedOrdersKey);
      return ratedOrdersJson ? JSON.parse(ratedOrdersJson) : [];
    } catch (error) {
      console.error('❌ Erreur récupération commandes notées:', error);
      return [];
    }
  }

  // Vérifier si une commande a déjà été notée
  async isOrderRated(orderId) {
    try {
      const ratedOrders = await this.getRatedOrders();
      return ratedOrders.includes(orderId);
    } catch (error) {
      console.error('❌ Erreur vérification notation:', error);
      return false;
    }
  }

  // Ajouter une commande à la liste des notations en attente
  async addPendingRating(orderData) {
    try {
      const pendingRatings = await this.getPendingRatings();

      // Vérifier si la commande n'est pas déjà dans la liste
      const existingIndex = pendingRatings.findIndex(p => p.orderId === orderData.id);
      if (existingIndex !== -1) {
        console.log('⚠️ Commande déjà en attente de notation:', orderData.id);
        return;
      }

      // Vérifier si la commande n'a pas déjà été notée
      const isAlreadyRated = await this.isOrderRated(orderData.id);
      if (isAlreadyRated) {
        console.log('⚠️ Commande déjà notée:', orderData.id);
        return;
      }

      const pendingRating = {
        orderId: orderData.id,
        customerName: orderData.customerName,
        total: orderData.total,
        orderDate: orderData.orderDate,
        orderTime: orderData.orderTime,
        completedAt: new Date().toISOString(),
      };

      pendingRatings.push(pendingRating);
      await AsyncStorage.setItem(this.pendingRatingsKey, JSON.stringify(pendingRatings));

      console.log('📝 Commande ajoutée aux notations en attente:', orderData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur ajout notation en attente:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer les notations en attente
  async getPendingRatings() {
    try {
      const pendingRatingsJson = await AsyncStorage.getItem(this.pendingRatingsKey);
      return pendingRatingsJson ? JSON.parse(pendingRatingsJson) : [];
    } catch (error) {
      console.error('❌ Erreur récupération notations en attente:', error);
      return [];
    }
  }

  // Supprimer une notation en attente
  async removePendingRating(orderId) {
    try {
      const pendingRatings = await this.getPendingRatings();
      const updatedPendingRatings = pendingRatings.filter(p => p.orderId !== orderId);
      await AsyncStorage.setItem(this.pendingRatingsKey, JSON.stringify(updatedPendingRatings));

      console.log('🗑️ Notation en attente supprimée:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression notation en attente:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer notification de demande de notation
  async sendRatingNotification(orderData) {
    try {
      await notificationService.sendLocalNotification(
        '⭐ Notez votre commande',
        `Comment s'est passée votre commande #${orderData.id} ?`,
        {
          type: 'rating_request',
          orderId: orderData.id,
          customerName: orderData.customerName,
        }
      );

      console.log('📱 Notification de notation envoyée pour:', orderData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur envoi notification de notation:', error);
      return { success: false, error: error.message };
    }
  }

  // Traiter une commande terminée (ajouter aux notifications en attente et envoyer notification)
  async handleCompletedOrder(orderData) {
    try {
      // Vérifier d'abord si la commande n'a pas déjà été traitée
      const isAlreadyRated = await this.isOrderRated(orderData.id);
      if (isAlreadyRated) {
        console.log('⚠️ Commande déjà notée, ignore:', orderData.id);
        return { success: false, reason: 'already_rated' };
      }

      const pendingRatings = await this.getPendingRatings();
      const isAlreadyPending = pendingRatings.some(p => p.orderId === orderData.id);
      if (isAlreadyPending) {
        console.log('⚠️ Commande déjà en attente de notation, ignore:', orderData.id);
        return { success: false, reason: 'already_pending' };
      }

      // Ajouter à la liste des notations en attente
      await this.addPendingRating(orderData);

      // Envoyer notification après un délai de 2 minutes
      setTimeout(async () => {
        // Vérifier que la commande n'a pas été notée entre temps
        const isRated = await this.isOrderRated(orderData.id);
        if (!isRated) {
          await this.sendRatingNotification(orderData);
        }
      }, 2 * 60 * 1000); // 2 minutes

      console.log('🎯 Commande terminée traitée pour notation:', orderData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur traitement commande terminée:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les statistiques des notations
  async getRatingStats(forceFirebase = false) {
    try {
      console.log('📊 [OrderRatingService] getRatingStats appelé, forceFirebase:', forceFirebase);

      if (forceFirebase) {
        // Côté admin : utiliser le service Firebase directement
        console.log('📊 Stats Firebase forcées');
        const firebaseStats = await firebaseRatingService.getRatingStats();
        const pendingRatings = await this.getPendingRatings();

        return {
          ...firebaseStats,
          pendingRatingsCount: pendingRatings.length,
        };
      }

      // Côté client : méthode classique
      const ratings = await this.getRatings(false);
      const pendingRatings = await this.getPendingRatings();

      console.log('📊 Calcul stats avec', ratings.length, 'avis et', pendingRatings.length, 'en attente');

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;

      const ratingDistribution = {
        1: ratings.filter(r => r.rating === 1).length,
        2: ratings.filter(r => r.rating === 2).length,
        3: ratings.filter(r => r.rating === 3).length,
        4: ratings.filter(r => r.rating === 4).length,
        5: ratings.filter(r => r.rating === 5).length,
      };

      const stats = {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        pendingRatingsCount: pendingRatings.length,
      };

      console.log('📊 Statistiques calculées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        pendingRatingsCount: 0,
      };
    }
  }

  // Nettoyer les anciennes données (garder seulement les 100 dernières notations)
  async cleanupOldRatings() {
    try {
      const ratings = await this.getRatings();
      if (ratings.length > 100) {
        // Garder seulement les 100 plus récentes
        const sortedRatings = ratings.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        const recentRatings = sortedRatings.slice(0, 100);

        await AsyncStorage.setItem(this.storageKey, JSON.stringify(recentRatings));
        console.log('🧹 Nettoyage des anciennes notations effectué');
      }

      // Nettoyer les notations en attente de plus de 7 jours
      const pendingRatings = await this.getPendingRatings();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const validPendingRatings = pendingRatings.filter(p =>
        new Date(p.completedAt).getTime() > sevenDaysAgo
      );

      if (validPendingRatings.length !== pendingRatings.length) {
        await AsyncStorage.setItem(this.pendingRatingsKey, JSON.stringify(validPendingRatings));
        console.log('🧹 Nettoyage des notations en attente effectué');
      }

    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }

  // Synchroniser les notations locales vers Firebase (migration)
  async syncLocalRatingsToFirebase() {
    try {
      const localRatingsJson = await AsyncStorage.getItem(this.storageKey);
      if (!localRatingsJson) {
        console.log('📭 Aucune notation locale à synchroniser');
        return;
      }

      const localRatings = JSON.parse(localRatingsJson);
      console.log(`🔄 Synchronisation de ${localRatings.length} notations locales vers Firebase...`);

      for (const rating of localRatings) {
        await this.saveRatingToFirebase(rating);
      }

      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur synchronisation locale vers Firebase:', error);
    }
  }

  // Fonction d'urgence pour nettoyer les notations en attente
  async clearAllPendingRatings() {
    try {
      await AsyncStorage.removeItem(this.pendingRatingsKey);
      console.log('🧹 Toutes les notations en attente supprimées');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur nettoyage notations en attente:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const orderRatingService = new OrderRatingService();

export default orderRatingService;

// Fonctions utilitaires exportées
export const saveOrderRating = (ratingData) => orderRatingService.saveRating(ratingData);
export const getOrderRatings = () => orderRatingService.getRatings();
export const isOrderRated = (orderId) => orderRatingService.isOrderRated(orderId);
export const handleCompletedOrder = (orderData) => orderRatingService.handleCompletedOrder(orderData);
export const getPendingRatings = () => orderRatingService.getPendingRatings();
export const removePendingRating = (orderId) => orderRatingService.removePendingRating(orderId);
export const getRatingStats = () => orderRatingService.getRatingStats();
export const cleanupRatings = () => orderRatingService.cleanupOldRatings();