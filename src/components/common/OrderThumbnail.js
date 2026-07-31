import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '../../constants/theme';
import { useOrder } from '../../context/OrderContext';

const BUTTON_SIZE = 76;

export default function OrderThumbnail() {
  const { orderItems, getItemCount, getCurrentOrderType, clearOrder } = useOrder();
  const pathname = usePathname();
  const isAdminOrDelivery = pathname?.startsWith('/(admin)') || pathname?.startsWith('/(delivery)') || pathname?.includes('/admin/') || pathname?.includes('/delivery/');

  if (getItemCount() === 0 || isAdminOrDelivery) {
    return null;
  }

  const orderType = getCurrentOrderType();
  const itemCount = getItemCount();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      {/* Vider la commande sans passer par le panier */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          clearOrder();
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={15} color={colors.neutral.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bubble}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Ionicons
          name={orderType ? orderType.icon : 'bag'}
          size={30}
          color={colors.neutral.white}
        />
      </TouchableOpacity>

      {/* Nombre d'articles */}
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{itemCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? spacing.lg + 66 : spacing.lg + 52,
    right: spacing.lg,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 1000,
  },
  bubble: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  countBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 5,
    backgroundColor: colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 10,
  },
  countBadgeText: {
    color: '#000000',
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
  },
  closeButton: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 9,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
});
