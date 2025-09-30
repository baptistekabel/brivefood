import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';
import notificationService from '../../src/services/notificationService';
import adminNotificationService, { registerAdminForNotifications } from '../../src/services/adminNotificationService';
import remotePrinterService from '../../src/services/RemotePrinterService';

export default function AdminDashboard() {
  const { orders, loading, refreshOrders, updateOrderStatus } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const previousOrdersCount = useRef(0);

  console.log('📊 [DASHBOARD] Orders from Firestore:', orders.length);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  // Initialiser les notifications au chargement (désactivé temporairement)
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // await notificationService.initialize();
        console.log('🔔 Notifications désactivées temporairement (focus sur impression)');

        // Enregistrement push notifications désactivé temporairement
        // const token = await notificationService.getPushToken();
        // if (token) {
        //   await registerAdminForNotifications(token, {
        //     platform: 'admin',
        //     deviceId: 'admin-dashboard',
        //   });
        //   console.log('✅ Admin enregistré pour les notifications push');
        // }
      } catch (error) {
        console.error('❌ Erreur initialisation notifications:', error);
      }
    };

    initNotifications();

    // Cleanup au démontage
    return () => {
      // notificationService.cleanup();
    };
  }, []);

  // Détecter les nouvelles commandes et envoyer des notifications
  useEffect(() => {
    if (!loading && orders.length > 0) {
      // Au premier chargement, initialiser le compteur
      if (previousOrdersCount.current === 0) {
        previousOrdersCount.current = orders.length;
        return;
      }

      // Si on a plus de commandes qu'avant, c'est une nouvelle commande
      if (orders.length > previousOrdersCount.current) {
        const newOrdersCount = orders.length - previousOrdersCount.current;
        console.log(`🆕 ${newOrdersCount} nouvelle(s) commande(s) détectée(s)`);

        // Trouver la/les nouvelle(s) commande(s) (les plus récentes)
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const newOrders = sortedOrders.slice(0, newOrdersCount);

        // Traitement des nouvelles commandes SEULEMENT si on accepte les commandes
        if (acceptingOrders) {
          newOrders.forEach(async (order) => {
            if (order.status === OrderStatus.PENDING) { // Seulement pour les nouvelles commandes
              console.log(`🆕 Nouvelle commande détectée: #${order.id}`);

              // Vibration pour attirer l'attention
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Impression automatique du ticket
              try {
                // Préparation des données de commande pour l'impression
                const orderForPrint = {
                  id: order.id,
                  customerName: order.customerName || 'Client BriveFood',
                  phone: order.phone || '',
                  mode: order.mode?.toUpperCase() || 'TAKEOUT',
                  address: order.address || '',
                  items: order.items || [],
                  total: order.total || 0,
                  paymentMethod: order.paymentMethod || 'cash',
                  createdAt: order.createdAt || new Date().toISOString(),
                  deliveryFee: order.deliveryFee || 0
                };

                console.log(`🖨️ Impression automatique commande #${order.id}`);
                const printResult = await remotePrinterService.printOrder(orderForPrint);

                if (printResult.success) {
                  console.log(`✅ Ticket imprimé automatiquement pour #${order.id}`);
                } else {
                  console.warn(`⚠️ Échec impression automatique pour #${order.id}:`, printResult.error);
                }
              } catch (printError) {
                console.error(`❌ Erreur impression automatique pour #${order.id}:`, printError);
              }
            }
          });
        } else {
          console.log('🔕 Nouvelles commandes détectées mais notifications désactivées (Arrêt des commandes)');
        }

        // Mettre à jour le compteur
        previousOrdersCount.current = orders.length;
      }
    }
  }, [orders, loading]);

  // Plus besoin de loadOrdersDirectly - Firestore se synchronise automatiquement
  // Plus besoin d'auto-refresh - le listener Firestore met à jour en temps réel

  const onRefresh = async () => {
    setRefreshing(true);
    // Appeler refreshOrders du context (optionnel avec Firestore)
    refreshOrders();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simuler un petit délai pour l'UX
    setTimeout(() => setRefreshing(false), 500);
  };


  // Filtrer les commandes selon le statut sélectionné
  const getFilteredOrders = () => {
    if (selectedFilter === 'all') {
      return orders;
    }
    return orders.filter((order: any) => order.status === selectedFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Obtenir le nombre de commandes par statut pour les badges
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((order: any) => order.status === status).length;
  };

  // Fonction pour ouvrir le menu de changement de statut
  const openStatusMenu = (order: any) => {
    setSelectedOrder(order);
    setShowStatusMenu(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Fonction pour fermer le menu
  const closeStatusMenu = () => {
    setShowStatusMenu(false);
    setSelectedOrder(null);
  };

  // Fonction pour changer le statut d'une commande
  const changeOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      console.log(`Changing order ${selectedOrder.id} status to ${newStatus}`);

      // Utiliser la fonction du contexte pour mettre à jour le statut
      const success = await updateOrderStatus(selectedOrder.id, newStatus);

      if (success) {
        closeStatusMenu();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Afficher une confirmation
        Alert.alert(
          'Statut mis à jour',
          `La commande #${selectedOrder.id} a été mise à jour vers "${getStatusLabel(newStatus, selectedOrder.mode)}".`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour la commande.');
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la commande.');
    }
  };

  // Obtenir les statuts disponibles selon le mode et le statut actuel
  const getAvailableStatuses = (currentStatus: string, orderMode: string) => {
    let availableStatuses = [];

    switch (orderMode) {
      case OrderMode.DINE_IN: // Sur place
        availableStatuses = [
          { key: OrderStatus.PENDING, label: 'En attente', icon: 'time-outline' },
          { key: OrderStatus.PREPARING, label: 'En préparation', icon: 'restaurant-outline' },
          { key: OrderStatus.READY, label: 'Prête à servir', icon: 'checkmark-circle-outline' },
          { key: OrderStatus.DELIVERED, label: 'Servie', icon: 'checkmark-done-outline' },
        ];
        break;

      case OrderMode.TAKEOUT: // À emporter
        availableStatuses = [
          { key: OrderStatus.PENDING, label: 'En attente', icon: 'time-outline' },
          { key: OrderStatus.PREPARING, label: 'En préparation', icon: 'restaurant-outline' },
          { key: OrderStatus.READY, label: 'Prête à emporter', icon: 'bag-check-outline' },
          { key: OrderStatus.DELIVERED, label: 'Récupérée', icon: 'checkmark-done-outline' },
        ];
        break;

      case OrderMode.DELIVERY: // Livraison
        availableStatuses = [
          { key: OrderStatus.PENDING, label: 'En attente', icon: 'time-outline' },
          { key: OrderStatus.PREPARING, label: 'En préparation', icon: 'restaurant-outline' },
          { key: OrderStatus.READY, label: 'Prête pour livraison', icon: 'checkmark-circle-outline' },
          { key: OrderStatus.IN_DELIVERY, label: 'En livraison', icon: 'bicycle-outline' },
          { key: OrderStatus.DELIVERED, label: 'Livrée', icon: 'checkmark-done-outline' },
        ];
        break;

      default:
        // Fallback pour les modes non reconnus
        availableStatuses = [
          { key: OrderStatus.PENDING, label: 'En attente', icon: 'time-outline' },
          { key: OrderStatus.PREPARING, label: 'En préparation', icon: 'restaurant-outline' },
          { key: OrderStatus.READY, label: 'Prête', icon: 'checkmark-circle-outline' },
          { key: OrderStatus.DELIVERED, label: 'Terminée', icon: 'checkmark-done-outline' },
        ];
    }

    // Filtrer pour ne pas afficher le statut actuel
    return availableStatuses.filter(status => status.key !== currentStatus);
  };


  // Plus besoin de getTodayOrders - affichage de toutes les commandes en temps réel

  const renderOrdersContent = () => {

    if (loading) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="sync-outline" size={48} color={colors.neutral.gray300} />
          <Text style={styles.emptyStateTitle}>Connexion en cours...</Text>
          <Text style={styles.emptyStateSubtitle}>Chargement des commandes</Text>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="receipt-outline" size={48} color={colors.neutral.gray300} />
          <Text style={styles.emptyStateTitle}>Aucune commande</Text>
          <Text style={styles.emptyStateSubtitle}>Les nouvelles commandes apparaitront automatiquement</Text>
        </View>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="filter-outline" size={48} color={colors.neutral.gray300} />
          <Text style={styles.emptyStateTitle}>Aucune commande {getStatusLabel(selectedFilter, null)}</Text>
          <Text style={styles.emptyStateSubtitle}>Aucune commande ne correspond au filtre sélectionné</Text>
        </View>
      );
    }

    return filteredOrders.map((order: any) => renderOrderCard(order));
  };

  // Fonction pour rendre les filtres de statut
  const renderStatusFilters = () => {
    const filters = [
      { key: 'all', label: 'Toutes', icon: 'albums-outline' },
      { key: OrderStatus.PENDING, label: 'En attente', icon: 'time-outline' },
      { key: OrderStatus.PREPARING, label: 'En préparation', icon: 'restaurant-outline' },
      { key: OrderStatus.READY, label: 'Prêtes', icon: 'checkmark-circle-outline' },
      { key: OrderStatus.IN_DELIVERY, label: 'En livraison', icon: 'bicycle-outline' },
      { key: OrderStatus.DELIVERED, label: 'Terminées', icon: 'checkmark-done-outline' },
    ];

    return (
      <View style={[
        styles.filtersContainer,
        isTabletDevice && isLandscapeMode && styles.filtersContainerTablet
      ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.key;
            const count = getStatusCount(filter.key);

            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  isSelected && styles.filterButtonActive,
                  isSelected && { backgroundColor: `${getStatusColor(filter.key)}20` },
                  isTabletDevice && isLandscapeMode && styles.filterButtonTablet
                ]}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.filterButtonContent}>
                  <Ionicons
                    name={filter.icon as any}
                    size={isTabletDevice && isLandscapeMode ? 20 : 16}
                    color={isSelected ? getStatusColor(filter.key) : colors.neutral.gray600}
                  />
                  <Text style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextActive,
                    isSelected && { color: getStatusColor(filter.key) },
                    isTabletDevice && isLandscapeMode && styles.filterButtonTextTablet
                  ]}>
                    {filter.label}
                  </Text>
                  {count > 0 && (
                    <View style={[
                      styles.filterBadge,
                      isSelected && { backgroundColor: getStatusColor(filter.key) }
                    ]}>
                      <Text style={[
                        styles.filterBadgeText,
                        isTabletDevice && isLandscapeMode && styles.filterBadgeTextTablet
                      ]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#ff6b35';
      case OrderStatus.PREPARING:
        return '#1e90ff';
      case OrderStatus.READY:
        return '#32cd32';
      case OrderStatus.IN_DELIVERY:
        return '#9c27b0';
      case OrderStatus.DELIVERED:
        return '#28a745';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string, orderMode: string | null) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.READY:
        if (orderMode === OrderMode.DELIVERY) {
          return 'Prête pour livraison';
        } else if (orderMode === OrderMode.TAKEOUT) {
          return 'Prête à emporter';
        } else {
          return 'Prête à servir';
        }
      case OrderStatus.IN_DELIVERY:
        return 'En livraison';
      case OrderStatus.DELIVERED:
        if (orderMode === OrderMode.DELIVERY) {
          return 'Livrée';
        } else if (orderMode === OrderMode.TAKEOUT) {
          return 'Récupérée';
        } else {
          return 'Servie';
        }
      default:
        return status;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return 'bicycle';
      case OrderMode.TAKEOUT:
        return 'bag';
      case OrderMode.DINE_IN:
        return 'restaurant';
      default:
        return 'receipt';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case OrderMode.DELIVERY:
        return 'Livraison';
      case OrderMode.TAKEOUT:
        return 'À emporter';
      case OrderMode.DINE_IN:
        return 'Sur place';
      default:
        return mode;
    }
  };


  const renderOrderCard = (order: any) => (
    <TouchableOpacity
      key={order.id}
      style={[
        styles.orderCard,
        isTabletDevice && isLandscapeMode && styles.orderCardTablet
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(admin)/order-details?orderId=${order.id}`);
      }}
      onLongPress={() => {
        openStatusMenu(order);
      }}
      delayLongPress={500}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <Text style={[
            styles.orderId,
            isTabletDevice && isLandscapeMode && styles.orderIdTablet
          ]}>#{order.id}</Text>
          <Text style={[
            styles.orderTime,
            isTabletDevice && isLandscapeMode && styles.orderTimeTablet
          ]}>{order.orderTime}</Text>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(order.status)}15` }
        ]}>
          <View style={[
            styles.orderStatusDot,
            { backgroundColor: getStatusColor(order.status) }
          ]} />
          <Text style={[
            styles.orderStatusText,
            { color: getStatusColor(order.status) },
            isTabletDevice && isLandscapeMode && styles.statusTextTablet
          ]}>
            {getStatusLabel(order.status, order.mode)}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderInfo}>
          <View style={styles.orderModeRow}>
            <Ionicons
              name={getModeIcon(order.mode)}
              size={isTabletDevice && isLandscapeMode ? 20 : 16}
              color={colors.neutral.gray600}
            />
            <Text style={[
              styles.orderModeText,
              isTabletDevice && isLandscapeMode && styles.orderModeTextTablet
            ]}>
              {getModeLabel(order.mode)}
            </Text>
          </View>

          <View style={styles.customerRow}>
            <Ionicons name="person" size={16} color={colors.neutral.gray600} />
            <Text style={[
              styles.orderCustomer,
              isTabletDevice && isLandscapeMode && styles.orderCustomerTablet
            ]}>
              {order.customerName && order.customerName !== 'Client' && order.customerName !== 'Client BriveFood'
                ? order.customerName
                : order.firstName && order.lastName
                  ? `${order.firstName} ${order.lastName}`
                  : order.firstName || order.lastName || 'Client BriveFood'}
            </Text>
          </View>

          {order.phone && (
            <Text style={[
              styles.orderPhone,
              isTabletDevice && isLandscapeMode && styles.orderPhoneTablet
            ]}>
              📞 {order.phone}
            </Text>
          )}

          {order.items && order.items.length > 0 && (
            <View>
              <Text style={[
                styles.orderItems,
                isTabletDevice && isLandscapeMode && styles.orderItemsTablet
              ]}>
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </Text>
              <Text style={[
                styles.orderItemsPreview,
                isTabletDevice && isLandscapeMode && styles.orderItemsPreviewTablet
              ]} numberOfLines={1}>
                {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.orderPricing}>
          <Text style={[
            styles.orderTotal,
            isTabletDevice && isLandscapeMode && styles.orderTotalTablet
          ]}>
            {order.total.toFixed(2)}€
          </Text>
        </View>
      </View>

      {/* Indicateur de nouvelle commande si créée il y a moins de 2 minutes */}
      {(() => {
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        const diffMinutes = (now.getTime() - orderDate.getTime()) / (1000 * 60);

        if (diffMinutes < 2) {
          return (
            <View style={styles.newOrderIndicator}>
              <Text style={styles.newOrderText}>NOUVEAU</Text>
            </View>
          );
        }
        return null;
      })()}
    </TouchableOpacity>
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Commandes ({orders.length})</Text>
            <Text style={[styles.headerSubtitle, {
              color: acceptingOrders ? colors.neutral.gray300 : '#fbbf24'
            }]}>
              {acceptingOrders ? 'Gestion des commandes' : 'Arrêt des commandes activé'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.statusIndicator}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setAcceptingOrders(!acceptingOrders);
              }}
            >
              <View style={[styles.statusDot, {
                backgroundColor: loading ? '#fbbf24' : acceptingOrders ? '#22C55E' : '#ef4444'
              }]} />
              <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                {loading ? 'Connexion...' : acceptingOrders ? 'En ligne' : 'Arrêt commandes'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(admin)/settings');
              }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
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
            styles.contentContainer,
            isTabletDevice && isLandscapeMode && styles.contentContainerTablet
          ]}
        >

          {/* Status Filters */}
          {renderStatusFilters()}

          {/* Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={[
                styles.sectionTitle,
                isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
              ]}>Toutes les commandes</Text>
              {!acceptingOrders && (
                <View style={styles.orderStoppedIndicator}>
                  <Ionicons name="pause-circle" size={16} color="#f59e0b" />
                  <Text style={styles.orderStoppedText}>Nouvelles commandes arrêtées</Text>
                </View>
              )}
            </View>

            <View style={[
              styles.ordersContainer,
              isTabletDevice && isLandscapeMode && styles.ordersContainerTablet
            ]}>
              {renderOrdersContent()}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Modal pour le menu de changement de statut */}
        <Modal
          visible={showStatusMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={closeStatusMenu}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={closeStatusMenu}
            />
            <View style={[
              styles.statusMenuContainer,
              isTabletDevice && isLandscapeMode && styles.statusMenuContainerTablet
            ]}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity activeOpacity={1}>
                  <LinearGradient
                    colors={['#000000', '#0a0a0a', '#1a1a1a', '#2a2a2a']}
                    style={[
                      styles.statusMenu,
                      isTabletDevice && isLandscapeMode && styles.statusMenuTablet
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                  {/* Header avec icône redesigné */}
                  <View style={[
                    styles.statusMenuHeader,
                    isTabletDevice && isLandscapeMode && styles.statusMenuHeaderTablet
                  ]}>
                    <View style={styles.statusMenuHeaderRow}>
                      <View style={styles.statusMenuIconContainer}>
                        <LinearGradient
                          colors={['#FF6B35', '#FF8E53', '#FFB366']}
                          style={[
                            styles.statusMenuIcon,
                            isTabletDevice && isLandscapeMode && styles.statusMenuIconTablet
                          ]}
                        >
                          <Ionicons
                            name="swap-horizontal"
                            size={isTabletDevice && isLandscapeMode ? 32 : 24}
                            color="white"
                          />
                        </LinearGradient>
                      </View>
                      <View style={styles.statusMenuTitleContainer}>
                        <Text style={[
                          styles.statusMenuTitle,
                          isTabletDevice && isLandscapeMode && styles.statusMenuTitleTablet
                        ]}>
                          Changer le statut
                        </Text>
                        <Text style={[
                          styles.statusMenuSubtitle,
                          isTabletDevice && isLandscapeMode && styles.statusMenuSubtitleTablet
                        ]}>
                          Commande #{selectedOrder?.id}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Options avec design ultra amélioré - Layout 2 colonnes */}
                  <View style={[
                    styles.statusOptionsContainer,
                    isTabletDevice && isLandscapeMode && styles.statusOptionsContainerTablet
                  ]}>
                    {selectedOrder && (() => {
                      const availableStatuses = getAvailableStatuses(selectedOrder.status, selectedOrder.mode);
                      const rows = [];

                      for (let i = 0; i < availableStatuses.length; i += 2) {
                        const leftStatus = availableStatuses[i];
                        const rightStatus = availableStatuses[i + 1];

                        rows.push(
                          <View key={`row-${i}`} style={styles.statusOptionsRow}>
                            {/* Option gauche */}
                            <TouchableOpacity
                              style={[
                                styles.statusOption,
                                styles.statusOptionHalf,
                                isTabletDevice && isLandscapeMode && styles.statusOptionTablet,
                              ]}
                              onPress={() => changeOrderStatus(leftStatus.key)}
                              activeOpacity={0.85}
                            >
                              <LinearGradient
                                colors={[
                                  `${getStatusColor(leftStatus.key)}20`,
                                  `${getStatusColor(leftStatus.key)}10`,
                                  `${getStatusColor(leftStatus.key)}05`
                                ]}
                                style={[
                                  styles.statusOptionGradient,
                                  styles.statusOptionGradientHalf,
                                  isTabletDevice && isLandscapeMode && styles.statusOptionGradientTablet
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                              >
                                <View style={styles.statusOptionContentCompact}>
                                  <LinearGradient
                                    colors={[
                                      `${getStatusColor(leftStatus.key)}40`,
                                      `${getStatusColor(leftStatus.key)}30`
                                    ]}
                                    style={[
                                      styles.statusIconContainerCompact,
                                      isTabletDevice && isLandscapeMode && styles.statusIconContainerTablet
                                    ]}
                                  >
                                    <Ionicons
                                      name={leftStatus.icon as any}
                                      size={isTabletDevice && isLandscapeMode ? 20 : 16}
                                      color={getStatusColor(leftStatus.key)}
                                    />
                                  </LinearGradient>
                                  <View style={styles.statusTextContainerCompact}>
                                    <Text style={[
                                      styles.statusOptionTextCompact,
                                      isTabletDevice && isLandscapeMode && styles.statusOptionTextTablet,
                                      { color: getStatusColor(leftStatus.key) }
                                    ]}>
                                      {leftStatus.label}
                                    </Text>
                                  </View>
                                </View>
                              </LinearGradient>
                            </TouchableOpacity>

                            {/* Option droite (si elle existe) */}
                            {rightStatus && (
                              <TouchableOpacity
                                style={[
                                  styles.statusOption,
                                  styles.statusOptionHalf,
                                  isTabletDevice && isLandscapeMode && styles.statusOptionTablet,
                                ]}
                                onPress={() => changeOrderStatus(rightStatus.key)}
                                activeOpacity={0.85}
                              >
                                <LinearGradient
                                  colors={[
                                    `${getStatusColor(rightStatus.key)}20`,
                                    `${getStatusColor(rightStatus.key)}10`,
                                    `${getStatusColor(rightStatus.key)}05`
                                  ]}
                                  style={[
                                    styles.statusOptionGradient,
                                    styles.statusOptionGradientHalf,
                                    isTabletDevice && isLandscapeMode && styles.statusOptionGradientTablet
                                  ]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                >
                                  <View style={styles.statusOptionContentCompact}>
                                    <LinearGradient
                                      colors={[
                                        `${getStatusColor(rightStatus.key)}40`,
                                        `${getStatusColor(rightStatus.key)}30`
                                      ]}
                                      style={[
                                        styles.statusIconContainerCompact,
                                        isTabletDevice && isLandscapeMode && styles.statusIconContainerTablet
                                      ]}
                                    >
                                      <Ionicons
                                        name={rightStatus.icon as any}
                                        size={isTabletDevice && isLandscapeMode ? 20 : 16}
                                        color={getStatusColor(rightStatus.key)}
                                      />
                                    </LinearGradient>
                                    <View style={styles.statusTextContainerCompact}>
                                      <Text style={[
                                        styles.statusOptionTextCompact,
                                        isTabletDevice && isLandscapeMode && styles.statusOptionTextTablet,
                                        { color: getStatusColor(rightStatus.key) }
                                      ]}>
                                        {rightStatus.label}
                                      </Text>
                                    </View>
                                  </View>
                                </LinearGradient>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      }

                      return rows;
                    })()}
                  </View>

                  {/* Bouton annuler ultra redesigné */}
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      isTabletDevice && isLandscapeMode && styles.cancelButtonTablet
                    ]}
                    onPress={closeStatusMenu}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2d1a1a', '#1a0000', '#0d0000']}
                      style={[
                        styles.cancelButtonGradient,
                        isTabletDevice && isLandscapeMode && styles.cancelButtonGradientTablet
                      ]}
                    >
                      <View style={styles.cancelIconContainer}>
                        <Ionicons
                          name="close"
                          size={isTabletDevice && isLandscapeMode ? 22 : 18}
                          color="#ff6b6b"
                        />
                      </View>
                      <Text style={[
                        styles.cancelButtonText,
                        isTabletDevice && isLandscapeMode && styles.cancelButtonTextTablet
                      ]}>
                        Annuler
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
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

  // ========== STYLES TABLETTE PAYSAGE ==========

  contentTablet: {
    paddingHorizontal: spacing.xl,
  },
  contentContainerTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  sectionTitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginBottom: spacing.lg,
  },

  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  orderStoppedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  orderStoppedText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: '#92400e',
    marginLeft: spacing.xs,
  },

  // Orders Styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  ordersContainer: {
    gap: spacing.sm,
  },
  ordersContainerTablet: {
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  orderCardTablet: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderIdSection: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs / 2,
  },
  orderIdTablet: {
    fontSize: typography.fontSizes.xl,
  },
  orderTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
  },
  orderTimeTablet: {
    fontSize: typography.fontSizes.base,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  orderStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  orderStatusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  statusTextTablet: {
    fontSize: typography.fontSizes.base,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  orderInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  orderModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderModeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
  },
  orderModeTextTablet: {
    fontSize: typography.fontSizes.base,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  orderCustomer: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray900,
    marginLeft: spacing.xs,
    flex: 1,
  },
  orderCustomerTablet: {
    fontSize: typography.fontSizes.lg,
  },
  orderPhone: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  orderPhoneTablet: {
    fontSize: typography.fontSizes.base,
  },
  orderItems: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  orderItemsTablet: {
    fontSize: typography.fontSizes.base,
  },
  orderItemsPreview: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
  },
  orderItemsPreviewTablet: {
    fontSize: typography.fontSizes.sm,
  },
  orderPricing: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  orderTotalTablet: {
    fontSize: typography.fontSizes['2xl'],
  },
  newOrderIndicator: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  newOrderText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  viewAllOrdersButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  viewAllOrdersButtonTablet: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  viewAllOrdersText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  viewAllOrdersTextTablet: {
    fontSize: typography.fontSizes.lg,
  },

  // Filter Styles
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filtersContainerTablet: {
    marginBottom: spacing.xl,
  },
  filtersScrollContainer: {
    paddingHorizontal: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginLeft: spacing.xs,
  },
  filterButtonTextActive: {
    fontFamily: typography.fontFamily.bold,
  },
  filterButtonTextTablet: {
    fontSize: typography.fontSizes.base,
  },
  filterBadge: {
    backgroundColor: colors.neutral.gray400,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  filterBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  filterBadgeTextTablet: {
    fontSize: typography.fontSizes.sm,
  },

  // Modal and Status Menu Styles - Design Ultra Pro
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  statusMenuContainer: {
    width: '95%',
    maxWidth: 480,
    maxHeight: '80%',
    zIndex: 1,
  },
  statusMenuContainerTablet: {
    width: '80%',
    maxWidth: 650,
    maxHeight: '75%',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  statusMenu: {
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.4)',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
    backdropFilter: 'blur(20px)',
  },
  statusMenuTablet: {
    borderRadius: 32,
    padding: spacing.xl,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 32,
  },
  statusMenuHeader: {
    marginBottom: spacing.md,
  },
  statusMenuHeaderTablet: {
    marginBottom: spacing.lg,
  },
  statusMenuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusMenuIconContainer: {
    marginRight: spacing.md,
  },
  statusMenuIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  statusMenuIconTablet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  statusMenuTitleContainer: {
    flex: 1,
  },
  statusMenuTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusMenuTitleTablet: {
    fontSize: typography.fontSizes['3xl'],
    letterSpacing: 1,
  },
  statusMenuSubtitle: {
    fontSize: typography.fontSizes.lg,
    color: '#FF8E53',
    fontFamily: typography.fontFamily.semibold,
    marginTop: spacing.xs,
  },
  statusMenuSubtitleTablet: {
    fontSize: typography.fontSizes.xl,
    marginTop: spacing.sm,
  },

  // Options de statut ultra améliorées - Layout 2 colonnes
  statusOptionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusOptionsContainerTablet: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statusOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusOption: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statusOptionHalf: {
    flex: 1,
  },
  statusOptionTablet: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  statusOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusOptionGradientHalf: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 70,
  },
  statusOptionGradientTablet: {
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusOptionContentCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIconContainerCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIconContainerTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.xl,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTextContainerCompact: {
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusOptionTextCompact: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  statusOptionTextTablet: {
    fontSize: typography.fontSizes.xl,
    letterSpacing: 0.6,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  statusStepText: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.3,
  },
  statusStepTextTablet: {
    fontSize: typography.fontSizes.sm,
  },
  statusArrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    overflow: 'hidden',
  },
  statusArrowContainerTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: spacing.lg,
  },
  statusArrowBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },

  // Bouton annuler ultra pro
  cancelButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButtonTablet: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cancelButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  cancelButtonGradientTablet: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  cancelIconContainer: {
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#ff6b6b',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cancelButtonTextTablet: {
    fontSize: typography.fontSizes.xl,
    letterSpacing: 0.8,
  },

  // Styles pour le modal de notification broadcast
  broadcastModalContainer: {
    width: '90%',
    maxWidth: 400,
    marginTop: -80, // Déplace le modal plus haut par rapport au centre
  },
  broadcastModal: {
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  broadcastModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  broadcastIconContainer: {
    marginBottom: spacing.md,
  },
  broadcastIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  broadcastModalTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  broadcastModalSubtitle: {
    fontSize: typography.fontSizes.base,
    color: '#FF8E53',
    fontFamily: typography.fontFamily.medium,
  },
  broadcastFormContainer: {
    marginBottom: spacing.lg,
  },
  broadcastInputGroup: {
    marginBottom: spacing.md,
  },
  broadcastInputLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  broadcastInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.medium,
  },
  broadcastTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  broadcastResultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  broadcastResultsTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  broadcastStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  broadcastStat: {
    alignItems: 'center',
  },
  broadcastStatNumber: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#22C55E',
  },
  broadcastStatLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray300,
    fontFamily: typography.fontFamily.medium,
  },
  broadcastActionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  broadcastCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: spacing.xs,
  },
  broadcastCancelText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#ff6b6b',
  },
  broadcastSendButton: {
    flex: 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  broadcastSendButtonDisabled: {
    opacity: 0.6,
  },
  broadcastSendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  broadcastSendText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
});