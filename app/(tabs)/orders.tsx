import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { useAuth } from '../../src/context/AuthContext';
import { useOrders } from '../../src/context/OrdersContext';
import { useOrder } from '../../src/context/OrderContext';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';

export default function OrdersScreen() {
  const fontsLoaded = useFonts();
  const { user, isAuthenticated } = useAuth();
  const { orders } = useOrders();
  const { reorderItems } = useOrder();
  const [activeTab, setActiveTab] = useState('current');

  // Animations d'apparition
  const headerAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(-30)
  }).current;

  const tabsAnimation = useRef({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.9)
  }).current;

  const orderAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(50),
      scale: new Animated.Value(0.9)
    }))
  ).current;
  
  // Animations pour les emojis flottants
  const floatingEmojis = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;

  // Animations d'entrée et des emojis flottants
  useEffect(() => {
    // Animation d'entrée du header
    const animateHeaderEntrance = () => {
      Animated.parallel([
        Animated.timing(headerAnimation.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerAnimation.translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    };

    // Animation d'entrée des tabs
    const animateTabsEntrance = () => {
      Animated.parallel([
        Animated.timing(tabsAnimation.opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(tabsAnimation.scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    };

    // Animation d'entrée des commandes en cascade
    const animateOrdersEntrance = () => {
      const animations = orderAnimations.map((orderAnim, index) =>
        Animated.timing(orderAnim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 150, // Délai plus important pour un effet plus visible
          useNativeDriver: true,
        })
      );

      const translateAnimations = orderAnimations.map((orderAnim, index) =>
        Animated.timing(orderAnim.translateY, {
          toValue: 0,
          duration: 800,
          delay: index * 150,
          useNativeDriver: true,
        })
      );

      const scaleAnimations = orderAnimations.map((orderAnim, index) =>
        Animated.spring(orderAnim.scale, {
          toValue: 1,
          delay: index * 150,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );

      Animated.parallel([
        ...animations,
        ...translateAnimations,
        ...scaleAnimations
      ]).start();
    };

    // Démarrer les animations d'entrée avec des délais échelonnés
    setTimeout(animateHeaderEntrance, 200);
    setTimeout(animateTabsEntrance, 600);
    setTimeout(animateOrdersEntrance, 1000);

    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 1000;
        const duration = 15000 + Math.random() * 15000;
        
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

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  // Filtrer et adapter les commandes réelles par statut
  const currentOrders = orders
    .filter(order => 
      order.status !== OrderStatus.DELIVERED && 
      order.status !== OrderStatus.CANCELLED
    )
    .map(order => ({
      ...order,
      orderNumber: `#${order.id}`,
      timestamp: new Date(order.createdAt),
    }));

  const orderHistory = orders
    .filter(order => 
      order.status === OrderStatus.DELIVERED || 
      order.status === OrderStatus.CANCELLED
    )
    .map(order => ({
      ...order,
      orderNumber: `#${order.id}`,
      timestamp: new Date(order.createdAt),
    }));


  const getStatusColor = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return colors.status.warning;
      case OrderStatus.CONFIRMED:
        return '#000000';
      case OrderStatus.PREPARING:
        return '#000000';
      case OrderStatus.READY:
        return colors.status.success;
      case OrderStatus.IN_DELIVERY:
        return colors.status.info;
      case OrderStatus.DELIVERED:
        return colors.status.success;
      case OrderStatus.CANCELLED:
        return colors.status.error;
      default:
        return colors.neutral.gray400;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.CONFIRMED:
        return 'Confirmée';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.READY:
        return 'Prête';
      case OrderStatus.IN_DELIVERY:
        return 'En livraison';
      case OrderStatus.DELIVERED:
        return 'Livrée';
      case OrderStatus.CANCELLED:
        return 'Annulée';
      default:
        return 'Inconnue';
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
        return 'help-outline';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (diffInDays === 0) {
      return `Aujourd'hui ${time}`;
    } else if (diffInDays === 1) {
      return `Hier ${time}`;
    } else {
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      return `${dateStr} ${time}`;
    }
  };

  const renderOrderItem = ({ item, index }) => {
    // Animation pour cette commande
    const orderAnim = orderAnimations[index] || {
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(1)
    };

    return (
      <Animated.View
        style={[
          {
            opacity: orderAnim.opacity,
            transform: [
              { translateY: orderAnim.translateY },
              { scale: orderAnim.scale }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Animation de feedback
            Animated.sequence([
              Animated.spring(orderAnim.scale, {
                toValue: 0.98,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
              }),
              Animated.spring(orderAnim.scale, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
              })
            ]).start();
          }}
          activeOpacity={0.9}
        >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <View style={styles.orderMeta}>
            <Ionicons 
              name={getModeIcon(item.mode)} 
              size={16} 
              color={colors.neutral.gray600} 
            />
            <Text style={styles.orderMode}>{getModeText(item.mode)}</Text>
            {item.tableNumber && (
              <Text style={styles.tableNumber}>• {item.tableNumber}</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
            <Text style={styles.itemName}>{orderItem.name}</Text>
            <Text style={styles.itemPrice}>{(orderItem.price * orderItem.quantity).toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total: </Text>
          <Text style={styles.totalAmount}>{item.total.toFixed(2)} €</Text>
        </View>
        <View style={styles.orderTime}>
          <Text style={styles.orderDate}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>


      {activeTab === 'history' && (
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              reorderItems(item);
              router.push('/cart');
            }}
          >
            <Text style={styles.reorderText}>Recommander</Text>
          </TouchableOpacity>
        </View>
      )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    const emptyAnimation = useRef({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.8)
    }).current;

    // Animation d'apparition de l'état vide
    useEffect(() => {
      Animated.parallel([
        Animated.timing(emptyAnimation.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(emptyAnimation.scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }, [activeTab]);

    return (
      <Animated.View
        style={[
          styles.emptyState,
          {
            opacity: emptyAnimation.opacity,
            transform: [{ scale: emptyAnimation.scale }]
          }
        ]}
      >
        <Ionicons
          name={activeTab === 'current' ? 'receipt-outline' : 'time-outline'}
          size={64}
          color='rgba(255, 255, 255, 0.6)'
        />
        <Text style={styles.emptyTitle}>
          {activeTab === 'current' ? 'Aucune commande en cours' : 'Aucun historique'}
        </Text>
        <Text style={styles.emptyMessage}>
          {activeTab === 'current'
            ? 'Passez votre première commande depuis le menu'
            : 'Vos commandes précédentes apparaîtront ici'
          }
        </Text>
      </Animated.View>
    );
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/auth/login');
  };

  // Si l'utilisateur n'est pas authentifié, afficher l'écran de connexion
  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
        </View>

        <View style={styles.loginPrompt}>
          <Ionicons name="receipt-outline" size={80} color={colors.neutral.gray300} />
          <Text style={styles.loginTitle}>Connexion requise</Text>
          <Text style={styles.loginMessage}>
            Connectez-vous pour voir vos commandes et suivre leur statut
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={['#000000', '#000000']}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currentData = activeTab === 'current' ? currentOrders : orderHistory;

  return (
    <LinearGradient
      colors={['#000000', '#000000', '#000000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      
      {/* Emojis flottants de fast food */}
      {floatingEmojis.map((animValue, index) => {
        const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯'];
        const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];
        
        const trajectoryType = index % 4;
        let startX, endX, startY, endY;
        
        switch (trajectoryType) {
          case 0:
            startX = Math.random() * 300 - 50;
            endX = startX + (Math.random() - 0.5) * 200;
            startY = 900;
            endY = -100;
            break;
          case 1:
            startX = -100;
            endX = 400;
            startY = 200 + Math.random() * 400;
            endY = startY + (Math.random() - 0.5) * 300;
            break;
          case 2:
            startX = 400;
            endX = -100;
            startY = 300 + Math.random() * 300;
            endY = startY + (Math.random() - 0.5) * 200;
            break;
          case 3:
            startX = Math.random() * 300 - 50;
            endX = startX + (Math.random() - 0.5) * 150;
            startY = -100;
            endY = 900;
            break;
        }
        
        const amplitude = 20 + (index % 3) * 15;
        
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
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    translateX: animValue.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, amplitude, 0, -amplitude, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: animValue.interpolate({
                  inputRange: [0, 0.1, 0.9, 1],
                  outputRange: [0, 0.4, 0.4, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emojiText}>{currentEmoji}</Text>
          </Animated.View>
        );
      })}
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnimation.opacity,
            transform: [{ translateY: headerAnimation.translateY }]
          }
        ]}
      >
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        
        {/* Tabs */}
        <Animated.View
          style={[
            styles.tabsContainer,
            {
              opacity: tabsAnimation.opacity,
              transform: [{ scale: tabsAnimation.scale }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'current' && styles.activeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('current');
              // Réinitialiser et redémarrer les animations des commandes
              setTimeout(() => {
                orderAnimations.forEach((anim, index) => {
                  anim.opacity.setValue(0);
                  anim.translateY.setValue(50);
                  anim.scale.setValue(0.9);

                  setTimeout(() => {
                    Animated.parallel([
                      Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                      }),
                      Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                      }),
                      Animated.spring(anim.scale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                      })
                    ]).start();
                  }, index * 100);
                });
              }, 100);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
              En cours
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('history');
              // Réinitialiser et redémarrer les animations des commandes
              setTimeout(() => {
                orderAnimations.forEach((anim, index) => {
                  anim.opacity.setValue(0);
                  anim.translateY.setValue(50);
                  anim.scale.setValue(0.9);

                  setTimeout(() => {
                    Animated.parallel([
                      Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                      }),
                      Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                      }),
                      Animated.spring(anim.scale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                      })
                    ]).start();
                  }, index * 100);
                });
              }, 100);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Historique
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Orders List */}
      <FlatList
        data={currentData}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        contentContainerStyle={[
          styles.ordersContainer,
          currentData.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.neutral.white,
  },
  tabText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  activeTabText: {
    color: '#000000',
  },
  ordersList: {
    flex: 1,
  },
  ordersContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderMode: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
  },
  tableNumber: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
  },
  orderItems: {
    marginBottom: spacing.md,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
  },
  totalAmount: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  orderTime: {
    alignItems: 'flex-end',
  },
  orderDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
  orderActions: {
    marginTop: spacing.md,
  },
  reorderButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
  },
  reorderText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.base,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  loginMessage: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.base,
    marginBottom: spacing.xl,
  },
  loginButton: {
    borderRadius: borderRadius.lg,
  },
  loginButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  
  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },
});