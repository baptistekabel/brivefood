import React, { useEffect } from 'react';
import OrderRatingModal from './OrderRatingModal';
import { useOrderRating } from '../../context/OrderRatingContext';
import { useAuth } from '../../context/AuthContext';

export default function OrderRatingManager() {
  const { user } = useAuth();
  const {
    showRatingModal,
    currentOrderToRate,
    submitRating,
    skipRating,
    setShowRatingModal,
    setCurrentOrderToRate,
    checkPendingRatings,
    forceCloseModal,
  } = useOrderRating();

  // Logs pour debugging
  console.log('🎯 [OrderRatingManager] Rendu avec:', {
    showRatingModal,
    currentOrderToRate: currentOrderToRate?.orderId || 'null',
    userConnected: !!user
  });

  // Vérifier s'il y a des notations en attente au montage du composant
  // Seulement si l'utilisateur est connecté
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      checkPendingRatings();
    }, 2000); // Attendre 2 secondes après le chargement de l'app

    return () => clearTimeout(timer);
  }, [checkPendingRatings, user]);

  const handleSubmitRating = async (ratingData) => {
    try {
      console.log('🔄 [OrderRatingManager] handleSubmitRating appelé avec:', ratingData);

      const result = await submitRating(ratingData);
      console.log('📋 [OrderRatingManager] Résultat submitRating:', result);

      if (result && result.success) {
        console.log('✅ [OrderRatingManager] Notation soumise avec succès');
        return { success: true };
      } else {
        console.error('❌ [OrderRatingManager] Erreur soumission notation:', result?.error || 'Erreur inconnue');
        throw new Error(result?.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('❌ [OrderRatingManager] Exception soumission notation:', error);
      throw error;
    }
  };

  const handleCloseRating = () => {
    console.log('🔔 [OrderRatingManager] handleCloseRating appelé');

    // Fermer le modal et nettoyer les données immédiatement
    setShowRatingModal(false);
    setCurrentOrderToRate(null);

    // Nettoyer les données
    if (currentOrderToRate) {
      console.log('🧹 [OrderRatingManager] Nettoyage après fermeture modal pour:', currentOrderToRate.orderId);
    }

    console.log('✅ [OrderRatingManager] Modal fermé et données nettoyées');
  };

  // Ne pas afficher le modal si l'utilisateur n'est pas connecté
  if (!user) {
    return null;
  }

  return (
    <OrderRatingModal
      visible={showRatingModal}
      orderData={currentOrderToRate}
      onClose={handleCloseRating}
      onForceClose={forceCloseModal}
      onSubmitRating={handleSubmitRating}
    />
  );
}