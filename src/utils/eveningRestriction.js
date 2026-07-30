import { PHONE_ORDER_START } from './phoneOrderWindow';

// Heure de démarrage du service de livraison
export const EVENING_START_HOUR = 18;

// Fin du service de livraison : la fermeture des commandes en ligne (01h50).
// Reprise de phoneOrderWindow pour n'avoir qu'une seule heure de fermeture dans
// l'application.
export const DELIVERY_END_MINUTES = PHONE_ORDER_START.hours * 60 + PHONE_ORDER_START.minutes;

// Vérifie si la livraison est disponible.
// Tous les produits sont commandables toute la journée : seule la livraison
// est réservée au service du soir.
//
// Le créneau va de 18h à 01h50, donc à cheval sur minuit. Un simple
// `getHours() >= 18` renvoyait false dès minuit et refusait la livraison de 00h
// à 02h avec le message « la livraison démarre à 18h », alors que le
// restaurant servait encore.
export const isEveningServiceAvailable = (date = new Date()) => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = EVENING_START_HOUR * 60;

  return currentMinutes >= startMinutes || currentMinutes < DELIVERY_END_MINUTES;
};

// Alias explicite pour la livraison
export const isDeliveryAvailable = isEveningServiceAvailable;
