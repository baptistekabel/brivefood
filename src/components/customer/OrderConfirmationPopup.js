import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

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
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Header avec icône de succès */}
          <LinearGradient
            colors={['#22C55E', '#16A34A', '#15803D']}
            style={styles.header}
          >
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  transform: [
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      })
                    },
                    {
                      rotate: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '10deg'],
                      })
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={60} color={colors.neutral.white} />
            </Animated.View>

            <Text style={styles.successTitle}>Commande confirmée !</Text>
            <Text style={styles.successSubtitle}>
              Votre commande a été transmise avec succès
            </Text>
          </LinearGradient>

          {/* Corps du popup */}
          <View style={styles.body}>
            {/* Informations de la commande */}
            <View style={styles.orderInfo}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{orderData.orderId}</Text>
                <View style={styles.modeContainer}>
                  <Ionicons
                    name={getModeIcon(orderData.mode)}
                    size={18}
                    color={colors.neutral.gray600}
                  />
                  <Text style={styles.modeText}>{getModeText(orderData.mode)}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={colors.neutral.gray600} />
                  <Text style={styles.detailText}>Temps d'attente: {orderData.waitTime}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="card-outline" size={16} color={colors.neutral.gray600} />
                  <Text style={styles.detailText}>Total: {orderData.total.toFixed(2)}€</Text>
                </View>
              </View>
            </View>

            {/* Message d'encouragement */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                🎉 Merci pour votre confiance !
              </Text>
              <Text style={styles.submessageText}>
                Vous pourrez suivre votre commande en temps réel
              </Text>
            </View>

            {/* Bouton d'action */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#000000', '#111111', '#222222']}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Suivre ma commande</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.neutral.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Éléments décoratifs */}
          <View style={styles.decorativeElements}>
            {/* Confettis animés */}
            {[...Array(8)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    left: (width * 0.8 / 8) * index + 20,
                    transform: [
                      {
                        translateY: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20 - index * 5],
                        }),
                      },
                      {
                        rotate: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${index * 45}deg`],
                        }),
                      },
                    ],
                    opacity: bounceAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0],
                    }),
                  },
                ]}
              >
                <Text style={styles.confettiText}>
                  {['🎉', '✨', '🎊', '⭐', '💫', '🌟', '🎈', '🎁'][index]}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 24, // Bords très arrondis
    overflow: 'hidden',
    width: '100%',
    maxWidth: 350,
    elevation: 20,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  orderInfo: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: 16, // Bords arrondis
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12, // Bords arrondis
    gap: spacing.xs / 2,
  },
  modeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  orderDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  messageText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submessageText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.fontSizes.base * 1.4,
  },
  confirmButton: {
    borderRadius: 16, // Bords arrondis
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: spacing.lg,
  },
  confettiText: {
    fontSize: 20,
  },
});