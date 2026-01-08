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
    usedRewards: [],
    availableRewards: []
  });

  // Définition des récompenses disponibles (alternent entre elles)
  // Points requis : 3 points pour chaque récompense
  const POINTS_PER_REWARD = 3;

  const rewards = [
    {
      id: 'livraison-offerte',
      points: POINTS_PER_REWARD,
      title: 'Livraison Offerte',
      description: 'Frais de livraison gratuits',
      icon: 'bicycle',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      value: 0, // Valeur variable selon les frais de livraison
      type: 'delivery'
    },
    {
      id: 'petit-cheese',
      points: POINTS_PER_REWARD,
      title: 'Petit Cheese',
      description: 'Un délicieux petit cheese offert',
      icon: 'fast-food',
      image: require('../../assets/images/burgers/burgerClassic.png'),
      color: '#FFD700',
      gradient: ['#FFD700', '#FFA500'],
      value: 8.50, // Prix du petit cheese
      type: 'product'
    },
  ];

  // Déterminer la prochaine récompense dans la rotation
  // Ordre: Livraison → Petit Cheese → Livraison → Petit Cheese...
  const getNextRewardInRotation = () => {
    const confirmedRewards = (userProfile?.usedRewards || []).filter(r => r.orderId);
    const rewardCount = confirmedRewards.length;

    // Si nombre pair de récompenses utilisées → prochaine = livraison (index 0)
    // Si nombre impair → prochaine = petit cheese (index 1)
    const nextIndex = rewardCount % 2;
    return rewards[nextIndex];
  };

  // Calculer les données de fidélité à partir des commandes
  const calculateLoyaltyData = () => {
    if (!user || !userProfile) {
      return {
        currentPoints: 0,
        totalSpent: 0,
        nextRewardAt: 2,
        usedRewards: [],
        availableRewards: [],
        earnedPoints: 0
      };
    }

    // Données test simulant exactement 133€ de commandes
    const testOrders = [
      { total: 25.00, date: '2024-01-15', id: 'test1' },
      { total: 30.00, date: '2024-01-20', id: 'test2' },
      { total: 28.00, date: '2024-02-01', id: 'test3' },
      { total: 22.00, date: '2024-02-10', id: 'test4' },
      { total: 28.00, date: '2024-02-15', id: 'test5' },
    ]; // Total = 133€ exactement

    // Utiliser vraies commandes si disponibles, sinon test
    const userOrders = orders && orders.length > 0 ? orders : testOrders;

    // Calculer le total dépensé avec plus de précision
    const totalSpent = userOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total || 0);
      return sum + orderTotal;
    }, 0);

    // Points utilisés précédemment
    const usedPoints = parseFloat(userProfile.usedLoyaltyPoints || 0);

    // Calcul précis des points : 1€ = 0.1 point
    const earnedPoints = totalSpent * 0.1;
    const currentPoints = earnedPoints - usedPoints;

    // Debug pour vérifier les calculs
    console.log('🏆 LOYALTY DEBUG:');
    console.log('Total dépensé:', totalSpent, '€');
    console.log('Points gagnés (brut):', earnedPoints, '(', totalSpent, '€ * 0.1 =', totalSpent * 0.1, ')');
    console.log('Points utilisés:', usedPoints);
    console.log('Points actuels:', currentPoints);
    console.log('Points actuels arrondis:', parseFloat(currentPoints.toFixed(2)));
    console.log('Récompenses confirmées:', rewardCount);
    console.log('Prochaine récompense:', nextReward?.title, '(index:', nextRewardIndex, ')');

    // Le prochain objectif est toujours 3 points (POINTS_PER_REWARD)
    const nextRewardAt = POINTS_PER_REWARD;

    // Déterminer la prochaine récompense dans la rotation
    const confirmedRewards = (userProfile?.usedRewards || []).filter(r => r.orderId);
    const rewardCount = confirmedRewards.length;
    const nextRewardIndex = rewardCount % 2; // 0 = livraison, 1 = petit cheese
    const nextReward = rewards[nextRewardIndex];

    // La seule récompense disponible est celle dans la rotation actuelle
    const availableRewards = currentPoints >= POINTS_PER_REWARD ? [nextReward] : [];

    return {
      currentPoints: Math.max(0, parseFloat(currentPoints.toFixed(2))),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      nextRewardAt,
      usedRewards: userProfile.usedRewards || [],
      availableRewards,
      earnedPoints: parseFloat(earnedPoints.toFixed(2)),
      // Infos sur la rotation des récompenses
      nextReward,
      nextRewardIndex,
      rewardsClaimedCount: rewardCount
    };
  };

  // Mettre à jour les données de fidélité quand les commandes ou le profil changent
  useEffect(() => {
    const loyaltyData = calculateLoyaltyData();
    setUserLoyaltyData(loyaltyData);
  }, [orders, userProfile, user]);

  // Obtenir les récompenses disponibles pour le panier
  // Seule la prochaine récompense dans la rotation est disponible
  const getAvailableRewardsForCart = (cartTotal = 0, isDelivery = false) => {
    const loyalty = calculateLoyaltyData();
    const availableRewards = [];

    // Vérifier si l'utilisateur a assez de points
    if (loyalty.currentPoints < POINTS_PER_REWARD) {
      return availableRewards;
    }

    // Obtenir la prochaine récompense dans la rotation
    const confirmedRewards = (userProfile?.usedRewards || []).filter(r => r.orderId);
    const rewardCount = confirmedRewards.length;
    const nextRewardIndex = rewardCount % 2;
    const nextReward = rewards[nextRewardIndex];

    let canUse = true;
    let discountValue = 0;

    switch (nextReward.type) {
      case 'product':
        discountValue = nextReward.value;
        break;
      case 'delivery':
        // Seulement pour les livraisons
        canUse = isDelivery;
        discountValue = 0; // Sera calculé selon les frais de livraison
        break;
    }

    if (canUse) {
      availableRewards.push({
        ...nextReward,
        discountValue,
        available: true
      });
    }

    return availableRewards;
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
      const rewardToCancel = usedRewards.find(r => r.id === rewardId && !r.orderId);

      if (!rewardToCancel) {
        return { success: false, error: 'Récompense non trouvée ou déjà utilisée' };
      }

      // Restaurer les points
      const currentUsedPoints = userProfile.usedLoyaltyPoints || 0;
      const newUsedPoints = currentUsedPoints - rewardToCancel.points;

      // Retirer la récompense de la liste des récompenses utilisées
      const updatedUsedRewards = usedRewards.filter(r =>
        !(r.id === rewardId && !r.orderId)
      );

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

  // Confirmer l'utilisation d'une récompense avec un numéro de commande
  const confirmRewardUsage = async (rewardId, orderId) => {
    try {
      const usedRewards = userProfile.usedRewards || [];
      const updatedUsedRewards = usedRewards.map(reward =>
        reward.id === rewardId && !reward.orderId
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
    POINTS_PER_REWARD,

    // Functions
    calculateLoyaltyData,
    getAvailableRewardsForCart,
    getNextRewardInRotation,
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