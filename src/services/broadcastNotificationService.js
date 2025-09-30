import notificationService from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BroadcastNotificationService {
  constructor() {
    this.allCustomerTokens = new Map(); // Map: userId -> tokenData
    this.isInitialized = false;
  }

  // Initialiser le service
  async initialize() {
    try {
      await this.loadAllCustomerTokens();
      this.isInitialized = true;
      console.log('✅ BroadcastNotificationService initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation BroadcastNotificationService:', error);
    }
  }

  // Charger tous les tokens clients depuis le stockage
  async loadAllCustomerTokens() {
    try {
      const tokens = await AsyncStorage.getItem('@all_customer_tokens');
      if (tokens) {
        const tokenArray = JSON.parse(tokens);
        this.allCustomerTokens = new Map(tokenArray);
      } else {
        this.allCustomerTokens = new Map();
      }
      console.log('📱 Tokens clients broadcast chargés:', this.allCustomerTokens.size);
    } catch (error) {
      console.error('❌ Erreur chargement tokens clients broadcast:', error);
      this.allCustomerTokens = new Map();
    }
  }

  // Sauvegarder tous les tokens clients
  async saveAllCustomerTokens() {
    try {
      const tokenArray = Array.from(this.allCustomerTokens.entries());
      await AsyncStorage.setItem('@all_customer_tokens', JSON.stringify(tokenArray));
      console.log('💾 Tokens clients broadcast sauvegardés');
    } catch (error) {
      console.error('❌ Erreur sauvegarde tokens clients broadcast:', error);
    }
  }

  // Enregistrer un token client pour les notifications broadcast
  async registerCustomerToken(userId, token, customerInfo = {}) {
    try {
      if (!token || !userId) {
        console.warn('⚠️ Token ou userId manquant');
        return false;
      }

      const tokenData = {
        token,
        userId,
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        customerInfo: {
          name: customerInfo.name || 'Client',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
        }
      };

      this.allCustomerTokens.set(userId, tokenData);
      await this.saveAllCustomerTokens();

      console.log(`✅ Token client enregistré pour broadcast: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur enregistrement token client broadcast:', error);
      return false;
    }
  }

  // Envoyer une notification à tous les clients
  async sendBroadcastNotification(title, message, data = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.allCustomerTokens.size === 0) {
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

      console.log(`📢 Envoi notification broadcast à ${this.allCustomerTokens.size} clients`);
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

      for (const [userId, tokenData] of this.allCustomerTokens.entries()) {
        try {
          console.log(`📱 Envoi à ${tokenData.customerInfo.name} (${userId})`);

          const result = await notificationService.sendPushNotification(
            tokenData.token,
            title,
            message,
            notificationData
          );

          const clientResult = {
            userId,
            name: tokenData.customerInfo.name,
            email: tokenData.customerInfo.email,
            phone: tokenData.customerInfo.phone,
            success: result,
            timestamp: new Date().toISOString()
          };

          results.push(result);
          clientsDetails.push(clientResult);

          if (result) {
            console.log(`✅ Notification envoyée à ${tokenData.customerInfo.name}`);
          } else {
            console.log(`❌ Échec envoi à ${tokenData.customerInfo.name}`);
          }

          // Petite pause entre les envois pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Erreur envoi à ${userId}:`, error);
          results.push(false);
          clientsDetails.push({
            userId,
            name: tokenData.customerInfo.name,
            email: tokenData.customerInfo.email,
            phone: tokenData.customerInfo.phone,
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
        totalClients: this.allCustomerTokens.size,
        successCount,
        failureCount,
        successRate: ((successCount / this.allCustomerTokens.size) * 100).toFixed(1),
        clients: clientsDetails.sort((a, b) => b.success - a.success) // Succès en premier
      };

      console.log(`📊 Résultats broadcast: ${successCount}/${this.allCustomerTokens.size} envoyées`);

      return {
        success: successCount > 0,
        message: `Notification envoyée à ${successCount}/${this.allCustomerTokens.size} clients`,
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

  // Nettoyer les tokens expirés
  async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

      let removedCount = 0;
      for (const [userId, tokenData] of this.allCustomerTokens.entries()) {
        const tokenAge = now - new Date(tokenData.lastSeen);
        if (tokenAge > maxAge) {
          this.allCustomerTokens.delete(userId);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        await this.saveAllCustomerTokens();
        console.log(`🧹 ${removedCount} tokens expirés supprimés`);
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage tokens broadcast:', error);
    }
  }

  // Obtenir la liste des clients enregistrés
  getRegisteredClients() {
    return Array.from(this.allCustomerTokens.entries()).map(([userId, tokenData]) => ({
      userId,
      name: tokenData.customerInfo.name,
      email: tokenData.customerInfo.email,
      phone: tokenData.customerInfo.phone,
      registeredAt: tokenData.registeredAt,
      lastSeen: tokenData.lastSeen
    }));
  }

  // Obtenir le nombre de clients enregistrés
  getClientCount() {
    return this.allCustomerTokens.size;
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