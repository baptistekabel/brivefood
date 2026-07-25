import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import {
  CANCELLATION_WINDOW_MINUTES,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_URI,
} from '../../utils/cancellationWindow';

export default function OrderConfirmationPopup({
  visible,
  orderData,
  onClose,
  onConfirm
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('=== OrderConfirmationPopup ===');
    console.log('visible:', visible);
    console.log('orderData:', orderData);

    if (visible) {
      // Animation d'apparition séquentielle
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de célébration pour l'icône
      setTimeout(() => {
        Animated.sequence([
          Animated.spring(bounceAnim, {
            toValue: 1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      // Vibration de succès
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      bounceAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !orderData) {
    console.log('OrderConfirmationPopup returning null - visible:', visible, 'orderData:', orderData);
    return null;
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'dine_in':
        return 'restaurant-outline';
      case 'takeout':
        return 'bag-outline';
      case 'delivery':
        return 'bicycle-outline';
      default:
        return 'receipt-outline';
    }
  };

  const getModeText = (mode) => {
    switch (mode) {
      case 'dine_in':
        return 'Sur place';
      case 'takeout':
        return 'À emporter';
      case 'delivery':
        return 'Livraison';
      default:
        return 'Commande';
    }
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animation de fermeture
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onConfirm && onConfirm();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* En-tete : confirmation et numero de commande */}
          <LinearGradient
            colors={['#000000', '#141414']}
            style={styles.header}
          >
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  transform: [
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark" size={30} color="#FFFFFF" />
            </Animated.View>

            <Text style={styles.title}>Commande confirmée</Text>

            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>#{orderData.orderNumber || orderData.orderId}</Text>
            </View>
          </LinearGradient>

          {/* Recapitulatif */}
          <View style={styles.body}>
            <View style={styles.row}>
              <Ionicons
                name={getModeIcon(orderData.mode)}
                size={20}
                color={colors.neutral.gray500}
              />
              <Text style={styles.rowLabel}>Mode</Text>
              <Text style={styles.rowValue}>{getModeText(orderData.mode)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} color={colors.neutral.gray500} />
              <Text style={styles.rowLabel}>Prête dans</Text>
              <Text style={styles.rowValue}>{orderData.waitTime}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Ionicons name="wallet-outline" size={20} color={colors.neutral.gray500} />
              <Text style={styles.rowLabel}>Total</Text>
              <Text style={[styles.rowValue, styles.rowValueStrong]}>
                {orderData.total.toFixed(2)} €
              </Text>
            </View>

            {/* Fenetre d'annulation : information critique, donc mise en avant */}
            <TouchableOpacity
              style={styles.notice}
              onPress={() => Linking.openURL(RESTAURANT_PHONE_URI)}
              activeOpacity={0.85}
            >
              <View style={styles.noticeIcon}>
                <Ionicons name="call" size={16} color="#B45309" />
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Annulation ou modification</Text>
                <Text style={styles.noticeDelay}>
                  {CANCELLATION_WINDOW_MINUTES} minutes pour appeler le {RESTAURANT_PHONE}
                </Text>
                <Text style={styles.noticeText}>
                  Ensuite la préparation démarre
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Suivre ma commande</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.neutral.white,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },

  // En-tete
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  orderBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  orderBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#FFD700',
    letterSpacing: 0.5,
  },

  // Corps
  body: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  rowValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  rowValueStrong: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
  },

  // Avertissement annulation
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(180, 83, 9, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#B45309',
  },
  noticeDelay: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#92400E',
    marginTop: 2,
  },
  noticeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: '#B45309',
    opacity: 0.8,
    marginTop: 2,
  },

  // Bouton principal
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#000000',
  },
  buttonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
});
