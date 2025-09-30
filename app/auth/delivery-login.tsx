import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useDeliveryManagement } from '../../src/context/DeliveryManagementContext';
import { useDeliveryAuth } from '../../src/context/DeliveryAuthContext';
import { useAuth } from '../../src/context/AuthContext';
import { isTablet, isLandscape, getResponsiveStyles } from '../../src/utils/deviceUtils';

export default function DeliveryLoginScreen() {
  const { loginDeliveryUser } = useDeliveryManagement();
  const { login: deliveryAuthLogin } = useDeliveryAuth();
  const { user, userProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  // Vérifier si un livreur avec email vérifié est déjà connecté
  useEffect(() => {
    const checkExistingDeliveryUser = async () => {
      if (user && user.emailVerified && userProfile?.role === 'delivery') {
        console.log('📧 Delivery user with verified email already authenticated, redirecting...');

        // Authentifier avec DeliveryAuthContext
        const deliveryUser = {
          id: user.uid,
          name: userProfile.name || userProfile.displayName || 'Livreur',
          email: userProfile.email,
          phone: userProfile.phone || '',
          role: userProfile.role,
        };

        await deliveryAuthLogin(deliveryUser);
        router.replace('/(delivery)/dashboard');
      }
    };

    if (user && userProfile && !loading) {
      checkExistingDeliveryUser();
    }
  }, [user, userProfile, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // Utiliser le système d'authentification spécialisé pour les livreurs
      const result = await loginDeliveryUser(email, password);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Vérifier si l'email doit être vérifié
        if (result.needsEmailVerification) {
          console.log('📧 Delivery user needs email verification');

          if (result.isNewActivation) {
            Alert.alert(
              '🎉 Compte activé !',
              `Bienvenue ${result.user.name}! Pour finaliser votre compte, veuillez vérifier votre email.`,
              [
                {
                  text: 'Vérifier mon email',
                  onPress: () => {
                    console.log('📧 Redirecting to email verification');
                    router.replace('/auth/email-verification');
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              '📧 Vérification requise',
              'Veuillez vérifier votre email pour accéder à l\'interface de livraison.',
              [
                {
                  text: 'Vérifier mon email',
                  onPress: () => {
                    console.log('📧 Redirecting to email verification');
                    router.replace('/auth/email-verification');
                  }
                }
              ]
            );
          }
          return;
        }

        // IMPORTANT: Aussi authentifier avec DeliveryAuthContext
        console.log('🔄 Authenticating with DeliveryAuthContext...');
        await deliveryAuthLogin(result.user);

        if (result.isNewActivation) {
          Alert.alert(
            '🎉 Compte activé !',
            `Bienvenue ${result.user.name}! Votre compte a été activé avec succès.`,
            [
              {
                text: 'Continuer',
                onPress: () => {
                  console.log('✅ Redirecting to delivery dashboard after activation');
                  router.replace('/(delivery)/dashboard');
                }
              }
            ]
          );
        } else {
          console.log('✅ Delivery user logged in, redirecting to delivery dashboard');
          router.replace('/(delivery)/dashboard');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur de connexion', result.error || 'Identifiants invalides');
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
        return 'Aucun compte livreur trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/access-denied':
        return 'Accès refusé. Vous n\'avez pas les droits de livraison';
      default:
        return 'Erreur de connexion. Vérifiez vos identifiants.';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isTabletDevice && isLandscapeMode && styles.scrollContentTabletLandscape
          ]}
          showsVerticalScrollIndicator={false}
        >

          {isTabletDevice && isLandscapeMode ? (
            // Layout pour tablette en mode paysage - En colonnes
            <View style={styles.tabletLandscapeContainer}>
              {/* Colonne gauche - Branding Livraison */}
              <View style={styles.leftColumn}>
                <View style={styles.header}>
                  <View style={[styles.deliveryIconContainer, styles.deliveryIconContainerTablet]}>
                    <Ionicons name="bicycle" size={64} color="rgba(255, 255, 255, 0.9)" />
                  </View>

                  <Text style={[styles.title, styles.titleTablet]}>Livraison</Text>
                  <Text style={[styles.subtitle, styles.subtitleTablet]}>
                    Accès réservé aux livreurs BriveFood
                  </Text>
                </View>

                {/* Other Authentication Options pour tablette */}
                <View style={styles.otherAuthSectionTablet}>
                  <Text style={[styles.otherAuthTitle, styles.otherAuthTitleTablet]}>Autres accès</Text>
                  <View style={styles.authButtonsColumn}>
                    <TouchableOpacity
                      style={styles.authOptionButtonTablet}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/auth/login');
                      }}
                    >
                      <View style={styles.authOptionContentTablet}>
                        <Ionicons name="person-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.authOptionTextTablet}>Clients</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.authOptionButtonTablet}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/auth/admin-login');
                      }}
                    >
                      <View style={styles.authOptionContentTablet}>
                        <Ionicons name="business-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.authOptionTextTablet}>Administration</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Colonne droite - Formulaire Livraison */}
              <View style={styles.rightColumn}>
                <View style={styles.formTablet}>
                  {/* Email Input */}
                  <View style={[styles.inputContainer, styles.inputContainerTablet]}>
                    <Text style={[styles.inputLabel, styles.inputLabelTablet]}>Email Livreur</Text>
                    <View style={[styles.inputWrapper, styles.inputWrapperTablet]}>
                      <Ionicons name="person-outline" size={24} color={colors.neutral.gray400} />
                      <TextInput
                        style={[styles.input, styles.inputTablet]}
                        placeholder="livreur@brivefood.com"
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
                      <Ionicons name="key-outline" size={24} color={colors.neutral.gray400} />
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

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.loginButton, styles.loginButtonTablet]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000', '#000000']}
                      style={[styles.loginButtonGradient, styles.loginButtonGradientTablet]}
                    >
                      <Ionicons name="bicycle" size={24} color={colors.neutral.white} style={styles.buttonIcon} />
                      <Text style={[styles.loginButtonText, styles.loginButtonTextTablet]}>
                        {loading ? 'Connexion...' : 'Accéder aux livraisons'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Delivery Info */}
                  <View style={[styles.deliveryInfo, styles.deliveryInfoTablet]}>
                    <Ionicons name="location" size={20} color="#000000" />
                    <Text style={[styles.deliveryInfoText, styles.deliveryInfoTextTablet]}>
                      Gérez vos livraisons en temps réel
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // Layout mobile/portrait standard
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.deliveryIconContainer}>
                  <Ionicons name="bicycle" size={48} color="rgba(255, 255, 255, 0.9)" />
                </View>

                <Text style={styles.title}>Livraison</Text>
                <Text style={styles.subtitle}>Accès réservé aux livreurs</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Livreur</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color={colors.neutral.gray400} />
                      <TextInput
                        style={styles.input}
                        placeholder="livreur@brivefood.com"
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
                      <Ionicons name="key-outline" size={20} color={colors.neutral.gray400} />
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

                  {/* Login Button */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000', '#000000']}
                      style={styles.loginButtonGradient}
                    >
                      <Ionicons name="bicycle" size={20} color={colors.neutral.white} style={styles.buttonIcon} />
                      <Text style={styles.loginButtonText}>
                        {loading ? 'Connexion...' : 'Accéder aux livraisons'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Delivery Info */}
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="location" size={16} color="#000000" />
                    <Text style={styles.deliveryInfoText}>
                      Gérez vos livraisons en temps réel
                    </Text>
                  </View>
                </View>
              </View>

              {/* Other Authentication Options */}
              <View style={styles.otherAuthSection}>
                <Text style={styles.otherAuthTitle}>Autres accès</Text>

                <View style={styles.authButtonsRow}>
                  <TouchableOpacity
                    style={styles.authOptionButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/auth/login');
                    }}
                  >
                    <View style={styles.authOptionContent}>
                      <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.authOptionText}>Clients</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.authOptionButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/auth/admin-login');
                    }}
                  >
                    <View style={styles.authOptionContent}>
                      <Ionicons name="business-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.authOptionText}>Admin</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  deliveryIconContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  loginButton: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  loginButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  deliveryInfoText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
    marginLeft: spacing.xs,
  },
  otherAuthSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  otherAuthTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  authButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  authOptionButton: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
  },
  authOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  authOptionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Styles pour tablette en paysage - Livraison
  scrollContentTabletLandscape: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  tabletLandscapeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '85%',
    maxHeight: 800,
    gap: spacing['3xl'],
  },
  leftColumn: {
    flex: 0.8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing['2xl'],
    paddingVertical: spacing.xl,
    minHeight: 600,
  },
  rightColumn: {
    flex: 1.2,
    justifyContent: 'center',
    maxWidth: 520,
    minWidth: 400,
  },

  // Branding pour tablette livraison
  deliveryIconContainerTablet: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 80,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleTablet: {
    fontSize: typography.fontSizes['4xl'],
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  subtitleTablet: {
    fontSize: typography.fontSizes.xl,
    textAlign: 'center',
    lineHeight: typography.fontSizes.xl * 1.4,
    paddingHorizontal: spacing.xl,
    maxWidth: 400,
    opacity: 0.9,
  },

  // Formulaire livraison pour tablette
  formTablet: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 28,
    padding: spacing['3xl'],
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minHeight: 500,
    width: '100%',
    maxWidth: 480,
  },

  // Styles pour inputs, boutons, etc. (identiques aux autres écrans)
  inputContainerTablet: {
    marginBottom: spacing.xl,
  },
  inputLabelTablet: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    marginBottom: spacing.md,
  },
  inputWrapperTablet: {
    height: 68,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
  },
  inputTablet: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.md,
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
    paddingVertical: spacing.lg + 4,
    borderRadius: borderRadius.xl,
  },
  loginButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
    letterSpacing: 0.5,
  },
  deliveryInfoTablet: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  deliveryInfoTextTablet: {
    fontSize: typography.fontSizes.sm,
    marginLeft: spacing.sm,
  },

  // Section autres accès pour tablette
  otherAuthSectionTablet: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  otherAuthTitleTablet: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    marginBottom: spacing.xl,
    letterSpacing: 0.5,
  },
  authButtonsColumn: {
    gap: spacing.lg,
    alignItems: 'stretch',
    minWidth: 280,
    width: '100%',
    maxWidth: 320,
  },
  authOptionButtonTablet: {
    borderRadius: borderRadius.xl,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 64,
  },
  authOptionContentTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  authOptionTextTablet: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
  },
});