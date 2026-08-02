// Identité d'une ligne du panier.
//
// Chaque ajout au panier crée sa propre ligne, même si un produit strictement
// identique (même personnalisation, même commentaire) y est déjà : le client
// doit voir chaque article séparément (et la cuisine aussi, sur le ticket),
// jamais un compteur "x2" partagé qui masque le détail par article.
//
// L'identifiant est donc généré au hasard à chaque appel plutôt que dérivé du
// contenu de l'article : deux lignes ne doivent jamais entrer en collision,
// même quand elles décrivent exactement le même produit.
let lineCounter = 0;

export const getCartLineId = (item) => {
  lineCounter += 1;
  const baseId = item?.id != null ? String(item.id) : 'item';
  const unique = `${Date.now().toString(36)}${lineCounter}${Math.random().toString(36).slice(2, 8)}`;
  return `${baseId}__${unique}`;
};

export default getCartLineId;
