import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useAdminAuth } from '../../src/context/AdminAuthContext';
import broadcastNotificationService from '../../src/services/broadcastNotificationService';
import {
  subscribeToDeliverySettings,
  loadDeliverySettings,
  setDeliveryEnabled,
} from '../../src/utils/deliveryPricing';

export default function AdminSettings() {
  const { userProfile: adminProfile, logout } = useAdminAuth();

  // États pour le modal de notification broadcast
  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Livraison activée ou non : lue en temps réel pour que deux tablettes admin
  // affichent le même état
  const [deliveryEnabled, setDeliveryEnabledState] = useState(true);
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadDeliverySettings().then((settings) => {
      if (mounted) setDeliveryEnabledState(settings.deliveryEnabled !== false);
    });

    const unsubscribe = subscribeToDeliverySettings((settings) => {
      if (mounted) setDeliveryEnabledState(settings.deliveryEnabled !== false);
    });

    return () => {
      mounted = false;
      unsubscribe && unsubscribe();
    };
  }, []);

  const handleToggleDelivery = async (value) => {
    if (isUpdatingDelivery) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUpdatingDelivery(true);
    // Optimiste : l'écoute temps réel remettra la vraie valeur si l'écriture échoue
    setDeliveryEnabledState(value);

    const result = await setDeliveryEnabled(value);
    setIsUpdatingDelivery(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setDeliveryEnabledState(!value);
      Alert.alert('Erreur', 'Impossible de modifier la disponibilité de la livraison');
    }
  };

  const handlePrinterSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(admin)/printer-setup');
  };

  const handleDeliverySettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(admin)/delivery');
  };

  const handleArchives = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(admin)/archives');
  };

  const handleUsers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(admin)/users');
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                router.replace('/auth/admin-login');
              } else {
                Alert.alert('Erreur', 'Impossible de se déconnecter');
              }
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const handleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsBroadcastModalVisible(true);
  };

  // Bascule vers l'interface client sans se déconnecter
  const handleSwitchToClient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)');
  };

  const closeBroadcastModal = () => {
    setIsBroadcastModalVisible(false);
    setNotificationTitle('');
    setNotificationMessage('');
    setIsSending(false);
  };

  const sendBroadcastNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le message');
      return;
    }

    if (isSending) return;

    try {
      setIsSending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📱 Envoi de notification broadcast...');
      const result = await broadcastNotificationService.sendBroadcastNotification(
        notificationTitle,
        notificationMessage,
        { sendFromAdmin: true }
      );

      if (result.success) {
        const summary = result.summary;
        const successRate = summary.successRate;

        Alert.alert(
          'Notification envoyée !',
          `📊 Résultats :\n\n✅ Envoyées : ${summary.successCount}/${summary.totalClients}\n❌ Échecs : ${summary.failureCount}\n📈 Taux de réussite : ${successRate}%\n\n${summary.clients.slice(0, 3).map(client =>
            `${client.success ? '✅' : '❌'} ${client.name}`
          ).join('\n')}${summary.clients.length > 3 ? `\n... et ${summary.clients.length - 3} autres` : ''}`,
          [
            {
              text: 'Voir détails',
              onPress: () => {
                console.log('📋 Rapport détaillé:', summary);
                const detailedReport = summary.clients.map(client =>
                  `${client.success ? '✅' : '❌'} ${client.name} (${client.email || client.phone || client.userId})`
                ).join('\n');

                Alert.alert(
                  'Rapport détaillé',
                  detailedReport || 'Aucun client enregistré',
                  [{ text: 'OK' }]
                );
              }
            },
            {
              text: 'OK',
              onPress: () => {
                closeBroadcastModal();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Erreur d\'envoi',
          result.error || 'Impossible d\'envoyer la notification',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Erreur envoi notification broadcast:', error);
      Alert.alert(
        'Erreur technique',
        'Une erreur est survenue lors de l\'envoi de la notification',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSending(false);
    }
  };

  const settingsSections = [
    {
      title: 'Configuration Restaurant',
      items: [
        {
          icon: 'wifi-outline',
          title: 'Imprimante WiFi',
          subtitle: 'Configurer l\'imprimante TM-M30II pour tickets automatiques',
          color: '#2196F3',
          onPress: handlePrinterSettings,
        },
        {
          icon: deliveryEnabled ? 'bicycle' : 'bicycle-outline',
          title: 'Livraison',
          subtitle: deliveryEnabled
            ? 'Les clients peuvent commander en livraison'
            : 'Livraison désactivée : seuls sur place et à emporter sont proposés',
          color: deliveryEnabled ? '#22C55E' : '#F44336',
          toggle: true,
          value: deliveryEnabled,
          onToggle: handleToggleDelivery,
        },
        {
          icon: 'bicycle-outline',
          title: 'Paramètres Livraisons',
          subtitle: 'Configuration des zones et tarifs de livraison',
          color: '#FF9800',
          onPress: handleDeliverySettings,
        },
      ],
    },
    {
      title: 'Système',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Envoyer des notifications à tous les clients',
          color: '#FF9800',
          onPress: handleNotifications,
        },
        {
          icon: 'archive-outline',
          title: 'Archives',
          subtitle: 'Historique des commandes terminées et annulées',
          color: '#607D8B',
          onPress: handleArchives,
        },
        {
          icon: 'people-outline',
          title: 'Utilisateurs',
          subtitle: 'Voir les comptes clients et bloquer leur accès',
          color: '#673AB7',
          onPress: handleUsers,
        },
      ],
    },
    {
      title: 'Interface',
      items: [
        {
          icon: 'swap-horizontal-outline',
          title: 'Passer en mode client',
          subtitle: 'Voir l\'application comme vos clients, sans vous déconnecter',
          color: '#22C55E',
          onPress: handleSwitchToClient,
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        {
          icon: 'log-out-outline',
          title: 'Déconnexion',
          subtitle: 'Se déconnecter de l\'interface admin',
          color: '#F44336',
          onPress: handleSignOut,
        },
      ],
    },
  ];

  const renderSettingItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, item.disabled && styles.settingItemDisabled]}
      // Une ligne à interrupteur ne navigue pas : tout passe par le Switch
      onPress={item.disabled || item.toggle ? null : item.onPress}
      disabled={item.disabled || item.toggle}
      activeOpacity={item.toggle ? 1 : 0.2}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        {item.disabled ? (
          <ActivityIndicator size="small" color={item.color} />
        ) : (
          <Ionicons name={item.icon} size={24} color={item.color} />
        )}
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>

      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          disabled={isUpdatingDelivery}
          trackColor={{ false: colors.neutral.gray400, true: '#22C55E' }}
          thumbColor={colors.neutral.white}
        />
      ) : (
        !item.disabled && (
          <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray400} />
        )
      )}
    </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionCard}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex}>
                    {renderSettingItem(item, itemIndex)}
                    {itemIndex < section.items.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal de notification broadcast */}
        <Modal
          visible={isBroadcastModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeBroadcastModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Envoyer une notification</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeBroadcastModal}
                  >
                    <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Titre de la notification</Text>
                    <TextInput
                      style={styles.textInput}
                      value={notificationTitle}
                      onChangeText={setNotificationTitle}
                      placeholder="Ex: Nouvelle promotion"
                      placeholderTextColor={colors.neutral.gray400}
                      editable={!isSending}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Message</Text>
                    <TextInput
                      style={[styles.textInput, styles.messageInput]}
                      value={notificationMessage}
                      onChangeText={setNotificationMessage}
                      placeholder="Ex: 20% de réduction sur toutes les pizzas ce week-end !"
                      placeholderTextColor={colors.neutral.gray400}
                      multiline
                      numberOfLines={3}
                      editable={!isSending}
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeBroadcastModal}
                      disabled={isSending}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                      onPress={sendBroadcastNotification}
                      disabled={isSending}
                    >
                      <LinearGradient
                        colors={isSending ? ['#cccccc', '#cccccc'] : ['#000000', '#000000']}
                        style={styles.sendButtonGradient}
                      >
                        {isSending ? (
                          <Text style={styles.sendButtonText}>Envoi...</Text>
                        ) : (
                          <>
                            <Ionicons name="send" size={16} color={colors.neutral.white} />
                            <Text style={styles.sendButtonText}>Envoyer</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingItemDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: spacing.xs / 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
    marginLeft: spacing.lg + 48 + spacing.md, // Align with text
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: spacing.lg,
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
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.neutral.gray50,
    color: colors.neutral.gray800,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  sendButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  sendButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
});