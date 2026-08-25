import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useOrders } from './OrdersContext';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { orders } = useOrders();

  const [userLoyaltyData, setUserLoyaltyData] = useState({
    currentPoints: 0,
    totalSpent: 0,
    nextRewardAt: 500,
    usedRewards: [],
    availableRewards: [],
    earnedPoints: 0
  });

  // Barème de gain : 1€ dépensé = 10 points
  const POINTS_PER_EURO = 10;

  // Montant minimum du panier (hors frais de livraison, hors articles offerts)
  // pour pouvoir utiliser une récompense
  const MIN_ORDER_FOR_REWARDS = 15;

  // Plafond de la récompense « Livraison Offerte ». Les frais sont calculés à
  // la distance et montent jusqu'à une dizaine d'euros sur les adresses les
  // plus éloignées : sans plafond, la récompense offrait ces 10 € entiers.
  // Au-delà de 5 €, le reste des frais reste à la charge du client.
  const MAX_FREE_DELIVERY_DISCOUNT = 5;

  // Remise réellement accordée par la livraison offerte, plafonnée
  const getDeliveryRewardDiscount = (deliveryFee = 0) =>
    Math.min(Number(deliveryFee) || 0, MAX_FREE_DELIVERY_DISCOUNT);

  // Le client cumule un solde de points et le dépense librement
  // sur la récompense de son choix.
  //
  // Une récompense `product` est offerte en nature : `offer` désigne le produit
  // réellement ajouté au panier à 0 € (voir utils/loyaltyRewardItem). Le champ
  // `value` n'est plus qu'un repli d'affichage — le prix réel est lu dans le
  // catalogue — et ne sert plus jamais à calculer une remise.
  const rewards = [
    {
      id: 'petit-cheese',
      points: 500,
      title: "Pti' Cheese",
      description: "Un Pti' Cheese offert, sauce au choix",
      icon: 'fast-food',
      image: require('../../assets/images/burgers/burgerClassic.png'),
      color: '#FFD700',
      gradient: ['#FFD700', '#FFA500'],
      value: 4.00,
      type: 'product',
      offer: {
        productIds: ['petitfaim5'],
        size: null,
        optionGroups: ['sauce'],
      },
    },
    {
      id: 'livraison-offerte',
      points: 600,
      title: 'Livraison Offerte',
      description: `Frais de livraison offerts jusqu'à ${MAX_FREE_DELIVERY_DISCOUNT} €`,
      icon: 'bicycle',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      value: 0, // Valeur variable selon les frais de livraison
      type: 'delivery'
    },
    {
      id: 'bruschetta-offerte',
      points: 900,
      title: 'Bruschetta',
      description: 'Une bruschetta offerte, au choix dans la carte',
      icon: 'pizza',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
      value: 7.50,
      type: 'product',
      offer: {
        productIds: ['bruschetta1', 'bruschetta2', 'bruschetta3', 'bruschetta4'],
        size: null,
        optionGroups: [],
      },
    },
    {
      id: 'tacos-1-viande-offert',
      points: 1400,
      title: 'Tacos M (1 viande)',
      description: 'Un tacos taille M (1 viande) offert',
      icon: 'fast-food',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      value: 11.90,
      type: 'product',
      offer: {
        productIds: ['tacos-custom'],
        size: 'M',
        optionGroups: ['viandes', 'sauce'],
        // La taille M ne donne droit qu'à une seule viande
        optionLimits: { viandes: 1 },
      },
    },
  ];

  // Coût de la récompense la moins chère (premier objectif à atteindre)
  const cheapestRewardCost = Math.min(...rewards.map(r => r.points));

  // Calculer les données de fidélité à partir des commandes
  const calculateLoyaltyData = () => {
    if (!user || !userProfile) {
      return {
        currentPoints: 0,
        totalSpent: 0,
        nextRewardAt: cheapestRewardCost,
        usedRewards: [],
        availableRewards: [],
        earnedPoints: 0
      };
    }

    const belongsToUser = (order) => {
      const matchesUserId = order.userId && order.userId === user.uid;
      const matchesEmail = order.customerEmail && user.email && order.customerEmail === user.email;
      return matchesUserId || matchesEmail;
    };

    const allUserOrders = (orders || []).filter(belongsToUser);

    // Une commande annulée (par le client ou par le restaurant, ex. non récupérée)
    // ne rapporte aucun point
    const userOrders = allUserOrders.filter(order => order.status !== 'cancelled');
    const cancelledOrderIds = new Set(
      allUserOrders
        .filter(order => order.status === 'cancelled')
        .map(order => order.id)
    );

    // Total dépensé : sert uniquement à l'affichage. Les points, eux, ne sont
    // plus déduits de cette somme (voir le solde ci-dessous).
    const totalSpent = userOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total || 0);
      return sum + orderTotal;
    }, 0);

    // Les points dépensés sur une récompense d'une commande annulée sont rendus au client
    const refundedPoints = (userProfile.usedRewards || [])
      .filter(reward => reward.orderId && cancelledOrderIds.has(reward.orderId))
      .reduce((sum, reward) => sum + parseFloat(reward.points || 0), 0);

    // Points utilisés précédemment, déduction faite des récompenses restituées
    const usedPoints = Math.max(
      0,
      parseFloat(userProfile.usedLoyaltyPoints || 0) - refundedPoints
    );

    // Solde de fidélité du client.
    //
    // Les points étaient auparavant recalculés à chaque affichage à partir de la
    // collection `orders` : ils ne survivaient donc pas à une purge de
    // l'historique, et des centaines de clients ont perdu leur cumul d'un coup.
    // Le solde est désormais un compteur persistant, crédité à chaque commande
    // (voir OrdersContext.createOrder) et débité en cas d'annulation.
    const earnedPoints = parseFloat(userProfile.loyaltyPointsCarriedOver || 0);
    const currentPoints = Math.max(0, earnedPoints - usedPoints);

    // Prochain objectif : la récompense la moins chère pas encore atteignable
    // (sinon la plus chère, pour garder une barre de progression cohérente)
    const sortedCosts = rewards.map(r => r.points).sort((a, b) => a - b);
    const nextRewardAt = sortedCosts.find(cost => currentPoints < cost)
      || sortedCosts[sortedCosts.length - 1];

    // Toutes les récompenses que le solde permet de s'offrir
    const availableRewards = rewards.filter(r => currentPoints >= r.points);

    // Debug pour vérifier les calculs
    console.log('🏆 LOYALTY DEBUG:');
    console.log('Commandes du client:', userOrders.length);
    console.log('Total dépensé:', totalSpent, '€');
    console.log('Points cumulés (solde persistant):', earnedPoints);
    console.log('Commandes annulées (0 point):', cancelledOrderIds.size);
    console.log('Points restitués (récompenses annulées):', refundedPoints);
    console.log('Points utilisés:', usedPoints);
    console.log('Points actuels:', parseFloat(currentPoints.toFixed(2)));
    console.log('Récompenses disponibles:', availableRewards.map(r => r.title).join(', ') || 'aucune');

    return {
      currentPoints: parseFloat(currentPoints.toFixed(2)),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      nextRewardAt,
      usedRewards: userProfile.usedRewards || [],
      availableRewards,
      earnedPoints: parseFloat(earnedPoints.toFixed(2))
    };
  };

  // Mettre à jour les données de fidélité quand les commandes ou le profil changent
  useEffect(() => {
    const loyaltyData = calculateLoyaltyData();
    setUserLoyaltyData(loyaltyData);
  }, [orders, userProfile, user]);

  // Une seule récompense par commande : celle en cours d'utilisation, s'il y en a
  const getActiveReward = () =>
    (userProfile?.usedRewards || []).find(used => !used.orderId) || null;

  // Obtenir les récompenses disponibles pour le panier.
  // Le client peut utiliser toute récompense que son solde de points permet, à
  // condition d'atteindre le minimum de commande et de n'en avoir aucune autre
  // en cours.
  const getAvailableRewardsForCart = (cartTotal = 0, isDelivery = false) => {
    if (cartTotal < MIN_ORDER_FOR_REWARDS) return [];
    if (getActiveReward()) return [];

    const loyalty = calculateLoyaltyData();

    return rewards
      // Assez de points pour cette récompense ?
      .filter(reward => loyalty.currentPoints >= reward.points)
      // La livraison offerte n'a de sens qu'en mode livraison
      .filter(reward => reward.type !== 'delivery' || isDelivery)
      // La valeur affichée au client est lue dans le catalogue par l'écran du
      // panier (getRewardProductValue) : elle ne peut plus diverger du prix réel
      .map(reward => ({ ...reward, available: true }));
  };

  // Utiliser une récompense.
  //
  // `customizations` porte les choix faits par le client avant validation
  // (variante du produit, sauce, viande). Ils sont conservés sur le profil pour
  // que la ligne du panier puisse être reconstruite à l'identique après un
  // redémarrage de l'application.
  const useReward = async (rewardId, orderTotal = 0, deliveryFee = 0, customizations = null) => {
    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        return { success: false, error: 'Récompense non trouvée' };
      }

      const loyalty = calculateLoyaltyData();
      if (loyalty.currentPoints < reward.points) {
        return { success: false, error: 'Points insuffisants' };
      }

      if (orderTotal < MIN_ORDER_FOR_REWARDS) {
        return {
          success: false,
          error: `Vos points sont utilisables à partir de ${MIN_ORDER_FOR_REWARDS} € de commande.`
        };
      }

      // Une seule récompense par commande. La règle couvre aussi le cas d'une
      // même récompense appliquée deux fois : les points étaient débités à
      // chaque ajout, mais l'annulation n'en remboursait qu'un seul
      // (voir cancelRewardUsage).
      const activeReward = getActiveReward();
      if (activeReward) {
        return {
          success: false,
          error: activeReward.id === rewardId
            ? 'Cette récompense est déjà appliquée à votre commande'
            : `« ${activeReward.title} » est déjà appliquée. Une seule récompense par commande : retirez-la pour en choisir une autre.`
        };
      }

      let discountAmount = 0;
      const description = `${reward.title} (-${reward.points} points)`;

      // Un produit offert est ajouté au panier à 0 € (l'écran du panier s'en
      // charge, voir buildRewardCartItem) : il ne donne plus lieu à une remise
      // en euros sur le reste de la commande. Seule la livraison offerte, qui
      // n'a pas d'article correspondant, reste une remise.
      if (reward.type === 'delivery') {
        discountAmount = getDeliveryRewardDiscount(deliveryFee);
      }

      // Mettre à jour le profil utilisateur avec les points utilisés
      const currentUsedPoints = userProfile.usedLoyaltyPoints || 0;
      const newUsedPoints = currentUsedPoints + reward.points;

      const usedRewards = userProfile.usedRewards || [];
      const newUsedReward = {
        id: rewardId,
        title: reward.title,
        points: reward.points,
        usedAt: new Date().toISOString(),
        discountAmount,
        // Choix du client, pour reconstruire la ligne du panier à l'identique.
        // Firestore refuse `undefined` : on écrit toujours un objet.
        customizations: customizations || {},
        orderId: null // Sera mis à jour lors de la commande
      };

      await updateUserProfile({
        usedLoyaltyPoints: newUsedPoints,
        usedRewards: [...usedRewards, newUsedReward]
      });

      return {
        success: true,
        reward: {
          ...reward,
          discountAmount,
          description
        }
      };
    } catch (error) {
      console.error('Error using reward:', error);
      return { success: false, error: error.message };
    }
  };

  // Annuler l'utilisation d'une récompense (avant confirmation de commande)
  const cancelRewardUsage = async (rewardId) => {
    try {
      const usedRewards = userProfile.usedRewards || [];
      const indexToCancel = usedRewards.findIndex(r => r.id === rewardId && !r.orderId);

      if (indexToCancel === -1) {
        return { success: false, error: 'Récompense non trouvée ou déjà utilisée' };
      }

      const rewardToCancel = usedRewards[indexToCancel];

      // Restaurer les points
      const currentUsedPoints = userProfile.usedLoyaltyPoints || 0;
      const newUsedPoints = currentUsedPoints - rewardToCancel.points;

      // Retirer UNE occurrence, celle dont on vient de rembourser les points.
      // Un filtre sur l'identifiant supprimait toutes les lignes correspondantes
      // alors qu'un seul lot de points était rendu : le client perdait la
      // différence sans aucune trace.
      const updatedUsedRewards = usedRewards.filter((_, index) => index !== indexToCancel);

      await updateUserProfile({
        usedLoyaltyPoints: Math.max(0, newUsedPoints),
        usedRewards: updatedUsedRewards
      });

      return { success: true };
    } catch (error) {
      console.error('Error canceling reward usage:', error);
      return { success: false, error: error.message };
    }
  };

  // Confirmer l'utilisation des récompenses avec un numéro de commande.
  //
  // Accepte plusieurs identifiants en une seule écriture : appelée en boucle,
  // chaque itération repartait de `userProfile` figé au dernier rendu et
  // annulait la confirmation précédente. La récompense restait alors marquée
  // « en cours » et venait déduire son montant de toutes les commandes
  // suivantes.
  const confirmRewardUsage = async (rewardIds, orderId) => {
    try {
      const idsToConfirm = new Set(Array.isArray(rewardIds) ? rewardIds : [rewardIds]);
      const usedRewards = userProfile.usedRewards || [];

      const updatedUsedRewards = usedRewards.map(reward =>
        idsToConfirm.has(reward.id) && !reward.orderId
          ? { ...reward, orderId, confirmedAt: new Date().toISOString() }
          : reward
      );

      await updateUserProfile({
        usedRewards: updatedUsedRewards
      });

      return { success: true };
    } catch (error) {
      console.error('Error confirming reward usage:', error);
      return { success: false, error: error.message };
    }
  };

  // Calculer la réduction totale des récompenses en cours d'utilisation
  const calculateActiveRewardsDiscount = (cartTotal = 0, deliveryFee = 0) => {
    const usedRewards = userProfile?.usedRewards || [];
    const activeRewards = usedRewards.filter(r => !r.orderId); // Récompenses en cours d'utilisation

    let totalDiscount = 0;
    let rewardDiscounts = [];

    activeRewards.forEach(usedReward => {
      const reward = rewards.find(r => r.id === usedReward.id);
      if (reward) {
        // Les produits offerts figurent dans le panier à 0 € : leur remise vaut
        // zéro, sans quoi le client serait avantagé deux fois (voir useReward)
        const discountAmount = reward.type === 'delivery'
          ? getDeliveryRewardDiscount(deliveryFee)
          : 0;

        totalDiscount += discountAmount;
        rewardDiscounts.push({
          ...usedReward,
          discountAmount,
          type: reward.type,
          title: reward.title
        });
      }
    });

    return {
      totalDiscount,
      rewardDiscounts,
      hasActiveRewards: activeRewards.length > 0
    };
  };

  const value = {
    // Data
    userLoyaltyData,
    rewards,
    POINTS_PER_EURO,
    MIN_ORDER_FOR_REWARDS,
    MAX_FREE_DELIVERY_DISCOUNT,

    // Functions
    calculateLoyaltyData,
    getActiveReward,
    getAvailableRewardsForCart,
    useReward,
    cancelRewardUsage,
    confirmRewardUsage,
    calculateActiveRewardsDiscount,

    // Computed values
    hasLoyaltyPoints: userLoyaltyData.currentPoints > 0,
    canUseRewards: userLoyaltyData.availableRewards.length > 0,
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};