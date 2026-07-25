import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  name: string;
  details: string;
  isDefault: boolean;
  lastFour?: string;
  brand?: string;
}

export default function PaymentScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Carte Principale',
      details: 'Se termine par 4242',
      lastFour: '4242',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      name: 'PayPal',
      details: 'john.doe@email.com',
      isDefault: false,
    },
  ]);

  // Animation pour les emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 2000;
        const duration = 18000 + Math.random() * 12000;

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

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      default:
        return 'wallet-outline';
    }
  };

  const getPaymentColor = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return colors.primary.main;
      case 'paypal':
        return '#0070ba';
      case 'apple_pay':
        return '#000000';
      case 'google_pay':
        return '#4285f4';
      default:
        return colors.accent.main;
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Supprimer le moyen de paiement',
      'Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(payment => payment.id !== paymentId));
          },
        },
      ]
    );
  };

  const setDefaultPayment = (paymentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaymentMethods(paymentMethods.map(payment => ({
      ...payment,
      isDefault: payment.id === paymentId
    })));
  };

  const renderFloatingEmoji = (animValue: Animated.Value, index: number) => {
    const paymentEmojis = ['💳', '💰', '🏧', '💎', '⭐', '✨', '🎯', '💫'];
    const currentEmoji = paymentEmojis[index];

    const trajectoryType = index % 4;
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
        startX = 400;
        endX = -100;
        startY = 250 + Math.random() * 300;
        endY = startY + (Math.random() - 0.5) * 150;
        break;
      case 3:
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
              outputRange: [0, 0.3, 0.3, 0],
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
        <Text style={styles.headerTitle}>Moyens de paiement</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/profile/add-payment')}>
          <Ionicons name="add" size={24} color={colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentHeaderLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: `${getPaymentColor(payment.type)}20` }]}>
                  <Ionicons name={getPaymentIcon(payment.type)} size={22} color={getPaymentColor(payment.type)} />
                </View>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentLabelContainer}>
                    <Text style={styles.paymentLabel}>{payment.name}</Text>
                    {payment.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Défaut</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.paymentDetails}>{payment.details}</Text>
                  {payment.brand && (
                    <Text style={styles.paymentBrand}>{payment.brand}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.paymentActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/profile/edit-payment?id=${payment.id}`)}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary.main} />
                <Text style={styles.actionButtonText}>Modifier</Text>
              </TouchableOpacity>

              {!payment.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setDefaultPayment(payment.id)}
                >
                  <Ionicons name="star-outline" size={20} color={colors.accent.main} />
                  <Text style={styles.actionButtonText}>Défaut</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeletePayment(payment.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Section d'ajout rapide */}
        <View style={styles.quickAddSection}>
          <Text style={styles.quickAddTitle}>Ajouter rapidement</Text>

          <TouchableOpacity style={styles.quickAddOption} onPress={() => Alert.alert('Apple Pay', 'Fonctionnalité bientôt disponible')}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
            <Text style={styles.quickAddText}>Apple Pay</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAddOption} onPress={() => Alert.alert('Google Pay', 'Fonctionnalité bientôt disponible')}>
            <Ionicons name="logo-google" size={24} color="#4285f4" />
            <Text style={styles.quickAddText}>Google Pay</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAddOption} onPress={() => Alert.alert('PayPal', 'Fonctionnalité bientôt disponible')}>
            <Ionicons name="logo-paypal" size={24} color="#0070ba" />
            <Text style={styles.quickAddText}>PayPal</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray400} />
          </TouchableOpacity>
        </View>

        {paymentMethods.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color={colors.neutral.gray300} />
            <Text style={styles.emptyTitle}>Aucun moyen de paiement</Text>
            <Text style={styles.emptyMessage}>Ajoutez votre première méthode de paiement</Text>
          </View>
        )}

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  paymentCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginRight: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  paymentDetails: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  paymentBrand: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  deleteButton: {
    // Style spécifique pour le bouton supprimer
  },
  deleteButtonText: {
    color: colors.status.error,
  },
  quickAddSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAddTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  quickAddOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  quickAddText: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginLeft: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 22,
  },
});