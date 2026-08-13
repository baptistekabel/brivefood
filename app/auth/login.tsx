import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
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
import { isTablet, isLandscape, getResponsiveStyles } from '../../src/utils/deviceUtils';

export default function LoginScreen() {
  const fontsLoaded = useFonts();
  const { login, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();
  const responsiveStyles = getResponsiveStyles();

  // Animations pour le background (similaires à l'écran d'accueil)
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animations pour les emojis flottants (25 emojis)
  const floatingEmojis = useRef(
    Array.from({ length: 25 }, () => new Animated.Value(0))
  ).current;

  // Mémoriser les trajectoires pour éviter la réinitialisation lors des re-renders
  const emojiTrajectories = useRef(
    Array.from({ length: 25 }, (_, index) => {
      const trajectoryType = index % 6;
      const screenWidth = 400;
      const screenHeight = 900;
      let startX, endX, startY, endY;

      const zone = Math.floor(index / 4);
      const zoneWidth = screenWidth / 3;
      const baseX = (zone % 3) * zoneWidth;

      switch (trajectoryType) {
        case 0:
          startX = baseX + Math.random() * zoneWidth;
          endX = startX + (Math.random() - 0.5) * 100;
          startY = screenHeight + 100;
          endY = -100;
          break;
        case 1:
          startX = -100;
          endX = screenWidth + 100;
          startY = 300 + (index % 3) * 150;
          endY = startY + (Math.random() - 0.5) * 200;
          break;
        case 2:
          startX = screenWidth + 100;
          endX = -100;
          startY = 400 + (index % 3) * 100;
          endY = startY + (Math.random() - 0.5) * 150;
          break;
        case 3:
          startX = baseX + Math.random() * zoneWidth;
          endX = startX + (Math.random() - 0.5) * 80;
          startY = -100;
          endY = screenHeight + 100;
          break;
        case 4:
          startX = Math.random() * screenWidth;
          endX = (startX + screenWidth / 2) % screenWidth;
          startY = screenHeight + 100;
          endY = -100;
          break;
        case 5:
          startX = Math.random() * screenWidth;
          endX = (startX + screenWidth / 3) % screenWidth;
          startY = -100;
          endY = screenHeight + 100;
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
        amplitude: 15 + (index % 4) * 12,
        rotationSpeed: (index % 3 + 1) * 180
      };
    })
  ).current;

  useEffect(() => {
    // Animation continue en arrière-plan
    const startBackgroundAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Animation des emojis flottants avec trajectoires aléatoires
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        // Délai plus rapide pour étaler les démarrages
        const delay = Math.random() * 1000;
        // Durée plus lente entre 15 et 30 secondes
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

    startBackgroundAnimation();
    startFloatingEmojisAnimation();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  // Animations interpolées
  const rotateAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scaleAnimation = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const opacityAnimation = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace('/(tabs)');
      } else if (result.blocked) {
        // Message déjà explicite, ne pas le remplacer par l'erreur générique
        Alert.alert('Compte bloqué', result.error);
      } else {
        Alert.alert('Erreur de connexion', getErrorMessage(result.error));
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
        return 'Aucun compte trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      default:
        return 'Erreur de connexion. Vérifiez vos identifiants.';
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/forgot-password');
  };

  const handleGoToRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/register');
  };

  const handleContinueAsGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#111111', '#222222']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />

        {/* Animation d'arrière-plan */}
        <Animated.View
          style={[
            styles.backgroundAnimation1,
            {
              transform: [
                { rotate: rotateAnimation },
                { scale: scaleAnimation }
              ],
              opacity: opacityAnimation
            }
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundAnimation2,
            {
              transform: [
                { rotate: rotateAnimation },
                { scale: scaleAnimation }
              ],
              opacity: opacityAnimation
            }
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundAnimation3,
            {
              transform: [
                { rotate: rotateAnimation },
                { scale: scaleAnimation }
              ],
              opacity: opacityAnimation
            }
          ]}
        />

        {/* Emojis flottants de fast food avec trajectoires variables et équilibrées */}
        {floatingEmojis.map((animValue, index) => {
          // Liste d'emojis de fast food uniquement
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓', '🧄', '🥒', '🍅', '🌶️', '🫒'];
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
                        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        outputRange: [0, trajectory.amplitude, -trajectory.amplitude/2, trajectory.amplitude/2, -trajectory.amplitude, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotate: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${trajectory.rotationSpeed}deg`],
                      }),
                    },
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.2, 0.8],
                      }),
                    },
                  ],
                  opacity: animValue.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 0.5, 0.5, 0],
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
          contentContainerStyle={[
            styles.scrollContent,
            isTabletDevice && isLandscapeMode && styles.scrollContentTabletLandscape
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {isTabletDevice && isLandscapeMode ? (
            // Layout pour tablette en mode paysage - En colonnes
            <View style={styles.tabletLandscapeContainer}>
              {/* Colonne gauche - Branding */}
              <View style={styles.leftColumn}>
                <View style={styles.brandContainer}>
                  <Text style={[styles.brandName, styles.brandNameTablet]}>BRIVEFOOD</Text>
                  <Text style={[styles.title, styles.titleTablet]}>Connexion</Text>
                  <Text style={[styles.subtitle, styles.subtitleTablet]}>
                    Connectez-vous pour commander vos plats préférés
                  </Text>
                </View>

                {/* Administrative Areas pour tablette */}
                <View style={styles.adminSectionTablet}>
                  <Text style={styles.adminSectionTitle}>Autres accès</Text>
                  <View style={styles.adminButtonsColumn}>
                    <TouchableOpacity
                      style={styles.adminButtonTablet}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/auth/admin-login');
                      }}
                    >
                      <View style={styles.adminButtonContentTablet}>
                        <Ionicons name="business-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.adminButtonTextTablet}>Administration</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.adminButtonTablet}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/auth/delivery-login');
                      }}
                    >
                      <View style={styles.adminButtonContentTablet}>
                        <Ionicons name="bicycle-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.adminButtonTextTablet}>Livraison</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Colonne droite - Formulaire */}
              <View style={styles.rightColumn}>
                <View style={styles.formTablet}>
                  {/* Email Input */}
                  <View style={[styles.inputContainer, styles.inputContainerTablet]}>
                    <Text style={[styles.inputLabel, styles.inputLabelTablet]}>Email</Text>
                    <View style={[styles.inputWrapper, styles.inputWrapperTablet]}>
                      <Ionicons name="mail-outline" size={24} color={colors.neutral.gray400} />
                      <TextInput
                        style={[styles.input, styles.inputTablet]}
                        placeholder="votre@email.com"
                        placeholderTextColor={colors.neutral.gray400}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={[styles.inputContainer, styles.inputContainerTablet]}>
                    <Text style={[styles.inputLabel, styles.inputLabelTablet]}>Mot de passe</Text>
                    <View style={[styles.inputWrapper, styles.inputWrapperTablet]}>
                      <Ionicons name="lock-closed-outline" size={24} color={colors.neutral.gray400} />
                      <TextInput
                        style={[styles.input, styles.inputTablet]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.neutral.gray400}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowPassword(!showPassword);
                        }}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color={colors.neutral.gray400}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity style={[styles.forgotPassword, styles.forgotPasswordTablet]} onPress={handleForgotPassword}>
                    <Text style={[styles.forgotPasswordText, styles.forgotPasswordTextTablet]}>Mot de passe oublié ?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.loginButton, styles.loginButtonTablet]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E53']}
                      style={[styles.loginButtonGradient, styles.loginButtonGradientTablet]}
                    >
                      <Text style={[styles.loginButtonText, styles.loginButtonTextTablet]}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Register Link */}
                  <View style={[styles.registerContainer, styles.registerContainerTablet]}>
                    <Text style={[styles.registerText, styles.registerTextTablet]}>Pas encore de compte ? </Text>
                    <TouchableOpacity onPress={handleGoToRegister}>
                      <Text style={[styles.registerLink, styles.registerLinkTablet]}>S'inscrire</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Guest Mode */}
                  <TouchableOpacity
                    style={[styles.guestButton, styles.guestButtonTablet]}
                    onPress={handleContinueAsGuest}
                  >
                    <Ionicons name="person-outline" size={20} color={colors.neutral.gray600} />
                    <Text style={[styles.guestButtonText, styles.guestButtonTextTablet]}>
                      Continuer en tant qu'invité
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            // Layout mobile/portrait standard
            <>
              {/* Header */}
              <View style={styles.header}>
                {/* Logo/Brand */}
                <View style={styles.brandContainer}>
                  <Text style={styles.brandName}>BRIVEFOOD</Text>
                </View>

                <Text style={styles.title}>Connexion</Text>
                <Text style={styles.subtitle}>Connectez-vous pour commander</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color={colors.neutral.gray400} />
                      <TextInput
                        style={styles.input}
                        placeholder="votre@email.com"
                        placeholderTextColor={colors.neutral.gray400}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Mot de passe</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.neutral.gray400} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.neutral.gray400}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowPassword(!showPassword);
                        }}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={colors.neutral.gray400}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E53']}
                      style={styles.loginButtonGradient}
                    >
                      <Text style={styles.loginButtonText}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Register Link */}
                  <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Pas encore de compte ? </Text>
                    <TouchableOpacity onPress={handleGoToRegister}>
                      <Text style={styles.registerLink}>S'inscrire</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Guest Mode */}
                  <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
                    <Ionicons name="person-outline" size={18} color={colors.neutral.gray600} />
                    <Text style={styles.guestButtonText}>Continuer en tant qu'invité</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Administrative Areas */}
              <View style={styles.adminSection}>
                <View style={styles.adminButtonsRow}>
                  <TouchableOpacity
                    style={styles.adminButtonSmall}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/auth/admin-login');
                    }}
                  >
                    <View style={styles.adminButtonContentSmall}>
                      <Ionicons name="business-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.adminButtonTextSmall}>Admin</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.adminButtonSmall}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/auth/delivery-login');
                    }}
                  >
                    <View style={styles.adminButtonContentSmall}>
                      <Ionicons name="bicycle-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.adminButtonTextSmall}>Livreur</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
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
  backgroundAnimation1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
  },
  backgroundAnimation2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,191,36,0.1)',
    top: '30%',
    left: -75,
  },
  backgroundAnimation3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: '20%',
    right: -60,
  },
  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 750,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandName: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: spacing.xl,
    margin: spacing.sm,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  loginButton: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  loginButtonGradient: {
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray600,
  },
  registerLink: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  guestButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textDecorationLine: 'underline',
  },
  adminSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  adminButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  adminButtonSmall: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  adminButtonContentSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  adminButtonTextSmall: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Styles spécifiques pour tablette en paysage
  scrollContentTabletLandscape: {
    paddingHorizontal: spacing['2xl'], // Réduit pour plus d'espace utilisable
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  tabletLandscapeContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Changé de 'stretch' à 'center' pour un meilleur alignement
    justifyContent: 'space-between',
    minHeight: '85%', // Réduit pour éviter l'étirement excessif
    maxHeight: 800, // Limite la hauteur maximale
    gap: spacing['3xl'], // Augmenté pour plus d'espace entre les colonnes
  },
  leftColumn: {
    flex: 0.8, // Réduit légèrement pour donner plus d'espace au formulaire
    justifyContent: 'space-between', // Distribue le contenu de façon équilibrée
    alignItems: 'center',
    paddingRight: spacing['2xl'],
    paddingVertical: spacing.xl,
    minHeight: 600, // Hauteur minimale pour une bonne structure
  },
  rightColumn: {
    flex: 1.2, // Augmenté pour donner plus d'espace au formulaire
    justifyContent: 'center',
    maxWidth: 520, // Augmenté pour des formulaires plus spacieux
    minWidth: 400, // Largeur minimale garantie
  },

  // Styles pour le branding sur tablette
  brandNameTablet: {
    fontSize: typography.fontSizes['5xl'], // Augmenté pour plus d'impact visuel
    marginBottom: spacing.xl,
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleTablet: {
    fontSize: typography.fontSizes['4xl'], // Augmenté pour l'harmonie
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  subtitleTablet: {
    fontSize: typography.fontSizes.xl, // Augmenté pour une meilleure lisibilité
    textAlign: 'center',
    lineHeight: typography.fontSizes.xl * 1.4,
    paddingHorizontal: spacing.xl,
    maxWidth: 400, // Limite la largeur pour une meilleure lecture
    opacity: 0.9,
  },

  // Formulaire pour tablette
  formTablet: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)', // Légèrement plus opaque
    borderRadius: 28, // Légèrement réduit pour un look plus moderne
    padding: spacing['3xl'], // Padding augmenté pour plus d'espace
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minHeight: 500, // Hauteur minimale pour cohérence
    width: '100%',
    maxWidth: 480, // Largeur maximale contrôlée
  },

  // Section admin pour tablette
  adminSectionTablet: {
    marginTop: spacing['3xl'], // Plus d'espace pour la séparation
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  adminSectionTitle: {
    fontSize: typography.fontSizes.xl, // Augmenté pour plus de visibilité
    fontFamily: typography.fontFamily.semibold, // Plus gras
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: spacing.xl,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  adminButtonsColumn: {
    gap: spacing.lg, // Plus d'espace entre les boutons
    alignItems: 'stretch',
    minWidth: 280, // Largeur augmentée pour tablette
    width: '100%',
    maxWidth: 320,
  },
  adminButtonTablet: {
    borderRadius: borderRadius.xl, // Plus arrondi
    borderWidth: 2.5, // Border plus épaisse
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Légèrement plus opaque
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg, // Plus de padding vertical
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 64, // Hauteur minimale pour accessibilité tactile
  },
  adminButtonContentTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // Plus d'espace entre icône et texte
  },
  adminButtonTextTablet: {
    fontSize: typography.fontSizes.lg, // Texte plus grand
    fontFamily: typography.fontFamily.semibold, // Plus gras
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
  },

  // Styles pour les inputs tablette
  inputContainerTablet: {
    marginBottom: spacing.xl, // Plus d'espace entre les inputs
  },
  inputLabelTablet: {
    fontSize: typography.fontSizes.lg, // Label plus grand
    fontFamily: typography.fontFamily.semibold,
    marginBottom: spacing.md,
  },
  inputWrapperTablet: {
    height: 68, // Plus grand pour tablette
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
  },
  inputTablet: {
    fontSize: typography.fontSizes.lg, // Texte plus grand
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.md,
  },

  // Styles pour les boutons tablette
  forgotPasswordTablet: {
    marginBottom: spacing['2xl'], // Plus d'espace
    paddingVertical: spacing.sm,
  },
  forgotPasswordTextTablet: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
  },
  loginButtonTablet: {
    marginBottom: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonGradientTablet: {
    paddingVertical: spacing.lg + 4, // Bouton plus haut
    borderRadius: borderRadius.xl,
  },
  loginButtonTextTablet: {
    fontSize: typography.fontSizes.xl, // Texte plus grand
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },

  // Styles pour le lien d'inscription tablette
  registerContainerTablet: {
    paddingTop: spacing.lg,
  },
  registerTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
  registerLinkTablet: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
  },
  guestButtonTablet: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  guestButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
});