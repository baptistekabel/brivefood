import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { ProductCategory } from '../../types';
import categoryInfo from '../../data/categories';

export default function AddProductModal({ visible, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ProductCategory.PIZZA,
    price: '',
    hasSizes: false,
    customizable: false,
    rating: 0,
    image: null,
  });

  const [sizes, setSizes] = useState([
    { id: 1, name: 'M', price: '' },
    { id: 2, name: 'L', price: '' },
  ]);

  const [customizationOptions, setCustomizationOptions] = useState({
    boisson: {
      title: 'Boisson',
      subtitle: 'Ajoutez une boisson à votre plat.',
      required: false,
      maxSelections: 1,
      options: [
        { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
        { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
        { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
        { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
      ]
    }
  });

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: ProductCategory.PIZZA,
      price: '',
      hasSizes: false,
      customizable: false,
      rating: 0,
      image: null,
    });
    setSizes([
      { id: 1, name: 'M', price: '' },
      { id: 2, name: 'L', price: '' },
    ]);
  };

  // Fonctions pour gérer les tailles
  const addSize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = Math.max(...sizes.map(s => s.id), 0) + 1;
    setSizes([...sizes, { id: newId, name: '', price: '' }]);
  };

  const removeSize = (id) => {
    if (sizes.length <= 1) {
      Alert.alert('Erreur', 'Il faut au moins une taille');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSizes(sizes.filter(s => s.id !== id));
  };

  const updateSize = (id, field, value) => {
    setSizes(sizes.map(s => s.id === id ? { ...s, [field]: value } : s));
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
      for (const size of sizes) {
        if (!size.name.trim()) {
          Alert.alert('Erreur', 'Tous les noms de tailles sont requis');
          return false;
        }
        if (!size.price || isNaN(parseFloat(size.price))) {
          Alert.alert('Erreur', `Prix invalide pour la taille "${size.name}"`);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Préparer les données du produit
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        rating: parseInt(formData.rating) || 0,
        reviews: 0, // Commence à 0 pour les nouveaux produits
        customizable: formData.customizable,
        available: true, // Visible côté client dès sa création
        image: formData.image, // Pour l'instant null, à implémenter plus tard
      };

      // Gérer les prix selon le type (simple ou avec tailles)
      if (formData.hasSizes) {
        productData.sizes = {};
        sizes.forEach(size => {
          const sizeKey = size.name.trim();
          productData.sizes[sizeKey] = {
            name: sizeKey,
            price: parseFloat(size.price)
          };
        });
        productData.price = parseFloat(sizes[0].price); // Prix de base = prix première taille
      } else {
        productData.price = parseFloat(formData.price);
      }

      // Ajouter les options de personnalisation si activé
      if (formData.customizable) {
        productData.customizationOptions = customizationOptions;
      }

      console.log('📝 Submitting product:', productData);

      // Appeler la fonction d'ajout de produit
      const result = await onAddProduct(productData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Succès',
          'Le produit a été ajouté avec succès !',
          [
            {
              text: 'Ajouter un autre',
              onPress: () => resetForm()
            },
            {
              text: 'Fermer',
              style: 'cancel',
              onPress: () => {
                resetForm();
                onClose();
              }
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('❌ Error submitting product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (formData.name || formData.description || formData.price) {
      Alert.alert(
        'Attention',
        'Êtes-vous sûr de vouloir fermer ? Toutes les données seront perdues.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Fermer',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            }
          }
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
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
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouveau Produit</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Ajout...' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Informations de base */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations de base</Text>

              {/* Nom du produit */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du produit *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Ex: Pizza Margherita"
                  placeholderTextColor={colors.neutral.gray400}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Décrivez le produit..."
                  placeholderTextColor={colors.neutral.gray400}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Catégorie */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie *</Text>
                <View style={styles.categoryGrid}>
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryOption,
                        formData.category === key && styles.categoryOptionSelected
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFormData(prev => ({ ...prev, category: key }));
                      }}
                    >
                      <Text style={styles.categoryEmoji}>{info.emoji}</Text>
                      <Text style={[
                        styles.categoryName,
                        formData.category === key && styles.categoryNameSelected
                      ]}>
                        {info.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Prix */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prix</Text>

              {/* Switch pour les tailles */}
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Produit avec tailles</Text>
                <Switch
                  value={formData.hasSizes}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({ ...prev, hasSizes: value }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary.main }}
                  thumbColor={colors.neutral.white}
                />
              </View>

              {formData.hasSizes ? (
                /* Prix avec tailles dynamiques */
                <View>
                  {sizes.map((size, index) => (
                    <View key={size.id} style={styles.sizeRow}>
                      <View style={styles.sizeNameInput}>
                        <Text style={styles.inputLabel}>Taille {index + 1}</Text>
                        <TextInput
                          style={styles.input}
                          value={size.name}
                          onChangeText={(text) => updateSize(size.id, 'name', text)}
                          placeholder="Ex: M, L, XL..."
                          placeholderTextColor={colors.neutral.gray400}
                        />
                      </View>
                      <View style={styles.sizePriceInput}>
                        <Text style={styles.inputLabel}>Prix *</Text>
                        <TextInput
                          style={styles.input}
                          value={size.price}
                          onChangeText={(text) => updateSize(size.id, 'price', text)}
                          placeholder="10.50"
                          placeholderTextColor={colors.neutral.gray400}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.removeSizeButton}
                        onPress={() => removeSize(size.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Bouton ajouter taille */}
                  <TouchableOpacity style={styles.addSizeButton} onPress={addSize}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
                    <Text style={styles.addSizeText}>Ajouter une taille</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Prix unique */
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prix *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    placeholder="12.50"
                    placeholderTextColor={colors.neutral.gray400}
                    keyboardType="decimal-pad"
                  />
                </View>
              )}
            </View>

            {/* Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options</Text>

              {/* Personnalisable */}
              <View style={styles.switchGroup}>
                <View>
                  <Text style={styles.switchLabel}>Produit personnalisable</Text>
                  <Text style={styles.switchSubtext}>Permet d'ajouter des boissons, etc.</Text>
                </View>
                <Switch
                  value={formData.customizable}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData(prev => ({ ...prev, customizable: value }));
                  }}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary.main }}
                  thumbColor={colors.neutral.white}
                />
              </View>


              {/* Note initiale */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Note initiale (sur 100)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rating.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, rating: text }))}
                  placeholder="85"
                  placeholderTextColor={colors.neutral.gray400}
                  keyboardType="numeric"
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral.gray50,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray800,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    backgroundColor: colors.neutral.gray50,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.primary.dark,
    fontFamily: typography.fontFamily.semibold,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  switchLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  switchSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  sizeNameInput: {
    flex: 1,
  },
  sizePriceInput: {
    flex: 1,
  },
  removeSizeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  addSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addSizeText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
  },
  bottomSpacer: {
    height: 40,
  },
});