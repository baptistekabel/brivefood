import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useNotifications } from '../../src/hooks/useNotifications';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';

export default function NotificationsSettings() {
  const {
    notificationPermission,
    pushToken,
    isPermissionGranted,
    canSendNotifications,
    requestPermission,
    simulateNewOrder,
    clearAllNotifications,
    updateBadgeCount,
  } = useNotifications();

  const [settings, setSettings] = useState({
    newOrders: true,
    orderUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
    badgeEnabled: true,
  });

  // Détection tablette
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  useEffect(() => {
    if (isPermissionGranted) {
      loadNotificationSettings();
    }
  }, [isPermissionGranted]);

  const loadNotificationSettings = async () => {
    // Charger les paramètres sauvegardés si nécessaire
    console.log('Chargement des paramètres de notification');
  };

  const handleToggleNotifications = async (enabled) => {
    if (enabled && !isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser les notifications dans les paramètres de votre appareil pour recevoir les alertes de nouvelles commandes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setSettings(prev => ({ ...prev, newOrders: enabled }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (enabled) {
      Alert.alert(
        '✅ Notifications activées',
        'Vous recevrez maintenant des notifications pour les nouvelles commandes, même quand l\'application est fermée.',
        [{ text: 'Parfait!' }]
      );
    }
  };

  const handleTestNotification = async () => {
    if (!canSendNotifications) {
      Alert.alert(
        'Notifications désactivées',
        'Veuillez d\'abord activer les notifications pour tester.',
        [{ text: 'OK' }]
      );
      return;
    }

    const testOrder = {
      id: 'TEST-' + Date.now(),
      total: 28.50,
      customerName: 'Client Test',
      items: ['Pizza Margherita M', 'Coca Cola', 'Tiramisu'],
      address: '123 Rue de la Test, Brive',
    };

    const success = await simulateNewOrder(testOrder);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '🚀 Notification test envoyée',
        'Si la notification n\'apparaît pas, vérifiez les paramètres de votre appareil.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification test.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearNotifications = async () => {
    Alert.alert(
      'Effacer les notifications',
      'Êtes-vous sûr de vouloir effacer toutes les notifications et remettre le badge à zéro ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
            await updateBadgeCount(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('✅', 'Notifications effacées');
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (isPermissionGranted && settings.newOrders) return '#10B981';
    if (notificationPermission === 'denied') return '#EF4444';
    return '#F59E0B';
  };

  const getStatusText = () => {
    if (isPermissionGranted && settings.newOrders) return 'Actives';
    if (notificationPermission === 'denied') return 'Refusées';
    if (!settings.newOrders) return 'Désactivées';
    return 'Configuration requise';
  };

  const renderSettingCard = (title, subtitle, value, onValueChange, icon, disabled = false) => (
    <View style={[
      styles.settingCard,
      isTabletDevice && isLandscapeMode && styles.settingCardTablet,
      disabled && styles.settingCardDisabled
    ]}>
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon}
          size={isTabletDevice && isLandscapeMode ? 28 : 24}
          color={disabled ? colors.neutral.gray400 : '#000000'}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          isTabletDevice && isLandscapeMode && styles.settingTitleTablet,
          disabled && styles.settingTitleDisabled
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.settingSubtitle,
          isTabletDevice && isLandscapeMode && styles.settingSubtitleTablet,
          disabled && styles.settingSubtitleDisabled
        ]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E5E7EB', true: '#000000' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications Push</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Content Container */}
        <ScrollView
          style={[
            styles.contentContainer,
            isTabletDevice && isLandscapeMode && styles.contentContainerTablet
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Overview */}
          <View style={[
            styles.overviewCard,
            isTabletDevice && isLandscapeMode && styles.overviewCardTablet
          ]}>
            <View style={styles.overviewHeader}>
              <Ionicons
                name="notifications"
                size={isTabletDevice && isLandscapeMode ? 32 : 28}
                color="#000000"
              />
              <Text style={[
                styles.overviewTitle,
                isTabletDevice && isLandscapeMode && styles.overviewTitleTablet
              ]}>
                Statut des notifications
              </Text>
            </View>

            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={[
                  styles.statLabel,
                  isTabletDevice && isLandscapeMode && styles.statLabelTablet
                ]}>
                  Permission
                </Text>
                <Text style={[
                  styles.statValue,
                  isTabletDevice && isLandscapeMode && styles.statValueTablet,
                  { color: getStatusColor() }
                ]}>
                  {notificationPermission === 'granted' ? 'Accordée' : 'Refusée'}
                </Text>
              </View>

              {pushToken && (
                <View style={styles.statItem}>
                  <Text style={[
                    styles.statLabel,
                    isTabletDevice && isLandscapeMode && styles.statLabelTablet
                  ]}>
                    Token Device
                  </Text>
                  <Text style={[
                    styles.statValue,
                    isTabletDevice && isLandscapeMode && styles.statValueTablet
                  ]} numberOfLines={1}>
                    {pushToken.substring(0, 12)}...
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={[
              styles.sectionTitle,
              isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
            ]}>
              Paramètres des notifications
            </Text>

            {renderSettingCard(
              'Nouvelles commandes',
              'Recevoir une notification pour chaque nouvelle commande',
              settings.newOrders,
              handleToggleNotifications,
              'bag-add'
            )}

            {renderSettingCard(
              'Mises à jour commandes',
              'Notifications pour les changements de statut',
              settings.orderUpdates,
              (value) => setSettings(prev => ({ ...prev, orderUpdates: value })),
              'refresh',
              !settings.newOrders
            )}

            {renderSettingCard(
              'Son des notifications',
              'Jouer un son lors de la réception',
              settings.soundEnabled,
              (value) => setSettings(prev => ({ ...prev, soundEnabled: value })),
              'volume-high',
              !settings.newOrders
            )}

            {renderSettingCard(
              'Vibration',
              'Faire vibrer l\'appareil',
              settings.vibrationEnabled,
              (value) => setSettings(prev => ({ ...prev, vibrationEnabled: value })),
              'phone-portrait',
              !settings.newOrders
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isTabletDevice && isLandscapeMode && styles.actionButtonTablet,
                !canSendNotifications && styles.actionButtonDisabled
              ]}
              onPress={handleTestNotification}
              disabled={!canSendNotifications}
            >
              <LinearGradient
                colors={canSendNotifications ? ['#000000', '#000000'] : ['#E5E7EB', '#E5E7EB']}
                style={[
                  styles.actionButtonGradient,
                  isTabletDevice && isLandscapeMode && styles.actionButtonGradientTablet
                ]}
              >
                <Ionicons
                  name="send"
                  size={isTabletDevice && isLandscapeMode ? 24 : 20}
                  color={canSendNotifications ? colors.neutral.white : colors.neutral.gray500}
                />
                <Text style={[
                  styles.actionButtonText,
                  isTabletDevice && isLandscapeMode && styles.actionButtonTextTablet,
                  !canSendNotifications && styles.actionButtonTextDisabled
                ]}>
                  Tester les notifications
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSecondary,
                isTabletDevice && isLandscapeMode && styles.actionButtonTablet
              ]}
              onPress={handleClearNotifications}
            >
              <View style={[
                styles.actionButtonGradient,
                isTabletDevice && isLandscapeMode && styles.actionButtonGradientTablet
              ]}>
                <Ionicons
                  name="trash"
                  size={isTabletDevice && isLandscapeMode ? 24 : 20}
                  color="#EF4444"
                />
                <Text style={[
                  styles.actionButtonSecondaryText,
                  isTabletDevice && isLandscapeMode && styles.actionButtonTextTablet
                ]}>
                  Effacer notifications
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={[
            styles.infoCard,
            isTabletDevice && isLandscapeMode && styles.infoCardTablet
          ]}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="information-circle"
                size={isTabletDevice && isLandscapeMode ? 28 : 24}
                color="#3B82F6"
              />
              <Text style={[
                styles.infoTitle,
                isTabletDevice && isLandscapeMode && styles.infoTitleTablet
              ]}>
                Comment ça marche
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={[
                styles.infoText,
                isTabletDevice && isLandscapeMode && styles.infoTextTablet
              ]}>
                🔔 Les notifications arrivent même quand l'app est fermée
              </Text>
              <Text style={[
                styles.infoText,
                isTabletDevice && isLandscapeMode && styles.infoTextTablet
              ]}>
                📱 Tapez sur une notification pour ouvrir directement l'app
              </Text>
              <Text style={[
                styles.infoText,
                isTabletDevice && isLandscapeMode && styles.infoTextTablet
              ]}>
                🔧 Utilisez le test pour vérifier que tout fonctionne
              </Text>
              <Text style={[
                styles.infoText,
                isTabletDevice && isLandscapeMode && styles.infoTextTablet
              ]}>
                ⚙️ Configurez les paramètres selon vos préférences
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },

  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },

  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },

  contentContainerTablet: {
    paddingHorizontal: spacing.xl * 1.5,
    paddingTop: spacing.xl,
  },

  overviewCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  overviewCardTablet: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  overviewTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
  },

  overviewTitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginLeft: spacing.md,
  },

  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },

  statLabelTablet: {
    fontSize: typography.fontSizes.base,
  },

  statValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },

  statValueTablet: {
    fontSize: typography.fontSizes.lg,
  },

  settingsSection: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },

  sectionTitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.lg,
  },

  settingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  settingCardTablet: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  settingCardDisabled: {
    opacity: 0.6,
  },

  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },

  settingTitleTablet: {
    fontSize: typography.fontSizes.lg,
  },

  settingTitleDisabled: {
    color: colors.neutral.gray500,
  },

  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },

  settingSubtitleTablet: {
    fontSize: typography.fontSizes.base,
  },

  settingSubtitleDisabled: {
    color: colors.neutral.gray400,
  },

  actionsSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  actionButton: {
    borderRadius: borderRadius.md,
  },

  actionButtonTablet: {
    borderRadius: borderRadius.lg,
  },

  actionButtonDisabled: {
    opacity: 0.6,
  },

  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },

  actionButtonGradientTablet: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },

  actionButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },

  actionButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },

  actionButtonTextDisabled: {
    color: colors.neutral.gray500,
  },

  actionButtonSecondary: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: '#EF4444',
  },

  actionButtonSecondaryText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#EF4444',
  },

  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },

  infoCardTablet: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  infoTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#1D4ED8',
    marginLeft: spacing.sm,
  },

  infoTitleTablet: {
    fontSize: typography.fontSizes.lg,
    marginLeft: spacing.md,
  },

  infoContent: {
    gap: spacing.sm,
  },

  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    lineHeight: typography.fontSizes.sm * 1.4,
  },

  infoTextTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.5,
  },
});