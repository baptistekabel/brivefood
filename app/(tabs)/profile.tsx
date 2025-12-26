import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { useAuth } from '../../src/context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

export default function ProfileScreen() {
  const fontsLoaded = useFonts();
  const { user, userProfile, isAuthenticated, logout } = useAuth();

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.toString().replace(/\D/g, '');
    return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return userProfile.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Animations
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Mémoriser les trajectoires des emojis
  const emojiTrajectories = useRef(
    Array.from({ length: 8 }, (_, index) => {
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
          startX = 0; endX = 0; startY = 0; endY = 0;
      }
      return { startX, endX, startY, endY, amplitude: 20 + (index % 3) * 15 };
    })
  ).current;

  const floatingEmojis = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    // Animations séquentielles
    Animated.stagger(150, [
      Animated.spring(headerAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(menuAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation des emojis
    floatingEmojis.forEach((animValue, index) => {
      const delay = Math.random() * 2000;
      const duration = 18000 + Math.random() * 12000;

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
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:brivefood@gmail.com?subject=Contact%20Service%20Client%20BriveFood');
  };

  const menuItems = [
    {
      id: 'personal-info',
      title: 'Informations personnelles',
      subtitle: 'Modifier mon profil',
      icon: 'person-outline',
      gradient: [colors.secondary.main, colors.secondary.dark],
      action: () => router.push('/profile/edit'),
    },
    {
      id: 'orders',
      title: 'Historique des commandes',
      subtitle: 'Voir mes commandes passées',
      icon: 'receipt-outline',
      gradient: [colors.accent.main, colors.accent.dark],
      action: () => router.push('/profile/orders'),
    },
    {
      id: 'contact',
      title: 'Nous contacter',
      subtitle: 'brivefood@gmail.com',
      icon: 'mail-outline',
      gradient: ['#4CAF50', '#388E3C'],
      action: handleContactSupport,
    },
  ];

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/auth/login');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/auth/login');
  };

  // Rendu des emojis flottants
  const renderFloatingEmojis = () => {
    const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🍗', '🥤'];

    return floatingEmojis.map((animValue, index) => {
      const trajectory = emojiTrajectories[index];
      const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];

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
                outputRange: [0, 0.25, 0.25, 0],
              }),
            },
          ]}
        >
          <Text style={styles.emojiText}>{currentEmoji}</Text>
        </Animated.View>
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#000000', '#111111', '#222222']}
        style={styles.container}
      >
        <StatusBar style="light" />
        {renderFloatingEmojis()}

        <View style={styles.loginPrompt}>
          <View style={styles.loginIconContainer}>
            <LinearGradient
              colors={[colors.secondary.main, colors.secondary.dark]}
              style={styles.loginIconGradient}
            >
              <Ionicons name="person" size={50} color={colors.neutral.white} />
            </LinearGradient>
          </View>
          <Text style={styles.loginTitle}>Bienvenue !</Text>
          <Text style={styles.loginMessage}>
            Connectez-vous pour accéder à votre profil et suivre vos commandes
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={[colors.secondary.main, colors.secondary.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Ionicons name="log-in-outline" size={22} color={colors.neutral.white} />
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/auth/register');
            }}
          >
            <Text style={styles.registerLinkText}>
              Pas encore de compte ? <Text style={styles.registerLinkBold}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#111111', '#222222']}
      style={styles.container}
    >
      <StatusBar style="light" />
      {renderFloatingEmojis()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec titre */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnimation,
              transform: [
                {
                  translateY: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </Animated.View>

        {/* Carte utilisateur premium */}
        <Animated.View
          style={[
            styles.userCardContainer,
            {
              opacity: cardAnimation,
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
            style={styles.userCard}
          >
            {/* Avatar avec initiales */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[colors.secondary.main, colors.secondary.dark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>

            {/* Infos utilisateur */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile?.name || 'Utilisateur'}
              </Text>
              <View style={styles.userEmailRow}>
                <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
              {userProfile?.phone && (
                <View style={styles.userPhoneRow}>
                  <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.userPhone}>{formatPhoneNumber(userProfile.phone)}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu */}
        <Animated.View
          style={[
            styles.menuSection,
            {
              opacity: menuAnimation,
              transform: [
                {
                  translateX: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Mon Compte</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                item.action();
              }}
            >
              <View style={styles.menuItemLeft}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuItemIcon}
                >
                  <Ionicons name={item.icon} size={20} color={colors.neutral.white} />
                </LinearGradient>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Bouton déconnexion */}
        <Animated.View
          style={[
            styles.logoutSection,
            {
              opacity: menuAnimation,
            },
          ]}
        >
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
  },

  // Carte utilisateur
  userCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  userCard: {
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 26,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary.main,
    borderWidth: 3,
    borderColor: '#111111',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: 6,
  },
  userEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: typography.fontFamily.medium,
  },
  userPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userPhone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: typography.fontFamily.medium,
  },
  // Menu
  menuSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.5)',
  },

  // Déconnexion
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
    color: '#ff6b6b',
  },

  // Login prompt
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginIconContainer: {
    marginBottom: spacing.xl,
  },
  loginIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loginTitle: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  loginMessage: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  loginButtonText: {
    fontSize: 17,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  registerLink: {
    marginTop: spacing.lg,
  },
  registerLinkText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.5)',
  },
  registerLinkBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary.main,
  },

  // Emojis
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 22,
  },

  bottomSpacer: {
    height: 100,
  },
});
