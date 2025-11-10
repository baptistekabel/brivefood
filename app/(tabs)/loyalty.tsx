import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { useAuth } from '../../src/context/AuthContext';
import { useLoyalty } from '../../src/context/LoyaltyContext';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

export default function LoyaltyScreen() {
  const fontsLoaded = useFonts();
  const { user, isAuthenticated } = useAuth();
  const { userLoyaltyData, rewards } = useLoyalty();

  const loyaltyData = userLoyaltyData;

  // Animations d'apparition
  const headerAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(-30),
    scale: new Animated.Value(0.9)
  }).current;

  const pointsCardAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(50),
    scale: new Animated.Value(0.8)
  }).current;

  const progressSectionAnimation = useRef({
    opacity: new Animated.Value(0),
    translateX: new Animated.Value(-50)
  }).current;

  const infoSectionAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(30)
  }).current;

  // Animations existantes
  const pointsScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(
    Array.from({ length: rewards.length }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(40),
      scale: new Animated.Value(0.9)
    }))
  ).current;

  // Animations pour les emojis flottants (20 emojis de fidélité)
  const floatingEmojis = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  // Traitement des récompenses pour l'affichage
  const processedRewards = rewards.map(reward => ({
    ...reward,
    unlocked: loyaltyData.currentPoints >= reward.points,
  }));

  // Animation des emojis flottants avec trajectoires aléatoires
  const startFloatingEmojisAnimation = () => {
    floatingEmojis.forEach((animValue, index) => {
      // Délai pour étaler les démarrages
      const delay = Math.random() * 1000;
      // Durée entre 12 et 25 secondes
      const duration = 12000 + Math.random() * 13000;

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

  useEffect(() => {
    if (!fontsLoaded) return;

    // Animation d'apparition de l'en-tête
    Animated.timing(headerAnimation.opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(headerAnimation.translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(headerAnimation.scale, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animation d'apparition de la carte points avec délai
    setTimeout(() => {
      Animated.timing(pointsCardAnimation.opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.timing(pointsCardAnimation.translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.timing(pointsCardAnimation.scale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 200);

    // Animation d'apparition de la section progression avec délai
    setTimeout(() => {
      Animated.timing(progressSectionAnimation.opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.timing(progressSectionAnimation.translateX, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Animation d'apparition de la section info avec délai
    setTimeout(() => {
      Animated.timing(infoSectionAnimation.opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.timing(infoSectionAnimation.translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Animation des points (existante)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pointsScale, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pointsScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 800);

    // Animation de la barre de progression
    setTimeout(() => {
      Animated.timing(progressAnimation, {
        toValue: Math.min(loyaltyData.currentPoints / loyaltyData.nextRewardAt, 1),
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 800);

    // Animation des cartes avec délai en cascade
    setTimeout(() => {
      cardAnimations.forEach((animation, index) => {
        Animated.parallel([
          Animated.timing(animation.opacity, {
            toValue: 1,
            duration: 600,
            delay: index * 150,
            useNativeDriver: true,
          }),
          Animated.timing(animation.translateY, {
            toValue: 0,
            duration: 600,
            delay: index * 150,
            useNativeDriver: true,
          }),
          Animated.timing(animation.scale, {
            toValue: 1,
            duration: 600,
            delay: index * 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 1000);

    // Démarrer l'animation des emojis flottants
    startFloatingEmojisAnimation();
  }, [fontsLoaded, loyaltyData.currentPoints]);

  const claimReward = (reward) => {
    if (reward.unlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Ici, implémenter la logique pour réclamer la récompense
      console.log(`Récompense réclamée: ${reward.title}`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#111111', '#222222']}
          style={styles.gradient}
        >
          <StatusBar style="light" />
          <View style={styles.unauthenticatedContainer}>
            <Ionicons name="star-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.unauthenticatedTitle}>Connectez-vous</Text>
            <Text style={styles.unauthenticatedText}>
              Connectez-vous pour accéder à votre programme de fidélité
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#111111', '#222222']}
        style={styles.gradient}
      >
        <StatusBar style="light" />

        {/* Emojis flottants de fidélité avec trajectoires variables */}
        {floatingEmojis.map((animValue, index) => {
          // Liste d'emojis de fidélité et récompenses
          const loyaltyEmojis = ['⭐', '🏆', '🎁', '👑', '🥇', '🎖️', '💎', '🌟', '✨', '🔥', '💰', '🎉', '🥳', '💝', '🏅', '⚡', '💯', '🎊', '🔮', '💫'];
          const currentEmoji = loyaltyEmojis[index % loyaltyEmojis.length];

          // Dimensions de l'écran pour les calculs
          const screenWidth = width;
          const screenHeight = 900;
          let startX, endX, startY, endY;

          // Distribution des emojis en zones pour une meilleure répartition
          const zone = Math.floor(index / 4); // 4 emojis par zone
          const zoneWidth = screenWidth / 3; // 3 zones horizontales
          const baseX = (zone % 3) * zoneWidth;

          // Trajectoires variées : diagonales, courbes, verticales
          if (index % 4 === 0) {
            // Diagonale gauche vers droite
            startX = baseX + Math.random() * 50;
            endX = startX + 200 + Math.random() * 100;
            startY = screenHeight + 50;
            endY = -100;
          } else if (index % 4 === 1) {
            // Diagonale droite vers gauche
            startX = baseX + zoneWidth - Math.random() * 50;
            endX = startX - 200 - Math.random() * 100;
            startY = screenHeight + 50;
            endY = -100;
          } else if (index % 4 === 2) {
            // Montée verticale avec léger zigzag
            startX = baseX + zoneWidth/2 + (Math.random() - 0.5) * 60;
            endX = startX + (Math.random() - 0.5) * 40;
            startY = screenHeight + 50;
            endY = -100;
          } else {
            // Courbe en S
            startX = baseX + Math.random() * zoneWidth;
            endX = baseX + Math.random() * zoneWidth;
            startY = screenHeight + 50;
            endY = -100;
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
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startX, endX],
                      }),
                    },
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startY, endY],
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [0, amplitude, 0, -amplitude, 0],
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
                        inputRange: [0, 0.1, 0.9, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.emojiText}>{currentEmoji}</Text>
            </Animated.View>
          );
        })}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[
            styles.header,
            {
              opacity: headerAnimation.opacity,
              transform: [
                { translateY: headerAnimation.translateY },
                { scale: headerAnimation.scale }
              ]
            }
          ]}>
            <Text style={styles.headerTitle}>Programme Fidélité</Text>
            <Text style={styles.headerSubtitle}>
              Gagnez des points à chaque commande !
            </Text>
          </Animated.View>

          {/* Carte Points */}
          <Animated.View
            style={[
              styles.pointsCard,
              {
                opacity: pointsCardAnimation.opacity,
                transform: [
                  { scale: pointsScale },
                  { translateY: pointsCardAnimation.translateY },
                  { scale: pointsCardAnimation.scale }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a', '#3a3a3a']}
              style={styles.pointsCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.pointsCardContent}>
                <View style={styles.pointsSection}>
                  <Text style={styles.pointsLabel}>Mes Points</Text>
                  <Text style={styles.pointsValue}>
                    {loyaltyData.currentPoints % 1 === 0
                      ? loyaltyData.currentPoints.toString()
                      : loyaltyData.currentPoints.toFixed(2)
                    }
                  </Text>
                </View>

                <View style={styles.statsSection}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total dépensé</Text>
                    <Text style={styles.statValue}>{loyaltyData.totalSpent}€</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Prochaine récompense</Text>
                    <Text style={styles.statValue}>{loyaltyData.nextRewardAt} pts</Text>
                  </View>
                </View>
              </View>

              {/* Étoiles décoratives */}
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name="star"
                    size={12}
                    color="rgba(255,215,0,0.3)"
                    style={[
                      styles.decorativeStar,
                      {
                        top: Math.random() * 80 + 10,
                        left: Math.random() * 80 + 10,
                      }
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Barre de progression */}
          <Animated.View style={[
            styles.progressSection,
            {
              opacity: progressSectionAnimation.opacity,
              transform: [{ translateX: progressSectionAnimation.translateX }]
            }
          ]}>
            <Text style={styles.progressTitle}>Progression vers la prochaine récompense</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {loyaltyData.currentPoints % 1 === 0
                  ? loyaltyData.currentPoints.toString()
                  : loyaltyData.currentPoints.toFixed(2)
                } / {loyaltyData.nextRewardAt} points
              </Text>
            </View>
            <Text style={styles.progressHint}>
              1€ dépensé = 0,1 point • 10€ dépensés = 1 point de fidélité
            </Text>
          </Animated.View>

          {/* Récompenses */}
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Vos Récompenses</Text>

            <View style={styles.rewardsContainer}>
              {processedRewards.map((reward, index) => (
                <Animated.View
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    {
                      opacity: cardAnimations[index]?.opacity || 0,
                      transform: [
                        {
                          translateY: cardAnimations[index]?.translateY || 40,
                        },
                        {
                          scale: cardAnimations[index]?.scale || 0.9,
                        }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.rewardCardContainer,
                      {
                        borderColor: reward.unlocked ? reward.color : '#E5E5E5',
                        backgroundColor: reward.unlocked ? '#FFFFFF' : '#F8F8F8'
                      }
                    ]}
                    onPress={() => claimReward(reward)}
                    disabled={!reward.unlocked}
                    activeOpacity={reward.unlocked ? 0.7 : 1}
                  >
                    {/* Header avec icône et badge points */}
                    <View style={styles.rewardHeader}>
                      <View style={[
                        styles.rewardIconCircle,
                        { backgroundColor: reward.unlocked ? reward.color : '#E5E5E5' }
                      ]}>
                        {reward.image ? (
                          <Image
                            source={reward.image}
                            style={[
                              styles.rewardImage,
                              { opacity: reward.unlocked ? 1 : 0.5 }
                            ]}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons
                            name={reward.icon}
                            size={28}
                            color={reward.unlocked ? '#FFFFFF' : '#999999'}
                          />
                        )}
                      </View>
                      <View style={[
                        styles.pointsBadgeNew,
                        { backgroundColor: reward.unlocked ? reward.color : '#E5E5E5' }
                      ]}>
                        <Text style={[
                          styles.pointsBadgeTextNew,
                          { color: reward.unlocked ? '#FFFFFF' : '#999999' }
                        ]}>
                          {reward.points} pts
                        </Text>
                      </View>
                    </View>

                    {/* Contenu */}
                    <View style={styles.rewardContent}>
                      <Text style={[
                        styles.rewardTitleNew,
                        { color: reward.unlocked ? '#000000' : '#999999' }
                      ]}>
                        {reward.title}
                      </Text>
                      <Text style={[
                        styles.rewardDescriptionNew,
                        { color: reward.unlocked ? '#666666' : '#CCCCCC' }
                      ]}>
                        {reward.description}
                      </Text>
                    </View>

                    {/* Footer avec statut */}
                    <View style={styles.rewardFooter}>
                      {reward.unlocked ? (
                        <View style={styles.availableBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                          <Text style={styles.availableText}>Disponible</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedBadgeNew}>
                          <Ionicons name="lock-closed" size={16} color="#999999" />
                          <Text style={styles.lockedTextNew}>
                            {(reward.points - loyaltyData.currentPoints).toFixed(1)} pts manquants
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Comment gagner des points */}
          <Animated.View style={[
            styles.infoSection,
            {
              opacity: infoSectionAnimation.opacity,
              transform: [{ translateY: infoSectionAnimation.translateY }]
            }
          ]}>
            <Text style={styles.sectionTitle}>Comment gagner des points ?</Text>
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Ionicons name="card" size={24} color="#FFD700" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Passez commande</Text>
                  <Text style={styles.infoText}>1€ dépensé = 0,1 point gagné</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="gift" size={24} color="#4CAF50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Échangez vos points</Text>
                  <Text style={styles.infoText}>Contre des récompenses exclusives</Text>
                </View>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing['3xl'],
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Carte Points
  pointsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  pointsCardGradient: {
    padding: spacing.xl,
    position: 'relative',
  },
  pointsCardContent: {
    zIndex: 1,
  },
  pointsSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pointsLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: typography.fontFamily.title,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeStar: {
    position: 'absolute',
  },

  // Barre de progression
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  progressHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Section Title
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  // Récompenses - Nouveau design
  rewardsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  rewardsContainer: {
    gap: spacing.md,
  },
  rewardCard: {
    marginBottom: spacing.md,
  },
  rewardCardContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  rewardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  pointsBadgeNew: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsBadgeTextNew: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
  },
  rewardContent: {
    marginBottom: spacing.md,
  },
  rewardTitleNew: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    marginBottom: spacing.xs,
  },
  rewardDescriptionNew: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    lineHeight: typography.fontSizes.base * 1.4,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  availableText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#22C55E',
  },
  lockedBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  lockedTextNew: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#999999',
  },

  // Section Info
  infoSection: {
    paddingHorizontal: spacing.lg,
  },
  infoCards: {
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },

  // Non authentifié
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  unauthenticatedTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  unauthenticatedText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: typography.fontSizes.base * 1.5,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 28,
    opacity: 0.7,
  },
});