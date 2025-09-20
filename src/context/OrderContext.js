import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orderType, setOrderType] = useState(null); // 'takeaway', 'delivery', 'dine-in'
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedFreeDessert, setSelectedFreeDessert] = useState(null);

  // Types de commande avec leurs informations
  const orderTypes = {
    takeaway: {
      id: 'takeaway',
      title: 'À EMPORTER',
      icon: 'bag-outline',
      color: '#22C55E',
      gradient: ['#22C55E', '#16A34A'],
      description: 'Récupérez votre commande au restaurant'
    },
    delivery: {
      id: 'delivery',
      title: 'LIVRAISON',
      icon: 'bicycle',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
      description: 'Livraison à votre domicile'
    },
    'dine-in': {
      id: 'dine-in',
      title: 'SUR PLACE',
      icon: 'restaurant-outline',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
      description: 'Dégustez dans notre restaurant'
    }
  };

  const getCurrentOrderType = () => {
    return orderType ? orderTypes[orderType] : null;
  };

  const addItem = (item) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1, comment: item.comment || i.comment }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemId) => {
    setOrderItems(prevItems => {
      const item = prevItems.find(i => i.id === itemId);
      if (item && item.quantity > 1) {
        return prevItems.map(i => 
          i.id === itemId 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      } else {
        return prevItems.filter(i => i.id !== itemId);
      }
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderType(null);
    setOrderTotal(0);
    setPromoApplied(false);
    setSelectedFreeDessert(null);
  };

  const getItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const updateItemComment = (itemId, comment) => {
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, comment: comment }
          : item
      )
    );
  };

  // Fonction pour recommander (remettre une commande dans le panier)
  const reorderItems = (previousOrder) => {
    if (!previousOrder || !previousOrder.items) return;
    
    // Vider le panier actuel
    setOrderItems([]);
    
    // Récupérer le type de commande (convertir le format si nécessaire)
    let orderMode = previousOrder.mode;
    if (orderMode === 'delivery') orderMode = 'delivery';
    else if (orderMode === 'takeout') orderMode = 'takeaway';
    else if (orderMode === 'dine_in') orderMode = 'dine-in';
    
    setOrderType(orderMode);
    
    // Ajouter tous les articles de la commande précédente
    const itemsToAdd = previousOrder.items.map(item => ({
      id: item.id || `item_${Date.now()}_${Math.random()}`,
      name: item.name,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
      image: item.image || null, // Inclure l'image du produit
      description: item.description || ''
    }));
    
    setOrderItems(itemsToAdd);
  };

  // Fonction pour vérifier et appliquer la promo
  const checkAndApplyPromo = (subtotal) => {
    const PROMO_THRESHOLD = 20;
    const shouldApplyPromo = subtotal >= PROMO_THRESHOLD;

    if (shouldApplyPromo && !promoApplied) {
      setPromoApplied(true);
    } else if (!shouldApplyPromo && promoApplied) {
      setPromoApplied(false);
    }

    return shouldApplyPromo;
  };

  // Liste des desserts disponibles pour la promo
  const getAvailableDesserts = () => {
    return [
      {
        id: 'tiramisu-nutella',
        name: 'Tiramisu Nutella spéculoos',
        description: 'Fait maison',
        value: 4.50,
        image: require('../../assets/images/desserts/tiramisuNutellaSpeculos.png')
      },
      {
        id: 'tiramisu-oreo',
        name: 'Tiramisu Oréo',
        description: 'Fait Maison',
        value: 4.50,
        image: require('../../assets/images/desserts/tiramisuOreo.png')
      },
      {
        id: 'tiramisu-speculoos',
        name: 'Tiramisu Speculoos Caramel',
        description: 'Fait Maison',
        value: 4.50,
        image: require('../../assets/images/desserts/tiramisuSpeculosCaramel.png')
      },
      {
        id: 'tarte-daim',
        name: 'Tarte Daim',
        description: 'Tarte Daim',
        value: 4.50,
        image: require('../../assets/images/desserts/tarteDaim.png')
      },
      {
        id: 'gaufre',
        name: 'Gaufre',
        description: 'Parfum au choix',
        value: 6.90,
        image: require('../../assets/images/desserts/Gaufre.png')
      }
    ];
  };

  // Fonction pour sélectionner le dessert gratuit
  const selectFreeDessert = (dessert) => {
    setSelectedFreeDessert(dessert);
  };

  // Fonction pour obtenir les détails de la promo
  const getPromoDetails = () => {
    const availableDesserts = getAvailableDesserts();
    return {
      isActive: promoApplied,
      threshold: 20,
      description: "Dessert offert dès 20€ d'achat",
      selectedDessert: selectedFreeDessert,
      availableDesserts: availableDesserts,
      needsSelection: promoApplied && !selectedFreeDessert
    };
  };

  // Calculer le total automatiquement
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkAndApplyPromo(subtotal);
    setOrderTotal(subtotal);
  }, [orderItems, promoApplied]);

  const value = {
    orderType,
    setOrderType,
    orderItems,
    setOrderItems,
    orderTotal,
    promoApplied,
    selectedFreeDessert,
    orderTypes,
    getCurrentOrderType,
    addItem,
    removeItem,
    clearOrder,
    getItemCount,
    updateItemComment,
    reorderItems,
    getPromoDetails,
    checkAndApplyPromo,
    getAvailableDesserts,
    selectFreeDessert
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};