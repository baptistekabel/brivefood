// Service pour envoyer des notifications push depuis le backend ou l'app client
import notificationService from './notificationService';

class OrderNotificationService {
  constructor() {
    this.adminTokens = new Set(); // Stockage des tokens admin
    this.isSimulationMode = true; // Pour les tests en local
  }

  // Enregistrer un token admin
  registerAdminToken(token) {
    if (token && !this.adminTokens.has(token)) {
      this.adminTokens.add(token);
      console.log('🔑 Token admin enregistré:', token.substring(0, 20) + '...');
    }
  }

  // Supprimer un token admin
  unregisterAdminToken(token) {
    if (this.adminTokens.has(token)) {
      this.adminTokens.delete(token);
      console.log('🗑️ Token admin supprimé');
    }
  }

  // Simuler une nouvelle commande (pour tests locaux)
  async simulateNewOrder(orderData = null) {
    const mockOrder = orderData || this.generateMockOrder();

    if (this.isSimulationMode) {
      // En mode simulation, utiliser les notifications locales
      await notificationService.simulateNewOrder(mockOrder);
      console.log('📱 Notification locale envoyée pour la commande:', mockOrder.id);
      return true;
    }

    // En mode production, envoyer via l'API
    return await this.sendOrderNotificationToAdmins(mockOrder);
  }

  // Envoyer une notification à tous les admins connectés
  async sendOrderNotificationToAdmins(orderData) {
    try {
      const notifications = Array.from(this.adminTokens).map(token => ({
        to: token,
        title: '🍕 Nouvelle Commande!',
        body: `Commande #${orderData.id} - ${orderData.total}€\n${orderData.customerName}`,
        data: {
          type: 'new_order',
          orderId: orderData.id,
          customerName: orderData.customerName,
          total: orderData.total,
          timestamp: orderData.timestamp || new Date().toISOString(),
        },
        sound: 'default',
        priority: 'high',
        channelId: 'new-orders',
      }));

      if (notifications.length === 0) {
        console.log('⚠️ Aucun token admin enregistré');
        return false;
      }

      // Envoyer les notifications via l'API Expo Push
      const response = await this.sendPushNotifications(notifications);
      console.log('📤 Notifications envoyées aux admins:', response);
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
      return false;
    }
  }

  // Envoyer des notifications via l'API Expo Push
  async sendPushNotifications(messages) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erreur API Expo Push:', error);
      throw error;
    }
  }

  // Générer une commande fictive pour les tests
  generateMockOrder() {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const customerNames = [
      'Marie Dubois', 'Jean Martin', 'Sophie Leroy', 'Pierre Moreau',
      'Emma Bernard', 'Lucas Petit', 'Chloe Durand', 'Thomas Robert'
    ];

    const items = [
      ['Pizza Margherita M', 'Coca Cola'],
      ['Burger Classique L', 'Frites', 'Sprite'],
      ['Pâtes Carbonara L', 'Tiramisu', 'Eau plate'],
      ['Salade César M', 'Pain à l\'ail', 'Jus d\'orange'],
      ['Tacos Poulet x3', 'Coca Cola', 'Cookies'],
    ];

    const randomItems = items[Math.floor(Math.random() * items.length)];
    const total = (Math.random() * 40 + 15).toFixed(2); // Entre 15€ et 55€

    return {
      id: `ORD-${orderNumber}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      items: randomItems,
      total: parseFloat(total),
      timestamp: new Date().toISOString(),
      status: 'pending',
      address: '123 Rue des Exemples, Brive-la-Gaillarde',
      phone: '06 12 34 56 78',
    };
  }

  // Envoyer une notification de mise à jour de commande
  async sendOrderUpdateNotification(orderId, newStatus, customerName) {
    const statusMessages = {
      confirmed: 'Commande confirmée',
      preparing: 'Préparation en cours',
      ready: 'Commande prête',
      out_for_delivery: 'En cours de livraison',
      delivered: 'Commande livrée',
      cancelled: 'Commande annulée',
    };

    const orderData = {
      id: orderId,
      customerName: customerName,
      status: newStatus,
      statusMessage: statusMessages[newStatus] || 'Statut mis à jour',
    };

    if (this.isSimulationMode) {
      await notificationService.sendLocalNotification(
        '📋 Mise à jour commande',
        `${orderData.statusMessage} - ${customerName}`,
        {
          type: 'order_update',
          orderId: orderId,
          status: newStatus,
        }
      );
      return true;
    }

    return await this.sendUpdateNotificationToAdmins(orderData);
  }

  // Configurer l'intégration avec votre backend
  setupBackendIntegration() {
    console.log('🔧 Configuration de l\'intégration backend');

    // Exemple d'intégration avec un webhook
    // Remplacez cette URL par votre endpoint réel
    const webhookUrl = 'https://your-backend.com/webhook/new-order';

    console.log(`📡 Webhook configuré: ${webhookUrl}`);

    // Vous pouvez également configurer Firebase Functions ou
    // un autre service de notifications push ici
    this.setupFirebaseIntegration();
  }

  // Configuration Firebase (si vous utilisez Firebase)
  setupFirebaseIntegration() {
    console.log('🔥 Configuration Firebase pour les notifications');

    // Exemple de configuration Firebase Cloud Messaging
    // Cette partie serait implémentée côté serveur
    const firebaseConfig = {
      // Vos clés Firebase
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      messagingSenderId: "your-sender-id",
    };

    console.log('Firebase configuré pour les notifications push');
  }

  // Activer/Désactiver le mode simulation
  setSimulationMode(enabled) {
    this.isSimulationMode = enabled;
    console.log(`🎭 Mode simulation: ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  }

  // Obtenir les statistiques des notifications
  getNotificationStats() {
    return {
      activeAdminTokens: this.adminTokens.size,
      simulationMode: this.isSimulationMode,
      lastNotificationSent: this.lastNotificationTime || null,
    };
  }
}

// Instance singleton
const orderNotificationService = new OrderNotificationService();

// Fonctions utilitaires exportées
export default orderNotificationService;

export const registerAdmin = (token) => orderNotificationService.registerAdminToken(token);
export const unregisterAdmin = (token) => orderNotificationService.unregisterAdminToken(token);
export const simulateOrder = (orderData) => orderNotificationService.simulateNewOrder(orderData);
export const sendOrderUpdate = (orderId, status, customer) =>
  orderNotificationService.sendOrderUpdateNotification(orderId, status, customer);
export const setupBackend = () => orderNotificationService.setupBackendIntegration();
export const setSimulation = (enabled) => orderNotificationService.setSimulationMode(enabled);
export const getStats = () => orderNotificationService.getNotificationStats();

// Exemple d'utilisation dans votre app client :
/*
import { simulateOrder } from './orderNotificationService';

// Quand un client passe une commande
const handleNewOrder = async (orderData) => {
  // Sauvegarder la commande en base
  await saveOrderToDatabase(orderData);

  // Envoyer notification aux admins
  await simulateOrder(orderData);
};
*/