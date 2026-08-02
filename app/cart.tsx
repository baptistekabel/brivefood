import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Keyboard,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useFonts from '../src/hooks/useFonts';
import LoadingScreen from '../src/components/common/LoadingScreen';
import AddressInput from '../src/components/common/AddressInput';
import ProductImage from '../src/components/common/ProductImage';
import { findImageKey } from '../src/data/productImages';
import { getExpoProjectId } from '../src/utils/pushProject';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { OrderMode, PaymentMethod, ProductCategory } from '../src/types';
import { useOrder } from '../src/context/OrderContext';
import { useOrders } from '../src/context/OrdersContext';
import { useAuth } from '../src/context/AuthContext';
import { useLoyalty } from '../src/context/LoyaltyContext';
import { useActiveOrder } from '../src/context/ActiveOrderContext';
import { useProducts } from '../src/context/ProductsContext';
import notificationService from '../src/services/notificationService';
import { registerCustomerForOrderNotifications } from '../src/services/customerNotificationService';
import OrderConfirmationPopup from '../src/components/customer/OrderConfirmationPopup';
import * as Notifications from 'expo-notifications';
import { registerCustomerForBroadcast } from '../src/services/broadcastNotificationService';
import restaurantStatusService from '../src/services/restaurantStatusService';
import rushModeService from '../src/services/rushModeService';
import { isEveningServiceAvailable, EVENING_START_HOUR } from '../src/utils/eveningRestriction';
import { getWaitTimeLabel, isRushApplicable } from '../src/utils/waitTime';
import { sortCustomizationEntries } from '../src/utils/categoryUtils';
import {
  isPhoneOrderWindow,
  PHONE_ORDER_TITLE,
  PHONE_ORDER_MESSAGE,
  PHONE_ORDER_SHORT,
  RESTAURANT_PHONE_URI,
} from '../src/utils/phoneOrderWindow';

export default function CartScreen() {
  const fontsLoaded = useFonts();
  const { orderItems, removeItem, addItem, clearOrder, markAsHasOrdered, updateItemCustomizations, sauceOptions } = useOrder();
  const { createOrder } = useOrders();
  const { user, userProfile, isAuthenticated } = useAuth();
  const { getProductsByCategory } = useProducts();
  const {
    pendingOrder,
    showConfirmationPopup,
    createPendingOrder,
    confirmPendingOrder,
    cancelPendingOrder
  } = useActiveOrder();

  // Debug logs
  console.log('=== Cart Screen State ===');
  console.log('pendingOrder:', pendingOrder);
  console.log('showConfirmationPopup:', showConfirmationPopup);
  const {
    getAvailableRewardsForCart,
    useReward,
    cancelRewardUsage,
    confirmRewardUsage,
    calculateActiveRewardsDiscount,
    userLoyaltyData,
    rewards,
    POINTS_PER_EURO
  } = useLoyalty();

  // Aucun mode présélectionné : le client doit choisir explicitement
  const [orderMode, setOrderMode] = useState(null);
  // Affluence signalée par le restaurant : rallonge le délai annoncé
  const [rushMode, setRushMode] = useState({ active: false, extraMinutes: 0 });
  // Rafraîchi toutes les minutes pour débloquer la livraison dès 18h sans recharger l'écran
  const [deliveryAvailable, setDeliveryAvailable] = useState(isEveningServiceAvailable());
  // Créneau 1h50-2h : commandes uniquement par téléphone
  const [phoneOrderOnly, setPhoneOrderOnly] = useState(isPhoneOrderWindow());
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  // null = aucun tarif applicable (adresse hors zone, ou pas encore calculée).
  // 0 est une valeur légitime : l'admin peut offrir la livraison de proximité.
  const [dynamicDeliveryFee, setDynamicDeliveryFee] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CASH);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [itemComments, setItemComments] = useState({});
  const [showRecommendations, setShowRecommendations] = useState({
    drinks: true,
    desserts: true
  });
  // Envoi en cours : bloque un second appui pendant que la commande part.
  // Le ref porte la garde réelle (setState n'est pas immédiat, deux appuis dans
  // la même frame passeraient tous les deux), le state ne sert qu'à l'affichage.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  // Variables pour l'ancien modal (à supprimer plus tard)
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Références pour renvoyer l'utilisateur vers la section qui bloque la commande
  const cartListRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Descend en bas du panier, là où se trouvent le mode, le téléphone et l'adresse
  const scrollToOrderSection = () => {
    cartListRef.current?.scrollToEnd({ animated: true });
  };
  // Recommandations de boissons et desserts — récupérées directement depuis Firebase
  const recommendedDrinks = useMemo(() => {
    const allDrinks = getProductsByCategory(ProductCategory.BOISSONS);
    // Prendre les populaires en priorité, sinon les 6 premières
    const popular = allDrinks.filter(d => d.popular);
    return (popular.length >= 4 ? popular : allDrinks).slice(0, 6);
  }, [getProductsByCategory]);

  const recommendedDesserts = useMemo(() => {
    const allDesserts = getProductsByCategory(ProductCategory.DESSERTS);
    // Prendre les populaires en priorité, sinon les 6 premiers
    const popular = allDesserts.filter(d => d.popular);
    return (popular.length >= 4 ? popular : allDesserts).slice(0, 6);
  }, [getProductsByCategory]);

  // Affluence signalée par le restaurant, en temps réel
  useEffect(() => {
    const unsubscribe = rushModeService.subscribe(setRushMode);
    return () => unsubscribe && unsubscribe();
  }, []);

  // Vérifier l'ouverture du service de livraison toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryAvailable(isEveningServiceAvailable());
      setPhoneOrderOnly(isPhoneOrderWindow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Pre-fill phone number from user profile for all order modes
  useEffect(() => {
    if (!phoneNumber) {
      const profilePhone = userProfile?.phoneNumber || userProfile?.phone;
      if (profilePhone) {
        setPhoneNumber(profilePhone);
      }
    }
  }, [userProfile]);

  const formatPhoneNumber = (text) => {
    // Supprimer tous les caractères non numériques
    const numbers = text.replace(/\D/g, '');
    // Limiter à 10 chiffres maximum
    const limited = numbers.substring(0, 10);
    // Ajouter des espaces tous les 2 chiffres
    const formatted = limited.replace(/(\d{2})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Initialiser les commentaires avec ceux des produits
  useEffect(() => {
    const initialComments = {};
    orderItems.forEach(item => {
      if (item.comment) {
        // Indexé par ligne : deux fois le même produit avec des commentaires
        // différents ne doivent pas se recouvrir
        initialComments[item.cartLineId] = item.comment;
      }
    });
    setItemComments(prev => ({ ...prev, ...initialComments }));
  }, [orderItems]);

  // Initialiser l'affichage des recommandations basé sur le panier initial
  useEffect(() => {
    const hasDrinks = orderItems.some(item =>
      item.category === ProductCategory.BOISSONS ||
      item.name.toLowerCase().includes('boisson') ||
      item.name.toLowerCase().includes('coca') ||
      item.name.toLowerCase().includes('fanta') ||
      item.name.toLowerCase().includes('eau') ||
      item.name.toLowerCase().includes('sprite') ||
      item.name.toLowerCase().includes('milkshake')
    );

    const hasDesserts = orderItems.some(item =>
      item.category === ProductCategory.DESSERTS ||
      item.name.toLowerCase().includes('dessert') ||
      item.name.toLowerCase().includes('tiramisu') ||
      item.name.toLowerCase().includes('tarte') ||
      item.name.toLowerCase().includes('gaufre') ||
      item.name.toLowerCase().includes('milkshake')
    );

    setShowRecommendations({
      drinks: !hasDrinks,
      desserts: !hasDesserts
    });
  }, []); // Ne se déclenche qu'au montage initial

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const orderModes = [
    { id: OrderMode.DINE_IN, name: 'Sur place', icon: 'restaurant-outline' },
    { id: OrderMode.TAKEOUT, name: 'À emporter', icon: 'bag-outline' },
    { id: OrderMode.DELIVERY, name: 'Livraison', icon: 'bicycle-outline' },
  ];

  const paymentMethods = [
    { id: PaymentMethod.CASH, name: 'Espèces', icon: 'cash-outline' },
    { id: PaymentMethod.CARD, name: 'Carte bancaire', icon: 'card-outline' },
  ];

  const getSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Montant à facturer : `null` (hors zone) vaut 0 pour les calculs, le blocage
  // de la commande étant traité séparément par isDeliveryOutOfZone()
  const getDeliveryFee = () => {
    return orderMode === OrderMode.DELIVERY ? (dynamicDeliveryFee ?? 0) : 0;
  };

  // Une adresse est saisie mais aucun tarif ne s'y applique : hors zone.
  // Une livraison à 0 € reste une livraison valide.
  const isDeliveryOutOfZone = () =>
    orderMode === OrderMode.DELIVERY && !!deliveryAddress && dynamicDeliveryFee === null;

  const handleAddressSelect = (address) => {
    setDeliveryAddress(address);
  };

  const handleDeliveryFeeCalculated = (fee, distance) => {
    // getDeliveryFee() (utils) renvoie null hors zone : on conserve la
    // distinction avec une livraison offerte à 0 €
    setDynamicDeliveryFee(typeof fee === 'number' ? fee : null);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const rewardsDiscount = calculateActiveRewardsDiscount(subtotal, deliveryFee);
    return Math.max(0, subtotal + deliveryFee - rewardsDiscount.totalDiscount);
  };

  const canProceedToCheckout = () => {
    if (orderItems.length === 0) return false;
    if (!orderMode) return false;
    if (!phoneNumber.trim()) return false;
    if (orderMode === OrderMode.DELIVERY) {
      // La livraison démarre à 18h (sur place et à emporter restent toute la journée)
      if (!isEveningServiceAvailable()) return false;
      if (!deliveryAddress) return false;
      if (isDeliveryOutOfZone()) return false;
    }
    return true;
  };

  // Identifie ce qui empêche de commander, avec le message et l'action de correction
  // associés pour renvoyer le client vers la bonne section du panier
  const getCheckoutBlocker = () => {
    if (orderItems.length === 0) {
      return {
        title: 'Panier vide',
        message: 'Ajoutez au moins un produit avant de commander.',
        actionLabel: 'Voir le menu',
        action: () => router.push('/(tabs)/menu'),
      };
    }

    if (!orderMode) {
      return {
        title: 'Mode de commande requis',
        message: 'Choisissez sur place, à emporter ou livraison avant de valider votre commande.',
        actionLabel: 'Choisir',
        action: scrollToOrderSection,
      };
    }

    if (orderMode === OrderMode.DELIVERY && !isEveningServiceAvailable()) {
      return {
        title: 'Livraison indisponible',
        message: `La livraison démarre à ${EVENING_START_HOUR}h. Vous pouvez commander à emporter ou sur place dès maintenant.`,
        actionLabel: 'Passer à emporter',
        action: () => {
          setOrderMode(OrderMode.TAKEOUT);
          scrollToOrderSection();
        },
      };
    }

    if (!phoneNumber.trim()) {
      return {
        title: 'Téléphone requis',
        message: 'Nous avons besoin de votre numéro pour vous joindre au sujet de la commande.',
        actionLabel: 'Saisir mon numéro',
        action: () => {
          scrollToOrderSection();
          setTimeout(() => phoneInputRef.current?.focus(), 400);
        },
      };
    }

    if (orderMode === OrderMode.DELIVERY) {
      if (!deliveryAddress) {
        return {
          title: 'Adresse manquante',
          message: 'Indiquez votre adresse de livraison pour que nous puissions calculer les frais.',
          actionLabel: 'Saisir mon adresse',
          action: scrollToOrderSection,
        };
      }

      if (isDeliveryOutOfZone()) {
        return {
          title: 'Hors zone de livraison',
          message: 'Nous ne livrons pas à cette adresse (plus de 10 km). Vous pouvez modifier l\'adresse ou commander à emporter.',
          actionLabel: 'Passer à emporter',
          action: () => {
            setOrderMode(OrderMode.TAKEOUT);
            scrollToOrderSection();
          },
        };
      }
    }

    return null;
  };

  // Affiche la raison du blocage et propose d'aller corriger au bon endroit
  const explainCheckoutBlocker = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const blocker = getCheckoutBlocker();

    // Filet de sécurité : jamais de clic sans réponse
    if (!blocker) {
      Alert.alert(
        'Commande incomplète',
        'Vérifiez votre mode de commande, votre numéro de téléphone et votre adresse avant de valider.',
        [{ text: 'Vérifier', onPress: scrollToOrderSection }]
      );
      return;
    }

    Alert.alert(blocker.title, blocker.message, [
      { text: 'Annuler', style: 'cancel' },
      { text: blocker.actionLabel, onPress: blocker.action },
    ]);
  };

  const getWaitTime = () => {
    // Tant que le mode n'est pas choisi, le délai n'est pas connu
    return getWaitTimeLabel(orderMode, rushMode.extraMinutes) || '...';
  };

  // Fonction pour formater les personnalisations
  const formatCustomizations = (customizations, customizationOptions) => {
    if (!customizations || !customizationOptions) return null;

    const formattedCustomizations = [];

    sortCustomizationEntries(Object.entries(customizationOptions)).forEach(([categoryKey, category]) => {
      const selectedOptions = customizations[categoryKey] || [];
      if (category && selectedOptions.length > 0) {
        // Compter les occurrences pour afficher "x2" quand la même option
        // (ex: une viande) est sélectionnée plusieurs fois
        const counts = new Map();
        selectedOptions.forEach(optionId => {
          counts.set(optionId, (counts.get(optionId) || 0) + 1);
        });

        const selectedItems = Array.from(counts.entries()).map(([optionId, count]) => {
          const option = category.options.find(opt => opt.id === optionId);
          if (!option) return '';
          const namePart = count > 1 ? `${option.name} x${count}` : option.name;
          const totalPrice = option.price * count;
          return `${namePart}${totalPrice > 0 ? ` (+${totalPrice.toFixed(2)}€)` : ''}`;
        }).filter(Boolean);

        if (selectedItems.length > 0) {
          formattedCustomizations.push({
            categoryTitle: category.title,
            items: selectedItems
          });
        }
      }
    });

    return formattedCustomizations.length > 0 ? formattedCustomizations : null;
  };

  // Gérer l'utilisation d'une récompense
  const handleUseReward = async (reward) => {
    try {
      const subtotal = getSubtotal();
      const deliveryFee = getDeliveryFee();

      const result = await useReward(reward.id, subtotal, deliveryFee);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Error using reward:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible d\'utiliser cette récompense');
    }
  };

  // Annuler l'utilisation d'une récompense
  const handleCancelReward = async (rewardId) => {
    try {
      const result = await cancelRewardUsage(rewardId);
      if (result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Error canceling reward:', error);
    }
  };

  // Garde anti double-envoi. performCheckout enchaîne plusieurs await (statut du
  // restaurant, transaction du compteur de commandes) : sur un réseau lent, le
  // bouton restait actif et deux appuis créaient deux commandes et deux tickets.
  const handleCheckout = async () => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await performCheckout();
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const performCheckout = async () => {
    console.log('=== DEBUG CHECKOUT ===');
    console.log('orderItems.length:', orderItems.length);
    console.log('orderMode:', orderMode);
    console.log('deliveryAddress:', deliveryAddress);
    console.log('phoneNumber:', phoneNumber);
    console.log('dynamicDeliveryFee:', dynamicDeliveryFee);

    // Vérifier si le restaurant est ouvert
    try {
      const status = await restaurantStatusService.getStatus();
      if (status && !status.isOpen) {
        console.log('BLOCKED: Restaurant is closed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Entre 1h50 et 2h, la cuisine prend encore les commandes par téléphone
        if (isPhoneOrderWindow()) {
          Alert.alert(
            PHONE_ORDER_TITLE,
            PHONE_ORDER_MESSAGE,
            [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Appeler', onPress: () => Linking.openURL(RESTAURANT_PHONE_URI) },
            ]
          );
          return;
        }

        Alert.alert(
          'Restaurant fermé',
          status.reason || 'Le restaurant est actuellement fermé. Veuillez réessayer plus tard.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (e) {
      console.error('Erreur vérification statut restaurant:', e);
    }

    if (orderItems.length === 0) {
      console.log('BLOCKED: No items in cart');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!orderMode) {
      console.log('BLOCKED: No order mode selected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Mode de commande requis',
        'Choisissez sur place, à emporter ou livraison avant de valider votre commande.'
      );
      return;
    }

    if (orderMode === OrderMode.DELIVERY && !isEveningServiceAvailable()) {
      console.log('BLOCKED: Delivery before evening service');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Livraison indisponible',
        `La livraison est disponible à partir de ${EVENING_START_HOUR}h. Vous pouvez commander sur place ou à emporter.`
      );
      return;
    }

    if (orderMode === OrderMode.DELIVERY && !deliveryAddress) {
      console.log('BLOCKED: No delivery address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!phoneNumber.trim()) {
      console.log('BLOCKED: No phone number');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Téléphone requis', 'Veuillez saisir votre numéro de téléphone pour commander.');
      return;
    }

    if (isDeliveryOutOfZone()) {
      console.log('BLOCKED: address outside the delivery area');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Hors zone de livraison',
        'Nous ne livrons pas à cette adresse. Vous pouvez la modifier ou commander à emporter.'
      );
      return;
    }
    console.log('CHECKOUT PROCEEDING...');

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Créer la commande directement
    const orderData = {
      customerName: userProfile?.firstName && userProfile?.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.name || 'Client BriveFood',
      firstName: userProfile?.firstName,
      lastName: userProfile?.lastName,
      customerEmail: user?.email || null,
      userId: user?.uid || null,
      items: orderItems.map(item => {
        // Formater les personnalisations avec les noms pour l'impression
        let formattedOptions = null;
        if (item.customizations && item.customizationOptions) {
          const optionsList = [];
          sortCustomizationEntries(Object.entries(item.customizationOptions)).forEach(([categoryKey, category]) => {
            const selectedOptions = item.customizations[categoryKey];
            if (category && selectedOptions && selectedOptions.length > 0) {
              const categoryTitle = category.title || categoryKey;
              selectedOptions.forEach(optionId => {
                const option = category.options?.find(opt => opt.id === optionId);
                if (option) {
                  optionsList.push(`${categoryTitle}: ${option.name}${option.price > 0 ? ` (+${option.price.toFixed(2)}€)` : ''}`);
                }
              });
            }
          });
          if (optionsList.length > 0) {
            formattedOptions = optionsList.join(' | ');
          }
        }

        // Extraire l'ID de base du produit (sans le suffixe de taille)
        const baseProductId = item.id?.split('_')[0] || item.id;

        return {
          id: baseProductId, // ID du produit pour retrouver l'image
          productId: baseProductId, // Alias pour compatibilité
          // Référence d'image stable : le nom du produit porte le suffixe de taille
          // (« Tacos (L (2 viandes)) ») et ne permet plus de retrouver l'image
          imageKey: item.imageKey || findImageKey(item.image),
          firebaseImageUrl: item.firebaseImageUrl || null, // Image uploadée par l'admin
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize || null,
          price: item.price,
          comment: itemComments[item.cartLineId] || item.comment || null,
          customizations: item.customizations || null,
          customizationOptions: item.customizationOptions || null, // Pour afficher les noms lisibles
          options: formattedOptions // Options formatées pour l'impression
        };
      }),
      total: getTotal(),
      mode: orderMode,
      address: deliveryAddress?.label || null,
      deliveryFee: getDeliveryFee(),
      paymentMethod: orderMode === OrderMode.DELIVERY ? paymentMethod : null,
      phone: phoneNumber || userProfile?.phoneNumber || userProfile?.phone || null
    };

    const result = await createOrder(orderData);

    if (result.success) {
      // Marquer que l'utilisateur a commandé (pour la promo première commande)
      await markAsHasOrdered();

      // Confirmer l'utilisation des récompenses avec le numéro de commande
      // Une seule écriture pour toutes les récompenses : confirmées une par une,
      // chaque appel repartait du profil figé au rendu et annulait le précédent
      const rewardsDiscount = calculateActiveRewardsDiscount(getSubtotal(), getDeliveryFee());
      if (rewardsDiscount.hasActiveRewards) {
        await confirmRewardUsage(
          rewardsDiscount.rewardDiscounts.map(reward => reward.id),
          result.order.id
        );
      }

      // Créer une commande en attente pour affichage dans le popup
      // NE PAS vider le panier maintenant - attendre la confirmation
      createPendingOrder(result.order);

      // Demander les permissions de notifications après la première commande
      // si pas encore accordées
      setTimeout(async () => {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync({
              ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowAnnouncements: true,
              },
              android: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
              },
            });

            if (status === 'granted') {
              // Enregistrer le token pour les notifications broadcast
              if (user?.uid && userProfile?.role === 'customer') {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                  projectId: getExpoProjectId(),
                });

                if (tokenData?.data) {
                  await registerCustomerForBroadcast(user.uid, tokenData.data, {
                    name: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
                    email: userProfile.email,
                    phone: userProfile.phone,
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                  });
                  console.log('✅ Token client enregistré après première commande');
                }
              }

              Alert.alert(
                '🔔 Notifications activées',
                'Super ! Vous recevrez des notifications pour suivre vos commandes et découvrir nos offres exclusives.',
                [{ text: 'Parfait !', style: 'default' }]
              );
            }
          }
        } catch (error) {
          console.log('Erreur demande permissions notifications:', error);
        }
      }, 2000); // Attendre 2 secondes après la commande
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // On remonte la cause réelle : sans elle, impossible de distinguer une
      // coupure réseau d'un refus de Firestore
      console.error('❌ Échec création commande:', result.error);
      Alert.alert(
        'Commande non envoyée',
        `Votre commande n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez.`
          + (result.error ? `\n\nDétail : ${result.error}` : ''),
        [{ text: 'OK' }]
      );
    }
  };

  const addRecommendedItem = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(item);
  };

  const renderRecommendation = (item, type) => (
    <TouchableOpacity
      key={item.id}
      style={styles.recommendationItem}
      onPress={() => addRecommendedItem(item)}
    >
      <View style={styles.recommendationContent}>
        {/* ProductImage gère l'image Firebase, l'asset local et le logo de repli */}
        <ProductImage
          product={item}
          style={styles.recommendationImage}
          resizeMode="cover"
        />
        <View style={styles.recommendationInfo}>
          <Text style={styles.recommendationName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.recommendationPrice}>{item.price.toFixed(2)} €</Text>
        </View>
        <View style={styles.addRecommendationButton}>
          <Ionicons name="add" size={14} color={colors.neutral.white} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const navigateToCategory = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${category}`);
  };

  const hideRecommendationCategory = (category) => {
    setShowRecommendations(prev => ({
      ...prev,
      [category]: false
    }));
  };

  const renderRecommendations = () => {
    // Utiliser le state au lieu de la détection automatique
    const showDrinks = showRecommendations.drinks;
    const showDesserts = showRecommendations.desserts;

    if (!showDrinks && !showDesserts) {
      return null;
    }

    return (
      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsTitle}>Envie de compléter votre commande ?</Text>

        {showDrinks && (
          <View style={styles.recommendationCategory}>
            <View style={styles.recommendationCategoryHeader}>
              <View style={styles.categoryLeftSection}>
                <Ionicons name="restaurant" size={18} color="#000000" />
                <Text style={styles.recommendationCategoryTitle}>Boissons</Text>
              </View>
              <View style={styles.categoryRightSection}>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigateToCategory(ProductCategory.BOISSONS)}
                >
                  <Text style={styles.seeAllText}>Voir tout</Text>
                  <Ionicons name="chevron-forward" size={14} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hideButton}
                  onPress={() => hideRecommendationCategory('drinks')}
                >
                  <Ionicons name="close" size={16} color={colors.neutral.gray400} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={recommendedDrinks}
              renderItem={({ item }) => renderRecommendation(item, 'drink')}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsList}
            />
          </View>
        )}

        {showDesserts && (
          <View style={styles.recommendationCategory}>
            <View style={styles.recommendationCategoryHeader}>
              <View style={styles.categoryLeftSection}>
                <Ionicons name="ice-cream" size={18} color="#000000" />
                <Text style={styles.recommendationCategoryTitle}>Desserts</Text>
              </View>
              <View style={styles.categoryRightSection}>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigateToCategory(ProductCategory.DESSERTS)}
                >
                  <Text style={styles.seeAllText}>Voir tout</Text>
                  <Ionicons name="chevron-forward" size={14} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hideButton}
                  onPress={() => hideRecommendationCategory('desserts')}
                >
                  <Ionicons name="close" size={16} color={colors.neutral.gray400} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={recommendedDesserts}
              renderItem={({ item }) => renderRecommendation(item, 'dessert')}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsList}
            />
          </View>
        )}
      </View>
    );
  };

  // Toggle sauce pour le petit cheese offert
  const toggleGiftCheeseSauce = (lineId, sauceId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const item = orderItems.find(i => i.cartLineId === lineId);
    const currentSauces = item?.customizations?.sauce || [];
    const maxSelection = 2;

    let newSauces;
    if (currentSauces.includes(sauceId)) {
      newSauces = currentSauces.filter(s => s !== sauceId);
    } else {
      if (sauceId === 'pas-sauce') {
        newSauces = ['pas-sauce'];
      } else {
        newSauces = currentSauces.filter(s => s !== 'pas-sauce');
        if (newSauces.length >= maxSelection) {
          newSauces = [...newSauces.slice(1), sauceId];
        } else {
          newSauces = [...newSauces, sauceId];
        }
      }
    }

    updateItemCustomizations(lineId, {
      ...(item?.customizations || {}),
      sauce: newSauces
    });
  };

  const renderCartItem = ({ item }) => {
    const customizationDetails = formatCustomizations(item.customizations, item.customizationOptions);
    const isGiftCheese = item.isFirstOrderGift === true;
    const giftSauceOptions = isGiftCheese ? (item.customizationOptions?.sauce || sauceOptions?.sauce) : null;
    const selectedGiftSauces = isGiftCheese ? (item.customizations?.sauce || []) : [];

    return (
      <View key={item.cartLineId} style={styles.cartItem}>
        {/* Section principale avec image, infos et boutons */}
        <View style={styles.mainItemSection}>
          {/* Image du produit : ProductImage applique la même résolution que le
              reste de l'application (photo admin, puis asset local via imageKey,
              puis logo de repli). Le panier affichait `item.image` brut, seul
              écran à court-circuiter cette chaîne — d'où des visuels qui ne
              correspondaient pas au produit. */}
          <ProductImage
            product={item}
            style={styles.itemImage}
            resizeMode="cover"
          />

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
          </View>

          {/* Chaque ligne est un article distinct (jamais un compteur "x2") :
              un seul geste pour la retirer. Pour en ajouter un autre, il faut
              repasser par la fiche produit. */}
          <TouchableOpacity
            style={styles.removeItemButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              removeItem(item.cartLineId);
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.status.error} />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de sauce pour le petit cheese offert */}
        {isGiftCheese && giftSauceOptions && (
          <View style={styles.giftSauceSection}>
            <Text style={styles.giftSauceTitle}>
              {selectedGiftSauces.length === 0 ? '⚠️ Choisissez votre sauce :' : 'Sauce :'}
            </Text>
            <View style={styles.giftSauceGrid}>
              {giftSauceOptions.options.map((sauce) => {
                const isSelected = selectedGiftSauces.includes(sauce.id);
                return (
                  <TouchableOpacity
                    key={sauce.id}
                    style={[
                      styles.giftSauceChip,
                      isSelected && styles.giftSauceChipSelected
                    ]}
                    onPress={() => toggleGiftCheeseSauce(item.cartLineId, sauce.id)}
                  >
                    <Text style={[
                      styles.giftSauceChipText,
                      isSelected && styles.giftSauceChipTextSelected
                    ]}>
                      {sauce.name}{sauce.price > 0 ? ` +${sauce.price.toFixed(2)}€` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Section personnalisations */}
        {customizationDetails && !isGiftCheese && (
          <View style={styles.customizationDetails}>
            <Text style={styles.customizationTitle}>Personnalisations :</Text>
            {customizationDetails.map((category, index) => (
              <View key={index} style={styles.customizationCategory}>
                <Text style={styles.customizationCategoryName}>{category.categoryTitle} :</Text>
                {category.items.map((catItem, itemIndex) => (
                  <Text key={itemIndex} style={styles.customizationItem}>• {catItem}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

      </View>
    );
  };

  // Section fidélité du panier : solde, progression et récompenses utilisables
  const renderLoyaltySection = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.loyaltySection}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyHeaderLeft}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.loyaltyTitle}>Programme fidélité</Text>
            </View>
          </View>
          <Text style={styles.loyaltyEmptyText}>
            Connectez-vous pour cumuler {POINTS_PER_EURO} points par euro dépensé
            et débloquer des produits offerts.
          </Text>
        </View>
      );
    }

    const points = userLoyaltyData.currentPoints || 0;
    const activeRewards = calculateActiveRewardsDiscount(getSubtotal(), getDeliveryFee());
    const usableNow = getAvailableRewardsForCart(getSubtotal(), orderMode === OrderMode.DELIVERY);
    const usableIds = new Set(usableNow.map(r => r.id));

    // Récompenses que le solde permet mais que le mode de commande empêche
    const affordable = (rewards || []).filter(r => points >= r.points);
    const blockedByMode = affordable.filter(r => !usableIds.has(r.id));

    // Points que cette commande va rapporter (mêmes règles que le calcul du solde)
    const pointsFromOrder = Math.floor(getTotal() * POINTS_PER_EURO);
    const pointsAfterOrder = points + pointsFromOrder;

    // Prochain palier à atteindre
    const target = userLoyaltyData.nextRewardAt || 0;
    const nextReward = (rewards || [])
      .filter(r => r.points > points)
      .sort((a, b) => a.points - b.points)[0];
    const progress = target > 0 ? Math.min(points / target, 1) : 1;
    const projectedProgress = target > 0 ? Math.min(pointsAfterOrder / target, 1) : 1;
    const missing = nextReward ? Math.ceil(nextReward.points - points) : 0;
    const missingAfter = nextReward ? Math.ceil(nextReward.points - pointsAfterOrder) : 0;

    return (
      <View style={styles.loyaltySection}>
        <View style={styles.loyaltyHeader}>
          <View style={styles.loyaltyHeaderLeft}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.loyaltyTitle}>Programme fidélité</Text>
          </View>
          <View style={styles.loyaltyPointsBadge}>
            <Text style={styles.loyaltyPointsBadgeText}>{Math.floor(points)} pts</Text>
          </View>
        </View>

        {/* Récompense déjà appliquée à cette commande */}
        {activeRewards.hasActiveRewards && activeRewards.rewardDiscounts.map((reward) => (
          <View key={reward.id} style={styles.loyaltyAppliedCard}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <View style={styles.loyaltyAppliedInfo}>
              <Text style={styles.loyaltyAppliedTitle}>{reward.title}</Text>
              <Text style={styles.loyaltyAppliedSubtitle}>Récompense appliquée</Text>
            </View>
            <Text style={styles.loyaltyAppliedDiscount}>
              -{reward.discountAmount.toFixed(2)}€
            </Text>
            <TouchableOpacity
              style={styles.loyaltyRemoveButton}
              onPress={() => handleCancelReward(reward.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Points gagnés grâce à cette commande */}
        {pointsFromOrder > 0 && (
          <View style={styles.loyaltyEarnRow}>
            <Ionicons name="add-circle" size={18} color="#16A34A" />
            <Text style={styles.loyaltyEarnText}>
              Cette commande vous rapporte{' '}
              <Text style={styles.loyaltyEarnStrong}>+{pointsFromOrder} pts</Text>
            </Text>
          </View>
        )}

        {/* Progression vers la prochaine récompense */}
        {!activeRewards.hasActiveRewards && nextReward && (
          <View style={styles.loyaltyProgressBlock}>
            <View style={styles.loyaltyProgressBar}>
              {/* Position estimée une fois la commande validée */}
              <View style={[styles.loyaltyProgressProjected, { width: `${projectedProgress * 100}%` }]} />
              <View style={[styles.loyaltyProgressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.loyaltyProgressText}>
              {missingAfter <= 0 ? (
                <>
                  Après cette commande, «&nbsp;{nextReward.title}&nbsp;» sera{' '}
                  <Text style={styles.loyaltyProgressStrong}>débloquée</Text> !
                </>
              ) : (
                <>
                  Encore <Text style={styles.loyaltyProgressStrong}>{missingAfter} pts</Text> après
                  cette commande pour «&nbsp;{nextReward.title}&nbsp;»
                </>
              )}
            </Text>
          </View>
        )}

        {/* Récompenses utilisables maintenant */}
        {!activeRewards.hasActiveRewards && usableNow.length > 0 && (
          <View style={styles.loyaltyRewardsList}>
            {usableNow.map((reward) => (
              <View key={reward.id} style={styles.loyaltyRewardCard}>
                <View style={[styles.loyaltyRewardIcon, { backgroundColor: `${reward.color}20` }]}>
                  <Ionicons name={reward.icon} size={20} color={reward.color} />
                </View>

                <View style={styles.loyaltyRewardInfo}>
                  <Text style={styles.loyaltyRewardTitle}>{reward.title}</Text>
                  <Text style={styles.loyaltyRewardCost}>
                    {reward.points} pts
                    {reward.discountValue > 0 ? ` · vaut ${reward.discountValue.toFixed(2)}€` : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.loyaltyUseButton}
                  onPress={() => handleUseReward(reward)}
                >
                  <Text style={styles.loyaltyUseButtonText}>Utiliser</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Récompense atteinte mais incompatible avec le mode choisi */}
        {!activeRewards.hasActiveRewards && blockedByMode.map((reward) => (
          <View key={reward.id} style={styles.loyaltyBlockedCard}>
            <Ionicons name="information-circle-outline" size={16} color={colors.neutral.gray500} />
            <Text style={styles.loyaltyBlockedText}>
              « {reward.title} » est débloquée, disponible en mode livraison.
            </Text>
          </View>
        ))}

        <Text style={styles.loyaltyFooterHint}>
          1€ dépensé = {POINTS_PER_EURO} points
        </Text>
      </View>
    );
  };

  const renderOrderMode = ({ item }) => {
    // Seule la livraison est réservée au service du soir
    const isDeliveryRestricted = item.id === OrderMode.DELIVERY && !deliveryAvailable;
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.orderModeItem,
          orderMode === item.id && styles.selectedOrderMode,
          isDeliveryRestricted && { opacity: 0.4 }
        ]}
        onPress={() => {
          if (isDeliveryRestricted) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              'Livraison indisponible',
              `La livraison est disponible à partir de ${EVENING_START_HOUR}h. Sur place et à emporter restent disponibles toute la journée.`
            );
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOrderMode(item.id);
        }}
      >
        <Ionicons
          name={item.icon}
          size={24}
          color={orderMode === item.id ? colors.neutral.white : '#000000'}
        />
        <Text style={[
          styles.orderModeText,
          orderMode === item.id && styles.selectedOrderModeText
        ]}>
          {isDeliveryRestricted ? `Livraison (dès ${EVENING_START_HOUR}h)` : item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = ({ item }) => (
    <TouchableOpacity
      style={[styles.paymentMethodItem, paymentMethod === item.id && styles.selectedPaymentMethod]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPaymentMethod(item.id);
      }}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={paymentMethod === item.id ? colors.neutral.white : '#000000'} 
      />
      <Text style={[
        styles.paymentMethodText,
        paymentMethod === item.id && styles.selectedPaymentMethodText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="bag-outline" size={64} color={colors.neutral.gray300} />
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptyMessage}>
        Parcourez notre menu et ajoutez des délicieux plats à votre panier
      </Text>
      <TouchableOpacity
        style={styles.browseMenuButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.back();
        }}
      >
        <LinearGradient
          colors={['#000000', '#000000', '#000000']}
          style={styles.browseMenuGradient}
        >
          <Text style={styles.browseMenuText}>Parcourir le menu</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (orderItems.length === 0) {
    return (
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />
        {renderEmptyCart()}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#000000', '#000000']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Scrollable Content */}
      <FlatList
        ref={cartListRef}
        data={[1]} // dummy data pour utiliser FlatList comme ScrollView
        renderItem={() => (
          <>
            {/* Créneau 1h50-2h : la cuisine ne prend plus que par téléphone */}
            {phoneOrderOnly && (
              <TouchableOpacity
                style={styles.phoneOrderBanner}
                onPress={() => Linking.openURL(RESTAURANT_PHONE_URI)}
              >
                <Ionicons name="call" size={20} color="#B45309" />
                <Text style={styles.phoneOrderBannerText}>{PHONE_ORDER_SHORT}</Text>
                <Ionicons name="chevron-forward" size={18} color="#B45309" />
              </TouchableOpacity>
            )}

            {/* Cart Items */}
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>Votre commande</Text>
              {orderItems.map((item) => renderCartItem({ item }))}
            </View>

            {/* Recommendations */}
            {renderRecommendations()}

            {/* Programme fidélité */}
            {renderLoyaltySection()}

            {/* Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>{getSubtotal().toFixed(2)} €</Text>
              </View>

              {orderMode === OrderMode.DELIVERY && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frais de livraison</Text>
                  <Text style={styles.summaryValue}>{getDeliveryFee().toFixed(2)} €</Text>
                </View>
              )}

              {/* Loyalty Rewards Discount */}
              {(() => {
                const rewardsDiscount = calculateActiveRewardsDiscount(getSubtotal(), getDeliveryFee());
                if (rewardsDiscount.hasActiveRewards && rewardsDiscount.totalDiscount > 0) {
                  return (
                    <View style={styles.summaryRow}>
                      <View style={styles.discountLabelContainer}>
                        <Ionicons name="gift" size={16} color="#22C55E" />
                        <Text style={styles.discountLabel}>Récompenses fidélité</Text>
                      </View>
                      <Text style={styles.discountValue}>-{rewardsDiscount.totalDiscount.toFixed(2)} €</Text>
                    </View>
                  );
                }
                return null;
              })()}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Temps d'attente</Text>
                <Text style={[
                  styles.summaryValue,
                  rushMode.active && isRushApplicable(orderMode) && styles.summaryValueRush,
                ]}>
                  {getWaitTime()}
                </Text>
              </View>

              {/* Affluence : ne concerne que la livraison, le message n'apparaît
                  donc qu'une fois ce mode choisi */}
              {rushMode.active && isRushApplicable(orderMode) && (
                <View style={styles.rushNotice}>
                  <Ionicons name="flame" size={16} color="#C2410C" />
                  <Text style={styles.rushNoticeText}>
                    Forte affluence en ce moment : comptez environ {rushMode.extraMinutes} minutes
                    d'attente en plus. Merci de votre patience.
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{getTotal().toFixed(2)} €</Text>
              </View>
            </View>

            {/* Mode de commande : dernière étape avant de valider, aucun choix par défaut */}
            <View style={styles.orderModeSection}>
              <Text style={styles.sectionTitle}>Mode de commande *</Text>
              {!orderMode && (
                <Text style={styles.orderModeHint}>
                  Choisissez comment vous souhaitez recevoir votre commande
                </Text>
              )}
              {/* Empilés verticalement : les 3 modes restent visibles sans défilement */}
              <View style={styles.orderModeList}>
                {orderModes.map((item) => renderOrderMode({ item }))}
              </View>

              {/* Section téléphone obligatoire pour tous les modes */}
              <View style={styles.phoneSection}>
                <Text style={styles.phoneSectionTitle}>Numéro de téléphone *</Text>
                <View style={styles.phoneInputContainer}>
                  <Ionicons name="call-outline" size={20} color={colors.neutral.gray500} />
                  <TextInput
                    ref={phoneInputRef}
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      const formatted = formatPhoneNumber(text);
                      setPhoneNumber(formatted);
                    }}
                    placeholder="Ex: 06 12 34 56 78"
                    placeholderTextColor={colors.neutral.gray400}
                    keyboardType="phone-pad"
                    maxLength={14}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              </View>

              {orderMode === OrderMode.DELIVERY && (
                <>
                  <AddressInput
                    onAddressSelect={handleAddressSelect}
                    onDeliveryFeeCalculated={handleDeliveryFeeCalculated}
                  />

                  {/* Section mode de paiement pour livraison */}
                  <View style={styles.paymentMethodSection}>
                    <Text style={styles.paymentMethodTitle}>Mode de paiement</Text>
                    <Text style={styles.paymentMethodSubtitle}>Pour que le livreur s'organise pour le paiement</Text>
                    <FlatList
                      data={paymentMethods}
                      renderItem={renderPaymentMethod}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.paymentMethodList}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Checkout Button */}
            <View style={styles.checkoutSection}>
              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  (!canProceedToCheckout() || isSubmitting) && styles.checkoutButtonDisabled
                ]}
                disabled={isSubmitting}
                onPress={() => {
                  if (isSubmitting) return;
                  if (!canProceedToCheckout()) {
                    explainCheckoutBlocker();
                    return;
                  }
                  handleCheckout();
                }}
              >
                <LinearGradient
                  colors={canProceedToCheckout() && !isSubmitting ? ['#000000', '#000000', '#000000'] : ['#999', '#777', '#666']}
                  style={styles.checkoutGradient}
                >
                  <Text style={[
                    styles.checkoutText,
                    (!canProceedToCheckout() || isSubmitting) && styles.checkoutTextDisabled
                  ]}>
                    {isSubmitting
                      ? 'Envoi de la commande…'
                      : `Commander • ${getTotal().toFixed(2)} €`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
        keyExtractor={() => 'cart'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />


      {/* ANCIEN MODAL SUPPRIMÉ */}
      <Modal
        visible={false} // Ancien modal désactivé
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationModal}>
            <LinearGradient
              colors={orderConfirmation?.error ? ['#EF4444', '#DC2626'] : ['#22C55E', '#16A34A']}
              style={styles.confirmationHeader}
            >
              <View style={styles.successIconContainer}>
                <Ionicons
                  name={orderConfirmation?.error ? "alert-circle" : "checkmark-circle"}
                  size={80}
                  color="white"
                />
              </View>
              <Text style={styles.confirmationTitle}>
                {orderConfirmation?.error ? "Erreur" : "Commande confirmée !"}
              </Text>
            </LinearGradient>

            <View style={styles.confirmationBody}>
              {orderConfirmation?.error ? (
                <>
                  <Text style={styles.confirmationMessage}>
                    {orderConfirmation?.message}
                  </Text>
                  <Text style={styles.contactHint}>
                    Un problème ? Contactez-nous :
                  </Text>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL('mailto:brivefood@gmail.com?subject=Problème%20de%20commande');
                    }}
                  >
                    <Ionicons name="mail-outline" size={18} color="#4CAF50" />
                    <Text style={styles.contactButtonText}>brivefood@gmail.com</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmationButton}
                    onPress={() => {
                      setShowConfirmationModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E53']}
                      style={styles.confirmationButtonGradient}
                    >
                      <Text style={styles.confirmationButtonText}>Compris</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.confirmationMessage}>
                    Votre commande a bien été transmise
                  </Text>

                  {orderConfirmation && !orderConfirmation.error && (
                    <View style={styles.confirmationDetails}>
                      <View style={styles.confirmationRow}>
                        <Ionicons name="receipt" size={20} color="#000000" />
                        <Text style={styles.confirmationLabel}>Numéro :</Text>
                        <Text style={styles.confirmationValue}>#{orderConfirmation?.orderId}</Text>
                      </View>

                      <View style={styles.confirmationRow}>
                        <Ionicons name="bag" size={20} color="#000000" />
                        <Text style={styles.confirmationLabel}>Mode :</Text>
                        <Text style={styles.confirmationValue}>{orderConfirmation?.mode}</Text>
                      </View>

                      <View style={styles.confirmationRow}>
                        <Ionicons name="time" size={20} color="#000000" />
                        <Text style={styles.confirmationLabel}>Délai approximatif :</Text>
                        <Text style={styles.confirmationValue}>{orderConfirmation?.waitTime}</Text>
                      </View>

                      <View style={styles.confirmationRow}>
                        <Ionicons name="card" size={20} color="#000000" />
                        <Text style={styles.confirmationLabel}>Total :</Text>
                        <Text style={styles.confirmationValue}>{orderConfirmation?.total?.toFixed(2)} €</Text>
                      </View>
                    </View>
                  )}

                  <Text style={styles.thankYouText}>Merci pour votre confiance !</Text>

                  <TouchableOpacity
                    style={styles.confirmationButton}
                    onPress={() => {
                      setShowConfirmationModal(false);
                      router.back(); // Fermer le modal du panier et revenir à l'accueil
                    }}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E53']}
                      style={styles.confirmationButtonGradient}
                    >
                      <Text style={styles.confirmationButtonText}>Retour à l'accueil</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Popup de confirmation de commande */}
      <OrderConfirmationPopup
        visible={showConfirmationPopup}
        orderData={pendingOrder}
        onClose={cancelPendingOrder}
        onConfirm={async () => {
          // Confirmer la commande active
          await confirmPendingOrder();

          // Vider le panier après confirmation
          clearOrder();
          setItemComments({});

          // Fermer le modal du panier et retourner à l'accueil
          router.back();
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? spacing.xl + 40 : spacing.xl,
  },
  orderModeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
  },
  phoneOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  phoneOrderBannerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#B45309',
    lineHeight: 19,
  },
  orderModeHint: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  orderModeList: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  orderModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  selectedOrderMode: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  orderModeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
    marginLeft: spacing.xs,
  },
  selectedOrderModeText: {
    color: colors.neutral.white,
  },
  phoneSection: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
  },
  phoneSectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  phoneInput: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
  },
  paymentMethodSection: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
  },
  paymentMethodTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  paymentMethodSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  paymentMethodList: {
    paddingVertical: spacing.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPaymentMethod: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentMethodText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginLeft: spacing.xs,
  },
  selectedPaymentMethodText: {
    color: colors.neutral.white,
  },
  cartSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    paddingBottom: spacing.xl,
  },
  cartItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  mainItemSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.neutral.gray100,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  itemDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  customizationDetails: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  customizationTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  customizationCategory: {
    marginBottom: spacing.sm,
  },
  customizationCategoryName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  customizationItem: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
    lineHeight: typography.fontSizes.sm * 1.3,
    marginBottom: 2,
  },
  giftSauceSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  giftSauceTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  giftSauceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  giftSauceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.neutral.white,
  },
  giftSauceChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '15',
  },
  giftSauceChipText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  giftSauceChipTextSelected: {
    color: colors.primary.main,
    fontFamily: typography.fontFamily.semibold,
  },
  removeItemButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
  },
  summaryValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  summaryValueRush: {
    fontFamily: typography.fontFamily.bold,
    color: '#C2410C',
  },
  rushNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  rushNoticeText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#9A3412',
    lineHeight: 18,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  totalValue: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
  },
  checkoutButton: {
    borderRadius: borderRadius.lg,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  checkoutTextDisabled: {
    color: colors.neutral.gray300,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.base,
    marginBottom: spacing.xl,
  },
  browseMenuButton: {
    borderRadius: borderRadius.lg,
  },
  browseMenuGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  browseMenuText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Styles pour les recommandations
  recommendationsSection: {
    backgroundColor: colors.neutral.white,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  recommendationsTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  recommendationCategory: {
    marginBottom: spacing.md,
  },
  recommendationCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationCategoryTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
    marginLeft: spacing.xs,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  seeAllText: {
    fontSize: typography.fontSizes.sm,
    color: '#000000',
    marginRight: spacing.xs / 2,
  },
  hideButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.xs,
  },
  recommendationsList: {
    paddingRight: spacing.lg,
  },
  recommendationItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    width: 140,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  recommendationImage: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral.gray100,
  },
  recommendationInfo: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    flex: 1,
  },
  recommendationName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  recommendationPrice: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  addRecommendationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Styles pour le modal de confirmation personnalisé
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmationModal: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    elevation: 20,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  confirmationHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  successIconContainer: {
    marginBottom: spacing.md,
  },
  confirmationTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  confirmationBody: {
    padding: spacing.xl,
  },
  confirmationMessage: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  contactHint: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    padding: spacing.sm,
  },
  contactButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#4CAF50',
  },
  confirmationDetails: {
    marginBottom: spacing.xl,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  confirmationLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginLeft: spacing.sm,
    flex: 1,
  },
  confirmationValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  thankYouText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  confirmationButton: {
    borderRadius: borderRadius.lg,
  },
  confirmationButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  confirmationButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  // Styles pour les récompenses de fidélité
  rewardsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
    marginTop: spacing.sm,
  },

  // ── Programme fidélité (panier) ──
  loyaltySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  loyaltyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loyaltyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  loyaltyPointsBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  loyaltyPointsBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#FFD700',
  },
  loyaltyEmptyText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },

  // Progression
  loyaltyProgressBlock: {
    marginBottom: spacing.md,
  },
  loyaltyProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray200,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    justifyContent: 'center',
  },
  loyaltyProgressFill: {
    position: 'absolute',
    left: 0,
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  loyaltyProgressProjected: {
    position: 'absolute',
    left: 0,
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.35)',
  },

  // Points gagnés avec cette commande
  loyaltyEarnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  loyaltyEarnText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#15803D',
  },
  loyaltyEarnStrong: {
    fontFamily: typography.fontFamily.bold,
    color: '#15803D',
  },
  loyaltyProgressText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  loyaltyProgressStrong: {
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },

  // Récompenses utilisables
  loyaltyRewardsList: {
    gap: spacing.sm,
  },
  loyaltyRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  loyaltyRewardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  loyaltyRewardInfo: {
    flex: 1,
  },
  loyaltyRewardTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
  },
  loyaltyRewardCost: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  loyaltyUseButton: {
    backgroundColor: '#000000',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  loyaltyUseButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  // Récompense appliquée
  loyaltyAppliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.sm,
  },
  loyaltyAppliedInfo: {
    flex: 1,
  },
  loyaltyAppliedTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#15803D',
  },
  loyaltyAppliedSubtitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: '#16A34A',
    marginTop: 1,
  },
  loyaltyAppliedDiscount: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#16A34A',
  },
  loyaltyRemoveButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Récompense bloquée par le mode de commande
  loyaltyBlockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  loyaltyBlockedText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },

  loyaltyFooterHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  rewardsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsSectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
  },
  loyaltyPoints: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#FFD700',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  useRewardButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  useRewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  useRewardText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
    marginLeft: spacing.sm,
  },
  activeRewardsContainer: {
    gap: spacing.sm,
  },
  activeRewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  activeRewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeRewardTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#22C55E',
    marginLeft: spacing.sm,
  },
  activeRewardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeRewardDiscount: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#22C55E',
  },
  cancelRewardButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRewardsContainer: {
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
  },
  noRewardsText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  discountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountLabel: {
    fontSize: typography.fontSizes.base,
    color: '#22C55E',
    marginLeft: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  discountValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#22C55E',
  },

  // Styles pour le modal de récompenses
  rewardsList: {
    paddingBottom: spacing.xl,
  },
  rewardOption: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  rewardOptionGradient: {
    padding: spacing.lg,
  },
  rewardOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardOptionHeader: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  rewardIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardPointsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  rewardPointsText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  rewardOptionInfo: {
    flex: 1,
  },
  rewardOptionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  rewardOptionDescription: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  rewardOptionValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  rewardArrow: {
    marginLeft: spacing.sm,
  },
  selectedRewardOption: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  rewardModalActions: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  confirmRewardButton: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  confirmRewardGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  confirmRewardText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  cancelRewardModalButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelRewardModalText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
});