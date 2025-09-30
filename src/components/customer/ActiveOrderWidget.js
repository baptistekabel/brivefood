import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useActiveOrder } from '../../context/ActiveOrderContext';
import { OrderStatus } from '../../types';

const { width } = Dimensions.get('window');

export default function ActiveOrderWidget({ onPress }) {
  const { activeOrder, getStatusText, getStatusColor, completeActiveOrder } = useActiveOrder();

  // Cacher la miniature si pas de commande active
  if (!activeOrder) {
    return null;
  }

  // Cacher automatiquement la miniature si la commande est terminée
  if (activeOrder.status === OrderStatus.DELIVERED) {
    // Supprimer automatiquement la commande active
    completeActiveOrder();
    return null;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push('/order-details');
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'dine_in':
        return 'restaurant-outline';
      case 'takeout':
        return 'bag-outline';
      case 'delivery':
        return 'bicycle-outline';
      default:
        return 'receipt-outline';
    }
  };

  const getModeText = (mode) => {
    switch (mode) {
      case 'dine_in':
        return 'Sur place';
      case 'takeout':
        return 'À emporter';
      case 'delivery':
        return 'Livraison';
      default:
        return 'Commande';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#000000', '#1a1a1a', '#333333']}
          style={styles.widget}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge de statut sans animation */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(activeOrder.status),
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>{getStatusText(activeOrder.status)}</Text>
          </View>

          {/* Contenu principal horizontal */}
          <View style={styles.mainContent}>
            {/* Section gauche - Info commande */}
            <View style={styles.leftSection}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{activeOrder.id}</Text>
                <View style={styles.modeRow}>
                  <Ionicons
                    name={getModeIcon(activeOrder.mode)}
                    size={16}
                    color={colors.accent.main}
                  />
                  <Text style={styles.modeText}>{getModeText(activeOrder.mode)}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <Ionicons name="timer-outline" size={14} color={colors.neutral.gray400} />
                <Text style={styles.timeText}>~{activeOrder.estimatedTime}</Text>
              </View>
            </View>

            {/* Section droite - Total et action */}
            <View style={styles.rightSection}>
              <Text style={styles.totalAmount}>{activeOrder.total.toFixed(2)}€</Text>
              <View style={styles.actionHint}>
                <Text style={styles.actionText}>Suivre</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent.main} />
              </View>
            </View>
          </View>

          {/* Barre de progression décorative */}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[getStatusColor(activeOrder.status), `${getStatusColor(activeOrder.status)}80`]}
              style={styles.progressFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? spacing.lg + 66 + 20 : spacing.lg + 52 + 20, // Plus bas = valeur plus petite
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  widget: {
    position: 'relative',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 80,
  },
  statusBadge: {
    position: 'absolute',
    top: 8, // Positionné à l'intérieur du container
    right: spacing.md, // Aligné à droite pour éviter le rognage
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  leftSection: {
    flex: 1,
  },
  orderHeader: {
    marginBottom: spacing.xs / 2,
  },
  orderNumber: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  modeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.main,
    marginBottom: spacing.xs / 2,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  actionText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  progressFill: {
    height: '100%',
    width: '75%', // Simule une progression
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});