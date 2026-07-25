import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { getServiceDayKey } from '../utils/serviceDay';
import { db } from '../../config/firebase';
import { OrderStatus, OrderMode } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customerNotificationService from '../services/customerNotificationService';
import printerService from '../services/PrinterService';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPositions, setOrderPositions] = useState({}); // Mémoriser les positions

  // Référence vers la collection orders dans Firestore
  const ordersCollection = collection(db, 'orders');

  // Écouter les changements en temps réel depuis Firestore
  useEffect(() => {
    console.log('=== SETTING UP FIRESTORE LISTENER ===');

    const q = query(ordersCollection, orderBy('id', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('🔥 Firestore snapshot received:', querySnapshot.size, 'orders');

      const firestoreOrders = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        firestoreOrders.push({
          ...orderData,
          firestoreId: doc.id, // Garder l'ID Firestore
          createdAt: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt
        });
      });

      // Système de positions stables
      setOrders(prevOrders => {
        // Si c'est le premier chargement, définir les positions initiales
        if (prevOrders.length === 0) {
          const initialSorted = firestoreOrders.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
          });

          // Mémoriser les positions initiales
          const positions = {};
          initialSorted.forEach((order, index) => {
            positions[order.id] = index;
          });
          setOrderPositions(positions);

          console.log('✅ Setting initial orders from Firestore:', initialSorted.length);
          return initialSorted;
        }

        // Pour les mises à jour, maintenir l'ordre existant
        const updatedOrders = [...prevOrders];

        // Mettre à jour les commandes existantes et ajouter les nouvelles
        firestoreOrders.forEach(newOrder => {
          const existingIndex = updatedOrders.findIndex(order => order.id === newOrder.id);

          if (existingIndex !== -1) {
            // Mettre à jour la commande existante à sa position actuelle
            updatedOrders[existingIndex] = newOrder;
          } else {
            // Nouvelle commande - l'ajouter au début
            updatedOrders.unshift(newOrder);
            setOrderPositions(prev => ({
              ...prev,
              [newOrder.id]: 0
            }));
            // Décaler les positions des autres commandes
            setOrderPositions(prev => {
              const newPositions = { ...prev };
              Object.keys(newPositions).forEach(orderId => {
                if (orderId !== newOrder.id) {
                  newPositions[orderId] = newPositions[orderId] + 1;
                }
              });
              return newPositions;
            });

            // L'impression automatique se fait uniquement côté admin (voir dashboard.tsx)
          }
        });

        // Supprimer les commandes qui n'existent plus dans Firestore
        const firestoreOrderIds = new Set(firestoreOrders.map(order => order.id));
        const filteredOrders = updatedOrders.filter(order => firestoreOrderIds.has(order.id));

        console.log('✅ Updating orders from Firestore (maintaining order):', filteredOrders.length);
        return filteredOrders;
      });

      setLoading(false);
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Firestore listener');
      unsubscribe();
    };
  }, []);

  // Plus besoin de saveOrders - Firestore se synchronise automatiquement

  // Plus besoin de debugAsyncStorageOrders - utilisation directe de Firestore

  // Vérifier et auto-compléter les commandes de plus d'une heure
  useEffect(() => {
    const autoCompleteOldOrders = async () => {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const now = Date.now();

      for (const order of orders) {
        // Ne pas modifier les commandes déjà terminées ou annulées
        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
          continue;
        }

        // Vérifier si la commande a plus d'une heure
        const orderCreatedAt = order.createdAt ? new Date(order.createdAt).getTime() : null;
        if (orderCreatedAt && (now - orderCreatedAt) >= ONE_HOUR_MS) {
          try {
            if (order.firestoreId) {
              const orderDoc = doc(db, 'orders', order.firestoreId);
              await updateDoc(orderDoc, {
                status: OrderStatus.DELIVERED,
                updatedAt: serverTimestamp(),
                autoCompletedAt: serverTimestamp(),
                autoCompleted: true
              });
              console.log('✅ Commande', order.id, 'auto-complétée (plus d\'1h)');
            }
          } catch (error) {
            console.error('❌ Erreur auto-complétion commande', order.id, ':', error);
          }
        }
      }
    };

    // Exécuter uniquement quand les commandes sont chargées
    if (orders.length > 0 && !loading) {
      autoCompleteOldOrders();
    }
  }, [orders, loading]);

  // Plus besoin de loadOrders - le listener Firestore se charge du chargement

  // Compteur partagé : un identifiant unique qui ne redescend jamais, et un
  // numéro d'affichage qui repart à 1 à chaque nouvelle journée de service (9h).
  const counterRef = doc(db, 'settings', 'order_counter');

  // Premier démarrage : caler le compteur au-dessus des identifiants déjà
  // présents, sinon les nouvelles commandes réutiliseraient des numéros existants
  const ensureCounterSeeded = async () => {
    const snap = await getDoc(counterRef);
    if (snap.exists()) return;

    const allOrders = await getDocs(ordersCollection);
    let highest = 0;
    allOrders.forEach(document => {
      const value = parseInt(document.data().id, 10);
      if (!isNaN(value) && value > highest) highest = value;
    });

    await setDoc(counterRef, {
      globalLast: highest,
      dailyLast: 0,
      serviceDay: null,
      seededAt: serverTimestamp(),
    }, { merge: true });

    console.log('🔢 Compteur de commandes initialisé à', highest);
  };

  // Générer les numéros d'une nouvelle commande.
  // La transaction garantit que deux clients simultanés n'obtiennent jamais
  // le même numéro.
  const generateOrderNumbers = async () => {
    const serviceDay = getServiceDayKey();

    try {
      await ensureCounterSeeded();

      return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(counterRef);
        const data = snap.exists() ? snap.data() : {};

        const globalNumber = (data.globalLast || 0) + 1;
        // Nouveau service : la numérotation quotidienne repart à 1
        const dailyNumber = data.serviceDay === serviceDay
          ? (data.dailyLast || 0) + 1
          : 1;

        transaction.set(counterRef, {
          globalLast: globalNumber,
          dailyLast: dailyNumber,
          serviceDay,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        return {
          id: globalNumber.toString().padStart(5, '0'),
          orderNumber: dailyNumber.toString().padStart(3, '0'),
          serviceDay,
        };
      });
    } catch (error) {
      console.error('❌ Erreur génération du numéro de commande:', error);
      // Repli : identifiant unique basé sur l'horodatage, sans numéro du jour
      const fallback = Date.now().toString().slice(-5);
      return { id: fallback, orderNumber: null, serviceDay };
    }
  };

  // Créer une nouvelle commande dans Firestore
  const createOrder = async (orderData) => {
    try {
      console.log('=== CREATING ORDER IN FIRESTORE ===');
      console.log('Order data:', orderData);

      const { id: orderId, orderNumber, serviceDay } = await generateOrderNumbers();
      const newOrder = {
        id: orderId,
        orderNumber,   // numéro affiché, remis à 1 chaque jour à 9h
        serviceDay,    // journée de service à laquelle la commande est rattachée
        customerName: orderData.customerName || 'Client',
        firstName: orderData.firstName || null,
        lastName: orderData.lastName || null,
        customerEmail: orderData.customerEmail || '',
        userId: orderData.userId || null,
        phone: orderData.phone || '',
        items: orderData.items,
        total: orderData.total,
        status: OrderStatus.PENDING,
        mode: orderData.mode,
        address: orderData.address || null,
        deliveryFee: orderData.deliveryFee || 0,
        paymentMethod: orderData.paymentMethod || null,
        orderTime: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        orderDate: new Date().toLocaleDateString('fr-FR'),
        createdAt: serverTimestamp(), // Utiliser serverTimestamp de Firestore
      };

      console.log('Creating order in Firestore:', newOrder);

      // Ajouter à Firestore - le listener mettra à jour automatiquement le state
      const docRef = await addDoc(ordersCollection, newOrder);
      console.log('✅ Order created in Firestore with ID:', docRef.id);

      // L'impression automatique se fait uniquement côté admin (voir dashboard.tsx)

      // Timer de 1 heure pour marquer la commande comme terminée automatiquement
      const ONE_HOUR_MS = 60 * 60 * 1000; // 1 heure en millisecondes
      setTimeout(async () => {
        try {
          // Vérifier si la commande existe toujours et n'est pas déjà terminée/annulée
          const orderDoc = doc(db, 'orders', docRef.id);
          const { getDoc } = await import('firebase/firestore');
          const orderSnapshot = await getDoc(orderDoc);

          if (orderSnapshot.exists()) {
            const currentOrder = orderSnapshot.data();
            // Ne pas modifier si déjà terminée ou annulée
            if (currentOrder.status !== OrderStatus.DELIVERED && currentOrder.status !== OrderStatus.CANCELLED) {
              await updateDoc(orderDoc, {
                status: OrderStatus.DELIVERED,
                updatedAt: serverTimestamp(),
                autoCompletedAt: serverTimestamp(),
                autoCompleted: true
              });
              console.log('✅ Commande', orderId, 'marquée comme terminée automatiquement après 1h');
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'auto-complétion de la commande:', error);
        }
      }, ONE_HOUR_MS);

      return { success: true, order: { ...newOrder, firestoreId: docRef.id } };
    } catch (error) {
      console.error('❌ Error creating order in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Mettre à jour le statut d'une commande dans Firestore
  const updateOrderStatus = async (orderId, newStatus, options = {}) => {
    try {
      console.log('=== UPDATING ORDER STATUS IN FIRESTORE ===');
      console.log('Order ID:', orderId, 'New status:', newStatus, 'Options:', options);

      // Trouver la commande par son ID
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.firestoreId) {
        throw new Error('Order not found or missing Firestore ID');
      }

      // Stocker temporairement l'info du changement manuel pour la synchronisation
      if (options.manualStatusChange && options.triggerRating) {
        console.log('🎯 [OrdersContext] Marquage changement manuel pour:', orderId);
        // Stocker dans AsyncStorage temporairement
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem(`@manual_status_change_${orderId}`, JSON.stringify({
            orderId,
            newStatus,
            timestamp: Date.now(),
            triggerRating: true
          }));
        } catch (error) {
          console.error('❌ Erreur stockage changement manuel:', error);
        }
      }

      // Mettre à jour dans Firestore avec les options
      const orderDoc = doc(db, 'orders', orderToUpdate.firestoreId);
      await updateDoc(orderDoc, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        // Ajouter les métadonnées du changement
        ...(options.manualStatusChange && {
          lastStatusChangeType: 'manual',
          manualStatusChangeAt: serverTimestamp()
        })
      });

      console.log('✅ Order status updated in Firestore');

      // Notifier le client si nécessaire
      try {
        await customerNotificationService.notifyCustomerStatusChange(
          orderId,
          newStatus,
          {
            mode: orderToUpdate.mode,
            customerName: orderToUpdate.customerName,
            estimatedTime: '15-30 min'
          }
        );
      } catch (notificationError) {
        console.warn('⚠️ Erreur notification client:', notificationError);
        // Ne pas faire échouer la mise à jour du statut si la notification échoue
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating order status in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Assigner une commande à un livreur dans Firestore
  const assignOrderToDelivery = async (orderId, deliveryUser) => {
    try {
      console.log('=== ASSIGNING ORDER TO DELIVERY IN FIRESTORE ===');

      // Trouver la commande par son ID
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.firestoreId) {
        throw new Error('Order not found or missing Firestore ID');
      }

      // Mettre à jour dans Firestore
      const orderDoc = doc(db, 'orders', orderToUpdate.firestoreId);
      await updateDoc(orderDoc, {
        assignedDelivery: {
          id: deliveryUser.id,
          name: deliveryUser.name,
          phone: deliveryUser.phone,
          assignedAt: serverTimestamp(),
        },
        status: OrderStatus.IN_DELIVERY,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Order assigned to delivery in Firestore');
      return { success: true };
    } catch (error) {
      console.error('❌ Error assigning order in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtenir les commandes disponibles pour livraison (prêtes et non assignées)
  const getAvailableDeliveryOrders = () => {
    return orders.filter(order => 
      order.mode === OrderMode.DELIVERY && 
      order.status === OrderStatus.READY && 
      !order.assignedDelivery
    );
  };

  // Obtenir les commandes assignées à un livreur spécifique
  const getOrdersForDelivery = (deliveryUserId) => {
    return orders.filter(order => 
      order.assignedDelivery && 
      order.assignedDelivery.id === deliveryUserId
    );
  };

  // Obtenir les commandes en cours de livraison par un livreur
  const getActiveDeliveryOrders = (deliveryUserId) => {
    return orders.filter(order => 
      order.assignedDelivery && 
      order.assignedDelivery.id === deliveryUserId &&
      order.status === OrderStatus.IN_DELIVERY
    );
  };

  // Supprimer une commande de Firestore
  const deleteOrder = async (orderId) => {
    try {
      console.log('=== DELETING ORDER FROM FIRESTORE ===');
      console.log('Order ID to delete:', orderId);

      // Trouver la commande par son ID
      const orderToDelete = orders.find(order => order.id === orderId);

      if (!orderToDelete) {
        throw new Error('Order not found');
      }

      // Utiliser firestoreId si disponible, sinon utiliser id directement
      const docId = orderToDelete.firestoreId || orderToDelete.id;
      console.log('Firestore doc ID:', docId);

      // Supprimer de Firestore
      const orderDoc = doc(db, 'orders', docId);
      await deleteDoc(orderDoc);

      console.log('✅ Order deleted from Firestore:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting order from Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Retirer un lot de commandes des archives admin.
  // On marque les documents plutôt que de les supprimer : les points de fidélité
  // et le chiffre d'affaires sont recalculés à partir de la collection 'orders',
  // une vraie suppression remettrait le solde des clients à zéro.
  const hideOrdersFromArchives = async (orderIds = []) => {
    try {
      console.log('=== HIDING ORDERS FROM ARCHIVES ===', orderIds.length, 'commande(s)');

      const docIds = orderIds
        .map(orderId => {
          const orderToHide = orders.find(order => order.id === orderId);
          if (!orderToHide) {
            console.warn('⚠️ Commande introuvable, ignorée:', orderId);
            return null;
          }
          return orderToHide.firestoreId || orderToHide.id;
        })
        .filter(Boolean);

      const results = await Promise.allSettled(
        docIds.map(docId =>
          updateDoc(doc(db, 'orders', docId), {
            hiddenFromArchives: true,
            hiddenFromArchivesAt: serverTimestamp(),
          })
        )
      );

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('❌ Échecs de masquage:', failed.length, failed[0].reason);
        return {
          success: false,
          hiddenCount: results.length - failed.length,
          error: `${failed.length} commande(s) n'ont pas pu être retirées des archives`,
        };
      }

      console.log('✅ Commandes retirées des archives:', docIds.length);
      return { success: true, hiddenCount: docIds.length };
    } catch (error) {
      console.error('❌ Error hiding orders from archives:', error);
      return { success: false, hiddenCount: 0, error: error.message };
    }
  };

  // Obtenir les commandes filtrées par statut
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  // Obtenir les commandes du jour
  const getTodayOrders = () => {
    const today = new Date().toLocaleDateString('fr-FR');
    return orders.filter(order => order.orderDate === today);
  };

  // Statistiques
  const getOrderStats = () => {
    const todayOrders = getTodayOrders();
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const ordersByStatus = {
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      preparing: orders.filter(o => o.status === OrderStatus.PREPARING).length,
      ready: orders.filter(o => o.status === OrderStatus.READY).length,
      inDelivery: orders.filter(o => o.status === OrderStatus.IN_DELIVERY).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    };

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      ordersByStatus,
    };
  };

  // Réinitialiser les commandes (pour le développement) - supprime tout de Firestore
  const clearAllOrders = async () => {
    try {
      console.log('=== CLEARING ALL ORDERS FROM FIRESTORE ===');

      // Récupérer tous les documents
      const snapshot = await getDocs(ordersCollection);

      // Supprimer chaque document
      const deletePromises = [];
      snapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'orders', document.id)));
      });

      await Promise.all(deletePromises);
      console.log('✅ All orders cleared from Firestore');

      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing orders from Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Plus besoin de forceUpdateOrders et refreshOrders - Firestore se synchronise automatiquement
  const refreshOrders = React.useCallback(() => {
    console.log('🔄 refreshOrders called - Firestore listener handles this automatically');
    // Le listener Firestore se charge automatiquement des mises à jour
  }, []);

  const value = {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    hideOrdersFromArchives,
    getOrdersByStatus,
    getTodayOrders,
    getOrderStats,
    clearAllOrders,
    refreshOrders,
    assignOrderToDelivery,
    getAvailableDeliveryOrders,
    getOrdersForDelivery,
    getActiveDeliveryOrders,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};