import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';

const { width, height } = Dimensions.get('window');

export default function EmailVerificationScreen() {
  const fontsLoaded = useFonts();
  const { user, userProfile, resendEmailVerification, reloadUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Animations pour les emojis flottants (20 emojis pour l'écran de vérification)
  const floatingEmojis = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  // Animation des emojis flottants
  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 2000;
        const duration = 10000 + Math.random() * 10000;

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

  // Countdown pour le renvoi d'email
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Fonction pour détecter si l'utilisateur est un livreur de manière robuste
  const checkIfDeliveryUser = async (firebaseUser) => {
    try {
      console.log('🔍 DEBUGGING - Checking if user is delivery user...');
      console.log('🔍 DEBUGGING - Firebase User:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified
      });

      // Méthode 1: Vérifier le profil Firestore directement
      console.log('🔍 DEBUGGING - Checking Firestore profile...');
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📄 DEBUGGING - Firestore profile data:', userData);
        console.log('📄 DEBUGGING - Role specifically:', userData.role);

        if (userData.role === 'delivery') {
          console.log('✅ DEBUGGING - User IS delivery based on Firestore role');
          return true;
        } else {
          console.log('❌ DEBUGGING - User is NOT delivery. Role:', userData.role);
        }
      } else {
        console.log('❌ DEBUGGING - No Firestore document found');
      }

      // Méthode 2: Vérifier les informations Firebase Auth
      const isDeliveryFromDisplayName = firebaseUser.displayName &&
        firebaseUser.displayName.toLowerCase().includes('delivery');

      const isDeliveryFromEmail = firebaseUser.email &&
        firebaseUser.email.toLowerCase().includes('delivery');

      console.log('🔍 DEBUGGING - Firebase Auth checks:', {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        isDeliveryFromDisplayName,
        isDeliveryFromEmail
      });

      const finalResult = isDeliveryFromDisplayName || isDeliveryFromEmail;
      console.log('🔍 DEBUGGING - Final delivery check result:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('❌ DEBUGGING - Error checking delivery user status:', error);
      // En cas d'erreur, utiliser des heuristiques basées sur l'email/displayName
      const fallbackResult = (firebaseUser.email && firebaseUser.email.toLowerCase().includes('delivery')) ||
             (firebaseUser.displayName && firebaseUser.displayName.toLowerCase().includes('delivery'));
      console.log('🔍 DEBUGGING - Fallback result:', fallbackResult);
      return fallbackResult;
    }
  };

  // Vérification automatique toutes les 5 secondes
  useEffect(() => {
    const checkVerification = async () => {
      if (user && !loading) {
        const result = await reloadUser();
        if (result.success && result.emailVerified) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Rediriger selon le rôle de l'utilisateur avec vérification robuste
          console.log('📧 Email verified - checking user role with robust detection...');
          const isDeliveryUser = await checkIfDeliveryUser(user);

          console.log('✅ Redirect decision:', {
            isDeliveryUser,
            userProfileRole: userProfile?.role
          });

          if (isDeliveryUser) {
            Alert.alert(
              '✅ Email vérifié !',
              'Votre email a été vérifié avec succès. Vous pouvez maintenant accéder à votre interface de livraison.',
              [
                {
                  text: 'Accéder aux livraisons',
                  onPress: () => {
                    console.log('📧 Verified delivery user redirecting to delivery login');
                    router.replace('/auth/delivery-login');
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'Email vérifié !',
              'Votre email a été vérifié avec succès. Vous pouvez maintenant utiliser l\'application.',
              [
                {
                  text: 'Continuer',
                  onPress: () => router.replace('/(tabs)')
                }
              ]
            );
          }
        }
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [user, loading]);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const result = await reloadUser();
      if (result.success) {
        if (result.emailVerified) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Rediriger selon le rôle de l'utilisateur avec vérification robuste
          console.log('📧 Email verified manually - checking user role with robust detection...');
          const isDeliveryUser = await checkIfDeliveryUser(user);

          console.log('✅ Manual redirect decision:', {
            isDeliveryUser,
            userProfileRole: userProfile?.role
          });

          if (isDeliveryUser) {
            Alert.alert(
              '✅ Email vérifié !',
              'Votre email a été vérifié avec succès. Vous pouvez maintenant accéder à votre interface de livraison.',
              [
                {
                  text: 'Accéder aux livraisons',
                  onPress: () => {
                    console.log('📧 Manual verified delivery user redirecting to delivery login');
                    router.replace('/auth/delivery-login');
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'Email vérifié !',
              'Votre email a été vérifié avec succès.',
              [
                {
                  text: 'Continuer',
                  onPress: () => router.replace('/(tabs)')
                }
              ]
            );
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(
            'Email non vérifié',
            'Votre email n\'a pas encore été vérifié. Veuillez vérifier votre boîte mail et cliquer sur le lien de vérification.'
          );
        }
      } else {
        Alert.alert('Erreur', 'Impossible de vérifier le statut de votre email');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const result = await resendEmailVerification();
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCountdown(60); // 60 secondes avant de pouvoir renvoyer
        Alert.alert(
          'Email envoyé',
          'Un nouvel email de vérification a été envoyé à votre adresse.'
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer l\'email');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Rediriger vers l'écran de connexion au lieu de router.back()
    // car cet écran peut être accédé directement sans historique de navigation
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />

        {/* Emojis flottants de fast food */}
        {floatingEmojis.map((animValue, index) => {
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '📧', '✅', '📱', '💌', '📬', '📭', '📮', '📨', '📩', '💕'];
          const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];

          const trajectoryType = index % 6;
          let startX, endX, startY, endY;

          switch (trajectoryType) {
            case 0:
              startX = Math.random() * 300 - 50;
              endX = startX + (Math.random() - 0.5) * 200;
              startY = 900;
              endY = -100;
              break;
            case 1:
              startX = -100;
              endX = 400;
              startY = 200 + Math.random() * 400;
              endY = startY + (Math.random() - 0.5) * 300;
              break;
            case 2:
              startX = 400;
              endX = -100;
              startY = 300 + Math.random() * 300;
              endY = startY + (Math.random() - 0.5) * 200;
              break;
            case 3:
              startX = Math.random() * 300 - 50;
              endX = startX + (Math.random() - 0.5) * 150;
              startY = -100;
              endY = 900;
              break;
            case 4:
              startX = Math.random() * 400;
              endX = (startX + 200) % 400;
              startY = 900;
              endY = -100;
              break;
            case 5:
              startX = Math.random() * 400;
              endX = (startX + 150) % 400;
              startY = -100;
              endY = 900;
              break;
          }

          const amplitude = 20 + (index % 3) * 15;

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
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [0, amplitude, 0, -amplitude, 0],
                        extrapolate: 'clamp',
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
        })}

        <View style={styles.content}>
          {/* Bouton retour en haut à gauche */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color="#FF6B6B" />
            </View>
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.subtitle}>
              Un email de vérification a été envoyé à :
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Instructions :</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FF6B6B" />
                <Text style={styles.instructionText}>
                  Ouvrez votre application de messagerie
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FF6B6B" />
                <Text style={styles.instructionText}>
                  Recherchez l'email de BriveFood
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FF6B6B" />
                <Text style={styles.instructionText}>
                  Cliquez sur le lien de vérification
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FF6B6B" />
                <Text style={styles.instructionText}>
                  Revenez sur l'application
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Check Verification Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCheckVerification}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="refresh-outline" size={20} color={colors.neutral.white} />
                      <Text style={styles.primaryButtonText}>Vérifier maintenant</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Email Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleResendEmail}
                disabled={resendLoading || countdown > 0}
              >
                <View style={styles.secondaryButtonContent}>
                  {resendLoading ? (
                    <ActivityIndicator color={colors.primary.main} />
                  ) : (
                    <>
                      <Ionicons name="mail-outline" size={20} color={colors.primary.main} />
                      <Text style={styles.secondaryButtonText}>
                        {countdown > 0
                          ? `Renvoyer dans ${countdown}s`
                          : 'Renvoyer l\'email'
                        }
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Vous ne trouvez pas l'email ? Vérifiez votre dossier spam ou courrier indésirable.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    zIndex: 10,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.neutral.white,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  email: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  infoTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.sm,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  secondaryButton: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary.main,
    overflow: 'hidden',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
  },
  helpContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  helpText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },
});