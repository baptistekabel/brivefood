import notificationService from './notificationService';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

class BroadcastNotificationService {
  constructor() {
    this.isInitialized = false;
    this.collectionName = 'push_tokens';
  }

  // Initialiser le service
  async initialize() {
    try {
      this.isInitialized = true;
      console.log('✅ BroadcastNotificationService initialisé (Firebase)');
    } catch (error) {
      console.error('❌ Erreur initialisation BroadcastNotificationService:', error);
    }
  }

  // Enregistrer un token client dans Firebase
  async registerCustomerToken(userId, token, customerInfo = {}) {
    try {
      if (!token || !userId) {
        console.warn('⚠️ Token ou userId manquant');
        return false;
      }

      const tokenDoc = doc(db, this.collectionName, userId);
      await setDoc(tokenDoc, {
        token,
        userId,
        userType: 'customer', // Important: on marque comme client
        registeredAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        customerInfo: {
          name: customerInfo.name || 'Client',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          firstName: customerInfo.firstName || '',
          lastName: customerInfo.lastName || '',
        }
      }, { merge: true });

      console.log(`✅ Token client enregistré dans Firebase: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur enregistrement token client Firebase:', error);
      return false;
    }
  }

  // Récupérer tous les tokens clients depuis Firebase (uniquement les clients)
  async getAllCustomerTokens() {
    try {
      const tokensQuery = query(
        collection(db, this.collectionName),
        where('userType', '==', 'customer')
      );

      const snapshot = await getDocs(tokensQuery);
      const customers = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          customers.push({
            userId: doc.id,
            token: data.token,
            customerInfo: data.customerInfo || {},
            registeredAt: data.registeredAt,
            lastSeen: data.lastSeen,
          });
        }
      });

      console.log(`📱 ${customers.length} clients trouvés dans Firebase`);
      return customers;
    } catch (error) {
      console.error('❌ Erreur récupération tokens clients Firebase:', error);
      return [];
    }
  }

  // Envoyer une notification à tous les clients (UNIQUEMENT les clients)
  async sendBroadcastNotification(title, message, data = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Récupérer les tokens clients depuis Firebase
      const customers = await this.getAllCustomerTokens();

      if (customers.length === 0) {
        return {
          success: false,
          error: 'Aucun client enregistré pour les notifications',
          summary: {
            totalClients: 0,
            successCount: 0,
            failureCount: 0,
            clients: []
          }
        };
      }

      console.log(`📢 Envoi notification broadcast à ${customers.length} clients (uniquement)`);
      console.log(`📝 Titre: ${title}`);
      console.log(`📝 Message: ${message}`);

      // Préparer les données de notification
      const notificationData = {
        type: 'broadcast',
        title,
        message,
        timestamp: new Date().toISOString(),
        ...data
      };

      // Envoyer à tous les clients et collecter les résultats
      const results = [];
      const clientsDetails = [];

      for (const customer of customers) {
        try {
          const customerName = customer.customerInfo.name ||
                               `${customer.customerInfo.firstName || ''} ${customer.customerInfo.lastName || ''}`.trim() ||
                               'Client';

          console.log(`📱 Envoi à ${customerName} (${customer.userId})`);

          const result = await notificationService.sendPushNotification(
            customer.token,
            title,
            message,
            notificationData
          );

          // Vérifier le résultat de l'API Expo Push
          // L'API retourne { data: [{ status: 'ok' }] } en cas de succès
          const isSuccess = result &&
            result.data &&
            Array.isArray(result.data) &&
            result.data.length > 0 &&
            result.data[0].status === 'ok';

          const clientResult = {
            userId: customer.userId,
            name: customerName,
            email: customer.customerInfo.email,
            phone: customer.customerInfo.phone,
            success: isSuccess,
            timestamp: new Date().toISOString(),
            error: !isSuccess && result?.data?.[0]?.message ? result.data[0].message : null
          };

          results.push(isSuccess);
          clientsDetails.push(clientResult);

          if (isSuccess) {
            console.log(`✅ Notification envoyée à ${customerName}`);
          } else {
            console.log(`❌ Échec envoi à ${customerName}:`, result?.data?.[0]?.message || 'Erreur inconnue');
          }

          // Petite pause entre les envois pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          console.error(`❌ Erreur envoi à ${customer.userId}:`, error);
          results.push(false);
          clientsDetails.push({
            userId: customer.userId,
            name: customer.customerInfo.name || 'Client',
            email: customer.customerInfo.email,
            phone: customer.customerInfo.phone,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Calcul des statistiques
      const successCount = results.filter(r => r === true).length;
      const failureCount = results.filter(r => r === false).length;

      const summary = {
        totalClients: customers.length,
        successCount,
        failureCount,
        successRate: ((successCount / customers.length) * 100).toFixed(1),
        clients: clientsDetails.sort((a, b) => b.success - a.success) // Succès en premier
      };

      console.log(`📊 Résultats broadcast: ${successCount}/${customers.length} envoyées`);

      return {
        success: successCount > 0,
        message: `Notification envoyée à ${successCount}/${customers.length} clients`,
        summary
      };

    } catch (error) {
      console.error('❌ Erreur notification broadcast:', error);
      return {
        success: false,
        error: `Erreur lors de l'envoi: ${error.message}`,
        summary: {
          totalClients: 0,
          successCount: 0,
          failureCount: 0,
          clients: []
        }
      };
    }
  }

  // Supprimer un token (déconnexion client)
  async removeCustomerToken(userId) {
    try {
      await deleteDoc(doc(db, this.collectionName, userId));
      console.log(`🗑️ Token client supprimé: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression token:', error);
      return false;
    }
  }

  // Mettre à jour le lastSeen d'un client
  async updateCustomerLastSeen(userId) {
    try {
      const tokenDoc = doc(db, this.collectionName, userId);
      await setDoc(tokenDoc, {
        lastSeen: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour lastSeen:', error);
      return false;
    }
  }

  // Obtenir le nombre de clients enregistrés
  async getClientCount() {
    try {
      const customers = await this.getAllCustomerTokens();
      return customers.length;
    } catch (error) {
      console.error('❌ Erreur comptage clients:', error);
      return 0;
    }
  }

  // Obtenir la liste des clients enregistrés
  async getRegisteredClients() {
    try {
      const customers = await this.getAllCustomerTokens();
      return customers.map(c => ({
        userId: c.userId,
        name: c.customerInfo.name || `${c.customerInfo.firstName || ''} ${c.customerInfo.lastName || ''}`.trim() || 'Client',
        email: c.customerInfo.email,
        phone: c.customerInfo.phone,
        registeredAt: c.registeredAt,
        lastSeen: c.lastSeen
      }));
    } catch (error) {
      console.error('❌ Erreur liste clients:', error);
      return [];
    }
  }
}

// Instance singleton
const broadcastNotificationService = new BroadcastNotificationService();

export default broadcastNotificationService;

// Fonctions utilitaires
export const initializeBroadcastNotifications = () => broadcastNotificationService.initialize();
export const registerCustomerForBroadcast = (userId, token, customerInfo) =>
  broadcastNotificationService.registerCustomerToken(userId, token, customerInfo);
export const sendBroadcastToAllClients = (title, message, data) =>
  broadcastNotificationService.sendBroadcastNotification(title, message, data);
export const removeCustomerFromBroadcast = (userId) =>
  broadcastNotificationService.removeCustomerToken(userId);
