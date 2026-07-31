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
  Animated,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { OrderStatus, OrderMode } from '../../src/types';
import { useOrders } from '../../src/context/OrdersContext';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';
import notificationService from '../../src/services/notificationService';
import adminNotificationService, { registerAdminForNotifications } from '../../src/services/adminNotificationService';
import remotePrinterService from '../../src/services/RemotePrinterService';
import epsonBluetoothService from '../../src/services/EpsonBluetoothService';
import RestaurantStatusControl from '../../src/components/admin/RestaurantStatusControl';
import restaurantStatusService from '../../src/services/restaurantStatusService';
import ProductImage from '../../src/components/common/ProductImage';
import PrintTicketPreview from '../../src/components/admin/PrintTicketPreview';
import Toast from '../../src/components/common/Toast';
import * as Device from 'expo-device';
import { getOrderDisplayNumber, getServiceDayKey } from '../../src/utils/serviceDay';

// Sur simulateur/émulateur il n'y a pas d'imprimante physique :
// le ticket s'affiche à l'écran à la place
const IS_SIMULATOR = !Device.isDevice;

// Réessais d'impression : laisse le temps de remettre du papier ou de
// reconnecter le Bluetooth, sans solliciter l'imprimante à chaque snapshot
const PRINT_RETRY_DELAY_MS = 30 * 1000;
const MAX_PRINT_ATTEMPTS = 3;

export default function AdminDashboard() {
  const { orders, loading, refreshOrders, updateOrderStatus, deleteOrder, getActiveAlertForOrder } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printerConnected, setPrinterConnected] = useState(false);
  // Aperçus de tickets en attente d'être vus (simulateur, consultation manuelle,
  // ou repli quand l'imprimante n'a pas pu sortir le ticket). File d'attente et
  // non variable unique : plusieurs commandes peuvent arriver ensemble.
  const [ticketPreviewQueue, setTicketPreviewQueue] = useState<{ order: any; autoPrinted: boolean }[]>([]);
  const currentTicketPreview = ticketPreviewQueue[0] || null;
  const [toast, setToast] = useState<string | null>(null);
  const previousOrdersCount = useRef(0);
  // Horloge partagée : une seule pour tous les compteurs de temps écoulé
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Son de notification pour nouvelles commandes
  const soundRef = useRef<Audio.Sound | null>(null);
  const soundPlayCountRef = useRef(0);
  const isSoundPlayingRef = useRef(false);
  const pendingNewOrdersRef = useRef<Set<string>>(new Set()); // Commandes en attente de clic

  console.log('📊 [DASHBOARD] Orders from Firestore:', orders.length);

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();

  // Fonction pour jouer le son de notification 4 fois
  const playNotificationSound = async () => {
    if (isSoundPlayingRef.current) {
      console.log('🔊 Son déjà en cours de lecture');
      return;
    }

    try {
      isSoundPlayingRef.current = true;
      soundPlayCountRef.current = 0;

      // Charger le son
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/images/notification.mp3'),
        { shouldPlay: false }
      );
      soundRef.current = sound;

      // Jouer le son 4 fois
      const playOnce = async () => {
        if (soundPlayCountRef.current >= 4 || !isSoundPlayingRef.current) {
          // Arrêter après 4 lectures ou si arrêté manuellement
          await stopNotificationSound();
          return;
        }

        soundPlayCountRef.current++;
        console.log(`🔊 Lecture son ${soundPlayCountRef.current}/4`);

        await soundRef.current?.setPositionAsync(0);
        await soundRef.current?.playAsync();

        // Écouter la fin de la lecture pour rejouer
        soundRef.current?.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish && isSoundPlayingRef.current) {
            playOnce();
          }
        });
      };

      await playOnce();

    } catch (error) {
      console.error('❌ Erreur lecture son notification:', error);
      isSoundPlayingRef.current = false;
    }
  };

  // Fonction pour arrêter le son
  const stopNotificationSound = async () => {
    try {
      isSoundPlayingRef.current = false;
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      soundPlayCountRef.current = 0;
      console.log('🔇 Son notification arrêté');
    } catch (error) {
      console.error('❌ Erreur arrêt son:', error);
    }
  };

  // Configurer le mode audio au montage
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Jouer même en mode silencieux
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        console.log('🔊 Mode audio configuré');
      } catch (error) {
        console.error('❌ Erreur config audio:', error);
      }
    };
    setupAudio();

    // Cleanup au démontage
    return () => {
      stopNotificationSound();
    };
  }, []);

  // Initialiser les services au chargement
  useEffect(() => {
    const initServices = async () => {
      try {
        // Initialiser le service de statut restaurant
        await restaurantStatusService.initialize();
        console.log('✅ Service de statut restaurant initialisé');

        // Initialiser l'imprimante Bluetooth
        const printerStatus = epsonBluetoothService.getStatus();
        setPrinterConnected(printerStatus.isConnected);

        // Tenter une reconnexion automatique si config sauvegardée
        if (printerStatus.savedConfig && !printerStatus.isConnected) {
          console.log('🖨️ Tentative reconnexion imprimante Bluetooth...');
          const reconnectResult = await epsonBluetoothService.reconnect();
          if (reconnectResult.success) {
            setPrinterConnected(true);
            console.log('✅ Imprimante Bluetooth reconnectée');
          } else {
            console.log('⚠️ Reconnexion imprimante échouée:', reconnectResult.error);
          }
        }

        // await notificationService.initialize();
        console.log('🔔 Notifications désactivées temporairement (focus sur impression)');

      } catch (error) {
        console.error('❌ Erreur initialisation services:', error);
      }
    };

    initServices();

    // Vérifier le statut de l'imprimante périodiquement
    const printerCheckInterval = setInterval(async () => {
      const status = epsonBluetoothService.getStatus();
      setPrinterConnected(status.isConnected);
    }, 10000); // Toutes les 10 secondes

    // Cleanup au démontage
    return () => {
      // notificationService.cleanup();
      restaurantStatusService.cleanup();
      clearInterval(printerCheckInterval);
    };
  }, []);

  // Référence pour tracker les commandes déjà imprimées (persiste pendant la session)
  const printedOrdersRef = useRef<Set<string>>(new Set());
  const isPrintingRef = useRef(false);
  // Tentatives d'impression en échec, pour réessayer sans saturer l'imprimante
  const printAttemptsRef = useRef<Map<string, { attempts: number; at: number }>>(new Map());

  // Charger les commandes déjà imprimées au démarrage
  useEffect(() => {
    const loadPrintedOrders = async () => {
      try {
        const stored = await AsyncStorage.getItem('@printed_orders_today');
        if (stored) {
          const data = JSON.parse(stored);
          // Rattaché à la journée de service (9h) et non au jour calendaire :
          // le service court jusqu'à 01h50, une remise à zéro à minuit faisait
          // réimprimer les tickets des commandes de fin de soirée.
          if (data.serviceDay === getServiceDayKey() && data.orders) {
            printedOrdersRef.current = new Set(data.orders);
            console.log('📋 [AUTO-PRINT] Commandes déjà imprimées chargées:', data.orders.length);
          }
        }
      } catch (error) {
        console.error('Erreur chargement commandes imprimées:', error);
      }
    };
    loadPrintedOrders();
  }, []);

  // Sauvegarder les commandes imprimées
  const savePrintedOrder = async (orderId: string) => {
    printedOrdersRef.current.add(orderId);
    try {
      const data = {
        serviceDay: getServiceDayKey(),
        orders: Array.from(printedOrdersRef.current)
      };
      await AsyncStorage.setItem('@printed_orders_today', JSON.stringify(data));
    } catch (error) {
      console.error('Erreur sauvegarde commande imprimée:', error);
    }
  };

  // Empile un ticket à montrer à l'écran. Une simple variable d'état ne gardait
  // que le dernier : sur plusieurs commandes reçues en même temps, les tickets
  // précédents disparaissaient sans que personne ne les voie.
  const queueTicketPreview = (order: any, autoPrinted: boolean) => {
    setTicketPreviewQueue(prev => {
      if (prev.some(entry => entry.order?.id === order?.id)) return prev;
      return [...prev, { order, autoPrinted }];
    });
  };

  // L'impression a échoué : le ticket ne doit pas disparaître pour autant.
  // On réessaie quelques fois, puis on bascule sur l'affichage à l'écran pour
  // que la cuisine puisse le recopier — jamais de commande perdue en silence.
  const handlePrintFailure = async (order: any, orderForPrint: any, reason?: string) => {
    const previous = printAttemptsRef.current.get(order.id);
    const attempts = (previous?.attempts || 0) + 1;
    printAttemptsRef.current.set(order.id, { attempts, at: Date.now() });

    if (attempts < MAX_PRINT_ATTEMPTS) {
      console.warn(
        `🔁 [AUTO-PRINT] Tentative ${attempts}/${MAX_PRINT_ATTEMPTS} échouée pour #${order.id} (${reason || 'raison inconnue'}), nouvel essai dans ${PRINT_RETRY_DELAY_MS / 1000}s`
      );
      return;
    }

    console.error(`🧾 [AUTO-PRINT] Impression impossible pour #${order.id}, affichage à l'écran`);
    queueTicketPreview(orderForPrint, false);
    setToast(`Impression impossible pour la commande #${order.id} : ticket affiché à l'écran`);

    // Pris en charge à l'écran : on arrête d'essayer, sans quoi la boucle
    // repartirait à chaque snapshot
    await savePrintedOrder(order.id);
  };

  // Met une commande Firestore au format attendu par l'imprimante
  const buildOrderForPrint = (order) => {
    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber || null,
      customerName: order.customerName || order.firstName || 'Client BriveFood',
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
      deliveryFee: order.deliveryFee || 0,
    };
  };

  // Détecter les nouvelles commandes et imprimer automatiquement
  useEffect(() => {
    // Éviter les exécutions multiples simultanées
    if (loading || orders.length === 0 || isPrintingRef.current) {
      return;
    }

    const printNewOrders = async () => {
      // Trouver les nouvelles commandes PENDING non imprimées
      const newOrdersToPrint = orders.filter(order =>
        order.status === OrderStatus.PENDING &&
        !printedOrdersRef.current.has(order.id)
      );

      if (newOrdersToPrint.length === 0) {
        return;
      }

      console.log(`📊 [AUTO-PRINT] ${newOrdersToPrint.length} nouvelle(s) commande(s) à imprimer`);

      // Vérifier si on accepte les commandes
      if (!acceptingOrders) {
        console.log('🔕 [AUTO-PRINT] Commandes arrêtées - pas d\'impression');
        // Marquer quand même comme "vues" pour ne pas réimprimer plus tard
        newOrdersToPrint.forEach(order => savePrintedOrder(order.id));
        return;
      }

      // Bloquer les impressions multiples
      isPrintingRef.current = true;

      try {
        for (const order of newOrdersToPrint) {
          // Double vérification
          if (printedOrdersRef.current.has(order.id)) {
            continue;
          }

          // Une tentative vient d'échouer : on laisse le temps à l'imprimante
          // de revenir (papier, Bluetooth) plutôt que de la solliciter à chaque
          // snapshot Firestore
          const lastAttempt = printAttemptsRef.current.get(order.id);
          if (lastAttempt && Date.now() - lastAttempt.at < PRINT_RETRY_DELAY_MS) {
            continue;
          }

          console.log(`🆕 [AUTO-PRINT] Impression commande #${order.id}`);

          try {
            // Ajouter aux commandes en attente de clic (pour le son)
            pendingNewOrdersRef.current.add(order.id);

            // Jouer le son de notification (4 fois en boucle)
            playNotificationSound();

            // Vibration
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (alertError) {
            // Le son ou le retour haptique ne doivent jamais empêcher l'impression
            console.warn('⚠️ [AUTO-PRINT] Alerte sonore indisponible:', alertError);
          }

          try {
            const orderForPrint = buildOrderForPrint(order);

            console.log(`📞 [AUTO-PRINT] Téléphone client: "${orderForPrint.phone}" (order.phone="${order.phone}", order.phoneNumber="${order.phoneNumber}")`);

            const printerStatus = epsonBluetoothService.getStatus();

            const hasPhysicalPrinter =
              printerStatus.autoPrintEnabled &&
              (printerStatus.isConnected || printerStatus.savedConfig);

            if (hasPhysicalPrinter) {
              const printResult = await epsonBluetoothService.printOrder(orderForPrint);

              if (printResult.success) {
                console.log(`✅ [AUTO-PRINT] Ticket imprimé pour #${order.id}`);
                setPrinterConnected(true);
                // Marqué imprimée SEULEMENT maintenant : posé avant l'impression,
                // ce drapeau condamnait le ticket dès que l'imprimante refusait
                await savePrintedOrder(order.id);
                printAttemptsRef.current.delete(order.id);
              } else {
                console.warn(`⚠️ [AUTO-PRINT] Échec: ${printResult.error}`);
                setPrinterConnected(false);
                await handlePrintFailure(order, orderForPrint, printResult.error);
              }
            } else if (IS_SIMULATOR) {
              // Pas d'imprimante sur simulateur : le ticket sort à l'écran
              console.log(`🧾 [AUTO-PRINT] Simulateur — aperçu du ticket #${order.id}`);
              queueTicketPreview(orderForPrint, true);
              await savePrintedOrder(order.id);
            } else {
              console.warn('⚠️ [AUTO-PRINT] Imprimante non configurée');
              await handlePrintFailure(order, orderForPrint, 'imprimante non configurée');
            }

          } catch (printError) {
            console.error(`❌ [AUTO-PRINT] Erreur pour #${order.id}:`, printError);
            await handlePrintFailure(order, buildOrderForPrint(order), (printError as any)?.message);
          }

          // Petit délai entre les impressions
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } finally {
        // Sans ce finally, une exception laissait le verrou posé et
        // l'impression automatique restait morte jusqu'au redémarrage
        isPrintingRef.current = false;
      }
    };

    printNewOrders();
  }, [orders, loading, acceptingOrders]);

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


  // Commandes de la journée de service en cours uniquement : celles de la
  // veille (déjà closes par l'auto-complétion à 1h) doivent se retrouver dans
  // les archives, pas s'accumuler ici avec celles du jour.
  const getTodayServiceDayOrders = () => {
    const currentServiceDay = getServiceDayKey();
    return orders.filter((order: any) => {
      const orderServiceDay = order.serviceDay
        || getServiceDayKey(order.createdAt ? new Date(order.createdAt) : new Date());
      return orderServiceDay === currentServiceDay;
    });
  };

  // Filtrer les commandes selon le statut sélectionné
  const getFilteredOrders = () => {
    const todayOrders = getTodayServiceDayOrders();
    if (selectedFilter === 'all') {
      return todayOrders;
    }
    return todayOrders.filter((order: any) => order.status === selectedFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Obtenir le nombre de commandes par statut pour les badges
  const getStatusCount = (status: string) => {
    const todayOrders = getTodayServiceDayOrders();
    if (status === 'all') return todayOrders.length;
    return todayOrders.filter((order: any) => order.status === status).length;
  };

  // Fonction pour ouvrir le menu de changement de statut
  const openStatusMenu = (order: any) => {
    setSelectedOrder(order);
    setShowStatusMenu(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Retirer cette commande des commandes en attente et arrêter le son
    if (pendingNewOrdersRef.current.has(order.id)) {
      pendingNewOrdersRef.current.delete(order.id);
      // Si plus aucune commande en attente, arrêter le son
      if (pendingNewOrdersRef.current.size === 0) {
        stopNotificationSound();
      }
    }
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
      const success = await updateOrderStatus(selectedOrder.id, newStatus, {
        manualStatusChange: true, // Indiquer que c'est un changement manuel
        triggerRating: newStatus === OrderStatus.DELIVERED || newStatus === OrderStatus.READY
      });

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

  // Fonction pour supprimer toutes les commandes affichées
  const deleteAllDisplayedOrders = () => {
    const ordersToDelete = filteredOrders;

    if (ordersToDelete.length === 0) {
      Alert.alert('Aucune commande', 'Il n\'y a aucune commande à supprimer.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Supprimer toutes les commandes',
      `Êtes-vous sûr de vouloir supprimer ${ordersToDelete.length} commande(s) ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            let deletedCount = 0;
            let errorCount = 0;

            for (const order of ordersToDelete) {
              try {
                const result = await deleteOrder(order.id);
                if (result.success) {
                  deletedCount++;
                } else {
                  errorCount++;
                }
              } catch (error) {
                console.error(`Erreur suppression commande ${order.id}:`, error);
                errorCount++;
              }
            }

            if (errorCount === 0) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Succès', `${deletedCount} commande(s) supprimée(s).`);
            } else {
              Alert.alert(
                'Terminé',
                `${deletedCount} commande(s) supprimée(s).\n${errorCount} erreur(s).`
              );
            }
          }
        }
      ]
    );
  };

  // Obtenir le statut suivant pour le swipe
  const getNextStatus = (currentStatus: string, orderMode: string) => {
    const statusOrder = orderMode === OrderMode.DELIVERY
      ? [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED]
      : [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERED];

    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  // Obtenir le statut précédent pour le swipe
  const getPreviousStatus = (currentStatus: string, orderMode: string) => {
    const statusOrder = orderMode === OrderMode.DELIVERY
      ? [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED]
      : [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERED];

    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      return statusOrder[currentIndex - 1];
    }
    return null;
  };

  // Changer le statut via swipe (sans modal)
  const handleSwipeStatusChange = async (order: any, newStatus: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const success = await updateOrderStatus(order.id, newStatus, {
        manualStatusChange: true,
        triggerRating: newStatus === OrderStatus.DELIVERED || newStatus === OrderStatus.READY
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', 'Impossible de mettre à jour la commande.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Rendu de l'action swipe droite (statut suivant)
  const renderRightActions = (order: any, progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const nextStatus = getNextStatus(order.status, order.mode);
    if (!nextStatus) return null;

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[
        styles.swipeAction,
        styles.swipeActionRight,
        {
          opacity,
          transform: [{ scale }]
        }
      ]}>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: getStatusColor(nextStatus) }]}
          onPress={() => handleSwipeStatusChange(order, nextStatus)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-forward-circle" size={28} color="white" />
          <Text style={styles.swipeButtonText}>{getStatusLabel(nextStatus, order.mode)}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Rendu de l'action swipe gauche (statut précédent)
  const renderLeftActions = (order: any, progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const prevStatus = getPreviousStatus(order.status, order.mode);
    if (!prevStatus) return null;

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[
        styles.swipeAction,
        styles.swipeActionLeft,
        {
          opacity,
          transform: [{ scale }]
        }
      ]}>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: getStatusColor(prevStatus) }]}
          onPress={() => handleSwipeStatusChange(order, prevStatus)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back-circle" size={28} color="white" />
          <Text style={styles.swipeButtonText}>{getStatusLabel(prevStatus, order.mode)}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
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
          <Text style={styles.emptyStateTitle}>
            {selectedFilter === 'all'
              ? "Aucune commande aujourd'hui"
              : `Aucune commande ${getStatusLabel(selectedFilter, null)}`}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedFilter === 'all'
              ? 'Les commandes des jours précédents sont dans les archives'
              : 'Aucune commande ne correspond au filtre sélectionné'}
          </Text>
        </View>
      );
    }

    return filteredOrders.map((order: any, index: number) => renderOrderCard(order, index));
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


  // Refs pour les swipeables
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Contenu de la carte de commande (réutilisé avec ou sans Swipeable)
  // Impression depuis la carte : imprimante si disponible, sinon ticket à l'écran.
  // Même repli que l'impression automatique, pour rester utilisable sur simulateur.
  const handlePrintFromCard = async (order: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const orderForPrint = buildOrderForPrint(order);

    try {
      const printerStatus = epsonBluetoothService.getStatus();

      if (printerStatus.isConnected || printerStatus.savedConfig) {
        const printResult = await epsonBluetoothService.printOrder(orderForPrint);

        if (printResult.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPrinterConnected(true);
          setToast(`Ticket #${getOrderDisplayNumber(order)} imprimé`);
          return;
        }

        setPrinterConnected(false);
        console.warn('⚠️ Impression refusée par l\'imprimante:', printResult.error);
      }
    } catch (error) {
      console.error('❌ Erreur impression manuelle:', error);
    }

    queueTicketPreview(orderForPrint, false);
  };

  // Temps écoulé depuis la prise de commande, façon « 6min 12 »
  const getElapsedLabel = (order: any) => {
    if (!order?.createdAt) return null;

    const createdAt = new Date(order.createdAt).getTime();
    if (isNaN(createdAt)) return null;

    const totalSeconds = Math.floor((now - createdAt) / 1000);
    if (totalSeconds < 0) return null;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes < 60) {
      return `${minutes}min ${seconds.toString().padStart(2, '0')}`;
    }
    return `${Math.floor(minutes / 60)}h ${(minutes % 60).toString().padStart(2, '0')}min`;
  };

  const getAlertReasonLabel = (reason: string) => {
    if (reason === 'no_show') return "N'est pas venu chercher sa dernière commande";
    if (reason === 'no_answer') return "N'a pas répondu à sa dernière commande";
    return 'Client signalé';
  };

  // Nombre de commandes déjà passées par ce client, identifié par son téléphone
  const getCustomerOrderCount = (order: any) => {
    const phone = (order?.phone || order?.phoneNumber || '').replace(/\s/g, '');
    if (!phone) return 0;

    return (orders || []).filter((other: any) =>
      (other.phone || other.phoneNumber || '').replace(/\s/g, '') === phone
    ).length;
  };

  // Détail des personnalisations, une ligne par option pour rester lisible
  // en cuisine (une chaîne unique tronquee faisait perdre des sauces)
  const getItemOptionLines = (item: any) => {
    const lines: string[] = [];

    if (item.options) {
      item.options.split(' | ').forEach((opt: string) => {
        const clean = opt.trim();
        if (clean) lines.push(clean);
      });
    }

    if (item.customizations && item.customizationOptions) {
      Object.entries(item.customizations).forEach(([key, value]: [string, any]) => {
        const catOpts = item.customizationOptions?.[key];
        const title = catOpts?.title || key;
        const vals = Array.isArray(value) ? value : [value];
        vals.forEach((v: any) => {
          const opt = catOpts?.options?.find((o: any) => o.id === v);
          const label = opt ? `${title}: ${opt.name}` : `${title}: ${v}`;
          if (!lines.some(l => l === label || (opt && l.includes(opt.name)))) {
            lines.push(label);
          }
        });
      });
    } else if (item.customizations) {
      Object.entries(item.customizations).forEach(([key, value]: [string, any]) => {
        const vals = Array.isArray(value) ? value : [value];
        vals.forEach((v: any) => lines.push(`${key}: ${v}`));
      });
    }

    return lines;
  };

  const getCustomerDisplayName = (order: any) => {
    if (order.customerName && order.customerName !== 'Client' && order.customerName !== 'Client BriveFood') {
      return order.customerName;
    }
    if (order.firstName && order.lastName) return `${order.firstName} ${order.lastName}`;
    return order.firstName || order.lastName || 'Client BriveFood';
  };

  const renderOrderCardContent = (order: any) => {
    const itemCount = order.items?.length || 0;
    const repeatCount = getCustomerOrderCount(order);
    const customerAlert = getActiveAlertForOrder(order);

    return (
      <TouchableOpacity
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
        activeOpacity={0.9}
      >
        {/* Ligne 1 : identite de la commande et statut */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardIdentity}>
            <Text style={styles.cardOrderId}>#{getOrderDisplayNumber(order)}</Text>
            <View style={styles.cardTimeRow}>
              <Text style={styles.cardTime}>{order.orderTime}</Text>
              {!!getElapsedLabel(order) && (
                <>
                  <Text style={styles.cardTimeSeparator}>·</Text>
                  <Ionicons name="time-outline" size={12} color="#2563EB" />
                  <Text style={styles.cardElapsed}>{getElapsedLabel(order)}</Text>
                </>
              )}
            </View>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(order.status)}15` }
          ]}>
            <View style={[
              styles.orderStatusDot,
              { backgroundColor: getStatusColor(order.status) }
            ]} />
            <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status, order.mode)}
            </Text>
          </View>
        </View>

        {!!customerAlert && (
          <View style={styles.customerAlertRow}>
            <Ionicons name="warning" size={14} color="#DC2626" />
            <Text style={styles.customerAlertRowText} numberOfLines={1}>
              {getAlertReasonLabel(customerAlert.reason)}
            </Text>
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Ligne 2 : mode, client, contact */}
        <View style={styles.cardMetaBlock}>
          <View style={styles.cardMetaRow}>
            <Ionicons name={getModeIcon(order.mode)} size={16} color={colors.neutral.gray500} />
            <Text style={styles.cardMode}>{getModeLabel(order.mode)}</Text>
          </View>

          <View style={styles.cardMetaRow}>
            <Ionicons name="person-outline" size={16} color={colors.neutral.gray500} />
            <Text style={styles.cardCustomer} numberOfLines={1}>
              {getCustomerDisplayName(order)}
            </Text>
            {repeatCount > 1 && (
              <View style={styles.loyalBadge}>
                <Text style={styles.loyalBadgeText}>{repeatCount}e</Text>
              </View>
            )}
          </View>

          <View style={styles.cardMetaRow}>
            <Ionicons name="call-outline" size={16} color={colors.neutral.gray500} />
            <Text style={styles.cardPhone}>{order.phone || 'Non renseigné'}</Text>
          </View>

          {order.mode === 'DELIVERY' && (
            <View style={styles.cardMetaRow}>
              <Ionicons name="location-outline" size={16} color={colors.neutral.gray500} />
              <Text style={styles.cardAddress} numberOfLines={2}>
                {order.address || 'Adresse non renseignée'}
              </Text>
            </View>
          )}
        </View>

        {/* Ligne 3 : articles avec leurs personnalisations */}
        {itemCount > 0 && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.cardItemsBlock}>
              <Text style={styles.cardItemsCount}>
                {itemCount} article{itemCount > 1 ? 's' : ''}
              </Text>

              {order.items.slice(0, 3).map((item: any, index: number) => (
                <View key={index} style={styles.cardItem}>
                  <ProductImage
                    product={{
                      name: item.name,
                      id: item.id || item.productId,
                      imageKey: item.imageKey
                    }}
                    style={styles.cardItemImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cardItemBody}>
                    <View style={styles.cardItemHeader}>
                      <Text style={styles.cardItemQty}>{item.quantity}x</Text>
                      <Text style={styles.cardItemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.cardItemPrice}>
                        {(item.price * item.quantity).toFixed(2)}€
                      </Text>
                    </View>

                    {getItemOptionLines(item).map((line, i) => (
                      <Text key={i} style={styles.cardItemOption}>· {line}</Text>
                    ))}

                    {!!item.comment && (
                      <Text style={styles.cardItemNote}>Note : {item.comment}</Text>
                    )}
                  </View>
                </View>
              ))}

              {itemCount > 3 && (
                <Text style={styles.cardMoreItems}>
                  +{itemCount - 3} autre{itemCount - 3 > 1 ? 's' : ''} article{itemCount - 3 > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Ligne 4 : total */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterLabel}>Total</Text>
          <Text style={styles.cardFooterTotal}>{order.total.toFixed(2)} €</Text>
        </View>

        {/* Ligne 5 : actions. Le statut avance seul, ces boutons servent à
            reprendre la main ponctuellement sur une commande. */}
        {(() => {
          const prevStatus = getPreviousStatus(order.status, order.mode);
          const nextStatus = getNextStatus(order.status, order.mode);

          return (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.cardActionIcon}
                onPress={() => handlePrintFromCard(order)}
                accessibilityLabel="Imprimer le ticket"
              >
                <Ionicons name="print-outline" size={18} color={colors.neutral.gray700} />
              </TouchableOpacity>

              {!!prevStatus && (
                <TouchableOpacity
                  style={styles.cardActionSecondary}
                  onPress={() => handleSwipeStatusChange(order, prevStatus)}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.neutral.gray700} />
                  <Text style={styles.cardActionSecondaryText} numberOfLines={1}>
                    {getStatusLabel(prevStatus, order.mode)}
                  </Text>
                </TouchableOpacity>
              )}

              {!!nextStatus && (
                <TouchableOpacity
                  style={styles.cardActionPrimary}
                  onPress={() => handleSwipeStatusChange(order, nextStatus)}
                >
                  <Text style={styles.cardActionPrimaryText} numberOfLines={1}>
                    {getStatusLabel(nextStatus, order.mode)}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>
          );
        })()}

        {/* Commande recente */}
        {(() => {
          const diffMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
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
  };

  // Fonction principale de rendu des cartes - désactive Swipeable sur tablette
  const renderOrderCard = (order: any, index: number) => {
    // Utiliser une clé unique combinant l'ID et l'index pour éviter les doublons
    const uniqueKey = `${order.id}-${index}`;

    // Sur tablette, pas de Swipeable pour éviter les conflits de scroll
    if (isTabletDevice) {
      return (
        <View key={uniqueKey} style={styles.swipeableContainer}>
          {renderOrderCardContent(order)}
        </View>
      );
    }

    // Sur mobile, utiliser Swipeable
    return (
      <Swipeable
        ref={(ref) => { swipeableRefs.current[order.id] = ref; }}
        key={uniqueKey}
        renderRightActions={(progress, dragX) => renderRightActions(order, progress, dragX)}
        renderLeftActions={(progress, dragX) => renderLeftActions(order, progress, dragX)}
        onSwipeableWillOpen={(direction) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onSwipeableOpen={(direction) => {
          setTimeout(() => {
            swipeableRefs.current[order.id]?.close();
          }, 100);

          if (direction === 'right') {
            const nextStatus = getNextStatus(order.status, order.mode);
            if (nextStatus) handleSwipeStatusChange(order, nextStatus);
          } else if (direction === 'left') {
            const prevStatus = getPreviousStatus(order.status, order.mode);
            if (prevStatus) handleSwipeStatusChange(order, prevStatus);
          }
        }}
        overshootLeft={false}
        overshootRight={false}
        overshootFriction={8}
        friction={1.5}
        leftThreshold={80}
        rightThreshold={80}
        containerStyle={styles.swipeableContainer}
      >
        {renderOrderCardContent(order)}
      </Swipeable>
    );
  };

  // Sur tablette, pas de wrapper gesture - sur mobile, GestureHandlerRootView
  if (isTabletDevice) {
    return (
      <View style={{ flex: 1 }} pointerEvents="auto">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Commandes</Text>
            <Text style={[styles.headerSubtitle, { color: colors.neutral.gray300 }]}>
              Gestion des commandes
            </Text>
          </View>
          <View style={styles.headerActions}>
            {/* Indicateur imprimante */}
            <TouchableOpacity
              style={styles.printerIndicator}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(admin)/printer-setup');
              }}
            >
              <Ionicons
                name="print"
                size={16}
                color={printerConnected ? '#22C55E' : '#ef4444'}
              />
              <View style={[styles.printerDot, {
                backgroundColor: printerConnected ? '#22C55E' : '#ef4444'
              }]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={deleteAllDisplayedOrders}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
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
          scrollEnabled={true}
          bounces={true}
          alwaysBounceVertical={true}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >

          {/* Restaurant Status Control */}
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
            ]}>
              Statut du restaurant
            </Text>
            <RestaurantStatusControl />
          </View>

          {/* Status Filters */}
          {renderStatusFilters()}

          {/* Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={[
                styles.sectionTitle,
                isTabletDevice && isLandscapeMode && styles.sectionTitleTablet
              ]}>Commandes en cours</Text>
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
                          Commande #{getOrderDisplayNumber(selectedOrder)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Revoir le ticket tel qu'il sort de l'imprimante */}
                  <TouchableOpacity
                    style={styles.viewTicketButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowStatusMenu(false);
                      queueTicketPreview(buildOrderForPrint(selectedOrder), false);
                    }}
                  >
                    <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewTicketButtonText}>Voir le ticket</Text>
                  </TouchableOpacity>

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
      </View>
    );
  }

  // Version mobile avec GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Commandes</Text>
            <Text style={[styles.headerSubtitle, { color: colors.neutral.gray300 }]}>
              Gestion des commandes
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.printerIndicator}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(admin)/printer-setup');
              }}
            >
              <Ionicons
                name="print"
                size={16}
                color={printerConnected ? '#22C55E' : '#ef4444'}
              />
              <View style={[styles.printerDot, {
                backgroundColor: printerConnected ? '#22C55E' : '#ef4444'
              }]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={deleteAllDisplayedOrders}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
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
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statut du restaurant</Text>
            <RestaurantStatusControl />
          </View>

          {renderStatusFilters()}

          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Commandes en cours</Text>
              {!acceptingOrders && (
                <View style={styles.orderStoppedIndicator}>
                  <Ionicons name="pause-circle" size={16} color="#f59e0b" />
                  <Text style={styles.orderStoppedText}>Nouvelles commandes arrêtées</Text>
                </View>
              )}
            </View>

            <View style={styles.ordersContainer}>
              {renderOrdersContent()}
            </View>
          </View>

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
            <View style={styles.statusMenuContainer}>
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
                    style={styles.statusMenu}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                  <View style={styles.statusMenuHeader}>
                    <View style={styles.statusMenuHeaderRow}>
                      <View style={styles.statusMenuIconContainer}>
                        <LinearGradient
                          colors={['#FF6B35', '#FF8E53', '#FFB366']}
                          style={styles.statusMenuIcon}
                        >
                          <Ionicons name="swap-horizontal" size={24} color="white" />
                        </LinearGradient>
                      </View>
                      <View style={styles.statusMenuTitleContainer}>
                        <Text style={styles.statusMenuTitle}>Changer le statut</Text>
                        <Text style={styles.statusMenuSubtitle}>
                          Commande #{getOrderDisplayNumber(selectedOrder)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Revoir le ticket tel qu'il sort de l'imprimante */}
                  <TouchableOpacity
                    style={styles.viewTicketButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowStatusMenu(false);
                      queueTicketPreview(buildOrderForPrint(selectedOrder), false);
                    }}
                  >
                    <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewTicketButtonText}>Voir le ticket</Text>
                  </TouchableOpacity>

                  <View style={styles.statusOptionsContainer}>
                    {selectedOrder && (() => {
                      const availableStatuses = getAvailableStatuses(selectedOrder.status, selectedOrder.mode);
                      const rows = [];

                      for (let i = 0; i < availableStatuses.length; i += 2) {
                        const leftStatus = availableStatuses[i];
                        const rightStatus = availableStatuses[i + 1];

                        rows.push(
                          <View key={`row-${i}`} style={styles.statusOptionsRow}>
                            <TouchableOpacity
                              style={[styles.statusOption, styles.statusOptionHalf]}
                              onPress={() => changeOrderStatus(leftStatus.key)}
                              activeOpacity={0.85}
                            >
                              <LinearGradient
                                colors={[
                                  `${getStatusColor(leftStatus.key)}20`,
                                  `${getStatusColor(leftStatus.key)}10`,
                                  `${getStatusColor(leftStatus.key)}05`
                                ]}
                                style={[styles.statusOptionGradient, styles.statusOptionGradientHalf]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                              >
                                <View style={styles.statusOptionContentCompact}>
                                  <LinearGradient
                                    colors={[
                                      `${getStatusColor(leftStatus.key)}40`,
                                      `${getStatusColor(leftStatus.key)}30`
                                    ]}
                                    style={styles.statusIconContainerCompact}
                                  >
                                    <Ionicons
                                      name={leftStatus.icon as any}
                                      size={16}
                                      color={getStatusColor(leftStatus.key)}
                                    />
                                  </LinearGradient>
                                  <View style={styles.statusTextContainerCompact}>
                                    <Text style={[
                                      styles.statusOptionTextCompact,
                                      { color: getStatusColor(leftStatus.key) }
                                    ]}>
                                      {leftStatus.label}
                                    </Text>
                                  </View>
                                </View>
                              </LinearGradient>
                            </TouchableOpacity>

                            {rightStatus && (
                              <TouchableOpacity
                                style={[styles.statusOption, styles.statusOptionHalf]}
                                onPress={() => changeOrderStatus(rightStatus.key)}
                                activeOpacity={0.85}
                              >
                                <LinearGradient
                                  colors={[
                                    `${getStatusColor(rightStatus.key)}20`,
                                    `${getStatusColor(rightStatus.key)}10`,
                                    `${getStatusColor(rightStatus.key)}05`
                                  ]}
                                  style={[styles.statusOptionGradient, styles.statusOptionGradientHalf]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                >
                                  <View style={styles.statusOptionContentCompact}>
                                    <LinearGradient
                                      colors={[
                                        `${getStatusColor(rightStatus.key)}40`,
                                        `${getStatusColor(rightStatus.key)}30`
                                      ]}
                                      style={styles.statusIconContainerCompact}
                                    >
                                      <Ionicons
                                        name={rightStatus.icon as any}
                                        size={16}
                                        color={getStatusColor(rightStatus.key)}
                                      />
                                    </LinearGradient>
                                    <View style={styles.statusTextContainerCompact}>
                                      <Text style={[
                                        styles.statusOptionTextCompact,
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

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeStatusMenu}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2d1a1a', '#1a0000', '#0d0000']}
                      style={styles.cancelButtonGradient}
                    >
                      <View style={styles.cancelIconContainer}>
                        <Ionicons name="close" size={18} color="#ff6b6b" />
                      </View>
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Ticket de caisse affiché à l'écran (simulateur ou consultation) */}
        <PrintTicketPreview
          visible={!!currentTicketPreview}
          order={currentTicketPreview?.order || null}
          autoPrinted={currentTicketPreview?.autoPrinted || false}
          // Défile la file : le ticket suivant s'affiche aussitôt
          onClose={() => setTicketPreviewQueue(prev => prev.slice(1))}
        />

        <Toast
          visible={!!toast}
          message={toast}
          onHide={() => setToast(null)}
        />

      </LinearGradient>
    </GestureHandlerRootView>
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
  deleteAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  printerIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  printerDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
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
  // ── Carte commande (admin) ──
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardIdentity: {
    flex: 1,
  },
  cardOrderId: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
    letterSpacing: 0.5,
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardTime: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  cardTimeSeparator: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray400,
  },
  cardElapsed: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#2563EB',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
    marginVertical: spacing.md,
  },
  customerAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
  },
  customerAlertRowText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#991B1B',
  },
  cardMetaBlock: {
    gap: spacing.sm,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMode: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  cardCustomer: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  loyalBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  loyalBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#EA580C',
  },
  cardPhone: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  cardAddress: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },

  // Articles
  cardItemsBlock: {
    gap: spacing.md,
  },
  cardItemsCount: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardItemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
  },
  cardItemBody: {
    flex: 1,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  cardItemQty: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  cardItemName: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000000',
  },
  cardItemPrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
  },
  cardItemOption: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    lineHeight: 19,
    marginTop: 1,
  },
  cardItemNote: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#B45309',
    marginTop: 3,
  },
  cardMoreItems: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray500,
  },

  // Pied de carte
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  // Bouton icône seule : largeur fixe, pour laisser la place aux libellés de statut
  cardActionIcon: {
    width: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  cardActionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  cardActionSecondaryText: {
    flexShrink: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  cardActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.black,
  },
  cardActionPrimaryText: {
    flexShrink: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  cardFooterLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray500,
  },
  cardFooterTotal: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
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
  orderStatusColumn: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  elapsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  elapsedBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#2563EB',
  },
  customerOrdersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF1E7',
  },
  customerOrdersBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#EA580C',
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
  orderAddress: {
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
  orderItemsContainer: {
    marginTop: spacing.xs,
  },
  orderItemsList: {
    marginTop: spacing.xs,
  },
  orderItemWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderItemImage: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.neutral.gray100,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
  },
  orderItemNameTablet: {
    fontSize: typography.fontSizes.base,
  },
  orderItemQuantity: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
  },
  orderItemOptions: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary.main,
    fontStyle: 'italic',
    marginTop: 2,
  },
  moreItemsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
    marginTop: spacing.xs,
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
  viewTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewTicketButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#FFFFFF',
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

  // Styles pour le swipe
  swipeableContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'visible',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  swipeActionRight: {
    alignItems: 'flex-start',
    paddingLeft: spacing.xs,
    marginLeft: -spacing.xs,
  },
  swipeActionLeft: {
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
    marginRight: -spacing.xs,
  },
  swipeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: borderRadius.lg,
    marginVertical: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  swipeButtonText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
});