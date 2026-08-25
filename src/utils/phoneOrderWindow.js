// Après la fermeture de l'application (01h50), le restaurant continue de servir
// par téléphone pendant 10 minutes, dans la limite de ce qu'il reste en cuisine.
export const PHONE_ORDER_START = { hours: 1, minutes: 50 };
export const PHONE_ORDER_END = { hours: 2, minutes: 0 };

export const RESTAURANT_PHONE = '07 66 88 16 97';
export const RESTAURANT_PHONE_URI = 'tel:0766881697';

const toMinutes = ({ hours, minutes }) => hours * 60 + minutes;

// Sommes-nous dans le créneau où seule la commande par téléphone reste possible ?
export const isPhoneOrderWindow = (date = new Date()) => {
  const current = date.getHours() * 60 + date.getMinutes();
  return current >= toMinutes(PHONE_ORDER_START) && current < toMinutes(PHONE_ORDER_END);
};

export const PHONE_ORDER_TITLE = 'Commande par téléphone';

export const PHONE_ORDER_MESSAGE =
  'Les commandes en ligne sont terminées pour ce soir. '
  + `Jusqu'à 2h, appelez le restaurant au ${RESTAURANT_PHONE} : `
  + 'nous prenons encore les commandes selon ce qu\'il reste de disponible.';

// Version courte pour les bandeaux
export const PHONE_ORDER_SHORT =
  `Commandes en ligne terminées. Jusqu'à 2h, appelez le ${RESTAURANT_PHONE} `
  + 'pour ce qu\'il reste de disponible.';
