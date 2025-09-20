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
    Object.entries(product.customizationOptions).forEach(([categoryKey, category]) => {
      const selectedOptions = productCustomizations[categoryKey] || [];
      selectedOptions.forEach(optionId => {
        const option = category.options.find(opt => (opt.id || opt.name) === optionId);
        if (option) {
          additionalPrice += option.price || 0;
        }
      });
    });
  }

  return basePrice + additionalPrice;
};

// Vérifier si toutes les options requises sont sélectionnées
export const isCustomizationComplete = (product, customizations = {}) => {
  if (!product.customizationOptions) return true;

  const productCustomizations = customizations[product.id] || {};

  return Object.entries(product.customizationOptions).every(([categoryKey, category]) => {
    if (!category.required) return true;

    const selectedOptions = productCustomizations[categoryKey] || [];
    const minSelections = category.minSelections || 1;

    return selectedOptions.length >= minSelections;
  });
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
    return `${product.sizes[sizeKey].name} +${supplement.toFixed(2)}€`;
  }
};

// Obtenir la quantité d'un produit dans le panier
export const getProductQuantity = (orderItems = [], productId) => {
  const item = orderItems.find(item => item.id === productId);
  return item ? item.quantity : 0;
};