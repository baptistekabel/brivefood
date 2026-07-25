import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';
import { useProducts } from '../../src/context/ProductsContext';
import AddProductModal from '../../src/components/admin/AddProductModal';
import EditProductModal from '../../src/components/admin/EditProductModal';
import EditCustomizationModal from '../../src/components/admin/EditCustomizationModal';
import ProductImage from '../../src/components/common/ProductImage';
import categoryInfo from '../../src/data/categories';

export default function ProductsManager() {
  const {
    products,
    productsByCategory,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    isFirebaseConnected,
    totalProducts
  } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const handleAddProduct = async (productData) => {
    try {
      console.log('🎯 Adding product from admin interface:', productData.name);

      const result = await addProduct(productData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { success: true, id: result.id };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error adding product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  const handleEditProduct = (product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (productData) => {
    try {
      console.log('🔄 Updating product from admin interface:', productData.name);

      // Extraire l'ID et le reste des données
      const { id, ...updates } = productData;

      const result = await updateProduct(id, updates);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  const handleToggleAvailability = async (product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAvailable = product.available === false ? true : false;
    const result = await updateProduct(product.id, { available: newAvailable });
    if (!result.success) {
      Alert.alert('Erreur', 'Impossible de modifier la disponibilité');
    }
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            const result = await deleteProduct(product.id);

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          }
        }
      ]
    );
  };

  // Filtrer les produits selon la catégorie sélectionnée
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filtrer par catégorie</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.filterList}
      >
        {[{ key: 'all', name: 'Toutes' }, ...Object.entries(categoryInfo).map(([key, info]) => ({ key, name: info.name, emoji: info.emoji }))].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              selectedCategory === item.key && styles.filterChipActive
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(item.key);
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
          >
            {item.emoji && <Text style={styles.filterEmoji}>{item.emoji}</Text>}
            <Text style={[
              styles.filterText,
              selectedCategory === item.key && styles.filterTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductItem = ({ item: product }) => {
    const isUnavailable = product.available === false;

    return (
    <View style={[styles.productCard, isUnavailable && { opacity: 0.55 }]}>
      {isUnavailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableBadgeText}>INDISPONIBLE</Text>
        </View>
      )}
      <View style={styles.productHeader}>
        {/* Image du produit - key force le re-render quand l'image change */}
        <ProductImage
          key={`${product.id}-${product.firebaseImageUrl || product.updatedAt?.seconds || ''}`}
          product={product}
          style={styles.productImage}
          showPlaceholder={true}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>
            {categoryInfo[product.category]?.emoji} {categoryInfo[product.category]?.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(product)}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.primary.main} />
          </TouchableOpacity>

          <Switch
            value={!isUnavailable}
            onValueChange={() => handleToggleAvailability(product)}
            trackColor={{ false: '#EF4444', true: '#22C55E' }}
            thumbColor={colors.neutral.white}
            style={styles.availabilitySwitch}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(product)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.priceSection}>
          {product.sizes && Object.keys(product.sizes).length > 0 ? (
            <View style={styles.pricesGrid}>
              {Object.entries(product.sizes).map(([size, sizeData]) => (
                <View key={size} style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Taille {size}</Text>
                  <Text style={styles.priceValue}>{sizeData.price}€</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Prix</Text>
              <Text style={styles.priceValue}>{product.price}€</Text>
            </View>
          )}
        </View>

        {/* Personnalisations disponibles */}
        {product.customizable && product.customizationOptions && (
          <View style={styles.customizationSection}>
            <View style={styles.customizationHeader}>
              <Text style={styles.customizationTitle}>Options de personnalisation</Text>
              <TouchableOpacity
                style={styles.editCustomizationButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedProduct(product);
                  setShowCustomizationModal(true);
                }}
              >
                <Ionicons name="pencil" size={16} color={colors.primary.main} />
                <Text style={styles.editCustomizationText}>Modifier</Text>
              </TouchableOpacity>
            </View>
            {Object.entries(product.customizationOptions).filter(([, v]) => v != null).map(([key, customization]) => (
              <View key={key} style={styles.customizationGroup}>
                <Text style={styles.customizationGroupTitle}>
                  {customization.title}
                  {customization.required && <Text style={styles.requiredMark}> *</Text>}
                  {customization.maxSelections && (
                    <Text style={styles.maxSelections}> (max {customization.maxSelections})</Text>
                  )}
                </Text>
                {customization.subtitle && (
                  <Text style={styles.customizationSubtitle}>{customization.subtitle}</Text>
                )}
                <View style={styles.customizationOptions}>
                  {customization.options?.map((option, index) => (
                    <View key={option.id || index} style={styles.customizationOption}>
                      <Text style={styles.customizationOptionName}>{option.name}</Text>
                      {option.price > 0 ? (
                        <Text style={styles.customizationOptionPrice}>+{option.price}€</Text>
                      ) : option.price === 0 ? (
                        <Text style={styles.customizationOptionFree}>Gratuit</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bouton ajouter personnalisation si le produit n'est pas personnalisable */}
        {!product.customizable && (
          <TouchableOpacity
            style={styles.addCustomizationButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedProduct(product);
              setShowCustomizationModal(true);
            }}
          >
            <Ionicons name="options-outline" size={18} color={colors.primary.main} />
            <Text style={styles.addCustomizationText}>Ajouter des personnalisations</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={colors.neutral.gray400} />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptyMessage}>
        {selectedCategory === 'all'
          ? 'Commencez par ajouter votre premier produit'
          : `Aucun produit dans la catégorie ${categoryInfo[selectedCategory]?.name}`
        }
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#111111']}
          style={styles.gradient}
        >
          <StatusBar style="light" />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Gestion des Produits</Text>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Produits</Text>
              </View>
            </View>
          </View>

          {/* Filtres */}
          {renderCategoryFilter()}

          {/* Liste des produits */}
          <FlatList
            ref={flatListRef}
            data={filteredProducts}
            keyExtractor={(item) => `${item.id}-${item.updatedAt?.seconds || item.firebaseImageUrl || ''}`}
            extraData={filteredProducts}
            renderItem={renderProductItem}
            style={styles.productList}
            contentContainerStyle={styles.productListContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.neutral.white}
                colors={[colors.primary.main]}
              />
            }
            showsVerticalScrollIndicator={false}
          />

          {/* Bouton d'ajout */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAddModal(true);
            }}
          >
            <LinearGradient
              colors={[colors.primary.main, colors.primary.dark]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color={colors.neutral.white} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Modal d'ajout */}
          <AddProductModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAddProduct={handleAddProduct}
          />

          {/* Modal d'édition */}
          <EditProductModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
            onUpdateProduct={handleUpdateProduct}
            product={selectedProduct}
          />

          {/* Modal de personnalisation */}
          <EditCustomizationModal
            visible={showCustomizationModal}
            onClose={() => {
              setShowCustomizationModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSave={async (productId, updates) => {
              const result = await updateProduct(productId, updates);
              if (!result.success) {
                throw new Error(result.error);
              }
            }}
          />

          {/* Affichage d'erreur */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    flex: 1,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  connectionText: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterEmoji: {
    marginRight: spacing.xs,
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterTextActive: {
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.medium,
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  productInfo: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  availabilitySwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  unavailableBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    zIndex: 10,
  },
  unavailableBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  productCategory: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    lineHeight: typography.fontSizes.sm * 1.4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    gap: spacing.sm,
  },
  priceSection: {
    marginBottom: spacing.sm,
  },
  pricesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
  },
  customizationSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  customizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  customizationTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  editCustomizationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  editCustomizationText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
    marginLeft: 4,
  },
  addCustomizationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    gap: spacing.xs,
  },
  addCustomizationText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
  },
  customizationGroup: {
    marginBottom: spacing.xs,
  },
  customizationGroupTitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: 2,
  },
  customizationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  customizationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  customizationOptionName: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray600,
  },
  customizationOptionPrice: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  customizationSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  requiredMark: {
    color: colors.status.error,
    fontFamily: typography.fontFamily.bold,
  },
  maxSelections: {
    color: colors.neutral.gray500,
    fontFamily: typography.fontFamily.regular,
  },
  customizationOptionFree: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.status.success,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  addButton: {
    position: 'absolute',
    bottom: 120,
    right: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.status.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.white,
    marginLeft: spacing.xs,
  },
});