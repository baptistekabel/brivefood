import React, { useRef, useEffect } from 'react';
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
import ProductImage from '../../src/components/common/ProductImage';
import { useOrders } from '../../src/context/OrdersContext';
import { useAuth } from '../../src/context/AuthContext';
import { OrderStatus } from '../../src/types';
import { getOrderDisplayNumber } from '../../src/utils/serviceDay';

export default function OrdersHistoryScreen() {
  const { orders: allOrders } = useOrders();
  const { user, userProfile } = useAuth();

  // Filtrer les commandes de l'utilisateur connecté
  const userOrders = allOrders.filter(order => {
    // Filtrer par email
    if (user?.email && order.customerEmail === user.email) return true;
    // Ou par userId
    if (user?.uid && order.userId === user.uid) return true;
    // Ou par nom du client (pour les anciennes commandes sans email/userId)
    if (userProfile?.name && order.customerName === userProfile.name) return true;
    // Ou par prénom + nom
    if (userProfile?.firstName && userProfile?.lastName) {
      const fullName = `${userProfile.firstName} ${userProfile.lastName}`;
      if (order.customerName === fullName) return true;
    }
    return false;
  }).sort((a, b) => {
    // Trier par date décroissante (plus récent en premier)
    const dateA = new Date(a.createdAt || a.orderDate || 0);
    const dateB = new Date(b.createdAt || b.orderDate || 0);
    return dateB.getTime() - dateA.getTime();
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED:
      case OrderStatus.READY:
        return colors.status.success;
      case OrderStatus.CANCELLED:
        return colors.status.error;
      case OrderStatus.PREPARING:
      case OrderStatus.PENDING:
        return colors.accent.main;
      default:
        return colors.neutral.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'Livrée';
      case OrderStatus.READY:
        return 'Terminée';
      case OrderStatus.CANCELLED:
        return 'Annulée';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.PENDING:
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED:
      case OrderStatus.READY:
        return 'checkmark-circle-outline';
      case OrderStatus.CANCELLED:
        return 'close-circle-outline';
      case OrderStatus.PREPARING:
      case OrderStatus.PENDING:
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getDeliveryModeText = (mode: string) => {
    switch (mode) {
      case 'delivery':
        return 'Livraison';
      case 'takeout':
      case 'takeaway':
        return 'À emporter';
      case 'dine_in':
      case 'dine-in':
        return 'Sur place';
      default:
        return mode || 'Inconnu';
    }
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'delivery':
        return 'bicycle';
      case 'takeout':
      case 'takeaway':
        return 'bag-outline';
      case 'dine_in':
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
        colors={['#000000', '#111111', '#222222']}
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
        <Text style={styles.headerTitle}>Mes commandes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userOrders.map((order) => (
          <View key={order.id || order.firestoreId} style={styles.orderCard}>
            {/* Header de la commande */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderNumber}>#{getOrderDisplayNumber(order)}</Text>
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
                <Text style={styles.orderDate}>
                  {formatDate(order.createdAt || order.orderDate || '')}
                </Text>
                <View style={styles.deliveryMode}>
                  <Ionicons
                    name={getDeliveryModeIcon(order.mode)}
                    size={14}
                    color={colors.neutral.gray500}
                  />
                  <Text style={styles.deliveryModeText}>
                    {getDeliveryModeText(order.mode)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items de la commande */}
            <View style={styles.orderItems}>
              {order.items?.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <ProductImage
                    product={{
                      name: item.name,
                      id: item.id || item.productId,
                      imageKey: item.imageKey
                    }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantityPrice}>
                      {item.quantity}x · {(item.price || 0).toFixed(2)}€
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.orderFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{(order.total || 0).toFixed(2)}€</Text>
              </View>
            </View>
          </View>
        ))}

        {userOrders.length === 0 && (
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
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.neutral.gray100,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  itemQuantityPrice: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
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
  },
  totalLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  totalAmount: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary.main,
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