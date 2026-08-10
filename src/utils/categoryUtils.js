// Ordre logique d'affichage des catégories de personnalisation, partagé par
// la fiche produit, le panier et le récapitulatif de commande. Sans un ordre
// commun, deux lignes identiques peuvent s'afficher dans un ordre différent
// selon la séquence dans laquelle le client a cliqué les options.
const CUSTOMIZATION_CATEGORY_ORDER = ['taille', 'base', 'gratine', 'steak', 'viande', 'viandes', 'crudites', 'fromage', 'fromages', 'sauce', 'gout', 'supplement', 'topping', 'supplements', 'chantilly', 'frites', 'pain', 'boisson'];

// Rang d'une section qui compose une promo à choix multiples.
//
// Les sandwichs vont par paire — « Choix Américain 2 » puis sa
// « Sauce Américain 2 » — et les paires se suivent dans l'ordre des sandwichs.
// Les pizzas sont décalées pour rester groupées si une promo mêle les deux.
// Renvoie null pour toute autre section.
const getPromoChoiceRank = (category) => {
  const title = category?.title || '';

  const americain = /^(Choix|Sauce) Américain (\d+)/.exec(title);
  if (americain) {
    const [, kind, number] = americain;
    return Number(number) * 2 + (kind === 'Choix' ? 0 : 1);
  }

  const pizza = /^Choix Pizza (\d+)/.exec(title);
  if (pizza) return 1000 + Number(pizza[1]);

  return null;
};

// Trie des paires [categoryKey, category] (ex: issues de
// `Object.entries(product.customizationOptions)`) selon l'ordre logique de
// montage du produit.
export const sortCustomizationEntries = (entries) => {
  return [...entries].sort(([a, catA], [b, catB]) => {
    const promoA = getPromoChoiceRank(catA);
    const promoB = getPromoChoiceRank(catB);

    if (promoA !== null && promoB !== null) return promoA - promoB;
    // Les choix qui composent une promo passent avant les compléments communs
    // (frites, boisson) : ils définissent le contenu de la commande. Sans ça,
    // `boisson` étant dans la liste ci-dessus et pas les sections de promo,
    // la boisson s'affichait avant même le premier sandwich.
    if (promoA !== null) return -1;
    if (promoB !== null) return 1;

    const ia = CUSTOMIZATION_CATEGORY_ORDER.indexOf(a);
    const ib = CUSTOMIZATION_CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
};

// Calculer le prix total avec personnalisations
export const calculateCustomizedPrice = (product, selectedSizes = {}, customizations = {}) => {
  // Utiliser le prix de la taille sélectionnée si applicable
  const selectedSize = selectedSizes[product.id];
  let basePrice = product.price;

  if (product.sizes && selectedSize && product.sizes[selectedSize]) {
    basePrice = product.sizes[selectedSize].price;
  }

  const productCustomizations = customizations[product.id] || {};
  let additionalPrice = 0;

  if (product.customizationOptions) {
    Object.entries(product.customizationOptions).filter(([, v]) => v != null).forEach(([categoryKey, category]) => {
      const selectedOptions = productCustomizations[categoryKey] || [];
      selectedOptions.forEach(optionId => {
        const option = category.options?.find(opt => (opt.id || opt.name) === optionId);
        if (option) {
          additionalPrice += option.price || 0;
        }
      });
    });
  }

  return basePrice + additionalPrice;
};

// Lister les sections obligatoires encore incomplètes, dans l'ordre d'affichage
export const getMissingCustomizations = (product, customizations = {}) => {
  if (!product.customizationOptions) return [];

  const productCustomizations = customizations[product.id] || {};

  return Object.entries(product.customizationOptions)
    .filter(([, category]) => category != null && category.required)
    .map(([categoryKey, category]) => {
      const selectedCount = (productCustomizations[categoryKey] || []).length;
      const minSelections = category.minSelections || 1;
      const missing = minSelections - selectedCount;

      if (missing <= 0) return null;

      return {
        key: categoryKey,
        title: category.title || categoryKey,
        missing,
        minSelections,
      };
    })
    .filter(Boolean);
};

// Vérifier si toutes les options requises sont sélectionnées
export const isCustomizationComplete = (product, customizations = {}) =>
  getMissingCustomizations(product, customizations).length === 0;

// Message listant ce qu'il reste à choisir, pour l'alerte d'ajout au panier
export const formatMissingCustomizations = (missing = []) => {
  return missing
    .map(section => (
      section.missing > 1
        ? `•  ${section.title} : encore ${section.missing} à choisir`
        : `•  ${section.title}`
    ))
    .join('\n');
};

// Obtenir le texte d'affichage pour une taille
export const getSizeDisplayText = (product, sizeKey) => {
  if (!product.sizes || !product.sizes[sizeKey]) {
    return sizeKey;
  }

  const sizeData = product.sizes[sizeKey];
  const supplement = sizeData.price - product.price;

  if (supplement === 0) {
    return sizeData.name;
  } else {
    const sign = supplement > 0 ? '+' : '';
    return `${product.sizes[sizeKey].name} ${sign}${supplement.toFixed(2)}€`;
  }
};

// Obtenir la quantité d'un produit dans le panier.
// Un même produit peut occuper plusieurs lignes s'il a été ajouté avec des
// personnalisations différentes : le badge affiché sur la carte doit annoncer
// le total, pas la quantité de la première ligne rencontrée.
export const getProductQuantity = (orderItems = [], productId) =>
  orderItems
    .filter(item => item.id === productId)
    .reduce((total, item) => total + (item.quantity || 0), 0);