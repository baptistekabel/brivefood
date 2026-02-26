import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEveningOnlyCategory, isEveningOnlyProduct, isEveningServiceAvailable } from '../utils/eveningRestriction';
import { useProducts } from './ProductsContext';
import { ProductCategory } from '../types';

const OrderContext = createContext();
const FIRST_ORDER_KEY = '@brivefood_has_ordered';

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { getProductsByCategory, products } = useProducts();
  const [orderType, setOrderType] = useState(null); // 'takeaway', 'delivery', 'dine-in'
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedFreeDessert, setSelectedFreeDessert] = useState(null);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [firstOrderCheeseAdded, setFirstOrderCheeseAdded] = useState(false);
  const firstOrderCheeseAddedRef = useRef(false);

  // Vérifier si c'est la première commande au chargement
  useEffect(() => {
    const checkFirstOrder = async () => {
      try {
        const hasOrdered = await AsyncStorage.getItem(FIRST_ORDER_KEY);
        setIsFirstOrder(hasOrdered !== 'true');
      } catch (error) {
        console.error('Erreur vérification première commande:', error);
        setIsFirstOrder(false);
      }
    };
    checkFirstOrder();
  }, []);

  // Marquer que l'utilisateur a commandé
  const markAsHasOrdered = async () => {
    try {
      await AsyncStorage.setItem(FIRST_ORDER_KEY, 'true');
      setIsFirstOrder(false);
    } catch (error) {
      console.error('Erreur marquage première commande:', error);
    }
  };

  // Options de sauces récupérées depuis Firebase (via un produit burger qui a les sauces)
  const sauceOptions = useMemo(() => {
    // Chercher un produit burger dans Firebase qui contient les options de sauce
    const burgers = getProductsByCategory(ProductCategory.BURGER) || [];
    const burgerWithSauce = burgers.find(p => p.customizationOptions?.sauce);
    if (burgerWithSauce?.customizationOptions?.sauce) {
      return { sauce: burgerWithSauce.customizationOptions.sauce };
    }
    // Fallback minimal si Firebase n'a pas encore chargé
    return {
      sauce: {
        title: 'Sauce',
        required: true,
        multiSelect: true,
        minSelection: 1,
        maxSelection: 2,
        options: [
          { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
        ]
      }
    };
  }, [products]);

  // Petit cheese offert pour la première commande
  const getFirstOrderCheese = () => ({
    id: 'first-order-cheese-offert',
    name: 'Petit Cheese Offert',
    description: 'Cadeau de bienvenue !',
    price: 0,
    originalPrice: 6.50,
    isFirstOrderGift: true,
    customizable: true,
    customizationOptions: sauceOptions,
    image: require('../../assets/images/nouveauxProduits/Cheese.png')
  });

  // Ajouter automatiquement le petit cheese si première commande
  const addFirstOrderCheese = () => {
    if (isFirstOrder && !firstOrderCheeseAddedRef.current) {
      firstOrderCheeseAddedRef.current = true;
      setFirstOrderCheeseAdded(true);
      const cheese = getFirstOrderCheese();
      setOrderItems(prevItems => {
        const alreadyHasCheese = prevItems.some(item => item.id === 'first-order-cheese-offert');
        if (!alreadyHasCheese) {
          return [...prevItems, { ...cheese, quantity: 1 }];
        }
        return prevItems;
      });
    }
  };

  // Supprimer le cheese offert si le panier est vidé
  const removeFirstOrderCheese = () => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== 'first-order-cheese-offert'));
    firstOrderCheeseAddedRef.current = false;
    setFirstOrderCheeseAdded(false);
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

    // Vérification de la restriction horaire
    if (!isEveningServiceAvailable()) {
      if (isEveningOnlyProduct(item.id) || (item.category && isEveningOnlyCategory(item.category))) {
        console.warn('Produit non disponible avant 18h:', item.name);
        return;
      }
    }

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);

      let newItems;
      if (existingItem) {
        newItems = prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1, comment: item.comment || i.comment }
            : i
        );
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }];
      }

      // Si c'est la première commande et qu'on n'a pas encore ajouté le cheese offert
      // et que c'est le premier article ajouté au panier
      if (isFirstOrder && !firstOrderCheeseAddedRef.current && !prevItems.some(i => i.id === 'first-order-cheese-offert')) {
        firstOrderCheeseAddedRef.current = true;
        const cheese = getFirstOrderCheese();
        newItems = [...newItems, { ...cheese, quantity: 1 }];
        setFirstOrderCheeseAdded(true);
      }

      return newItems;
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

  // Mettre à jour les personnalisations d'un item dans le panier
  const updateItemCustomizations = (itemId, customizations) => {
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, customizations }
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

  // Liste des desserts disponibles pour la promo — récupérés depuis Firebase
  const getAvailableDesserts = () => {
    const allDesserts = getProductsByCategory(ProductCategory.DESSERTS) || [];
    if (allDesserts.length > 0) {
      // Exclure les milkshakes (trop chers pour la promo) et prendre les desserts <= 6.90€
      return allDesserts
        .filter(d => d.price <= 6.90)
        .slice(0, 6)
        .map(d => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          value: d.price,
          image: d.image || null
        }));
    }
    // Fallback vide si Firebase n'a pas chargé
    return [];
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
    selectFreeDessert,
    // Première commande
    isFirstOrder,
    markAsHasOrdered,
    getFirstOrderCheese,
    firstOrderCheeseAdded,
    updateItemCustomizations,
    sauceOptions
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};