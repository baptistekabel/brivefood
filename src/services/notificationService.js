import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPresentedNotifications } from '../utils/notificationHelpers';

// Configuration des notifications pour l'affichage en arrière-plan
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isBackground = notification.request.trigger?.type === 'push';

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      // Afficher même en arrière-plan
      suppressDefaultSound: false,
      // Configuration iOS pour l'arrière-plan
      ...(Platform.OS === 'ios' && {
        shouldShowBanner: true,
        shouldShowInAppNotification: true,
      }),
    };
  },
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.badgeCount = 0; // Compteur manuel pour iOS
  }

  // Initialiser le service de notifications
  async initialize() {
    try {
      await this.registerForPushNotificationsAsync();
      this.setupNotificationListeners();
      console.log('✅ Service de notifications initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  // Enregistrer l'appareil pour les notifications push
  async registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('new-orders', {
        name: 'Nouvelles Commandes',
        description: 'Notifications pour les nouvelles commandes clients',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('order-updates', {
        name: 'Mises à jour Commandes',
        description: 'Notifications pour les mises à jour de commandes',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#000000',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
            allowCriticalAlerts: true,
            allowDisplayInCarPlay: true,
            allowProvisional: false, // Demander explicitement l'autorisation
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission de notification refusée');
        return;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: '81983664-a2fe-43e8-8c2f-6f2c2b98baac', // ID du projet Expo depuis app.json
        });

        this.expoPushToken = token.data;
        console.log('🔑 Token de notification:', token.data);

        // Sauvegarder le token
        await AsyncStorage.setItem('@push_token', token.data);

        // Enregistrer le token avec timeout de 5 secondes
        try {
          await Promise.race([
            this.registerTokenWithServer(token.data),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout enregistrement token')), 5000)
            )
          ]);
        } catch (error) {
          console.log('⚠️ Enregistrement token échoué (mode hors ligne):', error.message);
        }

        return token.data;
      } catch (error) {
        console.error('❌ Erreur lors de l\'obtention du token:', error);
      }
    } else {
      console.log('❌ Doit utiliser un appareil physique pour les notifications push');
    }
  }

  // Configurer les écouteurs de notifications
  setupNotificationListeners() {
    // Écouteur pour les notifications reçues
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue:', notification);
      this.handleNotificationReceived(notification);
    });

    // Écouteur pour les interactions avec les notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Gérer la réception d'une notification
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;

    if (data?.type === 'new_order') {
      console.log('🆕 Nouvelle commande reçue:', data.orderId);
      // Incrémenter le compteur manuel sur iOS
      if (Platform.OS === 'ios') {
        this.badgeCount++;
      }
      this.updateBadgeCount();
    }
  }

  // Gérer la réponse à une notification (clic)
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;

    if (data?.type === 'new_order') {
      // Naviguer vers la page des commandes
      console.log('🔄 Navigation vers les commandes');
      // Vous pouvez ajouter ici la logique de navigation
    }
  }

  // Envoyer une notification locale (pour test)
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Envoyer immédiatement
      });

      console.log('📨 Notification locale envoyée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification locale:', error);
    }
  }

  // Simuler une nouvelle commande (pour test)
  async simulateNewOrder(orderData) {
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

    const title = `${emoji} Nouvelle ${modeLabel}!`;

    let body = `Commande #${orderData.id} - ${orderData.total.toFixed(2)}€`;
    if (orderData.customerName && orderData.customerName !== 'Client' && orderData.customerName !== 'Client BriveFood') {
      body += `\n👤 ${orderData.customerName}`;
    }

    // Ajouter le nombre d'articles si disponible
    if (orderData.items && orderData.items.length > 0) {
      const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
      body += `\n📦 ${totalItems} article${totalItems > 1 ? 's' : ''}`;
    }

    await this.sendLocalNotification(title, body, {
      type: 'new_order',
      orderId: orderData.id,
      orderTotal: orderData.total,
      orderMode: orderData.mode,
      customerName: orderData.customerName,
    });
  }

  // Mettre à jour le badge de l'app
  async updateBadgeCount(count = null) {
    try {
      if (Platform.OS === 'android') {
        // Sur Android, obtenir le nombre actuel de notifications non lues
        const notifications = await getPresentedNotifications();
        const badgeCount = count !== null ? count : notifications.filter(n => n.request.content.data?.type === 'new_order').length;
        await Notifications.setBadgeCountAsync(badgeCount);
      } else {
        // Sur iOS, utiliser le compteur manuel ou la valeur fournie
        const badgeCount = count !== null ? count : this.badgeCount;
        await Notifications.setBadgeCountAsync(badgeCount);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du badge:', error);
    }
  }

  // Effacer toutes les notifications
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      // Réinitialiser le compteur manuel sur iOS
      if (Platform.OS === 'ios') {
        this.badgeCount = 0;
      }
      await Notifications.setBadgeCountAsync(0);
      console.log('🧹 Toutes les notifications effacées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement des notifications:', error);
    }
  }

  // Obtenir le token de push
  async getPushToken() {
    if (!this.expoPushToken) {
      const storedToken = await AsyncStorage.getItem('@push_token');
      if (storedToken) {
        this.expoPushToken = storedToken;
      }
    }
    return this.expoPushToken;
  }

  // Nettoyer les écouteurs
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // ===== MÉTHODES POUR L'INTÉGRATION AVEC LE BACKEND =====

  // Envoyer une notification push réelle via l'API Expo
  async sendPushNotification(to, title, body, data = {}) {
    const message = {
      to,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'new-orders',
      // Configuration pour l'arrière-plan
      _displayInForeground: true,
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('✅ Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return null;
    }
  }

  // Enregistrer le token sur le serveur (avec fallback local)
  async registerTokenWithServer(token) {
    try {
      // Essayer plusieurs endpoints possibles
      const endpoints = [
        'http://localhost:3000/api/admin/register-push-token',
        'https://your-api.com/admin/register-push-token',
      ];

      let registered = false;

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token,
              deviceType: Platform.OS,
              userType: 'admin',
              timestamp: new Date().toISOString(),
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            console.log(`✅ Token enregistré sur ${endpoint}`);
            registered = true;
            break;
          }
        } catch (error) {
          console.log(`⚠️ ${endpoint} non accessible`);
          continue;
        }
      }

      if (!registered) {
        // Mode hors ligne : sauvegarder localement pour synchronisation ultérieure
        const offlineTokens = await AsyncStorage.getItem('@offline_tokens') || '[]';
        const tokens = JSON.parse(offlineTokens);
        tokens.push({
          token,
          deviceType: Platform.OS,
          userType: 'admin',
          timestamp: new Date().toISOString(),
          synced: false,
        });
        await AsyncStorage.setItem('@offline_tokens', JSON.stringify(tokens));
        console.log('💾 Token sauvegardé hors ligne pour synchronisation ultérieure');
      }
    } catch (error) {
      console.error('❌ Erreur réseau lors de l\'enregistrement du token:', error);
      throw error;
    }
  }

  // Configurer les webhooks Firebase (si vous utilisez Firebase)
  setupFirebaseNotifications() {
    // Configuration pour recevoir les notifications depuis Firebase
    // Ceci sera appelé depuis votre backend quand une nouvelle commande arrive
    console.log('🔥 Configuration Firebase pour les notifications push');
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;

// Fonctions utilitaires exportées
export const initializeNotifications = () => notificationService.initialize();
export const getPushToken = () => notificationService.getPushToken();
export const sendTestNotification = (orderData) => notificationService.simulateNewOrder(orderData);
export const clearNotifications = () => notificationService.clearAllNotifications();
export const cleanupNotifications = () => notificationService.cleanup();