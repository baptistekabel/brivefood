import { ProductCategory } from '../types/index.js';
import productImages from './productImages.js';

const productsByCategory = {
  [ProductCategory.PATES]: [
      {
        id: '1',
        name: 'Pâtes bolognaise',
        description: 'Penne, sauce tomate, viande hachée, oignons et herbes aromatiques.',
        price: 10.50,
        rating: 66,
        reviews: 3,
        popular: false,
        image: productImages.patebolognaise,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 10.50 },
          L: { name: 'Taille L', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: '2',
        name: 'Pâtes carbonara',
        description: 'Penne, crème fraîche, lardons de volailles et Emmental.',
        price: 10.50,
        rating: 75,
        reviews: 4,
        popular: false,
        image: productImages.patescarbonara,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 10.50 },
          L: { name: 'Taille L', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: '3',
        name: 'Pâtes saumon',
        description: 'Penne, crème fraîche, saumon frais et aneth.',
        price: 11.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.patesaumon,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 11.50 },
          L: { name: 'Taille L', price: 15.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: '4',
        name: 'Pâtes forestière',
        description: 'Penne, crème fraîche, poulet rôti et champignons de Paris frais.',
        price: 10.50,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.patesforestieres,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 10.50 },
          L: { name: 'Taille L', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: '5',
        name: 'Pâtes 3 Fromages',
        description: 'Penne, Sauce 3 fromages, Cheddar, Emmental, Parmesan.',
        price: 10.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.pates3fromages,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 10.50 },
          L: { name: 'Taille L', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: '6',
        name: 'Pâtes Poulet Curry',
        description: 'Penne, Oignons Rouges, Poivrons, Curry Madras, Poulet Rôti, Crème fraîche.',
        price: 10.50,
        rating: 100,
        reviews: 3,
        popular: false,
        image: productImages.patespouletcurry,
        category: 'pates',
        sizes: {
          M: { name: 'Taille M', price: 10.50 },
          L: { name: 'Taille L', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          viande: {
            title: 'Viande',
            subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
              { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
              { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
              { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
              { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
              { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
              { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
              { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
              { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
              { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
            required: false,
            multiSelect: true,
            maxSelections: 2,
            options: [
              { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
              { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
              { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
              { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
              { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
              { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
              { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
            ]
          },
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.PIZZA]: [
      {
        id: 'pizza10',
        name: 'Pizza Margherita',
        description: 'Sauce tomate, Mozzarella et olives.',
        price: 9.00,
        popular: true,
        image: productImages.pizzaMargherita,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 9.00 },
          '33cm': { name: 'Grande 33 cm', price: 12.00 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza1',
        name: 'Pizza Fermière',
        description: 'Crème fraîche, poulet rôti, pommes de terre, champignons frais, origan et Mozzarella.',
        price: 11.50,
        popular: true,
        image: productImages.pizzaFermiere,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza18',
        name: 'Pizza Kebab raclette',
        description: 'Base tomate, kebab, oignon rouge, raclette, pomme terre, mozza.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaKebabRaclette,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza17',
        name: 'Pizza Cannibale',
        description: 'Base tomate, steak, merguez, poulet, oignon rouge, olives, mozza.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaCannibale,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza9',
        name: 'Pizza Saumon',
        description: 'Crème fraîche, saumon fumé frais, jus de citron, aneth et Mozzarella.',
        price: 13.00,
        popular: false,
        image: productImages.pizzaSaumon,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 13.00 },
          '33cm': { name: 'Grande 33 cm', price: 16.00 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza2',
        name: 'Pizza Chèvre miel',
        description: 'Crème fraîche, chèvre, miel et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaChevreMiel,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza13',
        name: 'Pizza Chèvre Poulet',
        description: 'Base crème, poulet, chèvre, oignon rouge, olives, mozza.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaChevrePoulet,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza3',
        name: 'Pizza Curry',
        description: 'Crème fraîche, poulet rôti, pommes de terre, poivrons, curry et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaCurry,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza4',
        name: 'Pizza Kebab',
        description: 'Sauce tomate, kebab, poivrons, pomme de terre, oignons rouges, sauce blanche et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaKebab,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza7',
        name: 'Pizza Tex-Mex',
        description: 'Sauce tomate, viande hachée, merguez, poivrons, oignons rouges et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaTexMex,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza6',
        name: 'Pizza Burger',
        description: 'Sauce tomate, viande hachée, Cheddar, cornichons, oignons rouges, sauce burger et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaBurger,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza11',
        name: 'Pizza 4 fromages',
        description: '4 fromages et base tomate.',
        price: 11.50,
        popular: false,
        image: productImages.pizza4Fromages,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza12',
        name: 'Pizza Chèvre Figue',
        description: 'Crème fraîche, chèvre, confiture de figue et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaChevreFigue,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza8',
        name: 'Pizza Raclette',
        description: 'Crème fraîche, lardons de volailles, pommes de terre, oignons rouges, fromage raclette et Mozzarella.',
        price: 11.50,
        popular: false,
        image: productImages.pizzaRaclette,
        sizes: {
          '29cm': { name: 'Moyenne 29 cm', price: 11.50 },
          '33cm': { name: 'Grande 33 cm', price: 14.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Choisis ta taille !',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          supplement: {
            title: 'Choisis ton supplément !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-kebab', name: 'Kebab', price: 2.00 },
              { id: 'supp-steak', name: 'Steak 120g', price: 2.00 },
              { id: 'supp-saumon', name: 'Saumon', price: 3.00 },
              { id: 'supp-legumes', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
              { id: 'supp-oeuf', name: 'Œuf', price: 1.50 }
            ]
          },
          fromage: {
            title: 'Choisis ton supplément fromage !',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'supp-emmentale', name: 'Emmentale', price: 1.50 },
              { id: 'supp-mozzarella', name: 'Mozzarella', price: 1.50 },
              { id: 'supp-parmesan', name: 'Parmesan', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizza-composee',
        name: 'Compose ta pizza',
        description: 'Composez votre pizza selon vos envies : base, viande, crudités, fromage et suppléments.',
        price: 9.50,
        popular: false,
        image: productImages.pizzaComposee,
        sizes: {
          'M': { name: 'M (1 viande)', price: 9.50 },
          'L': { name: 'L (2 viandes)', price: 10.50 },
          'XL': { name: 'XL (3 viandes)', price: 11.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Taille de la pizza',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
              { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
            ]
          },
          base: {
            title: 'Choix de la base',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'base-creme', name: 'Crème', price: 0 },
              { id: 'base-tomate', name: 'Tomate', price: 0 }
            ]
          },
          viandes: {
            title: 'Choix des viandes',
            subtitle: 'Nombre de viandes selon la taille choisie.',
            required: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'kebab-pizza', name: 'Kebab', price: 0 },
              { id: 'steak-pizza', name: 'Steak', price: 0 },
              { id: 'poulet-pizza', name: 'Poulet', price: 0 },
              { id: 'merguez-pizza', name: 'Merguez', price: 0 },
              { id: 'pepperoni-pizza', name: 'Pepperoni', price: 0 },
              { id: 'lardon-pizza', name: 'Lardon', price: 0 }
            ]
          },
          crudites: {
            title: 'Crudités',
            subtitle: 'Choisissez jusqu\'à 2 crudités.',
            required: false,
            minSelections: 0,
            maxSelections: 2,
            options: [
              { id: 'poivron-pizza', name: 'Poivron', price: 0 },
              { id: 'oignons-rouges-pizza', name: 'Oignons rouges', price: 0 },
              { id: 'champignons-pizza', name: 'Champignons', price: 0 },
              { id: 'pomme-de-terre-pizza', name: 'Pomme de terre', price: 0 },
              { id: 'olive-pizza', name: 'Olive', price: 0 }
            ]
          },
          fromages: {
            title: 'Fromage',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'raclette-pizza', name: 'Raclette', price: 0 },
              { id: 'chevre-pizza', name: 'Chèvre', price: 0 },
              { id: 'cheddar-pizza', name: 'Cheddar', price: 0 },
              { id: 'mozza-pizza', name: 'Mozzarella', price: 0 },
              { id: 'parmesan-pizza', name: 'Parmesan', price: 0 },
              { id: 'emmental-pizza', name: 'Emmental', price: 0 },
              { id: 'vache-qui-rit-pizza', name: 'Vache qui rit / Kiri', price: 0 }
            ]
          },
          supplements: {
            title: 'Suppléments',
            subtitle: '1€ par supplément.',
            required: false,
            multiSelect: true,
            options: [
              { id: 'oeuf-pizza', name: 'Oeuf', price: 1.00 },
              { id: 'boursin-pizza', name: 'Boursin', price: 1.00 },
              { id: 'bacon-pizza', name: 'Bacon', price: 1.00 },
              { id: 'oignons-frits-pizza', name: 'Oignons frits', price: 1.00 },
              { id: 'frites-pizza', name: 'Frites', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      }
    ],
    [ProductCategory.BURGER]: [
      {
        id: 'burger1',
        name: 'Frenchy Burger',
        description: 'Buns, steak 120g, bacon, galette de pommes de terre, fromage raclette et sauce au choix.',
        price: 13.50,
        rating: 92,
        reviews: 40,
        popular: false,
        image: productImages.burgerClassic,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger2',
        name: 'Double Cheese Burger',
        description: 'Buns, 2 steak 120g, double Cheddar, cornichons, sauce au choix',
        price: 13.50,
        rating: 76,
        reviews: 34,
        popular: false,
        image: productImages.doubleCheeseBurger,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger3',
        name: 'DUO Burger',
        description: 'Buns, steak 120g, Poulet croustillant, cheddar, salade, tomate, sauce au choix.',
        price: 13.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.duoBurger,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger4',
        name: 'Burger Chèvre Miel',
        description: 'Buns, steak 120g, fromage de chèvre, oignons grillés, salade, sauce au choix.',
        price: 13.50,
        rating: 66,
        reviews: 3,
        popular: false,
        image: productImages.burgerChevreMiel,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger5',
        name: 'Chicken Burger',
        description: 'Buns, poulet croustillant, salade, tomate fraiche, tranche d\'emmental et sauce au choix.',
        price: 13.50,
        rating: 100,
        reviews: 10,
        popular: true,
        image: productImages.chickenBurger,
        customizable: true,
        customizationOptions: {
          poulet: {
            title: 'Nombre de poulet',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-poulet', name: 'Simple Poulet', price: 0.00 },
              { id: 'double-poulet', name: 'Double Poulet', price: 3.00 },
              { id: 'triple-poulet', name: 'Triple Poulet', price: 6.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger6',
        name: 'Wi-Mac',
        description: 'Buns, Steak 120g, cheddar, oignon, cornichon, salade, big mac',
        price: 13.50,
        rating: 100,
        reviews: 7,
        popular: false,
        image: productImages.wiMac,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger7',
        name: 'Bacon Burger',
        description: 'Buns, steak 120g, Cheddar, bacon, oignons rouges frais, salade et sauce au choix',
        price: 13.50,
        rating: 87,
        reviews: 32,
        popular: false,
        image: productImages.baconBBurger,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger8',
        name: 'Spicy burger',
        description: 'Buns, steak épicée 120g, Tomate, oignon rouge et poivron grillée, Salade, Sauce au choix',
        price: 13.50,
        rating: 93,
        reviews: 15,
        popular: true,
        image: productImages.spicyBurger,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger9',
        name: 'Burger Classique',
        description: 'Buns, steak 120g, double cheddar, salade, oignon, sauce au choix.',
        price: 13.00,
        image: productImages.defaultImage,
        rating: null,
        reviews: 0,
        popular: false,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger10',
        name: 'Veggie Burger',
        description: 'Buns, Falafel, Légumes grillés, sauce au choix',
        price: 13.00,
        rating: 83,
        reviews: 6,
        popular: false,
        image: productImages.veggieBurger,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'burger11',
        name: 'Burger Bleu',
        description: 'Buns, steak 120g, sauce bleu, salade, tomate, oignon, sauce au choix.',
        price: 13.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.burgerBleu,
        customizable: true,
        customizationOptions: {
          steak: {
            title: 'Nombre de steak',
            required: true,
            multiSelect: false,
            options: [
              { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
              { id: 'double-steak', name: 'Double Steak', price: 2.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.LASAGNES]: [
      {
        id: 'lasagne1',
        name: 'Lasagne bolognaise',
        description: 'Sauce bolognaise maison, béchamel maison, lasagne et Mozzarella.',
        price: 10.50,
        rating: 75,
        reviews: 4,
        popular: false,
        image: productImages.lasagneBolognaise,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-lasagne1', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-lasagne1', name: 'Oui, du pain svp', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'lasagne2',
        name: 'Lasagne poulet',
        description: 'Poulet, béchamel maison, lasagne et Mozzarella.',
        price: 10.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.lasagnePoulet,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-lasagne2', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-lasagne2', name: 'Oui, du pain svp', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'lasagne3',
        name: 'Lasagne saumon',
        description: 'Saumon, béchamel maison, lasagne et Mozzarella.',
        price: 12.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.lasagneSaumon,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Pain',
            subtitle: 'Souhaitez-vous du pain ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-lasagne3', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-lasagne3', name: 'Oui, du pain svp', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.TACOS]: [
      {
        id: 'tacos-custom',
        name: 'Tacos',
        description: 'Sauce fromagère, viandes et sauce au choix selon la taille',
        price: 11.90,
        rating: 87,
        reviews: 263,
        popular: true,
        image: productImages.menuTacos,
        customizable: true,
        sizes: {
          'M': { name: 'M (1 viande)', price: 11.90 },
          'L': { name: 'L (2 viandes)', price: 14.90 },
          'XL': { name: 'XL (3 viandes)', price: 16.90 },
          'XXL': { name: 'XXL (4 viandes)', price: 19.90 }
        },
        customizationOptions: {
          viandes: {
            title: 'Choix des viandes',
            subtitle: 'Nombre de viandes selon la taille choisie.',
            required: true,
            minSelections: 1,
            maxSelections: 4,
            options: [
              { id: 'poulet', name: 'POULET', price: 0, popular: true },
              { id: 'kebab', name: 'KEBAB', price: 0, popular: true },
              { id: 'tenders', name: 'TENDERS', price: 0.50, popular: true },
              { id: 'nugget', name: 'NUGGET', price: 0, popular: true },
              { id: 'cordon-bleu', name: 'CORDON BLEU', price: 0 },
              { id: 'merguez', name: 'MERGUEZ', price: 0 },
              { id: 'viande-hachee', name: 'VIANDE HACHEE', price: 0 },
              { id: 'poulet-boursin', name: 'POULET BOURSIN', price: 0 },
              { id: 'escalope-poulet', name: 'ESCALOPE DE POULET', price: 0 },
              { id: 'falafel', name: 'FALAFEL', price: 0 }
            ]
          },
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0, popular: true },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0, popular: true },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0, popular: true },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 }
            ]
          },
          supplements: {
            title: 'Suppléments',
            subtitle: 'Maximum 10.',
            required: false,
            multiSelect: true,
            maxSelections: 10,
            options: [
              { id: 'sauce-fromagere-tacos', name: 'Sauce fromagère', price: 0.50 },
              { id: 'cheddar-tacos', name: 'Cheddar', price: 1.00 },
              { id: 'boursin-tacos', name: 'Boursin', price: 1.00 },
              { id: 'raclette-tacos', name: 'Raclette', price: 1.00 },
              { id: 'chevre-tacos', name: 'Chèvre', price: 1.00 },
              { id: 'parmesan-tacos', name: 'Parmesan', price: 1.00 },
              { id: 'emmental-tacos', name: 'Emmental', price: 1.00 },
              { id: 'vache-qui-rit-tacos', name: 'Vache qui rit', price: 1.00 },
              { id: 'toastinette-tacos', name: 'Toastinette', price: 1.00 },
              { id: 'oignons-frits-tacos', name: 'Oignons frits', price: 1.00 },
              { id: 'bacon-tacos', name: 'Bacon', price: 1.00 },
              { id: 'oeuf-tacos', name: 'Œuf', price: 1.00 },
              { id: 'salade-tacos', name: 'Salade', price: 0.50 },
              { id: 'tomate-tacos', name: 'Tomate', price: 0.50 },
              { id: 'oignon-rouge-tacos', name: 'Oignon rouge', price: 0.50 },
              { id: 'poivron-grille-tacos', name: 'Poivron grillé', price: 1.00 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-fromagere', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon et oignon', price: 4.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre tacos.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.SANDWICH_AMERICAIN]: [
      {
        id: 'americain1',
        name: 'Américain Bacon',
        description: 'Steak frais 120g, Cheddar, bacon, tomates, oignons grillés, salade et sauce au choix.',
        price: 11.50,
        rating: 92,
        reviews: 13,
        popular: false,
        image: productImages.sandwichAmericain,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'americain2',
        name: 'Américain Kebab',
        description: 'Kebab, salade, tomate, oignon, et sauce au choix.',
        price: 11.50,
        rating: 93,
        reviews: 15,
        popular: false,
        image: productImages.sandwichAmericain,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'americain3',
        name: 'Américain Classic',
        description: 'Steak frais 120g, salade, tomate et sauce au choix.',
        price: 11.50,
        rating: 85,
        reviews: 7,
        popular: false,
        image: productImages.sandwichAmericain,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'americain4',
        name: 'Américain Spicy Kefta',
        description: 'Kefta fraîche 120g, salade, poivrons grillés, oignons grillés, tomates grillées, sauce épicée et sauce au choix.',
        price: 11.50,
        rating: 75,
        reviews: 8,
        popular: false,
        image: productImages.sandwichAmericain,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'americain5',
        name: 'Américain Poulet Boursin',
        description: 'Poulet 110 gr, salade, sauce Boursin, salade, tomates et sauce au choix.',
        price: 11.50,
        rating: 66,
        reviews: 3,
        popular: false,
        image: productImages.sandwichAmericain,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-normales', name: 'Frites normales', price: 1.00, popular: true },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 5.50 },
              { id: 'frites-fromagere', name: 'Frites fromagère', price: 5.90 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon', price: 5.90 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon', price: 5.90 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits', price: 5.90 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits', price: 5.90 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits', price: 6.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits', price: 6.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.SANDWICH_COMPOSE]: [
      {
        id: 'americain-double',
        name: 'Sandwich Double',
        description: '2 viandes au choix',
        price: 9.50,
        image: productImages.defaultImage,
        rating: 80,
        reviews: 31,
        popular: false,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Choix du pain',
            subtitle: 'Choisissez-en 1.',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'pain-rond', name: 'Pain Rond', price: 0 },
              { id: 'galette', name: 'Galette', price: 0 }
            ]
          },
          viande: {
            title: 'Choix de votre viande',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'steak', name: 'Steak', price: 0 },
              { id: 'escalope', name: 'Escalope', price: 0 },
              { id: 'escalope-boursin', name: 'Escalope Boursin', price: 0 },
              { id: 'kebab', name: 'Kebab', price: 0 },
              { id: 'cordon-bleu', name: 'Cordon Bleu', price: 0 },
              { id: 'merguez', name: 'Merguez', price: 0 },
              { id: 'nuggets', name: 'Nuggets', price: 0 },
              { id: 'falafel', name: 'Falafel', price: 0 },
              { id: 'tenders', name: 'Tenders', price: 0.50 }
            ]
          },
          crudites: {
            title: 'Choix des crudités',
            subtitle: 'Jusqu\'à 3.',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'salade', name: 'Salade', price: 0 },
              { id: 'tomate', name: 'Tomate', price: 0 },
              { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
              { id: 'cornichons', name: 'Cornichons', price: 1.00 },
              { id: 'poivron-grille', name: 'Poivron grillé', price: 1.00 },
              { id: 'oignon-frit', name: 'Oignons frits', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 },
              { id: 'oeuf', name: 'Oeuf', price: 1.00 },
              { id: 'poulet-fume', name: 'Poulet fumé', price: 1.00 },
              { id: 'miel', name: 'Miel', price: 1.00 }
            ]
          },
          fromage: {
            title: 'Choix du fromage',
            subtitle: 'Jusqu\'à 1 fromage.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'boursin', name: 'Boursin', price: 1.00 },
              { id: 'vache-kiri', name: 'Vache kiri', price: 1.00 }
            ]
          },
          sauce: {
            title: 'Choisissez jusqu\'à 2 sauces',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'chili-tai', name: 'Chili Thaï', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-fromagere', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagères bacon oignons', price: 4.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'americain-simple',
        name: 'Sandwich Simple',
        description: '1 viande',
        price: 7.50,
        image: productImages.defaultImage,
        rating: 81,
        reviews: 16,
        popular: false,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Choix du pain',
            subtitle: 'Choisissez-en 1.',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'pain-rond', name: 'Pain Rond', price: 0 },
              { id: 'galette', name: 'Galette', price: 0 }
            ]
          },
          viande: {
            title: 'Choix de votre viande',
            subtitle: 'Choisissez-en 1.',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'steak', name: 'Steak', price: 0 },
              { id: 'escalope', name: 'Escalope', price: 0 },
              { id: 'escalope-boursin', name: 'Escalope Boursin', price: 0 },
              { id: 'kebab', name: 'Kebab', price: 0 },
              { id: 'cordon-bleu', name: 'Cordon Bleu', price: 0 },
              { id: 'merguez', name: 'Merguez', price: 0 },
              { id: 'nuggets', name: 'Nuggets', price: 0 },
              { id: 'falafel', name: 'Falafel', price: 0 },
              { id: 'tenders', name: 'Tenders', price: 0.50 }
            ]
          },
          crudites: {
            title: 'Choix des crudités',
            subtitle: 'Jusqu\'à 3.',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'salade', name: 'Salade', price: 0 },
              { id: 'tomate', name: 'Tomate', price: 0 },
              { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
              { id: 'cornichons', name: 'Cornichons', price: 1.00 },
              { id: 'poivron-grille', name: 'Poivron grillé', price: 1.00 },
              { id: 'oignon-frit', name: 'Oignons frits', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 },
              { id: 'oeuf', name: 'Oeuf', price: 1.00 },
              { id: 'poulet-fume', name: 'Poulet fumé', price: 1.00 },
              { id: 'miel', name: 'Miel', price: 1.00 }
            ]
          },
          fromage: {
            title: 'Choix du fromage',
            subtitle: 'Jusqu\'à 1 fromage.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'boursin', name: 'Boursin', price: 1.00 },
              { id: 'vache-kiri', name: 'Vache kiri', price: 1.00 }
            ]
          },
          sauce: {
            title: 'Choisissez jusqu\'à 2 sauces',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'chili-tai', name: 'Chili Thaï', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 0.50 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-fromagere', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-fromagere-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagères bacon oignons', price: 4.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.MENU_KIDS]: [
      {
        id: 'menukids1',
        name: 'Menu kids',
        description: '1 petit cheese ou 4 nuggets + frites + Capri Sun',
        price: 9.00,
        rating: 87,
        reviews: 54,
        popular: false,
        customizable: true,
        image: productImages.MenuKidss,
        customizationOptions: {
          plat: {
            title: 'Choisissez votre plat',
            required: true,
            multiSelect: false,
            options: [
              { id: 'petit-cheese', name: '1 Petit Cheese', price: 0.00 },
              { id: '4-nuggets', name: '4 Nuggets', price: 0.00 }
            ]
          },
          sauce: {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 2,
            options: [
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 }
            ]
          }
        }
      },
    ],
    [ProductCategory.PETIT_FAIM_BRUSCHETTA]: [
      {
        id: 'bruschetta1',
        name: 'Bruschetta-Margarita',
        description: 'Tranche de pain, sauce tomate, huile d\'olive, mozzarella',
        price: 6.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.bruschettaMargarita,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'bruschetta2',
        name: 'Bruschetta Chèvre Miel',
        description: 'Tranche de pain, sauce tomate, chèvre, miel, mozza',
        price: 7.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.bruschettaChevreMiel,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'bruschetta3',
        name: 'Bruschetta Poulet Curry',
        description: 'Tranche de pain, sauce tomate, poulet, curry, mozza',
        price: 7.50,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.bruschettaPouletCurry,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'bruschetta4',
        name: 'Bruschetta 4 Fromages',
        description: 'Tranche de pain, sauce tomate, cantal, compté, parmesan, mozza',
        price: 7.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.bruschetta4Fromages,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.PETITES_FAIM]: [
      {
        id: 'petitfaim1',
        name: 'Hot Dog',
        description: 'Pain hot dog et saucisse sauce au choix',
        price: 4.00,
        rating: 75,
        reviews: 16,
        popular: false,
        image: productImages.hotDog,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          }
        }
      },
      {
        id: 'petitfaim2',
        name: 'Croq',
        description: 'Pain retourné et toasté, 2 tranches de fromages fondu, une tranche de dinde.',
        price: 4.00,
        rating: 84,
        reviews: 32,
        popular: false,
        image: productImages.croque
      },
      {
        id: 'petitfaim3',
        name: 'Hot Dogs Cryspi',
        description: 'Pain hot dog, saucisse Hot dog, cheddar, oignon frit, sauce au choix',
        price: 4.50,
        rating: 72,
        reviews: 11,
        popular: false,
        image: productImages.hotDogCrispy,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          }
        }
      },
      {
        id: 'petitfaim4',
        name: "Double Pti' Cheese",
        description: '2 steak 50 g, double cheddar, sauce au choix',
        price: 5.00,
        rating: 77,
        reviews: 9,
        popular: false,
        image: productImages.doublePtitCheese,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          }
        }
      },
      {
        id: 'petitfaim5',
        name: "Pti' Cheese",
        description: '60 gr steak frais, cheddar Sauce au choix',
        price: 4.00,
        rating: 81,
        reviews: 32,
        popular: false,
        image: productImages.cheese,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelection: 1,
            maxSelection: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
            ]
          }
        }
      },
      {
        id: 'petitfaim6',
        name: 'Croq Chèvre Miel',
        description: 'jambon, fromage de chèvre, miel',
        price: 5.00,
        rating: 100,
        reviews: 13,
        popular: false,
        image: productImages.croqChevreMiel
      },
    ],
    [ProductCategory.TEX_MEX]: [
      {
        id: 'texmex2',
        name: 'Tenders x3',
        description: 'x3 Pièces',
        price: 5.00,
        rating: 83,
        reviews: 62,
        popular: false,
        image: productImages.tenders
      },
      {
        id: 'texmex2-x6',
        name: 'Tenders x6',
        description: 'x6 Pièces',
        price: 8.00,
        rating: 83,
        reviews: 62,
        popular: false,
        image: productImages.tenders
      },
      {
        id: 'texmex6',
        name: 'Nuggets x3',
        description: 'x3 Pièces',
        price: 3.50,
        rating: 91,
        reviews: 34,
        popular: false,
        image: productImages.nuggets
      },
      {
        id: 'texmex6-x6',
        name: 'Nuggets x6',
        description: 'x6 Pièces',
        price: 6.00,
        rating: 91,
        reviews: 34,
        popular: false,
        image: productImages.nuggets
      },
      {
        id: 'texmex3',
        name: 'Wings x3',
        description: 'x3 Pièces',
        price: 3.50,
        image: productImages.wings,
        rating: 86,
        reviews: 23,
        popular: false
      },
      {
        id: 'texmex3-x6',
        name: 'Wings x6',
        description: 'x6 Pièces',
        price: 6.00,
        image: productImages.wings,
        rating: 86,
        reviews: 23,
        popular: false
      },
      {
        id: 'texmex7',
        name: 'Bouchées Camembert x3',
        description: 'x3 Pièces',
        price: 3.50,
        rating: 90,
        reviews: 55,
        popular: false,
        image: productImages.boucheeCamembert
      },
      {
        id: 'texmex7-x6',
        name: 'Bouchées Camembert x6',
        description: 'x6 Pièces',
        price: 5.50,
        rating: 90,
        reviews: 55,
        popular: false,
        image: productImages.boucheeCamembert
      },
      {
        id: 'texmex1',
        name: 'Sticks Mozza x3',
        description: 'x3 Pièces',
        price: 3.50,
        rating: 80,
        reviews: 72,
        popular: false,
        image: productImages.sticksMozza
      },
      {
        id: 'texmex1-x6',
        name: 'Sticks Mozza x6',
        description: 'x6 Pièces',
        price: 5.50,
        rating: 80,
        reviews: 72,
        popular: false,
        image: productImages.sticksMozza
      },
      {
        id: 'texmex5',
        name: 'Chili Cheese x3',
        description: 'x3 Pièces',
        price: 3.50,
        rating: 80,
        reviews: 20,
        popular: false,
        image: productImages.chilliCheese
      },
      {
        id: 'texmex5-x6',
        name: 'Chili Cheese x6',
        description: 'x6 Pièces',
        price: 5.50,
        rating: 80,
        reviews: 20,
        popular: false,
        image: productImages.chilliCheese
      },
      {
        id: 'texmex8',
        name: 'Onions Rings x3',
        description: 'x3 Pièces',
        price: 2.00,
        rating: 85,
        reviews: 21,
        popular: false,
        image: productImages.onionRings
      },
      {
        id: 'texmex8-x6',
        name: 'Onions Rings x6',
        description: 'x6 Pièces',
        price: 3.00,
        rating: 85,
        reviews: 21,
        popular: false,
        image: productImages.onionRings
      },
      {
        id: 'texmex9',
        name: 'Falafels x3',
        description: 'x3 Pièces',
        price: 3.00,
        image: productImages.defaultImage,
        rating: 82,
        reviews: 18,
        popular: false
      },
      {
        id: 'texmex9-x6',
        name: 'Falafels x6',
        description: 'x6 Pièces',
        price: 5.50,
        image: productImages.defaultImage,
        rating: 82,
        reviews: 18,
        popular: false
      },
    ],
    [ProductCategory.FRITES_GARNIES]: [
      {
        id: 'frites1',
        name: 'Frites cheddar bacon et oignons frits 🍟🥓🧅',
        description: 'Frites cheddar bacon et oignons frits',
        price: 6.50,
        rating: 93,
        reviews: 48,
        popular: false,
        image: productImages.fritesCheddarBacon,
      },
      {
        id: 'frites2',
        name: 'Barquette de frites 🍟',
        description: 'Barquette de frites 🍟',
        price: 3.50,
        rating: 87,
        reviews: 49,
        popular: false,
        image: productImages.barquetteFrites,
      },
      {
        id: 'frites3',
        name: 'Frites Cheddar bacon 🍟🥓',
        description: 'Frites Cheddar bacon 🍟🥓',
        price: 5.90,
        image: productImages.fritesCheddarBacon,
        rating: 83,
        reviews: 144,
        popular: false,
      },
      {
        id: 'frites4',
        name: 'Frites Cheddar 🍟',
        description: 'Frites Cheddar 🍟',
        price: 5.50,
        rating: 83,
        reviews: 43,
        popular: false,
        image: productImages.fritesCheddar,
      },
      {
        id: 'frites5',
        name: 'Frites et sauce fromagère 🍟',
        description: 'Frites et sauce fromagère maison',
        price: 5.90,
        rating: 91,
        reviews: 81,
        popular: false,
        image: productImages.fritesSauceFromagere,
      },
      {
        id: 'frites6',
        name: 'Frites cheddar aux oignons frits 🍟🧅',
        description: 'Frites cheddar aux oignons frits 🍟🧅',
        price: 5.90,
        image: productImages.fritesSauceFromagereOnionsFrits,
        rating: 82,
        reviews: 28,
        popular: false,
      },
      {
        id: 'frites7',
        name: 'Frites sauce fromagère bacon 🍟',
        description: 'Frites sauce fromagère maison bacon',
        price: 5.90,
        image: productImages.fritesSauceFromagereBaconOignonsFrits,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'frites8',
        name: 'Frites sauce fromagère oignons frits 🍟',
        description: 'Frites sauce fromagère maison oignon frits',
        price: 5.90,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fritesSauceFromagereOnionsFrits,
      },
      {
        id: 'frites9',
        name: 'Frites sauce fromagère bacon et oignons frits 🍟',
        description: 'Frites sauce fromagère maison bacon et oignon frits',
        price: 6.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fritesSauceFromagereBaconOignonsFrits,
      },
    ],
    [ProductCategory.SALADES]: [
      {
        id: 'salade1',
        name: 'Salade chicken 🥗',
        description: 'Poulet croustillant, salade, croutons, tomate cerises, Parmesan et oignons frits.',
        price: 12.00,
        rating: 92,
        reviews: 26,
        image: productImages.saladeChicken,
        popular: false,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-salade1', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-salade1', name: 'Oui, du pain svp', price: 0.50 },
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'salade2',
        name: 'Salade chèvre miel 🥗',
        description: 'Salade, tomates cerises, croutons, bouchées de chèvre, miel et oignons frits.',
        price: 12.00,
        rating: 89,
        reviews: 55,
        popular: false,
        image: productImages.saladeChevreMiel,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-salade2', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-salade2', name: 'Oui, du pain svp', price: 0.50 },
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'salade3',
        name: 'Salade saumon',
        description: 'Salade, Tomate, Oignons Rouges, Vinaigrette, Croûtons, Jus de Citron, Saumon Fumé, Aneth.',
        price: 13.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.saladeSaumon,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-salade3', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-salade3', name: 'Oui, du pain svp', price: 0.50 },
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'salade4',
        name: 'Salade crudités',
        description: 'Salade, Tomate, Oignons Rouges, Champignon de Paris, Poivron Cuit, Croûtons, Vinaigrette.',
        price: 12.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.saladeCrudités,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-salade4', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-salade4', name: 'Oui, du pain svp', price: 0.50 },
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'salade5',
        name: 'Salade Tomate Mozza',
        description: 'Salade, Tomate, Mozzarella, Huile D\'olive et Balsamique',
        price: 12.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.saladeTomateMozza,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pas-de-pain-salade5', name: 'Non, pas de pain merci', price: 0.00 },
              { id: 'pain-salade5', name: 'Oui, du pain svp', price: 0.50 },
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.DESSERTS]: [
      {
        id: 'tiramisu-du-moment',
        name: 'Tiramisu du moment',
        description: 'Tiramisu fait maison avec le goût de votre choix',
        price: 3.50,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.tiramisuNutellaSpeculos,
        customizable: true,
        customizationOptions: {
          gout: {
            title: 'Choix du goût',
            subtitle: 'Sélectionnez votre parfum préféré.',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella-speculoos', name: 'Nutella Spéculoos', price: 0, popular: true },
              { id: 'oreo', name: 'Oréo', price: 0 },
              { id: 'speculoos-caramel', name: 'Spéculoos Caramel', price: 0 },
              { id: 'chocolat-blanc', name: 'Chocolat Blanc', price: 0 }
            ]
          }
        }
      },
      {
        id: 'dessert4',
        name: 'Tarte au Daim',
        description: 'Tarte au Daim',
        price: 3.00,
        rating: 92,
        reviews: 39,
        popular: false,
        image: productImages.tarteDaim,
      },
      {
        id: 'dessert5',
        name: 'Gaufre',
        description: 'Parfum au choix.',
        price: 4.50,
        rating: 92,
        reviews: 68,
        popular: false,
        image: productImages.Gaufre,
        customizable: true,
        customizationOptions: {
          gout: {
            title: 'Choix du goût',
            subtitle: 'Choisissez votre nappage.',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'caramel', name: 'Caramel', price: 0 }
            ]
          },
          supplement: {
            title: 'Supplément',
            subtitle: 'Ajoutez de la chantilly.',
            required: false,
            minSelections: 0,
            maxSelections: 5,
            allowQuantity: true,
            options: [
              { id: 'chantilly', name: 'Chantilly', price: 0.50 }
            ]
          }
        }
      },
      {
        id: 'dessert-gauffre-gourmande',
        name: 'Gauffre gourmande',
        description: 'Gauffre nappage au choix et mélange de topping (kinder, oréo, m&m\'s ...)',
        price: 7.50,
        image: productImages.defaultImage,
        rating: null,
        reviews: 0,
        popular: false,
        customizable: true,
        customizationOptions: {
          gout: {
            title: 'Fais ton choix',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
              { id: 'creme-speculoos', name: 'Crème de Speculoos', price: 0 },
              { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 }
            ]
          },
          chantilly: {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
              { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
            ]
          }
        }
      },
      {
        id: 'dessert8',
        name: 'Pizza briochée Nutella',
        description: 'Pizza briochée Nutella',
        price: 9.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.pizzaBrioche,
        customizable: true,
        customizationOptions: {
          gout: {
            title: 'Choisis ton nappage',
            subtitle: 'Obligatoire.',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'chocolat-noisette', name: 'Chocolat noisette', price: 0 },
              { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
              { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 },
              { id: 'creme-speculoos', name: 'Crème de spéculoos', price: 0 }
            ]
          },
          topping: {
            title: 'Choix de topping',
            subtitle: 'Obligatoire.',
            required: true,
            minSelections: 1,
            maxSelections: 7,
            allowQuantity: true,
            options: [
              { id: 'nutella-topping', name: 'Nutella', price: 1.00 },
              { id: 'kinder-bueno', name: 'Kinder Bueno', price: 1.00 },
              { id: 'kinder-bueno-white', name: 'Kinder Bueno White', price: 1.00 },
              { id: 'kinder-country', name: 'Kinder Country', price: 1.00 },
              { id: 'oreo', name: 'Oreo', price: 1.00 },
              { id: 'mms', name: 'M&M\'s', price: 1.00 },
              { id: 'speculoos', name: 'Speculoos', price: 1.00 },
              { id: 'banane', name: 'Banane', price: 1.00 }
            ]
          },
          chantilly: {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 1.50 },
              { id: 'pas-chantilly', name: 'Non, pas de chantilly merci', price: 0.00 }
            ]
          }
        }
      },
      {
        id: 'milkshake-custom',
        name: 'Milkshake 🧋',
        description: 'Délicieux milkshake avec votre base préférée',
        price: 5.00,
        rating: 93,
        reviews: 89,
        popular: true,
        image: productImages.MilkshakeVanille,
        customizable: true,
        customizationOptions: {
          base: {
            title: 'Choix de la base',
            subtitle: 'Choisissez votre parfum préféré.',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'vanille', name: 'Vanille', price: 0 },
              { id: 'fraise', name: 'Fraise', price: 0 },
              { id: 'pistache', name: 'Pistache', price: 0 }
            ]
          },
          supplement: {
            title: 'Vous souhaitez commander :',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'boule-vanille', name: 'Boule vanille', price: 1.00 },
              { id: 'boule-fraise', name: 'Boule fraise', price: 1.00 },
              { id: 'boule-pistache', name: 'Boule pistache', price: 1.00 }
            ]
          },
          topping: {
            title: 'Choix de topping',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'kinder-bueno', name: 'Kinder Bueno', price: 0 },
              { id: 'kinder-bueno-white', name: 'Kinder Bueno White', price: 0 },
              { id: 'kinder-country', name: 'Kinder Country', price: 0 },
              { id: 'oreo', name: 'Oreo', price: 0 },
              { id: 'mms', name: 'M&M\'s', price: 0 },
              { id: 'speculoos', name: 'Speculoos', price: 0 },
              { id: 'banane', name: 'Banane', price: 0 }
            ]
          },
          supplements: {
            title: 'Suppléments de toppings',
            required: false,
            minSelections: 0,
            maxSelections: 10,
            options: [
              { id: 'sup-nutella', name: 'Nutella', price: 1.00 },
              { id: 'sup-kinder-bueno', name: 'Kinder Bueno', price: 1.00 },
              { id: 'sup-kinder-bueno-white', name: 'Kinder Bueno White', price: 1.00 },
              { id: 'sup-kinder-country', name: 'Kinder Country', price: 1.00 },
              { id: 'sup-oreo', name: 'Oreo', price: 1.00 },
              { id: 'sup-mms', name: 'M&M\'s', price: 1.00 },
              { id: 'sup-speculoos', name: 'Speculoos', price: 1.00 },
              { id: 'sup-banane', name: 'Banane', price: 1.00 }
            ]
          },
          chantilly: {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
              { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
            ]
          }
        }
      },
      {
        id: 'dessert-donuts',
        name: 'Donuts',
        description: 'Selon disposition du soir (kinder bueno, oréo, daim ...)',
        price: 3.50,
        image: productImages.defaultImage,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'dessert-hotdog-sucre',
        name: 'Hot dog sucré',
        description: 'Hot dog sucré',
        price: 5.00,
        image: productImages.defaultImage,
        rating: null,
        reviews: 0,
        popular: false,
        customizable: true,
        customizationOptions: {
          base: {
            title: 'Vous souhaitez commander :',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'banane', name: 'Banane', price: 0 },
              { id: 'kinder-bueno', name: 'Kinder bueno', price: 0 },
              { id: 'kinder-bueno-white', name: 'Kinder bueno white', price: 0 }
            ]
          },
          gout: {
            title: 'Choisis ton nappage',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'chocolat-noisette', name: 'Chocolat noisette', price: 0 },
              { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
              { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 },
              { id: 'creme-speculoos', name: 'Crème de spéculoos', price: 0 }
            ]
          },
          supplement: {
            title: 'Vous souhaitez commander :',
            required: false,
            minSelections: 0,
            maxSelections: 10,
            options: [
              { id: 'sup-kinder-bueno', name: 'Kinder bueno', price: 1.00 },
              { id: 'sup-kinder-bueno-white', name: 'Kinder bueno white', price: 1.00 },
              { id: 'sup-kinder-country', name: 'Kinder country', price: 1.00 },
              { id: 'sup-speculoos', name: 'Spéculoos', price: 1.00 },
              { id: 'sup-oreo', name: 'Oréo', price: 1.00 },
              { id: 'sup-mms', name: 'M&M\'s', price: 1.00 }
            ]
          },
          chantilly: {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
              { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
            ]
          }
        }
      },
    ],
    [ProductCategory.PIZZDWICH]: [
      {
        id: 'pizzdwich-m',
        name: 'Pizzdwich M',
        description: 'Pizzdwich garni sauce et crudités au choix',
        price: 7.50,
        image: productImages.pizzdwich,
        popular: false,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'chili-tai', name: 'Chili thaï', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0.00 }
            ]
          },
          viande: {
            title: 'Choisis ta viande',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'poulet', name: 'Poulet', price: 0.00 },
              { id: 'kebab', name: 'Kebab', price: 0.00 },
              { id: 'merguez', name: 'Merguez', price: 0.00 },
              { id: 'steak', name: 'Steak', price: 0.00 },
              { id: 'falafel', name: 'Falafel', price: 0.00 },
              { id: 'tenders', name: 'Tenders', price: 0.50 },
              { id: 'kfta', name: 'Kfta', price: 0.00 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0.00 },
              { id: 'nuggets', name: 'Nuggets', price: 0.00 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
            ]
          },
          supplements: {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 3,
            options: [
              { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'oeufs', name: 'Oeufs', price: 1.00 },
              { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
              { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
              { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
              { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
              { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizzdwich-l',
        name: 'Pizzdwich L',
        description: 'Pizzdwich garni sauce et crudités au choix - 2 viandes',
        price: 9.50,
        image: productImages.pizzdwich,
        popular: false,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'chili-tai', name: 'Chili thaï', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0.00 }
            ]
          },
          viande: {
            title: 'Choisis tes 2 viandes',
            required: true,
            multiSelect: true,
            minSelections: 2,
            maxSelections: 2,
            options: [
              { id: 'poulet', name: 'Poulet', price: 0.00 },
              { id: 'kebab', name: 'Kebab', price: 0.00 },
              { id: 'merguez', name: 'Merguez', price: 0.00 },
              { id: 'steak', name: 'Steak', price: 0.00 },
              { id: 'falafel', name: 'Falafel', price: 0.00 },
              { id: 'tenders', name: 'Tenders', price: 0.50 },
              { id: 'kfta', name: 'Kfta', price: 0.00 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0.00 },
              { id: 'nuggets', name: 'Nuggets', price: 0.00 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
            ]
          },
          supplements: {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 3,
            options: [
              { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'oeufs', name: 'Oeufs', price: 1.00 },
              { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
              { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
              { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
              { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
              { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizzdwich-xl',
        name: 'Pizzdwich XL',
        description: 'Pizzdwich garni sauce et crudités au choix - 3 viandes',
        price: 11.50,
        image: productImages.pizzdwich,
        popular: false,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'chili-tai', name: 'Chili thaï', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0.00 }
            ]
          },
          viande: {
            title: 'Choisis tes 3 viandes',
            required: true,
            multiSelect: true,
            minSelections: 3,
            maxSelections: 3,
            options: [
              { id: 'poulet', name: 'Poulet', price: 0.00 },
              { id: 'kebab', name: 'Kebab', price: 0.00 },
              { id: 'merguez', name: 'Merguez', price: 0.00 },
              { id: 'steak', name: 'Steak', price: 0.00 },
              { id: 'falafel', name: 'Falafel', price: 0.00 },
              { id: 'tenders', name: 'Tenders', price: 0.50 },
              { id: 'kfta', name: 'Kfta', price: 0.00 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0.00 },
              { id: 'nuggets', name: 'Nuggets', price: 0.00 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
            ]
          },
          supplements: {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 3,
            options: [
              { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'oeufs', name: 'Oeufs', price: 1.00 },
              { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
              { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
              { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
              { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
              { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
      {
        id: 'pizzdwich-xxl',
        name: 'Pizzdwich XXL',
        description: 'Pizzdwich garni sauce et crudités au choix - 4 viandes',
        price: 13.50,
        image: productImages.pizzdwich,
        popular: false,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'chili-tai', name: 'Chili thaï', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0.00 }
            ]
          },
          viande: {
            title: 'Choisis tes 4 viandes',
            required: true,
            multiSelect: true,
            minSelections: 4,
            maxSelections: 4,
            options: [
              { id: 'poulet', name: 'Poulet', price: 0.00 },
              { id: 'kebab', name: 'Kebab', price: 0.00 },
              { id: 'merguez', name: 'Merguez', price: 0.00 },
              { id: 'steak', name: 'Steak', price: 0.00 },
              { id: 'falafel', name: 'Falafel', price: 0.00 },
              { id: 'tenders', name: 'Tenders', price: 0.50 },
              { id: 'kfta', name: 'Kfta', price: 0.00 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0.00 },
              { id: 'nuggets', name: 'Nuggets', price: 0.00 }
            ]
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
              { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
              { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
              { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
              { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
              { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
              { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
              { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
              { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
              { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
            ]
          },
          supplements: {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 3,
            options: [
              { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'oeufs', name: 'Oeufs', price: 1.00 },
              { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
              { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
              { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
              { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
              { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
              { id: 'bacon', name: 'Bacon', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.BOISSONS]: [
      // === COCA-COLA ===
      {
        id: 'cocacola',
        name: 'Coca-Cola',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.coca,
      },
      {
        id: 'cocacola-zero',
        name: 'Coca-Cola Zéro',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.cocaZero,
      },
      {
        id: 'cocacola-cherry',
        name: 'Coca-Cola Cherry',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.cocaCherry,
      },
      // === FANTA ===
      {
        id: 'fanta-orange',
        name: 'Fanta Orange',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fanta,
      },
      {
        id: 'fanta-framboise',
        name: 'Fanta Framboise',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.fantaBerry,
      },
      {
        id: 'fanta-fruit-dragon',
        name: 'Fanta Fruit du Dragon',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fantaDragon,
      },
      // === ORANGINA / SCHWEPPES ===
      {
        id: 'orangina',
        name: 'Orangina',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.orangina,
      },
      {
        id: 'schweppes',
        name: 'Schweppes',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.schweppes,
      },
      // === 7UP ===
      {
        id: '7up-original',
        name: '7 Up Original',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.sprite,
      },
      {
        id: '7up-mojito',
        name: '7 Up Mojito',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.sevenupMojito,
      },
      // === OASIS ===
      {
        id: 'oasis-tropical',
        name: 'Oasis Tropical',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oasisTropical,
      },
      {
        id: 'oasis-cassis-framboise',
        name: 'Oasis Cassis Framboise',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oasisPommeCassisFramboise,
      },
      {
        id: 'oasis-fraise-framboise',
        name: 'Oasis Fraise Framboise',
        description: 'Cannette 33 cl ou Bouteille 2L.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oasisFraiseFramboise,
        sizes: {
          'Cannette': { name: 'Cannette 33cl', price: 2.00 },
          'Bouteille': { name: 'Bouteille 2L', price: 4.50 }
        },
      },
      // === THÉ GLACÉ ===
      {
        id: 'lipton-peche',
        name: 'Lipton Pêche',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.iceTeaPeche,
      },
      {
        id: 'lipton-pasteque-menthe',
        name: 'Lipton Pastèque Menthe',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.iceTeaPeche,
      },
      // === FRUITÉ ===
      {
        id: 'hawaii',
        name: 'Hawaï',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.hawai,
      },
      {
        id: 'capri-sun',
        name: 'Capri Sun Multi Fruit',
        description: '20 cl.',
        price: 1.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.capriSun,
      },
      // === EAU ===
      {
        id: 'cristalline',
        name: 'Cristalline',
        description: '50 cl.',
        price: 1.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.cristalline,
      },
      {
        id: 'perrier',
        name: 'Perrier',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.perrier,
      },
      // === ENERGY ===
      {
        id: 'redbull',
        name: 'Red Bull',
        description: '25 cl.',
        price: 3.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.redbull,
      },
      {
        id: 'monster',
        name: 'Monster',
        description: '50 cl.',
        price: 3.50,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.monsterEnergy,
      },
      // === BOUTEILLES ===
      {
        id: 'bouteille-cocacola',
        name: 'Bouteille Coca-Cola',
        description: '1.5 L',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.cocaColaBouteille,
      },
      {
        id: 'bouteille-cocacola-zero',
        name: 'Bouteille Coca-Cola Zéro',
        description: '1.5 L',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.cocaZeroBouteille,
      },
      {
        id: 'bouteille-cocacola-cherry',
        name: 'Bouteille Coca-Cola Cherry',
        description: '1.5 L',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.cocaCherryBouteille,
      },
      {
        id: 'bouteille-fanta-orange',
        name: 'Bouteille Fanta Orange',
        description: '1.5 L',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fantaBouteille,
      },
      {
        id: 'bouteille-orangina',
        name: 'Bouteille Orangina',
        description: '1.5 L',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oranginabouteille,
      },
    ],
    [ProductCategory.FORMULES_PIZZA_DUO]: [
      {
        id: 'formule-pizza-duo',
        name: 'Formule Pizza Duo',
        description: '2 pizzas M, servi avec 1 grande bouteille au choix.',
        price: 25.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.formuleDuo,
        customizable: true,
        customizationOptions: {
          pizza1: {
            title: 'Choix Pizza 1 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-margherita-1', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-fermiere-1', name: 'Pizza Fermière', price: 0.00 },
              { id: 'pizza-kebab-raclette-1', name: 'Pizza Kebab raclette', price: 0.00 },
              { id: 'pizza-cannibale-1', name: 'Pizza Cannibale', price: 0.00 },
              { id: 'pizza-saumon-1', name: 'Pizza Saumon', price: 0.00 },
              { id: 'pizza-chevre-miel-1', name: 'Pizza Chèvre miel', price: 0.00 },
              { id: 'pizza-chevre-poulet-1', name: 'Pizza Chèvre Poulet', price: 0.00 },
              { id: 'pizza-curry-1', name: 'Pizza Curry', price: 0.00 },
              { id: 'pizza-kebab-1', name: 'Pizza Kebab', price: 0.00 },
              { id: 'pizza-tex-mex-1', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-burger-1', name: 'Pizza Burger', price: 0.00 },
              { id: 'pizza-4-fromages-1', name: 'Pizza 4 fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-1', name: 'Pizza Chèvre Figue', price: 0.00 },
              { id: 'pizza-raclette-1', name: 'Pizza Raclette', price: 0.00 }
            ]
          },
          pizza2: {
            title: 'Choix Pizza 2 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-margherita-2', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-fermiere-2', name: 'Pizza Fermière', price: 0.00 },
              { id: 'pizza-kebab-raclette-2', name: 'Pizza Kebab raclette', price: 0.00 },
              { id: 'pizza-cannibale-2', name: 'Pizza Cannibale', price: 0.00 },
              { id: 'pizza-saumon-2', name: 'Pizza Saumon', price: 0.00 },
              { id: 'pizza-chevre-miel-2', name: 'Pizza Chèvre miel', price: 0.00 },
              { id: 'pizza-chevre-poulet-2', name: 'Pizza Chèvre Poulet', price: 0.00 },
              { id: 'pizza-curry-2', name: 'Pizza Curry', price: 0.00 },
              { id: 'pizza-kebab-2', name: 'Pizza Kebab', price: 0.00 },
              { id: 'pizza-tex-mex-2', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-burger-2', name: 'Pizza Burger', price: 0.00 },
              { id: 'pizza-4-fromages-2', name: 'Pizza 4 fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-2', name: 'Pizza Chèvre Figue', price: 0.00 },
              { id: 'pizza-raclette-2', name: 'Pizza Raclette', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Choix Grande Bouteille',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'coca-125-duo', name: 'Bouteille Coca-cola 1.25 L', price: 0.00 },
              { id: 'coca-zero-125-duo', name: 'Bouteille Coca-cola zéro 1.25 L', price: 0.00 },
              { id: 'coca-cherry-125-duo', name: 'Bouteille Coca Cherry 1.25 L', price: 0.00 },
              { id: 'fanta-orange-15-duo', name: 'Bouteille Fanta Orange 1.50 L', price: 0.00 },
              { id: 'orangina-15-duo', name: 'Bouteille Orangina 1.5L', price: 0.00 },
              { id: 'ice-tea-125-duo', name: 'Bouteille Ice Tea 1.25 L', price: 0.00 },
              { id: 'oasis-tropical-2l-duo', name: 'Bouteille Oasis Tropical 2L', price: 0.00 },
              { id: 'oasis-pcf-2l-duo', name: 'Bouteille Oasis Pomme Cassis Framboise 2L', price: 0.00 },
              { id: 'cristaline-15-duo', name: 'Bouteille Cristaline 1.5L', price: 0.00 }
            ]
          }
        }
      },
    ],
    [ProductCategory.FORMULES_PIZZA_TRIO]: [
      {
        id: 'formule-pizza-trio',
        name: 'Formule Pizza Trio',
        description: '3 pizzas M, servi avec 1 grande bouteille au choix.',
        price: 31.50,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.formuleTrio,
        customizable: true,
        customizationOptions: {
          pizza1: {
            title: 'Choix Pizza 1 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-margherita-1', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-fermiere-1', name: 'Pizza Fermière', price: 0.00 },
              { id: 'pizza-kebab-raclette-1', name: 'Pizza Kebab raclette', price: 0.00 },
              { id: 'pizza-cannibale-1', name: 'Pizza Cannibale', price: 0.00 },
              { id: 'pizza-saumon-1', name: 'Pizza Saumon', price: 0.00 },
              { id: 'pizza-chevre-miel-1', name: 'Pizza Chèvre miel', price: 0.00 },
              { id: 'pizza-chevre-poulet-1', name: 'Pizza Chèvre Poulet', price: 0.00 },
              { id: 'pizza-curry-1', name: 'Pizza Curry', price: 0.00 },
              { id: 'pizza-kebab-1', name: 'Pizza Kebab', price: 0.00 },
              { id: 'pizza-tex-mex-1', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-burger-1', name: 'Pizza Burger', price: 0.00 },
              { id: 'pizza-4-fromages-1', name: 'Pizza 4 fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-1', name: 'Pizza Chèvre Figue', price: 0.00 },
              { id: 'pizza-raclette-1', name: 'Pizza Raclette', price: 0.00 }
            ]
          },
          pizza2: {
            title: 'Choix Pizza 2 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-margherita-2', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-fermiere-2', name: 'Pizza Fermière', price: 0.00 },
              { id: 'pizza-kebab-raclette-2', name: 'Pizza Kebab raclette', price: 0.00 },
              { id: 'pizza-cannibale-2', name: 'Pizza Cannibale', price: 0.00 },
              { id: 'pizza-saumon-2', name: 'Pizza Saumon', price: 0.00 },
              { id: 'pizza-chevre-miel-2', name: 'Pizza Chèvre miel', price: 0.00 },
              { id: 'pizza-chevre-poulet-2', name: 'Pizza Chèvre Poulet', price: 0.00 },
              { id: 'pizza-curry-2', name: 'Pizza Curry', price: 0.00 },
              { id: 'pizza-kebab-2', name: 'Pizza Kebab', price: 0.00 },
              { id: 'pizza-tex-mex-2', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-burger-2', name: 'Pizza Burger', price: 0.00 },
              { id: 'pizza-4-fromages-2', name: 'Pizza 4 fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-2', name: 'Pizza Chèvre Figue', price: 0.00 },
              { id: 'pizza-raclette-2', name: 'Pizza Raclette', price: 0.00 }
            ]
          },
          pizza3: {
            title: 'Choix Pizza 3 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-margherita-3', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-fermiere-3', name: 'Pizza Fermière', price: 0.00 },
              { id: 'pizza-kebab-raclette-3', name: 'Pizza Kebab raclette', price: 0.00 },
              { id: 'pizza-cannibale-3', name: 'Pizza Cannibale', price: 0.00 },
              { id: 'pizza-saumon-3', name: 'Pizza Saumon', price: 0.00 },
              { id: 'pizza-chevre-miel-3', name: 'Pizza Chèvre miel', price: 0.00 },
              { id: 'pizza-chevre-poulet-3', name: 'Pizza Chèvre Poulet', price: 0.00 },
              { id: 'pizza-curry-3', name: 'Pizza Curry', price: 0.00 },
              { id: 'pizza-kebab-3', name: 'Pizza Kebab', price: 0.00 },
              { id: 'pizza-tex-mex-3', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-burger-3', name: 'Pizza Burger', price: 0.00 },
              { id: 'pizza-4-fromages-3', name: 'Pizza 4 fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-3', name: 'Pizza Chèvre Figue', price: 0.00 },
              { id: 'pizza-raclette-3', name: 'Pizza Raclette', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Choix Grande Bouteille',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'coca-125', name: 'Bouteille Coca-cola 1.25 L', price: 0.00 },
              { id: 'coca-zero-125', name: 'Bouteille Coca-cola zéro 1.25 L', price: 0.00 },
              { id: 'coca-cherry-125', name: 'Bouteille Coca Cherry 1.25 L', price: 0.00 },
              { id: 'fanta-orange-15', name: 'Bouteille Fanta Orange 1.50 L', price: 0.00 },
              { id: 'orangina-15', name: 'Bouteille Orangina 1.5L', price: 0.00 },
              { id: 'ice-tea-125', name: 'Bouteille Ice Tea 1.25 L', price: 0.00 },
              { id: 'oasis-tropical-2l', name: 'Bouteille Oasis Tropical 2L', price: 0.00 },
              { id: 'oasis-pcf-2l', name: 'Bouteille Oasis Pomme Cassis Framboise 2L', price: 0.00 },
              { id: 'cristaline-15', name: 'Bouteille Cristaline 1.5L', price: 0.00 }
            ]
          }
        }
      },
    ],
    [ProductCategory.BOWLS]: [
      {
        id: 'bowl-custom',
        name: 'Bowl',
        description: 'Bowl personnalisable avec taille et viandes au choix',
        price: 8.00,
        rating: null,
        reviews: 0,
        popular: true,
        customizable: true,
        image: productImages.bowls,
        sizes: {
          'M': { name: 'M (1 viande)', price: 8.00 },
          'L': { name: 'L (2 viandes)', price: 10.00 },
          'XL': { name: 'XL (3 viandes)', price: 12.00 },
          'XXL': { name: 'XXL (4 viandes)', price: 15.00 }
        },
        customizationOptions: {
          gratine: {
            title: 'Gratiné',
            subtitle: 'Faites gratiner votre bowl.',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'gratine-mozzarella', name: 'Mozzarella', price: 0 },
              { id: 'gratine-chevre-miel', name: 'Chèvre miel', price: 2.50 },
              { id: 'gratine-raclette-bacon', name: 'Raclette bacon', price: 2.50 },
              { id: 'gratine-cheddar-bacon', name: 'Cheddar bacon', price: 2.50 }
            ]
          },
          viandes: {
            title: 'Choix des viandes',
            subtitle: 'Nombre de viandes selon la taille choisie.',
            required: true,
            minSelections: 1,
            maxSelections: 4,
            options: [
              { id: 'poulet', name: 'Poulet', price: 0, popular: true },
              { id: 'kebab', name: 'Kebab', price: 0, popular: true },
              { id: 'tenders', name: 'Tenders', price: 0, popular: true },
              { id: 'nuggets', name: 'Nuggets', price: 0, popular: true },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0 },
              { id: 'merguez', name: 'Merguez', price: 0 },
              { id: 'viande-hachee', name: 'Viande hachée', price: 0 },
              { id: 'falafel', name: 'Falafel', price: 0 }
            ]
          },
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 }
            ]
          },
          supplement: {
            title: 'Suppléments',
            subtitle: 'Ajoutez des suppléments.',
            required: false,
            minSelections: 0,
            maxSelections: 6,
            options: [
              { id: 'bacon', name: 'Bacon', price: 1.00 },
              { id: 'oignon-frit', name: 'Oignon frit', price: 1.00 },
              { id: 'oignons-rings', name: 'Oignons rings', price: 2.00 },
              { id: 'chili-cheese', name: 'Chili cheese', price: 2.00 },
              { id: 'sauce-fromagere', name: 'Sauce fromagère maison', price: 1.00 },
              { id: 'cheddar', name: 'Cheddar', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'mozzarella', name: 'Mozzarella', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'boursin', name: 'Boursin', price: 1.00 },
              { id: 'vache-kiri', name: 'Vache kiri', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre bowl.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        }
      }
    ]
};

export default productsByCategory;
