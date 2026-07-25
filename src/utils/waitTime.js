// Délais annoncés au client. Regroupés ici parce qu'ils étaient définis à deux
// endroits avec des valeurs différentes : le panier annonçait « 45 min » quand
// la confirmation affichait « 30-45 min » pour la même commande.

// Préparation en cuisine, identique sur place et à emporter
export const PREP_MINUTES = 15;

// Livraison : délai plancher, annoncé comme un minimum et non comme une
// fourchette. Le trajet est déjà compris dedans.
export const DELIVERY_MIN_MINUTES = 45;

// L'affluence ne rallonge que la livraison : sur place et à emporter gardent
// leur délai habituel. Règle centralisée ici pour que le panier, le suivi de
// commande et la confirmation restent cohérents.
export const isRushApplicable = (mode) =>
  String(mode || '').toLowerCase() === 'delivery';

export const getWaitTimeLabel = (mode, extraMinutes = 0) => {
  const normalized = String(mode || '').toLowerCase();
  const extra = isRushApplicable(normalized) ? (Number(extraMinutes) || 0) : 0;

  if (normalized === 'delivery') {
    return `${DELIVERY_MIN_MINUTES + extra} min minimum`;
  }

  if (normalized === 'dine_in' || normalized === 'takeout') {
    return `${PREP_MINUTES} min`;
  }

  // Mode pas encore choisi : le délai n'est pas connu
  return null;
};
