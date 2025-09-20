import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'completed' | 'cancelled' | 'in_progress';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryMode: 'delivery' | 'takeaway' | 'dine-in';
}

export default function OrdersHistoryScreen() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '#BR2024001',
      date: '2024-01-15 19:30',
      status: 'completed',
      items: [
        { name: 'Burger Classic', quantity: 2, price: 12.90 },
        { name: 'Frites Cheddar', quantity: 1, price: 5.50 },
        { name: 'Coca-Cola', quantity: 2, price: 2.90 },
      ],
      total: 34.20,
      deliveryMode: 'delivery',
    },
    {
      id: '2',
      orderNumber: '#BR2024002',
      date: '2024-01-10 20:15',
      status: 'completed',
      items: [
        { name: 'Pizza 4 Fromages', quantity: 1, price: 15.90 },
        { name: 'Salade César', quantity: 1, price: 8.50 },
      ],
      total: 24.40,
      deliveryMode: 'takeaway',
    },
    {
      id: '3',
      orderNumber: '#BR2024003',
      date: '2024-01-05 18:45',
      status: 'cancelled',
      items: [
        { name: 'Tacos 3 Viandes', quantity: 1, price: 9.50 },
      ],
      total: 9.50,
      deliveryMode: 'delivery',
    },
  ]);

  // Animation pour les emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 2000;
        const duration = 20000 + Math.random() * 15000;

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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return colors.status.success;
      case 'cancelled':
        return colors.status.error;
      case 'in_progress':
        return colors.accent.main;
      default:
        return colors.neutral.gray400;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'in_progress':
        return 'En cours';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'in_progress':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getDeliveryModeText = (mode: Order['deliveryMode']) => {
    switch (mode) {
      case 'delivery':
        return 'Livraison';
      case 'takeaway':
        return 'À emporter';
      case 'dine-in':
        return 'Sur place';
      default:
        return 'Inconnu';
    }
  };

  const getDeliveryModeIcon = (mode: Order['deliveryMode']) => {
    switch (mode) {
      case 'delivery':
        return 'bicycle';
      case 'takeaway':
        return 'bag-outline';
      case 'dine-in':
        return 'restaurant-outline';
      default:
        return 'help-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFloatingEmoji = (animValue: Animated.Value, index: number) => {
    const orderEmojis = ['🍔', '🍕', '🌮', '🥗', '🍟', '🥤', '📦', '🎯', '⭐', '✨'];
    const currentEmoji = orderEmojis[index];

    const trajectoryType = index % 4;
    let startX, endX, startY, endY;

    switch (trajectoryType) {
      case 0:
        startX = Math.random() * 300;
        endX = startX + (Math.random() - 0.5) * 200;
        startY = 900;
        endY = -100;
        break;
      case 1:
        startX = -100;
        endX = 400;
        startY = 200 + Math.random() * 400;
        endY = startY + (Math.random() - 0.5) * 200;
        break;
      case 2:
        startX = 400;
        endX = -100;
        startY = 250 + Math.random() * 300;
        endY = startY + (Math.random() - 0.5) * 150;
        break;
      case 3:
        startX = Math.random() * 300;
        endX = startX + (Math.random() - 0.5) * 150;
        startY = -100;
        endY = 900;
        break;
    }

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
                }),
              },
            ],
            opacity: animValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.3, 0.3, 0],
            }),
          },
        ]}
      >
        <Text style={styles.emojiText}>{currentEmoji}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.main, colors.secondary.main]}
        style={styles.gradientContainer}
      >
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Emojis flottants */}
      {floatingEmojis.map((animValue, index) => renderFloatingEmoji(animValue, index))}

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
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Header de la commande */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={getStatusIcon(order.status)}
                    size={16}
                    color={getStatusColor(order.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderHeaderRight}>
                <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                <View style={styles.deliveryMode}>
                  <Ionicons
                    name={getDeliveryModeIcon(order.deliveryMode)}
                    size={14}
                    color={colors.neutral.gray500}
                  />
                  <Text style={styles.deliveryModeText}>
                    {getDeliveryModeText(order.deliveryMode)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items de la commande */}
            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                </View>
              ))}
            </View>

            {/* Total et actions */}
            <View style={styles.orderFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total :</Text>
                <Text style={styles.totalAmount}>{order.total.toFixed(2)}€</Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/profile/order-details?id=${order.id}`)}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.primary.main} />
                  <Text style={styles.actionButtonText}>Détails</Text>
                </TouchableOpacity>

                {order.status === 'completed' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // Logique pour recommander
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons name="refresh-outline" size={18} color={colors.accent.main} />
                    <Text style={[styles.actionButtonText, { color: colors.accent.main }]}>
                      Recommander
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.neutral.gray300} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyMessage}>Vos commandes apparaîtront ici</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  orderDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  deliveryMode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryModeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginLeft: spacing.xs,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.main,
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingTop: spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  totalAmount: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.main,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 24,
  },
});