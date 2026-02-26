import { ProductCategory } from '../types/index.js';

// Catégories disponibles uniquement à partir de 18h
export const EVENING_ONLY_CATEGORIES = [
  ProductCategory.PIZZA,
  ProductCategory.BOWLS,
  ProductCategory.LASAGNES,
  ProductCategory.PATES,
  ProductCategory.FORMULES_PIZZA_DUO,
  ProductCategory.FORMULES_PIZZA_TRIO,
];

// Produits spécifiques disponibles uniquement à partir de 18h (pizza dessert)
export const EVENING_ONLY_PRODUCT_IDS = [
  'dessert8', // Pizza briochée
];

export const EVENING_START_HOUR = 18;

// Vérifie si le service du soir est disponible (>= 18h)
export const isEveningServiceAvailable = () => {
  const now = new Date();
  return now.getHours() >= EVENING_START_HOUR;
};

// Vérifie si une catégorie est réservée au service du soir
export const isEveningOnlyCategory = (categoryId) => {
  return EVENING_ONLY_CATEGORIES.includes(categoryId);
};

// Vérifie si un produit spécifique est réservé au service du soir
export const isEveningOnlyProduct = (productId) => {
  return EVENING_ONLY_PRODUCT_IDS.includes(productId);
};

// Vérifie si on peut commander dans cette catégorie
export const canOrderCategory = (categoryId) => {
  if (!isEveningOnlyCategory(categoryId)) return true;
  return isEveningServiceAvailable();
};

// Vérifie si on peut commander ce produit
export const canOrderProduct = (product) => {
  if (isEveningOnlyProduct(product.id)) {
    return isEveningServiceAvailable();
  }
  if (product.category && isEveningOnlyCategory(product.category)) {
    return isEveningServiceAvailable();
  }
  return true;
};
