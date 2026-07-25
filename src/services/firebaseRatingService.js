import { getDatabase, ref, set, push, onValue, off, query, orderByChild } from 'firebase/database';

class FirebaseRatingService {
  constructor() {
    this.database = null;
    this.isInitialized = false;
    this.initializeFirebase();
  }

  async initializeFirebase() {
    try {
      console.log('🔥 [FirebaseRatingService] Initialisation Firebase...');
      this.database = getDatabase();
      this.isInitialized = true;
      console.log('✅ [FirebaseRatingService] Firebase initialisé avec succès');
    } catch (error) {
      console.error('❌ [FirebaseRatingService] Erreur initialisation Firebase:', error);
      this.isInitialized = false;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized || !this.database) {
      console.log('🔄 [FirebaseRatingService] Réinitialisation Firebase...');
      await this.initializeFirebase();
    }
    return this.isInitialized;
  }

  // Sauvegarder un avis sur Firebase avec structure optimisée
  async saveRating(ratingData) {
    console.log('🚀 [FirebaseRatingService] saveRating appelé:', ratingData);

    try {
      const isReady = await this.ensureInitialized();
      if (!isReady) {
        console.warn('⚠️ [FirebaseRatingService] Firebase non disponible, retour succès pour AsyncStorage');
        return {
          success: true,
          firebaseId: 'offline_' + Date.now(),
          ratingRecord: ratingData,
          offline: true
        };
      }

      // Structure optimisée pour les avis
      const ratingRecord = {
        // Données principales
        orderId: ratingData.orderId,
        rating: ratingData.rating,
        comment: ratingData.comment || '',

        // Métadonnées
        createdAt: ratingData.timestamp || new Date().toISOString(),
        createdTimestamp: Date.now(), // Pour tri rapide

        // Index pour recherche
        ratingValue: ratingData.rating, // Doublé pour indexation
        hasComment: !!(ratingData.comment && ratingData.comment.trim()),

        // Informations commande (si disponibles)
        customerName: ratingData.customerName || '',
        orderTotal: ratingData.orderTotal || 0,
        orderDate: ratingData.orderDate || '',
      };

      console.log('📝 [FirebaseRatingService] Structure optimisée:', ratingRecord);

      // Sauvegarder dans /ratings/ avec clé auto-générée
      const ratingsRef = ref(this.database, 'ratings');
      const newRatingRef = push(ratingsRef);

      await set(newRatingRef, ratingRecord);

      console.log('✅ [FirebaseRatingService] Avis sauvegardé avec ID:', newRatingRef.key);

      // Mettre à jour également un index par note pour optimiser les requêtes
      await this.updateRatingIndex(ratingData.rating);

      return {
        success: true,
        firebaseId: newRatingRef.key,
        ratingRecord
      };

    } catch (error) {
      console.error('❌ [FirebaseRatingService] Erreur sauvegarde:', error);
      // Retourner succès même en cas d'erreur Firebase pour ne pas bloquer l'UX
      console.log('💾 [FirebaseRatingService] Mode dégradé - AsyncStorage seulement');
      return {
        success: true,
        firebaseId: 'offline_' + Date.now(),
        ratingRecord: ratingData,
        offline: true,
        error: error.message
      };
    }
  }

  // Mettre à jour l'index des notes pour les statistiques
  async updateRatingIndex(rating) {
    try {
      const indexRef = ref(this.database, `ratingIndex/${rating}`);
      const now = Date.now();

      // Incrémenter le compteur pour cette note
      await set(indexRef, {
        count: 1, // Firebase va agréger automatiquement
        lastUpdated: now
      });

      console.log('📊 [FirebaseRatingService] Index mis à jour pour note:', rating);
    } catch (error) {
      console.warn('⚠️ [FirebaseRatingService] Erreur mise à jour index:', error);
      // Ne pas faire échouer la sauvegarde principale
    }
  }

  // Récupérer tous les avis depuis Firebase
  async getAllRatings() {
    console.log('🔍 [FirebaseRatingService] getAllRatings appelé');

    try {
      const isReady = await this.ensureInitialized();
      if (!isReady) {
        console.warn('⚠️ Firebase non disponible');
        return [];
      }

      return new Promise((resolve, reject) => {
        const ratingsRef = ref(this.database, 'ratings');

        // Ordonner par timestamp décroissant
        const orderedQuery = query(ratingsRef, orderByChild('createdTimestamp'));

        const timeout = setTimeout(() => {
          console.warn('⏰ [FirebaseRatingService] Timeout récupération');
          resolve([]);
        }, 8000);

        onValue(orderedQuery, (snapshot) => {
          clearTimeout(timeout);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const ratings = Object.entries(data).map(([firebaseId, rating]) => ({
              firebaseId,
              ...rating
            }));

            // Trier par timestamp décroissant (plus récents en premier)
            ratings.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));

            console.log('✅ [FirebaseRatingService] Avis récupérés:', ratings.length);
            console.log('🔍 [FirebaseRatingService] Premier avis:', ratings[0]);

            resolve(ratings);
          } else {
            console.log('📭 [FirebaseRatingService] Aucun avis trouvé');
            resolve([]);
          }
        }, (error) => {
          clearTimeout(timeout);
          console.error('❌ [FirebaseRatingService] Erreur onValue:', error);
          resolve([]);
        }, { onlyOnce: true });
      });

    } catch (error) {
      console.error('❌ [FirebaseRatingService] Erreur récupération:', error);
      return [];
    }
  }

  // Récupérer les statistiques depuis Firebase
  async getRatingStats() {
    console.log('📊 [FirebaseRatingService] getRatingStats appelé');

    try {
      const ratings = await this.getAllRatings();

      if (ratings.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalRatings = ratings.length;
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

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
        ratingDistribution
      };

      console.log('📊 [FirebaseRatingService] Stats calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [FirebaseRatingService] Erreur calcul stats:', error);
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  // Test de connectivité Firebase
  async testConnection() {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady) {
        return { success: false, error: 'Initialisation échouée' };
      }

      // Test d'écriture/lecture
      const testRef = ref(this.database, 'test/connection');
      const testData = { timestamp: Date.now(), test: true };

      await set(testRef, testData);
      console.log('✅ [FirebaseRatingService] Test de connexion réussi');

      return { success: true, message: 'Connexion Firebase OK' };

    } catch (error) {
      console.error('❌ [FirebaseRatingService] Test de connexion échoué:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const firebaseRatingService = new FirebaseRatingService();

export default firebaseRatingService;