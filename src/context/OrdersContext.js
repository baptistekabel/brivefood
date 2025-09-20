import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderStatus, OrderMode } from '../types';

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

  // Charger les commandes depuis AsyncStorage au démarrage
  useEffect(() => {
    loadOrders();
  }, []);

  // Sauvegarder les commandes dans AsyncStorage
  const saveOrders = async (ordersToSave) => {
    try {
      await AsyncStorage.setItem('@orders', JSON.stringify(ordersToSave));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  // Charger les commandes depuis AsyncStorage
  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('@orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Générer un numéro de commande séquentiel
  const generateOrderId = async () => {
    try {
      // Récupérer le dernier numéro de commande
      const lastOrderNumber = await AsyncStorage.getItem('@lastOrderNumber');
      let nextOrderNumber = 1;

      if (lastOrderNumber) {
        nextOrderNumber = parseInt(lastOrderNumber, 10) + 1;
      }

      // Sauvegarder le nouveau numéro
      await AsyncStorage.setItem('@lastOrderNumber', nextOrderNumber.toString());

      // Formatter avec des zéros devant (00001, 00002, etc.)
      return nextOrderNumber.toString().padStart(5, '0');
    } catch (error) {
      console.error('Error generating order ID:', error);
      // En cas d'erreur, utiliser timestamp comme fallback
      const fallback = Date.now().toString().slice(-5);
      return fallback.padStart(5, '0');
    }
  };

  // Créer une nouvelle commande
  const createOrder = async (orderData) => {
    try {
      const orderId = await generateOrderId();
      const newOrder = {
        id: orderId,
        customerName: orderData.customerName || 'Client',
        customerEmail: orderData.customerEmail || '',
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
        createdAt: new Date().toISOString(),
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);

      return { success: true, order: newOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  };

  // Assigner une commande à un livreur
  const assignOrderToDelivery = async (orderId, deliveryUser) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { 
          ...order, 
          assignedDelivery: {
            id: deliveryUser.id,
            name: deliveryUser.name,
            phone: deliveryUser.phone,
            assignedAt: new Date().toISOString(),
          },
          status: OrderStatus.IN_DELIVERY 
        } : order
      );
      
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning order:', error);
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

  // Supprimer une commande
  const deleteOrder = async (orderId) => {
    try {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
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

  // Réinitialiser les commandes (pour le développement)
  const clearAllOrders = async () => {
    try {
      setOrders([]);
      await AsyncStorage.removeItem('@orders');
      return { success: true };
    } catch (error) {
      console.error('Error clearing orders:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByStatus,
    getTodayOrders,
    getOrderStats,
    clearAllOrders,
    refreshOrders: loadOrders,
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