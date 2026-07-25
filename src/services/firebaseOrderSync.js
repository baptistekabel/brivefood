import { getDatabase, ref, set, onValue, off, push } from 'firebase/database';

// Service de synchronisation des commandes via Firebase Realtime Database
export class FirebaseOrderSyncService {
  static instance = null;
  static database = null;

  static getInstance() {
    if (!FirebaseOrderSyncService.instance) {
      FirebaseOrderSyncService.instance = new FirebaseOrderSyncService();
    }
    return FirebaseOrderSyncService.instance;
  }

  constructor() {
    this.listeners = new Map();
    this.initializeDatabase();
  }

  initializeDatabase() {
    try {
      FirebaseOrderSyncService.database = getDatabase();
      console.log('✅ [FirebaseSync] Database initialized');
    } catch (error) {
      console.error('❌ [FirebaseSync] Database initialization failed:', error);
    }
  }

  // Sauvegarder toutes les commandes
  async saveAllOrders(orders) {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return false;
      }

      console.log('🔄 [FirebaseSync] Saving orders to Firebase:', orders.length);

      const ordersRef = ref(FirebaseOrderSyncService.database, 'orders');
      await set(ordersRef, {
        orders: orders,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      });

      console.log('✅ [FirebaseSync] Orders saved to Firebase successfully');
      return true;
    } catch (error) {
      console.error('❌ [FirebaseSync] Error saving orders to Firebase:', error);
      return false;
    }
  }

  // Ajouter une nouvelle commande
  async addNewOrder(order) {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return false;
      }

      console.log('🔄 [FirebaseSync] Adding new order to Firebase:', order.id);

      const newOrderRef = ref(FirebaseOrderSyncService.database, `newOrders/${order.id}`);
      await set(newOrderRef, {
        ...order,
        addedAt: Date.now()
      });

      console.log('✅ [FirebaseSync] New order added to Firebase successfully');
      return true;
    } catch (error) {
      console.error('❌ [FirebaseSync] Error adding order to Firebase:', error);
      return false;
    }
  }

  // Écouter les nouvelles commandes en temps réel
  listenForNewOrders(callback) {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return null;
      }

      console.log('👂 [FirebaseSync] Starting to listen for new orders...');

      const newOrdersRef = ref(FirebaseOrderSyncService.database, 'newOrders');

      const listener = onValue(newOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('🔥 [FirebaseSync] New orders detected:', Object.keys(data).length);

          // Convertir en array et trier par timestamp
          const orders = Object.values(data).sort((a, b) => b.addedAt - a.addedAt);
          callback(orders);
        } else {
          console.log('📭 [FirebaseSync] No new orders in Firebase');
          callback([]);
        }
      });

      // Stocker la référence du listener
      this.listeners.set('newOrders', { ref: newOrdersRef, listener });

      return listener;
    } catch (error) {
      console.error('❌ [FirebaseSync] Error setting up new orders listener:', error);
      return null;
    }
  }

  // Écouter toutes les commandes en temps réel
  listenForAllOrders(callback) {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return null;
      }

      console.log('👂 [FirebaseSync] Starting to listen for all orders...');

      const ordersRef = ref(FirebaseOrderSyncService.database, 'orders');

      const listener = onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('🔥 [FirebaseSync] Orders updated:', data.orders?.length || 0);
          callback(data.orders || []);
        } else {
          console.log('📭 [FirebaseSync] No orders in Firebase');
          callback([]);
        }
      });

      // Stocker la référence du listener
      this.listeners.set('allOrders', { ref: ordersRef, listener });

      return listener;
    } catch (error) {
      console.error('❌ [FirebaseSync] Error setting up orders listener:', error);
      return null;
    }
  }

  // Arrêter d'écouter
  stopListening(listenerName) {
    try {
      const storedListener = this.listeners.get(listenerName);
      if (storedListener) {
        off(storedListener.ref, 'value', storedListener.listener);
        this.listeners.delete(listenerName);
        console.log(`🛑 [FirebaseSync] Stopped listening for ${listenerName}`);
      }
    } catch (error) {
      console.error(`❌ [FirebaseSync] Error stopping ${listenerName} listener:`, error);
    }
  }

  // Arrêter tous les listeners
  stopAllListeners() {
    try {
      this.listeners.forEach((value, key) => {
        this.stopListening(key);
      });
      console.log('🛑 [FirebaseSync] All listeners stopped');
    } catch (error) {
      console.error('❌ [FirebaseSync] Error stopping all listeners:', error);
    }
  }

  // Nettoyer les anciennes commandes (pour éviter l'accumulation)
  async clearOldNewOrders() {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return false;
      }

      const newOrdersRef = ref(FirebaseOrderSyncService.database, 'newOrders');
      await set(newOrdersRef, null);

      console.log('🧹 [FirebaseSync] Cleared old new orders');
      return true;
    } catch (error) {
      console.error('❌ [FirebaseSync] Error clearing old orders:', error);
      return false;
    }
  }

  // Récupérer toutes les commandes une seule fois
  async getAllOrdersOnce() {
    try {
      if (!FirebaseOrderSyncService.database) {
        console.error('❌ [FirebaseSync] Database not initialized');
        return [];
      }

      const ordersRef = ref(FirebaseOrderSyncService.database, 'orders');

      return new Promise((resolve) => {
        onValue(ordersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('📖 [FirebaseSync] Retrieved orders once:', data.orders?.length || 0);
            resolve(data.orders || []);
          } else {
            console.log('📭 [FirebaseSync] No orders found');
            resolve([]);
          }
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('❌ [FirebaseSync] Error getting orders once:', error);
      return [];
    }
  }
}

export default FirebaseOrderSyncService.getInstance();