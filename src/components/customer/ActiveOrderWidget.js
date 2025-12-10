import React, { useEffect, useRef, useState } from 'react';
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
import { useOrderRating } from '../../context/OrderRatingContext';
import { OrderStatus } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ActiveOrderWidget({ onPress }) {
  const { activeOrder, getStatusText, getStatusColor, completeActiveOrder } = useActiveOrder();
  const { triggerRatingRequest } = useOrderRating();
  const previousStatusRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Chronomètre qui défile depuis la création de la commande
  useEffect(() => {
    if (!activeOrder?.createdAt) return;

    const updateElapsedTime = () => {
      const createdAt = new Date(activeOrder.createdAt).getTime();
      const now = Date.now();
      const diffMs = now - createdAt;

      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Formater en MM:SS
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setElapsedTime(formattedTime);
    };

    // Mettre à jour immédiatement
    updateElapsedTime();

    // Puis toutes les secondes
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.createdAt]);

  // Surveiller le signal de fermeture automatique après notation
  useEffect(() => {
    const checkAutoCloseSignal = setInterval(async () => {
      try {
        const closeSignal = await AsyncStorage.getItem('@auto_close_order_after_rating');
        if (closeSignal) {
          const parsedSignal = JSON.parse(closeSignal);
          // Vérifier si c'est récent (dans les 10 secondes) et pour cette commande
          const isRecent = (Date.now() - parsedSignal.timestamp) < 10000;
          const isCurrentOrder = activeOrder && parsedSignal.orderId === activeOrder.id;

          if (isRecent && isCurrentOrder) {
            console.log('🎯 [ActiveOrderWidget] Signal fermeture bannière détecté pour:', parsedSignal.orderId);

            // Nettoyer le signal
            await AsyncStorage.removeItem('@auto_close_order_after_rating');

            // Fermer la bannière automatiquement
            completeActiveOrder();
            console.log('✅ [ActiveOrderWidget] Bannière fermée automatiquement après notation');
          }
        }
      } catch (error) {
        console.error('❌ [ActiveOrderWidget] Erreur surveillance signal fermeture:', error);
      }
    }, 1000); // Vérifier chaque seconde

    return () => clearInterval(checkAutoCloseSignal);
  }, [activeOrder?.id, completeActiveOrder]);

  // Détecter automatiquement les commandes déjà livrées et déclencher le modal
  useEffect(() => {
    if (!activeOrder) return;

    const currentStatus = activeOrder.status;
    const previousStatus = previousStatusRef.current;

    console.log('🔍 [ActiveOrderWidget] Vérification statut:', {
      currentStatus,
      previousStatus,
      orderId: activeOrder.id
    });

    // Statuts considérés comme terminés
    const completedStatuses = [OrderStatus.DELIVERED, OrderStatus.READY];

    // Si la commande est déjà en statut terminé (cas comme #00031 dans le screenshot)
    if (completedStatuses.includes(currentStatus)) {
      console.log('🎯 [ActiveOrderWidget] Commande en statut terminé détectée:', activeOrder.id, currentStatus);

      // Vérifier si c'est la première détection (pas de previous status ou différent)
      const isFirstDetection = !previousStatus || previousStatus !== currentStatus;

      if (isFirstDetection) {
        console.log('🚀 [ActiveOrderWidget] Première détection du statut terminé, déclenchement du modal...');

        // Déclencher le modal de notation automatiquement avec un délai
        setTimeout(() => {
          console.log('📱 [ActiveOrderWidget] Déclenchement auto du modal pour commande terminée:', activeOrder.id);

          const orderDataForRating = {
            orderId: activeOrder.id,
            customerName: activeOrder.customerName || 'Client',
            total: activeOrder.total,
            orderDate: activeOrder.orderDate || new Date().toLocaleDateString(),
            orderTime: activeOrder.orderTime || new Date().toLocaleTimeString(),
            completedAt: new Date().toISOString()
          };

          console.log('📋 [ActiveOrderWidget] Données formatées pour modal:', orderDataForRating);
          triggerRatingRequest(orderDataForRating);
        }, 2000); // Délai de 2 secondes pour laisser l'UI se stabiliser
      }
    }

    // Mettre à jour la référence du statut précédent
    previousStatusRef.current = currentStatus;
  }, [activeOrder?.status, activeOrder?.id, triggerRatingRequest]);

  // Cacher la miniature si pas de commande active
  if (!activeOrder) {
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
                <Ionicons name="time-outline" size={14} color={colors.accent.main} />
                <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
                <Text style={styles.timeSeparator}>•</Text>
                <Text style={styles.timeText}>~{activeOrder.estimatedTime}</Text>
              </View>
            </View>

            {/* Section droite - Total et action */}
            <View style={styles.rightSection}>
              <Text style={styles.totalAmount}>{activeOrder.total.toFixed(2)}€</Text>
              {(activeOrder.status === OrderStatus.DELIVERED || activeOrder.status === OrderStatus.READY) ? (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                    console.log('🔔 [ActiveOrderWidget] Fermeture manuelle de la bannière pour commande terminée:', activeOrder.id);

                    // Avant de fermer, déclencher le modal de notation si pas déjà fait
                    try {
                      const orderDataForRating = {
                        orderId: activeOrder.id,
                        customerName: activeOrder.customerName || 'Client',
                        total: activeOrder.total,
                        orderDate: activeOrder.orderDate || new Date().toLocaleDateString(),
                        orderTime: activeOrder.orderTime || new Date().toLocaleTimeString(),
                        completedAt: new Date().toISOString()
                      };

                      console.log('📱 [ActiveOrderWidget] Déclenchement modal avant fermeture:', orderDataForRating);

                      // Déclencher le modal avant de fermer
                      triggerRatingRequest(orderDataForRating);

                      // Fermer la bannière après un court délai pour laisser le modal s'afficher
                      setTimeout(() => {
                        completeActiveOrder();
                        console.log('✅ [ActiveOrderWidget] Bannière fermée après déclenchement modal');
                      }, 500);

                    } catch (error) {
                      console.error('❌ [ActiveOrderWidget] Erreur lors du déclenchement du modal:', error);
                      // Fermer quand même en cas d'erreur
                      completeActiveOrder();
                    }
                  }}
                >
                  <Text style={styles.closeText}>Fermer</Text>
                  <Ionicons name="close" size={16} color={colors.neutral.white} />
                </TouchableOpacity>
              ) : (
                <View style={styles.actionHint}>
                  <Text style={styles.actionText}>Suivre</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.accent.main} />
                </View>
              )}
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
  elapsedTimeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.main,
  },
  timeSeparator: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    marginHorizontal: spacing.xs / 2,
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
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.neutral.gray700,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  closeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
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