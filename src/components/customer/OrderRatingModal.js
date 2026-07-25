import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function OrderRatingModal({
  visible,
  orderData,
  onClose,
  onSubmitRating
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logs pour debugging
  console.log('📱 [OrderRatingModal] Rendu avec:', {
    visible,
    orderData: orderData?.orderId || 'null',
    hasOnClose: !!onClose,
    hasOnSubmit: !!onSubmitRating
  });

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const starAnimations = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      // Animation d'apparition
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

      // Animation des étoiles avec délai
      starAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, index * 100);
      });

      // Vibration légère
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      starAnimations.forEach(anim => anim.setValue(0));
      setRating(0);
      setHoveredRating(0);
      setComment('');
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animation de bounce pour l'étoile sélectionnée
    Animated.sequence([
      Animated.timing(starAnimations[selectedRating - 1], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(starAnimations[selectedRating - 1], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    console.log('🚀 [OrderRatingModal] Début soumission notation');
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // TIMEOUT DE SÉCURITÉ - Fermer automatiquement après 5 secondes
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ [OrderRatingModal] TIMEOUT DE SÉCURITÉ - Fermeture forcée après 5s');
      setIsSubmitting(false);
      onClose && onClose();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 5000);

    try {
      const ratingData = {
        orderId: orderData.orderId || orderData.id,
        rating,
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('📝 [OrderRatingModal] Données à soumettre:', ratingData);

      const result = await onSubmitRating(ratingData);
      console.log('✅ [OrderRatingModal] Résultat soumission reçu:', result);

      // Annuler le timeout de sécurité si on reçoit une réponse
      clearTimeout(safetyTimeout);

      // FERMETURE IMMÉDIATE SANS VÉRIFICATION - On sait que AsyncStorage fonctionne
      console.log('🎬 [OrderRatingModal] Soumission terminée, fermeture immédiate GARANTIE');

      // Feedback de succès
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Fermeture immédiate
      setIsSubmitting(false);
      onClose && onClose();

      console.log('✅ [OrderRatingModal] Modal fermé GARANTIE');

    } catch (error) {
      console.error('❌ [OrderRatingModal] Exception soumission notation:', error);

      // Annuler le timeout de sécurité
      clearTimeout(safetyTimeout);

      // MÊME EN CAS D'ERREUR, FERMER LE MODAL - L'utilisateur peut rouvrir
      console.log('❌ [OrderRatingModal] Erreur mais fermeture quand même pour débloquer');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
      onClose && onClose();
    }
  };

  const handleClose = () => {
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
      onClose && onClose();
    });
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Très déçu 😞';
      case 2: return 'Déçu 😕';
      case 3: return 'Correct 😐';
      case 4: return 'Satisfait 😊';
      case 5: return 'Excellent ! 🤩';
      default: return 'Notez votre expérience';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 1: return colors.status.error;
      case 2: return '#F97316';
      case 3: return colors.status.warning;
      case 4: return '#22C55E';
      case 5: return '#10B981';
      default: return colors.neutral.gray500;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
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
          {/* Header */}
          <LinearGradient
            colors={['#000000', '#111111', '#222222']}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.headerCloseButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.neutral.white} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={40} color={colors.accent.main} />
              </View>
              <Text style={styles.headerTitle}>Notez votre commande</Text>
              <Text style={styles.headerSubtitle}>
                Votre avis nous aide à nous améliorer
              </Text>
            </View>
          </LinearGradient>

          {/* Body */}
          <View style={styles.body}>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Commande #{orderData?.orderId || orderData?.id}</Text>
              <Text style={styles.orderDate}>
                {orderData?.orderDate} • {orderData?.total?.toFixed(2)}€
              </Text>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={[styles.ratingLabel, { color: getRatingColor(rating || hoveredRating) }]}>
                {getRatingText(rating || hoveredRating)}
              </Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((starNumber) => (
                  <TouchableOpacity
                    key={starNumber}
                    style={styles.starButton}
                    onPress={() => handleStarPress(starNumber)}
                    onPressIn={() => setHoveredRating(starNumber)}
                    onPressOut={() => setHoveredRating(0)}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      style={[
                        styles.starWrapper,
                        {
                          transform: [
                            {
                              scale: starAnimations[starNumber - 1],
                            },
                          ],
                        },
                      ]}
                    >
                      <Ionicons
                        name={starNumber <= (rating || hoveredRating) ? 'star' : 'star-outline'}
                        size={40}
                        color={starNumber <= (rating || hoveredRating) ? colors.accent.main : colors.neutral.gray300}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>
                Commentaire <Text style={styles.optional}>(optionnel)</Text>
              </Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Partagez votre expérience..."
                placeholderTextColor={colors.neutral.gray400}
                multiline={true}
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.characterCount}>
                {comment.length}/200
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Passer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { opacity: rating > 0 ? 1 : 0.5 }
                ]}
                onPress={handleSubmitRating}
                disabled={rating === 0 || isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={rating > 0 ? ['#22C55E', '#16A34A'] : ['#E5E7EB', '#D1D5DB']}
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <Text style={[styles.submitButtonText, { color: colors.neutral.white }]}>
                      Envoi...
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, { color: colors.neutral.white }]}>
                        Envoyer
                      </Text>
                      <Ionicons name="checkmark" size={18} color={colors.neutral.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 380,
    elevation: 20,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    alignItems: 'center',
  },
  headerCloseButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  orderNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ratingLabel: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.lg,
    minHeight: 28,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSection: {
    marginBottom: spacing.xl,
  },
  commentLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  optional: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: colors.neutral.gray50,
  },
  characterCount: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
  },
  submitButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  submitButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
  },
});