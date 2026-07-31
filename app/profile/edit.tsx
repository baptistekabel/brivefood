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
import { useAuth } from '../../src/context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

// Repli pour les comptes créés avant l'ajout de firstName/lastName, ou via
// une connexion sociale : on retrouve un prénom/nom exploitables dans le nom
// complet existant plutôt que de repartir de champs vides
const splitFullName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

export default function EditProfileScreen() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const fallbackName = splitFullName(userProfile?.name || user?.displayName || '');
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || fallbackName.firstName,
    lastName: userProfile?.lastName || fallbackName.lastName,
    email: user?.email || '',
    phoneNumber: userProfile?.phone || userProfile?.phoneNumber || '',
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

  const formatPhoneNumber = (text) => {
    // Supprimer tous les caractères non numériques
    const numbers = text.replace(/\D/g, '');
    // Limiter à 10 chiffres maximum
    const limited = numbers.substring(0, 10);
    // Ajouter des espaces tous les 2 chiffres
    const formatted = limited.replace(/(\d{2})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleSave = async () => {
    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      if (!firstName) {
        Alert.alert('Prénom requis', 'Merci de renseigner votre prénom.');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await updateUserProfile({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone: formData.phoneNumber,
      });

      if (result.success) {
        Alert.alert(
          'Profil mis à jour',
          'Vos informations ont été sauvegardées avec succès.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de la sauvegarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sauvegarde.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderFloatingEmoji = (animValue: Animated.Value, index: number) => {
    const profileEmojis = ['👤', '✏️', '💫', '⭐', '🎯', '✨'];
    const currentEmoji = profileEmojis[index];

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
        <Text style={styles.headerTitle}>Mes informations</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Prénom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prénom</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                placeholderTextColor={colors.neutral.gray400}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
            </View>
          </View>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor={colors.neutral.gray400}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="votre@email.com"
                placeholderTextColor={colors.neutral.gray400}
                value={formData.email}
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>L'email ne peut pas être modifié</Text>
          </View>

          {/* Numéro de téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.neutral.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="06 12 34 56 78"
                placeholderTextColor={colors.neutral.gray400}
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  const formatted = formatPhoneNumber(text);
                  setFormData({ ...formData, phoneNumber: formatted });
                }}
                keyboardType="phone-pad"
                maxLength={14}
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
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    paddingVertical: spacing.md,
  },
  disabledInput: {
    color: colors.neutral.gray400,
  },
  helperText: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
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