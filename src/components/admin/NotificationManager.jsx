import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import notificationService, {
  initializeNotifications,
  getPushToken,
  sendTestNotification,
  clearNotifications
} from '../../services/notificationService';

export default function NotificationManager() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('unknown');

  useEffect(() => {
    initializeNotificationService();
    checkNotificationSettings();
  }, []);

  const initializeNotificationService = async () => {
    try {
      await initializeNotifications();
      const token = await getPushToken();
      setPushToken(token);

      if (token) {
        setNotificationStatus('active');
        setIsEnabled(true);
      }
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      setNotificationStatus('error');
    }
  };

  const checkNotificationSettings = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
      setIsEnabled(status === 'granted');

      const savedSetting = await AsyncStorage.getItem('@notifications_enabled');
      if (savedSetting !== null) {
        setIsEnabled(JSON.parse(savedSetting));
      }
    } catch (error) {
      console.error('Erreur vérification paramètres:', error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowCriticalAlerts: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

        if (status === 'granted') {
          setIsEnabled(true);
          setNotificationStatus('granted');
          await AsyncStorage.setItem('@notifications_enabled', 'true');

          // Réinitialiser le service
          await initializeNotifications();
          const token = await getPushToken();
          setPushToken(token);

          Alert.alert(
            'Notifications activées',
            'Vous recevrez maintenant des notifications pour les nouvelles commandes.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Permission refusée',
            'Veuillez autoriser les notifications dans les paramètres de votre appareil.',
            [{ text: 'OK' }]
          );
        }
      } else {
        setIsEnabled(false);
        await AsyncStorage.setItem('@notifications_enabled', 'false');
        await clearNotifications();

        Alert.alert(
          'Notifications désactivées',
          'Vous ne recevrez plus de notifications pour les nouvelles commandes.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erreur toggle notifications:', error);
      Alert.alert('Erreur', 'Impossible de modifier les paramètres de notification.');
    }
  };

  const sendTestNotificationHandler = async () => {
    try {
      const testOrder = {
        id: 'TEST-' + Date.now(),
        total: 25.90,
        customerName: 'Test Client',
        items: ['Pizza Margherita', 'Coca Cola'],
      };

      await sendTestNotification(testOrder);

      Alert.alert(
        'Notification test envoyée',
        'Vérifiez que la notification apparaît sur votre écran.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur test notification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification test.');
    }
  };

  const getStatusIcon = () => {
    switch (notificationStatus) {
      case 'granted':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'denied':
        return { name: 'close-circle', color: '#EF4444' };
      case 'active':
        return { name: 'notifications', color: '#000000' };
      default:
        return { name: 'help-circle', color: '#6B7280' };
    }
  };

  const getStatusText = () => {
    switch (notificationStatus) {
      case 'granted':
        return 'Autorisées';
      case 'denied':
        return 'Refusées';
      case 'active':
        return 'Actives';
      default:
        return 'Inconnues';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={24} color="#000000" />
          <Text style={styles.headerTitle}>Notifications Push</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#E5E7EB', true: '#000000' }}
          thumbColor={isEnabled ? '#FFFFFF' : '#9CA3AF'}
          ios_backgroundColor="#E5E7EB"
        />
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <View style={styles.statusIconContainer}>
            <Ionicons
              name={getStatusIcon().name}
              size={20}
              color={getStatusIcon().color}
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Statut</Text>
            <Text style={styles.statusValue}>{getStatusText()}</Text>
          </View>
        </View>

        {pushToken && (
          <View style={styles.statusItem}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="key" size={20} color="#6B7280" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Token</Text>
              <Text style={styles.statusValue} numberOfLines={1}>
                {pushToken.substring(0, 20)}...
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, !isEnabled && styles.actionButtonDisabled]}
          onPress={sendTestNotificationHandler}
          disabled={!isEnabled}
        >
          <Ionicons
            name="send"
            size={20}
            color={isEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[styles.actionButtonText, !isEnabled && styles.actionButtonTextDisabled]}>
            Test notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={clearNotifications}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={styles.actionButtonSecondaryText}>
            Effacer tout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Comment ça marche</Text>
        <Text style={styles.infoText}>
          • Activez les notifications pour recevoir des alertes instantanées
        </Text>
        <Text style={styles.infoText}>
          • Les notifications arrivent même quand l'app est fermée
        </Text>
        <Text style={styles.infoText}>
          • Tapez sur une notification pour ouvrir directement les commandes
        </Text>
        <Text style={styles.infoText}>
          • Utilisez le test pour vérifier que tout fonctionne
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },

  statusContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
  },

  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  statusInfo: {
    flex: 1,
  },

  statusLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },

  statusValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },

  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#000000',
    borderRadius: borderRadius.md,
  },

  actionButtonDisabled: {
    backgroundColor: colors.neutral.gray200,
  },

  actionButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
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

  infoContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },

  infoTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#1D4ED8',
    marginBottom: spacing.sm,
  },

  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSizes.sm * 1.4,
  },
});