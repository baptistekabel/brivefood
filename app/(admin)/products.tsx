import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { ProductCategory } from '../../src/types';
import { isTablet, isLandscape, getResponsiveStyles } from '../../src/utils/deviceUtils';
import productsByCategory from '../../src/data/products.js';
import categoryInfo from '../../src/data/categories.js';

export default function ProductPriceManagement() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPriceM, setNewPriceM] = useState('');
  const [newPriceL, setNewPriceL] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customizationPrices, setCustomizationPrices] = useState({});

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();
  const { width: screenWidth } = Dimensions.get('window');

  // Suppression des emojis flottants pour un design plus professionnel

  // Utiliser les catégories du client (données synchronisées)
  const categoryStyles = categoryInfo;

  // Fonction pour convertir les données client en format admin
  const convertClientDataToAdminFormat = () => {
    const adminProducts = [];

    // Parcourir toutes les catégories de produits du client
    Object.entries(productsByCategory).forEach(([categoryKey, categoryProducts]) => {
      categoryProducts.forEach((product) => {
        // Déterminer si le produit a des tailles
        const hasSizes = product.sizes && Object.keys(product.sizes).length > 0;

        const adminProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          category: categoryKey,
          categoryName: categoryInfo[categoryKey]?.name || categoryKey,
          hasSizes: hasSizes,
        };

        if (hasSizes) {
          // Produit avec tailles (M/L)
          adminProduct.prices = {};
          Object.entries(product.sizes).forEach(([sizeKey, sizeData]) => {
            adminProduct.prices[sizeKey] = sizeData.price;
          });
        } else {
          // Produit avec prix unique
          adminProduct.price = product.price;
        }

        // Ajouter les options de personnalisation si elles existent
        if (product.customizable && product.customizationOptions) {
          adminProduct.customizable = true;
          adminProduct.customizationOptions = product.customizationOptions;
        }

        adminProducts.push(adminProduct);
      });
    });

    return adminProducts;
  };

  // Produits synchronisés avec l'app client
  const defaultProducts = convertClientDataToAdminFormat();

  // Initialisation des produits au chargement
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Charger les produits synchronisés avec l'app client
      console.log('Loading synchronized product catalog with', defaultProducts.length, 'products from client data');

      // Essayer de charger les prix personnalisés depuis le stockage
      const storedProducts = await AsyncStorage.getItem('@admin_product_prices');
      if (storedProducts) {
        const savedPrices = JSON.parse(storedProducts);
        // Fusionner les données client avec les prix personnalisés admin
        const updatedProducts = defaultProducts.map(product => {
          const savedProduct = savedPrices.find(saved => saved.id === product.id);
          if (savedProduct) {
            // Conserver les prix personnalisés de l'admin
            return {
              ...product,
              ...(product.hasSizes
                ? { prices: savedProduct.prices }
                : { price: savedProduct.price }
              )
            };
          }
          return product;
        });
        setProducts(updatedProducts);
      } else {
        // Première utilisation : utiliser les données client par défaut
        setProducts(defaultProducts);
        await AsyncStorage.setItem('@admin_product_prices', JSON.stringify(defaultProducts));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(defaultProducts);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      // Sauvegarder les prix personnalisés admin (seuls les prix changent, pas les produits eux-mêmes)
      await AsyncStorage.setItem('@admin_product_prices', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    if (product.hasSizes) {
      setNewPriceM((product.prices?.M || 0).toString());
      setNewPriceL((product.prices?.L || 0).toString());
    } else {
      setNewPrice((product.price || 0).toString());
    }

    // Initialiser les prix des options de personnalisation
    if (product.customizable && product.customizationOptions) {
      const customPrices = {};
      Object.entries(product.customizationOptions).forEach(([optionKey, optionData]) => {
        customPrices[optionKey] = {};
        (optionData.options || []).forEach(option => {
          customPrices[optionKey][option.id] = option.price.toString();
        });
      });
      setCustomizationPrices(customPrices);
    }

    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePrice = async () => {
    if (editingProduct.hasSizes) {
      // Produits avec tailles (pizzas, burgers, pâtes, salades)
      if (!newPriceM || !newPriceL) {
        Alert.alert('Erreur', 'Veuillez remplir tous les prix');
        return;
      }

      const priceM = parseFloat(newPriceM);
      const priceL = parseFloat(newPriceL);

      if (isNaN(priceM) || isNaN(priceL) || priceM <= 0 || priceL <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer des prix valides');
        return;
      }

      if (priceL <= priceM) {
        Alert.alert('Erreur', 'Le prix L doit être supérieur au prix M');
        return;
      }

      let updatedProduct = { ...editingProduct, prices: { M: priceM, L: priceL } };

      // Mettre à jour les prix des options de personnalisation
      if (editingProduct.customizable && editingProduct.customizationOptions) {
        const updatedCustomizationOptions = { ...editingProduct.customizationOptions };
        Object.entries(customizationPrices).forEach(([optionKey, optionPrices]) => {
          if (updatedCustomizationOptions[optionKey]) {
            updatedCustomizationOptions[optionKey].options = (updatedCustomizationOptions[optionKey].options || []).map(option => {
              const newPrice = parseFloat(optionPrices[option.id]);
              return !isNaN(newPrice) ? { ...option, price: newPrice } : option;
            });
          }
        });
        updatedProduct.customizationOptions = updatedCustomizationOptions;
      }

      const updatedProducts = products.map(product =>
        product.id === editingProduct.id ? updatedProduct : product
      );

      await saveProducts(updatedProducts);
    } else {
      // Produits sans tailles (desserts, boissons, tacos)
      if (!newPrice) {
        Alert.alert('Erreur', 'Veuillez remplir le prix');
        return;
      }

      const price = parseFloat(newPrice);

      if (isNaN(price) || price <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer un prix valide');
        return;
      }

      let updatedProduct = { ...editingProduct, price: price };

      // Mettre à jour les prix des options de personnalisation
      if (editingProduct.customizable && editingProduct.customizationOptions) {
        const updatedCustomizationOptions = { ...editingProduct.customizationOptions };
        Object.entries(customizationPrices).forEach(([optionKey, optionPrices]) => {
          if (updatedCustomizationOptions[optionKey]) {
            updatedCustomizationOptions[optionKey].options = (updatedCustomizationOptions[optionKey].options || []).map(option => {
              const newPrice = parseFloat(optionPrices[option.id]);
              return !isNaN(newPrice) ? { ...option, price: newPrice } : option;
            });
          }
        });
        updatedProduct.customizationOptions = updatedCustomizationOptions;
      }

      const updatedProducts = products.map(product =>
        product.id === editingProduct.id ? updatedProduct : product
      );

      await saveProducts(updatedProducts);
    }

    setIsModalVisible(false);
    setEditingProduct(null);
    setNewPriceM('');
    setNewPriceL('');
    setNewPrice('');
    setCustomizationPrices({});

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Prix mis à jour avec succès');
  };

  // Fonction pour mettre à jour les prix des options de personnalisation
  const updateCustomizationPrice = (optionKey, optionId, newPrice) => {
    setCustomizationPrices(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [optionId]: newPrice
      }
    }));
  };

  // Filtrer les produits par catégorie
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);


  const renderProductItem = ({ item }) => (
    <View style={[
      styles.productCard,
      isTabletDevice && isLandscapeMode && styles.productCardTablet
    ]}>
      <View style={[
        styles.productHeader,
        isTabletDevice && isLandscapeMode && styles.productHeaderTablet
      ]}>
        <View style={styles.productInfo}>
          <Text style={[
            styles.productName,
            isTabletDevice && isLandscapeMode && styles.productNameTablet
          ]}>{item.name}</Text>
          <Text style={[
            styles.productDescription,
            isTabletDevice && isLandscapeMode && styles.productDescriptionTablet
          ]}>{item.description}</Text>

          {/* Indicateur d'options de personnalisation */}
          <View style={[
            styles.customizationIndicator,
            isTabletDevice && isLandscapeMode && styles.customizationIndicatorTablet
          ]}>
            <Ionicons
              name={item.customizable && item.customizationOptions ? "options" : "checkmark-circle"}
              size={isTabletDevice && isLandscapeMode ? 18 : 14}
              color={item.customizable && item.customizationOptions ? colors.accent?.main || '#FF6B35' : colors.primary?.main || '#000000'}
            />
            <Text style={[
              styles.customizationIndicatorText,
              isTabletDevice && isLandscapeMode && styles.customizationIndicatorTextTablet,
              item.customizable && item.customizationOptions && styles.customizationIndicatorTextActive
            ]}>
              {item.customizable && item.customizationOptions ? 'Personnalisable' : 'Produit complet'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[
        styles.pricesContainer,
        isTabletDevice && isLandscapeMode && styles.pricesContainerTablet
      ]}>
        {item.hasSizes ? (
          // Produits avec tailles (pizzas, burgers, pâtes, salades)
          <>
            <View style={[styles.priceItem, isTabletDevice && isLandscapeMode && styles.priceItemTablet]}>
              <Text style={[styles.sizeLabel, isTabletDevice && isLandscapeMode && styles.sizeLabelTablet]}>Taille M</Text>
              <Text style={[styles.priceValue, isTabletDevice && isLandscapeMode && styles.priceValueTablet]}>
                {(item.prices?.M || 0).toFixed(2)} €
              </Text>
            </View>
            <View style={[styles.priceItem, isTabletDevice && isLandscapeMode && styles.priceItemTablet]}>
              <Text style={[styles.sizeLabel, isTabletDevice && isLandscapeMode && styles.sizeLabelTablet]}>Taille L</Text>
              <Text style={[styles.priceValue, isTabletDevice && isLandscapeMode && styles.priceValueTablet]}>
                {(item.prices?.L || 0).toFixed(2)} €
              </Text>
            </View>
          </>
        ) : (
          // Produits sans tailles (desserts, boissons, tacos)
          <View style={[styles.priceItem, styles.singlePriceItem, isTabletDevice && isLandscapeMode && styles.singlePriceItemTablet]}>
            <Text style={[styles.singlePriceLabel, isTabletDevice && isLandscapeMode && styles.singlePriceLabelTablet]}>Prix</Text>
            <Text style={[styles.priceValue, styles.singlePriceValue, isTabletDevice && isLandscapeMode && styles.singlePriceValueTablet]}>
              {(item.price || 0).toFixed(2)} €
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.editButton,
          isTabletDevice && isLandscapeMode && styles.editButtonTablet
        ]}
        onPress={() => handleEditProduct(item)}
      >
        <LinearGradient
          colors={['#000000', '#000000', '#000000']}
          style={[
            styles.editButtonGradient,
            isTabletDevice && isLandscapeMode && styles.editButtonGradientTablet
          ]}
        >
          <Ionicons name="pencil" size={isTabletDevice && isLandscapeMode ? 20 : 16} color={colors.neutral.white} />
          <Text style={[
            styles.editButtonText,
            isTabletDevice && isLandscapeMode && styles.editButtonTextTablet
          ]}>Modifier les prix</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestion des Prix</Text>
          <View style={styles.headerRight}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{filteredProducts.length} produits</Text>
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersList}
          >
            <TouchableOpacity
              style={[styles.filterBadge, selectedCategory === 'all' && styles.activeFilterBadge]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.filterText, selectedCategory === 'all' && styles.activeFilterText]}>Tout ({products.length})</Text>
            </TouchableOpacity>
            {Object.keys(ProductCategory).map((categoryKey) => {
              const categoryValue = ProductCategory[categoryKey];
              const style = categoryStyles[categoryValue];
              const categoryProducts = products.filter(p => p.category === categoryValue);
              if (categoryProducts.length === 0) return null;

              return (
                <TouchableOpacity
                  key={categoryValue}
                  style={[styles.filterBadge, selectedCategory === categoryValue && styles.activeFilterBadge]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(categoryValue);
                  }}
                >
                  <Text style={[styles.filterText, selectedCategory === categoryValue && styles.activeFilterText]}>
                    {style?.name || categoryValue} ({categoryProducts.length})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={[
          styles.productsContainer,
          isTabletDevice && isLandscapeMode && styles.productsContainerTablet
        ]}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.productsList,
              isTabletDevice && isLandscapeMode && styles.productsListTablet
            ]}
            numColumns={isTabletDevice && isLandscapeMode ? 2 : 1}
            key={isTabletDevice && isLandscapeMode ? 'tablet' : 'mobile'} // Force re-render when columns change
            columnWrapperStyle={isTabletDevice && isLandscapeMode ? styles.productRow : null}
          />
        </View>

        {/* Edit Price Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer,
              isTabletDevice && isLandscapeMode && styles.modalContainerTablet
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Modifier les prix - {editingProduct?.name}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={[
                  styles.modalContent,
                  isTabletDevice && isLandscapeMode && styles.modalContentTablet
                ]}
                showsVerticalScrollIndicator={false}
              >
                {editingProduct?.hasSizes ? (
                  // Produits avec tailles (pizzas, burgers, pâtes, salades)
                  <>
                    <View style={[
                      styles.inputContainer,
                      isTabletDevice && isLandscapeMode && styles.inputContainerTablet
                    ]}>
                      <Text style={[
                        styles.inputLabel,
                        isTabletDevice && isLandscapeMode && styles.inputLabelTablet
                      ]}>Prix Taille M (€)</Text>
                      <TextInput
                        style={[
                          styles.priceInput,
                          isTabletDevice && isLandscapeMode && styles.priceInputTablet
                        ]}
                        value={newPriceM}
                        onChangeText={setNewPriceM}
                        keyboardType="decimal-pad"
                        placeholder="10.50"
                      />
                    </View>

                    <View style={[
                      styles.inputContainer,
                      isTabletDevice && isLandscapeMode && styles.inputContainerTablet
                    ]}>
                      <Text style={[
                        styles.inputLabel,
                        isTabletDevice && isLandscapeMode && styles.inputLabelTablet
                      ]}>Prix Taille L (€)</Text>
                      <TextInput
                        style={[
                          styles.priceInput,
                          isTabletDevice && isLandscapeMode && styles.priceInputTablet
                        ]}
                        value={newPriceL}
                        onChangeText={setNewPriceL}
                        keyboardType="decimal-pad"
                        placeholder="14.50"
                      />
                    </View>
                  </>
                ) : (
                  // Produits sans tailles (desserts, boissons, tacos)
                  <View style={[
                    styles.inputContainer,
                    isTabletDevice && isLandscapeMode && styles.inputContainerTablet
                  ]}>
                    <Text style={[
                      styles.inputLabel,
                      isTabletDevice && isLandscapeMode && styles.inputLabelTablet
                    ]}>Prix (€)</Text>
                    <TextInput
                      style={[
                        styles.priceInput,
                        isTabletDevice && isLandscapeMode && styles.priceInputTablet
                      ]}
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="decimal-pad"
                      placeholder="4.50"
                    />
                  </View>
                )}

                {/* Options de personnalisation */}
                {editingProduct?.customizable && editingProduct?.customizationOptions ? (
                  <View style={[
                    styles.customizationSection,
                    isTabletDevice && isLandscapeMode && styles.customizationSectionTablet
                  ]}>
                    <Text style={[
                      styles.sectionTitle,
                      isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
                    ]}>Options de personnalisation</Text>
                    {Object.entries(editingProduct.customizationOptions || {}).map(([optionKey, optionData]) => (
                      <View key={optionKey} style={[
                        styles.customizationGroup,
                        isTabletDevice && isLandscapeMode && styles.customizationGroupTablet
                      ]}>
                        <Text style={[
                          styles.customizationGroupTitle,
                          isTabletDevice && isLandscapeMode && styles.customizationGroupTitleTablet
                        ]}>{optionData.title}</Text>
                        {(optionData.options || []).map((option) => (
                          <View key={option.id} style={[
                            styles.customizationOption,
                            isTabletDevice && isLandscapeMode && styles.customizationOptionTablet
                          ]}>
                            <Text style={[
                              styles.optionName,
                              isTabletDevice && isLandscapeMode && styles.optionNameTablet
                            ]}>{option.name}</Text>
                            <TextInput
                              style={[
                                styles.optionPriceInput,
                                isTabletDevice && isLandscapeMode && styles.optionPriceInputTablet
                              ]}
                              value={customizationPrices[optionKey]?.[option.id] || ''}
                              onChangeText={(value) => updateCustomizationPrice(optionKey, option.id, value)}
                              keyboardType="decimal-pad"
                              placeholder="1.50"
                            />
                            <Text style={[
                              styles.euroSymbol,
                              isTabletDevice && isLandscapeMode && styles.euroSymbolTablet
                            ]}>€</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={[
                    styles.noCustomizationSection,
                    isTabletDevice && isLandscapeMode && styles.noCustomizationSectionTablet
                  ]}>
                    <View style={[
                      styles.noCustomizationCard,
                      isTabletDevice && isLandscapeMode && styles.noCustomizationCardTablet
                    ]}>
                      <Ionicons
                        name="checkmark-circle"
                        size={isTabletDevice && isLandscapeMode ? 32 : 24}
                        color={colors.primary?.main || '#000000'}
                        style={styles.noCustomizationIcon}
                      />
                      <Text style={[
                        styles.noCustomizationTitle,
                        isTabletDevice && isLandscapeMode && styles.noCustomizationTitleTablet
                      ]}>Produit complet</Text>
                      <Text style={[
                        styles.noCustomizationText,
                        isTabletDevice && isLandscapeMode && styles.noCustomizationTextTablet
                      ]}>Ce produit n'a pas d'options de personnalisation ou toutes les options sont incluses dans le prix de base.</Text>
                    </View>
                  </View>
                )}

                <View style={[
                  styles.modalButtons,
                  isTabletDevice && isLandscapeMode && styles.modalButtonsTablet
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      isTabletDevice && isLandscapeMode && styles.cancelButtonTablet
                    ]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={[
                      styles.cancelButtonText,
                      isTabletDevice && isLandscapeMode && styles.cancelButtonTextTablet
                    ]}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isTabletDevice && isLandscapeMode && styles.saveButtonTablet
                    ]}
                    onPress={handleSavePrice}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000', '#000000']}
                      style={[
                        styles.saveButtonGradient,
                        isTabletDevice && isLandscapeMode && styles.saveButtonGradientTablet
                      ]}
                    >
                      <Text style={[
                        styles.saveButtonText,
                        isTabletDevice && isLandscapeMode && styles.saveButtonTextTablet
                      ]}>Sauvegarder</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Suppression des emojis flottants pour un design plus professionnel */}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  productsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  productsList: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for tab bar
  },
  productCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    marginBottom: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statsText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  singlePriceItem: {
    flex: 1,
  },
  singlePriceLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  singlePriceValue: {
    fontSize: typography.fontSizes['2xl'],
    textAlign: 'center',
  },
  editButton: {
    borderRadius: borderRadius.md,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    backgroundColor: colors.neutral.gray50,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Filter styles
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filtersList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  filterBadge: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  activeFilterBadge: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  activeFilterText: {
    color: colors.neutral.white,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },

  // ========== STYLES TABLETTE PAYSAGE ==========

  // Container et layout
  productsContainerTablet: {
    paddingHorizontal: spacing.xl,
  },
  productsListTablet: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  productRow: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },

  // Cards produits pour tablette
  productCardTablet: {
    flex: 1,
    minHeight: 280,
    maxWidth: '48%', // Pour 2 colonnes avec gap
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  productHeaderTablet: {
    marginBottom: spacing.lg,
  },

  productNameTablet: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.sm,
  },

  productDescriptionTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.4,
    marginBottom: spacing.md,
  },

  // Prix pour tablette
  pricesContainerTablet: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },

  priceItemTablet: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  sizeLabelTablet: {
    fontSize: typography.fontSizes.base,
    marginBottom: spacing.sm,
  },

  priceValueTablet: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
  },

  singlePriceItemTablet: {
    paddingVertical: spacing.md,
  },

  singlePriceLabelTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.sm,
  },

  singlePriceValueTablet: {
    fontSize: typography.fontSizes['3xl'],
  },

  // Bouton d'édition pour tablette
  editButtonTablet: {
    borderRadius: borderRadius.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  editButtonGradientTablet: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },

  editButtonTextTablet: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
  },

  // Modal pour tablette
  modalContainerTablet: {
    width: '85%',
    maxWidth: 800,
    minWidth: 600,
    maxHeight: '80%',
    borderRadius: borderRadius['2xl'],
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
  },

  // Styles pour les options de personnalisation
  customizationSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  customizationGroup: {
    marginBottom: spacing.lg,
  },
  customizationGroupTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  customizationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  optionName: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  optionPriceInput: {
    width: 80,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSizes.sm,
    backgroundColor: colors.neutral.white,
    textAlign: 'center',
    marginLeft: spacing.sm,
  },
  euroSymbol: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
    minWidth: 15,
  },

  // Styles spécifiques pour tablette
  modalContentTablet: {
    padding: spacing.xl,
  },
  inputContainerTablet: {
    marginBottom: spacing.xl,
  },
  inputLabelTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.md,
  },
  priceInputTablet: {
    padding: spacing.lg,
    fontSize: typography.fontSizes.lg,
    borderRadius: borderRadius.lg,
  },
  modalButtonsTablet: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  cancelButtonTablet: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cancelButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
  saveButtonTablet: {
    borderRadius: borderRadius.lg,
  },
  saveButtonGradientTablet: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  saveButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
  customizationSectionTablet: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.lg,
  },
  customizationGroupTablet: {
    marginBottom: spacing.xl,
  },
  customizationGroupTitleTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.md,
  },
  customizationOptionTablet: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  optionNameTablet: {
    fontSize: typography.fontSizes.base,
  },
  optionPriceInputTablet: {
    width: 100,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
  },
  euroSymbolTablet: {
    fontSize: typography.fontSizes.base,
    marginLeft: spacing.sm,
    minWidth: 20,
  },

  // Styles pour "pas d'options de personnalisation"
  noCustomizationSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  noCustomizationSectionTablet: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
  },
  noCustomizationCard: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderStyle: 'dashed',
  },
  noCustomizationCardTablet: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  noCustomizationIcon: {
    marginBottom: spacing.sm,
  },
  noCustomizationTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  noCustomizationTitleTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.sm,
  },
  noCustomizationText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.fontSizes.sm * 1.4,
  },
  noCustomizationTextTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.5,
  },

  // Indicateur de personnalisation sur les cartes
  customizationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.neutral.gray100,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  customizationIndicatorTablet: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  customizationIndicatorText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
  },
  customizationIndicatorTextTablet: {
    fontSize: typography.fontSizes.sm,
    marginLeft: spacing.sm,
  },
  customizationIndicatorTextActive: {
    color: colors.accent?.main || '#FF6B35',
  },
});