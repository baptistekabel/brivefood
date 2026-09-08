import notificationService from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerPushToken } from './broadcastNotificationService';

class CustomerNotificationService {
  constructor() {
    this.customerTokens = new Map(); // Map: orderId -> tokenData
    this.isInitialized = false;
  }

  // Initialiser le service
  async initialize() {
    try {
      await this.loadCustomerTokens();
      this.isInitialized = true;
      console.log('✅ CustomerNotificationService initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation CustomerNotificationService:', error);
    }
  }

  // Charger les tokens clients depuis le stockage
  async loadCustomerTokens() {
    try {
      const tokens = await AsyncStorage.getItem('@customer_push_tokens');
      if (tokens) {
        const tokenArray = JSON.parse(tokens);
        this.customerTokens = new Map(tokenArray);
      } else {
        this.customerTokens = new Map();
      }
      console.log('📱 Tokens clients chargés:', this.customerTokens.size);
    } catch (error) {
      console.error('❌ Erreur chargement tokens clients:', error);
      this.customerTokens = new Map();
    }
  }

  // Sauvegarder les tokens clients
  async saveCustomerTokens() {
    try {
      const tokenArray = Array.from(this.customerTokens.entries());
      await AsyncStorage.setItem('@customer_push_tokens', JSON.stringify(tokenArray));
      console.log('💾 Tokens clients sauvegardés');
    } catch (error) {
      console.error('❌ Erreur sauvegarde tokens clients:', error);
    }
  }

  // Enregistrer un token client pour une commande spécifique
  async registerCustomerForOrder(orderId, token, customerInfo = {}) {
    try {
      if (!token || !orderId) {
        console.warn('⚠️ Token ou orderId manquant');
        return false;
      }

      const tokenData = {
        token,
        orderId,
        registeredAt: new Date().toISOString(),
        customerInfo: {
          name: customerInfo.name || 'Client',
          phone: customerInfo.phone || '',
        }
      };

      this.customerTokens.set(orderId, tokenData);
      await this.saveCustomerTokens();

      console.log(`✅ Client enregistré pour commande ${orderId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur enregistrement token client:', error);
      return false;
    }
  }

  // Supprimer un token client (quand commande terminée)
  async unregisterCustomerForOrder(orderId) {
    try {
      if (this.customerTokens.has(orderId)) {
        this.customerTokens.delete(orderId);
        await this.saveCustomerTokens();
        console.log(`🗑️ Token client supprimé pour commande ${orderId}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression token client:', error);
      return false;
    }
  }

  // Notifier un client que sa commande est en livraison
  async notifyCustomerOrderInDelivery(orderId, orderData = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const tokenData = this.customerTokens.get(orderId);
      if (!tokenData) {
        console.warn(`⚠️ Aucun token trouvé pour la commande ${orderId}`);
        return false;
      }

      const title = '🚚 Votre commande est en livraison!';
      const body = `Commande #${orderId} - Le livreur est en route vers vous 🛵`;

      const notificationData = {
        type: 'order_in_delivery',
        orderId,
        orderStatus: 'in_delivery',
        estimatedTime: orderData.estimatedTime || '15-30 min',
      };

      console.log(`📱 Envoi notification livraison pour commande ${orderId}`);

      const result = await notificationService.sendPushNotification(
        tokenData.token,
        title,
        body,
        notificationData
      );

      if (result) {
        console.log(`✅ Notification livraison envoyée pour commande ${orderId}`);
        return true;
      } else {
        console.error(`❌ Échec envoi notification pour commande ${orderId}`);
        return false;
      }

    } catch (error) {
      console.error('❌ Erreur notification client livraison:', error);
      return false;
    }
  }

  // Notifier un client que sa commande est livrée
  async notifyCustomerOrderDelivered(orderId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const tokenData = this.customerTokens.get(orderId);
      if (!tokenData) {
        console.warn(`⚠️ Aucun token trouvé pour la commande ${orderId}`);
        return false;
      }

      const title = '✅ Commande livrée!';
      const body = `Commande #${orderId} - Votre commande a été livrée avec succès 🎉`;

      const notificationData = {
        type: 'order_delivered',
        orderId,
        orderStatus: 'delivered',
      };

      console.log(`📱 Envoi notification livraison terminée pour commande ${orderId}`);

      const result = await notificationService.sendPushNotification(
        tokenData.token,
        title,
        body,
        notificationData
      );

      if (result) {
        console.log(`✅ Notification livraison terminée envoyée pour commande ${orderId}`);
        // Supprimer le token après livraison
        await this.unregisterCustomerForOrder(orderId);
        return true;
      } else {
        console.error(`❌ Échec envoi notification livraison terminée pour commande ${orderId}`);
        return false;
      }

    } catch (error) {
      console.error('❌ Erreur notification client livraison terminée:', error);
      return false;
    }
  }

  // Notifier selon le changement de statut
  async notifyCustomerStatusChange(orderId, newStatus, orderData = {}) {
    try {
      switch (newStatus) {
        case 'in_delivery':
          return await this.notifyCustomerOrderInDelivery(orderId, orderData);
        case 'delivered':
          return await this.notifyCustomerOrderDelivered(orderId);
        case 'ready':
          // Pour les commandes à emporter ou sur place
          if (orderData.mode === 'takeout') {
            return await this.notifyCustomerOrderReady(orderId, 'Votre commande est prête à être récupérée! 🥡');
          } else if (orderData.mode === 'dine_in') {
            return await this.notifyCustomerOrderReady(orderId, 'Votre commande est prête à être servie! 🍽️');
          }
          break;
        case 'cancelled':
          return await this.notifyCustomerOrderCancelled(orderId, orderData);
        default:
          console.log(`ℹ️ Pas de notification client pour le statut: ${newStatus}`);
          return false;
      }
    } catch (error) {
      console.error('❌ Erreur notification changement statut:', error);
      return false;
    }
  }

  // Token push du client d'une commande, cherché dans cet ordre :
  //
  //   1. le token enregistré sur la commande elle-même à sa validation — seul
  //      moyen de joindre un client sans compte ;
  //   2. le registre local, qui ne contient que les commandes passées depuis
  //      CET appareil (donc jamais celles du client quand on est côté admin) ;
  //   3. le registre Firestore `push_tokens`, alimenté à la connexion.
  //
  // Sans les points 1 et 3, une notification envoyée depuis la tablette du
  // restaurant ne partait jamais : le registre local y est toujours vide.
  async resolveCustomerToken(orderId, orderData = {}) {
    if (orderData.pushToken) return orderData.pushToken;

    const localToken = this.customerTokens.get(orderId)?.token;
    if (localToken) return localToken;

    if (orderData.userId) {
      return await getCustomerPushToken(orderData.userId);
    }

    return null;
  }

  // Notifier que la commande est annulée par le restaurant.
  // Le motif saisi par le restaurant est repris tel quel : « annulée » sans
  // explication est la première cause d'appel au restaurant.
  async notifyCustomerOrderCancelled(orderId, orderData = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const token = await this.resolveCustomerToken(orderId, orderData);
      if (!token) {
        console.warn(`⚠️ Aucun token trouvé pour la commande ${orderId}`);
        return false;
      }

      const reference = orderData.orderNumber || orderId;
      const reason = (orderData.reason || '').trim();

      const title = '❌ Commande annulée';
      const body = reason
        ? `Commande #${reference} - Annulée par le restaurant : ${reason}`
        : `Commande #${reference} - Votre commande a été annulée par le restaurant. Appelez-le pour toute question.`;

      const notificationData = {
        type: 'order_cancelled',
        orderId,
        orderStatus: 'cancelled',
        ...(reason && { reason }),
      };

      const result = await notificationService.sendPushNotification(
        token,
        title,
        body,
        notificationData,
        { channelId: 'order-updates' }
      );

      if (result) {
        console.log(`✅ Notification annulation envoyée pour ${orderId}`);
        // Commande close : le token ne servira plus
        await this.unregisterCustomerForOrder(orderId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur notification annulation:', error);
      return false;
    }
  }

  // Notifier que la commande est prête
  async notifyCustomerOrderReady(orderId, customMessage) {
    try {
      const tokenData = this.customerTokens.get(orderId);
      if (!tokenData) {
        console.warn(`⚠️ Aucun token trouvé pour la commande ${orderId}`);
        return false;
      }

      const title = '🔔 Commande prête!';
      const body = customMessage || `Commande #${orderId} - Votre commande est prête!`;

      const notificationData = {
        type: 'order_ready',
        orderId,
        orderStatus: 'ready',
      };

      const result = await notificationService.sendPushNotification(
        tokenData.token,
        title,
        body,
        notificationData
      );

      if (result) {
        console.log(`✅ Notification commande prête envoyée pour ${orderId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur notification commande prête:', error);
      return false;
    }
  }

  // Nettoyer les tokens expirés
  async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures

      for (const [orderId, tokenData] of this.customerTokens.entries()) {
        const tokenAge = now - new Date(tokenData.registeredAt);
        if (tokenAge > maxAge) {
          this.customerTokens.delete(orderId);
          console.log(`🧹 Token expiré supprimé pour commande ${orderId}`);
        }
      }

      await this.saveCustomerTokens();
    } catch (error) {
      console.error('❌ Erreur nettoyage tokens clients:', error);
    }
  }

  // Obtenir la liste des tokens clients (pour debug)
  getCustomerTokens() {
    return Array.from(this.customerTokens.entries());
  }
}

// Instance singleton
const customerNotificationService = new CustomerNotificationService();

export default customerNotificationService;

// Fonctions utilitaires
export const initializeCustomerNotifications = () => customerNotificationService.initialize();
export const registerCustomerForOrderNotifications = (orderId, token, customerInfo) =>
  customerNotificationService.registerCustomerForOrder(orderId, token, customerInfo);
export const notifyCustomerStatusChange = (orderId, newStatus, orderData) =>
  customerNotificationService.notifyCustomerStatusChange(orderId, newStatus, orderData);