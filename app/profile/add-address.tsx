import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

export default function AddAddressScreen() {
  const [formData, setFormData] = useState({
    label: '',
    type: 'home' as 'home' | 'work' | 'other',
    address: '',
    city: '',
    postalCode: '',
    instructions: '',
  });

  // Animation pour les emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 2000;
        const duration = 20000 + Math.random() * 10000;

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

    startFloatingEmojisAnimation();
  }, []);

  const addressTypes = [
    { id: 'home', label: 'Domicile', icon: 'home-outline', color: colors.primary.main },
    { id: 'work', label: 'Travail', icon: 'business-outline', color: colors.secondary.main },
    { id: 'other', label: 'Autre', icon: 'location-outline', color: colors.accent.main },
  ];

  const handleSave = () => {
    if (!formData.label || !formData.address || !formData.city || !formData.postalCode) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Adresse ajoutée',
      'Votre nouvelle adresse a été ajoutée avec succès.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderFloatingEmoji = (animValue: Animated.Value, index: number) => {
    const addressEmojis = ['🏠', '📍', '✨', '⭐', '🎯', '📮'];
    const currentEmoji = addressEmojis[index];

    const trajectoryType = index % 3;
    let startX, endX, startY, endY;

    switch (trajectoryType) {
      case 0:
        startX = Math.random() * 300;
        endX = startX + (Math.random() - 0.5) * 200;
        startY = 900;
        endY = -100;
        break;
      case 1:
        startX = -100;
        endX = 400;
        startY = 200 + Math.random() * 400;
        endY = startY + (Math.random() - 0.5) * 200;
        break;
      case 2:
        startX = Math.random() * 300;
        endX = startX + (Math.random() - 0.5) * 150;
        startY = -100;
        endY = 900;
        break;
    }

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
            ],
            opacity: animValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.4, 0.4, 0],
            }),
          },
        ]}
      >
        <Text style={styles.emojiText}>{currentEmoji}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.main, colors.secondary.main]}
        style={styles.gradientContainer}
      >
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Emojis flottants */}
      {floatingEmojis.map((animValue, index) => renderFloatingEmoji(animValue, index))}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle adresse</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Type d'adresse */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type d'adresse</Text>
            <View style={styles.typeSelector}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionSelected
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData({ ...formData, type: type.id as any });
                  }}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={formData.type === type.id ? colors.neutral.white : type.color}
                  />
                  <Text style={[
                    styles.typeOptionText,
                    formData.type === type.id && styles.typeOptionTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom de l'adresse *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Chez moi, Bureau, etc."
                placeholderTextColor={colors.neutral.gray400}
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
              />
            </View>
          </View>

          {/* Adresse */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse complète *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Numéro et nom de rue"
                placeholderTextColor={colors.neutral.gray400}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
            </View>
          </View>

          {/* Ville et Code postal */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Code postal *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="19100"
                  placeholderTextColor={colors.neutral.gray400}
                  value={formData.postalCode}
                  onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Ville *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Brive-La-Gaillarde"
                  placeholderTextColor={colors.neutral.gray400}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
            </View>
          </View>

          {/* Instructions de livraison */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instructions de livraison (optionnel)</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="chatbox-outline" size={20} color={colors.neutral.gray400} style={[styles.inputIcon, styles.textAreaIcon]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Étage, code d'accès, indications particulières..."
                placeholderTextColor={colors.neutral.gray400}
                value={formData.instructions}
                onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary.main,
  },
  typeOptionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginTop: spacing.xs,
  },
  typeOptionTextSelected: {
    color: colors.neutral.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textAreaIcon: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    paddingVertical: spacing.md,
  },
  textArea: {
    minHeight: 80,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 20,
  },
});