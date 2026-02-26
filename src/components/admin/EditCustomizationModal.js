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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function EditCustomizationModal({ visible, onClose, product, onSave }) {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les personnalisations existantes
  useEffect(() => {
    if (visible && product?.customizationOptions) {
      const loaded = Object.entries(product.customizationOptions).filter(([, v]) => v != null).map(([key, data]) => ({
        id: key,
        title: data.title || '',
        subtitle: data.subtitle || '',
        required: data.required || false,
        maxSelections: data.maxSelections?.toString() || '1',
        options: data.options?.map((opt, idx) => ({
          id: opt.id || `opt_${idx}`,
          name: opt.name || '',
          price: opt.price?.toString() || '0',
        })) || [],
      }));
      setCustomizations(loaded);
    } else if (visible) {
      // Nouveau produit sans personnalisations
      setCustomizations([]);
    }
  }, [visible, product]);

  // Ajouter un groupe de personnalisation
  const addCustomizationGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = `custom_${Date.now()}`;
    setCustomizations([...customizations, {
      id: newId,
      title: '',
      subtitle: '',
      required: false,
      maxSelections: '1',
      options: [{ id: `opt_${Date.now()}`, name: '', price: '0' }],
    }]);
  };

  // Supprimer un groupe
  const removeCustomizationGroup = (groupId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomizations(customizations.filter(c => c.id !== groupId));
  };

  // Mettre à jour un groupe
  const updateGroup = (groupId, field, value) => {
    setCustomizations(customizations.map(c =>
      c.id === groupId ? { ...c, [field]: value } : c
    ));
  };

  // Ajouter une option à un groupe
  const addOption = (groupId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomizations(customizations.map(c => {
      if (c.id === groupId) {
        return {
          ...c,
          options: [...c.options, { id: `opt_${Date.now()}`, name: '', price: '0' }]
        };
      }
      return c;
    }));
  };

  // Supprimer une option
  const removeOption = (groupId, optionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomizations(customizations.map(c => {
      if (c.id === groupId) {
        if (c.options.length <= 1) {
          Alert.alert('Erreur', 'Il faut au moins une option');
          return c;
        }
        return {
          ...c,
          options: c.options.filter(o => o.id !== optionId)
        };
      }
      return c;
    }));
  };

  // Mettre à jour une option
  const updateOption = (groupId, optionId, field, value) => {
    setCustomizations(customizations.map(c => {
      if (c.id === groupId) {
        return {
          ...c,
          options: c.options.map(o =>
            o.id === optionId ? { ...o, [field]: value } : o
          )
        };
      }
      return c;
    }));
  };

  // Valider et sauvegarder
  const handleSave = async () => {
    // Validation
    for (const group of customizations) {
      if (!group.title.trim()) {
        Alert.alert('Erreur', 'Tous les groupes doivent avoir un titre');
        return;
      }
      for (const option of group.options) {
        if (!option.name.trim()) {
          Alert.alert('Erreur', `Toutes les options de "${group.title}" doivent avoir un nom`);
          return;
        }
      }
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Convertir en format attendu
      const customizationOptions = {};
      customizations.forEach(group => {
        customizationOptions[group.id] = {
          title: group.title.trim(),
          subtitle: group.subtitle.trim(),
          required: group.required,
          maxSelections: parseInt(group.maxSelections) || 1,
          options: group.options.map(opt => ({
            id: opt.id,
            name: opt.name.trim(),
            price: parseFloat(opt.price) || 0,
          })),
        };
      });

      await onSave(product.id, {
        customizable: customizations.length > 0,
        customizationOptions: customizations.length > 0 ? customizationOptions : null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Options de personnalisation mises à jour');
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde personnalisations:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setLoading(false);
    }
  };

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
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personnalisations</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Sauvegarde...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Nom du produit */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product?.name}</Text>
            </View>

            {/* Liste des groupes de personnalisation */}
            {customizations.map((group, groupIndex) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupNumber}>Groupe {groupIndex + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeGroupButton}
                    onPress={() => removeCustomizationGroup(group.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                  </TouchableOpacity>
                </View>

                {/* Titre du groupe */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Titre *</Text>
                  <TextInput
                    style={styles.input}
                    value={group.title}
                    onChangeText={(text) => updateGroup(group.id, 'title', text)}
                    placeholder="Ex: Boisson, Sauce, Supplément..."
                    placeholderTextColor={colors.neutral.gray400}
                  />
                </View>

                {/* Sous-titre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sous-titre (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    value={group.subtitle}
                    onChangeText={(text) => updateGroup(group.id, 'subtitle', text)}
                    placeholder="Ex: Choisissez votre boisson"
                    placeholderTextColor={colors.neutral.gray400}
                  />
                </View>

                {/* Options du groupe */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Obligatoire</Text>
                  <Switch
                    value={group.required}
                    onValueChange={(value) => updateGroup(group.id, 'required', value)}
                    trackColor={{ false: colors.neutral.gray300, true: colors.primary.main }}
                    thumbColor={colors.neutral.white}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre max de sélections</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={group.maxSelections}
                    onChangeText={(text) => updateGroup(group.id, 'maxSelections', text)}
                    placeholder="1"
                    placeholderTextColor={colors.neutral.gray400}
                    keyboardType="numeric"
                  />
                </View>

                {/* Options */}
                <Text style={styles.optionsTitle}>Options</Text>
                {group.options.map((option, optIndex) => (
                  <View key={option.id} style={styles.optionRow}>
                    <View style={styles.optionNameInput}>
                      <TextInput
                        style={styles.input}
                        value={option.name}
                        onChangeText={(text) => updateOption(group.id, option.id, 'name', text)}
                        placeholder={`Option ${optIndex + 1}`}
                        placeholderTextColor={colors.neutral.gray400}
                      />
                    </View>
                    <View style={styles.optionPriceInput}>
                      <TextInput
                        style={styles.input}
                        value={option.price}
                        onChangeText={(text) => updateOption(group.id, option.id, 'price', text)}
                        placeholder="0"
                        placeholderTextColor={colors.neutral.gray400}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.euroSign}>€</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeOptionButton}
                      onPress={() => removeOption(group.id, option.id)}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Bouton ajouter option */}
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={() => addOption(group.id)}
                >
                  <Ionicons name="add" size={18} color={colors.primary.main} />
                  <Text style={styles.addOptionText}>Ajouter une option</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Bouton ajouter groupe */}
            <TouchableOpacity style={styles.addGroupButton} onPress={addCustomizationGroup}>
              <Ionicons name="add-circle-outline" size={24} color={colors.neutral.white} />
              <Text style={styles.addGroupText}>Ajouter un groupe de personnalisation</Text>
            </TouchableOpacity>

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
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  productInfo: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.lg,
  },
  productName: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  groupCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  removeGroupButton: {
    padding: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
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
  smallInput: {
    width: 80,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  switchLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  optionsTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionNameInput: {
    flex: 2,
  },
  optionPriceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  euroSign: {
    position: 'absolute',
    right: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
  },
  removeOptionButton: {
    padding: spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addOptionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
  },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addGroupText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  bottomSpacer: {
    height: 50,
  },
});
