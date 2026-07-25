import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';

export default function ForgotPasswordScreen() {
  const fontsLoaded = useFonts();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Animations pour les emojis flottants (15 emojis pour la page mot de passe oublié)
  const floatingEmojis = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(0))
  ).current;

  // Mémoriser les trajectoires pour éviter la réinitialisation lors des re-renders
  const emojiTrajectories = useRef(
    Array.from({ length: 15 }, (_, index) => {
      const trajectoryType = index % 4;
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
        default:
          startX = 0;
          endX = 0;
          startY = 0;
          endY = 0;
      }

      return {
        startX,
        endX,
        startY,
        endY,
        amplitude: 20 + (index % 3) * 15
      };
    })
  ).current;

  // Animation des emojis flottants
  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 1000;
        const duration = 15000 + Math.random() * 15000;
        
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

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setEmailSent(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Email envoyé !',
          'Un email avec les instructions pour réinitialiser votre mot de passe a été envoyé à votre adresse.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/login')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', getErrorMessage(result.error));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      default:
        return 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
    }
  };

  const handleBackToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  if (emailSent) {
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
            const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓'];
            const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];

            // Utiliser les trajectoires mémorisées
            const trajectory = emojiTrajectories[index];

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
                          outputRange: [trajectory.startY, trajectory.endY],
                        }),
                      },
                      {
                        translateX: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [trajectory.startX, trajectory.endX],
                          extrapolate: 'clamp',
                        }),
                      },
                      {
                        translateX: animValue.interpolate({
                          inputRange: [0, 0.25, 0.5, 0.75, 1],
                          outputRange: [0, trajectory.amplitude, 0, -trajectory.amplitude, 0],
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

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.successContainer}>
              <View style={styles.modernIconContainer}>
                <LinearGradient
                  colors={['#10B981', '#34D399']}
                  style={styles.successIconGradient}
                >
                  <Ionicons name="checkmark-circle" size={64} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.successTitle}>Email envoyé !</Text>
              <Text style={styles.successMessage}>
                Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
              </Text>
              
              <View style={styles.modernButtonContainer}>
                <TouchableOpacity 
                  style={styles.modernButton} 
                  onPress={handleBackToLogin}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.modernButtonGradient}
                  >
                    <Ionicons name="arrow-back" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.modernButtonText}>Retour à la connexion</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

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
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓'];
          const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];

          // Utiliser les trajectoires mémorisées
          const trajectory = emojiTrajectories[index];

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
                        outputRange: [trajectory.startY, trajectory.endY],
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [trajectory.startX, trajectory.endX],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [0, trajectory.amplitude, 0, -trajectory.amplitude, 0],
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header moderne */}
            <View style={styles.modernHeader}>
              <TouchableOpacity 
                style={styles.modernBackButton} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.backButtonGradient}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.modernIconContainer}>
                <Ionicons name="lock-closed" size={48} color="white" />
              </View>

              <Text style={styles.modernTitle}>Mot de passe oublié ?</Text>
              <Text style={styles.modernSubtitle}>
                Pas de problème ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Text>
            </View>

            {/* Formulaire moderne */}
            <View style={styles.modernFormContainer}>
              <View style={styles.modernForm}>
                <Text style={styles.formTitle}>Récupération</Text>
                
                {/* Email Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Adresse email</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="mail" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="votre@email.com"
                          placeholderTextColor="#999"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoFocus
                        />
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Bouton moderne */}
                <View style={styles.modernButtonContainer}>
                  <TouchableOpacity 
                    style={styles.modernResetButton} 
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={loading ? ['#999', '#666'] : ['#FF6B6B', '#FF8E53']}
                      style={styles.modernResetButtonGradient}
                    >
                      <Ionicons name="paper-plane" size={20} color="white" style={styles.buttonIcon} />
                      <Text style={styles.modernResetButtonText}>
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Info moderne */}
            <View style={styles.modernHelpContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.modernHelpCard}
              >
                <View style={styles.helpIconContainer}>
                  <Ionicons name="information-circle" size={24} color="#34D399" />
                </View>
                <Text style={styles.modernHelpText}>
                  Vous recevrez un email avec un lien sécurisé pour créer un nouveau mot de passe. Le lien expire dans 1 heure.
                </Text>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    minHeight: 800,
  },
  
  // Header moderne
  modernHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  modernBackButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernIconContainer: {
    marginBottom: spacing.xl,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modernIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    marginBottom: spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
    paddingHorizontal: spacing.md,
  },
  
  // Formulaire moderne
  modernFormContainer: {
    marginBottom: spacing.xl,
  },
  modernForm: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  formTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modernInputContainer: {
    marginBottom: spacing.xl,
  },
  modernInputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: 'white',
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  modernInputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputGradientBorder: {
    padding: 2,
    borderRadius: 16,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  modernInput: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#333',
    marginLeft: spacing.sm,
  },
  
  // Boutons modernes
  modernButtonContainer: {
    gap: spacing.md,
  },
  modernResetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernResetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  modernResetButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  
  // Aide moderne
  modernHelpContainer: {
    marginTop: spacing.lg,
  },
  modernHelpCard: {
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  helpIconContainer: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  modernHelpText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  
  // Écran de succès
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  successTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    marginBottom: spacing.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  successMessage: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.md,
  },
  modernButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
  },
  modernButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  modernButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  
  // Emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },
});