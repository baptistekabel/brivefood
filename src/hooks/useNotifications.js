import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import notificationService from '../services/notificationService';
import { getPresentedNotifications, notificationLogger } from '../utils/notificationHelpers';

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [pushToken, setPushToken] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeNotifications();
    setupAppStateListener();

    return () => {
      // Cleanup quand le composant est démonté
      notificationService.cleanup();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // Vérifier les permissions actuelles
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status);

      if (status === 'granted') {
        // Initialiser le service de notifications
        await notificationService.initialize();

        // Obtenir le token
        const token = await notificationService.getPushToken();
        setPushToken(token);

        // Enregistrer le token sur le serveur (si nécessaire)
        if (token) {
          await notificationService.registerTokenWithServer(token);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      setIsInitialized(true);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // L'app revient au premier plan
        console.log('App revient au premier plan - vérification des notifications');
        handleAppForeground();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const handleAppForeground = async () => {
    try {
      // Vérifier s'il y a de nouvelles notifications en utilisant les helpers cross-platform
      const notifications = await getPresentedNotifications();

      if (notifications.length > 0) {
        const latestNotification = notifications[0];
        setLastNotification(latestNotification);

        // Traiter la dernière notification
        if (latestNotification.request.content.data?.type === 'new_order') {
          console.log('Nouvelle commande détectée lors du retour dans l\'app');
          // Vous pouvez déclencher une action ici, comme actualiser les commandes
        }
      } else {
        // Logger le retour en premier plan
        console.log(`App revient au premier plan (${Platform.OS})`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des notifications:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      setNotificationPermission(status);

      if (status === 'granted') {
        await initializeNotifications();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  };

  const sendTestNotification = async (orderData) => {
    try {
      if (notificationPermission !== 'granted') {
        console.log('Permissions non accordées pour les notifications');
        return false;
      }

      await notificationService.simulateNewOrder(orderData);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification test:', error);
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      setLastNotification(null);
    } catch (error) {
      console.error('Erreur lors de l\'effacement des notifications:', error);
    }
  };

  const updateBadgeCount = async (count = 0) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du badge:', error);
    }
  };

  // Fonction utilitaire pour simuler une nouvelle commande
  const simulateNewOrder = (orderData = null) => {
    const defaultOrder = {
      id: 'ORD-' + Date.now(),
      total: Math.floor(Math.random() * 50) + 10,
      customerName: 'Client Test',
      items: ['Pizza Margherita', 'Coca Cola'],
      timestamp: new Date().toISOString(),
    };

    return sendTestNotification(orderData || defaultOrder);
  };

  return {
    // État
    notificationPermission,
    pushToken,
    lastNotification,
    isInitialized,

    // Actions
    requestPermission,
    sendTestNotification,
    clearAllNotifications,
    updateBadgeCount,
    simulateNewOrder,

    // Utilitaires
    isPermissionGranted: notificationPermission === 'granted',
    canSendNotifications: notificationPermission === 'granted' && isInitialized,
  };
}