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

  // Le client cumule un solde de points et le dépense librement
  // sur la récompense de son choix
  const rewards = [
    {
      id: 'petit-cheese',
      points: 500,
      title: 'Petit Cheese',
      description: 'Un délicieux petit cheese offert',
      icon: 'fast-food',
      image: require('../../assets/images/burgers/burgerClassic.png'),
      color: '#FFD700',
      gradient: ['#FFD700', '#FFA500'],
      value: 8.50, // Prix du petit cheese
      type: 'product'
    },
    {
      id: 'livraison-offerte',
      points: 600,
      title: 'Livraison Offerte',
      description: 'Frais de livraison gratuits',
      icon: 'bicycle',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      value: 0, // Valeur variable selon les frais de livraison
      type: 'delivery'
    },
    {
      id: 'bruschetta-offerte',
      points: 900,
      title: 'Bruschetta offerte',
      description: 'Une bruschetta offerte',
      icon: 'pizza',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
      value: 7.50, // Prix d'une bruschetta
      type: 'product'
    },
    {
      id: 'tacos-1-viande-offert',
      points: 1400,
      title: 'Tacos 1 viande offert',
      description: 'Un tacos taille M (1 viande) offert',
      icon: 'fast-food',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      value: 11.90, // Prix du tacos M (1 viande)
      type: 'product'
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

  // Obtenir les récompenses disponibles pour le panier
  // Le client peut utiliser toute récompense que son solde de points permet
  const getAvailableRewardsForCart = (cartTotal = 0, isDelivery = false) => {
    const loyalty = calculateLoyaltyData();

    return rewards
      // Assez de points pour cette récompense ?
      .filter(reward => loyalty.currentPoints >= reward.points)
      // La livraison offerte n'a de sens qu'en mode livraison
      .filter(reward => reward.type !== 'delivery' || isDelivery)
      .map(reward => ({
        ...reward,
        // Pour la livraison, la valeur sera calculée selon les frais réels
        discountValue: reward.type === 'product' ? reward.value : 0,
        available: true
      }));
  };

  // Utiliser une récompense
  const useReward = async (rewardId, orderTotal = 0, deliveryFee = 0) => {
    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        return { success: false, error: 'Récompense non trouvée' };
      }

      const loyalty = calculateLoyaltyData();
      if (loyalty.currentPoints < reward.points) {
        return { success: false, error: 'Points insuffisants' };
      }

      // Une même récompense ne peut pas être appliquée deux fois au même panier :
      // les points étaient débités à chaque ajout, mais l'annulation n'en
      // remboursait qu'un seul (voir cancelRewardUsage).
      const alreadyActive = (userProfile.usedRewards || [])
        .some(r => r.id === rewardId && !r.orderId);
      if (alreadyActive) {
        return { success: false, error: 'Cette récompense est déjà appliquée à votre commande' };
      }

      let discountAmount = 0;
      let description = '';

      switch (reward.type) {
        case 'product':
          discountAmount = Math.min(reward.value, orderTotal);
          description = `${reward.title} (-${reward.points} points)`;
          break;
        case 'delivery':
          discountAmount = deliveryFee;
          description = `${reward.title} (-${reward.points} points)`;
          break;
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
        let discountAmount = 0;

        switch (reward.type) {
          case 'product':
            discountAmount = Math.min(reward.value, cartTotal);
            break;
          case 'delivery':
            discountAmount = deliveryFee;
            break;
        }

        totalDiscount += discountAmount;
        rewardDiscounts.push({
          ...usedReward,
          discountAmount,
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

    // Functions
    calculateLoyaltyData,
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