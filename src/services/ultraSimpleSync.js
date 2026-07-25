import AsyncStorage from '@react-native-async-storage/async-storage';

// SOLUTION ULTRA RADICALE - Notification directe
export class UltraSimpleSyncService {
  static instance = null;
  static listeners = new Set();

  static getInstance() {
    if (!UltraSimpleSyncService.instance) {
      UltraSimpleSyncService.instance = new UltraSimpleSyncService();
    }
    return UltraSimpleSyncService.instance;
  }

  // Clé de notification directe
  static NOTIFICATION_KEY = '@ADMIN_NOTIFICATION';

  // Sauvegarder et notifier immédiatement
  async saveAndNotify(orders) {
    try {
      console.log('🚨 [UltraSync] IMMEDIATE NOTIFICATION - New order!');
      console.log('📊 [UltraSync] Total orders:', orders.length);

      const notification = {
        timestamp: Date.now(),
        orderCount: orders.length,
        latestOrderId: orders[0]?.id || 'unknown',
        latestOrder: orders[0] || null,
        allOrders: orders,
        notificationId: Math.random().toString(36).substring(7)
      };

      // Sauvegarder la notification
      await AsyncStorage.setItem(UltraSimpleSyncService.NOTIFICATION_KEY, JSON.stringify(notification));

      console.log('✅ [UltraSync] Notification saved:', {
        timestamp: notification.timestamp,
        orderCount: notification.orderCount,
        latestOrderId: notification.latestOrderId,
        notificationId: notification.notificationId
      });

      // Notifier tous les listeners immédiatement
      this.notifyAllListeners(notification);

      return true;
    } catch (error) {
      console.error('❌ [UltraSync] Error saving notification:', error);
      return false;
    }
  }

  // Ajouter un listener pour les notifications
  addListener(callback) {
    console.log('👂 [UltraSync] Adding listener');
    UltraSimpleSyncService.listeners.add(callback);

    // Retourner une fonction pour supprimer le listener
    return () => {
      console.log('🛑 [UltraSync] Removing listener');
      UltraSimpleSyncService.listeners.delete(callback);
    };
  }

  // Notifier tous les listeners
  notifyAllListeners(notification) {
    console.log('📢 [UltraSync] Notifying', UltraSimpleSyncService.listeners.size, 'listeners');

    UltraSimpleSyncService.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('❌ [UltraSync] Error in listener callback:', error);
      }
    });
  }

  // Récupérer la dernière notification
  async getLastNotification() {
    try {
      const stored = await AsyncStorage.getItem(UltraSimpleSyncService.NOTIFICATION_KEY);

      if (!stored) {
        console.log('📭 [UltraSync] No notification found');
        return null;
      }

      const notification = JSON.parse(stored);
      console.log('📖 [UltraSync] Last notification:', {
        timestamp: notification.timestamp,
        orderCount: notification.orderCount,
        latestOrderId: notification.latestOrderId,
        notificationId: notification.notificationId
      });

      return notification;
    } catch (error) {
      console.error('❌ [UltraSync] Error getting notification:', error);
      return null;
    }
  }

  // Vérifier s'il y a une nouvelle notification
  async checkForNewNotification(lastKnownTimestamp = 0) {
    try {
      const notification = await this.getLastNotification();

      if (!notification) {
        return { hasNew: false, notification: null };
      }

      const hasNew = notification.timestamp > lastKnownTimestamp;

      if (hasNew) {
        console.log('🆕 [UltraSync] New notification found!', {
          newTimestamp: notification.timestamp,
          lastKnown: lastKnownTimestamp,
          latestOrderId: notification.latestOrderId
        });
      } else {
        console.log('✅ [UltraSync] No new notifications');
      }

      return { hasNew, notification };
    } catch (error) {
      console.error('❌ [UltraSync] Error checking notification:', error);
      return { hasNew: false, notification: null };
    }
  }

  // Nettoyer les notifications (pour debug)
  async clearNotifications() {
    try {
      await AsyncStorage.removeItem(UltraSimpleSyncService.NOTIFICATION_KEY);
      console.log('🧹 [UltraSync] Notifications cleared');
      return true;
    } catch (error) {
      console.error('❌ [UltraSync] Error clearing notifications:', error);
      return false;
    }
  }

  // Debug complet
  async debugAll() {
    try {
      console.log('🔍 [UltraSync] === DEBUG ALL ===');
      console.log('Active listeners:', UltraSimpleSyncService.listeners.size);

      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);

      const notification = await this.getLastNotification();
      console.log('Current notification:', notification);

      return {
        listeners: UltraSimpleSyncService.listeners.size,
        allKeys,
        notification
      };
    } catch (error) {
      console.error('❌ [UltraSync] Debug error:', error);
      return null;
    }
  }
}

export default UltraSimpleSyncService.getInstance();