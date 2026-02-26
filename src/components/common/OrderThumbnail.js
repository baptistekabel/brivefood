import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useOrder } from '../../context/OrderContext';

export default function OrderThumbnail() {
  const { orderItems, getItemCount, getCurrentOrderType, clearOrder } = useOrder();
  const pathname = usePathname();
  const isAdminOrDelivery = pathname?.startsWith('/(admin)') || pathname?.startsWith('/(delivery)') || pathname?.includes('/admin/') || pathname?.includes('/delivery/');

  if (getItemCount() === 0 || isAdminOrDelivery) {
    return null;
  }

  const orderType = getCurrentOrderType();
  const totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      {/* Bouton de fermeture en dehors du TouchableOpacity pour éviter le rognage */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={(e) => {
          e.stopPropagation(); // Empêche l'ouverture du panier
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          clearOrder(); // Vide complètement la commande
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons 
          name="close" 
          size={18} 
          color={colors.neutral.white} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.thumbnail}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#000000', '#000000', '#000000']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <Ionicons 
                name={orderType ? orderType.icon : 'bag'} 
                size={20} 
                color={colors.neutral.white} 
              />
              <View style={styles.textContainer}>
                <Text style={styles.orderTypeText}>
                  {orderType ? orderType.title : 'COMMANDE'}
                </Text>
                <Text style={styles.itemsText}>
                  {getItemCount()} article{getItemCount() > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.priceText}>
              {totalPrice.toFixed(2)} €
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? spacing.lg + 66 : spacing.lg + 52,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  thumbnail: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  gradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  orderTypeText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    opacity: 0.9,
  },
  itemsText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginTop: 2,
  },
  priceText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: spacing.lg - 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
});