import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { isTablet, isLandscape, getResponsiveStyles } from '../../src/utils/deviceUtils';

export default function AdminAnalytics() {
  const { orders, refreshOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(false);
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

  // Obtenir les livraisons terminées d'aujourd'hui
  const getCompletedDeliveries = () => {
    const todayOrders = getTodayOrders();
    return todayOrders.filter(order =>
      order.mode === OrderMode.DELIVERY &&
      order.status === OrderStatus.DELIVERED &&
      order.assignedDelivery
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const stats = getStatistics();
  const completedDeliveries = getCompletedDeliveries();


  const renderStatCard = (title, value, subtitle, icon, color = '#000000', isTabletMode = false) => (
    <View style={[
      styles.statCard,
      isTabletMode && styles.statCardTablet
    ]}>
      <View style={[
        styles.statIcon,
        isTabletMode && styles.statIconTablet,
        { backgroundColor: `${color}15` }
      ]}>
        <Ionicons name={icon} size={isTabletMode ? 32 : 24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[
          styles.statValue,
          isTabletMode && styles.statValueTablet
        ]}>{value}</Text>
        <Text style={[
          styles.statTitle,
          isTabletMode && styles.statTitleTablet
        ]}>{title}</Text>
        {subtitle && <Text style={[
          styles.statSubtitle,
          isTabletMode && styles.statSubtitleTablet
        ]}>{subtitle}</Text>}
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

  const renderCompletedDeliveryCard = (order, index) => (
    <View key={order.id} style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryOrderNumber}>Commande #{order.id}</Text>
          <Text style={styles.deliveryTime}>
            {order.orderTime} • {order.orderDate}
          </Text>
        </View>
        <View style={styles.deliveryStatus}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.deliveryStatusText}>Livrée</Text>
        </View>
      </View>

      <View style={styles.deliveryDetails}>
        <View style={styles.deliveryCustomer}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.deliveryCustomerName}>{order.customerName}</Text>
        </View>

        {order.assignedDelivery && (
          <View style={styles.deliveryDriver}>
            <Ionicons name="bicycle" size={16} color="#2196F3" />
            <Text style={styles.deliveryDriverName}>
              Livré par {order.assignedDelivery.name}
            </Text>
          </View>
        )}

        <View style={styles.deliveryAmount}>
          <Ionicons name="cash" size={16} color="#4CAF50" />
          <Text style={styles.deliveryAmountText}>{order.total.toFixed(2)}€</Text>
        </View>
      </View>

      {order.address && (
        <View style={styles.deliveryAddress}>
          <Ionicons name="location" size={14} color="#999" />
          <Text style={styles.deliveryAddressText}>{order.address}</Text>
        </View>
      )}
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
          style={[
            styles.content,
            isTabletDevice && isLandscapeMode && styles.contentTablet
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            isTabletDevice && isLandscapeMode && styles.contentContainerTablet
          ]}
        >

          {isTabletDevice && isLandscapeMode ? (
            // Layout tablette - Organisation en grille optimisée
            <>
              {/* Première rangée - Statistiques principales */}
              <View style={styles.tabletStatsRow}>
                {/* Revenue Stats */}
                <View style={[styles.section, styles.tabletStatSection]}>
                  <Text style={[styles.sectionTitle, styles.sectionTitleTablet]}>Chiffre d'affaires</Text>
                  <View style={styles.tabletRevenueCard}>
                    {renderStatCard(
                      'Chiffre total',
                      `${stats.totalRevenue.toFixed(2)}€`,
                      `${stats.totalOrders} commandes`,
                      'cash-outline',
                      '#28a745',
                      true // isTablet
                    )}
                  </View>
                </View>

                {/* Orders Summary */}
                <View style={[styles.section, styles.tabletStatSection]}>
                  <Text style={[styles.sectionTitle, styles.sectionTitleTablet]}>Commandes d'aujourd'hui</Text>
                  <View style={styles.tabletOrderSummary}>
                    <View style={[styles.mainOrderCard, styles.mainOrderCardTablet]}>
                      <View style={[styles.orderIcon, styles.orderIconTablet, { backgroundColor: '#00000015' }]}>
                        <Ionicons name="receipt" size={36} color="#000000" />
                      </View>
                      <View style={styles.orderInfo}>
                        <Text style={[styles.orderMainValue, styles.orderMainValueTablet]}>{stats.totalOrders}</Text>
                        <Text style={[styles.orderMainLabel, styles.orderMainLabelTablet]}>Total commandes</Text>
                      </View>
                      <View style={styles.orderDetails}>
                        <View style={styles.orderDetailItem}>
                          <View style={[styles.orderDetailDot, { backgroundColor: '#28a745' }]} />
                          <Text style={[styles.orderDetailText, styles.orderDetailTextTablet]}>{stats.completedOrders} terminées</Text>
                        </View>
                        <View style={styles.orderDetailItem}>
                          <View style={[styles.orderDetailDot, { backgroundColor: '#ff6b35' }]} />
                          <Text style={[styles.orderDetailText, styles.orderDetailTextTablet]}>{stats.pendingOrders + stats.preparingOrders + stats.readyOrders + stats.inDeliveryOrders} en cours</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Deuxième rangée - Détails des commandes */}
              <View style={styles.tabletDetailsRow}>
                <View style={[styles.section, styles.tabletFullWidth]}>
                  <Text style={[styles.sectionTitle, styles.sectionTitleTablet]}>Répartition par mode</Text>
                  <View style={[styles.orderModeRow, styles.orderModeRowTablet]}>
                    <View style={[styles.orderModeCard, styles.orderModeCardTablet]}>
                      <Ionicons name="bicycle" size={28} color="#1e90ff" />
                      <Text style={[styles.orderModeValue, styles.orderModeValueTablet]}>{stats.deliveryOrders}</Text>
                      <Text style={[styles.orderModeLabel, styles.orderModeLabelTablet]}>Livraisons</Text>
                    </View>
                    <View style={[styles.orderModeCard, styles.orderModeCardTablet]}>
                      <Ionicons name="bag" size={28} color="#ff6b35" />
                      <Text style={[styles.orderModeValue, styles.orderModeValueTablet]}>{stats.pickupOrders}</Text>
                      <Text style={[styles.orderModeLabel, styles.orderModeLabelTablet]}>À emporter</Text>
                    </View>
                    <View style={[styles.orderModeCard, styles.orderModeCardTablet]}>
                      <Ionicons name="restaurant" size={28} color="#32cd32" />
                      <Text style={[styles.orderModeValue, styles.orderModeValueTablet]}>{stats.totalOrders - stats.deliveryOrders - stats.pickupOrders}</Text>
                      <Text style={[styles.orderModeLabel, styles.orderModeLabelTablet]}>Sur place</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Troisième rangée - Livraisons terminées */}
              <View style={styles.tabletDeliveriesRow}>
                <View style={[styles.section, styles.tabletFullWidth]}>
                  <Text style={[styles.sectionTitle, styles.sectionTitleTablet]}>
                    Livraisons terminées aujourd'hui ({completedDeliveries.length})
                  </Text>

                  {completedDeliveries.length === 0 ? (
                    <View style={[styles.emptyDeliveriesCard, styles.emptyDeliveriesCardTablet]}>
                      <Ionicons name="checkmark-circle-outline" size={64} color={colors.neutral.gray300} />
                      <Text style={[styles.emptyDeliveriesTitle, styles.emptyDeliveriesTitleTablet]}>
                        Aucune livraison terminée
                      </Text>
                      <Text style={[styles.emptyDeliveriesSubtitle, styles.emptyDeliveriesSubtitleTablet]}>
                        Les livraisons terminées aujourd'hui apparaîtront ici
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.deliveriesContainer, styles.deliveriesContainerTablet]}>
                      {completedDeliveries.map((order, index) => (
                        <View key={order.id} style={styles.deliveryCardTablet}>
                          {renderCompletedDeliveryCard(order, index)}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

            </>
          ) : (
            // Layout mobile standard
            <>
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

              {/* Livraisons terminées Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Livraisons terminées aujourd'hui ({completedDeliveries.length})
                </Text>

                {completedDeliveries.length === 0 ? (
                  <View style={styles.emptyDeliveriesCard}>
                    <Ionicons name="checkmark-circle-outline" size={48} color={colors.neutral.gray300} />
                    <Text style={styles.emptyDeliveriesTitle}>Aucune livraison terminée</Text>
                    <Text style={styles.emptyDeliveriesSubtitle}>
                      Les livraisons terminées aujourd'hui apparaîtront ici
                    </Text>
                  </View>
                ) : (
                  <View style={styles.deliveriesContainer}>
                    {completedDeliveries.map((order, index) => renderCompletedDeliveryCard(order, index))}
                  </View>
                )}
              </View>

            </>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
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

  // ========== STYLES TABLETTE PAYSAGE ==========

  // Container principal tablette
  contentTablet: {
    paddingHorizontal: spacing.xl,
  },
  contentContainerTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  // Layout en rangées pour tablette
  tabletStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  tabletDetailsRow: {
    marginBottom: spacing.xl,
  },

  // Sections tablette
  tabletStatSection: {
    flex: 1,
    marginBottom: 0,
  },
  tabletFullWidth: {
    width: '100%',
    marginBottom: 0,
  },

  sectionTitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.lg,
  },

  // Cards statistiques tablette
  tabletRevenueCard: {
    alignItems: 'stretch',
  },
  tabletOrderSummary: {
    alignItems: 'stretch',
  },

  statCardTablet: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 160,
  },

  statIconTablet: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.lg,
  },

  statValueTablet: {
    fontSize: typography.fontSizes['4xl'],
    lineHeight: typography.fontSizes['4xl'] * 1.2,
  },

  statTitleTablet: {
    fontSize: typography.fontSizes.lg,
    marginTop: spacing.sm,
  },

  statSubtitleTablet: {
    fontSize: typography.fontSizes.base,
    marginTop: spacing.xs,
  },

  // Card commandes principale tablette
  mainOrderCardTablet: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 160,
  },

  orderIconTablet: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: spacing.lg,
  },

  orderMainValueTablet: {
    fontSize: typography.fontSizes['5xl'],
    lineHeight: typography.fontSizes['5xl'] * 1.1,
  },

  orderMainLabelTablet: {
    fontSize: typography.fontSizes.lg,
    marginTop: spacing.sm,
  },

  orderDetailTextTablet: {
    fontSize: typography.fontSizes.base,
  },

  // Rangée de modes tablette
  orderModeRowTablet: {
    gap: spacing.xl,
    paddingHorizontal: 0,
  },

  orderModeCardTablet: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 140,
  },

  orderModeValueTablet: {
    fontSize: typography.fontSizes['3xl'],
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  orderModeLabelTablet: {
    fontSize: typography.fontSizes.base,
  },

  // Livraisons terminées styles
  deliveriesContainer: {
    gap: spacing.md,
  },
  deliveryCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryOrderNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  deliveryTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deliveryStatusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#4CAF50',
  },
  deliveryDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  deliveryCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deliveryCustomerName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  deliveryDriver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deliveryDriverName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#2196F3',
  },
  deliveryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deliveryAmountText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#4CAF50',
  },
  deliveryAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.neutral.gray50,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  deliveryAddressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    flex: 1,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  emptyDeliveriesCard: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderStyle: 'dashed',
  },
  emptyDeliveriesTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDeliveriesSubtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },

  // Styles tablette pour livraisons
  tabletDeliveriesRow: {
    marginBottom: spacing.xl,
  },
  deliveriesContainerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  deliveryCardTablet: {
    flex: 1,
    minWidth: 300,
    maxWidth: '48%',
  },
  emptyDeliveriesCardTablet: {
    padding: spacing['2xl'],
  },
  emptyDeliveriesTitleTablet: {
    fontSize: typography.fontSizes.xl,
  },
  emptyDeliveriesSubtitleTablet: {
    fontSize: typography.fontSizes.lg,
  },

});