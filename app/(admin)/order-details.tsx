import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';
import printerService from '../../src/services/PrinterService';
import remotePrinterService from '../../src/services/RemotePrinterService';
import Toast from '../../src/components/common/Toast';
import epsonBluetoothService from '../../src/services/EpsonBluetoothService';
import ProductImage from '../../src/components/common/ProductImage';
import { getOrderDisplayNumber } from '../../src/utils/serviceDay';

export default function AdminOrderDetails() {
  const { orderId } = useLocalSearchParams();
  const { orders, loading, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printingStatus, setPrintingStatus] = useState('');
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  useEffect(() => {
    console.log('🔍 [ORDER-DETAILS] Looking for order:', orderId);
    console.log('📋 [ORDER-DETAILS] Available orders:', orders.length);

    if (orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId);
      console.log('🎯 [ORDER-DETAILS] Found order:', foundOrder ? 'YES' : 'NO');

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        console.error('❌ [ORDER-DETAILS] Order not found with ID:', orderId);
        Alert.alert('Erreur', 'Commande non trouvée');
        router.back();
      }
    }
  }, [orderId, orders]);

  // Si pas de commande trouvée, retourner immediatement (le useEffect redirigera)
  if (!order || !order.items) {
    return null;
  }

  const getStatusColor = (status) => {
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
      case OrderStatus.CANCELLED:
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    if (!order) return status;

    const { mode } = order;

    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.PREPARING:
        return 'En préparation';
      case OrderStatus.READY:
        if (mode === OrderMode.DELIVERY) {
          return 'Prête pour livraison';
        } else if (mode === OrderMode.TAKEOUT) {
          return 'Prête à emporter';
        } else {
          return 'Prête à servir';
        }
      case OrderStatus.IN_DELIVERY:
        return 'En livraison';
      case OrderStatus.DELIVERED:
        if (mode === OrderMode.DELIVERY) {
          return 'Livrée';
        } else if (mode === OrderMode.TAKEOUT) {
          return 'Récupérée';
        } else {
          return 'Servie';
        }
      case OrderStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  };

  const getModeIcon = (mode) => {
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

  const getModeLabel = (mode) => {
    if (!mode) return 'Mode non défini';

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

  const getNextStatus = (currentStatus) => {
    if (!order) return null;

    const { mode } = order;

    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.PREPARING;

      case OrderStatus.PREPARING:
        return OrderStatus.READY;

      case OrderStatus.READY:
        if (mode === OrderMode.DELIVERY) {
          return OrderStatus.IN_DELIVERY;
        } else {
          // Pour sur place et à emporter, passer directement à livré/servi
          return OrderStatus.DELIVERED;
        }

      case OrderStatus.IN_DELIVERY:
        // Seulement pour les livraisons
        return OrderStatus.DELIVERED;

      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getStatusLabel(nextStatus) : null;
  };

  const getPreviousStatus = (currentStatus) => {
    if (!order) return null;

    const { mode } = order;

    switch (currentStatus) {
      case OrderStatus.PREPARING:
        return OrderStatus.PENDING;

      case OrderStatus.READY:
        return OrderStatus.PREPARING;

      case OrderStatus.IN_DELIVERY:
        // Seulement pour les livraisons
        return OrderStatus.READY;

      case OrderStatus.DELIVERED:
        if (mode === OrderMode.DELIVERY) {
          return OrderStatus.IN_DELIVERY;
        } else {
          // Pour sur place et à emporter, revenir à prêt
          return OrderStatus.READY;
        }

      case OrderStatus.CANCELLED:
        // Permet de rattraper une annulation faite par erreur
        return OrderStatus.PENDING;

      default:
        return null;
    }
  };

  const getPreviousStatusLabel = (currentStatus) => {
    const previousStatus = getPreviousStatus(currentStatus);
    return previousStatus ? getStatusLabel(previousStatus) : null;
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!newStatus) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  // Annulation restaurant : commande non récupérée, erreur de saisie, rupture...
  // Les points de fidélité gagnés sur cette commande sont automatiquement retirés
  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      `Annuler la commande #${order.id} ?\n\nLes points de fidélité gagnés sur cette commande seront retirés au client, et les points qu'il aurait dépensés en récompense lui seront rendus.`,
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la commande',
          style: 'destructive',
          onPress: () => handleStatusUpdate(OrderStatus.CANCELLED),
        },
      ]
    );
  };

  const renderOrderItem = (item, uniqueKey) => {
    if (!item) return null;

    return (
    <View key={uniqueKey} style={[
      styles.orderItem,
      isTabletDevice && isLandscapeMode && styles.orderItemTablet
    ]}>
      <View style={styles.itemHeaderWithImage}>
        <ProductImage
          product={{
            name: item.name,
            id: item.id || item.productId,
            imageKey: item.imageKey
          }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemHeaderInfo}>
          <Text style={[
            styles.itemName,
            isTabletDevice && isLandscapeMode && styles.itemNameTablet
          ]}>
            {item.name || 'Article sans nom'}
          </Text>
          <View style={styles.itemDetails}>
            <Text style={[
              styles.itemQuantity,
              isTabletDevice && isLandscapeMode && styles.itemQuantityTablet
            ]}>
              {item.quantity || 0}x
            </Text>
            {item.size && (
              <Text style={[
                styles.itemSize,
                isTabletDevice && isLandscapeMode && styles.itemSizeTablet
              ]}>
                • {item.size}
              </Text>
            )}
          </View>
        </View>
        <Text style={[
          styles.itemPrice,
          isTabletDevice && isLandscapeMode && styles.itemPriceTablet
        ]}>
          {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}€
        </Text>
      </View>

      {/* Afficher toutes les options choisies (frites, sauces, boissons, viandes, etc.) */}
      {(item.options || (item.customizations && Object.keys(item.customizations).length > 0)) && (
        <View style={styles.customizations}>
          <Text style={[
            styles.customizationsTitle,
            isTabletDevice && isLandscapeMode && styles.customizationsTitleTablet
          ]}>
            Options:
          </Text>
          {/* Afficher depuis item.options (format texte) */}
          {item.options && item.options.split(' | ').map((opt, optIndex) => (
            <Text key={`opt-${optIndex}`} style={[
              styles.customizationItem,
              isTabletDevice && isLandscapeMode && styles.customizationItemTablet
            ]}>
              • {opt}
            </Text>
          ))}
          {/* Compléter avec customizations si des options manquent */}
          {item.customizations && item.customizationOptions && Object.entries(item.customizations)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value], customIndex) => {
              const categoryOptions = item.customizationOptions?.[key];
              const categoryTitle = categoryOptions?.title || key;
              const selectedValues = Array.isArray(value) ? value : [value];
              const alreadyShown = item.options || '';

              return selectedValues
                .filter(val => {
                  if (categoryOptions?.options) {
                    const option = categoryOptions.options.find(opt => opt.id === val);
                    return option && !alreadyShown.includes(option.name);
                  }
                  return !alreadyShown.includes(val);
                })
                .map((val, valIndex) => {
                  let displayText = val;
                  if (categoryOptions?.options) {
                    const option = categoryOptions.options.find(opt => opt.id === val);
                    if (option) {
                      displayText = option.price > 0 ? `${option.name} (+${option.price.toFixed(2)}€)` : option.name;
                    }
                  }
                  return (
                    <Text key={`custom-${key}-${customIndex}-${valIndex}`} style={[
                      styles.customizationItem,
                      isTabletDevice && isLandscapeMode && styles.customizationItemTablet
                    ]}>
                      • {categoryTitle}: {displayText}
                    </Text>
                  );
                });
            })}
        </View>
      )}

      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={[
            styles.commentTitle,
            isTabletDevice && isLandscapeMode && styles.commentTitleTablet
          ]}>
            Commentaire:
          </Text>
          <Text style={[
            styles.commentText,
            isTabletDevice && isLandscapeMode && styles.commentTextTablet
          ]}>
            {item.comment}
          </Text>
        </View>
      )}
    </View>
    );
  };

  // Données envoyées à l'imprimante. Partagé avec l'aperçu de test pour que le
  // ticket affiché à l'écran soit rigoureusement celui qui sortirait du rouleau.
  const buildOrderForPrint = () => ({
    id: order.id,
    customerName: order.customerName || (order.firstName && order.lastName
      ? `${order.firstName} ${order.lastName}`
      : 'Client BriveFood'),
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone || order.phoneNumber || '',
    mode: order.mode?.toUpperCase() || 'TAKEOUT',
    address: order.address || '',
    items: order.items || [],
    total: order.total || 0,
    paymentMethod: order.paymentMethod || 'cash',
    orderTime: order.orderTime || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: order.createdAt || new Date().toISOString(),
    deliveryFee: order.deliveryFee || 0
  });

  // Fonction pour impression directe (sans modal)
  const handleDirectPrint = async () => {
    if (isPrinting) return; // Éviter double clic

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPrinting(true);

    try {
      // Préparation des données de commande pour l'impression
      const orderForPrint = buildOrderForPrint();

      console.log('🖨️ Impression directe commande #' + order.id);

      // Utiliser le service Epson Bluetooth
      const printerStatus = epsonBluetoothService.getStatus();

      if (printerStatus.isConnected || printerStatus.savedConfig) {
        const printResult = await epsonBluetoothService.printOrder(orderForPrint);

        if (printResult.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Confirmation passagère : en plein service, une alerte à valider
          // bloquerait la tablette jusqu'à ce que quelqu'un appuie sur OK
          setToast(`Ticket #${order.id} imprimé`);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('❌ Erreur', printResult.error || 'Échec de l\'impression');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Imprimante non configurée',
          'Configurez votre imprimante dans les paramètres.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Configurer', onPress: () => router.push('/(admin)/printer-setup') }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erreur impression directe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible d\'imprimer le ticket');
    } finally {
      setIsPrinting(false);
    }
  };

  // Fonction pour ouvrir le modal d'impression (gardée pour usage ultérieur si besoin)
  const handleOpenPrintModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPrintModal(true);
  };

  // Fonction pour fermer le modal d'impression
  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintingStatus('');
    setShowPreview(false);
  };

  // Fonction pour basculer l'aperçu avec animation
  const togglePreview = () => {
    const newPreviewState = !showPreview;
    setShowPreview(newPreviewState);

    // Feedback haptique différent selon l'action
    if (newPreviewState) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Plus fort pour "montrer"
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);  // Plus doux pour "masquer"
    }

    console.log(`👁️ Aperçu ticket: ${newPreviewState ? 'AFFICHÉ' : 'MASQUÉ'}`);
  };

  // Fonction pour générer l'aperçu du ticket
  const generateTicketPreview = () => {
    const currentDate = new Date().toLocaleString('fr-FR');
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = order.mode === 'DELIVERY' ? (order.deliveryFee || 0) : 0;
    const total = subtotal + deliveryFee;

    const getModeText = (mode) => {
      switch (mode) {
        case 'DINE_IN': return 'Sur place';
        case 'TAKEOUT': return 'À emporter';
        case 'DELIVERY': return 'Livraison';
        default: return mode;
      }
    };

    return {
      header: '🍽️ COMMANDE CUISINE 🍽️',
      orderInfo: {
        id: order.id,
        date: currentDate,
        customer: order.customerName || 'Client BriveFood',
        phone: order.phone || '',
        mode: getModeText(order.mode).toUpperCase(),
        address: order.address || ''
      },
      items: order.items || [],
      payment: {
        method: order.paymentMethod === 'cash' ? '💵 ESPÈCES' : '💳 CARTE',
        total: total.toFixed(2)
      },
      instructions: {
        mode: order.mode,
        text: order.mode === 'DELIVERY' ? '🚴 PRÉVOIR LIVREUR' :
              order.mode === 'TAKEOUT' ? '🏃 CLIENT VIENT RÉCUPÉRER' :
              '🍽️ À SERVIR EN SALLE'
      }
    };
  };

  // Fonction pour imprimer la commande avec timeout
  const handlePrintOrder = async () => {
    try {
      setPrintingStatus('impression');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Préparation des données de commande pour l'impression
      const orderForPrint = buildOrderForPrint();

      console.log('🖨️ Démarrage impression avec timeout de 10 secondes...');

      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 10000) // 10 secondes
      );

      try {
        // Course entre l'impression et le timeout
        const remoteResult = await Promise.race([
          remotePrinterService.printOrder(orderForPrint),
          timeoutPromise
        ]);

        if (remoteResult.success) {
          setPrintingStatus('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log('✅ Impression réussie via serveur distant');
          setTimeout(() => {
            handleClosePrintModal();
          }, 2500);
          return;
        }

        // Si l'impression distante échoue, essayer l'impression locale
        if (remoteResult.fallback) {
          console.log('🔄 Tentative impression locale...');
          const localResult = await Promise.race([
            printerService.printReceipt(orderForPrint),
            timeoutPromise
          ]);

          if (localResult.success) {
            setPrintingStatus('success');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => {
              handleClosePrintModal();
            }, 2500);
          } else {
            setPrintingStatus('timeout');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } else {
          setPrintingStatus('error');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

      } catch (timeoutError) {
        if (timeoutError.message === 'TIMEOUT') {
          console.warn('⏰ Timeout impression après 10 secondes');
          setPrintingStatus('timeout');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          throw timeoutError; // Relancer les autres erreurs
        }
      }

    } catch (error) {
      console.error('❌ Erreur critique impression:', error);
      setPrintingStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Fonction pour impression manuelle avec interface native
  const handleManualPrint = async () => {
    try {
      setPrintingStatus('impression');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Préparation des données de commande pour l'impression
      const orderForPrint = buildOrderForPrint();

      console.log('📱 Démarrage impression manuelle avec sélection d\'imprimante...');

      // Utiliser la nouvelle méthode d'impression manuelle
      const result = await printerService.printManually(orderForPrint);

      if (result.success) {
        setPrintingStatus('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('✅ Impression manuelle réussie:', result.message);
        setTimeout(() => {
          handleClosePrintModal();
        }, 2500);
      } else {
        setPrintingStatus('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

    } catch (error) {
      console.error('❌ Erreur impression manuelle:', error);
      setPrintingStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };


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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Commande #{getOrderDisplayNumber(order)}</Text>

          <TouchableOpacity
            style={[styles.printButton, isPrinting && styles.printButtonActive]}
            onPress={handleDirectPrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Ionicons name="print-outline" size={24} color={colors.neutral.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Order Info */}
          <View style={[
            styles.orderInfoCard,
            isTabletDevice && isLandscapeMode && styles.orderInfoCardTablet
          ]}>
            <View style={styles.orderInfoHeader}>
              <View style={styles.orderInfoLeft}>
                <Text style={[
                  styles.orderNumber,
                  isTabletDevice && isLandscapeMode && styles.orderNumberTablet
                ]}>
                  Commande #{getOrderDisplayNumber(order)}
                </Text>
                <Text style={[
                  styles.orderTime,
                  isTabletDevice && isLandscapeMode && styles.orderTimeTablet
                ]}>
                  {order.orderDate} à {order.orderTime}
                </Text>
              </View>

              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(order.status)}15` }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(order.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                  isTabletDevice && isLandscapeMode && styles.statusTextTablet
                ]}>
                  {getStatusLabel(order.status)}
                </Text>
              </View>
            </View>

            <View style={styles.orderInfoBody}>
              <View style={styles.orderModeRow}>
                <Ionicons
                  name={getModeIcon(order.mode)}
                  size={isTabletDevice && isLandscapeMode ? 24 : 20}
                  color={colors.neutral.gray600}
                />
                <Text style={[
                  styles.orderModeText,
                  isTabletDevice && isLandscapeMode && styles.orderModeTextTablet
                ]}>
                  {getModeLabel(order.mode)}
                </Text>
              </View>

              <Text style={[
                styles.customerName,
                isTabletDevice && isLandscapeMode && styles.customerNameTablet
              ]}>
                {order.customerName || 'Client BriveFood'}
              </Text>

              <Text style={[
                styles.customerPhone,
                isTabletDevice && isLandscapeMode && styles.customerPhoneTablet
              ]}>
                📞 {order.phone || 'Non renseigné'}
              </Text>

              {order.mode === OrderMode.DELIVERY && (
                <Text style={[
                  styles.customerAddress,
                  isTabletDevice && isLandscapeMode && styles.customerAddressTablet
                ]}>
                  📍 {order.address || 'Adresse non renseignée'}
                </Text>
              )}
            </View>
          </View>

          {/* Items List */}
          <View style={[
            styles.itemsSection,
            isTabletDevice && isLandscapeMode && styles.itemsSectionTablet
          ]}>
            <Text style={[
              styles.sectionTitle,
              isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
            ]}>
              Articles commandés ({order.items?.length || 0})
            </Text>

            <View style={styles.itemsContainer}>
              {order.items?.map((item, index) => renderOrderItem(item, `${order.id}-${index}`))}
            </View>
          </View>

          {/* Total */}
          <View style={[
            styles.totalSection,
            isTabletDevice && isLandscapeMode && styles.totalSectionTablet
          ]}>
            <View style={styles.totalRow}>
              <Text style={[
                styles.totalLabel,
                isTabletDevice && isLandscapeMode && styles.totalLabelTablet
              ]}>
                Total
              </Text>
              <Text style={[
                styles.totalAmount,
                isTabletDevice && isLandscapeMode && styles.totalAmountTablet
              ]}>
                {order.total.toFixed(2)}€
              </Text>
            </View>

            {/* Status Update Buttons inside total card */}
            <View style={styles.statusButtonsContainer}>
              {getPreviousStatus(order.status) && (
                <TouchableOpacity
                  style={[
                    styles.statusButtonBack,
                    isTabletDevice && isLandscapeMode && styles.statusButtonBackTablet
                  ]}
                  onPress={() => handleStatusUpdate(getPreviousStatus(order.status))}
                >
                  <View style={styles.statusButtonGradient}>
                    <Ionicons name="arrow-back" size={16} color={colors.neutral.gray600} />
                    <Text style={[
                      styles.statusButtonBackText,
                      isTabletDevice && isLandscapeMode && styles.statusButtonTextTablet
                    ]}>
                      Retour à "{getPreviousStatusLabel(order.status)}"
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {getNextStatus(order.status) && (
                <TouchableOpacity
                  style={[
                    styles.statusButtonNext,
                    isTabletDevice && isLandscapeMode && styles.statusButtonNextTablet
                  ]}
                  onPress={() => handleStatusUpdate(getNextStatus(order.status))}
                >
                  <LinearGradient
                    colors={[getStatusColor(getNextStatus(order.status)), getStatusColor(getNextStatus(order.status))]}
                    style={styles.statusButtonGradient}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      isTabletDevice && isLandscapeMode && styles.statusButtonTextTablet
                    ]}>
                      Passer à "{getNextStatusLabel(order.status)}"
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.neutral.white} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                <TouchableOpacity
                  style={styles.statusButtonCancel}
                  onPress={handleCancelOrder}
                >
                  <View style={styles.statusButtonGradient}>
                    <Ionicons name="close-circle-outline" size={16} color="#dc3545" />
                    <Text style={[
                      styles.statusButtonCancelText,
                      isTabletDevice && isLandscapeMode && styles.statusButtonTextTablet
                    ]}>
                      Annuler la commande
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Modal d'impression */}
        <Modal
          visible={showPrintModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleClosePrintModal}
        >
          <View style={styles.printModalOverlay}>
            <TouchableOpacity
              style={styles.printModalBackground}
              activeOpacity={1}
              onPress={handleClosePrintModal}
            />
            <View style={styles.printModalContainer}>
              <LinearGradient
                colors={['#000000', '#0a0a0a', '#1a1a1a']}
                style={styles.printModal}
              >
                {/* Header */}
                <View style={styles.printModalHeader}>
                  <View style={styles.printModalIconContainer}>
                    <LinearGradient
                      colors={['#FF6B35', '#FF8E53']}
                      style={styles.printModalIcon}
                    >
                      <Ionicons name="print" size={32} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.printModalTitle}>Impression du ticket</Text>
                  <Text style={styles.printModalSubtitle}>Commande #{getOrderDisplayNumber(order)}</Text>
                </View>

                {/* Aperçu du ticket ou Status */}
                {showPreview ? (
                  <ScrollView style={styles.ticketPreviewContainer} contentContainerStyle={styles.ticketPreviewContent}>
                    {(() => {
                      const preview = generateTicketPreview();
                      return (
                        <View style={styles.ticketPreview}>
                          <Text style={styles.ticketPreviewHeader}>{preview.header}</Text>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewLine}>COMMANDE #{preview.orderInfo.id}</Text>
                            <Text style={styles.ticketPreviewLine}>{preview.orderInfo.date}</Text>
                          </View>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewBold}>CLIENT: {preview.orderInfo.customer}</Text>
                            {preview.orderInfo.phone && (
                              <Text style={styles.ticketPreviewBold}>TEL: {preview.orderInfo.phone}</Text>
                            )}
                          </View>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewBold}>📦 {preview.orderInfo.mode}</Text>
                            {preview.orderInfo.address && (
                              <Text style={styles.ticketPreviewBold}>📍 {preview.orderInfo.address}</Text>
                            )}
                          </View>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewBold}>🍴 ARTICLES À PRÉPARER</Text>
                            {preview.items.map((item, index) => (
                              <View key={index} style={styles.ticketPreviewItem}>
                                <Text style={styles.ticketPreviewBold}>{item.quantity}x {item.name}</Text>
                                {item.size && <Text style={styles.ticketPreviewLine}>Taille: {item.size}</Text>}
                                {/* Afficher toutes les options (frites, viandes, boissons, sauces, etc.) */}
                                {item.options && item.options.split(' | ').map((opt, optIdx) => (
                                  <Text key={`opt-${optIdx}`} style={styles.ticketPreviewLine}>
                                    → {opt}
                                  </Text>
                                ))}
                                {/* Compléter avec customizations si nécessaire */}
                                {item.customizations && item.customizationOptions && (() => {
                                  const alreadyShown = item.options || '';
                                  return Object.entries(item.customizations).map(([key, value]) => {
                                    const catOpts = item.customizationOptions?.[key];
                                    const title = catOpts?.title || key;
                                    const vals = Array.isArray(value) ? value : [value];
                                    return vals
                                      .filter(v => {
                                        const opt = catOpts?.options?.find(o => o.id === v);
                                        return opt && !alreadyShown.includes(opt.name);
                                      })
                                      .map((v, vIdx) => {
                                        const opt = catOpts?.options?.find(o => o.id === v);
                                        return (
                                          <Text key={`custom-${key}-${vIdx}`} style={styles.ticketPreviewLine}>
                                            → {title}: {opt ? opt.name : v}
                                          </Text>
                                        );
                                      });
                                  });
                                })()}
                                {item.comment && (
                                  <Text style={styles.ticketPreviewLine}>Note: {item.comment}</Text>
                                )}
                              </View>
                            ))}
                          </View>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewBold}>💳 PAIEMENT: {preview.payment.method}</Text>
                            <Text style={styles.ticketPreviewBold}>💰 TOTAL: {preview.payment.total}€</Text>
                          </View>

                          <View style={styles.ticketPreviewSection}>
                            <Text style={styles.ticketPreviewCenter}>⏰ À PRÉPARER MAINTENANT</Text>
                            <Text style={styles.ticketPreviewCenter}>{preview.instructions.text}</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </ScrollView>
                ) : (
                  <View style={styles.printStatusContainer}>
                    {printingStatus === '' && (
                      <>
                        <Text style={styles.printStatusText}>Prêt à imprimer le ticket de cuisine</Text>
                        <Text style={styles.printStatusSubtext}>Vérifiez que l'imprimante est allumée</Text>
                      </>
                    )}

                    {printingStatus === 'impression' && (
                      <>
                        <View style={styles.printLoadingContainer}>
                          <ActivityIndicator
                            size="large"
                            color="#FF6B35"
                            style={styles.printActivityIndicator}
                          />
                          <View style={styles.printLoadingIconContainer}>
                            <Ionicons name="print" size={24} color="#FF6B35" />
                          </View>
                        </View>
                        <Text style={styles.printStatusText}>Impression en cours...</Text>
                        <Text style={styles.printStatusSubtext}>
                          Connexion à l'imprimante • Maximum 10 secondes
                        </Text>
                        <View style={styles.printProgressContainer}>
                          <View style={styles.printProgressBar} />
                        </View>
                      </>
                    )}

                    {printingStatus === 'success' && (
                      <>
                        <View style={styles.printSuccessContainer}>
                          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                        </View>
                        <Text style={[styles.printStatusText, { color: '#22C55E' }]}>Ticket imprimé avec succès !</Text>
                        <Text style={styles.printStatusSubtext}>Le modal va se fermer automatiquement</Text>
                      </>
                    )}

                    {printingStatus === 'timeout' && (
                      <>
                        <View style={styles.printTimeoutContainer}>
                          <Ionicons name="time-outline" size={48} color="#f59e0b" />
                        </View>
                        <Text style={[styles.printStatusText, { color: '#f59e0b' }]}>Délai d'attente dépassé</Text>
                        <Text style={styles.printStatusSubtext}>
                          L'imprimante ne répond pas après 10 secondes
                        </Text>
                        <View style={styles.printTimeoutDetails}>
                          <Text style={styles.printTimeoutDetailText}>
                            • Vérifiez que l'imprimante est allumée{'\n'}
                            • Vérifiez la connexion réseau{'\n'}
                            • Démarrez le serveur d'impression
                          </Text>
                        </View>
                      </>
                    )}

                    {printingStatus === 'error' && (
                      <>
                        <View style={styles.printErrorContainer}>
                          <Ionicons name="alert-circle" size={48} color="#ef4444" />
                        </View>
                        <Text style={[styles.printStatusText, { color: '#ef4444' }]}>Erreur d'impression</Text>
                        <Text style={styles.printStatusSubtext}>Une erreur technique s'est produite</Text>
                      </>
                    )}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.printModalActions}>
                  {(printingStatus === 'error' || printingStatus === 'timeout') && (
                    <TouchableOpacity
                      style={styles.printRetryButton}
                      onPress={handlePrintOrder}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#FF6B35', '#FF8E53']}
                        style={styles.printRetryGradient}
                      >
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.printRetryText}>
                          {printingStatus === 'timeout' ? 'Réessayer l\'impression' : 'Réessayer'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {printingStatus === '' && (
                    <>
                      {/* Boutons d'impression en ligne */}
                      <View style={styles.printButtonsRow}>
                        {/* Bouton Impression Automatique */}
                        <TouchableOpacity
                          style={[styles.printStartButton, styles.printButtonHalf]}
                          onPress={handlePrintOrder}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#FF6B35', '#FF8E53']}
                            style={styles.printStartGradient}
                          >
                            <Ionicons name="flash" size={18} color="white" />
                            <Text style={styles.printStartText}>Auto</Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        {/* Bouton Impression Manuelle */}
                        <TouchableOpacity
                          style={[styles.printManualButton, styles.printButtonHalf]}
                          onPress={handleManualPrint}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#10B981', '#34D399']}
                            style={styles.printManualGradient}
                          >
                            <Ionicons name="print-outline" size={18} color="white" />
                            <Text style={styles.printManualText}>Manuel</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>

                      {/* Texte d'explication */}
                      <View style={styles.printExplanation}>
                        <Text style={styles.printExplanationText}>
                          <Text style={styles.printExplanationBold}>Auto:</Text> Impression automatique via serveur
                        </Text>
                        <Text style={styles.printExplanationText}>
                          <Text style={styles.printExplanationBold}>Manuel:</Text> Choisir votre imprimante
                        </Text>
                      </View>
                    </>
                  )}

                  {printingStatus !== 'impression' && (
                    <TouchableOpacity
                      style={styles.printCancelButton}
                      onPress={handleClosePrintModal}
                    >
                      <Text style={styles.printCancelText}>
                        {printingStatus === 'success' ? 'Fermer' : 'Annuler'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Toast
          visible={!!toast}
          message={toast}
          onHide={() => setToast(null)}
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.black,
  },
  loadingText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  printButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  printButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
    borderColor: 'rgba(255, 107, 53, 0.8)',
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
    paddingBottom: 100, // Espace pour la navbar + le bouton (un peu plus haut)
  },

  // Order Info Card
  orderInfoCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfoCardTablet: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfoLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  orderNumberTablet: {
    fontSize: typography.fontSizes['2xl'],
  },
  orderTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  orderTimeTablet: {
    fontSize: typography.fontSizes.base,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  statusTextTablet: {
    fontSize: typography.fontSizes.base,
  },
  orderInfoBody: {
    gap: spacing.sm,
  },
  orderModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderModeText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginLeft: spacing.sm,
  },
  orderModeTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
  customerName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  customerNameTablet: {
    fontSize: typography.fontSizes.xl,
  },
  customerPhone: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
  },
  customerPhoneTablet: {
    fontSize: typography.fontSizes.lg,
  },
  customerAddress: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
  },
  customerAddressTablet: {
    fontSize: typography.fontSizes.lg,
  },

  // Items Section
  itemsSection: {
    marginBottom: spacing.lg,
  },
  itemsSectionTablet: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  sectionTitleTablet: {
    fontSize: typography.fontSizes.xl,
  },
  itemsContainer: {
    gap: spacing.sm,
  },
  orderItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  orderItemTablet: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemHeaderWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.neutral.gray100,
  },
  itemHeaderInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginRight: spacing.md,
  },
  itemNameTablet: {
    fontSize: typography.fontSizes.lg,
  },
  itemPrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  itemPriceTablet: {
    fontSize: typography.fontSizes.lg,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  itemQuantity: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  itemQuantityTablet: {
    fontSize: typography.fontSizes.base,
  },
  itemSize: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  itemSizeTablet: {
    fontSize: typography.fontSizes.base,
  },
  customizations: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  customizationsTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  customizationsTitleTablet: {
    fontSize: typography.fontSizes.base,
  },
  customizationItem: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs / 2,
  },
  customizationItemTablet: {
    fontSize: typography.fontSizes.base,
  },
  commentContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  commentTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  commentTitleTablet: {
    fontSize: typography.fontSizes.base,
  },
  commentText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    fontStyle: 'italic',
  },
  commentTextTablet: {
    fontSize: typography.fontSizes.base,
  },

  // Total Section
  totalSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalSectionTablet: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
  },
  totalLabelTablet: {
    fontSize: typography.fontSizes.xl,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  totalAmountTablet: {
    fontSize: typography.fontSizes['2xl'],
  },

  // Buttons
  statusButtonsContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statusButtonBack: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  statusButtonBackTablet: {
    borderRadius: borderRadius.xl,
  },
  statusButtonNext: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  statusButtonNextTablet: {
    borderRadius: borderRadius.xl,
  },
  statusButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  statusButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  statusButtonBackText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray600,
  },
  statusButtonCancel: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  statusButtonCancelText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#dc3545',
  },
  statusButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },

  // Modal d'impression styles
  printModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  printModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  printModalContainer: {
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
  },
  printModal: {
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
  printModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  printModalIconContainer: {
    marginBottom: spacing.md,
  },
  printModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  printModalTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  printModalSubtitle: {
    fontSize: typography.fontSizes.base,
    color: '#FF8E53',
    fontFamily: typography.fontFamily.medium,
  },
  printStatusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 80,
    justifyContent: 'center',
  },
  printStatusText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  printStatusSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray400,
    textAlign: 'center',
  },
  printLoadingContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  printActivityIndicator: {
    marginBottom: spacing.md,
  },
  printLoadingIconContainer: {
    marginTop: -spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: borderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printProgressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  printProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    width: '100%',
    // Animation would be handled by a library like react-native-reanimated
  },
  printSuccessContainer: {
    marginBottom: spacing.md,
  },
  printTimeoutContainer: {
    marginBottom: spacing.md,
  },
  printTimeoutDetails: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  printTimeoutDetailText: {
    fontSize: typography.fontSizes.sm,
    color: '#d97706',
    fontFamily: typography.fontFamily.medium,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  printErrorContainer: {
    marginBottom: spacing.md,
  },
  printModalActions: {
    gap: spacing.md,
  },
  printStartButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  printStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  printStartText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  printRetryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  printRetryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  printRetryText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  printCancelButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  printCancelText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
  },

  // Nouveaux styles pour les boutons d'impression améliorés
  printButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  printButtonHalf: {
    flex: 1,
  },
  printManualButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  printManualGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  printManualText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  printExplanation: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  printExplanationText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray300,
    marginBottom: spacing.xs,
  },
  printExplanationBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },

  // Styles pour l'aperçu du ticket
  ticketPreviewContainer: {
    maxHeight: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  ticketPreviewContent: {
    padding: spacing.md,
  },
  ticketPreview: {
    fontFamily: 'Courier New',
  },
  ticketPreviewHeader: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    color: colors.neutral.black,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  ticketPreviewSection: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderStyle: 'dashed',
  },
  ticketPreviewLine: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.black,
    marginBottom: spacing.xs / 2,
    fontFamily: 'monospace',
  },
  ticketPreviewBold: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.black,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs / 2,
  },
  ticketPreviewCenter: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.black,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  ticketPreviewItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  // Styles pour le bouton aperçu amélioré
  previewToggleButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  previewToggleButtonActive: {
    shadowColor: '#10B981',
    transform: [{ scale: 1.02 }],
  },
  previewToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewToggleText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
});