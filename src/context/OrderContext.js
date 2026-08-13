import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartLineId } from '../utils/cartItemKey';

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

  // Article offert par une récompense de fidélité (voir LoyaltyContext).
  //
  // L'ajout est idempotent : le panier vit en mémoire alors que la récompense
  // est enregistrée sur le profil, et l'écran du panier rejoue l'ajout au
  // démarrage pour reconstruire la ligne perdue. Une même récompense ne doit
  // jamais produire deux articles.
  const addRewardItem = (rewardItem) => {
    if (!rewardItem?.rewardId) return;

    setOrderItems(prevItems => {
      if (prevItems.some(item => item.rewardId === rewardItem.rewardId)) return prevItems;
      return [...prevItems, { ...rewardItem, cartLineId: getCartLineId(rewardItem), quantity: 1 }];
    });
  };

  const removeRewardItem = (rewardId) => {
    setOrderItems(prevItems => prevItems.filter(item => item.rewardId !== rewardId));
  };

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
    // Bloquer si le produit est marqué indisponible
    if (item.available === false) return;

    setOrderItems(prevItems => {
      // Chaque ajout crée sa propre ligne, même si un produit identique
      // (même personnalisation) est déjà dans le panier : le client et la
      // cuisine doivent voir chaque article séparément, jamais un compteur
      // partagé qui masque le détail par article.
      return [...prevItems, { ...item, cartLineId: getCartLineId(item), quantity: 1 }];
    });
  };

  const removeItem = (lineId) => {
    setOrderItems(prevItems => prevItems.filter(i => i.cartLineId !== lineId));
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderType(null);
    setOrderTotal(0);
  };

  const getItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  // L'identifiant de ligne est désormais un id unique indépendant du contenu
  // (voir cartItemKey.js) : éditer le commentaire ou les personnalisations
  // n'a plus besoin de le recalculer.
  const updateItemComment = (lineId, comment) => {
    setOrderItems(prevItems =>
      prevItems.map(item => (item.cartLineId === lineId ? { ...item, comment } : item))
    );
  };

  // Mettre à jour les personnalisations d'un item dans le panier
  const updateItemCustomizations = (lineId, customizations) => {
    setOrderItems(prevItems =>
      prevItems.map(item => (item.cartLineId === lineId ? { ...item, customizations } : item))
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
    
    // Ajouter les articles de la commande précédente, sans les articles offerts :
    // un cadeau de bienvenue ou une récompense de fidélité vaut pour la commande
    // qui l'a gagné. Les remettre au panier les redonnerait gratuitement, sans
    // première commande et sans dépenser le moindre point.
    const itemsToAdd = previousOrder.items
      .filter(item => !item.isLoyaltyReward && !item.isFirstOrderGift)
      .map(item => {
        const rebuilt = {
          id: item.id || `item_${Date.now()}_${Math.random()}`,
          name: item.name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          image: item.image || null, // Inclure l'image du produit
          description: item.description || ''
        };

        return { ...rebuilt, cartLineId: getCartLineId(rebuilt) };
      });

    setOrderItems(itemsToAdd);
  };

  // Calculer le total automatiquement
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(subtotal);
  }, [orderItems]);

  const value = {
    orderType,
    setOrderType,
    orderItems,
    setOrderItems,
    orderTotal,
    orderTypes,
    getCurrentOrderType,
    addItem,
    removeItem,
    clearOrder,
    getItemCount,
    updateItemComment,
    reorderItems,
    updateItemCustomizations,
    // Récompenses de fidélité
    addRewardItem,
    removeRewardItem
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};