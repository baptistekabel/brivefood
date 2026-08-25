import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  Animated,
  Image,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { useOrder } from '../../src/context/OrderContext';
import { useOrderRating } from '../../src/context/OrderRatingContext';
import restaurantStatusService from '../../src/services/restaurantStatusService';
import orderRatingService from '../../src/services/orderRatingService';
import firebaseRatingService from '../../src/services/firebaseRatingService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const fontsLoaded = useFonts();
  const { setOrderType } = useOrder();
  const { triggerRatingRequest } = useOrderRating();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(null);
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  
  // Animations d'apparition pour les éléments
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(50)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateX = useRef(new Animated.Value(-100)).current;
  
  // Animations pour les emojis flottants (25 emojis)
  const floatingEmojis = useRef(
    Array.from({ length: 25 }, () => new Animated.Value(0))
  ).current;

  const navigateToMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/menu');
  };

  const openNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const address = "23 Bis Avenue Du Président Roosevelt, Brive-La-Gaillarde, 19100";
    const encodedAddress = encodeURIComponent(address);

    if (Platform.OS === 'ios') {
      // Sur iOS, proposer le choix entre Plans et Google Maps
      Alert.alert(
        'Ouvrir dans quelle app ?',
        'Choisissez votre application de navigation préférée',
        [
          {
            text: 'Plans (Apple)',
            onPress: () => {
              const appleUrl = `http://maps.apple.com/?q=${encodedAddress}`;
              Linking.openURL(appleUrl);
            }
          },
          {
            text: 'Google Maps',
            onPress: () => {
              const googleUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
              Linking.openURL(googleUrl);
            }
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
    } else {
      // Sur Android, ouvrir directement Google Maps
      const googleUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
      Linking.openURL(googleUrl);
    }
  };

  const callRestaurant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const phoneNumber = "tel:0766881697";
    Linking.openURL(phoneNumber);
  };

  const openFacebook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const facebookUrl = "https://www.facebook.com/p/Brive-Food-100063692604285/?locale=fr_FR";
    Linking.openURL(facebookUrl);
  };

  const openInstagram = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const instagramUrl = "https://www.instagram.com/brivefood/#";
    Linking.openURL(instagramUrl);
  };

  const openSnapchat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const snapchatUrl = "https://www.snapchat.com/add/brive-food";
    Linking.openURL(snapchatUrl);
  };

  const openGoogleReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Lien direct vers les avis Google de Brive Food
    const googleReviewUrl = "https://www.google.com/search?sca_esv=73e86a78892c9231&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E6CE8-ogxkRJSHGB_v1ap1XBap_MMV-WRxmGsNt9rZz6wvYssWYBTNwxmBqXPbdIl6bgTi9rfLoXKb8msfqyk7uFTi1a&q=Brive+food+Avis&sa=X&ved=2ahUKEwi1ru6dwrKRAxXTQ6QEHcv7BdMQ0bkNegQIIhAE&biw=1080&bih=735&dpr=2";
    Linking.openURL(googleReviewUrl);
  };

  const checkRestaurantStatus = async () => {
    try {
      const status = await restaurantStatusService.getStatus();
      console.log('🏪 Client: Statut récupéré:', status);
      setRestaurantStatus(status);
      setIsRestaurantOpen(status.isOpen);
    } catch (error) {
      console.error('Erreur récupération statut restaurant:', error);
      // En cas d'erreur, on affiche fermé par sécurité (ne jamais calculer côté client)
      setIsRestaurantOpen(false);
    }
  };

  useEffect(() => {
    // Initialiser le service côté client (lecture seule depuis Firestore)
    const initializeStatusService = async () => {
      await restaurantStatusService.initializeClient();
      // Le statut est déjà chargé depuis Firestore par initializeClient
      const status = restaurantStatusService.currentStatus;
      if (status) {
        setRestaurantStatus(status);
        setIsRestaurantOpen(status.isOpen);
      }
    };

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

    // Animation de pulsation pour le statut
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1500,
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

    // Animations d'apparition séquentielles et originales
    const startEntranceAnimations = () => {
      // 1. Header avec effet de chute élégante
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Hero avec effet d'explosion douce (délai 300ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(heroOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(heroScale, {
            toValue: 1,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // 3. Boutons avec effet de glissement vers le haut (délai 600ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(buttonsTranslateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 600);

      // 4. Infos avec effet de glissement latéral (délai 900ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(infoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(infoTranslateX, {
            toValue: 0,
            tension: 50,
            friction: 9,
            useNativeDriver: true,
          }),
        ]).start();
      }, 900);
    };

    startBackgroundAnimation();
    startPulseAnimation();
    startFloatingEmojisAnimation();
    startEntranceAnimations();

    // Initialiser le service et écouter les changements via Firestore
    initializeStatusService();

    // Écouter les notifications de changement de statut
    const removeListener = restaurantStatusService.addStatusListener((newStatus, previousStatus) => {
      console.log('🔔 Client: Notification statut reçue:', newStatus);
      setRestaurantStatus(newStatus);
      setIsRestaurantOpen(newStatus.isOpen);
    });

    return () => {
      removeListener();
    };
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
          
          // Distribution plus équilibrée sur l'écran
          const trajectoryType = index % 6; // Plus de types de trajectoires
          const screenWidth = 400;
          const screenHeight = 900;
          let startX, endX, startY, endY;
          
          // Distribution des emojis en zones pour une meilleure répartition
          const zone = Math.floor(index / 4); // 4 emojis par zone
          const zoneWidth = screenWidth / 3; // 3 zones horizontales
          const baseX = (zone % 3) * zoneWidth;
          
          switch (trajectoryType) {
            case 0: // Du bas vers le haut - zone gauche
              startX = baseX + Math.random() * zoneWidth;
              endX = startX + (Math.random() - 0.5) * 100;
              startY = screenHeight + 100;
              endY = -100;
              break;
            case 1: // De la gauche vers la droite - milieu de l'écran
              startX = -100;
              endX = screenWidth + 100;
              startY = 300 + (index % 3) * 150;
              endY = startY + (Math.random() - 0.5) * 200;
              break;
            case 2: // De la droite vers la gauche - milieu de l'écran
              startX = screenWidth + 100;
              endX = -100;
              startY = 400 + (index % 3) * 100;
              endY = startY + (Math.random() - 0.5) * 150;
              break;
            case 3: // Du haut vers le bas - zone droite
              startX = baseX + Math.random() * zoneWidth;
              endX = startX + (Math.random() - 0.5) * 80;
              startY = -100;
              endY = screenHeight + 100;
              break;
            case 4: // Diagonale montante
              startX = Math.random() * screenWidth;
              endX = (startX + screenWidth / 2) % screenWidth;
              startY = screenHeight + 100;
              endY = -100;
              break;
            case 5: // Diagonale descendante
              startX = Math.random() * screenWidth;
              endX = (startX + screenWidth / 3) % screenWidth;
              startY = -100;
              endY = screenHeight + 100;
              break;
          }
          
          // Trajectoire sinusoïdale plus variée
          const amplitude = 15 + (index % 4) * 12;
          const rotationSpeed = (index % 3 + 1) * 180; // Rotation différente pour chaque emoji
          
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
                        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        outputRange: [0, amplitude, -amplitude/2, amplitude/2, -amplitude, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotate: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${rotationSpeed}deg`],
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
        
        {/* Header fixe avec image BriveFood */}
        <View style={styles.fixedHeader}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logoBrivefood.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
            
            {/* Statut du restaurant */}
            <View style={styles.statusWrapper}>
              <View style={styles.statusContainer}>
                <Animated.View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: isRestaurantOpen ? '#10B981' : '#EF4444',
                      transform: [{ scale: pulseValue }]
                    }
                  ]}
                />
                <Text style={styles.statusText}>
                  {isRestaurantOpen ? 'Ouvert' : 'Fermé'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        {/* Offre spéciale du moment */}
        <Animated.View
          style={[
            styles.promoBanner,
            {
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }]
            }
          ]}
        >
          <View style={styles.promoCardContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E88', '#FFA4A4']}
              style={styles.promoGradientFull}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.8 }}
            >
              <View style={styles.promoContentFull}>
                <View style={styles.promoLeft}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>OFFRE SPÉCIALE</Text>
                  </View>
                  <Text style={styles.promoMainText}>PROMO DU MOMENT</Text>
                </View>

                <View style={styles.promoRight}>
                  <View style={styles.promoIconContainer}>
                    <Ionicons name="gift" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Action principale - Menu */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroOpacity,
              transform: [{ scale: heroScale }]
            }
          ]}
        >
          <TouchableOpacity style={styles.heroAction} onPress={navigateToMenu}>
            <View style={styles.heroCardContainer}>
              {/* Couches multiples pour effet de profondeur */}
              <View style={styles.heroLayer1} />
              <View style={styles.heroLayer2} />
              <View style={styles.heroLayer3} />
              
              {/* Contenu principal */}
              <View style={styles.heroMainCard}>
                <LinearGradient
                  colors={['rgba(255,248,220,0.98)', 'rgba(255,239,213,0.95)']}
                  style={styles.heroCardGradient}
                >
                  {/* Éléments décoratifs géométriques */}
                  <View style={styles.heroGeometricPattern}>
                    <View style={[styles.triangle, styles.triangle1]} />
                    <View style={[styles.triangle, styles.triangle2]} />
                    <View style={[styles.circle, styles.circle1]} />
                    <View style={[styles.circle, styles.circle2]} />
                    <View style={[styles.rectangle, styles.rectangle1]} />
                  </View>
                  
                  <View style={styles.heroContent}>
                    {/* Icône avec effet néon */}
                    <View style={styles.heroIconContainer}>
                      <View style={styles.neonGlow} />
                      <LinearGradient
                        colors={['#FF7F50', '#FF6347']}
                        style={styles.heroIconGradient}
                      >
                        <Ionicons name="restaurant" size={20} color={colors.neutral.white} />
                      </LinearGradient>
                    </View>
                    
                    <Text style={styles.heroTitle} numberOfLines={2} adjustsFontSizeToFit>
                      Passer votre commande
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>

        </Animated.View>

        {/* Informations pratiques */}
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: infoOpacity,
              transform: [{ translateX: infoTranslateX }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Informations pratiques</Text>

          <View style={styles.infoCardsRow}>
            <TouchableOpacity style={styles.infoCardCompact} onPress={openNavigation}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.infoCardGradient}
              >
                <View style={styles.infoIconBadge}>
                  <Ionicons name="location" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Adresse</Text>
                  <Text style={styles.infoSubtext}>23 Bis Av. Roosevelt</Text>
                  <Text style={styles.infoSubtext}>Brive-La-Gaillarde</Text>
                  <Text style={styles.infoHint}> </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCardCompact} onPress={callRestaurant}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.infoCardGradient}
              >
                <View style={styles.infoIconBadge}>
                  <Ionicons name="call" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoMainText}>07 66 88 16 97</Text>
                  <Text style={styles.infoHint}>service gratuit + coût de l'appel</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>


        {/* Réseaux sociaux */}
        <Animated.View
          style={[
            styles.socialSection,
            {
              opacity: infoOpacity,
              transform: [{ translateX: infoTranslateX }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Suivez-nous</Text>

          <View style={styles.socialCardsRow}>
            <TouchableOpacity style={styles.socialCardCompact} onPress={openFacebook}>
              <LinearGradient
                colors={['#1877F2', '#42A5F5']}
                style={styles.socialCardGradient}
              >
                <View style={styles.socialIconBadge}>
                  <Ionicons name="logo-facebook" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.socialLabel}>Facebook</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialCardCompact} onPress={openInstagram}>
              <LinearGradient
                colors={['#E4405F', '#F56040', '#FFDC80']}
                style={styles.socialCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.socialIconBadge}>
                  <Ionicons name="logo-instagram" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.socialLabel}>Instagram</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialCardCompact} onPress={openSnapchat}>
              <LinearGradient
                colors={['#FFFC00', '#FFE135']}
                style={styles.socialCardGradient}
              >
                <View style={styles.socialIconBadge}>
                  <Ionicons name="logo-snapchat" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.socialLabel}>Snapchat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Section Avis Google */}
        <Animated.View
          style={[
            styles.reviewSection,
            {
              opacity: infoOpacity,
              transform: [{ translateX: infoTranslateX }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Donnez votre avis</Text>

          <TouchableOpacity style={styles.reviewCard} onPress={openGoogleReview}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.reviewCardGradient}
            >
              <View style={styles.reviewContent}>
                <View style={styles.reviewLeft}>
                  <Image
                    source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                    style={styles.googleLogo}
                  />
                  <View style={styles.reviewTextContainer}>
                    <Text style={styles.reviewTitle}>Laissez un avis sur Google</Text>
                    <Text style={styles.reviewSubtext}>Votre avis compte pour nous !</Text>
                  </View>
                </View>
                <View style={styles.reviewStars}>
                  <Ionicons name="star" size={18} color="#FBBC04" />
                  <Ionicons name="star" size={18} color="#FBBC04" />
                  <Ionicons name="star" size={18} color="#FBBC04" />
                  <Ionicons name="star" size={18} color="#FBBC04" />
                  <Ionicons name="star" size={18} color="#FBBC04" />
                </View>
              </View>
              <View style={styles.reviewArrow}>
                <Ionicons name="chevron-forward" size={24} color={colors.neutral.gray400} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>


      </ScrollView>
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
  scrollView: {
    flex: 1,
    marginTop: 200,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  statusWrapper: {
    position: 'absolute',
    bottom: -24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  statusTimeUntil: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  heroAction: {
    position: 'relative',
  },
  heroCardContainer: {
    position: 'relative',
    borderRadius: borderRadius.xl,
  },
  // Couches pour effet de profondeur 3D
  heroLayer1: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(255, 165, 0, 0.25)',
    borderRadius: borderRadius.xl,
    transform: [{ rotate: '2deg' }],
  },
  heroLayer2: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    borderRadius: borderRadius.xl,
    transform: [{ rotate: '-1deg' }],
  },
  heroLayer3: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: borderRadius.xl,
    transform: [{ rotate: '0.5deg' }],
  },
  heroMainCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 10,
  },
  heroCardGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 80,
    position: 'relative',
  },
  // Éléments géométriques décoratifs
  heroGeometricPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  triangle1: {
    top: 20,
    right: 30,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 140, 0, 0.4)',
  },
  triangle2: {
    bottom: 25,
    left: 25,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 99, 71, 0.3)',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 12,
    height: 12,
    top: 35,
    left: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
  circle2: {
    width: 8,
    height: 8,
    bottom: 40,
    right: 50,
    backgroundColor: 'rgba(255, 165, 0, 0.4)',
  },
  rectangle: {
    position: 'absolute',
  },
  rectangle1: {
    width: 10,
    height: 16,
    top: 50,
    right: 60,
    backgroundColor: 'rgba(255, 127, 80, 0.35)',
    borderRadius: 2,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 5,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  heroIconContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  neonGlow: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 127, 80, 0.4)',
    top: -3,
    left: -3,
  },
  heroIconGradient: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  heroTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.gray800,
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: typography.fontSizes.lg * 1.2,
    width: '100%',
  },
  heroActionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  heroButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  heroButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  // Styles pour le bouton À emporter (carte blanche avec effet glassmorphism)
  takeawayCard: {
    flex: 1,
    minWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    maxWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    position: 'relative',
  },
  takeawayCardContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
  },
  // Couches pour effet de profondeur 3D - À emporter (jaune)
  takeawayLayer1: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '1.5deg' }],
  },
  takeawayLayer2: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '-0.8deg' }],
  },
  takeawayLayer3: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '0.4deg' }],
  },
  cardBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 10,
  },
  cardGlassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 5,
    right: 10,
  },
  cardContent: {
    padding: spacing.md,
    flex: 1,
    zIndex: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconBadge: {
    marginRight: spacing.sm,
  },
  iconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  cardDescription: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAction: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.main,
  },
  cardArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.accent.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles pour le bouton Livraison (carte violette similaire)
  deliveryCard: {
    flex: 1,
    minWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    maxWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    position: 'relative',
  },
  deliveryCardContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
  },
  // Couches pour effet de profondeur 3D - Livraison (violet)
  deliveryLayer1: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '1.5deg' }],
  },
  deliveryLayer2: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '-0.8deg' }],
  },
  deliveryLayer3: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '0.4deg' }],
  },
  deliveryCardBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 10,
  },
  deliveryGlassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  deliveryDecorativePattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
  },
  deliveryPatternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 5,
    right: 10,
  },
  deliveryContent: {
    padding: spacing.md,
    flex: 1,
    zIndex: 5,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  deliveryIconBadge: {
    marginRight: spacing.sm,
  },
  deliveryIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  deliveryDescription: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryAction: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
  },
  deliveryArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.primary.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles pour le bouton Sur place (carte orange)
  dineInCard: {
    flex: 1,
    minWidth: '100%',
    position: 'relative',
    marginTop: spacing.sm,
  },
  dineInCardContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
  },
  // Couches pour effet de profondeur 3D - Sur place (orange)
  dineInLayer1: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(247, 189, 79, 0.3)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '1.5deg' }],
  },
  dineInLayer2: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(242, 184, 74, 0.2)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '-0.8deg' }],
  },
  dineInLayer3: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(241, 171, 75, 0.15)',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '0.4deg' }],
  },
  dineInCardBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 10,
  },
  dineInGlassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dineInDecorativePattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
  },
  dineInPatternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 5,
    right: 10,
  },
  dineInContent: {
    padding: spacing.md,
    flex: 1,
    zIndex: 5,
  },
  dineInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dineInIconBadge: {
    marginRight: spacing.sm,
  },
  dineInIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dineInTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  dineInDescription: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  dineInFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dineInAction: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#f7bd4f',
  },
  dineInArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f7bd4f20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoCardCompact: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  infoCardGradient: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
    flex: 1,
  },
  infoIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoSubtext: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: typography.fontSizes.xs * 1.3,
  },
  infoMainText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: typography.fontSizes.xs * 1.2,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 30,
  },

  // Styles pour la carte promo
  promoBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  promoCardContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    height: 120,
  },
  promoGradientFull: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flex: 1,
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  promoContentFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  promoLeft: {
    flex: 1,
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  promoBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  promoMainText: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
  },
  promoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  promoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles pour les réseaux sociaux
  socialSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  socialCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  socialCardCompact: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  socialCardGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  socialIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  socialLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Styles pour la section Avis Google
  reviewSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  reviewCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  reviewCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  reviewContent: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  reviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  googleLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginTop: 4,
    alignSelf: 'center',
  },
  reviewTextContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  reviewSubtext: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: 56,
  },
  reviewArrow: {
    marginLeft: spacing.sm,
  },

});
