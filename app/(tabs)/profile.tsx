import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Animated,
} from 'react-native';
import * as Notifications from 'expo-notifications';
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
    // Supprimer tous les caractères non numériques puis formatter 2 par 2
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
  };
  
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  // Vérifier le statut des notifications au chargement
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPushNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handlePushNotificationToggle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!pushNotificationsEnabled) {
        // Demander la permission
        const { status } = await Notifications.requestPermissionsAsync();

        if (status === 'granted') {
          setPushNotificationsEnabled(true);
          Alert.alert(
            'Notifications activées',
            'Vous recevrez désormais des notifications push.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Permission refusée',
            'Vous pouvez activer les notifications dans les paramètres de votre appareil.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Informer l'utilisateur qu'il doit désactiver dans les paramètres
        Alert.alert(
          'Désactiver les notifications',
          'Pour désactiver les notifications, rendez-vous dans les paramètres de votre appareil.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling push notifications:', error);
      Alert.alert(
        'Erreur',
        'Impossible de modifier les paramètres de notifications.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Animations pour les emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(0))
  ).current;

  // Animation des emojis flottants
  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis?.forEach((animValue, index) => {
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

  const menuItems = [
    {
      id: 'personal-info',
      title: 'Informations personnelles',
      subtitle: 'Gérer vos données',
      icon: 'person-outline',
      color: colors.primary.main,
      action: () => router.push('/profile/edit'),
    },
    {
      id: 'orders',
      title: 'Mes commandes',
      subtitle: 'Historique et suivi',
      icon: 'receipt-outline',
      color: colors.secondary.main,
      action: () => router.push('/profile/orders'),
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

  const renderMenuItem = (item: any, isLast = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.action();
      }}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemText}>{item.title}</Text>
          {item.subtitle && <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray400} />
      </View>
    </TouchableOpacity>
  );

  const renderPushNotificationSetting = () => (
    <TouchableOpacity style={styles.notificationItem} onPress={handlePushNotificationToggle}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>Activer les notifications push</Text>
        <Text style={styles.notificationSubtext}>
          {pushNotificationsEnabled ? 'Notifications activées' : 'Touchez pour activer'}
        </Text>
      </View>
      <View style={styles.notificationRight}>
        <Ionicons
          name={pushNotificationsEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={pushNotificationsEnabled ? colors.primary.main : colors.neutral.gray400}
        />
        <Ionicons name="chevron-forward" size={16} color={colors.neutral.gray400} style={{marginLeft: 8}} />
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </View>

        {/* Login Prompt */}
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={colors.neutral.gray300} />
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginMessage}>
            Connectez-vous pour accéder à votre profil et gérer vos commandes
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={[colors.primary.main, colors.primary.light]}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#000000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      
      {/* Emojis flottants de fast food */}
      {floatingEmojis?.map((animValue, index) => {
        const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖'];
        const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];
        
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
                  outputRange: [0, 0.35, 0.35, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emojiText}>{currentEmoji}</Text>
          </Animated.View>
        );
      })}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userProfile?.name || user?.displayName || 'Utilisateur'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {userProfile?.phone && (
                <Text style={styles.userPhone}>
                  {formatPhoneNumber(userProfile.phone)}
                </Text>
              )}
            </View>
          </View>
        </View>


        {/* Menu Principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Compte</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => 
              renderMenuItem(item, index === menuItems.length - 1)
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.menuCard}>
            {renderPushNotificationSetting()}
          </View>
        </View>


        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl + 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    alignItems: 'center',
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
  },
  menuItemRight: {
    paddingLeft: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  notificationSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  logoutText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.status.error,
    marginLeft: spacing.sm,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  loginMessage: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.base,
    marginBottom: spacing.xl,
  },
  loginButton: {
    borderRadius: borderRadius.lg,
  },
  loginButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  bottomSpacer: {
    height: 100,
  },
  
  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 24,
  },
});