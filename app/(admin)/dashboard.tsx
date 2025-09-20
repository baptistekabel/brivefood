import React, { useState } from 'react';
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
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { useAdminAuth } from '../../src/context/AdminAuthContext';
import printerService from '../../src/services/PrinterService';
import remotePrinterService from '../../src/services/RemotePrinterService';

export default function AdminDashboard() {
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const { logout } = useAdminAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#ff6b35';
      case OrderStatus.PREPARING:
        return '#ffa500';
      case OrderStatus.READY:
        return '#32cd32';
      case OrderStatus.IN_DELIVERY:
        return '#1e90ff';
      case OrderStatus.DELIVERED:
        return '#28a745';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.READY:
        return 'Prête';
      case OrderStatus.IN_DELIVERY:
        return 'En livraison';
      case OrderStatus.DELIVERED:
        return 'Livrée';
      default:
        return status;
    }
  };

  const getModeText = (mode) => {
    switch (mode) {
      case OrderMode.DINE_IN:
        return 'Sur place';
      case OrderMode.TAKEOUT:
        return 'À emporter';
      case OrderMode.DELIVERY:
        return 'Livraison';
      default:
        return mode;
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case OrderMode.DINE_IN:
        return 'restaurant-outline';
      case OrderMode.TAKEOUT:
        return 'bag-outline';
      case OrderMode.DELIVERY:
        return 'bicycle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateOrderStatus(orderId, newStatus);
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderMode.DELIVERY ? OrderStatus.IN_DELIVERY : OrderStatus.DELIVERED;
      case OrderStatus.IN_DELIVERY:
        return OrderStatus.DELIVERED;
      default:
        return currentStatus;
    }
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
            router.replace('/auth/admin-login');
          }
        }
      ]
    );
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(admin)/settings');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderTime}>{item.orderTime}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person" size={16} color={colors.neutral.gray600} />
        <Text style={styles.customerName}>{item.customerName}</Text>
        {item.mode === OrderMode.DELIVERY && item.phone && (
          <>
            <Ionicons name="call" size={14} color="#2563eb" />
            <Text style={styles.phoneNumber}>{item.phone}</Text>
          </>
        )}
      </View>

      <View style={styles.modeContainer}>
        <Ionicons name={getModeIcon(item.mode)} size={16} color="#000000" />
        <Text style={styles.modeText}>{getModeText(item.mode)}</Text>
        {item.address && (
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        )}
        {item.paymentMethod && (
          <View style={styles.paymentInfo}>
            <Ionicons 
              name={item.paymentMethod === 'cash' ? 'cash' : 'card'} 
              size={14} 
              color="#2563eb" 
            />
            <Text style={styles.paymentMethod}>
              {item.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.itemsList}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {orderItem.quantity}x {orderItem.name} ({orderItem.size})
            </Text>
            <Text style={styles.itemPrice}>{orderItem.price.toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalPrice}>Total: {item.total.toFixed(2)} €</Text>
        
        {item.status !== OrderStatus.DELIVERED && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleUpdateOrderStatus(item.id, getNextStatus(item.status))}
          >
            <LinearGradient
              colors={['#000000', '#000000', '#000000']}
              style={styles.updateButtonGradient}
            >
              <Text style={styles.updateButtonText}>
                {item.status === OrderStatus.PENDING && 'Commencer'}
                {item.status === OrderStatus.PREPARING && 'Terminer'}
                {item.status === OrderStatus.READY && (item.mode === OrderMode.DELIVERY ? 'En livraison' : 'Livrée')}
                {item.status === OrderStatus.IN_DELIVERY && 'Livrée'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'Toutes', icon: 'list' },
    { key: OrderStatus.PENDING, label: 'En attente', icon: 'time' },
    { key: OrderStatus.PREPARING, label: 'En cours', icon: 'restaurant' },
    { key: OrderStatus.READY, label: 'Prêtes', icon: 'checkmark-circle' }
  ];

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
          <Text style={styles.headerTitle}>Dashboard Admin</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={20} color={colors.neutral.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {filterButtons.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.activeFilterButton
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFilter(filter.key);
                }}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.key ? colors.neutral.white : '#000000'}
                />
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.activeFilterButtonText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={colors.neutral.gray300} />
              <Text style={styles.emptyStateTitle}>Aucune commande</Text>
              <Text style={styles.emptyStateMessage}>
                Les commandes apparaîtront ici une fois créées
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.ordersList}
            />
          )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterScrollContainer: {
    paddingRight: spacing.lg, // Extra padding pour le scroll
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    marginRight: spacing.sm, // Espacement entre les boutons
    minWidth: 80, // Largeur minimale pour éviter que les boutons soient trop petits
  },
  activeFilterButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
    marginLeft: spacing.xs,
  },
  activeFilterButtonText: {
    color: colors.neutral.white,
  },
  ordersContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  ordersList: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for tab bar
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
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
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  modeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  address: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemsList: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    flex: 1,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
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
  updateButton: {
    borderRadius: borderRadius.md,
  },
  updateButtonGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  updateButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  paymentMethod: {
    fontSize: typography.fontSizes.sm,
    color: '#2563eb',
    fontFamily: typography.fontFamily.medium,
  },
});