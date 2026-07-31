import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from './ProductsContext';
import { useAuth } from './AuthContext';
import { ProductCategory } from '../types';
import { getCartLineId, resolveCartLineId } from '../utils/cartItemKey';

const OrderContext = createContext();
const FIRST_ORDER_KEY = '@brivefood_has_ordered';
// Identifiant de la ligne « cadeau de bienvenue », utilisé pour la reconnaître
// dans le panier sans dépendre de son nom
const FIRST_ORDER_GIFT_ID = 'first-order-cheese-offert';

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { getProductsByCategory, products } = useProducts();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [orderType, setOrderType] = useState(null); // 'takeaway', 'delivery', 'dine-in'
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [firstOrderCheeseAdded, setFirstOrderCheeseAdded] = useState(false);
  const firstOrderCheeseAddedRef = useRef(false);
  // null tant que la lecture locale n'a pas répondu
  const [deviceHasOrdered, setDeviceHasOrdered] = useState(null);

  // Marque locale, conservée en complément du compte : elle couvre les
  // commandes passées sans être connecté, et protège les clients existants qui
  // n'ont pas encore le champ `hasOrdered` sur leur profil.
  useEffect(() => {
    AsyncStorage.getItem(FIRST_ORDER_KEY)
      .then(value => setDeviceHasOrdered(value === 'true'))
      .catch(error => {
        console.error('Erreur vérification première commande:', error);
        setDeviceHasOrdered(false);
      });
  }, []);

  // Éligibilité au cadeau de bienvenue : ni le compte ni l'appareil n'ont déjà
  // commandé. Le suivi par compte évite qu'une réinstallation ou un changement
  // de téléphone redonne le cadeau — l'ancien suivi purement local le permettait.
  const accountHasOrdered = userProfile?.hasOrdered === true;
  const isFirstOrder = deviceHasOrdered === false && !accountHasOrdered;

  useEffect(() => {
    if (deviceHasOrdered === null) return; // lecture AsyncStorage pas encore résolue
    console.log('🎁 Eligibilité cadeau —', {
      deviceHasOrdered,
      accountHasOrdered,
      firestoreHasOrderedField: userProfile?.hasOrdered,
      userId: user?.uid || null,
      isFirstOrder,
    });
  }, [deviceHasOrdered, accountHasOrdered, user?.uid]);

  // Marquer que l'utilisateur a commandé
  const markAsHasOrdered = async () => {
    try {
      await AsyncStorage.setItem(FIRST_ORDER_KEY, 'true');
      setDeviceHasOrdered(true);
      console.log('🎁 markAsHasOrdered: flag appareil posé');
    } catch (error) {
      console.error('🎁 Erreur marquage première commande (appareil):', error);
    }

    // Rattaché au compte : suit le client d'un appareil à l'autre. Une seule
    // écriture ratée (réseau, etc.) rendait le cadeau éternel sur ce compte
    // sur un nouvel appareil, sans le moindre signal visible : on réessaie
    // une fois avant d'abandonner, et on logue le résultat dans tous les cas.
    if (user) {
      let result = await updateUserProfile({ hasOrdered: true });
      if (!result?.success) {
        console.error('🎁 Erreur marquage première commande (compte), nouvelle tentative:', result?.error);
        result = await updateUserProfile({ hasOrdered: true });
      }
      if (!result?.success) {
        console.error('🎁 Echec définitif du marquage première commande (compte):', result?.error);
      } else {
        console.log('🎁 markAsHasOrdered: hasOrdered=true écrit sur le compte', user.uid);
      }
    } else {
      console.log('🎁 markAsHasOrdered: pas de compte connecté, seul le flag appareil est posé');
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
    id: FIRST_ORDER_GIFT_ID,
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
        const alreadyHasCheese = prevItems.some(item => item.id === FIRST_ORDER_GIFT_ID);
        if (!alreadyHasCheese) {
          return [...prevItems, { ...cheese, cartLineId: getCartLineId(cheese), quantity: 1 }];
        }
        return prevItems;
      });
    }
  };

  // Rattrapage : `isFirstOrder` vaut false le temps de lire AsyncStorage. Un
  // client qui ajoutait un produit pendant cette lecture — le cas normal au
  // démarrage à froid — n'obtenait jamais son cadeau, puisque l'ajout du cadeau
  // n'est tenté qu'au moment où un article entre dans le panier.
  useEffect(() => {
    if (!isFirstOrder) return;
    if (orderItems.length === 0) return;
    if (firstOrderCheeseAddedRef.current) return;

    addFirstOrderCheese();
  }, [isFirstOrder, orderItems.length]);

  // Panier vidé : le cadeau redevient disponible. Le drapeau n'était remis à
  // zéro nulle part, si bien qu'un client qui vidait son panier avant de le
  // refaire perdait le cadeau pour le reste de la session, sans avoir rien
  // commandé.
  useEffect(() => {
    if (orderItems.length > 0) return;

    firstOrderCheeseAddedRef.current = false;
    setFirstOrderCheeseAdded(false);
  }, [orderItems.length]);

  // Le client se connecte en cours de route et son compte a déjà commandé :
  // on retire le cadeau ajouté avant de savoir à qui on avait affaire.
  useEffect(() => {
    if (isFirstOrder) return;

    setOrderItems(prevItems => {
      if (!prevItems.some(item => item.id === FIRST_ORDER_GIFT_ID)) return prevItems;
      return prevItems.filter(item => item.id !== FIRST_ORDER_GIFT_ID);
    });
  }, [isFirstOrder]);

  // Supprimer le cheese offert si le panier est vidé
  const removeFirstOrderCheese = () => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== FIRST_ORDER_GIFT_ID));
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

    // Deux personnalisations différentes du même produit sont deux lignes
    // distinctes : elles n'ont ni le même prix ni la même recette en cuisine.
    const cartLineId = resolveCartLineId(item);

    // Décidé AVANT la mise à jour : un updateur d'état doit rester pur, or il
    // portait ici deux effets de bord (le ref et setFirstOrderCheeseAdded).
    // React 19 réexécute les updateurs en mode strict, ce qui les rejouait.
    const shouldAddGift = isFirstOrder && !firstOrderCheeseAddedRef.current;
    if (shouldAddGift) {
      firstOrderCheeseAddedRef.current = true;
      setFirstOrderCheeseAdded(true);
    }

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i.cartLineId === cartLineId);

      let newItems;
      if (existingItem) {
        newItems = prevItems.map(i =>
          i.cartLineId === cartLineId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...prevItems, { ...item, cartLineId, quantity: 1 }];
      }

      // Si c'est la première commande et qu'on n'a pas encore ajouté le cheese offert
      if (shouldAddGift && !prevItems.some(i => i.id === FIRST_ORDER_GIFT_ID)) {
        const cheese = getFirstOrderCheese();
        newItems = [...newItems, { ...cheese, cartLineId: getCartLineId(cheese), quantity: 1 }];
      }

      return newItems;
    });
  };

  const removeItem = (lineId) => {
    setOrderItems(prevItems => {
      const item = prevItems.find(i => i.cartLineId === lineId);
      if (item && item.quantity > 1) {
        return prevItems.map(i =>
          i.cartLineId === lineId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      } else {
        return prevItems.filter(i => i.cartLineId !== lineId);
      }
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderType(null);
    setOrderTotal(0);
  };

  const getItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Le commentaire et les personnalisations font partie de l'identité de la
  // ligne : on recalcule la clé après modification, sinon la ligne éditée ne
  // serait plus retrouvée par les boutons + / − et par la suppression.
  const updateItemComment = (lineId, comment) => {
    setOrderItems(prevItems =>
      prevItems.map(item => {
        if (item.cartLineId !== lineId) return item;
        const updated = { ...item, comment };
        return { ...updated, cartLineId: getCartLineId(updated) };
      })
    );
  };

  // Mettre à jour les personnalisations d'un item dans le panier
  const updateItemCustomizations = (lineId, customizations) => {
    setOrderItems(prevItems =>
      prevItems.map(item => {
        if (item.cartLineId !== lineId) return item;
        const updated = { ...item, customizations };
        return { ...updated, cartLineId: getCartLineId(updated) };
      })
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
    const itemsToAdd = previousOrder.items.map(item => {
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