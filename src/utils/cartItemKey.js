// Identité d'une ligne du panier.
//
// L'identifiant produit (`burger1`, ou `tacos1_M` pour un produit à tailles) ne
// suffit pas à distinguer deux lignes : le prix dépend aussi des suppléments
// choisis (calculateCustomizedPrice), et la cuisine a besoin du détail des
// options et du commentaire.
//
// Sans cette distinction, un Tacos M « Double Steak » (13,90 €) puis un Tacos M
// nature (11,90 €) fusionnaient en une seule ligne quantité 2 au prix du
// premier : le client payait 27,80 € au lieu de 25,80 €, et le ticket cuisine
// n'annonçait qu'une seule recette pour les deux.

// Signature stable des personnalisations : deux clients qui cochent les mêmes
// options dans un ordre différent doivent retomber sur la même ligne.
const buildCustomizationsSignature = (customizations) => {
  if (!customizations || typeof customizations !== 'object') return '';

  return Object.keys(customizations)
    .sort()
    .map((sectionKey) => {
      const selected = customizations[sectionKey];
      if (!Array.isArray(selected) || selected.length === 0) return null;
      return `${sectionKey}=${[...selected].sort().join('+')}`;
    })
    .filter(Boolean)
    .join(';');
};

// Clé de regroupement d'une ligne de panier.
// Un produit sans option ni commentaire garde son identifiant tel quel : les
// lignes simples restent lisibles et le comportement ne change pas pour elles.
export const getCartLineId = (item) => {
  if (!item) return '';

  const baseId = item.id != null ? String(item.id) : '';
  const signature = buildCustomizationsSignature(item.customizations);
  const comment = typeof item.comment === 'string' ? item.comment.trim() : '';

  if (!signature && !comment) return baseId;

  return `${baseId}#${signature}#${comment}`;
};

// Clé déjà calculée si la ligne vient du panier, sinon calculée à la volée pour
// un produit qu'on vient d'ajouter depuis la carte.
export const resolveCartLineId = (item) => item?.cartLineId || getCartLineId(item);

export default getCartLineId;
