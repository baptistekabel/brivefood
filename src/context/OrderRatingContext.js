import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderStatus } from '../types';
import orderRatingService from '../services/orderRatingService';
import { setOrderRatingCallbacks } from './ActiveOrderContext';
import notificationService from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderRatingContext = createContext();

export const useOrderRating = () => {
  const context = useContext(OrderRatingContext);
  if (!context) {
    throw new Error('useOrderRating must be used within an OrderRatingProvider');
  }
  return context;
};

export const OrderRatingProvider = ({ children }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentOrderToRate, setCurrentOrderToRate] = useState(null);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [isProcessingRating, setIsProcessingRating] = useState(false); // Protection anti-boucle

  // Charger les données au démarrage
  useEffect(() => {
    loadPendingRatings();
    loadRatingStats();

    // Configurer les callbacks pour ActiveOrderContext
    setOrderRatingCallbacks(handleOrderStatusChange, handleOrderRemoval);

    // Surveiller les clics sur les notifications de notation
    const notificationClickListener = setInterval(async () => {
      try {
        const clickData = await AsyncStorage.getItem('@rating_notification_clicked');
        if (clickData) {
          const parsedData = JSON.parse(clickData);
          // Vérifier si c'est récent (dans les 10 secondes)
          const isRecent = (Date.now() - parsedData.timestamp) < 10000;

          if (isRecent) {
            console.log('🔔 Détection clic notification rating:', parsedData.orderId);
            // Nettoyer le signal
            await AsyncStorage.removeItem('@rating_notification_clicked');

            // Ouvrir le modal pour cette commande
            await showRatingModalForOrder(parsedData.orderId);
          }
        }
      } catch (error) {
        console.error('❌ Erreur surveillance notification click:', error);
      }
    }, 1000); // Vérifier chaque seconde

    // Nettoyer les anciennes données une fois par jour
    const cleanupInterval = setInterval(() => {
      orderRatingService.cleanupOldRatings();
    }, 24 * 60 * 60 * 1000); // 24 heures

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(notificationClickListener);
      // Nettoyer les callbacks
      setOrderRatingCallbacks(null, null);
    };
  }, []);

  // Charger les notations en attente
  const loadPendingRatings = async () => {
    try {
      const pending = await orderRatingService.getPendingRatings();
      setPendingRatings(pending);
    } catch (error) {
      console.error('❌ Erreur chargement notations en attente:', error);
    }
  };

  // Charger les statistiques de notation
  const loadRatingStats = async () => {
    try {
      const stats = await orderRatingService.getRatingStats();
      setRatingStats(stats);
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
    }
  };

  // Détecter quand une commande passe au statut terminé
  const handleOrderStatusChange = async (order, newStatus, metadata = {}) => {
    console.log('🎯 [OrderRatingContext] handleOrderStatusChange appelé:');
    console.log('  - Commande ID:', order.id);
    console.log('  - Nouveau statut:', newStatus);
    console.log('  - Métadonnées reçues:', metadata);
    console.log('  - isManualChange:', metadata.isManualChange);
    // Fermer le modal de notation si il est ouvert pour cette commande et que le statut n'est plus "terminé"
    if (showRatingModal && currentOrderToRate && currentOrderToRate.orderId === order.id) {
      const completedStatuses = [
        OrderStatus.DELIVERED,
        OrderStatus.READY // Pour les commandes à emporter/sur place
      ];

      if (!completedStatuses.includes(newStatus)) {
        console.log('🔄 Fermeture du modal de notation - statut changé:', order.id, newStatus);
        setShowRatingModal(false);
        setCurrentOrderToRate(null);
        return;
      }
    }

    // Statuts considérés comme "terminés"
    const completedStatuses = [
      OrderStatus.DELIVERED,
      OrderStatus.READY // Pour les commandes à emporter/sur place
    ];

    if (completedStatuses.includes(newStatus)) {
      try {
        console.log('🏁 Commande terminée détectée:', order.id, 'Changement manuel:', metadata.isManualChange);

        // Ne déclencher le modal de notation QUE si c'est un changement manuel
        if (!metadata.isManualChange) {
          console.log('⚠️ Changement de statut automatique, pas de modal de notation:', order.id);
          console.log('   metadata.isManualChange =', metadata.isManualChange);
          return;
        }

        console.log('✅ Changement MANUEL détecté pour commande terminée:', order.id);

        // Si shouldTriggerRating est spécifiquement demandé, déclencher immédiatement
        console.log('🔍 Vérification shouldTriggerRating:', metadata.shouldTriggerRating);
        console.log('🔍 Métadonnées complètes:', metadata);

        if (metadata.shouldTriggerRating) {
          console.log('🎯 Déclenchement IMMÉDIAT du modal requis pour:', order.id);

          // Vérifier si la commande n'a pas déjà été notée
          const isAlreadyRated = await orderRatingService.isOrderRated(order.id);
          if (!isAlreadyRated) {
            // Traiter la commande terminée (ajouter aux notifications en attente)
            await orderRatingService.handleCompletedOrder(order);

            // Rafraîchir les données
            await loadPendingRatings();

            // Déclencher le modal IMMÉDIATEMENT
            console.log('🚀 DÉCLENCHEMENT IMMÉDIAT du modal de notation pour:', order.id);
            console.log('📋 Données complètes de la commande reçue:', order);

            if (!showRatingModal) {
              // Créer les données au format attendu par le modal
              const ratingOrderData = {
                orderId: order.id,
                customerName: order.customerName,
                total: order.total,
                orderDate: order.orderDate,
                orderTime: order.orderTime,
                completedAt: new Date().toISOString()
              };

              console.log('📋 Données formatées pour le modal:', ratingOrderData);
              triggerRatingRequest(ratingOrderData);

              // Envoyer également une notification push immédiate
              try {
                await notificationService.sendRatingNotification(order);
                console.log('📱 Notification de notation envoyée pour:', order.id);
              } catch (notificationError) {
                console.error('❌ Erreur envoi notification notation:', notificationError);
              }

              // Programmer une notification de rappel dans 5 minutes si pas encore notée
              try {
                setTimeout(async () => {
                  const isStillPending = await orderRatingService.isOrderRated(order.id);
                  if (!isStillPending) {
                    await notificationService.scheduleRatingNotification(order, 5);
                    console.log('⏰ Notification de rappel programmée pour:', order.id);
                  }
                }, 2000); // Attendre 2 secondes avant de programmer le rappel
              } catch (reminderError) {
                console.error('❌ Erreur programmation rappel notation:', reminderError);
              }
            } else {
              console.log('⚠️ Modal déjà ouvert, mise en attente');
            }
          } else {
            console.log('⚠️ Commande déjà notée:', order.id);
          }
        } else {
          // Logic normale sans déclenchement immédiat
          const isAlreadyRated = await orderRatingService.isOrderRated(order.id);
          if (!isAlreadyRated) {
            console.log('📝 Ajout aux notations en attente (sans modal immédiat):', order.id);
            await orderRatingService.handleCompletedOrder(order);
            await loadPendingRatings();
          }
        }
      } catch (error) {
        console.error('❌ Erreur traitement commande terminée:', error);
      }
    }
  };

  // Gérer la suppression ou annulation d'une commande
  const handleOrderRemoval = async (orderId) => {
    console.log('🗑️ [OrderRatingContext] handleOrderRemoval appelé pour commande:', orderId);

    // Logique simplifiée : fermer le modal si ouvert pour cette commande
    if (showRatingModal && currentOrderToRate && currentOrderToRate.orderId === orderId) {
      console.log('🗑️ Fermeture du modal de notation - commande supprimée:', orderId);
      setShowRatingModal(false);
      setCurrentOrderToRate(null);
    }

    // Note: Le déclenchement du modal se fait maintenant uniquement via handleOrderStatusChange
    // avec shouldTriggerRating = true lors des changements manuels
  };

  // Déclencher une demande de notation
  const triggerRatingRequest = async (orderData) => {
    const orderId = orderData?.id || orderData?.orderId;
    console.log('🚀 [OrderRatingContext] triggerRatingRequest appelé pour:', orderId);

    // Protection anti-boucle
    if (isProcessingRating) {
      console.log('⚠️ [OrderRatingContext] Traitement en cours, ignore');
      return;
    }

    // Éviter de redéclencher si le modal est déjà ouvert
    if (showRatingModal) {
      console.log('⚠️ [OrderRatingContext] Modal déjà ouvert, ignore');
      return;
    }

    setIsProcessingRating(true);

    try {
      console.log('📝 [OrderRatingContext] Données commande:', orderData);

      // Nettoyer les autres pending ratings pour cette commande
      const currentPending = await orderRatingService.getPendingRatings();
      const filteredPending = currentPending.filter(p => p.orderId === orderId);
      if (filteredPending.length !== currentPending.length) {
        await orderRatingService.removePendingRating(orderId);
        console.log('🧹 Nettoyage pending ratings multiples pour:', orderId);
      }

      setCurrentOrderToRate(orderData);
      setShowRatingModal(true);

      console.log('✅ [OrderRatingContext] Modal défini comme visible');
    } catch (error) {
      console.error('❌ Erreur triggerRatingRequest:', error);
    } finally {
      // Débloquer après un délai
      setTimeout(() => {
        setIsProcessingRating(false);
      }, 3000);
    }
  };

  // Soumettre une notation
  const submitRating = async (ratingData) => {
    console.log('🚀 [OrderRatingContext] submitRating appelé avec:', ratingData);

    try {
      console.log('📞 [OrderRatingContext] Appel orderRatingService.saveRating...');
      const result = await orderRatingService.saveRating(ratingData);
      console.log('📄 [OrderRatingContext] Résultat service:', result);

      if (result.success) {
        console.log('✅ [OrderRatingContext] Sauvegarde réussie, nettoyage...');

        // Supprimer de la liste des notations en attente
        await orderRatingService.removePendingRating(ratingData.orderId);
        console.log('🧹 [OrderRatingContext] Pending rating supprimé');

        // NE PAS fermer le modal ici - laissez le modal se fermer lui-même
        // Le modal gérera sa propre fermeture après l'appel réussi
        console.log('🔄 [OrderRatingContext] Préparation fermeture modal (gérée par le modal)');

        // Rafraîchir les données
        await loadPendingRatings();
        await loadRatingStats();
        console.log('🔄 [OrderRatingContext] Données rafraîchies');

        // Fermer automatiquement la bannière de commande après notation
        setTimeout(async () => {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('@auto_close_order_after_rating', JSON.stringify({
              orderId: ratingData.orderId,
              timestamp: Date.now()
            }));
            console.log('📝 Signal fermeture bannière stocké après notation');
          } catch (error) {
            console.error('❌ Erreur stockage signal fermeture:', error);
          }
        }, 1000);

        console.log('✅ Notation soumise avec succès pour commande:', ratingData.orderId);
        return { success: true };
      } else {
        console.error('❌ Erreur soumission notation:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur soumission notation:', error);
      return { success: false, error: error.message };
    }
  };

  // Ignorer une demande de notation
  const skipRating = async (orderId) => {
    try {
      // Marquer comme "ignorée" en la supprimant des notifications en attente
      await orderRatingService.removePendingRating(orderId);

      // Fermer le modal
      setShowRatingModal(false);
      setCurrentOrderToRate(null);
      setIsProcessingRating(false);

      // Rafraîchir les données
      await loadPendingRatings();

      console.log('⏭️ Notation ignorée pour commande:', orderId);
    } catch (error) {
      console.error('❌ Erreur ignorer notation:', error);
    }
  };

  // Fonction d'urgence pour fermer le modal (débug)
  const forceCloseModal = async () => {
    console.log('🚨 [OrderRatingContext] FERMETURE FORCÉE DU MODAL');
    setShowRatingModal(false);
    setCurrentOrderToRate(null);
    setIsProcessingRating(false);

    // Nettoyer toutes les pending ratings pour éviter les redéclenchements
    try {
      await orderRatingService.clearAllPendingRatings();
      console.log('🧹 Toutes les notifications en attente supprimées');
    } catch (error) {
      console.error('❌ Erreur nettoyage forcé:', error);
    }
  };

  // Afficher le modal de notation pour une commande spécifique
  const showRatingModalForOrder = async (orderId) => {
    try {
      const pending = await orderRatingService.getPendingRatings();
      const orderToRate = pending.find(p => p.orderId === orderId);

      if (orderToRate) {
        triggerRatingRequest(orderToRate);
      } else {
        console.warn('⚠️ Commande non trouvée dans les notations en attente:', orderId);
      }
    } catch (error) {
      console.error('❌ Erreur affichage modal notation:', error);
    }
  };

  // Vérifier et traiter les notations en attente au démarrage de l'app
  const checkPendingRatings = async () => {
    try {
      // Éviter de déclencher si déjà en traitement ou modal ouvert
      if (isProcessingRating || showRatingModal) {
        console.log('⚠️ Modal/traitement en cours, skip checkPendingRatings');
        return;
      }

      const pending = await orderRatingService.getPendingRatings();

      if (pending.length > 0) {
        console.log('📋 Notations en attente trouvées:', pending.length);

        // Prendre seulement la première commande
        const firstPending = pending[0];

        // Supprimer immédiatement toutes les autres pour éviter la boucle
        if (pending.length > 1) {
          console.log('🧹 Suppression des doublons:', pending.length - 1);
          await orderRatingService.removePendingRating(firstPending.orderId);
          // Garder seulement la première
          await AsyncStorage.setItem('@pending_ratings', JSON.stringify([firstPending]));
        }

        // Attendre avant de déclencher
        setTimeout(() => {
          if (!showRatingModal && !isProcessingRating) {
            triggerRatingRequest(firstPending);
          }
        }, 3000);

        console.log('📋 Traitement de la notation:', firstPending.orderId);
      }
    } catch (error) {
      console.error('❌ Erreur vérification notations en attente:', error);
    }
  };

  const value = {
    // État
    showRatingModal,
    currentOrderToRate,
    pendingRatings,
    ratingStats,

    // Actions
    handleOrderStatusChange,
    handleOrderRemoval,
    triggerRatingRequest,
    submitRating,
    skipRating,
    showRatingModalForOrder,
    checkPendingRatings,
    forceCloseModal,

    // Données
    loadPendingRatings,
    loadRatingStats,

    // Contrôle modal
    setShowRatingModal,
    setCurrentOrderToRate,
  };

  return (
    <OrderRatingContext.Provider value={value}>
      {children}
    </OrderRatingContext.Provider>
  );
};