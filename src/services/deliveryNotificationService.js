import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class DeliveryNotificationService {
  constructor() {
    this.setupNotifications();
  }

  // Configuration des notifications
  setupNotifications = () => {
    // Configuration pour comment afficher les notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  // Demander les permissions de notification
  requestPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permissions de notification refusées');
        return false;
      }

      console.log('✅ Permissions de notification accordées');
      return true;
    } catch (error) {
      console.error('❌ Erreur demande permissions notifications:', error);
      return false;
    }
  };

  // Enregistrer un livreur pour recevoir des notifications
  registerDeliveryUser = async (userId, userInfo) => {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permissions refusées' };
      }

      // Obtenir le token de notification
      let token = '';
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      }

      // Sauvegarder les informations du livreur
      const deliveryUserData = {
        userId,
        pushToken: token,
        userInfo,
        registeredAt: new Date().toISOString(),
        isActive: true
      };

      await AsyncStorage.setItem(
        `@deliveryUser_${userId}`,
        JSON.stringify(deliveryUserData)
      );

      console.log('✅ Livreur enregistré pour notifications:', userId);
      return { success: true, token };
    } catch (error) {
      console.error('❌ Erreur enregistrement livreur:', error);
      return { success: false, error: error.message };
    }
  };

  // Notifier tous les livreurs d'une nouvelle commande
  notifyNewDeliveryOrder = async (orderData) => {
    try {
      console.log('📱 Envoi notification nouvelle commande:', orderData.id);

      // Récupérer tous les livreurs enregistrés
      const keys = await AsyncStorage.getAllKeys();
      const deliveryKeys = keys.filter(key => key.startsWith('@deliveryUser_'));

      if (deliveryKeys.length === 0) {
        console.log('ℹ️ Aucun livreur enregistré pour notifications');
        return { success: true, sentCount: 0 };
      }

      const deliveryUsers = await AsyncStorage.multiGet(deliveryKeys);
      const activeUsers = deliveryUsers
        .map(([key, value]) => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })
        .filter(user => user && user.isActive && user.pushToken);

      if (activeUsers.length === 0) {
        console.log('ℹ️ Aucun livreur actif avec token de notification');
        return { success: true, sentCount: 0 };
      }

      // Préparer le message de notification
      const notificationData = {
        title: '🚴‍♂️ Nouvelle course disponible !',
        body: `Commande #${orderData.id} • ${orderData.total.toFixed(2)}€\n📍 ${orderData.address || 'Adresse à définir'}`,
        data: {
          type: 'new_delivery_order',
          orderId: orderData.id,
          orderData: JSON.stringify(orderData)
        },
        sound: 'default',
        priority: 'high'
      };

      // Envoyer la notification locale (pour test en développement)
      await this.sendLocalNotification(notificationData);

      // Ici on pourrait envoyer les notifications push réelles via un serveur
      // Pour le moment, on simule l'envoi
      console.log(`📤 ${activeUsers.length} notifications envoyées`);

      return {
        success: true,
        sentCount: activeUsers.length,
        users: activeUsers.map(u => ({ userId: u.userId, pushToken: u.pushToken }))
      };
    } catch (error) {
      console.error('❌ Erreur envoi notifications:', error);
      return { success: false, error: error.message };
    }
  };

  // Envoyer une notification locale (pour test)
  sendLocalNotification = async (notificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          sound: notificationData.sound || 'default',
        },
        trigger: null, // Immédiatement
      });

      console.log('📱 Notification locale envoyée');
    } catch (error) {
      console.error('❌ Erreur notification locale:', error);
    }
  };

  // Désactiver les notifications pour un livreur
  unregisterDeliveryUser = async (userId) => {
    try {
      await AsyncStorage.removeItem(`@deliveryUser_${userId}`);
      console.log('✅ Livreur désenregistré des notifications:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur désenregistrement livreur:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtenir la liste des livreurs enregistrés
  getRegisteredDeliveryUsers = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const deliveryKeys = keys.filter(key => key.startsWith('@deliveryUser_'));

      if (deliveryKeys.length === 0) {
        return { success: true, users: [] };
      }

      const deliveryUsers = await AsyncStorage.multiGet(deliveryKeys);
      const users = deliveryUsers
        .map(([key, value]) => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })
        .filter(user => user);

      return { success: true, users };
    } catch (error) {
      console.error('❌ Erreur récupération livreurs enregistrés:', error);
      return { success: false, error: error.message };
    }
  };

  // Nettoyer les anciennes données
  clearOldRegistrations = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const deliveryKeys = keys.filter(key => key.startsWith('@deliveryUser_'));

      const deliveryUsers = await AsyncStorage.multiGet(deliveryKeys);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      for (const [key, value] of deliveryUsers) {
        try {
          const user = JSON.parse(value);
          const registeredAt = new Date(user.registeredAt);

          if (registeredAt < thirtyDaysAgo) {
            await AsyncStorage.removeItem(key);
            console.log('🧹 Ancien enregistrement supprimé:', user.userId);
          }
        } catch (error) {
          // Supprimer les données corrompues
          await AsyncStorage.removeItem(key);
          console.log('🧹 Données corrompues supprimées:', key);
        }
      }

      console.log('✅ Nettoyage des anciens enregistrements terminé');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return { success: false, error: error.message };
    }
  };
}

// Export d'une instance unique
const deliveryNotificationService = new DeliveryNotificationService();
export default deliveryNotificationService;