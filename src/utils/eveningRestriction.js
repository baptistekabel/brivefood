// Heure de démarrage du service de livraison
export const EVENING_START_HOUR = 18;

// Vérifie si la livraison est disponible (>= 18h)
// Tous les produits sont commandables toute la journée : seule la livraison
// est réservée au service du soir.
export const isEveningServiceAvailable = () => {
  const now = new Date();
  return now.getHours() >= EVENING_START_HOUR;
};

// Alias explicite pour la livraison
export const isDeliveryAvailable = isEveningServiceAvailable;
