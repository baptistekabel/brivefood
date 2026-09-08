import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { useActiveOrder } from '../src/context/ActiveOrderContext';
import {
  CANCELLATION_WINDOW_MINUTES,
  getRemainingCancellationMs,
  formatRemaining,
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_URI,
} from '../src/utils/cancellationWindow';
import useFonts from '../src/hooks/useFonts';
import LoadingScreen from '../src/components/common/LoadingScreen';
import ProductImage from '../src/components/common/ProductImage';
import { getOrderDisplayNumber } from '../src/utils/serviceDay';
import { sortCustomizationEntries } from '../src/utils/categoryUtils';
import { OrderStatus } from '../src/types';

export default function OrderDetailsScreen() {
  const fontsLoaded = useFonts();
  const {
    activeOrder,
    getStatusText,
    getStatusColor,
    completeActiveOrder,
  } = useActiveOrder();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [elapsedTime, setElapsedTime] = useState('00:00');
  // Temps restant pour joindre le restaurant et faire annuler la commande
  const [cancelRemainingMs, setCancelRemainingMs] = useState(
    () => getRemainingCancellationMs(activeOrder?.createdAt)
  );

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

      // Décompte de la fenêtre d'annulation
      setCancelRemainingMs(getRemainingCancellationMs(activeOrder.createdAt, now));
    };

    // Mettre à jour immédiatement
    updateElapsedTime();

    // Puis toutes les secondes
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.createdAt]);

  useEffect(() => {
    // Animation d'apparition
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animation de pulsation pour le statut
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  if (!activeOrder) {
    return (
      <LinearGradient
        colors={['#000000', '#111111', '#222222']}
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.noOrderContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.neutral.gray300} />
          <Text style={styles.noOrderTitle}>Aucune commande active</Text>
          <Text style={styles.noOrderMessage}>
            Vous n'avez pas de commande en cours actuellement
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backButtonText}>Retour</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Commande annulée par le restaurant : plus de chrono ni de délai, un
  // bandeau explique la situation et la fenêtre d'annulation n'a plus de sens
  const isCancelled = activeOrder.status === OrderStatus.CANCELLED;

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

  const handleCompleteOrder = () => {
    Alert.alert(
      'Commande terminée',
      'Voulez-vous marquer cette commande comme terminée ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: async () => {
            await completeActiveOrder();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  // Fonction pour formater les personnalisations avec les noms lisibles
  const formatCustomizations = (customizations, customizationOptions) => {
    if (!customizations || !customizationOptions) return null;

    const formattedCustomizations = [];

    sortCustomizationEntries(Object.entries(customizationOptions)).forEach(([categoryKey, category]) => {
      const selectedOptions = customizations[categoryKey];
      if (category && selectedOptions && selectedOptions.length > 0) {
        // Compter les occurrences pour afficher "x2" quand la même option
        // (ex: une viande) est sélectionnée plusieurs fois
        const counts = new Map();
        selectedOptions.forEach(optionId => {
          counts.set(optionId, (counts.get(optionId) || 0) + 1);
        });

        const selectedItems = Array.from(counts.entries()).map(([optionId, count]) => {
          const option = category.options?.find(opt => opt.id === optionId);
          if (option) {
            const namePart = count > 1 ? `${option.name} x${count}` : option.name;
            const totalPrice = option.price * count;
            return totalPrice > 0 ? `${namePart} (+${totalPrice.toFixed(2)}€)` : namePart;
          }
          // Fallback si l'option n'est pas trouvée (afficher l'ID formaté)
          const fallbackName = optionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return count > 1 ? `${fallbackName} x${count}` : fallbackName;
        }).filter(Boolean);

        if (selectedItems.length > 0) {
          formattedCustomizations.push({
            categoryTitle: category.title || categoryKey,
            items: selectedItems
          });
        }
      }
    });

    return formattedCustomizations.length > 0 ? formattedCustomizations : null;
  };

  const renderOrderItem = ({ item }) => {
    // Formater les personnalisations complémentaires (même si item.options existe, vérifier customizations en complément)
    const formattedCustomizations = item.customizations && item.customizationOptions
      ? formatCustomizations(item.customizations, item.customizationOptions)
      : null;

    return (
      <View style={styles.orderItem}>
        <View style={styles.itemMainRow}>
          {/* Image du produit - utilise le même composant que la liste des produits */}
          <ProductImage
            product={item}
            style={styles.itemImage}
            resizeMode="cover"
          />

          {/* Informations du produit */}
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.itemBadges}>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityBadgeText}>x{item.quantity}</Text>
                </View>
                {item.size && (
                  <View style={styles.sizeBadge}>
                    <Text style={styles.sizeBadgeText}>{item.size}</Text>
                  </View>
                )}
              </View>
              {item.comment && (
                <Text style={styles.itemComment} numberOfLines={2}>
                  <Ionicons name="chatbubble-outline" size={12} color={colors.neutral.gray500} /> {item.comment}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Afficher toutes les options choisies (frites, viandes, boissons, sauces, etc.) */}
        {(item.options || (formattedCustomizations && formattedCustomizations.length > 0)) && (
          <View style={styles.customizations}>
            <Text style={styles.customizationsTitle}>Personnalisations :</Text>
            {/* Options formatées */}
            {item.options && item.options.split(' | ').map((opt, index) => (
              <Text key={`opt-${index}`} style={styles.customizationText}>
                • {opt}
              </Text>
            ))}
            {/* Compléter avec customizations si des options ne sont pas dans item.options */}
            {formattedCustomizations && formattedCustomizations.length > 0 && formattedCustomizations.map((category, index) => {
              const alreadyShown = item.options || '';
              const filteredItems = category.items.filter(itemName => !alreadyShown.includes(itemName.split(' (+')[0].replace(/ x\d+$/, '')));
              if (filteredItems.length === 0) return null;
              return (
                <View key={`custom-${index}`} style={styles.customizationCategory}>
                  <Text style={styles.customizationCategoryTitle}>{category.categoryTitle} :</Text>
                  {filteredItems.map((itemName, itemIndex) => (
                    <Text key={itemIndex} style={styles.customizationText}>
                      • {itemName}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#111111', '#222222']}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Détails de la commande</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCompleteOrder}
        >
          <Ionicons name="checkmark" size={24} color={colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.scrollContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Statut et informations principales */}
          <View style={styles.statusSection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.9)']}
              style={styles.statusCard}
            >
              <View style={styles.statusHeader}>
                <View style={styles.statusInfo}>
                  <Text style={styles.orderNumber}>#{getOrderDisplayNumber(activeOrder)}</Text>
                  <View style={styles.modeContainer}>
                    <Ionicons
                      name={getModeIcon(activeOrder.mode)}
                      size={20}
                      color={colors.neutral.gray600}
                    />
                    <Text style={styles.modeText}>{getModeText(activeOrder.mode)}</Text>
                  </View>
                </View>

                <Animated.View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(activeOrder.status),
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(activeOrder.status)}</Text>
                </Animated.View>
              </View>

              {/* Commande annulée par le restaurant : le chrono et le délai
                  n'ont plus de sens, on affiche l'explication à la place */}
              {isCancelled && (
                <TouchableOpacity
                  style={styles.cancelledBanner}
                  onPress={() => Linking.openURL(RESTAURANT_PHONE_URI)}
                >
                  <View style={styles.cancelledBannerHeader}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                    <Text style={styles.cancelledBannerTitle}>Commande annulée</Text>
                  </View>
                  {activeOrder.cancellationReason ? (
                    <Text style={styles.cancelledBannerText}>
                      Motif indiqué par le restaurant :{' '}
                      <Text style={styles.cancelledBannerReason}>{activeOrder.cancellationReason}</Text>
                    </Text>
                  ) : null}
                  <Text style={styles.cancelledBannerText}>
                    Votre commande a été annulée par le restaurant. Si vous avez
                    une question, appelez le{' '}
                    <Text style={styles.cancelledBannerPhone}>{RESTAURANT_PHONE}</Text>.
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.orderInfo}>
                {/* Chronomètre temps écoulé */}
                {!isCancelled && (
                  <View style={styles.timerRow}>
                    <View style={styles.timerContainer}>
                      <Ionicons name="time" size={16} color={colors.accent.main} />
                      <Text style={styles.timerText}>{elapsedTime}</Text>
                    </View>
                    <Text style={styles.timerSeparator}>•</Text>
                    <Text style={styles.estimatedTimeText}>~{activeOrder.estimatedTime}</Text>
                  </View>
                )}

                {!isCancelled && (
                  <View style={styles.infoRow}>
                    <Ionicons name="hourglass-outline" size={18} color={colors.neutral.gray600} />
                    <Text style={styles.infoText}>Délai approximatif: ~{activeOrder.estimatedTime}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.neutral.gray600} />
                  <Text style={styles.infoText}>
                    {activeOrder.orderDate} à {activeOrder.orderTime}
                  </Text>
                </View>

                {activeOrder.address && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color={colors.neutral.gray600} />
                    <Text style={styles.infoText}>{activeOrder.address}</Text>
                  </View>
                )}

                {activeOrder.phone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color={colors.neutral.gray600} />
                    <Text style={styles.infoText}>{activeOrder.phone}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Articles commandés */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Articles commandés</Text>
            <View style={styles.itemsContainer}>
              <FlatList
                data={activeOrder.items}
                renderItem={renderOrderItem}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.9)']}
              style={styles.totalCard}
            >
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total de la commande</Text>
                <Text style={styles.totalValue}>{activeOrder.total.toFixed(2)}€</Text>
              </View>

              {activeOrder.paymentMethod && (
                <View style={styles.paymentRow}>
                  <Ionicons
                    name={activeOrder.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'}
                    size={18}
                    color={colors.neutral.gray600}
                  />
                  <Text style={styles.paymentText}>
                    {activeOrder.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}
                  </Text>
                </View>
              )}

              {/* Action button directly in total card */}
              <TouchableOpacity
                style={styles.completeButtonInCard}
                onPress={handleCompleteOrder}
              >
                <LinearGradient
                  colors={isCancelled ? ['#6B7280', '#4B5563'] : ['#22C55E', '#16A34A']}
                  style={styles.completeButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
                  <Text style={styles.completeButtonText}>
                    {isCancelled ? 'Fermer cette commande' : 'Marquer comme terminée'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* L'annulation passe uniquement par un appel, et seulement
                  pendant les premières minutes : ensuite la cuisine a démarré.
                  Commande déjà annulée : ces encarts n'ont plus de raison d'être */}
              {isCancelled ? null : cancelRemainingMs > 0 ? (
                <TouchableOpacity
                  style={styles.cancelWindowBox}
                  onPress={() => Linking.openURL(RESTAURANT_PHONE_URI)}
                >
                  <View style={styles.cancelWindowHeader}>
                    <Ionicons name="time-outline" size={18} color="#B45309" />
                    <Text style={styles.cancelWindowTitle}>
                      Annulation ou modification : {formatRemaining(cancelRemainingMs)}
                    </Text>
                  </View>
                  <Text style={styles.cancelWindowText}>
                    Appelez tout de suite le restaurant au{' '}
                    <Text style={styles.cancelWindowPhone}>{RESTAURANT_PHONE}</Text>.
                    Passé ce délai, la préparation sera lancée.
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.cancelClosedBox}>
                  <Ionicons name="restaurant-outline" size={18} color={colors.neutral.gray600} />
                  <Text style={styles.cancelClosedText}>
                    Votre commande est en préparation. Passé les{' '}
                    {CANCELLATION_WINDOW_MINUTES} minutes suivant la validation, elle ne
                    peut plus être modifiée ni annulée.
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  statusSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  statusInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modeText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  orderInfo: {
    gap: spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timerText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.accent.main,
  },
  timerSeparator: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
    marginHorizontal: spacing.sm,
  },
  estimatedTimeText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    flex: 1,
  },
  itemsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.lg,
  },
  itemsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderItem: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    backgroundColor: colors.neutral.gray100,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemPrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  itemDetails: {
    gap: spacing.xs,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  quantityBadge: {
    backgroundColor: colors.neutral.gray800,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  quantityBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  sizeBadge: {
    backgroundColor: colors.neutral.gray200,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sizeBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  itemSize: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  itemComment: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  customizations: {
    backgroundColor: colors.neutral.gray50,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginLeft: 86, // Aligné avec le contenu (70px image + 16px margin)
  },
  customizationsTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  customizationText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  customizationCategory: {
    marginBottom: spacing.xs,
  },
  customizationCategoryTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginTop: spacing.xs,
  },
  totalSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  totalValue: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  paymentText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
  },
  completeButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  completeButtonInCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  completeButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  cancelButtonInCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Fenêtre d'annulation encore ouverte
  // Commande annulée par le restaurant
  cancelledBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelledBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cancelledBannerTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#DC2626',
  },
  cancelledBannerText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#991B1B',
    lineHeight: 19,
  },
  cancelledBannerPhone: {
    fontFamily: typography.fontFamily.bold,
    color: '#DC2626',
  },
  cancelledBannerReason: {
    fontFamily: typography.fontFamily.bold,
    color: '#991B1B',
  },

  cancelWindowBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  cancelWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cancelWindowTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#B45309',
  },
  cancelWindowText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#92400E',
    lineHeight: 19,
  },
  cancelWindowPhone: {
    fontFamily: typography.fontFamily.bold,
    color: '#B45309',
  },

  // Délai dépassé
  cancelClosedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  cancelClosedText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    lineHeight: 19,
  },
  cancelButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  noOrderTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noOrderMessage: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
    textAlign: 'center',
    lineHeight: typography.fontSizes.base * 1.5,
    marginBottom: spacing.xl,
  },
  backButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  backButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  backButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
});