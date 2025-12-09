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
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { UserRole } from '../../src/types';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';

export default function RegisterScreen() {
  const fontsLoaded = useFonts();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animations pour les emojis flottants (20 emojis pour la page d'inscription)
  const floatingEmojis = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  // Mémoriser les trajectoires pour éviter la réinitialisation lors des re-renders
  const emojiTrajectories = useRef(
    Array.from({ length: 20 }, (_, index) => {
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

  const formatPhoneNumber = (phone) => {
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');

    // Limiter à 10 chiffres maximum
    const limited = cleaned.slice(0, 10);

    // Formater 2 par 2 : 06 12 34 56 78
    const formatted = limited.replace(/(\d{2})(?=\d)/g, '$1 ');

    return formatted;
  };

  const updateField = (field, value) => {
    if (field === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const { firstName, lastName, phone, email, password, confirmPassword } = formData;

    if (!firstName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom');
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return false;
    }

    // Validation du numéro de téléphone français (format 06 12 34 56 78 ou similaire)
    const cleanPhone = phone.replace(/\s/g, ''); // Supprimer les espaces pour la validation
    const phoneRegex = /^0[1-9]\d{8}$/; // Format: 0 + chiffre 1-9 + 8 chiffres
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (format: 06 12 34 56 78)');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return false;
    }

    // Validation email plus simple et permissive
    const emailRegex = /\S+@\S+\.\S+/;
    const trimmedEmail = email.trim();
    console.log('Email à valider:', trimmedEmail);
    console.log('Email valide:', emailRegex.test(trimmedEmail));

    if (!emailRegex.test(trimmedEmail)) {
      console.log('Email rejeté par la validation côté client');
      Alert.alert('Erreur', `Email invalide: "${trimmedEmail}". Veuillez vérifier le format.`);
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone.replace(/\s/g, ''), // Supprimer les espaces avant d'envoyer
        role: UserRole.CUSTOMER,
      };

      console.log('Tentative d\'inscription avec email:', formData.email);
      console.log('UserData:', userData);

      const result = await register(formData.email, formData.password, userData);

      console.log('Résultat inscription:', result);

      if (result.success) {
        Alert.alert(
          'Inscription réussie !',
          'Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre email avant de vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/email-verification')
            }
          ]
        );
      } else {
        Alert.alert('Erreur d\'inscription', getErrorMessage(result.error));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé par un autre compte';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible';
      default:
        return 'Erreur lors de l\'inscription. Veuillez réessayer.';
    }
  };

  const handleGoToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
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
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓', '🥨', '🧄', '🥒', '🍅', '🌶️'];
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
            showsVerticalScrollIndicator={false}
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

              <Text style={styles.modernTitle}>INSCRIPTION</Text>
              <Text style={styles.modernSubtitle}>
                Découvrez BriveFood dès maintenant.
              </Text>
            </View>

            {/* Formulaire moderne */}
            <View style={styles.modernFormContainer}>
              <View style={styles.modernForm}>
                <Text style={styles.formTitle}>Créer votre compte</Text>
                
                {/* First Name Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Prénom</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="person" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="Jean"
                          placeholderTextColor="#999"
                          value={formData.firstName}
                          onChangeText={(value) => updateField('firstName', value)}
                          autoCapitalize="words"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Last Name Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Nom</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="person-outline" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="Dupont"
                          placeholderTextColor="#999"
                          value={formData.lastName}
                          onChangeText={(value) => updateField('lastName', value)}
                          autoCapitalize="words"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Phone Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Numéro de téléphone</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="call" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="06 12 34 56 78"
                          placeholderTextColor="#999"
                          value={formData.phone}
                          onChangeText={(value) => updateField('phone', value)}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Email Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Email</Text>
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
                          value={formData.email}
                          onChangeText={(value) => updateField('email', value)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Password Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Mot de passe</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="lock-closed" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="••••••••"
                          placeholderTextColor="#999"
                          value={formData.password}
                          onChangeText={(value) => updateField('password', value)}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setShowPassword(!showPassword);
                          }}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color="#000000" 
                          />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Confirm Password Input moderne */}
                <View style={styles.modernInputContainer}>
                  <Text style={styles.modernInputLabel}>Confirmer le mot de passe</Text>
                  <View style={styles.modernInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.inputGradientBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons name="lock-closed" size={20} color="#000000" />
                        <TextInput
                          style={styles.modernInput}
                          placeholder="••••••••"
                          placeholderTextColor="#999"
                          value={formData.confirmPassword}
                          onChangeText={(value) => updateField('confirmPassword', value)}
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                        >
                          <Ionicons 
                            name={showConfirmPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color="#000000" 
                          />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Terms moderne */}
                <TouchableOpacity 
                  style={styles.modernTermsContainer}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAcceptTerms(!acceptTerms);
                  }}
                >
                  <View style={[styles.modernCheckbox, acceptTerms && styles.modernCheckboxChecked]}>
                    {acceptTerms && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.modernTermsText}>
                    J'accepte les{' '}
                    <Text style={styles.modernTermsLink}>conditions d'utilisation</Text>
                    {' '}et la{' '}
                    <Text style={styles.modernTermsLink}>politique de confidentialité</Text>
                  </Text>
                </TouchableOpacity>

                {/* Bouton moderne */}
                <View style={styles.modernButtonContainer}>
                  <TouchableOpacity 
                    style={styles.modernRegisterButton} 
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={loading ? ['#999', '#666'] : ['#000000', '#000000']}
                      style={styles.modernRegisterButtonGradient}
                    >
                      <Ionicons name="person-add" size={20} color="white" style={styles.buttonIcon} />
                      <Text style={styles.modernRegisterButtonText}>
                        {loading ? 'Inscription...' : 'S\'inscrire'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Login Link moderne */}
                  <View style={styles.modernLoginContainer}>
                    <Text style={styles.modernLoginText}>Déjà un compte ? </Text>
                    <TouchableOpacity onPress={handleGoToLogin}>
                      <Text style={styles.modernLoginLink}>Se connecter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    minHeight: 900,
  },
  
  // Header moderne
  modernHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  modernTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    marginBottom: spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
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
    marginBottom: spacing.lg,
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
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modernInputContainer: {
    marginBottom: spacing.md,
  },
  modernInputLabel: {
    fontSize: typography.fontSizes.sm,
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
    height: 50,
  },
  modernInput: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#333',
    marginLeft: spacing.sm,
  },
  
  // Terms modernes
  modernTermsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  modernCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  modernCheckboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  modernTermsText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.xs,
  },
  modernTermsLink: {
    color: 'white',
    fontFamily: typography.fontFamily.semibold,
    textDecorationLine: 'underline',
  },
  
  // Boutons modernes
  modernButtonContainer: {
    gap: spacing.md,
  },
  modernRegisterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernRegisterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  modernRegisterButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  modernLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modernLoginText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  modernLoginLink: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    textDecorationLine: 'underline',
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