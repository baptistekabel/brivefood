import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Image,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { ProductCategory } from '../../src/types';
import { useOrder } from '../../src/context/OrderContext';
import { useProducts } from '../../src/context/ProductsContext';
import productImages from '../../src/data/productImages';
import categoryInfo from '../../src/data/categories';
import ProductImage from '../../src/components/common/ProductImage';
import { calculateCustomizedPrice, isCustomizationComplete, getSizeDisplayText, getProductQuantity } from '../../src/utils/categoryUtils';
import { isEveningOnlyCategory, isEveningOnlyProduct, isEveningServiceAvailable } from '../../src/utils/eveningRestriction';
import restaurantStatusService from '../../src/services/restaurantStatusService';
import styles from '../../src/styles/CategoryScreen.styles';

const restrictionStyles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FCD34D',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  productBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  productBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { addItem, orderItems, getItemCount } = useOrder();
  const { getProductsByCategory, getProductById, productsByCategory: allProductsByCategory } = useProducts();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [customizations, setCustomizations] = useState({});
  const [expandedCustomizations, setExpandedCustomizations] = useState({});
  const [productComments, setProductComments] = useState({});

  // Statut restaurant (ouvert/fermé)
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);

  useEffect(() => {
    // Lire le statut déjà en cache (chargé par la home via initializeClient)
    if (restaurantStatusService.currentStatus) {
      setIsRestaurantOpen(restaurantStatusService.currentStatus.isOpen);
    }
    const removeListener = restaurantStatusService.addStatusListener((newStatus) => {
      setIsRestaurantOpen(newStatus.isOpen);
    });
    return () => removeListener();
  }, []);

  // Restriction horaire : vérifier si la catégorie ou le produit est disponible
  const [eveningAvailable, setEveningAvailable] = useState(isEveningServiceAvailable());
  const categoryRestricted = isEveningOnlyCategory(id) && !eveningAvailable;

  // Vérifier la disponibilité toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setEveningAvailable(isEveningServiceAvailable());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Modal state for image zoom
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Modal state for comment
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [commentProduct, setCommentProduct] = useState(null);
  const [commentSize, setCommentSize] = useState(null);

  // Animation states
  const [animatingItems, setAnimatingItems] = useState([]);
  const { width, height } = Dimensions.get('window');

  // Animations d'arrière-plan et emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 18 }, () => new Animated.Value(0))
  ).current;

  // Pré-calculer les trajectoires des emojis une seule fois (pas à chaque re-render)
  const emojiTrajectories = useRef(
    Array.from({ length: 18 }, (_, index) => {
      const trajectoryType = index % 4;
      let startX, endX, startY, endY;
      switch (trajectoryType) {
        case 0:
          startX = Math.random() * (Dimensions.get('window').width - 50);
          endX = startX + (Math.random() - 0.5) * 150;
          startY = Dimensions.get('window').height + 50;
          endY = -100;
          break;
        case 1:
          startX = -100;
          endX = Dimensions.get('window').width + 50;
          startY = 150 + Math.random() * (Dimensions.get('window').height - 300);
          endY = startY + (Math.random() - 0.5) * 200;
          break;
        case 2:
          startX = Dimensions.get('window').width + 50;
          endX = -100;
          startY = 200 + Math.random() * (Dimensions.get('window').height - 400);
          endY = startY + (Math.random() - 0.5) * 150;
          break;
        case 3:
          startX = Math.random() * (Dimensions.get('window').width - 50);
          endX = startX + (Math.random() - 0.5) * 100;
          startY = -100;
          endY = Dimensions.get('window').height + 50;
          break;
      }
      const amplitude = 15 + (index % 3) * 10;
      return { startX, endX, startY, endY, amplitude };
    })
  ).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(new Animated.Value(0.6)).current;

  // Functions for image modal
  const openImageModal = (image) => {
    setSelectedImage(image);
    setImageModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  // Initialiser les animations d'arrière-plan et emojis
  useEffect(() => {
    // Animation des arrière-plans
    const startBackgroundAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotateAnimation, {
            toValue: 1,
            duration: 20000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnimation, {
              toValue: 1.1,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: 0.9,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(opacityAnimation, {
              toValue: 0.8,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnimation, {
              toValue: 0.4,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnimation, {
              toValue: 0.6,
              duration: 8000,
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
    };

    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 2000;
        const duration = 12000 + Math.random() * 10000;

        setTimeout(() => {
          Animated.loop(
            Animated.timing(animValue, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            })
          ).start();
        }, delay);
      });
    };

    startBackgroundAnimation();
    startFloatingEmojisAnimation();
  }, []);


  // Obtenir les données pour cette catégorie
  const currentCategory = categoryInfo[id] || categoryInfo[ProductCategory.PATES];
  const products = getProductsByCategory(id);

  // Initialiser les tailles par défaut pour les bowls et tacos
  useEffect(() => {
    if ((id === ProductCategory.BOWLS || id === ProductCategory.TACOS) && products.length > 0) {
      const product = products[0];
      if (product.sizes && !selectedSizes[product.id]) {
        const defaultSize = Object.keys(product.sizes)[0];
        setSelectedSizes(prev => ({
          ...prev,
          [product.id]: defaultSize
        }));
      }
      // Déplier automatiquement les options pour les tacos et bowls
      if ((id === ProductCategory.TACOS || id === ProductCategory.BOWLS) && product.customizable) {
        setExpandedCustomizations(prev => ({
          ...prev,
          [product.id]: true
        }));
      }
    }
    // Déplier automatiquement les options pour le menu kids
    if (id === ProductCategory.MENU_KIDS && products.length > 0) {
      const expanded = {};
      products.forEach(product => {
        if (product.customizable) {
          expanded[product.id] = true;
        }
      });
      setExpandedCustomizations(prev => ({ ...prev, ...expanded }));
    }
    // Déplier automatiquement les options pour le brunch
    if (id === ProductCategory.BRUNCH && products.length > 0) {
      const expanded = {};
      products.forEach(product => {
        if (product.customizable) {
          expanded[product.id] = true;
        }
      });
      setExpandedCustomizations(prev => ({ ...prev, ...expanded }));
    }
    // Pré-sélectionner 29cm pour toutes les pizzas
    if (id === ProductCategory.PIZZA && products.length > 0) {
      const sizesUpdate = {};
      products.forEach(product => {
        if (product.sizes && !selectedSizes[product.id]) {
          sizesUpdate[product.id] = product.sizes['29cm'] ? '29cm' : Object.keys(product.sizes)[0];
        }
      });
      if (Object.keys(sizesUpdate).length > 0) {
        setSelectedSizes(prev => ({ ...prev, ...sizesUpdate }));
      }
    }
  }, [id, products]);

  // Animation d'ajout au panier
  const triggerCartAnimation = (product, event) => {
    const animationId = Date.now() + Math.random();
    const animatedValue = new Animated.Value(0);

    // Position de départ (centre de l'écran approximativement)
    const startX = width * 0.5;
    const startY = height * 0.6;

    // Position de fin (bas de l'écran pour la miniature panier)
    const endX = width * 0.5; // Centre horizontal pour la miniature
    const endY = height - (Platform.OS === 'ios' ? 120 : 100); // Vers le bas

    const newAnimatingItem = {
      id: animationId,
      product,
      animatedValue,
      startX,
      startY,
      endX,
      endY,
    };

    setAnimatingItems(prev => [...prev, newAnimatingItem]);

    // Animation avec courbe personnalisée pour un effet plus naturel
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.8,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Retirer l'item animé après l'animation
      setAnimatingItems(prev => prev.filter(item => item.id !== animationId));
    });
  };

  // Fonction pour ouvrir la modal de commentaire
  const openCommentModal = (product, selectedSize = 'M') => {
    setCommentProduct(product);
    setCommentSize(selectedSize);
    setCurrentComment('');
    setCommentModalVisible(true);
  };

  // Fonction pour confirmer l'ajout au panier avec commentaire
  const confirmAddToCart = () => {
    if (!commentProduct) return;

    // Bloquer si le produit est restreint avant 18h
    if (isProductRestricted(commentProduct)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Déclencher l'animation
    triggerCartAnimation(commentProduct, null);

    // Vérifier si c'est un produit personnalisé (tacos/bowls)
    if (commentProduct.customizationOptions && customizations[commentProduct.id]) {
      // Créer le produit personnalisé avec commentaire
      const productCustomizations = customizations[commentProduct.id] || {};
      const selectedSize = selectedSizes[commentProduct.id];

      const customizedProduct = {
        ...commentProduct,
        price: calculateCustomizedPrice(commentProduct, selectedSizes, customizations),
        customizations: productCustomizations,
        customizationOptions: commentProduct.customizationOptions,
        comment: currentComment || undefined,
        // Ajouter la taille sélectionnée si applicable
        ...(selectedSize && commentProduct.sizes && {
          selectedSize: selectedSize,
          id: `${commentProduct.id}_${selectedSize}`,
          name: `${commentProduct.name} (${commentProduct.sizes[selectedSize].name})`
        })
      };

      addItem(customizedProduct);

      // Réinitialiser les personnalisations pour ce produit
      setCustomizations(prev => {
        const newCustomizations = { ...prev };
        if (commentProduct.customizationOptions) {
          newCustomizations[commentProduct.id] = {};
          Object.keys(commentProduct.customizationOptions).forEach(categoryKey => {
            newCustomizations[commentProduct.id][categoryKey] = [];
          });
        }
        return newCustomizations;
      });

      // Réinitialiser l'état d'expansion
      setExpandedCustomizations(prev => ({
        ...prev,
        [commentProduct.id]: false
      }));
    }
    // Pour les autres produits avec tailles (comme les pâtes)
    else if (commentProduct.sizes && commentProduct.sizes[commentSize]) {
      const productWithSize = {
        ...commentProduct,
        id: `${commentProduct.id}_${commentSize}`,
        price: commentProduct.sizes[commentSize].price,
        selectedSize: commentSize,
        name: `${commentProduct.name} (${commentProduct.sizes[commentSize].name})`,
        comment: currentComment || undefined
      };
      addItem(productWithSize);
    }
    // Pour les produits simples
    else {
      const productWithComment = {
        ...commentProduct,
        comment: currentComment || undefined
      };
      addItem(productWithComment);
    }

    // Fermer la modal
    setCommentModalVisible(false);
    setCurrentComment('');
    setCommentProduct(null);
    setCommentSize(null);
  };

  // Vérifie si un produit individuel est restreint (horaires, restaurant fermé, ou indisponible)
  const isProductRestricted = (product) => {
    if (product.available === false) return true;
    if (!isRestaurantOpen) return true;
    if (categoryRestricted) return true;
    if (isEveningOnlyProduct(product.id) && !eveningAvailable) return true;
    return false;
  };

  // Retourne le texte de restriction adapté au cas
  const getRestrictionLabel = (product) => {
    if (product.available === false) return 'Indisponible';
    if ((isEveningOnlyProduct(product.id) || categoryRestricted) && !eveningAvailable) return 'Disponible dès 18h';
    if (!isRestaurantOpen) return 'Restaurant fermé';
    return 'Indisponible';
  };

  // Retourne l'icône de restriction adaptée au cas
  const getRestrictionIcon = (product) => {
    if (product.available === false) return 'close-circle-outline';
    if ((isEveningOnlyProduct(product.id) || categoryRestricted) && !eveningAvailable) return 'time-outline';
    if (!isRestaurantOpen) return 'lock-closed-outline';
    return 'close-circle-outline';
  };

  // Fonction pour ajouter au panier (maintenant ouvre la modal sauf pour les boissons)
  const handleAddToCart = (product, selectedSize = 'M', event = null) => {
    // Bloquer si restaurant fermé
    if (!isRestaurantOpen) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Restaurant fermé', 'Le restaurant est actuellement fermé. Vous ne pouvez pas passer commande pour le moment.');
      return;
    }
    // Bloquer si le produit est restreint avant 18h
    if (isProductRestricted(product)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Déclencher l'animation
    triggerCartAnimation(product, event);

    // Récupérer le commentaire inline
    const comment = productComments[product.id] || undefined;

    // Ajouter directement au panier avec le commentaire
    if (product.sizes && product.sizes[selectedSize]) {
      const productWithSize = {
        ...product,
        id: `${product.id}_${selectedSize}`,
        price: product.sizes[selectedSize].price,
        selectedSize: selectedSize,
        name: `${product.name} (${product.sizes[selectedSize].name})`,
        comment: comment
      };
      addItem(productWithSize);
    } else {
      addItem({ ...product, comment: comment });
    }

    // Réinitialiser le commentaire après l'ajout
    setProductComments(prev => ({ ...prev, [product.id]: '' }));

    // Retour au menu après l'ajout
    setTimeout(() => {
      router.back();
    }, 300);
  };

  // Fonction pour ajouter au panier avec personnalisations
  const handleAddCustomizedToCart = (product, event = null) => {
    // Bloquer si le produit est restreint avant 18h
    if (isProductRestricted(product)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Vérifier si la personnalisation est complète
    if (!isCustomizationComplete(product, customizations)) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Déclencher l'animation
    triggerCartAnimation(product, event);

    // Récupérer le commentaire inline
    const comment = productComments[product.id] || undefined;
    const productCustomizations = customizations[product.id] || {};
    const selectedSize = selectedSizes[product.id];

    // Créer le produit personnalisé avec commentaire
    const customizedProduct = {
      ...product,
      price: calculateCustomizedPrice(product, selectedSizes, customizations),
      customizations: productCustomizations,
      customizationOptions: product.customizationOptions,
      comment: comment,
      ...(selectedSize && product.sizes && {
        selectedSize: selectedSize,
        id: `${product.id}_${selectedSize}`,
        name: `${product.name} (${product.sizes[selectedSize].name})`
      })
    };

    addItem(customizedProduct);

    // Réinitialiser les personnalisations et le commentaire après l'ajout
    setCustomizations(prev => {
      const newCustomizations = { ...prev };
      if (product.customizationOptions) {
        newCustomizations[product.id] = {};
        Object.keys(product.customizationOptions).forEach(categoryKey => {
          newCustomizations[product.id][categoryKey] = [];
        });
      }
      return newCustomizations;
    });
    setExpandedCustomizations(prev => ({
      ...prev,
      [product.id]: false
    }));
    setProductComments(prev => ({ ...prev, [product.id]: '' }));

    // Retour au menu après l'ajout
    setTimeout(() => {
      router.back();
    }, 300);
  };


  // Gérer la sélection des tailles
  const handleSizeSelection = (productId, sizeKey) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: sizeKey
    }));

    // Recalculer le prix basé sur la taille
    const product = products.find(p => p.id === productId);
    if (product && product.sizes && product.sizes[sizeKey]) {
      // Ajuster les sélections de viandes selon la nouvelle taille
      setCustomizations(prev => {
        const currentCustomizations = prev[productId] || {};
        const viandesSelections = currentCustomizations.viandes || [];

        // Déterminer le nombre max de viandes pour la nouvelle taille
        let maxViandes = 4;
        switch (sizeKey) {
          case 'M': maxViandes = 1; break;
          case 'L': maxViandes = 2; break;
          case 'XL': maxViandes = 3; break;
          case 'XXL': maxViandes = 4; break;
        }

        // Si on a trop de viandes sélectionnées, garder seulement les premières
        const adjustedViandes = viandesSelections.slice(0, maxViandes);

        return {
          ...prev,
          [productId]: {
            ...currentCustomizations,
            viandes: adjustedViandes
          }
        };
      });
    }
  };

  // Gérer les personnalisations
  const handleCustomizationChange = (productId, categoryKey, optionId, isSelected) => {
    setCustomizations(prev => {
      const productCustomizations = prev[productId] || {};
      const categorySelections = productCustomizations[categoryKey] || [];

      // Gérer les sélections mutuellement exclusives pour certaines catégories
      // Chercher le produit dans toutes les catégories
      const product = getProductById(productId);
      const category = product?.customizationOptions?.[categoryKey];

      // Pour les catégories avec multiSelect = false ou maxSelections/maxSelection = 1
      const maxSelect = category?.maxSelections || category?.maxSelection;
      const isSingleSelect = maxSelect === 1 || category?.multiSelect === false;

      if (isSingleSelect) {
        // Pour les sélections uniques : permettre de désélectionner une option déjà sélectionnée
        const currentlySelected = categorySelections.includes(optionId);

        if (currentlySelected) {
          // Si l'option est déjà sélectionnée, la désélectionner
          return {
            ...prev,
            [productId]: {
              ...productCustomizations,
              [categoryKey]: []
            }
          };
        } else {
          // Sinon, sélectionner cette option
          return {
            ...prev,
            [productId]: {
              ...productCustomizations,
              [categoryKey]: [optionId]
            }
          };
        }
      } else {
        // Pour les sélections multiples : comportement normal toggle avec vérification des limites
        if (isSelected) {
          // Vérifier les limites spéciales pour les viandes dans les tacos
          if (categoryKey === 'viandes' && product?.sizes) {
            const selectedSize = selectedSizes[productId];
            let maxViandes = 4; // Valeur par défaut

            switch (selectedSize) {
              case 'M': maxViandes = 1; break;
              case 'L': maxViandes = 2; break;
              case 'XL': maxViandes = 3; break;
              case 'XXL': maxViandes = 4; break;
            }

            // Si on a déjà atteint la limite, ne pas ajouter
            if (categorySelections.length >= maxViandes) {
              console.log(`Limite de viandes atteinte pour la taille ${selectedSize}: ${maxViandes}`);
              // Feedback visuel et tactile
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              return prev; // Ne pas modifier l'état
            }
          }

          // Vérifier la limite générale maxSelections/maxSelection
          if (maxSelect && categorySelections.length >= maxSelect) {
            console.log(`Limite générale atteinte: ${maxSelect}`);
            return prev; // Ne pas modifier l'état
          }

          // isSelected = true signifie qu'on veut sélectionner l'option
          return {
            ...prev,
            [productId]: {
              ...productCustomizations,
              [categoryKey]: [...categorySelections, optionId]
            }
          };
        } else {
          // isSelected = false signifie qu'on veut désélectionner l'option
          return {
            ...prev,
            [productId]: {
              ...productCustomizations,
              [categoryKey]: categorySelections.filter(id => id !== optionId)
            }
          };
        }
      }
    });
  };


  // Rendu des options de personnalisation
  const renderCustomizationOptions = (product) => {
    if (!product.customizable || !product.customizationOptions) {
      return null;
    }

    const isExpanded = expandedCustomizations[product.id];
    const productCustomizations = customizations[product.id] || {};

    // Pour les tacos, bowls, menu kids, brunch et formules pizza, ne pas afficher le toggle (toujours déplié)
    const isTacos = id === ProductCategory.TACOS;
    const isBowls = id === ProductCategory.BOWLS;
    const isMenuKids = id === ProductCategory.MENU_KIDS;
    const isBrunch = id === ProductCategory.BRUNCH;
    const isFormulePizzaDuo = id === ProductCategory.FORMULES_PIZZA_DUO;
    const isFormulePizzaTrio = id === ProductCategory.FORMULES_PIZZA_TRIO;
    const alwaysExpanded = isTacos || isBowls || isMenuKids || isBrunch || isFormulePizzaDuo || isFormulePizzaTrio;

    return (
      <View style={styles.customizationContainer}>
        {!alwaysExpanded ? (
          <TouchableOpacity
            style={styles.customizationToggle}
            onPress={() => {
              setExpandedCustomizations(prev => ({
                ...prev,
                [product.id]: !prev[product.id]
              }));
            }}
          >
            <Text style={styles.customizationToggleText}>
              {`Personnaliser votre ${product.name}`}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.neutral.gray600}
            />
          </TouchableOpacity>
        ) : null}

        {(isExpanded || alwaysExpanded) && (
          <View style={styles.customizationOptions}>
            {Object.entries(product.customizationOptions)
            .filter(([, value]) => value != null)
            .sort(([a], [b]) => {
              // Ordre logique des catégories de personnalisation
              const order = ['taille', 'base', 'gratine', 'steak', 'viande', 'viandes', 'crudites', 'fromage', 'fromages', 'sauce', 'gout', 'supplement', 'topping', 'supplements', 'chantilly', 'frites', 'pain', 'boisson'];
              const ia = order.indexOf(a);
              const ib = order.indexOf(b);
              return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
            })
            .map(([categoryKey, category]) => {
              const selectedOptions = productCustomizations[categoryKey] || [];

              return (
                <View key={categoryKey} style={styles.customizationCategory}>
                  <View style={styles.customizationCategoryHeader}>
                    <Text style={styles.customizationCategoryTitle}>
                      {category.title}
                      {/* Afficher la limite pour les viandes dans les tacos */}
                      {categoryKey === 'viandes' && product.sizes && (() => {
                        const selectedSize = selectedSizes[product.id];
                        const selectedCount = selectedOptions.length;
                        let maxViandes = 4;
                        switch (selectedSize) {
                          case 'M': maxViandes = 1; break;
                          case 'L': maxViandes = 2; break;
                          case 'XL': maxViandes = 3; break;
                          case 'XXL': maxViandes = 4; break;
                        }
                        return (
                          <Text style={styles.selectionCounter}>
                            {' '}({selectedCount}/{maxViandes})
                          </Text>
                        );
                      })()}
                      {/* Afficher le compteur pour les catégories multi-select (ex: viande pizzdwich) */}
                      {category.multiSelect === true && (category.maxSelections || category.maxSelection) > 1 && !(categoryKey === 'viandes' && product.sizes) && (() => {
                        const maxSel = category.maxSelections || category.maxSelection;
                        const selectedCount = selectedOptions.length;
                        return (
                          <Text style={styles.selectionCounter}>
                            {' '}({selectedCount}/{maxSel})
                          </Text>
                        );
                      })()}
                    </Text>
                  </View>
                  <View style={styles.customizationCategorySubtitle}>
                    <Text style={styles.customizationCategorySubtitleText}>
                      {category.subtitle}
                    </Text>
                  </View>
                  {/* Message explicatif pour les viandes - séparé */}
                  {categoryKey === 'viandes' && product.sizes && (() => {
                    const selectedSize = selectedSizes[product.id];
                    if (selectedSize) {
                      let maxViandes = 4;
                      switch (selectedSize) {
                        case 'M': maxViandes = 1; break;
                        case 'L': maxViandes = 2; break;
                        case 'XL': maxViandes = 3; break;
                        case 'XXL': maxViandes = 4; break;
                      }
                      return (
                        <Text style={styles.customizationHelperText}>
                          Max {maxViandes} viande{maxViandes > 1 ? 's' : ''} pour la taille {selectedSize}
                        </Text>
                      );
                    }
                    return null;
                  })()}

                  <View style={styles.customizationOptionsList}>
                    {(category.options || [])
                      .sort((a, b) => {
                        // Les options "Pas de..." toujours en premier
                        const aIsNone = a.id?.startsWith('pas') || a.id?.startsWith('frites-non');
                        const bIsNone = b.id?.startsWith('pas') || b.id?.startsWith('frites-non');
                        if (aIsNone && !bIsNone) return -1;
                        if (!aIsNone && bIsNone) return 1;
                        // Puis les options populaires
                        if (a.popular && !b.popular) return -1;
                        if (!a.popular && b.popular) return 1;
                        return 0;
                      })
                      .map((option, optionIndex) => {
                      const optionId = option.id || option.name;
                      const isSelected = selectedOptions && selectedOptions.includes(optionId);
                      const maxSelectLimit = category.maxSelections || category.maxSelection;

                      // Vérifier si c'est une catégorie à sélection unique
                      const isSingleSelect = maxSelectLimit === 1 || category?.multiSelect === false;

                      // Calculer la limite effective pour les viandes dans les tacos
                      let effectiveLimit = maxSelectLimit;
                      if (categoryKey === 'viandes' && product.sizes) {
                        const selectedSize = selectedSizes[product.id];
                        switch (selectedSize) {
                          case 'M': effectiveLimit = 1; break;
                          case 'L': effectiveLimit = 2; break;
                          case 'XL': effectiveLimit = 3; break;
                          default: effectiveLimit = maxSelectLimit || 4; break;
                        }
                      }

                      // Pour les sélections uniques, toujours permettre de cliquer
                      // (cliquer sur une autre option la sélectionne et désélectionne l'ancienne)
                      const canSelect = isSingleSelect || (!isSelected && (
                        !effectiveLimit ||
                        (selectedOptions ? selectedOptions.length : 0) < effectiveLimit
                      ));

                      return (
                        <TouchableOpacity
                          key={optionId}
                          style={[
                            styles.customizationOption,
                            isSelected && styles.customizationOptionSelected
                          ]}
                          onPress={() => {
                            if (isSelected || canSelect) {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              handleCustomizationChange(product.id, categoryKey, optionId, !isSelected);
                            }
                          }}
                          disabled={!isSelected && !canSelect}
                        >
                          <View style={styles.customizationOptionContent}>
                            <View style={styles.customizationOptionInfo}>
                              <Text style={[
                                styles.customizationOptionName,
                                isSelected && styles.customizationOptionNameSelected
                              ]}>
                                {option.name}
                              </Text>
                              {option.popular && (
                                <Text style={styles.popularLabel}>Populaire</Text>
                              )}
                            </View>
                            <View style={styles.customizationOptionRight}>
                              {option.price > 0 && (
                                <Text style={styles.customizationOptionPrice}>
                                  +{option.price.toFixed(2)}€
                                </Text>
                              )}
                              <View style={[
                                styles.customizationCheckbox,
                                isSelected && styles.customizationCheckboxSelected
                              ]}>
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={colors.neutral.white}
                                  />
                                )}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Champ de commentaire */}
            <View style={styles.inlineCommentContainer}>
              <Text style={styles.inlineCommentLabel}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.neutral.gray600} /> Commentaire (optionnel)
              </Text>
              <TextInput
                style={styles.inlineCommentInput}
                placeholder="Ex: Sans oignon, bien cuit..."
                placeholderTextColor={colors.neutral.gray400}
                value={productComments[product.id] || ''}
                onChangeText={(text) => setProductComments(prev => ({ ...prev, [product.id]: text }))}
                maxLength={200}
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Bouton d'ajout au panier personnalisé */}
            <TouchableOpacity
              style={[
                styles.customizedAddToCartButton,
                (!isCustomizationComplete(product, customizations) || isProductRestricted(product)) && styles.customizedAddToCartButtonDisabled
              ]}
              onPress={() => handleAddCustomizedToCart(product)}
              disabled={!isCustomizationComplete(product, customizations) || isProductRestricted(product)}
            >
              <LinearGradient
                colors={
                  isProductRestricted(product)
                    ? ['#6B7280', '#4B5563']
                    : isCustomizationComplete(product, customizations)
                      ? ['#FF6B6B', '#FF8E53']
                      : ['#ccc', '#aaa']
                }
                style={styles.customizedAddToCartGradient}
              >
                <Text style={styles.customizedAddToCartText}>
                  {isProductRestricted(product)
                    ? (getRestrictionLabel(product))
                    : `Ajouter au panier - ${calculateCustomizedPrice(product, selectedSizes, customizations).toFixed(2)}€`
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Rendu d'un plat avec image
  const renderProductWithImage = (product, selectedSize, currentPrice, productIdWithSize, quantity, isInCart) => (
    <View key={product.id} style={[styles.productCardWithImage, categoryRestricted && { opacity: 0.55 }]}>
      {/* Container avec image en fond et overlay gradient */}
      <TouchableOpacity
        onPress={() => openImageModal(product.image)}
        style={styles.imageContainer}
        activeOpacity={0.9}
      >
        <ProductImage
          product={product}
          style={styles.productImageBg}
          resizeMode="cover"
        />
        {/* Overlay gradient pour le texte */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />

        {/* Prix en haut à droite */}
        <View style={styles.priceOverlayContainer}>
          <Text style={styles.productPriceOverlay}>{currentPrice.toFixed(2)} €</Text>
        </View>

        {/* Contenu sur l'image */}
        <View style={styles.imageContentOverlay} pointerEvents="none">
          <Text style={styles.productNameOverlay}>{product.name}</Text>

          <Text style={styles.productDescriptionOverlay} numberOfLines={2}>
            {product.description}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Section info détaillée */}
      <View style={styles.productInfoDetailed}>
        {/* Sélecteur de tailles (masqué si taille déjà dans customizationOptions) */}
        {product.sizes && !product.customizationOptions?.taille && (
          <View style={styles.sizeSelector}>
            <Text style={styles.sizeLabel}>Taille :</Text>
            <View style={id === ProductCategory.PATES ? styles.sizeButtonsVertical : styles.sizeButtons}>
              {Object.keys(product.sizes).sort((a, b) => {
                if (id === ProductCategory.PIZZA) {
                  if (a === '29cm') return -1;
                  if (b === '29cm') return 1;
                }
                return 0;
              }).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    id === ProductCategory.PATES ? styles.sizeButtonFull : styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSizes(prev => ({
                      ...prev,
                      [product.id]: size
                    }));
                  }}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.sizeButtonTextActive
                  ]}>
{getSizeDisplayText(product, size)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Badge quantité */}
        {isInCart && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>Dans le panier: {quantity}</Text>
          </View>
        )}

        {/* Options de personnalisation ou bouton d'ajout standard */}
        {product.customizable ? (
          renderCustomizationOptions(product)
        ) : (
          <>
            {/* Champ de commentaire */}
            <View style={styles.inlineCommentContainer}>
              <Text style={styles.inlineCommentLabel}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.neutral.gray600} /> Commentaire (optionnel)
              </Text>
              <TextInput
                style={styles.inlineCommentInput}
                placeholder="Ex: Sans oignon, bien cuit..."
                placeholderTextColor={colors.neutral.gray400}
                value={productComments[product.id] || ''}
                onChangeText={(text) => setProductComments(prev => ({ ...prev, [product.id]: text }))}
                maxLength={200}
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            {/* Bouton d'ajout stylisé */}
            <TouchableOpacity
              style={styles.addToCartButtonStyled}
              onPress={() => handleAddToCart(product, selectedSize)}
              disabled={isProductRestricted(product)}
            >
              <LinearGradient
                colors={isProductRestricted(product) ? ['#6B7280', '#4B5563'] : ['#FF6B6B', '#FF8E53']}
                style={styles.addToCartGradientStyled}
              >
                <View style={styles.addToCartContentStyled}>
                  <Ionicons name={isProductRestricted(product) ? (getRestrictionIcon(product)) : "cart"} size={18} color={colors.neutral.white} />
                  <Text style={styles.addToCartTextStyled}>
                    {isProductRestricted(product) ? (getRestrictionLabel(product)) : (isInCart ? 'Ajouter encore' : 'Ajouter au panier')}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Rendu d'un plat sans image (design actuel amélioré)
  const renderProductWithoutImage = (product, selectedSize, currentPrice, productIdWithSize, quantity, isInCart) => (
    <View key={product.id} style={[styles.productCardNoImage, categoryRestricted && { opacity: 0.55 }]}>
      {/* Header avec emoji de catégorie et design coloré */}
      <LinearGradient
        colors={[currentCategory.gradient[0] + '20', currentCategory.gradient[1] + '10']}
        style={styles.noImageHeader}
      >
        <View style={styles.noImageHeaderContent}>
          <View style={styles.noImageEmojiContainer}>
            <Text style={styles.noImageEmoji}>{currentCategory.emoji}</Text>
          </View>
          
          <View style={styles.noImageTitleSection}>
            <Text style={styles.productNameNoImage}>{product.name}</Text>
          </View>
          
          <Text style={styles.productPriceNoImage}>{currentPrice.toFixed(2)} €</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.productInfoNoImage}>
        <Text style={styles.productDescriptionNoImage}>{product.description}</Text>

        {/* Sélecteur de tailles (masqué si taille déjà dans customizationOptions) */}
        {product.sizes && !product.customizationOptions?.taille && (
          <View style={styles.sizeSelector}>
            <Text style={styles.sizeLabel}>Taille :</Text>
            <View style={id === ProductCategory.PATES ? styles.sizeButtonsVertical : styles.sizeButtons}>
              {Object.keys(product.sizes).sort((a, b) => {
                if (id === ProductCategory.PIZZA) {
                  if (a === '29cm') return -1;
                  if (b === '29cm') return 1;
                }
                return 0;
              }).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    id === ProductCategory.PATES ? styles.sizeButtonFull : styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSizes(prev => ({
                      ...prev,
                      [product.id]: size
                    }));
                  }}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.sizeButtonTextActive
                  ]}>
{getSizeDisplayText(product, size)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Badge quantité */}
        {isInCart && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>Dans le panier: {quantity}</Text>
          </View>
        )}

        {/* Options de personnalisation */}
        {product.customizable ? (
          renderCustomizationOptions(product)
        ) : (
          <>
            {/* Champ de commentaire */}
            <View style={styles.inlineCommentContainer}>
              <Text style={styles.inlineCommentLabel}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.neutral.gray600} /> Commentaire (optionnel)
              </Text>
              <TextInput
                style={styles.inlineCommentInput}
                placeholder="Ex: Sans oignon, bien cuit..."
                placeholderTextColor={colors.neutral.gray400}
                value={productComments[product.id] || ''}
                onChangeText={(text) => setProductComments(prev => ({ ...prev, [product.id]: text }))}
                maxLength={200}
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            {/* Bouton d'ajout standard */}
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(product, selectedSize)}
              disabled={isProductRestricted(product)}
            >
              <LinearGradient
                colors={isProductRestricted(product) ? ['#6B7280', '#4B5563'] : ['#FF6B6B', '#FF8E53']}
                style={styles.addToCartGradient}
              >
                <View style={styles.addToCartContent}>
                  <Ionicons name={isProductRestricted(product) ? (getRestrictionIcon(product)) : "cart"} size={16} color={colors.neutral.white} />
                  <Text style={styles.addToCartText}>
                    {isProductRestricted(product) ? (getRestrictionLabel(product)) : (isInCart ? 'Ajouter encore' : 'Ajouter au panier')}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Rendu d'une carte unique pour bowls, tacos et milkshakes avec personnalisation
  const renderSingleCardWithCustomization = (categoryType, specificProduct = null) => {
    const product = specificProduct || products[0]; // Produit spécifique ou premier produit de la catégorie
    if (!product) return null;

    const productCustomizations = customizations[product.id] || {};
    const isComplete = isCustomizationComplete(product, customizations);
    const selectedSize = selectedSizes[product.id] || (product.sizes ? Object.keys(product.sizes)[0] : null);
    const currentPrice = product.sizes && selectedSize && product.sizes[selectedSize] ? product.sizes[selectedSize].price : product.price;
    const finalPrice = calculateCustomizedPrice(product, selectedSizes, customizations);
    const productIdWithSize = product.sizes ? `${product.id}_${selectedSize}` : product.id;
    const quantity = getProductQuantity(orderItems, productIdWithSize);
    const isInCart = quantity > 0;

    return (
      <View key={`${categoryType}-single-card`} style={styles.productCardWithImage}>
        {/* Container avec image en fond et overlay gradient */}
        <TouchableOpacity
          onPress={() => {
            // Pour les milkshakes, changer l'image selon la base sélectionnée
            if (product.id === 'milkshake-custom' && productCustomizations.base) {
              const selectedBase = productCustomizations.base[0];
              const imageToShow = selectedBase === 'fraise' ? productImages.MilkshakeFraise : productImages.MilkshakeVanille;
              openImageModal(imageToShow);
            } else {
              openImageModal(product.image);
            }
          }}
          style={styles.imageContainer}
          activeOpacity={0.9}
        >
          <ProductImage
            product={product}
            style={styles.productImageBg}
            resizeMode="cover"
          />
          {/* Overlay gradient pour le texte */}
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />

          {/* Prix en haut à droite */}
          <View style={styles.priceOverlayContainer}>
            <Text style={styles.productPriceOverlay}>{finalPrice.toFixed(2)} €</Text>
          </View>

          {/* Contenu sur l'image */}
          <View style={styles.imageContentOverlay} pointerEvents="none">
            <Text style={styles.productNameOverlay}>{product.name}</Text>
            <Text style={styles.productDescriptionOverlay} numberOfLines={2}>
              {product.description}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section info détaillée */}
        <View style={styles.productInfoDetailed}>
          {/* Sélecteur de tailles */}
          {product.sizes && (
            <View style={styles.sizeSelector}>
              <Text style={styles.sizeLabel}>Taille :</Text>
              <View style={styles.sizeButtonsVertical}>
                {['M', 'L', 'XL', 'XXL'].map((size) => (
                  product.sizes[size] && (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButtonFull,
                        selectedSize === size && styles.sizeButtonActive
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSizes(prev => ({
                          ...prev,
                          [product.id]: size
                        }));
                      }}
                    >
                      <Text style={[
                        styles.sizeButtonText,
                        selectedSize === size && styles.sizeButtonTextActive
                      ]}>
                        {getSizeDisplayText(product, size)}
                      </Text>
                    </TouchableOpacity>
                  )
                ))}
              </View>
            </View>
          )}

          {/* Badge quantité */}
          {isInCart && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>Dans le panier: {quantity}</Text>
            </View>
          )}

          {/* Options de personnalisation */}
          {product.customizationOptions && (
            renderCustomizationOptions(product)
          )}
        </View>
      </View>
    );
  };

  // Rendu d'une boisson (grille 3 colonnes)
  const renderBoissonCard = (product) => {
    const quantity = getProductQuantity(orderItems, product.id);
    const isInCart = quantity > 0;
    const isUnavailable = product.available === false;

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.boissonCard, isUnavailable && { opacity: 0.5 }]}
        onPress={() => {
          if (isUnavailable) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          triggerCartAnimation(product, null);
          addItem(product);
          // Retour au menu après l'ajout
          setTimeout(() => {
            router.back();
          }, 300);
        }}
        activeOpacity={isUnavailable ? 1 : 0.8}
      >
        {isUnavailable && (
          <View style={restrictionStyles.productBadge}>
            <Text style={restrictionStyles.productBadgeText}>Indisponible</Text>
          </View>
        )}
        {isInCart && !isUnavailable && (
          <View style={styles.boissonQuantityBadge}>
            <Text style={styles.boissonQuantityText}>{quantity}</Text>
          </View>
        )}
        <View style={styles.boissonImageContainer}>
          <ProductImage
            product={product}
            style={styles.boissonImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.boissonInfo}>
          <View style={styles.boissonTextContainer}>
            <Text style={styles.boissonName} numberOfLines={2}>{product.name}</Text>
            {product.description ? (
              <Text style={styles.boissonDescription} numberOfLines={1}>{product.description}</Text>
            ) : null}
          </View>
          <View style={styles.boissonBottomContainer}>
            <Text style={styles.boissonPrice}>{product.price.toFixed(2)}€</Text>
            <View style={styles.boissonAddButton}>
              <Text style={styles.boissonAddButtonText}>{isUnavailable ? 'Indisponible' : 'Ajouter'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Rendu d'un plat - fonction principale
  const renderProduct = (product) => {
    // Déterminer la taille par défaut basée sur les tailles disponibles du produit
    const defaultSize = product.sizes ? Object.keys(product.sizes)[0] : null;
    const selectedSize = selectedSizes[product.id] || defaultSize;
    const currentPrice = product.sizes && selectedSize && product.sizes[selectedSize] ? product.sizes[selectedSize].price : product.price;
    const productIdWithSize = product.sizes ? `${product.id}_${selectedSize}` : product.id;
    const quantity = getProductQuantity(orderItems, productIdWithSize);
    const isInCart = quantity > 0;

    // Vérification de la présence d'image (locale ou Firebase)
    const hasValidImage = product.image || product.firebaseImageUrl;

    // Vérifier si ce produit individuel est restreint (ex: pizza briochée dans desserts)
    const productIsRestricted = isProductRestricted(product);

    // Wrapper avec overlay de restriction si le produit est restreint individuellement
    const productContent = hasValidImage
      ? renderProductWithImage(product, selectedSize, currentPrice, productIdWithSize, quantity, isInCart)
      : renderProductWithoutImage(product, selectedSize, currentPrice, productIdWithSize, quantity, isInCart);

    if (productIsRestricted && !categoryRestricted) {
      const isUnavailable = product.available === false;
      const isEveningRestricted = (isEveningOnlyProduct(product.id) || (product.category && isEveningOnlyCategory(product.category))) && !eveningAvailable;
      const badgeLabel = isUnavailable ? 'Indisponible' : isEveningRestricted ? 'Dès 18h' : 'Fermé';
      const badgeIcon = isUnavailable ? "close-circle-outline" : isEveningRestricted ? "time-outline" : "lock-closed-outline";
      const badgeColor = isUnavailable ? "#FFFFFF" : isEveningRestricted ? "#FCD34D" : "#FFFFFF";
      return (
        <View key={product.id} style={{ opacity: 0.5 }}>
          {productContent}
          <View style={restrictionStyles.productBadge}>
            <Ionicons name={badgeIcon} size={14} color={badgeColor} />
            <Text style={restrictionStyles.productBadgeText}>{badgeLabel}</Text>
          </View>
        </View>
      );
    }

    return productContent;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient comme l'écran d'accueil */}
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.backgroundGradient}
      />

      {/* Animation d'arrière-plan */}
      <Animated.View
        style={[
          styles.backgroundAnimation1,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundAnimation2,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundAnimation3,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />

      {/* Emojis flottants de fast food */}
      {floatingEmojis.map((animValue, index) => {
        const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🧀', '🥯', '🌯'];
        const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];
        const { startX, endX, startY, endY, amplitude } = emojiTrajectories[index];

        return (
          <Animated.View
            key={index}
            style={[
              styles.floatingEmoji,
              {
                transform: [
                  {
                    translateY: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [startY, endY],
                    }),
                  },
                  {
                    translateX: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [startX, endX],
                    }),
                  },
                  {
                    translateX: animValue.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, amplitude, 0, -amplitude, 0],
                    }),
                  },
                ],
                opacity: animValue.interpolate({
                  inputRange: [0, 0.1, 0.9, 1],
                  outputRange: [0, 0.7, 0.7, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emojiText}>{currentEmoji}</Text>
          </Animated.View>
        );
      })}
      
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.categoryEmoji}>{currentCategory.emoji}</Text>
            <Text style={styles.categoryName}>{currentCategory.name}</Text>
          </View>
          
        </View>
      </LinearGradient>

      {/* Bannière de restriction horaire */}
      {categoryRestricted && (
        <View style={restrictionStyles.banner}>
          <View style={restrictionStyles.bannerContent}>
            <Ionicons name="time-outline" size={20} color="#FCD34D" />
            <View style={restrictionStyles.bannerTextContainer}>
              <Text style={restrictionStyles.bannerTitle}>Disponible à partir de 18h</Text>
              <Text style={restrictionStyles.bannerSubtitle}>
                Cette catégorie n'est pas encore disponible. Revenez à partir de 18h pour commander.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Liste des produits */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            // Pour les bowls et tacos, afficher une seule carte avec personnalisation
            (id === ProductCategory.BOWLS || id === ProductCategory.TACOS) ? (
              renderSingleCardWithCustomization(id)
            ) : id === ProductCategory.DESSERTS ? (
              // Pour les desserts, traiter séparément les produits personnalisables et normaux
              products.map(product => {
                if (product.customizable && product.id === 'milkshake-custom') {
                  return renderSingleCardWithCustomization(id, product);
                } else {
                  return renderProduct(product);
                }
              })
            ) : id === ProductCategory.BOISSONS ? (
              // Pour les boissons, afficher en grille 3 colonnes
              <View style={styles.boissonsGrid}>
                {products.map(renderBoissonCard)}
              </View>
            ) : (
              // Pour les autres catégories, afficher tous les produits
              // Pour les pizzas, mettre la pizza à composer en premier
              (id === ProductCategory.PIZZA
                ? [...products].sort((a, b) => {
                    const aIsComposee = a.id === 'pizza-composee' || (a.name || '').toLowerCase().includes('composer');
                    const bIsComposee = b.id === 'pizza-composee' || (b.name || '').toLowerCase().includes('composer');
                    if (aIsComposee && !bIsComposee) return -1;
                    if (!aIsComposee && bIsComposee) return 1;
                    return 0;
                  })
                : products
              ).map(renderProduct)
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun plat disponible pour cette catégorie</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Éléments animés pour l'ajout au panier */}
      {animatingItems.map((animatedItem) => (
        <Animated.View
          key={animatedItem.id}
          style={[
            styles.animatedItem,
            {
              transform: [
                {
                  translateX: animatedItem.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [animatedItem.startX, animatedItem.endX],
                  }),
                },
                {
                  translateY: animatedItem.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [animatedItem.startY, animatedItem.endY],
                  }),
                },
                {
                  scale: animatedItem.animatedValue.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [1, 1.2, 0.8, 0.3],
                  }),
                },
              ],
              opacity: animatedItem.animatedValue.interpolate({
                inputRange: [0, 0.1, 0.8, 1],
                outputRange: [1, 1, 1, 0],
              }),
            },
          ]}
        >
          <View style={styles.animatedItemContent}>
            <View style={styles.animatedItemIcon}>
              <Ionicons name="restaurant" size={16} color={colors.neutral.white} />
            </View>
            <Text style={styles.animatedItemText} numberOfLines={1}>
              {animatedItem.product.name}
            </Text>
          </View>
        </Animated.View>
      ))}

      {/* Modal d'affichage en grand de l'image */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeImageModal}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeImageModal}
              >
                <Ionicons name="close" size={24} color={colors.neutral.white} />
              </TouchableOpacity>

              {selectedImage && (
                <Image
                  source={selectedImage}
                  style={[styles.modalImage, {
                    maxWidth: width - 40,
                    maxHeight: height - 200,
                  }]}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal de commentaire */}
      <Modal
        visible={commentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setCommentModalVisible(false);
          }}
        >
          <View style={styles.commentModalOverlay}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.commentModalContainer}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Ajouter un commentaire</Text>
              <TouchableOpacity
                onPress={() => setCommentModalVisible(false)}
                style={styles.commentModalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.neutral.gray600} />
              </TouchableOpacity>
            </View>

            {commentProduct && (
              <View style={styles.commentProductInfo}>
                <ProductImage product={commentProduct} style={styles.commentProductImage} />
                <View style={styles.commentProductDetails}>
                  <Text style={styles.commentProductName}>
                    {commentProduct.name}
                    {commentProduct.sizes && commentSize && commentProduct.sizes[commentSize]?.name && ` (${commentProduct.sizes[commentSize].name})`}
                  </Text>
                  <Text style={styles.commentProductPrice}>
                    {(() => {
                      if (commentProduct.customizable) {
                        const price = calculateCustomizedPrice(commentProduct, selectedSizes, customizations);
                        return `${price.toFixed(2)}€`;
                      } else if (commentProduct.sizes && commentSize) {
                        return `${commentProduct.sizes[commentSize]?.price?.toFixed(2)}€`;
                      } else {
                        return `${commentProduct.price?.toFixed(2)}€`;
                      }
                    })()}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.commentInputContainer}>
              <Text style={styles.commentInputLabel}>
                Commentaire (optionnel)
              </Text>
              <Text style={styles.commentInputSubtitle}>
                Ajoutez des précisions : cuisson, allergies, préférences...
              </Text>
              <TextInput
                style={styles.commentInput}
                value={currentComment}
                onChangeText={setCurrentComment}
                placeholder="Ex: Bien cuit, sans oignons, sauce à part..."
                placeholderTextColor={colors.neutral.gray400}
                multiline={true}
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.commentCharCount}>
                {currentComment.length}/200
              </Text>
            </View>

            <View style={styles.commentModalButtons}>
              <TouchableOpacity
                style={styles.commentConfirmButton}
                onPress={confirmAddToCart}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A', '#15803D']}
                  style={styles.commentConfirmGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons name="cart" size={20} color={colors.neutral.white} />
                  <Text style={styles.commentConfirmText}>
                    Ajouter au panier
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.commentCancelButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCommentModalVisible(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.commentCancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

