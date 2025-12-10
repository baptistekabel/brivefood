import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useFonts from '../src/hooks/useFonts';
import LoadingScreen from '../src/components/common/LoadingScreen';
import AddressInput from '../src/components/common/AddressInput';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { OrderMode, PaymentMethod, ProductCategory } from '../src/types';
import { useOrder } from '../src/context/OrderContext';
import { useOrders } from '../src/context/OrdersContext';
import { useAuth } from '../src/context/AuthContext';
import { useLoyalty } from '../src/context/LoyaltyContext';
import { useActiveOrder } from '../src/context/ActiveOrderContext';
import notificationService from '../src/services/notificationService';
import { registerCustomerForOrderNotifications } from '../src/services/customerNotificationService';
import OrderConfirmationPopup from '../src/components/customer/OrderConfirmationPopup';
import * as Notifications from 'expo-notifications';
import { registerCustomerForBroadcast } from '../src/services/broadcastNotificationService';

export default function CartScreen() {
  const fontsLoaded = useFonts();
  const { orderItems, removeItem, addItem, clearOrder, getPromoDetails, selectFreeDessert, getAvailableDesserts, markAsHasOrdered } = useOrder();
  const { createOrder } = useOrders();
  const { user, userProfile } = useAuth();
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
    userLoyaltyData
  } = useLoyalty();

  const [orderMode, setOrderMode] = useState(OrderMode.DINE_IN);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [dynamicDeliveryFee, setDynamicDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CASH);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [itemComments, setItemComments] = useState({});
  const [showRecommendations, setShowRecommendations] = useState({
    drinks: true,
    desserts: true
  });
  const [showDessertModal, setShowDessertModal] = useState(false);
  // Variables pour l'ancien modal (à supprimer plus tard)
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Recommandations de boissons et desserts
  const recommendedDrinks = [
    {
      id: 'coca-cola-rec',
      name: 'Coca-Cola',
      description: '33 cl.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/coca.png')
    },
    {
      id: 'fanta-rec',
      name: 'Fanta Orange',
      description: '33 cl.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/fanta.png')
    },
    {
      id: 'eau-rec',
      name: 'Eau Cristalline',
      description: 'Taille au choix.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/cristaline.png')
    },
    {
      id: 'sprite-rec',
      name: 'Sprite',
      description: '33 cl.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/sprite.png')
    },
    {
      id: 'orangina-rec',
      name: 'Orangina',
      description: '33 cl.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/orangina.png')
    },
    {
      id: 'ice-tea-rec',
      name: 'Ice Tea Pêche',
      description: '33 cl.',
      price: 2.90,
      category: ProductCategory.BOISSONS,
      image: require('../assets/images/boissons/iceTeaPeachh.png')
    }
  ];

  const recommendedDesserts = [
    {
      id: 'tiramisu-nutella-rec',
      name: 'Tiramisu Nutella spéculoos',
      description: 'Fait maison',
      price: 4.50,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/tiramisuNutellaSpeculos.png')
    },
    {
      id: 'tarte-daim-rec',
      name: 'Tarte Daim',
      description: 'Tarte Daim',
      price: 4.50,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/tarteDaim.png')
    },
    {
      id: 'milkshake-vanille-rec',
      name: 'Milkshake Vanille',
      description: 'Milkshake Vanille',
      price: 6.90,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/MilkshakeVanille.png')
    },
    {
      id: 'tiramisu-oreo-rec',
      name: 'Tiramisu Oreo',
      description: 'Fait maison',
      price: 4.50,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/tiramisuOreo.png')
    },
    {
      id: 'milkshake-fraise-rec',
      name: 'Milkshake Fraise',
      description: 'Milkshake Fraise',
      price: 6.90,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/MilkshakeFraise.png')
    },
    {
      id: 'gaufre-rec',
      name: 'Gaufre',
      description: 'Gaufre maison',
      price: 4.50,
      category: ProductCategory.DESSERTS,
      image: require('../assets/images/desserts/Gaufre.png')
    }
  ];

  // Vérifier si le modal de dessert doit s'ouvrir
  useEffect(() => {
    const promo = getPromoDetails();
    if (promo.needsSelection) {
      setShowDessertModal(true);
    }
  }, [orderItems]);

  // Pre-fill phone number from user profile for delivery orders
  useEffect(() => {
    if (userProfile?.phoneNumber && orderMode === OrderMode.DELIVERY && !phoneNumber) {
      setPhoneNumber(userProfile.phoneNumber);
    }
  }, [userProfile, orderMode]);

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
        initialComments[item.id] = item.comment;
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

  const updateQuantity = (itemId, newQuantity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const item = orderItems.find(item => item.id === itemId);
    if (!item) return;

    if (newQuantity === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      removeItem(itemId);
    } else if (newQuantity > item.quantity) {
      // Ajouter des articles
      for (let i = item.quantity; i < newQuantity; i++) {
        addItem(item);
      }
    } else if (newQuantity < item.quantity) {
      // Supprimer des articles
      for (let i = item.quantity; i > newQuantity; i--) {
        removeItem(itemId);
      }
    }
  };

  const getSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return orderMode === OrderMode.DELIVERY ? dynamicDeliveryFee : 0;
  };

  const handleAddressSelect = (address) => {
    setDeliveryAddress(address);
  };

  const handleDeliveryFeeCalculated = (fee, distance) => {
    setDynamicDeliveryFee(fee || 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const rewardsDiscount = calculateActiveRewardsDiscount(subtotal, deliveryFee);
    return Math.max(0, subtotal + deliveryFee - rewardsDiscount.totalDiscount);
  };

  const canProceedToCheckout = () => {
    if (orderItems.length === 0) return false;
    if (orderMode === OrderMode.DELIVERY) {
      if (!deliveryAddress) return false;
      if (!phoneNumber.trim()) return false;
      if (dynamicDeliveryFee === 0 && deliveryAddress) return false;
    }
    return true;
  };

  const getWaitTime = () => {
    switch (orderMode) {
      case OrderMode.DINE_IN:
        return '20 min';
      case OrderMode.TAKEOUT:
        return '20 min';
      case OrderMode.DELIVERY:
        return '45 min';
      default:
        return '20 min';
    }
  };

  // Fonction pour formater les personnalisations
  const formatCustomizations = (customizations, customizationOptions) => {
    if (!customizations || !customizationOptions) return null;

    const formattedCustomizations = [];

    Object.entries(customizations).forEach(([categoryKey, selectedOptions]) => {
      const category = customizationOptions[categoryKey];
      if (category && selectedOptions.length > 0) {
        const selectedItems = selectedOptions.map(optionId => {
          const option = category.options.find(opt => opt.id === optionId);
          return option ? `${option.name}${option.price > 0 ? ` (+${option.price.toFixed(2)}€)` : ''}` : '';
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
        setShowRewardsModal(false);
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

  const handleCheckout = async () => {
    console.log('=== DEBUG CHECKOUT ===');
    console.log('orderItems.length:', orderItems.length);
    console.log('orderMode:', orderMode);
    console.log('deliveryAddress:', deliveryAddress);
    console.log('phoneNumber:', phoneNumber);
    console.log('dynamicDeliveryFee:', dynamicDeliveryFee);

    if (orderItems.length === 0) {
      console.log('BLOCKED: No items in cart');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (orderMode === OrderMode.DELIVERY && !deliveryAddress) {
      console.log('BLOCKED: No delivery address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (orderMode === OrderMode.DELIVERY && !phoneNumber.trim()) {
      console.log('BLOCKED: No phone number');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (orderMode === OrderMode.DELIVERY && dynamicDeliveryFee === 0 && deliveryAddress) {
      console.log('BLOCKED: Delivery fee is 0 but address exists');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          Object.entries(item.customizations).forEach(([categoryKey, selectedOptions]) => {
            const category = item.customizationOptions[categoryKey];
            if (category && selectedOptions && selectedOptions.length > 0) {
              selectedOptions.forEach(optionId => {
                const option = category.options?.find(opt => opt.id === optionId);
                if (option) {
                  optionsList.push(option.name + (option.price > 0 ? ` (+${option.price.toFixed(2)}€)` : ''));
                }
              });
            }
          });
          if (optionsList.length > 0) {
            formattedOptions = optionsList.join(', ');
          }
        }

        // Extraire l'ID de base du produit (sans le suffixe de taille)
        const baseProductId = item.id?.split('_')[0] || item.id;

        return {
          id: baseProductId, // ID du produit pour retrouver l'image
          productId: baseProductId, // Alias pour compatibilité
          imageKey: item.imageKey || null, // Clé d'image si définie
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize || null,
          price: item.price,
          comment: itemComments[item.id] || null,
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
      phone: orderMode === OrderMode.DELIVERY ? phoneNumber : null
    };

    const result = await createOrder(orderData);

    if (result.success) {
      // Marquer que l'utilisateur a commandé (pour la promo première commande)
      await markAsHasOrdered();

      // Confirmer l'utilisation des récompenses avec le numéro de commande
      const rewardsDiscount = calculateActiveRewardsDiscount(getSubtotal(), getDeliveryFee());
      if (rewardsDiscount.hasActiveRewards) {
        for (const reward of rewardsDiscount.rewardDiscounts) {
          await confirmRewardUsage(reward.id, result.order.id);
        }
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
                  projectId: '81983664-a2fe-43e8-8c2f-6f2c2b98baac',
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
      Alert.alert('Erreur', 'Impossible de créer la commande. Veuillez réessayer.');
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
        {item.image && (
          <Image
            source={item.image}
            style={styles.recommendationImage}
            resizeMode="cover"
          />
        )}
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

  const renderCartItem = ({ item }) => {
    const customizationDetails = formatCustomizations(item.customizations, item.customizationOptions);

    return (
      <View style={styles.cartItem}>
        {/* Section principale avec image, infos et boutons */}
        <View style={styles.mainItemSection}>
          {/* Image du produit */}
          {item.image && (
            <Image
              source={item.image}
              style={styles.itemImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
          </View>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section pleine largeur pour personnalisations */}
        {customizationDetails && (
          <View style={styles.customizationDetails}>
            <Text style={styles.customizationTitle}>Personnalisations :</Text>
            {customizationDetails.map((category, index) => (
              <View key={index} style={styles.customizationCategory}>
                <Text style={styles.customizationCategoryName}>{category.categoryTitle} :</Text>
                {category.items.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.customizationItem}>• {item}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

      </View>
    );
  };

  const renderOrderMode = ({ item }) => (
    <TouchableOpacity
      style={[styles.orderModeItem, orderMode === item.id && styles.selectedOrderMode]}
      onPress={() => {
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
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
        data={[1]} // dummy data pour utiliser FlatList comme ScrollView
        renderItem={() => (
          <>
            {/* Order Mode Selection */}
            <View style={styles.orderModeSection}>
              <Text style={styles.sectionTitle}>Mode de commande</Text>
              <FlatList
                data={orderModes}
                renderItem={renderOrderMode}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.orderModeList}
              />
              
              {orderMode === OrderMode.DELIVERY && (
                <>
                  <AddressInput
                    onAddressSelect={handleAddressSelect}
                    onDeliveryFeeCalculated={handleDeliveryFeeCalculated}
                  />
                  
                  {/* Section téléphone pour livraison */}
                  <View style={styles.phoneSection}>
                    <Text style={styles.phoneSectionTitle}>Numéro de téléphone</Text>
                    <View style={styles.phoneInputContainer}>
                      <Ionicons name="call-outline" size={20} color={colors.neutral.gray500} />
                      <TextInput
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
                      />
                    </View>
                  </View>

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

            {/* Cart Items */}
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>Votre commande</Text>
              {orderItems.map((item) => renderCartItem({ item }))}
            </View>

            {/* Recommendations */}
            {renderRecommendations()}

            {/* Rewards Section */}
            {userLoyaltyData.currentPoints > 0 && (
              <View style={styles.rewardsSection}>
                <View style={styles.rewardsSectionHeader}>
                  <View style={styles.rewardsHeaderLeft}>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.rewardsSectionTitle}>Récompenses Fidélité</Text>
                  </View>
                  <Text style={styles.loyaltyPoints}>
                    {userLoyaltyData.currentPoints % 1 === 0
                      ? userLoyaltyData.currentPoints.toString()
                      : userLoyaltyData.currentPoints.toFixed(2)
                    } pts
                  </Text>
                </View>

                {(() => {
                  const availableRewards = getAvailableRewardsForCart(getSubtotal(), orderMode === OrderMode.DELIVERY);
                  const activeRewards = calculateActiveRewardsDiscount(getSubtotal(), getDeliveryFee());

                  if (activeRewards.hasActiveRewards) {
                    return (
                      <View style={styles.activeRewardsContainer}>
                        {activeRewards.rewardDiscounts.map((reward, index) => (
                          <View key={index} style={styles.activeRewardItem}>
                            <View style={styles.activeRewardInfo}>
                              <Ionicons name="gift" size={16} color="#22C55E" />
                              <Text style={styles.activeRewardTitle}>{reward.title}</Text>
                            </View>
                            <View style={styles.activeRewardRight}>
                              <Text style={styles.activeRewardDiscount}>-{reward.discountAmount.toFixed(2)}€</Text>
                              <TouchableOpacity
                                style={styles.cancelRewardButton}
                                onPress={() => handleCancelReward(reward.id)}
                              >
                                <Ionicons name="close" size={14} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  } else if (availableRewards.length > 0) {
                    return (
                      <TouchableOpacity
                        style={styles.useRewardButton}
                        onPress={() => setShowRewardsModal(true)}
                      >
                        <View style={styles.useRewardContent}>
                          <Ionicons name="gift-outline" size={18} color="#000000" />
                          <Text style={styles.useRewardText}>Utiliser une récompense</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#000000" />
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <View style={styles.noRewardsContainer}>
                        <Text style={styles.noRewardsText}>
                          Aucune récompense disponible pour cette commande
                        </Text>
                      </View>
                    );
                  }
                })()}
              </View>
            )}

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

              {/* Promo Section */}
              {(() => {
                const promo = getPromoDetails();
                if (promo.isActive) {
                  if (promo.selectedDessert) {
                    return (
                      <TouchableOpacity
                        style={styles.promoRow}
                        onPress={() => setShowDessertModal(true)}
                      >
                        <View style={styles.promoContent}>
                          <Ionicons name="gift" size={16} color="#22C55E" />
                          <Text style={styles.promoLabel}>{promo.selectedDessert.name}</Text>
                        </View>
                        <Text style={styles.promoValue}>-{promo.selectedDessert.value.toFixed(2)} €</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        style={styles.promoSelectRow}
                        onPress={() => setShowDessertModal(true)}
                      >
                        <View style={styles.promoContent}>
                          <Ionicons name="gift" size={16} color="#22C55E" />
                          <Text style={styles.promoSelectLabel}>Choisir votre dessert offert</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#22C55E" />
                      </TouchableOpacity>
                    );
                  }
                } else {
                  const remaining = promo.threshold - getSubtotal();
                  if (remaining > 0) {
                    return (
                      <View style={styles.promoInfoRow}>
                        <View style={styles.promoInfoContent}>
                          <Ionicons name="information-circle" size={16} color="#F59E0B" />
                          <Text style={styles.promoInfoText}>
                            Plus que {remaining.toFixed(2)}€ pour un dessert offert !
                          </Text>
                        </View>
                      </View>
                    );
                  }
                }
                return null;
              })()}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Temps d'attente</Text>
                <Text style={styles.summaryValue}>{getWaitTime()}</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{getTotal().toFixed(2)} €</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <View style={styles.checkoutSection}>
              <TouchableOpacity
                style={[styles.checkoutButton, !canProceedToCheckout() && styles.checkoutButtonDisabled]}
                onPress={() => {
                  if (!canProceedToCheckout()) {
                    if (orderMode === OrderMode.DELIVERY) {
                      if (!deliveryAddress) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert('Erreur', 'Veuillez saisir votre adresse de livraison');
                        return;
                      }
                      if (!phoneNumber.trim()) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone pour la livraison');
                        return;
                      }
                      if (dynamicDeliveryFee === 0 && deliveryAddress) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert('Erreur', 'Désolé, nous ne livrons pas dans cette zone (> 10km)');
                        return;
                      }
                    }
                    return;
                  }
                  handleCheckout();
                }}
              >
                <LinearGradient
                  colors={canProceedToCheckout() ? ['#000000', '#000000', '#000000'] : ['#999', '#777', '#666']}
                  style={styles.checkoutGradient}
                >
                  <Text style={[styles.checkoutText, !canProceedToCheckout() && styles.checkoutTextDisabled]}>
                    Commander • {getTotal().toFixed(2)} €
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

      {/* Modal de sélection de dessert */}
      <Modal
        visible={showDessertModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDessertModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>🎉 Choisissez votre dessert offert</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDessertModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>
              Félicitations ! Vous avez dépassé 20€ d'achat, choisissez votre dessert gratuit :
            </Text>

            <FlatList
              data={getAvailableDesserts()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dessertOption}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    selectFreeDessert(item);
                    setShowDessertModal(false);
                  }}
                >
                  <View style={styles.dessertOptionContent}>
                    {item.image && (
                      <Image
                        source={item.image}
                        style={styles.dessertImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.dessertInfo}>
                      <Text style={styles.dessertName}>{item.name}</Text>
                      <Text style={styles.dessertValue}>Valeur: {item.value.toFixed(2)}€</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#22C55E" />
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dessertList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de récompenses */}
      <Modal
        visible={showRewardsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>🎁 Vos Récompenses</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>
              Vous avez {userLoyaltyData.currentPoints % 1 === 0
                ? userLoyaltyData.currentPoints.toString()
                : userLoyaltyData.currentPoints.toFixed(2)
              } points de fidélité. Choisissez une récompense :
            </Text>

            <FlatList
              data={getAvailableRewardsForCart(getSubtotal(), orderMode === OrderMode.DELIVERY)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.rewardOption,
                    selectedReward?.id === item.id && styles.selectedRewardOption
                  ]}
                  onPress={() => setSelectedReward(selectedReward?.id === item.id ? null : item)}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.rewardOptionGradient}
                  >
                    <View style={styles.rewardOptionContent}>
                      <View style={styles.rewardOptionHeader}>
                        <View style={styles.rewardIconBadge}>
                          <Ionicons name={item.icon} size={24} color="white" />
                        </View>
                        <View style={styles.rewardPointsBadge}>
                          <Text style={styles.rewardPointsText}>{item.points} pts</Text>
                        </View>
                      </View>

                      <View style={styles.rewardOptionInfo}>
                        <Text style={styles.rewardOptionTitle}>{item.title}</Text>
                        <Text style={styles.rewardOptionDescription}>{item.description}</Text>
                        {item.discountValue > 0 && (
                          <Text style={styles.rewardOptionValue}>
                            Économisez {item.discountValue.toFixed(2)}€
                          </Text>
                        )}
                      </View>

                      <View style={styles.rewardArrow}>
                        {selectedReward?.id === item.id ? (
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                        ) : (
                          <Ionicons name="chevron-forward" size={20} color="white" />
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.rewardsList}
            />

            {/* Boutons de confirmation */}
            <View style={styles.rewardModalActions}>
              {selectedReward ? (
                <TouchableOpacity
                  style={styles.confirmRewardButton}
                  onPress={() => {
                    handleUseReward(selectedReward);
                    setSelectedReward(null);
                  }}
                >
                  <LinearGradient
                    colors={['#22C55E', '#16A34A']}
                    style={styles.confirmRewardGradient}
                  >
                    <Text style={styles.confirmRewardText}>
                      Utiliser cette récompense
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cancelRewardModalButton}
                  onPress={() => setShowRewardsModal(false)}
                >
                  <Text style={styles.cancelRewardModalText}>Fermer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

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
                  <TouchableOpacity
                    style={styles.confirmationButton}
                    onPress={() => {
                      setShowConfirmationModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000']}
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
                      colors={['#000000', '#000000']}
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
    paddingBottom: spacing.xl,
  },
  orderModeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  orderModeList: {
    paddingVertical: spacing.sm,
  },
  orderModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
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
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginHorizontal: spacing.xs,
    minWidth: 20,
    textAlign: 'center',
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
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#22C55E',
    marginLeft: spacing.xs,
  },
  promoChangeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: '#22C55E',
    marginLeft: spacing.xs,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  promoValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#22C55E',
  },
  promoInfoRow: {
    marginBottom: spacing.sm,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  promoInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInfoText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#F59E0B',
    marginLeft: spacing.xs,
    flex: 1,
  },
  promoSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  promoSelectLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#22C55E',
    marginLeft: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    padding: spacing.lg,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.base * 1.5,
  },
  dessertList: {
    paddingBottom: spacing.xl,
  },
  dessertOption: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dessertOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dessertImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.neutral.gray100,
  },
  dessertInfo: {
    flex: 1,
  },
  dessertName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  dessertDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  dessertValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#22C55E',
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
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
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