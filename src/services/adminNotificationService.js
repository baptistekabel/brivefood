import notificationService from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AdminNotificationService {
  constructor() {
    this.adminTokens = [];
    this.isInitialized = false;
  }

  // Initialiser le service
  async initialize() {
    try {
      await this.loadAdminTokens();
      this.isInitialized = true;
      console.log('✅ AdminNotificationService initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation AdminNotificationService:', error);
    }
  }

  // Charger les tokens admin depuis le stockage
  async loadAdminTokens() {
    try {
      const tokens = await AsyncStorage.getItem('@admin_push_tokens');
      this.adminTokens = tokens ? JSON.parse(tokens) : [];
      console.log('📱 Tokens admin chargés:', this.adminTokens.length);
    } catch (error) {
      console.error('❌ Erreur chargement tokens admin:', error);
      this.adminTokens = [];
    }
  }

  // Sauvegarder les tokens admin
  async saveAdminTokens() {
    try {
      await AsyncStorage.setItem('@admin_push_tokens', JSON.stringify(this.adminTokens));
      console.log('💾 Tokens admin sauvegardés');
    } catch (error) {
      console.error('❌ Erreur sauvegarde tokens admin:', error);
    }
  }

  // Enregistrer un token d'admin
  async registerAdminToken(token, deviceInfo = {}) {
    try {
      if (!token) {
        console.warn('⚠️ Token vide, impossible d\'enregistrer');
        return false;
      }

      // Vérifier si le token existe déjà
      const existingIndex = this.adminTokens.findIndex(t => t.token === token);

      const tokenData = {
        token,
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        deviceInfo: {
          platform: deviceInfo.platform || 'unknown',
          deviceId: deviceInfo.deviceId || 'unknown',
        }
      };

      if (existingIndex >= 0) {
        // Mettre à jour le token existant
        this.adminTokens[existingIndex] = tokenData;
        console.log('🔄 Token admin mis à jour');
      } else {
        // Ajouter nouveau token
        this.adminTokens.push(tokenData);
        console.log('✅ Nouveau token admin enregistré');
      }

      await this.saveAdminTokens();
      return true;
    } catch (error) {
      console.error('❌ Erreur enregistrement token admin:', error);
      return false;
    }
  }

  // Supprimer un token admin
  async unregisterAdminToken(token) {
    try {
      this.adminTokens = this.adminTokens.filter(t => t.token !== token);
      await this.saveAdminTokens();
      console.log('🗑️ Token admin supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression token admin:', error);
      return false;
    }
  }

  // Envoyer une notification à tous les admins pour une nouvelle commande
  async notifyAdminsNewOrder(orderData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.adminTokens.length === 0) {
        console.warn('⚠️ Aucun token admin enregistré');
        return false;
      }

      const modeEmojis = {
        'delivery': '🚚',
        'takeout': '🥡',
        'dine_in': '🍽️'
      };

      const modeLabels = {
        'delivery': 'Livraison',
        'takeout': 'À emporter',
        'dine_in': 'Sur place'
      };

      const emoji = modeEmojis[orderData.mode] || '📦';
      const modeLabel = modeLabels[orderData.mode] || 'Commande';

      const title = `${emoji} ${modeLabel}!`;
      let body = `Commande #${orderData.id} - ${orderData.total.toFixed(2)}€`;

      if (orderData.customerName && orderData.customerName !== 'Client' && orderData.customerName !== 'Client BriveFood') {
        body += `\n👤 ${orderData.customerName}`;
      }

      if (orderData.items && orderData.items.length > 0) {
        const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
        body += `\n📦 ${totalItems} article${totalItems > 1 ? 's' : ''}`;
      }

      const notificationData = {
        type: 'new_order',
        orderId: orderData.id,
        orderTotal: orderData.total,
        orderMode: orderData.mode,
        customerName: orderData.customerName,
      };

      // Envoyer à tous les tokens admin
      const results = await Promise.allSettled(
        this.adminTokens.map(async (adminToken) => {
          try {
            return await notificationService.sendPushNotification(
              adminToken.token,
              title,
              body,
              notificationData
            );
          } catch (error) {
            console.error(`❌ Erreur envoi notification à ${adminToken.token}:`, error);
            return null;
          }
        })
      );

      const successCount = results.filter(result =>
        result.status === 'fulfilled' && result.value
      ).length;

      console.log(`✅ Notifications envoyées: ${successCount}/${this.adminTokens.length}`);
      return successCount > 0;

    } catch (error) {
      console.error('❌ Erreur notification admins:', error);
      return false;
    }
  }

  // Nettoyer les tokens expirés ou invalides
  async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

      this.adminTokens = this.adminTokens.filter(tokenData => {
        const tokenAge = now - new Date(tokenData.lastSeen);
        return tokenAge < maxAge;
      });

      await this.saveAdminTokens();
      console.log('🧹 Tokens expirés nettoyés');
    } catch (error) {
      console.error('❌ Erreur nettoyage tokens:', error);
    }
  }

  // Obtenir la liste des tokens admin (pour debug)
  getAdminTokens() {
    return this.adminTokens;
  }
}

// Instance singleton
const adminNotificationService = new AdminNotificationService();

export default adminNotificationService;

// Fonctions utilitaires
export const initializeAdminNotifications = () => adminNotificationService.initialize();
export const registerAdminForNotifications = (token, deviceInfo) => adminNotificationService.registerAdminToken(token, deviceInfo);
export const notifyAdminsNewOrder = (orderData) => adminNotificationService.notifyAdminsNewOrder(orderData);