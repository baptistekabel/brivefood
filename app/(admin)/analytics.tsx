import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';

export default function AdminAnalytics() {
  const { orders, refreshOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    try {
      // Vérifier et demander les permissions de notification
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // Demander la permission (modal natif iOS/Android)
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Veuillez autoriser les notifications dans les paramètres pour envoyer des messages aux clients.',
          [
            { text: 'Plus tard', style: 'cancel' },
            { 
              text: 'Paramètres', 
              onPress: () => {
                // Ouvrir les paramètres de l'app
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }
      
      // Si les permissions sont accordées, afficher le modal
      setIsNotificationModalVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
    } catch (error) {
      console.error('Erreur permissions notifications:', error);
      Alert.alert('Erreur', 'Impossible de vérifier les permissions de notification');
    }
  };

  const sendPushNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le message');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Ici on ajouterait la logique d'envoi de notification push
      // Pour le moment, on simule l'envoi
      Alert.alert(
        'Notification envoyée',
        `Notification "${notificationTitle}" envoyée à tous les clients`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsNotificationModalVisible(false);
              setNotificationTitle('');
              setNotificationMessage('');
            }
          }
        ]
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification');
    }
  };

  // Filtrer les commandes d'aujourd'hui uniquement (journée commence à 4h du matin)
  const getTodayOrders = () => {
    const now = new Date();

    // Calculer le début de la journée "commerciale" (4h du matin)
    let businessDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);

    // Si on est avant 4h du matin, on prend le début de la journée d'hier
    if (now.getHours() < 4) {
      businessDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 4, 0, 0, 0);
    }

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= businessDayStart;
    });
  };

  // Calculer les statistiques
  const getStatistics = () => {
    const todayOrders = getTodayOrders();
    
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    const deliveryOrders = todayOrders.filter(order => order.mode === OrderMode.DELIVERY).length;
    const pickupOrders = todayOrders.filter(order => order.mode === OrderMode.PICKUP).length;
    
    const completedOrders = todayOrders.filter(order => order.status === OrderStatus.DELIVERED).length;
    const pendingOrders = todayOrders.filter(order => order.status === OrderStatus.PENDING).length;
    const preparingOrders = todayOrders.filter(order => order.status === OrderStatus.PREPARING).length;
    const readyOrders = todayOrders.filter(order => order.status === OrderStatus.READY).length;
    const inDeliveryOrders = todayOrders.filter(order => order.status === OrderStatus.IN_DELIVERY).length;

    return {
      totalOrders,
      totalRevenue,
      deliveryOrders,
      pickupOrders,
      completedOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      inDeliveryOrders,
    };
  };

  const stats = getStatistics();


  const renderStatCard = (title, value, subtitle, icon, color = '#000000') => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderOrderStatusCard = (status, count, color) => (
    <View style={styles.statusCard}>
      <View style={[styles.statusIndicator, { backgroundColor: color }]} />
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{status}</Text>
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
          <Text style={styles.headerTitle}>Statistiques d'aujourd'hui</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* Revenue Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chiffre d'affaires</Text>
            <View style={styles.singleStatContainer}>
              {renderStatCard(
                'Chiffre total',
                `${stats.totalRevenue.toFixed(2)}€`,
                `${stats.totalOrders} commandes`,
                'cash-outline',
                '#28a745'
              )}
            </View>
          </View>

          {/* Orders Stats - Enhanced */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commandes d'aujourd'hui</Text>
            <View style={styles.ordersContainer}>
              <View style={styles.mainOrderCard}>
                <View style={[styles.orderIcon, { backgroundColor: '#00000015' }]}>
                  <Ionicons name="receipt" size={28} color="#000000" />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderMainValue}>{stats.totalOrders}</Text>
                  <Text style={styles.orderMainLabel}>Total commandes</Text>
                </View>
                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailItem}>
                    <View style={[styles.orderDetailDot, { backgroundColor: '#28a745' }]} />
                    <Text style={styles.orderDetailText}>{stats.completedOrders} terminées</Text>
                  </View>
                  <View style={styles.orderDetailItem}>
                    <View style={[styles.orderDetailDot, { backgroundColor: '#ff6b35' }]} />
                    <Text style={styles.orderDetailText}>{stats.pendingOrders + stats.preparingOrders + stats.readyOrders + stats.inDeliveryOrders} en cours</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.orderModeRow}>
                <View style={styles.orderModeCard}>
                  <Ionicons name="bicycle" size={20} color="#1e90ff" />
                  <Text style={styles.orderModeValue}>{stats.deliveryOrders}</Text>
                  <Text style={styles.orderModeLabel}>Livraisons</Text>
                </View>
                <View style={styles.orderModeCard}>
                  <Ionicons name="bag" size={20} color="#ff6b35" />
                  <Text style={styles.orderModeValue}>{stats.pickupOrders}</Text>
                  <Text style={styles.orderModeLabel}>À emporter</Text>
                </View>
                <View style={styles.orderModeCard}>
                  <Ionicons name="restaurant" size={20} color="#32cd32" />
                  <Text style={styles.orderModeValue}>{stats.totalOrders - stats.deliveryOrders - stats.pickupOrders}</Text>
                  <Text style={styles.orderModeLabel}>Sur place</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications clients</Text>
            <TouchableOpacity 
              style={styles.notificationCard} 
              onPress={handleSendNotification}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name="notifications" size={28} color="#000000" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Envoyer une notification</Text>
                <Text style={styles.notificationSubtitle}>Diffuser un message à tous les clients</Text>
              </View>
              <View style={styles.notificationAction}>
                <Ionicons name="send" size={20} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>


          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Notification Modal */}
        <Modal
          visible={isNotificationModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsNotificationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Envoyer une notification</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsNotificationModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Titre de la notification</Text>
                  <TextInput
                    style={styles.textInput}
                    value={notificationTitle}
                    onChangeText={setNotificationTitle}
                    placeholder="Ex: Nouvelle promotion"
                    placeholderTextColor={colors.neutral.gray400}
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
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsNotificationModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendPushNotification}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000', '#000000']}
                      style={styles.sendButtonGradient}
                    >
                      <Ionicons name="send" size={16} color={colors.neutral.white} />
                      <Text style={styles.sendButtonText}>Envoyer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
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
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  singleStatContainer: {
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
  },
  statSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  ordersContainer: {
    gap: spacing.md,
  },
  mainOrderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  orderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderMainValue: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    lineHeight: typography.lineHeights.tight * typography.fontSizes['3xl'],
  },
  orderMainLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  orderDetails: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderDetailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderDetailText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  orderModeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  orderModeCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  orderModeValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  orderModeLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  notificationSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  notificationAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '90%',
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