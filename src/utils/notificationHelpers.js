import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Helpers pour gérer les différences entre iOS et Android

export const getPresentedNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      // getAllPresentedNotificationsAsync n'existe que sur Android
      // Utilisation dynamique pour éviter l'erreur d'import
      if (Notifications.getAllPresentedNotificationsAsync) {
        return await Notifications.getAllPresentedNotificationsAsync();
      } else {
        console.warn('getAllPresentedNotificationsAsync non disponible sur cette version');
        return [];
      }
    } else {
      // Sur iOS, retourner un tableau vide car cette fonction n'est pas disponible
      console.log('getPresentedNotifications n\'est pas disponible sur iOS');
      return [];
    }
  } catch (error) {
    console.warn('Erreur lors de la récupération des notifications présentées:', error);
    return [];
  }
};

export const clearPresentedNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('Notifications effacées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'effacement des notifications:', error);
  }
};

export const setBadgeCount = async (count = 0) => {
  try {
    await Notifications.setBadgeCountAsync(count);
    console.log(`Badge mis à jour: ${count}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du badge:', error);
  }
};

export const getNotificationPermissionStatus = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return 'undetermined';
  }
};

export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
        allowAnnouncements: true,
      },
      android: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    return status;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return 'denied';
  }
};

// Fonction pour vérifier si les notifications sont supportées sur la plateforme
export const isNotificationFeatureSupported = (feature) => {
  const supportMatrix = {
    getAllPresentedNotifications: Platform.OS === 'android',
    criticalAlerts: Platform.OS === 'ios',
    soundSettings: true,
    badgeCount: true,
    customSounds: Platform.OS === 'ios',
  };

  return supportMatrix[feature] || false;
};

// Logger spécialisé pour les notifications
export const notificationLogger = {
  info: (message, data = null) => {
    console.log(`📱 [Notifications] ${message}`, data || '');
  },

  error: (message, error = null) => {
    console.error(`❌ [Notifications] ${message}`, error || '');
  },

  warn: (message, data = null) => {
    console.warn(`⚠️ [Notifications] ${message}`, data || '');
  },

  success: (message, data = null) => {
    console.log(`✅ [Notifications] ${message}`, data || '');
  }
};

export default {
  getPresentedNotifications,
  clearPresentedNotifications,
  setBadgeCount,
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  isNotificationFeatureSupported,
  notificationLogger,
};