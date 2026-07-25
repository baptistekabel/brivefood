import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { ProductCategory } from '../../types';
import categoryInfo from '../../data/categories';
import ImagePicker from './ImagePicker';
import ProductImage from '../common/ProductImage';
import imageStorageService from '../../services/imageStorageService';

export default function EditProductModal({
  visible,
  onClose,
  onUpdateProduct,
  product
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ProductCategory.PIZZA,
    price: '',
    hasSizes: false,
    sizes: [],
    customizable: false,
    rating: 0,
    available: true,
    popular: false,
    firebaseImageUrl: null,
    firebaseImagePath: null,
  });

  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initialiser le formulaire avec les données du produit
  useEffect(() => {
    if (product && visible) {
      // Convertir les tailles du format objet vers array
      let sizesArray = [];
      if (product.sizes) {
        sizesArray = Object.entries(product.sizes).map(([name, data]) => ({
          name: name,
          price: data.price ? String(data.price) : ''
        }));
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || ProductCategory.PIZZA,
        price: product.price ? String(product.price) : '',
        hasSizes: !!product.sizes,
        sizes: sizesArray,
        customizable: !!product.customizable,
        rating: product.rating || 0,
        available: product.available !== false,
        popular: !!product.popular,
        firebaseImageUrl: product.firebaseImageUrl || null,
        firebaseImagePath: product.firebaseImagePath || null,
      });
      setSelectedImageUri(null);
    }
  }, [product, visible]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: ProductCategory.PIZZA,
      price: '',
      hasSizes: false,
      sizes: [],
      customizable: false,
      rating: 0,
        firebaseImageUrl: null,
      firebaseImagePath: null,
    });
    setSelectedImageUri(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'La description est requise');
      return false;
    }

    if (formData.hasSizes) {
      if (formData.sizes.length === 0) {
        Alert.alert('Erreur', 'Au moins une taille est requise');
        return false;
      }

      for (let i = 0; i < formData.sizes.length; i++) {
        const size = formData.sizes[i];
        if (!size.name.trim()) {
          Alert.alert('Erreur', `Nom de la taille ${i + 1} requis`);
          return false;
        }
        if (!size.price || isNaN(parseFloat(size.price))) {
          Alert.alert('Erreur', `Prix de la taille "${size.name}" invalide`);
          return false;
        }
      }
    } else {
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        Alert.alert('Erreur', 'Prix invalide');
        return false;
      }
    }

    return true;
  };

  const handleImageSelected = (imageUri) => {
    setSelectedImageUri(imageUri);
  };

  // Fonctions pour gérer les tailles
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', price: '' }]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateSize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Préparer les données du produit
      const updatedProductData = {
        id: product.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        customizable: formData.customizable,
        rating: formData.rating,
        available: formData.available,
        popular: formData.popular,
        firebaseImageUrl: formData.firebaseImageUrl,
        firebaseImagePath: formData.firebaseImagePath,
      };

      // Gérer les prix. On supprime explicitement l'autre format, sinon il
      // resterait en base et continuerait de s'appliquer côté client.
      if (formData.hasSizes) {
        // Convertir l'array de tailles vers un objet
        const sizesObject = {};
        formData.sizes.forEach(size => {
          sizesObject[size.name.trim()] = { price: parseFloat(size.price) };
        });
        updatedProductData.sizes = sizesObject;
        updatedProductData.__delete = ['price'];
      } else {
        updatedProductData.price = parseFloat(formData.price);
        updatedProductData.__delete = ['sizes'];
      }

      // Upload de la nouvelle image si sélectionnée
      if (selectedImageUri) {
        setUploadingImage(true);

        console.log('📸 Upload nouvelle image pour produit:', product.id);

        const uploadResult = await imageStorageService.updateProductImage(
          selectedImageUri,
          product.id,
          formData.firebaseImagePath
        );

        if (uploadResult.success) {
          updatedProductData.firebaseImageUrl = uploadResult.downloadURL;
          updatedProductData.firebaseImagePath = uploadResult.path;
          console.log('✅ Image uploadée avec succès:', uploadResult.downloadURL);
        } else {
          throw new Error(uploadResult.error || 'Erreur upload image');
        }

        setUploadingImage(false);
      }

      // Mettre à jour le produit
      const result = await onUpdateProduct(updatedProductData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
        resetForm();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Erreur mise à jour produit:', error);
      setUploadingImage(false);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', `Impossible de mettre à jour le produit: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const renderCategoryPicker = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {Object.entries(categoryInfo).map(([key, info]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryChip,
                formData.category === key && styles.categoryChipActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFormData(prev => ({ ...prev, category: key }));
              }}
            >
              <Text style={styles.categoryEmoji}>{info.emoji}</Text>
              <Text style={[
                styles.categoryText,
                formData.category === key && styles.categoryTextActive
              ]}>
                {info.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (!product) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#111111']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
            >
              <Ionicons name="close" size={24} color={colors.neutral.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Modifier le produit</Text>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Aperçu image actuelle */}
            <View style={styles.currentImageContainer}>
              <Text style={styles.fieldLabel}>Image actuelle</Text>
              <ProductImage
                product={product}
                style={styles.currentImage}
                showPlaceholder={true}
              />
            </View>

            {/* Sélecteur d'image */}
            <ImagePicker
              productId={product.id}
              currentImageUrl={formData.firebaseImageUrl}
              currentImageKey={product.imageKey}
              onImageSelected={handleImageSelected}
            />

            {uploadingImage && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.uploadingText}>Upload de la nouvelle image...</Text>
              </View>
            )}

            {/* Nom */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nom du produit</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Pizza Margherita"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Décrivez votre produit..."
                placeholderTextColor={colors.neutral.gray400}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Catégorie */}
            {renderCategoryPicker()}

            {/* Prix ou tailles */}
            <View style={styles.fieldContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.fieldLabel}>Produit avec tailles personnalisées</Text>
                <Switch
                  value={formData.hasSizes}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({
                      ...prev,
                      hasSizes: value,
                      sizes: value && prev.sizes.length === 0 ? [{ name: '', price: '' }] : prev.sizes
                    }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary.light }}
                  thumbColor={formData.hasSizes ? colors.primary.main : colors.neutral.gray400}
                />
              </View>

              {formData.hasSizes ? (
                <View style={styles.sizesContainer}>
                  <View style={styles.sizesHeader}>
                    <Text style={styles.sizesTitle}>Tailles disponibles</Text>
                    <TouchableOpacity
                      style={styles.addSizeButton}
                      onPress={addSize}
                    >
                      <Ionicons name="add" size={20} color={colors.primary.main} />
                      <Text style={styles.addSizeText}>Ajouter</Text>
                    </TouchableOpacity>
                  </View>

                  {formData.sizes.map((size, index) => (
                    <View key={index} style={styles.sizeRow}>
                      <View style={styles.sizeNameContainer}>
                        <Text style={styles.sizeLabel}>Nom</Text>
                        <TextInput
                          style={styles.textInput}
                          value={size.name}
                          onChangeText={(text) => updateSize(index, 'name', text)}
                          placeholder="Ex: S, M, L, XL..."
                          placeholderTextColor={colors.neutral.gray400}
                        />
                      </View>

                      <View style={styles.sizePriceContainer}>
                        <Text style={styles.sizeLabel}>Prix</Text>
                        <TextInput
                          style={[styles.textInput, styles.priceInput]}
                          value={size.price}
                          onChangeText={(text) => updateSize(index, 'price', text)}
                          placeholder="0.00"
                          placeholderTextColor={colors.neutral.gray400}
                          keyboardType="decimal-pad"
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.removeSizeButton}
                        onPress={() => removeSize(index)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {formData.sizes.length === 0 && (
                    <TouchableOpacity
                      style={styles.emptyState}
                      onPress={addSize}
                    >
                      <Ionicons name="add-circle-outline" size={32} color={colors.neutral.gray400} />
                      <Text style={styles.emptyStateText}>Ajouter une première taille</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TextInput
                  style={[styles.textInput, styles.priceInput]}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  placeholder="Prix en euros"
                  placeholderTextColor={colors.neutral.gray400}
                  keyboardType="decimal-pad"
                />
              )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.fieldLabel}>Personnalisable</Text>
                <Switch
                  value={formData.customizable}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({ ...prev, customizable: value }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary.light }}
                  thumbColor={formData.customizable ? colors.primary.main : colors.neutral.gray400}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.fieldLabel}>Disponible à la vente</Text>
                <Switch
                  value={formData.available}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({ ...prev, available: value }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: '#22C55E' }}
                  thumbColor={formData.available ? '#16A34A' : colors.neutral.gray400}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.fieldLabel}>Mettre en avant (populaire)</Text>
                <Switch
                  value={formData.popular}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({ ...prev, popular: value }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: colors.accent.light }}
                  thumbColor={formData.popular ? colors.accent.main : colors.neutral.gray400}
                />
              </View>

            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSizes.sm,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  currentImageContainer: {
    marginBottom: spacing.lg,
  },
  currentImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    alignSelf: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  uploadingText: {
    color: colors.primary.main,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral.white,
    fontSize: typography.fontSizes.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceInput: {
    textAlign: 'right',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryEmoji: {
    marginRight: spacing.sm,
    fontSize: typography.fontSizes.base,
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.white,
  },
  categoryTextActive: {
    fontFamily: typography.fontFamily.medium,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sizesContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
  },
  sizesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sizesTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  addSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  addSizeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    fontFamily: typography.fontFamily.medium,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sizeNameContainer: {
    flex: 2,
  },
  sizePriceContainer: {
    flex: 1,
  },
  sizeLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  removeSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray400,
  },
  optionsContainer: {
    marginBottom: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
});