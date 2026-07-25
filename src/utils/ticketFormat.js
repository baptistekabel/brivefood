// Mise en forme des tickets cuisine.
//
// Source unique de vérité du contenu des tickets : utilisée à la fois par
// l'impression réelle (EpsonBluetoothService) et par l'aperçu à l'écran
// (PrinterService). Sans ça, les deux finissent toujours par diverger.
//
// Les personnalisations arrivent sous deux formes : une chaîne déjà formatée
// (`item.options`, produite au moment de la commande, en « € ») et les
// `customizations` brutes re-résolues à l'impression (en « EUR »). Elles
// décrivent la même chose avec des suffixes de prix différents, ce qui faisait
// échouer la déduplication et imprimait chaque option en double.
//
// En retirant les prix, les deux sources deviennent identiques et le
// dédoublonnage fonctionne.

// Supprime les suppléments «  (+2.00€) » / «  (+2,00 EUR) » d'un libellé
export const stripOptionPrice = (label) => {
  if (!label) return '';
  return String(label)
    .replace(/\s*\(\s*\+?\s*\d+(?:[.,]\d+)?\s*(?:€|EUR)\s*\)/gi, '')
    .trim();
};

// Retire le nom de la catégorie : la cuisine lit « Sauce blanche »,
// pas « Sauce: Sauce blanche »
export const stripOptionCategory = (label) => {
  if (!label) return '';
  const text = String(label);
  const separator = text.indexOf(': ');
  return separator === -1 ? text.trim() : text.slice(separator + 2).trim();
};

const cleanOption = (label) => stripOptionCategory(stripOptionPrice(label));

// Ordre de lecture en cuisine : on monte le tacos dans cet ordre, et les
// frites et boissons se préparent en dernier, donc elles ferment la liste.
const CATEGORY_ORDER = [
  { rank: 1, keywords: ['viande', 'steak'] },
  { rank: 2, keywords: ['sauce'] },
  { rank: 3, keywords: ['supplement', 'supplément', 'extra', 'topping', 'garniture'] },
  { rank: 5, keywords: ['frite', 'accompagnement'] },
  { rank: 6, keywords: ['boisson', 'drink'] },
];

// Les catégories inconnues se placent entre les suppléments et les frites
const DEFAULT_RANK = 4;

const getCategoryRank = (category) => {
  const normalized = String(category || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  for (const entry of CATEGORY_ORDER) {
    if (entry.keywords.some(keyword => {
      const key = keyword.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return normalized.includes(key);
    })) {
      return entry.rank;
    }
  }

  return DEFAULT_RANK;
};

// Nom de la catégorie contenu dans « Sauce: Moutarde »
const extractCategory = (label) => {
  const text = String(label || '');
  const separator = text.indexOf(': ');
  return separator === -1 ? '' : text.slice(0, separator);
};

// Titre de l'article : « Tacos (L (2 viandes)) - L ».
// La quantité n'apparaît que si elle dépasse 1, comme sur les tickets papier.
export const getTicketItemTitle = (item) => {
  const quantity = Number(item.quantity) || 1;
  const prefix = quantity > 1 ? `${quantity}x ` : '';
  const size = item.size ? ` - ${item.size}` : '';
  return `${prefix}${item.name}${size}`;
};

// Toutes les personnalisations de l'article, sans doublon et sans prix.
// On ne perd jamais une option : si les définitions manquent, la valeur brute
// est imprimée plutôt que rien.
export const getTicketItemOptions = (item) => {
  const entries = [];
  const seen = new Set();

  const push = (label, category) => {
    const clean = cleanOption(label);
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    entries.push({ label: clean, rank: getCategoryRank(category) });
  };

  if (item.options) {
    String(item.options).split(' | ').forEach(part => {
      push(part, extractCategory(stripOptionPrice(part)));
    });
  }

  if (item.customizations && item.customizationOptions) {
    Object.entries(item.customizations).forEach(([catKey, selected]) => {
      const category = item.customizationOptions[catKey];
      if (!category || !selected) return;
      const categoryName = category.title || catKey;
      const values = Array.isArray(selected) ? selected : [selected];
      values.forEach(optionId => {
        const option = category.options?.find(o => o.id === optionId);
        push(option ? option.name : optionId, categoryName);
      });
    });
  } else if (item.customizations) {
    Object.entries(item.customizations).forEach(([catKey, selected]) => {
      const values = Array.isArray(selected) ? selected : [selected];
      values.forEach(value => push(value, catKey));
    });
  }

  // Tri stable : viande, sauces, suppléments, puis frites et boissons en fin
  return entries
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => (a.rank - b.rank) || (a.index - b.index))
    .map(entry => entry.label);
};

export const getTicketItemNote = (item) => item.comment || item.comments || null;

// Mode de règlement. Il n'est renseigné qu'en livraison : ne pas annoncer
// « CARTE » à tort pour une commande réglée au comptoir.
export const getPaymentLabel = (order) => {
  if (!order?.paymentMethod) return 'REGLEMENT SUR PLACE';
  return order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE';
};

export const TICKET_SEPARATOR = '- - - - - - - - - - - - - - -';

export default {
  stripOptionPrice,
  stripOptionCategory,
  getTicketItemTitle,
  getTicketItemOptions,
  getTicketItemNote,
  getPaymentLabel,
  TICKET_SEPARATOR,
};
