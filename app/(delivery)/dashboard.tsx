import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { useDeliveryAuth } from '../../src/context/DeliveryAuthContext';
import { useAuth } from '../../src/context/AuthContext';

export default function DeliveryDashboard() {
  const { getAvailableDeliveryOrders, getActiveDeliveryOrders, assignOrderToDelivery, updateOrderStatus } = useOrders();
  const { currentDeliveryUser, logout } = useDeliveryAuth();
  const { logout: firebaseLogout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    if (currentDeliveryUser) {
      loadOrders();
    }
  }, [currentDeliveryUser]);

  const loadOrders = () => {
    const available = getAvailableDeliveryOrders();
    const active = getActiveDeliveryOrders(currentDeliveryUser?.id);
    setAvailableOrders(available);
    setActiveOrders(active);
  };

  const handleTakeOrder = async (order) => {
    if (!currentDeliveryUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour prendre une commande');
      return;
    }

    Alert.alert(
      'Prendre cette course',
      `Voulez-vous prendre la commande #${order.id} ?\n\nDestination: ${order.address}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Prendre la course',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              const result = await assignOrderToDelivery(order.id, currentDeliveryUser);
              if (result.success) {
                Alert.alert('✅ Course prise!', `Vous avez pris la commande #${order.id}`);
                loadOrders(); // Recharger les listes
              } else {
                Alert.alert('Erreur', 'Impossible de prendre cette commande');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          }
        }
      ]
    );
  };

  const handleCompleteDelivery = async (order) => {
    Alert.alert(
      'Terminer la livraison',
      `Confirmez-vous que la commande #${order.id} a été livrée ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Livraison terminée',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              const result = await updateOrderStatus(order.id, OrderStatus.DELIVERED);
              if (result.success) {
                Alert.alert('✅ Livraison terminée!', `Commande #${order.id} marquée comme livrée`);
                loadOrders();
              } else {
                Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await logout();
            await firebaseLogout();
            router.replace('/auth/delivery-login');
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => setRefreshing(false), 1000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };


  const renderAvailableOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderTime}>{item.orderTime}</Text>
        </View>
        
        <View style={styles.statusBadge}>
          <Ionicons name="bicycle-outline" size={16} color={colors.neutral.white} />
          <Text style={styles.statusText}>Disponible</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person" size={16} color={colors.neutral.gray600} />
        <Text style={styles.customerName}>{item.customerName}</Text>
        {item.phone && (
          <>
            <Ionicons name="call" size={14} color="#2563eb" />
            <Text style={styles.phoneNumber}>{item.phone}</Text>
          </>
        )}
      </View>

      <View style={styles.addressContainer}>
        <Ionicons name="location" size={16} color="#000000" />
        <Text style={styles.address}>{item.address}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalPrice}>Total: {item.total.toFixed(2)} €</Text>
        
        <TouchableOpacity
          style={styles.takeOrderButton}
          onPress={() => handleTakeOrder(item)}
        >
          <LinearGradient
            colors={['#000000', '#000000', '#000000']}
            style={styles.takeOrderButtonGradient}
          >
            <Ionicons name="bicycle" size={16} color={colors.neutral.white} />
            <Text style={styles.takeOrderButtonText}>Prendre la course</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveOrder = ({ item }) => (
    <View style={[styles.orderCard, styles.activeOrderCard]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderTime}>{item.orderTime}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: '#1e90ff' }]}>
          <Ionicons name="bicycle" size={16} color={colors.neutral.white} />
          <Text style={styles.statusText}>En cours</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person" size={16} color={colors.neutral.gray600} />
        <Text style={styles.customerName}>{item.customerName}</Text>
        {item.phone && (
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Ici on pourrait intégrer un appel téléphonique
              Alert.alert('Appel client', `${item.phone}`);
            }}
          >
            <Ionicons name="call" size={14} color={colors.neutral.white} />
            <Text style={styles.callButtonText}>{item.phone}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.addressContainer}>
        <Ionicons name="location" size={16} color="#000000" />
        <Text style={styles.address}>{item.address}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalPrice}>Total: {item.total.toFixed(2)} €</Text>
        
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteDelivery(item)}
        >
          <LinearGradient
            colors={['#28a745', '#34ce57']}
            style={styles.completeButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.neutral.white} />
            <Text style={styles.completeButtonText}>Livraison terminée</Text>
          </LinearGradient>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Courses</Text>
            <Text style={styles.headerSubtitle}>Bonjour {currentDeliveryUser.name}!</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Active Deliveries Section */}
          {activeOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚴 Livraisons en cours ({activeOrders.length})</Text>
              <FlatList
                data={activeOrders}
                renderItem={renderActiveOrder}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={styles.ordersList}
              />
            </View>
          )}

          {/* Available Orders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Courses disponibles ({availableOrders.length})</Text>
            {availableOrders.length === 0 ? (
              <ScrollView
                contentContainerStyle={styles.emptyState}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
              >
                <Ionicons name="bicycle-outline" size={64} color={colors.neutral.gray300} />
                <Text style={styles.emptyStateTitle}>Aucune course disponible</Text>
                <Text style={styles.emptyStateMessage}>
                  Les nouvelles courses apparaîtront ici dès qu'elles seront prêtes
                </Text>
                <Text style={styles.pullToRefreshHint}>
                  👆 Tirez pour actualiser
                </Text>
              </ScrollView>
            ) : (
              <FlatList
                data={availableOrders}
                renderItem={renderAvailableOrder}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={styles.ordersList}
              />
            )}
          </View>
        </View>
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
  logoutButton: {
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
  section: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
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
  activeOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1e90ff',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  orderTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#000000',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  customerName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    flex: 1,
  },
  phoneNumber: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#2563eb',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  callButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  address: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    flex: 1,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingTop: spacing.md,
  },
  totalPrice: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  takeOrderButton: {
    borderRadius: borderRadius.md,
  },
  takeOrderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  takeOrderButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  completeButton: {
    borderRadius: borderRadius.md,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  completeButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
  },
  pullToRefreshHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray400,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});