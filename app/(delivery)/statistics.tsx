import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { useDeliveryAuth } from '../../src/context/DeliveryAuthContext';

export default function DeliveryStatistics() {
  const { orders } = useOrders();
  const { currentDeliveryUser, updateCurrentUser } = useDeliveryAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    inProgressDeliveries: 0,
  });

  // États pour la modification du téléphone
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    if (currentDeliveryUser) {
      calculateStats();
    }
  }, [currentDeliveryUser, orders]);

  const calculateStats = () => {
    if (!currentDeliveryUser) return;

    const userDeliveries = orders.filter(order =>
      order.assignedDelivery &&
      order.assignedDelivery.id === currentDeliveryUser.id
    );

    const completedDeliveries = userDeliveries.filter(order =>
      order.status === OrderStatus.DELIVERED
    );

    const inProgressDeliveries = userDeliveries.filter(order =>
      order.status === OrderStatus.IN_DELIVERY
    );

    // Calcul des livraisons du jour
    const today = new Date().toLocaleDateString('fr-FR');
    const todayDeliveries = completedDeliveries.filter(order =>
      order.orderDate === today
    );

    setStats({
      todayDeliveries: todayDeliveries.length,
      inProgressDeliveries: inProgressDeliveries.length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    calculateStats();
    setTimeout(() => setRefreshing(false), 1000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdatePhone = () => {
    setNewPhone(currentDeliveryUser?.phone || '');
    setShowPhoneModal(true);
  };

  const savePhoneNumber = async () => {
    if (!newPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setUpdatingPhone(true);
    try {
      const result = await updateCurrentUser({ phone: newPhone.trim() });
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowPhoneModal(false);
        Alert.alert('✅ Succès', 'Votre numéro de téléphone a été mis à jour');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le numéro');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const StatCard = ({ icon, title, value, color = '#000000', subtitle = null }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (!currentDeliveryUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur d'authentification</Text>
      </View>
    );
  }

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
          <View>
            <Text style={styles.headerTitle}>Statistiques</Text>
            <Text style={styles.headerSubtitle}>Suivez vos livraisons</Text>
          </View>
          <View style={styles.refreshButton}>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>📊 Vos livraisons</Text>

            <View style={styles.statsGrid}>
              <StatCard
                icon="today"
                title="Courses du jour"
                value={stats.todayDeliveries.toString()}
                color="#007bff"
              />

              <StatCard
                icon="time"
                title="En cours"
                value={stats.inProgressDeliveries.toString()}
                color="#ffc107"
              />
            </View>
          </View>



          {/* User Info */}
          <View style={styles.userSection}>
            <Text style={styles.sectionTitle}>👤 Informations livreur</Text>
            
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={32} color={colors.neutral.white} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{currentDeliveryUser.name}</Text>
                  <Text style={styles.userEmail}>{currentDeliveryUser.email}</Text>
                </View>
              </View>
              
              <View style={styles.userContact}>
                <View style={styles.phoneRow}>
                  <Ionicons name="call" size={16} color="#007bff" />
                  <Text style={styles.userPhone}>
                    {currentDeliveryUser.phone || 'Aucun numéro'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editPhoneButton}
                  onPress={handleUpdatePhone}
                >
                  <Ionicons name="pencil" size={14} color="#007bff" />
                  <Text style={styles.editPhoneText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal de modification du téléphone */}
        <Modal
          visible={showPhoneModal}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Modifier le téléphone</Text>
                <TouchableOpacity
                  onPress={() => setShowPhoneModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  placeholder="Ex: 06 12 34 56 78"
                  keyboardType="phone-pad"
                  maxLength={15}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPhoneModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={savePhoneNumber}
                    disabled={updatingPhone}
                  >
                    <LinearGradient
                      colors={['#007bff', '#0056b3']}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>
                        {updatingPhone ? 'Enregistrement...' : 'Enregistrer'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
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
  headerSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  summarySection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  statTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  statSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
  earningsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  earningsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  earningsInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  earningsAmount: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#28a745',
  },
  earningsLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  earningsDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingTop: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  earningsDetailLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  earningsDetailValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  performanceSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  performanceCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceItem: {
    paddingVertical: spacing.sm,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  performanceTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
  },
  performanceValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
    marginVertical: spacing.md,
  },
  userSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  userCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  userContact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  userPhone: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#007bff',
  },
  editPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.gray50,
    gap: spacing.xs,
  },
  editPhoneText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#007bff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.neutral.gray50,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});