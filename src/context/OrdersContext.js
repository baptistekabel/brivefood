import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  increment,
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { getServiceDayKey } from '../utils/serviceDay';
import { db } from '../../config/firebase';
import { OrderStatus, OrderMode } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customerNotificationService from '../services/customerNotificationService';
import printerService from '../services/PrinterService';
import { useAuth } from './AuthContext';
import { useAdminAuth } from './AdminAuthContext';

const OrdersContext = createContext();

// Commandes suivies pour un client non connecté (commande invité). Firestore
// plafonne l'opérateur `in` à 30 valeurs.
const GUEST_ORDERS_LIMIT = 10;

// Attribution du numéro de commande : on insiste avant d'abandonner, un repli
// prive la commande de son numéro du jour
const COUNTER_MAX_ATTEMPTS = 3;
const COUNTER_RETRY_DELAY_MS = 400;

// Barème de fidélité : 1 € dépensé = 10 points (voir LoyaltyContext)
const POINTS_PER_EURO = 10;

// Points rapportés par une commande. Les frais de livraison en font partie,
// comme c'était le cas avec l'ancien calcul basé sur le total.
const getOrderPoints = (order) =>
  Math.max(0, Math.round((parseFloat(order?.total) || 0) * POINTS_PER_EURO));

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Commandes passées sans compte, suivies le temps de leur préparation
  const [guestOrderIds, setGuestOrderIds] = useState([]);
  // Alertes client actives (n'a pas répondu / n'est pas venu chercher sa
  // commande), affichées dès que ce numéro repasse commande
  const [customerAlerts, setCustomerAlerts] = useState([]);

  const { user } = useAuth();
  const { userType } = useAdminAuth();

  // La cuisine et les livreurs ont besoin de toutes les commandes ; un client
  // n'a besoin que des siennes.
  const isStaff = userType === 'admin' || userType === 'delivery';

  // Référence vers la collection orders dans Firestore
  const ordersCollection = collection(db, 'orders');
  const customerAlertsCollection = collection(db, 'customerAlerts');

  // Écoute des alertes client actives : réservé au staff, comme pour les
  // commandes, pour ne pas faire télécharger cet historique à chaque client.
  useEffect(() => {
    if (!isStaff) {
      setCustomerAlerts([]);
      return;
    }

    const unsubscribe = onSnapshot(
      query(customerAlertsCollection, where('resolved', '==', false)),
      (snapshot) => {
        setCustomerAlerts(snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() })));
      },
      (error) => console.error('❌ Erreur écoute alertes clients:', error)
    );

    return unsubscribe;
  }, [isStaff]);

  // Même normalisation que getCustomerOrderCount (dashboard) : on ne fait que
  // retirer les espaces, pour matcher exactement la façon dont les numéros
  // sont déjà comparés ailleurs dans l'app.
  const normalizePhone = (phone) => String(phone || '').replace(/\s/g, '');
  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

  // Alerte active la plus récente pour le client d'une commande, s'il y en a une.
  // Le mail est l'identifiant principal (stable, lié au compte) — un même
  // client peut se tromper ou changer de numéro de téléphone d'une commande à
  // l'autre. Le téléphone reste un repli pour les commandes invité sans compte.
  const getActiveAlertForOrder = (order) => {
    const email = normalizeEmail(order?.customerEmail);
    const phone = normalizePhone(order?.phone || order?.phoneNumber);
    if (!email && !phone) return null;

    const matches = customerAlerts.filter(a => {
      if (email && normalizeEmail(a.email) === email) return true;
      if (phone && normalizePhone(a.phone) === phone) return true;
      return false;
    });
    if (matches.length === 0) return null;

    return matches.sort(
      (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
    )[0];
  };

  // Signale un client sur une commande : n'a pas répondu, ou n'est pas venu
  // chercher sa commande. Réapparaît dès sa prochaine commande (même mail, ou
  // à défaut même téléphone pour un client sans compte).
  const flagCustomerAlert = async (order, reason, note = '') => {
    const email = normalizeEmail(order?.customerEmail);
    const phone = normalizePhone(order?.phone || order?.phoneNumber);
    if (!email && !phone) {
      return { success: false, error: 'Commande sans email ni numéro de téléphone' };
    }

    try {
      await addDoc(customerAlertsCollection, {
        email: email || null,
        phone: phone || null,
        customerName: order.customerName || 'Client',
        userId: order.userId || null,
        reason, // 'no_answer' | 'no_show' | 'other'
        note: note || '',
        orderId: order.id,
        orderNumber: order.orderNumber || null,
        resolved: false,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur création alerte client:', error);
      return { success: false, error: error.message };
    }
  };

  // Marque l'alerte comme traitée : elle ne réapparaîtra plus sur les
  // prochaines commandes de ce client.
  const resolveCustomerAlert = async (alertFirestoreId) => {
    try {
      await updateDoc(doc(db, 'customerAlerts', alertFirestoreId), {
        resolved: true,
        resolvedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur résolution alerte client:', error);
      return { success: false, error: error.message };
    }
  };

  // Une commande invité n'a pas de userId : on retient son identifiant pour
  // continuer à suivre son avancement après un redémarrage de l'application.
  useEffect(() => {
    if (user) return;

    let cancelled = false;

    AsyncStorage.getItem('@activeOrder')
      .then(stored => {
        if (cancelled || !stored) return;
        const activeOrder = JSON.parse(stored);
        if (!activeOrder?.id) return;

        setGuestOrderIds(prev =>
          prev.includes(activeOrder.id) ? prev : [...prev, activeOrder.id]
        );
      })
      .catch(error => console.warn('⚠️ Lecture de la commande invité impossible:', error.message));

    return () => { cancelled = true; };
  }, [user]);

  // Écouter les changements en temps réel depuis Firestore.
  //
  // L'écoute portait sur la collection entière, sans filtre ni limite, et le
  // provider est monté pour tout le monde : chaque téléphone client téléchargeait
  // et gardait en mémoire l'historique complet du restaurant — coordonnées des
  // autres clients incluses — et payait une lecture par document à chaque
  // ouverture. On restreint donc la requête au périmètre réellement utile.
  useEffect(() => {
    const trackedGuestIds = guestOrderIds.slice(-GUEST_ORDERS_LIMIT);

    // Aucune requête ne combine `where` et `orderBy` : ce serait un index
    // composite à déployer (firestore.indexes.json est vide). Le tri se fait
    // donc côté application, sur un volume réduit.
    const queries = [];

    if (isStaff) {
      // Historique complet : les archives et les statistiques en ont besoin, et
      // il ne s'agit que des postes du restaurant, pas de chaque téléphone client
      queries.push({
        key: 'staff',
        ref: query(ordersCollection, orderBy('id', 'desc')),
      });
    } else if (user) {
      // Pas de `limit()` ici : sans `orderBy`, Firestore renverrait N documents
      // arbitraires et pourrait masquer la commande en cours. Un `orderBy`
      // combiné à ce `where` exigerait un index composite, et un client n'a de
      // toute façon qu'une poignée de commandes.
      queries.push({
        key: 'own-uid',
        ref: query(ordersCollection, where('userId', '==', user.uid)),
      });
      // Repli pour les commandes antérieures à l'enregistrement du userId
      if (user.email) {
        queries.push({
          key: 'own-email',
          ref: query(ordersCollection, where('customerEmail', '==', user.email)),
        });
      }
    } else if (trackedGuestIds.length > 0) {
      queries.push({
        key: 'guest',
        ref: query(ordersCollection, where('id', 'in', trackedGuestIds)),
      });
    }

    if (queries.length === 0) {
      console.log('ℹ️ Aucune commande à écouter pour cette session');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('=== SETTING UP FIRESTORE LISTENER ===', queries.map(q => q.key).join(', '));

    // Résultats par requête, fusionnés à chaque snapshot
    const resultsByQuery = new Map();
    const pending = new Set(queries.map(q => q.key));

    const publish = () => {
      const merged = new Map();
      resultsByQuery.forEach(list => {
        list.forEach(order => merged.set(order.firestoreId, order));
      });

      // Tri décroissant sur l'identifiant : il est immuable, donc une commande
      // ne change jamais de place — ce que l'ancien suivi de positions
      // cherchait à garantir à la main.
      const sorted = [...merged.values()].sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      });

      console.log('✅ Orders from Firestore:', sorted.length);
      setOrders(sorted);
    };

    const unsubscribes = queries.map(({ key, ref }) =>
      onSnapshot(
        ref,
        (querySnapshot) => {
          const firestoreOrders = [];
          querySnapshot.forEach((document) => {
            const orderData = document.data();
            firestoreOrders.push({
              ...orderData,
              firestoreId: document.id, // Garder l'ID Firestore
              createdAt: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt
            });
          });

          resultsByQuery.set(key, firestoreOrders);
          publish();

          // Chargement terminé quand chaque requête a répondu au moins une fois
          pending.delete(key);
          if (pending.size === 0) setLoading(false);
        },
        (error) => {
          console.error(`❌ Firestore listener error (${key}):`, error);
          resultsByQuery.set(key, []);
          publish();
          pending.delete(key);
          if (pending.size === 0) setLoading(false);
        }
      )
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Firestore listeners');
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [isStaff, user?.uid, user?.email, guestOrderIds]);

  // Plus besoin de saveOrders - Firestore se synchronise automatiquement

  // Plus besoin de debugAsyncStorageOrders - utilisation directe de Firestore

  // Vérifier et auto-compléter les commandes de plus d'une heure.
  //
  // Réservé à la cuisine : exécuté par tous les porteurs du contexte, ce balayage
  // faisait clôturer par les téléphones des clients des commandes qui ne leur
  // appartenaient pas. Il fait par ailleurs double emploi avec la fonction cloud
  // `autoAdvanceOrderStatus`, qui reste la référence quand elle est déployée.
  useEffect(() => {
    if (!isStaff) return;

    const autoCompleteOldOrders = async () => {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const now = Date.now();

      for (const order of orders) {
        // Ne pas modifier les commandes déjà terminées ou annulées
        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
          continue;
        }

        // Vérifier si la commande a plus d'une heure
        const orderCreatedAt = order.createdAt ? new Date(order.createdAt).getTime() : null;
        if (orderCreatedAt && (now - orderCreatedAt) >= ONE_HOUR_MS) {
          try {
            if (order.firestoreId) {
              const orderDoc = doc(db, 'orders', order.firestoreId);
              await updateDoc(orderDoc, {
                status: OrderStatus.DELIVERED,
                updatedAt: serverTimestamp(),
                autoCompletedAt: serverTimestamp(),
                autoCompleted: true
              });
              console.log('✅ Commande', order.id, 'auto-complétée (plus d\'1h)');
            }
          } catch (error) {
            console.error('❌ Erreur auto-complétion commande', order.id, ':', error);
          }
        }
      }
    };

    // Exécuter uniquement quand les commandes sont chargées
    if (orders.length > 0 && !loading) {
      autoCompleteOldOrders();
    }
  }, [orders, loading, isStaff]);

  // Plus besoin de loadOrders - le listener Firestore se charge du chargement

  // Compteur partagé : un identifiant unique qui ne redescend jamais, et un
  // numéro d'affichage qui repart à 1 à chaque nouvelle journée de service (9h).
  const counterRef = doc(db, 'settings', 'order_counter');

  // Premier démarrage : caler le compteur au-dessus des identifiants déjà
  // présents, sinon les nouvelles commandes réutiliseraient des numéros existants
  const ensureCounterSeeded = async () => {
    const snap = await getDoc(counterRef);
    if (snap.exists()) return;

    const allOrders = await getDocs(ordersCollection);
    let highest = 0;
    allOrders.forEach(document => {
      const value = parseInt(document.data().id, 10);
      if (!isNaN(value) && value > highest) highest = value;
    });

    await setDoc(counterRef, {
      globalLast: highest,
      dailyLast: 0,
      serviceDay: null,
      seededAt: serverTimestamp(),
    }, { merge: true });

    console.log('🔢 Compteur de commandes initialisé à', highest);
  };

  // Générer les numéros d'une nouvelle commande.
  // La transaction garantit que deux clients simultanés n'obtiennent jamais
  // le même numéro.
  const generateOrderNumbers = async () => {
    const serviceDay = getServiceDayKey();

    // Plusieurs essais avant d'abandonner : le transport long polling forcé
    // (voir config/firebase.js) encaisse mal les réseaux instables, et un repli
    // silencieux produit une commande sans numéro du jour — le client et la
    // cuisine retombent alors sur le compteur global, qui ne repart jamais à 1.
    for (let attempt = 1; attempt <= COUNTER_MAX_ATTEMPTS; attempt++) {
      try {
        await ensureCounterSeeded();

        return await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(counterRef);
          const data = snap.exists() ? snap.data() : {};

          const globalNumber = (data.globalLast || 0) + 1;
          // Nouveau service : la numérotation quotidienne repart à 1
          const dailyNumber = data.serviceDay === serviceDay
            ? (data.dailyLast || 0) + 1
            : 1;

          transaction.set(counterRef, {
            globalLast: globalNumber,
            dailyLast: dailyNumber,
            serviceDay,
            updatedAt: serverTimestamp(),
          }, { merge: true });

          return {
            id: globalNumber.toString().padStart(5, '0'),
            orderNumber: dailyNumber.toString().padStart(3, '0'),
            serviceDay,
          };
        });
      } catch (error) {
        console.error(
          `❌ Numéro de commande, tentative ${attempt}/${COUNTER_MAX_ATTEMPTS} échouée:`,
          error?.message || error
        );

        if (attempt < COUNTER_MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, COUNTER_RETRY_DELAY_MS * attempt));
        }
      }
    }

    // Repli : identifiant unique basé sur l'horodatage, sans numéro du jour.
    // Préfixé pour ne jamais entrer en collision avec un numéro du compteur et
    // pour se repérer immédiatement dans les archives.
    const fallback = `T${Date.now().toString().slice(-6)}`;
    console.error(
      `🚨 Compteur de commandes injoignable, numéro de repli attribué: ${fallback}`
    );
    return { id: fallback, orderNumber: null, serviceDay };
  };

  // Créer une nouvelle commande dans Firestore
  const createOrder = async (orderData) => {
    try {
      console.log('=== CREATING ORDER IN FIRESTORE ===');
      console.log('Order data:', orderData);

      const { id: orderId, orderNumber, serviceDay } = await generateOrderNumbers();
      const newOrder = {
        id: orderId,
        orderNumber,   // numéro affiché, remis à 1 chaque jour à 9h
        serviceDay,    // journée de service à laquelle la commande est rattachée
        customerName: orderData.customerName || 'Client',
        firstName: orderData.firstName || null,
        lastName: orderData.lastName || null,
        customerEmail: orderData.customerEmail || '',
        userId: orderData.userId || null,
        phone: orderData.phone || '',
        items: orderData.items,
        total: orderData.total,
        status: OrderStatus.PENDING,
        mode: orderData.mode,
        address: orderData.address || null,
        deliveryFee: orderData.deliveryFee || 0,
        paymentMethod: orderData.paymentMethod || null,
        orderTime: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        orderDate: new Date().toLocaleDateString('fr-FR'),
        createdAt: serverTimestamp(), // Utiliser serverTimestamp de Firestore
      };

      console.log('Creating order in Firestore:', newOrder);

      // Ajouter à Firestore - le listener mettra à jour automatiquement le state
      const docRef = await addDoc(ordersCollection, newOrder);
      console.log('✅ Order created in Firestore with ID:', docRef.id);

      // L'impression automatique se fait uniquement côté admin (voir dashboard.tsx)

      // Créditer les points de fidélité tout de suite, sur le compte du client.
      //
      // Le solde était auparavant recalculé à la volée depuis la collection
      // `orders` : supprimer une commande effaçait rétroactivement les points
      // correspondants. Le compteur est désormais persistant ; `increment()`
      // garantit l'absence de perte de mise à jour entre deux commandes
      // simultanées.
      const earnedPoints = getOrderPoints(newOrder);
      if (newOrder.userId && earnedPoints > 0) {
        try {
          await updateDoc(doc(db, 'users', newOrder.userId), {
            loyaltyPointsCarriedOver: increment(earnedPoints),
          });
          await updateDoc(docRef, { loyaltyPoints: earnedPoints, loyaltyCredited: true });
          console.log(`⭐ ${earnedPoints} points crédités à ${newOrder.userId}`);
        } catch (loyaltyError) {
          // Une commande passée ne doit jamais échouer sur les points
          console.error('❌ Crédit des points de fidélité impossible:', loyaltyError);
        }
      }

      // Commande sans compte : on la suit explicitement, faute de userId sur
      // lequel filtrer, pour que son avancement remonte au client.
      if (!user) {
        setGuestOrderIds(prev =>
          prev.includes(orderId) ? prev : [...prev, orderId].slice(-GUEST_ORDERS_LIMIT)
        );
      }

      // La clôture automatique après une heure était planifiée ici par un
      // setTimeout : sur mobile l'application est suspendue bien avant, il ne
      // se déclenchait donc jamais. La fonction cloud `autoAdvanceOrderStatus`
      // et le balayage côté cuisine s'en chargent.

      return { success: true, order: { ...newOrder, firestoreId: docRef.id } };
    } catch (error) {
      console.error('❌ Error creating order in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Mettre à jour le statut d'une commande dans Firestore
  const updateOrderStatus = async (orderId, newStatus, options = {}) => {
    try {
      console.log('=== UPDATING ORDER STATUS IN FIRESTORE ===');
      console.log('Order ID:', orderId, 'New status:', newStatus, 'Options:', options);

      // Trouver la commande par son ID
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.firestoreId) {
        throw new Error('Order not found or missing Firestore ID');
      }

      // Stocker temporairement l'info du changement manuel pour la synchronisation
      if (options.manualStatusChange && options.triggerRating) {
        console.log('🎯 [OrdersContext] Marquage changement manuel pour:', orderId);
        // Stocker dans AsyncStorage temporairement
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem(`@manual_status_change_${orderId}`, JSON.stringify({
            orderId,
            newStatus,
            timestamp: Date.now(),
            triggerRating: true
          }));
        } catch (error) {
          console.error('❌ Erreur stockage changement manuel:', error);
        }
      }

      // Mettre à jour dans Firestore avec les options.
      //
      // Le marquage `manual` est systématique : tous les appelants de cette
      // fonction sont des boutons, donc des décisions humaines. Il indique à la
      // fonction cloud `autoAdvanceOrderStatus` de ne plus repositionner cette
      // commande sur son horaire théorique. `options.manualStatusChange` ne
      // pilote plus que le déclenchement de la demande d'avis client.
      const orderDoc = doc(db, 'orders', orderToUpdate.firestoreId);
      await updateDoc(orderDoc, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastStatusChangeType: 'manual',
        manualStatusChangeAt: serverTimestamp()
      });

      console.log('✅ Order status updated in Firestore');

      // Annulation : reprendre les points accordés à la commande.
      // Le calcul par recomptage des commandes s'en chargeait tout seul ;
      // avec un solde persistant, il faut débiter explicitement. Les drapeaux
      // évitent qu'un double passage retire les points deux fois.
      const cancelling = newStatus === OrderStatus.CANCELLED;
      const pointsToRevoke = orderToUpdate.loyaltyPoints ?? getOrderPoints(orderToUpdate);

      if (cancelling && orderToUpdate.userId && !orderToUpdate.loyaltyRevoked && pointsToRevoke > 0) {
        try {
          await updateDoc(doc(db, 'users', orderToUpdate.userId), {
            loyaltyPointsCarriedOver: increment(-pointsToRevoke),
          });
          await updateDoc(orderDoc, { loyaltyRevoked: true });
          console.log(`⭐ ${pointsToRevoke} points repris à ${orderToUpdate.userId} (commande annulée)`);
        } catch (loyaltyError) {
          console.error('❌ Reprise des points impossible:', loyaltyError);
        }
      }

      // Notifier le client si nécessaire
      try {
        await customerNotificationService.notifyCustomerStatusChange(
          orderId,
          newStatus,
          {
            mode: orderToUpdate.mode,
            customerName: orderToUpdate.customerName,
            estimatedTime: '15-30 min'
          }
        );
      } catch (notificationError) {
        console.warn('⚠️ Erreur notification client:', notificationError);
        // Ne pas faire échouer la mise à jour du statut si la notification échoue
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating order status in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Assigner une commande à un livreur dans Firestore
  const assignOrderToDelivery = async (orderId, deliveryUser) => {
    try {
      console.log('=== ASSIGNING ORDER TO DELIVERY IN FIRESTORE ===');

      // Trouver la commande par son ID
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.firestoreId) {
        throw new Error('Order not found or missing Firestore ID');
      }

      // Mettre à jour dans Firestore
      const orderDoc = doc(db, 'orders', orderToUpdate.firestoreId);
      await updateDoc(orderDoc, {
        assignedDelivery: {
          id: deliveryUser.id,
          name: deliveryUser.name,
          phone: deliveryUser.phone,
          assignedAt: serverTimestamp(),
        },
        status: OrderStatus.IN_DELIVERY,
        updatedAt: serverTimestamp(),
        // Affectation décidée par un humain : la fonction cloud ne doit plus
        // ramener la commande à l'étape prévue par l'horaire théorique
        lastStatusChangeType: 'manual',
        manualStatusChangeAt: serverTimestamp()
      });

      console.log('✅ Order assigned to delivery in Firestore');
      return { success: true };
    } catch (error) {
      console.error('❌ Error assigning order in Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtenir les commandes disponibles pour livraison (prêtes et non assignées)
  const getAvailableDeliveryOrders = () => {
    return orders.filter(order => 
      order.mode === OrderMode.DELIVERY && 
      order.status === OrderStatus.READY && 
      !order.assignedDelivery
    );
  };

  // Obtenir les commandes assignées à un livreur spécifique
  const getOrdersForDelivery = (deliveryUserId) => {
    return orders.filter(order => 
      order.assignedDelivery && 
      order.assignedDelivery.id === deliveryUserId
    );
  };

  // Obtenir les commandes en cours de livraison par un livreur
  const getActiveDeliveryOrders = (deliveryUserId) => {
    return orders.filter(order => 
      order.assignedDelivery && 
      order.assignedDelivery.id === deliveryUserId &&
      order.status === OrderStatus.IN_DELIVERY
    );
  };

  // Supprimer une commande de Firestore
  const deleteOrder = async (orderId) => {
    try {
      console.log('=== DELETING ORDER FROM FIRESTORE ===');
      console.log('Order ID to delete:', orderId);

      // Trouver la commande par son ID
      const orderToDelete = orders.find(order => order.id === orderId);

      if (!orderToDelete) {
        throw new Error('Order not found');
      }

      // Utiliser firestoreId si disponible, sinon utiliser id directement
      const docId = orderToDelete.firestoreId || orderToDelete.id;
      console.log('Firestore doc ID:', docId);

      // Supprimer de Firestore
      const orderDoc = doc(db, 'orders', docId);
      await deleteDoc(orderDoc);

      console.log('✅ Order deleted from Firestore:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting order from Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Retirer un lot de commandes des archives admin.
  // On marque les documents plutôt que de les supprimer : les points de fidélité
  // et le chiffre d'affaires sont recalculés à partir de la collection 'orders',
  // une vraie suppression remettrait le solde des clients à zéro.
  const hideOrdersFromArchives = async (orderIds = []) => {
    try {
      console.log('=== HIDING ORDERS FROM ARCHIVES ===', orderIds.length, 'commande(s)');

      const docIds = orderIds
        .map(orderId => {
          const orderToHide = orders.find(order => order.id === orderId);
          if (!orderToHide) {
            console.warn('⚠️ Commande introuvable, ignorée:', orderId);
            return null;
          }
          return orderToHide.firestoreId || orderToHide.id;
        })
        .filter(Boolean);

      const results = await Promise.allSettled(
        docIds.map(docId =>
          updateDoc(doc(db, 'orders', docId), {
            hiddenFromArchives: true,
            hiddenFromArchivesAt: serverTimestamp(),
          })
        )
      );

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('❌ Échecs de masquage:', failed.length, failed[0].reason);
        return {
          success: false,
          hiddenCount: results.length - failed.length,
          error: `${failed.length} commande(s) n'ont pas pu être retirées des archives`,
        };
      }

      console.log('✅ Commandes retirées des archives:', docIds.length);
      return { success: true, hiddenCount: docIds.length };
    } catch (error) {
      console.error('❌ Error hiding orders from archives:', error);
      return { success: false, hiddenCount: 0, error: error.message };
    }
  };

  // Obtenir les commandes filtrées par statut
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  // Obtenir les commandes du jour
  const getTodayOrders = () => {
    const today = new Date().toLocaleDateString('fr-FR');
    return orders.filter(order => order.orderDate === today);
  };

  // Statistiques
  const getOrderStats = () => {
    const todayOrders = getTodayOrders();
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const ordersByStatus = {
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      preparing: orders.filter(o => o.status === OrderStatus.PREPARING).length,
      ready: orders.filter(o => o.status === OrderStatus.READY).length,
      inDelivery: orders.filter(o => o.status === OrderStatus.IN_DELIVERY).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    };

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      ordersByStatus,
    };
  };

  // Réinitialiser les commandes (pour le développement) - supprime tout de Firestore
  const clearAllOrders = async () => {
    try {
      console.log('=== CLEARING ALL ORDERS FROM FIRESTORE ===');

      // Récupérer tous les documents
      const snapshot = await getDocs(ordersCollection);

      // Supprimer chaque document
      const deletePromises = [];
      snapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'orders', document.id)));
      });

      await Promise.all(deletePromises);
      console.log('✅ All orders cleared from Firestore');

      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing orders from Firestore:', error);
      return { success: false, error: error.message };
    }
  };

  // Plus besoin de forceUpdateOrders et refreshOrders - Firestore se synchronise automatiquement
  const refreshOrders = React.useCallback(() => {
    console.log('🔄 refreshOrders called - Firestore listener handles this automatically');
    // Le listener Firestore se charge automatiquement des mises à jour
  }, []);

  const value = {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    hideOrdersFromArchives,
    getOrdersByStatus,
    getTodayOrders,
    getOrderStats,
    clearAllOrders,
    refreshOrders,
    assignOrderToDelivery,
    getAvailableDeliveryOrders,
    getOrdersForDelivery,
    getActiveDeliveryOrders,
    customerAlerts,
    getActiveAlertForOrder,
    flagCustomerAlert,
    resolveCustomerAlert,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};