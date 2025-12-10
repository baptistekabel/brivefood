import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderStatus } from '../types';
import firebaseOrderSync from '../services/firebaseOrderSync';
import notificationService from '../services/notificationService';
import { registerCustomerForOrderNotifications } from '../services/customerNotificationService';
import orderRatingService from '../services/orderRatingService';
import { useOrders } from './OrdersContext';

const ActiveOrderContext = createContext();

// Variables globales pour les callbacks de rating
let globalOrderStatusChangeCallback = null;
let globalOrderRemovalCallback = null;

// Fonctions pour définir les callbacks
export const setOrderRatingCallbacks = (onStatusChange, onRemoval) => {
  globalOrderStatusChangeCallback = onStatusChange;
  globalOrderRemovalCallback = onRemoval;
};

export const useActiveOrder = () => {
  const context = useContext(ActiveOrderContext);
  if (!context) {
    throw new Error('useActiveOrder must be used within an ActiveOrderProvider');
  }
  return context;
};

export const ActiveOrderProvider = ({ children }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  // Utiliser le contexte Orders pour la synchronisation
  const { orders } = useOrders();

  // Ref pour garder une référence à jour de activeOrder dans le callback
  const activeOrderRef = useRef(null);

  // Mettre à jour la ref quand activeOrder change
  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  // Charger la commande active depuis AsyncStorage au démarrage
  useEffect(() => {
    loadActiveOrder();
  }, []);

  // Surveiller les changements de statut dans les commandes Firestore
  useEffect(() => {
    if (!activeOrder || !orders || orders.length === 0) return;

    console.log('🔄 [ActiveOrder] Vérification synchronisation avec', orders.length, 'commandes');

    // Trouver la commande correspondante dans la liste Firestore
    const updatedOrder = orders.find(order => order.id === activeOrder.id);

    if (updatedOrder) {
      console.log('🔄 [ActiveOrder] Commande trouvée:', updatedOrder.id, 'Statut local:', activeOrder.status, 'Statut Firebase:', updatedOrder.status);

      if (updatedOrder.status !== activeOrder.status) {
        console.log('🔄 [ActiveOrder] CHANGEMENT DE STATUT DÉTECTÉ:', activeOrder.status, '->', updatedOrder.status);

        const updatedActiveOrder = {
          ...activeOrder,
          status: updatedOrder.status
        };

        setActiveOrder(updatedActiveOrder);
        saveActiveOrder(updatedActiveOrder);

        // Notifier le contexte de notation du changement de statut
        if (globalOrderStatusChangeCallback) {
          // Vérifier s'il y a une info de changement manuel stockée
          const checkManualChange = async () => {
            try {
              const manualChangeData = await AsyncStorage.getItem(`@manual_status_change_${updatedOrder.id}`);
              let isManualChange = false;
              let shouldTriggerRating = false;

              if (manualChangeData) {
                const parsedData = JSON.parse(manualChangeData);
                // Vérifier si c'est récent (dans les 30 secondes)
                const isRecent = (Date.now() - parsedData.timestamp) < 30000;
                isManualChange = isRecent && parsedData.newStatus === updatedOrder.status;
                // Vérifier si c'est un statut terminé
                const completedStatuses = [OrderStatus.DELIVERED, OrderStatus.READY];
                const isCompletedStatus = completedStatuses.includes(updatedOrder.status);

                shouldTriggerRating = isManualChange && parsedData.triggerRating && isCompletedStatus;

                console.log('🔍 [ActiveOrder] Vérification changement manuel:');
                console.log('  - Données stockées:', parsedData);
                console.log('  - Est récent (<30s):', isRecent);
                console.log('  - Statut correspond:', parsedData.newStatus === updatedOrder.status);
                console.log('  - Statut actuel:', updatedOrder.status);
                console.log('  - Est statut terminé:', isCompletedStatus);
                console.log('  - isManualChange final:', isManualChange);
                console.log('  - shouldTriggerRating final:', shouldTriggerRating);

                // Nettoyer après utilisation
                if (isManualChange) {
                  await AsyncStorage.removeItem(`@manual_status_change_${updatedOrder.id}`);
                }
              }

              const statusChangeMetadata = {
                isManualChange,
                shouldTriggerRating,
                timestamp: new Date().toISOString()
              };

              console.log('🔄 [ActiveOrder] Callback avec métadonnées:', statusChangeMetadata);
              globalOrderStatusChangeCallback(updatedActiveOrder, updatedOrder.status, statusChangeMetadata);
            } catch (error) {
              console.error('❌ Erreur vérification changement manuel:', error);
              // Fallback sans métadonnées
              globalOrderStatusChangeCallback(updatedActiveOrder, updatedOrder.status, { isManualChange: false });
            }
          };

          checkManualChange();
        }

        // Note: La gestion des notations est maintenant entièrement gérée par OrderRatingContext
        // via le callback globalOrderStatusChangeCallback pour éviter la duplication

        // Note: La suppression automatique de la commande est désactivée
        // Le numéro de commande reste affiché pour permettre la notation
      }
    } else {
      console.log('🔄 [ActiveOrder] Commande non trouvée dans Firebase:', activeOrder.id);
    }
  }, [orders, activeOrder?.id, activeOrder?.status]);


  // Sauvegarder la commande active dans AsyncStorage
  const saveActiveOrder = async (order) => {
    try {
      if (order) {
        await AsyncStorage.setItem('@activeOrder', JSON.stringify(order));
      } else {
        await AsyncStorage.removeItem('@activeOrder');
      }
    } catch (error) {
      console.error('Error saving active order:', error);
    }
  };

  // Charger la commande active depuis AsyncStorage
  const loadActiveOrder = async () => {
    try {
      const storedOrder = await AsyncStorage.getItem('@activeOrder');
      if (storedOrder) {
        const order = JSON.parse(storedOrder);
        setActiveOrder(order);
      }
    } catch (error) {
      console.error('Error loading active order:', error);
    }
  };

  // Créer une commande en attente pour affichage dans le popup
  const createPendingOrder = (orderData) => {
    console.log('=== createPendingOrder ===');
    console.log('orderData:', orderData);

    const pendingOrderData = {
      orderId: orderData.id,
      customerName: orderData.customerName,
      items: orderData.items,
      total: orderData.total,
      mode: orderData.mode,
      address: orderData.address,
      phone: orderData.phone,
      paymentMethod: orderData.paymentMethod,
      orderTime: orderData.orderTime,
      orderDate: orderData.orderDate,
      waitTime: getEstimatedTime(orderData.mode)
    };

    console.log('pendingOrderData:', pendingOrderData);

    setPendingOrder(pendingOrderData);
    setShowConfirmationPopup(true);

    console.log('showConfirmationPopup should be true now');

    // Créer automatiquement la commande active (pour éviter que le user oublie de cliquer)
    setTimeout(async () => {
      console.log('🚀 ActiveOrder: Création automatique de la commande active');
      try {
        const newActiveOrder = {
          id: pendingOrderData.orderId,
          customerName: pendingOrderData.customerName,
          items: pendingOrderData.items,
          total: pendingOrderData.total,
          mode: pendingOrderData.mode,
          address: pendingOrderData.address,
          phone: pendingOrderData.phone,
          paymentMethod: pendingOrderData.paymentMethod,
          orderTime: pendingOrderData.orderTime,
          orderDate: pendingOrderData.orderDate,
          status: OrderStatus.PENDING,
          createdAt: new Date().toISOString(),
          estimatedTime: pendingOrderData.waitTime
        };

        console.log('🚀 ActiveOrder: Création automatique de la commande active:', newActiveOrder.id);
        setActiveOrder(newActiveOrder);
        await saveActiveOrder(newActiveOrder);
      } catch (error) {
        console.error('❌ Erreur création automatique commande active:', error);
      }
    }, 1000); // Attendre 1 seconde après la création de la pendingOrder
  };

  // Confirmer la commande en attente et créer la commande active
  const confirmPendingOrder = async () => {
    console.log('🚀 ActiveOrder: confirmPendingOrder appelée avec pendingOrder:', pendingOrder?.orderId);
    if (!pendingOrder) return { success: false, error: 'No pending order' };

    try {
      const newActiveOrder = {
        id: pendingOrder.orderId,
        customerName: pendingOrder.customerName,
        items: pendingOrder.items,
        total: pendingOrder.total,
        mode: pendingOrder.mode,
        address: pendingOrder.address,
        phone: pendingOrder.phone,
        paymentMethod: pendingOrder.paymentMethod,
        orderTime: pendingOrder.orderTime,
        orderDate: pendingOrder.orderDate,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        estimatedTime: pendingOrder.waitTime
      };

      console.log('🚀 ActiveOrder: Création de la commande active:', newActiveOrder.id);
      setActiveOrder(newActiveOrder);
      await saveActiveOrder(newActiveOrder);

      // Enregistrer le client pour recevoir des notifications push
      try {
        await notificationService.initialize();
        const customerToken = await notificationService.getPushToken();
        if (customerToken) {
          await registerCustomerForOrderNotifications(
            newActiveOrder.id,
            customerToken,
            {
              name: newActiveOrder.customerName,
              phone: newActiveOrder.phone,
            }
          );
          console.log(`✅ Client enregistré pour notifications: ${newActiveOrder.id}`);
        }
      } catch (notificationError) {
        console.warn('⚠️ Erreur enregistrement notifications client:', notificationError);
        // Ne pas faire échouer la commande si l'enregistrement des notifications échoue
      }

      // Nettoyer les états temporaires
      setPendingOrder(null);
      setShowConfirmationPopup(false);

      return { success: true };
    } catch (error) {
      console.error('Error confirming pending order:', error);
      return { success: false, error: error.message };
    }
  };

  // Annuler la commande en attente
  const cancelPendingOrder = () => {
    setPendingOrder(null);
    setShowConfirmationPopup(false);
  };

  // Mettre à jour le statut de la commande active
  const updateActiveOrderStatus = async (newStatus) => {
    if (!activeOrder) return { success: false, error: 'No active order' };

    try {
      const updatedOrder = {
        ...activeOrder,
        status: newStatus
      };

      setActiveOrder(updatedOrder);
      await saveActiveOrder(updatedOrder);

      return { success: true };
    } catch (error) {
      console.error('Error updating active order status:', error);
      return { success: false, error: error.message };
    }
  };

  // Terminer la commande active (la supprimer de l'affichage)
  const completeActiveOrder = async () => {
    try {
      const currentOrderId = activeOrder?.id;
      console.log('🗑️ ActiveOrder: Suppression de la commande active:', currentOrderId);

      setActiveOrder(null);
      await saveActiveOrder(null);

      // Notifier la suppression de la commande au contexte de notation
      if (currentOrderId && globalOrderRemovalCallback) {
        globalOrderRemovalCallback(currentOrderId);
      }

      console.log('✅ ActiveOrder: Commande active supprimée avec succès');
      return { success: true };
    } catch (error) {
      console.error('Error completing active order:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtenir le temps estimé selon le mode de commande
  const getEstimatedTime = (mode) => {
    switch (mode) {
      case 'dine_in':
        return '15-25 min';
      case 'takeout':
        return '15-25 min';
      case 'delivery':
        return '30-45 min';
      default:
        return '15-25 min';
    }
  };

  // Obtenir le texte de statut en français
  const getStatusText = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.READY:
        return 'Prête';
      case OrderStatus.IN_DELIVERY:
        return 'En livraison';
      case OrderStatus.DELIVERED:
        return 'Livrée';
      default:
        return 'En attente';
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#F59E0B'; // Orange
      case OrderStatus.PREPARING:
        return '#3B82F6'; // Bleu
      case OrderStatus.READY:
        return '#22C55E'; // Vert
      case OrderStatus.IN_DELIVERY:
        return '#8B5CF6'; // Violet
      case OrderStatus.DELIVERED:
        return '#10B981'; // Vert foncé
      default:
        return '#F59E0B';
    }
  };

  const value = {
    activeOrder,
    pendingOrder,
    showConfirmationPopup,
    createPendingOrder,
    confirmPendingOrder,
    cancelPendingOrder,
    updateActiveOrderStatus,
    completeActiveOrder,
    getStatusText,
    getStatusColor,
    refreshActiveOrder: loadActiveOrder,
  };

  return (
    <ActiveOrderContext.Provider value={value}>
      {children}
    </ActiveOrderContext.Provider>
  );
};