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
    } else if (data?.type === 'rating_request' || data?.type === 'rating_reminder') {
      console.log('⭐ Notification de notation reçue:', data.orderId);
      // La notification est affichée automatiquement
      // Le clic sera géré dans handleNotificationResponse
    }
  }

  // Gérer la réponse à une notification (clic)
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;

    if (data?.type === 'new_order') {
      // Naviguer vers la page des commandes
      console.log('🔄 Navigation vers les commandes');
      // Vous pouvez ajouter ici la logique de navigation
    } else if (data?.type === 'rating_request' || data?.type === 'rating_reminder') {
      console.log('⭐ Clic sur notification de notation:', data.orderId);
      // Déclencher l'ouverture du modal de notation
      this.handleRatingNotificationClick(data);
    }
  }

  // Gérer le clic sur une notification de notation
  async handleRatingNotificationClick(notificationData) {
    try {
      console.log('🎯 Traitement clic notification notation:', notificationData.orderId);

      // Importer dynamiquement le service et le contexte
      const orderRatingService = (await import('./orderRatingService')).default;

      // Vérifier si la commande est toujours en attente de notation
      const isAlreadyRated = await orderRatingService.isOrderRated(notificationData.orderId);

      if (!isAlreadyRated) {
        // Récupérer les notations en attente
        const pendingRatings = await orderRatingService.getPendingRatings();
        const pendingOrder = pendingRatings.find(p => p.orderId === notificationData.orderId);

        if (pendingOrder) {
          console.log('✅ Commande trouvée en attente, ouverture modal notation');

          // Déclencher l'ouverture du modal via un événement global
          // On va utiliser AsyncStorage pour communiquer avec le contexte
          await AsyncStorage.setItem('@rating_notification_clicked', JSON.stringify({
            orderId: notificationData.orderId,
            timestamp: Date.now()
          }));

          console.log('📝 Signal modal notation stocké dans AsyncStorage');
        } else {
          console.log('⚠️ Commande non trouvée dans les notations en attente');
        }
      } else {
        console.log('⚠️ Commande déjà notée, pas d\'action nécessaire');
      }
    } catch (error) {
      console.error('❌ Erreur traitement clic notification notation:', error);
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

  // Envoyer une notification de demande de notation
  async sendRatingNotification(orderData) {
    try {
      const title = '⭐ Notez votre commande';
      const body = `Comment s'est passée votre commande #${orderData.id || orderData.orderId} ?`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'rating_request',
            orderId: orderData.id || orderData.orderId,
            customerName: orderData.customerName,
            total: orderData.total,
            orderDate: orderData.orderDate,
            orderTime: orderData.orderTime,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          badge: this.badgeCount + 1,
        },
        trigger: null, // Envoyer immédiatement
      });

      this.badgeCount++;
      console.log('⭐ Notification de notation envoyée pour commande:', orderData.id || orderData.orderId);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification de notation:', error);
    }
  }

  // Envoyer une notification de notation avec délai
  async scheduleRatingNotification(orderData, delayInMinutes = 2) {
    try {
      const title = '⭐ Notez votre commande';
      const body = `N'oubliez pas de noter votre commande #${orderData.id || orderData.orderId} !`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'rating_reminder',
            orderId: orderData.id || orderData.orderId,
            customerName: orderData.customerName,
            total: orderData.total,
            orderDate: orderData.orderDate,
            orderTime: orderData.orderTime,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          vibrate: [0, 250, 250, 250],
          badge: this.badgeCount + 1,
        },
        trigger: {
          seconds: delayInMinutes * 60, // Convertir minutes en secondes
        },
      });

      this.badgeCount++;
      console.log(`⏰ Notification de notation programmée dans ${delayInMinutes} minutes pour commande:`, orderData.id || orderData.orderId);
    } catch (error) {
      console.error('❌ Erreur lors de la programmation de la notification de notation:', error);
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

  // 🚨 NOUVELLE MÉTHODE : Notifier tous les admins d'un nouvel avis
  async sendAdminNotification(notificationData) {
    try {
      console.log('📱 [NotificationService] Envoi notification admin:', notificationData);

      // 1. Récupérer tous les tokens admin stockés
      const adminTokens = await this.getAdminTokens();

      if (adminTokens.length === 0) {
        console.warn('⚠️ Aucun token admin trouvé');
        return { success: false, reason: 'no_admin_tokens' };
      }

      // 2. Préparer le message de notification
      const notification = {
        title: notificationData.title || '⭐ Nouvel avis client',
        body: notificationData.body || 'Un client vient de laisser un avis',
        sound: 'default',
        badge: 1,
        data: {
          type: 'admin_alert',
          subtype: 'new_rating',
          ...notificationData.data,
          timestamp: new Date().toISOString(),
          priority: 'high'
        }
      };

      // 3. Envoyer à tous les admins
      const sendPromises = adminTokens.map(async (tokenData) => {
        try {
          await this.sendPushNotification(tokenData.token, notification);
          console.log(`✅ Notification envoyée à admin:`, tokenData.deviceType);
          return { success: true, token: tokenData.token };
        } catch (error) {
          console.error(`❌ Erreur envoi à admin ${tokenData.token}:`, error);
          return { success: false, token: tokenData.token, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      const successes = results.filter(r => r.success).length;

      console.log(`📊 Notification admin: ${successes}/${adminTokens.length} envoyées`);

      // 4. Envoyer aussi une notification locale si l'admin est sur l'app
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            sound: 'default',
            data: notification.data
          },
          trigger: null, // Immédiatement
        });
      } catch (localError) {
        console.warn('⚠️ Notification locale admin échouée:', localError);
      }

      return {
        success: successes > 0,
        sent: successes,
        total: adminTokens.length,
        results
      };

    } catch (error) {
      console.error('❌ [NotificationService] Erreur notification admin:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Récupérer tous les tokens admin
  async getAdminTokens() {
    try {
      // Récupérer les tokens stockés localement
      const offlineTokens = await AsyncStorage.getItem('@offline_tokens') || '[]';
      const tokens = JSON.parse(offlineTokens);

      // Filtrer seulement les tokens admin
      const adminTokens = tokens.filter(t => t.userType === 'admin' && t.token);

      // Ajouter le token courant si on est admin
      const currentToken = await this.getPushToken();
      if (currentToken) {
        const currentExists = adminTokens.some(t => t.token === currentToken);
        if (!currentExists) {
          adminTokens.push({
            token: currentToken,
            deviceType: Platform.OS,
            userType: 'admin',
            timestamp: new Date().toISOString(),
            current: true
          });
        }
      }

      console.log(`📋 [NotificationService] ${adminTokens.length} tokens admin trouvés`);
      return adminTokens;

    } catch (error) {
      console.error('❌ [NotificationService] Erreur récupération tokens admin:', error);
      return [];
    }
  }

  // Envoyer une notification push via API
  async sendPushNotification(token, notification) {
    try {
      // Utiliser l'API Expo Push Notifications
      const message = {
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: notification.badge || 1,
        priority: 'high',
        channelId: 'admin-alerts'
      };

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

      if (result.data && result.data[0] && result.data[0].status === 'ok') {
        console.log('✅ Notification push envoyée avec succès');
        return { success: true };
      } else {
        throw new Error(result.data[0]?.message || 'Échec envoi push');
      }

    } catch (error) {
      console.error('❌ Erreur envoi notification push:', error);
      throw error;
    }
  }

  // 🚨 MÉTHODE SPÉCIALE : Notification critique pour les avis 5 étoiles
  async sendCriticalRatingAlert(ratingData) {
    try {
      const isExcellent = ratingData.rating >= 5;
      const isBad = ratingData.rating <= 2;

      let title, body, priority;

      if (isExcellent) {
        title = '🌟 Avis 5 étoiles !';
        body = `Excellent avis pour la commande #${ratingData.orderId}`;
        priority = 'normal';
      } else if (isBad) {
        title = '🚨 Avis négatif';
        body = `Avis ${ratingData.rating}/5 pour #${ratingData.orderId} - Action requise`;
        priority = 'high';
      } else {
        title = '⭐ Nouvel avis';
        body = `Avis ${ratingData.rating}/5 pour #${ratingData.orderId}`;
        priority = 'normal';
      }

      return await this.sendAdminNotification({
        title,
        body,
        data: {
          type: 'rating_alert',
          orderId: ratingData.orderId,
          rating: ratingData.rating,
          comment: ratingData.comment,
          priority,
          critical: isBad
        }
      });

    } catch (error) {
      console.error('❌ Erreur notification critique:', error);
      return { success: false, error: error.message };
    }
  }

  // Nettoyer les anciens tokens admin
  async cleanupAdminTokens() {
    try {
      const offlineTokens = await AsyncStorage.getItem('@offline_tokens') || '[]';
      const tokens = JSON.parse(offlineTokens);

      // Garder seulement les tokens des 7 derniers jours
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentTokens = tokens.filter(t =>
        new Date(t.timestamp).getTime() > sevenDaysAgo
      );

      await AsyncStorage.setItem('@offline_tokens', JSON.stringify(recentTokens));

      console.log(`🧹 Nettoyage tokens: ${tokens.length - recentTokens.length} tokens supprimés`);

    } catch (error) {
      console.error('❌ Erreur nettoyage tokens:', error);
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