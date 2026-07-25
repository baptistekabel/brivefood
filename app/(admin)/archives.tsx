import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useOrders } from '../../src/context/OrdersContext';
import { OrderStatus, OrderMode } from '../../src/types';
import ProductImage from '../../src/components/common/ProductImage';
import { getOrderDisplayNumber } from '../../src/utils/serviceDay';

// Une commande est archivée dès qu'elle est terminée : livrée/servie ou annulée
const ARCHIVED_STATUSES = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

export default function AdminArchives() {
  const { orders, loading, hideOrdersFromArchives } = useOrders();
  const [isDeleting, setIsDeleting] = useState(false);

  const archivedOrders = useMemo(() => {
    return (orders || [])
      .filter(order => ARCHIVED_STATUSES.includes(order.status))
      .filter(order => !order.hiddenFromArchives)
      .sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
  }, [orders]);

  const getModeIcon = (mode) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return 'bicycle-outline';
      case OrderMode.TAKEOUT:
        return 'bag-outline';
      case OrderMode.DINE_IN:
        return 'restaurant-outline';
      default:
        return 'receipt-outline';
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return 'Livraison';
      case OrderMode.TAKEOUT:
        return 'À emporter';
      case OrderMode.DINE_IN:
        return 'Sur place';
      default:
        return 'Commande';
    }
  };

  const getStatusLabel = (order) => {
    if (order.status === OrderStatus.CANCELLED) return 'Annulée';
    if (order.mode === OrderMode.DELIVERY) return 'Livrée';
    if (order.mode === OrderMode.TAKEOUT) return 'Récupérée';
    return 'Servie';
  };

  const isCancelled = (order) => order.status === OrderStatus.CANCELLED;

  // orderTime/orderDate sont renseignés à la création, createdAt sert de repli
  const getFormattedDate = (order) => {
    if (order.orderTime && order.orderDate) {
      return `${order.orderTime} · ${order.orderDate}`;
    }

    if (order.createdAt) {
      const date = new Date(order.createdAt);
      if (!isNaN(date.getTime())) {
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${time} · ${date.toLocaleDateString('fr-FR')}`;
      }
    }

    return order.orderTime || order.orderDate || 'Date inconnue';
  };

  const handleDeleteAll = () => {
    if (archivedOrders.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Vider les archives',
      `Retirer les ${archivedOrders.length} commandes terminées de cette liste ?\n\n`
        + `Les points de fidélité de vos clients et le chiffre d'affaires des statistiques `
        + `ne sont pas affectés. Les commandes en cours non plus.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const result = await hideOrdersFromArchives(archivedOrders.map(order => order.id));
            setIsDeleting(false);

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Archives vidées', `${result.hiddenCount} commande(s) retirée(s).`);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                'Suppression incomplète',
                result.error || "Les archives n'ont pas pu être vidées."
              );
            }
          },
        },
      ]
    );
  };

  const renderOrder = ({ item: order }) => {
    const itemCount = order.items?.length || 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <Text style={styles.orderNumber}>#{getOrderDisplayNumber(order)}</Text>
          <View style={[
            styles.statusBadge,
            isCancelled(order) ? styles.statusBadgeCancelled : styles.statusBadgeDone
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isCancelled(order) ? '#DC2626' : '#16A34A' }
            ]} />
            <Text style={[
              styles.statusBadgeText,
              { color: isCancelled(order) ? '#DC2626' : '#16A34A' }
            ]}>
              {getStatusLabel(order)}
            </Text>
          </View>
        </View>

        <Text style={styles.orderDate}>{getFormattedDate(order)}</Text>

        <View style={styles.orderMetaRow}>
          <Ionicons name={getModeIcon(order.mode)} size={18} color={colors.neutral.gray500} />
          <Text style={styles.orderMode}>{getModeLabel(order.mode)}</Text>
        </View>

        <View style={styles.orderMetaRow}>
          <Ionicons name="person" size={18} color={colors.neutral.gray600} />
          <Text style={styles.customerName} numberOfLines={1}>
            {order.customerName || 'Client BriveFood'}
          </Text>
        </View>

        {!!(order.phone || order.phoneNumber) && (
          <View style={styles.orderMetaRow}>
            <Ionicons name="call" size={18} color={colors.neutral.gray600} />
            <Text style={styles.customerPhone}>{order.phone || order.phoneNumber}</Text>
          </View>
        )}

        {itemCount > 0 && (
          <>
            <Text style={styles.itemCount}>
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </Text>

            <View style={styles.itemsBlock}>
              <View style={styles.itemsList}>
                {order.items.map((item, index) => (
                  <View key={`${order.id}-${index}`} style={styles.itemRow}>
                    <ProductImage
                      product={{
                        name: item.name,
                        id: item.id || item.productId,
                        imageKey: item.imageKey,
                      }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity}x · {(item.price * item.quantity).toFixed(2)}€
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.orderTotal}>
                {Number(order.total || 0).toFixed(2)}€
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.neutral.gray400} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="archive-outline" size={64} color={colors.neutral.gray300} />
        <Text style={styles.emptyTitle}>Aucune commande archivée</Text>
        <Text style={styles.emptyMessage}>
          Les commandes livrées et annulées apparaîtront ici.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* En-tête sombre */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // (admin) est un navigateur a onglets : router.back() retombe sur
              // le tableau de bord. On revient explicitement aux parametres,
              // l'ecran depuis lequel on arrive.
              router.replace('/(admin)/settings');
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Archives</Text>

          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.headerButtonDanger,
              archivedOrders.length === 0 && styles.headerButtonDisabled,
            ]}
            onPress={handleDeleteAll}
            disabled={archivedOrders.length === 0 || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons
                name="trash-outline"
                size={22}
                color={archivedOrders.length === 0 ? colors.neutral.gray600 : '#EF4444'}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{archivedOrders.length}</Text>
          <Text style={styles.statLabel}>
            commande{archivedOrders.length > 1 ? 's' : ''} terminée{archivedOrders.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Liste des archives */}
      <View style={styles.listContainer}>
        <FlatList
          data={archivedOrders}
          renderItem={renderOrder}
          keyExtractor={(order) => String(order.firestoreId || order.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={10}
          removeClippedSubviews
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  headerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  listContent: {
    padding: spacing.lg,
    // La tab bar admin est en position absolue (85px)
    paddingBottom: 120,
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusBadgeDone: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
  },
  orderDate: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  orderMode: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray600,
  },
  customerName: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.black,
  },
  customerPhone: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray600,
  },
  itemCount: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
    marginTop: spacing.md,
  },
  itemsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  itemsList: {
    flex: 1,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.black,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
  },
  orderTotal: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.black,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray600,
    marginTop: spacing.md,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
});
