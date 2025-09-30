import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderStatus } from '../types';
import firebaseOrderSync from '../services/firebaseOrderSync';
import notificationService from '../services/notificationService';
import { registerCustomerForOrderNotifications } from '../services/customerNotificationService';

const ActiveOrderContext = createContext();

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

  // Charger la commande active depuis AsyncStorage au démarrage
  useEffect(() => {
    loadActiveOrder();
  }, []);

  // Synchroniser le statut de la commande active avec Firebase
  useEffect(() => {
    if (!activeOrder) return;

    // Écouter les changements de statut pour cette commande
    const syncActiveOrderStatus = (allOrders) => {
      if (!activeOrder || !allOrders || allOrders.length === 0) return;

      // Trouver la commande correspondante dans la liste Firebase
      const updatedOrder = allOrders.find(order => order.id === activeOrder.id);

      if (updatedOrder && updatedOrder.status !== activeOrder.status) {
        console.log(`🔄 [ActiveOrder] Status sync: ${activeOrder.status} -> ${updatedOrder.status}`);

        // Mettre à jour le statut localement
        setActiveOrder(prev => ({
          ...prev,
          status: updatedOrder.status
        }));

        // Sauvegarder la mise à jour
        saveActiveOrder({
          ...activeOrder,
          status: updatedOrder.status
        });

        // Si la commande est terminée, la supprimer automatiquement après 3 secondes
        if (updatedOrder.status === OrderStatus.DELIVERED) {
          setTimeout(() => {
            completeActiveOrder();
          }, 3000);
        }
      }
    };

    // Démarrer l'écoute
    const listener = firebaseOrderSync.listenForAllOrders(syncActiveOrderStatus);

    // Cleanup
    return () => {
      if (listener) {
        firebaseOrderSync.stopListening('allOrders');
      }
    };
  }, [activeOrder?.id]); // Re-sync quand l'ID de la commande change

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
  };

  // Confirmer la commande en attente et créer la commande active
  const confirmPendingOrder = async () => {
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
      setActiveOrder(null);
      await saveActiveOrder(null);

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
        return '20 min';
      case 'takeout':
        return '20 min';
      case 'delivery':
        return '45 min';
      default:
        return '20 min';
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