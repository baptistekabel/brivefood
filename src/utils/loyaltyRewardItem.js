// Article offert par une récompense de fidélité.
//
// Une récompense « produit » ajoute désormais le produit réel au panier à 0 €.
// Elle retranchait auparavant sa valeur en euros du total : le client ne
// recevait pas le produit promis, la cuisine ne le voyait pas sur le ticket, et
// les points se transformaient en remise utilisable sur n'importe quel article
// — y compris ceux à forte marge.
//
// Les récompenses décrivent le produit à offrir via leur champ `offer`
// (voir LoyaltyContext) ; ce module transforme cette description en ligne de
// panier à partir du catalogue réel, pour que le nom, l'image et les
// personnalisations restent ceux du produit vendu.

// Préfixe des lignes de panier créées par une récompense
export const REWARD_LINE_ID_PREFIX = 'loyalty-reward-';

// Groupe synthétique proposé quand la récompense laisse le choix entre
// plusieurs produits (« une bruschetta offerte »)
export const REWARD_PRODUCT_GROUP = 'produitOffert';

// Options qui annulent les autres choix du même groupe
const EXCLUSIVE_OPTION_IDS = new Set(['pas-sauce', 'pas-de-boisson']);

export const isExclusiveOption = (optionId) => EXCLUSIVE_OPTION_IDS.has(optionId);

export const isRewardLine = (item) => item?.isLoyaltyReward === true;

// Les définitions du catalogue mélangent les deux orthographes
// (`minSelection` / `minSelections`) : on lit les deux partout.
export const getGroupMin = (group) => group?.minSelections ?? group?.minSelection ?? 1;
export const getGroupMax = (group) => group?.maxSelections ?? group?.maxSelection ?? 1;

// Prix réel du produit offert, taille comprise
const getProductPrice = (product, size) => {
  if (size && product?.sizes?.[size]) {
    return product.sizes[size].price;
  }
  return product?.price ?? 0;
};

const resolveOfferProducts = (reward, getProductById) =>
  (reward?.offer?.productIds || [])
    .map(productId => getProductById(productId))
    .filter(Boolean);

// Valeur affichée au client (« vaut 4.00 € »). Lue dans le catalogue plutôt
// qu'écrite en dur sur la récompense : le prix de la récompense suit
// automatiquement celui du produit modifié depuis l'interface admin.
//
// Quand plusieurs produits sont éligibles à des prix différents (les quatre
// bruschettas vont de 6,50 € à 7,50 €), c'est le plus cher qui fait foi :
// annoncer le moins cher sous-vendrait la récompense.
export const getRewardProductValue = (reward, getProductById) => {
  if (reward?.type !== 'product') return 0;

  const products = resolveOfferProducts(reward, getProductById);
  if (products.length === 0) return reward?.value ?? 0;

  return Math.max(...products.map(product => getProductPrice(product, reward.offer?.size)));
};

// Sélection d'une option dans un groupe, sans effet de bord.
//
// Au-delà du maximum autorisé, la sélection la plus ancienne cède sa place
// plutôt que de bloquer le client sur le choix qu'il vient de faire.
export const toggleOptionSelection = (current = [], optionId, group) => {
  if (current.includes(optionId)) {
    return current.filter(id => id !== optionId);
  }

  // « Pas de sauce » annule les autres choix du groupe
  if (isExclusiveOption(optionId)) return [optionId];

  const max = getGroupMax(group);
  const kept = current.filter(id => !isExclusiveOption(id));

  return kept.length >= max
    ? [...kept.slice(kept.length - max + 1), optionId]
    : [...kept, optionId];
};

// Ligne de panier correspondant à une récompense « produit ».
//
// `customizations` porte les choix déjà faits par le client (variante, sauce,
// viande). Appelée sans ce paramètre, la fonction renvoie le brouillon qui sert
// à afficher l'écran de choix : mêmes groupes d'options, aucune sélection.
//
// Renvoie null si le catalogue ne contient aucun des produits éligibles : dans
// ce cas la récompense ne doit pas être consommée.
export const buildRewardCartItem = (reward, getProductById, customizations = {}) => {
  if (reward?.type !== 'product' || !reward.offer) return null;

  const products = resolveOfferProducts(reward, getProductById);
  if (products.length === 0) return null;

  // Produit retenu par le client quand la récompense en propose plusieurs.
  // À défaut (brouillon, ou choix devenu introuvable), le premier éligible
  // sert de référence pour les options et l'image.
  const [chosenId] = customizations[REWARD_PRODUCT_GROUP] || [];
  const chosen = chosenId ? getProductById(chosenId) : null;
  const base = chosen || products[0];
  const size = reward.offer.size || null;
  const customizationOptions = {};

  // Plusieurs produits éligibles : le client choisit lequel lui est offert.
  // Le choix apparaît comme une personnalisation, donc sur le ticket cuisine.
  if (products.length > 1) {
    customizationOptions[REWARD_PRODUCT_GROUP] = {
      title: 'Votre produit offert',
      required: true,
      multiSelect: false,
      minSelections: 1,
      maxSelections: 1,
      options: products.map(product => ({ id: product.id, name: product.name, price: 0 })),
    };
  }

  // Seuls les groupes listés par la récompense sont proposés. Suppléments,
  // frites et boissons en sont exclus : un article offert ne doit pas servir à
  // obtenir des extras payants gratuitement.
  //
  // Les groupes sont repris du premier produit éligible ; les récompenses à
  // choix multiple ne conservent donc aucun groupe (leurs produits n'ont que
  // des options payantes).
  (reward.offer.optionGroups || []).forEach(groupKey => {
    const group = base.customizationOptions?.[groupKey];
    if (!group) return;

    // Nombre de choix bridé quand la taille offerte est plus petite que le
    // maximum du produit (tacos M = 1 viande, alors que le produit en accepte 4)
    const limit = reward.offer.optionLimits?.[groupKey];

    customizationOptions[groupKey] = {
      ...group,
      // Toutes les options d'un article offert sont gratuites : afficher leur
      // prix laisserait croire à un supplément alors que la ligne reste à 0 €
      options: (group.options || []).map(option => ({ ...option, price: 0 })),
      ...(limit ? { minSelections: Math.min(getGroupMin(group), limit), maxSelections: limit } : {}),
    };
  });

  return {
    id: `${REWARD_LINE_ID_PREFIX}${reward.id}`,
    productId: base.id,
    // Une fois le choix fait, la ligne porte le nom du produit réellement
    // offert : la cuisine lit « Bruschetta Chèvre Miel (OFFERT) » sur le ticket
    // plutôt qu'un générique « Bruschetta »
    name: `${chosen ? chosen.name : reward.title} (OFFERT)`,
    description: 'Offert avec vos points de fidélité',
    price: 0,
    originalPrice: getProductPrice(base, size),
    isLoyaltyReward: true,
    rewardId: reward.id,
    selectedSize: size,
    // Champs d'image : ProductImage applique la même résolution que pour un
    // produit ordinaire (photo admin, puis asset local)
    image: base.image ?? null,
    imageKey: base.imageKey ?? null,
    firebaseImageUrl: base.firebaseImageUrl ?? null,
    customizable: Object.keys(customizationOptions).length > 0,
    customizationOptions,
    customizations,
  };
};

// Groupes obligatoires encore incomplets sur un article offert : la commande ne
// doit pas partir en cuisine sans le choix des viandes ou de la sauce.
export const getMissingRewardOptions = (item) => {
  if (!isRewardLine(item)) return [];

  return Object.entries(item.customizationOptions || {})
    .filter(([groupKey, group]) => {
      if (!group?.required) return false;
      const selected = item.customizations?.[groupKey] || [];
      return selected.length < getGroupMin(group);
    })
    .map(([groupKey, group]) => group.title || groupKey);
};

export default {
  REWARD_LINE_ID_PREFIX,
  REWARD_PRODUCT_GROUP,
  isExclusiveOption,
  isRewardLine,
  getGroupMin,
  getGroupMax,
  toggleOptionSelection,
  getRewardProductValue,
  buildRewardCartItem,
  getMissingRewardOptions,
};
