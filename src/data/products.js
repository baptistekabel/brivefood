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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
        }
      },
      {
        id: '5',
        name: 'Pâtes 3 Fromages',
        description: 'Penne, Sauce 3 fromages, Cantal, Conté, Parmesan.',
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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
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
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
        }
      },
    ],
    [ProductCategory.PIZZA]: [
      {
        id: 'pizza1',
        name: 'Pizza fermière',
        description: 'Crème fraîche, poulet rôti, pommes de terre, champignons frais, origan et Mozzarella.',
        price: 14.50,
        popular: true,
        image: productImages.pizzaFermiere,
        sizes: {
          '29cm': { name: '29cm', price: 14.50 },
          '33cm': { name: '33cm', price: 18.00 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
        }
      },
      {
        id: 'pizza2',
        name: 'Pizza chèvre miel',
        description: 'Crème fraîche, chèvre, miel et Mozzarella.',
        price: 14.90,
        popular: false,
        image: productImages.pizzaChevreMiel,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza3',
        name: 'Pizza curry',
        description: 'Crème fraîche, poulet rôti, pommes de terre, poivrons, curry et Mozzarella.',
        price: 14.90,
        popular: false,
        image: productImages.pizzaCurry,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza4',
        name: 'Pizza kebab',
        description: 'Sauce tomate, kebab, poivrons, pomme de terre, oignons rouges, sauce blanche et Mozzarella.',
        price: 14.90,
        popular: false,
        image: productImages.pizzaKebab,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza5',
        name: 'Pizza western',
        description: 'Sauce tomate, chorizo, poivrons, œuf et Mozzarella.',
        price: 14.90,
        popular: false,
        rating: 100,
        reviews: 3,
        image: productImages.pizzaWestern,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza6',
        name: 'Pizza burger',
        description: 'Sauce tomate, viande hachée, Cheddar, cornichons, oignons rouges, sauce burger et Mozzarella.',
        price: 14.90,
        popular: true,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza7',
        name: 'Pizza Tex-Mex',
        description: 'Sauce tomate, viande hachée, merguez, poivrons, oignons rouges et Mozzarella.',
        price: 14.90,
        popular: false,
        image: productImages.pizzaTexMex,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza8',
        name: 'Pizza raclette',
        description: 'Crème fraîche, lardons de volailles, pommes de terre, oignons rouges, fromage à raclette et Mozzarella.',
        price: 14.90,
        popular: true,
        image: productImages.pizzaRaclette,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza9',
        name: 'Pizza saumon',
        description: 'Crème fraîche, saumon fumé frais, jus de citron, aneth et Mozzarella.',
        price: 16.90,
        popular: false,
        image: productImages.pizzaSaumon,
        sizes: {
          '29cm': { name: '29cm', price: 16.90 },
          '33cm': { name: '33cm', price: 20.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza10',
        name: 'Pizza Margherita',
        description: 'Sauce tomate, Mozzarella et olives.',
        price: 12.90,
        popular: false,
        image: productImages.pizzaMargherita,
        sizes: {
          '29cm': { name: '29cm', price: 12.90 },
          '33cm': { name: '33cm', price: 16.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza11',
        name: 'Pizza 4 Fromages',
        description: 'Sauce 3 fromages (cantal, conté, parmesan), mozzarella, base tomate',
        price: 14.90,
        popular: true,
        image: productImages.pizza4Fromages,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza12',
        name: 'Pizza chèvre figue',
        description: 'Crème fraîche, chèvre, confiture de figue et Mozzarella.',
        price: 14.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza13',
        name: 'Pizza chèvre poulet',
        description: 'Crème, poulet, chèvre, oignons rouges, olives et Mozzarella.',
        price: 15.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 15.90 },
          '33cm': { name: '33cm', price: 19.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza14',
        name: 'Pizza raclette poulet',
        description: 'Crème, poulet, raclette, pommes de terre, oignons rouges et Mozzarella.',
        price: 15.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 15.90 },
          '33cm': { name: '33cm', price: 19.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza15',
        name: 'Pizza spicy',
        description: 'Tomate, merguez, kefta, poivrons, oignons rouges, piments, olives et Mozzarella.',
        price: 14.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza16',
        name: 'Pizza chicken spicy',
        description: 'Tomate, poulet, poivrons, oignons rouges, piments et Mozzarella.',
        price: 14.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 14.90 },
          '33cm': { name: '33cm', price: 18.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza17',
        name: 'Pizza cannibale',
        description: 'Tomate, steak, merguez, poulet, oignons rouges, olives et Mozzarella.',
        price: 20.00,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 20.00 },
          '33cm': { name: '33cm', price: 23.50 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza18',
        name: 'Pizza kebab raclette',
        description: 'Tomate, kebab, oignons rouges, raclette, pommes terre et Mozzarella.',
        price: 15.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 15.90 },
          '33cm': { name: '33cm', price: 19.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'pizza19',
        name: 'Pizza Saumon Boursin',
        description: 'Creme, Saumon, pommes de terre, oignons, olives, Boursin et Mozzarella.',
        price: 15.90,
        popular: false,
        sizes: {
          '29cm': { name: '29cm', price: 15.90 },
          '33cm': { name: '33cm', price: 19.40 }
        },
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'burger4',
        name: 'Burger Chèvre Miel',
        description: 'Steak 120g, fromage de chèvre, oignon grillés, salade, sauce au choix',
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'burger7',
        name: 'Bacon B burger',
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'burger9',
        name: 'Burger Classique',
        description: 'Steak 120g, double cheddar, salade, oignon, sauce burger.',
        price: 13.00,
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
              { id: 'double-steak', name: 'Double Steak', price: 3.00 },
              { id: 'triple-steak', name: 'Triple Steak', price: 6.00 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
              { id: 'samourai', name: 'Samouraï', price: 0.00 },
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
              { id: 'brazil', name: 'Brazil', price: 0.00 },
              { id: 'curry', name: 'Curry', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 },
              { id: 'sriracha-pimente', name: 'Sriracha "pimenté', price: 0.00 },
              { id: 'harissa', name: 'Harissa', price: 0.00 },
              { id: 'algerienne', name: 'Algérienne', price: 0.00 },
              { id: 'andalouse', name: 'Andalouse', price: 0.00 },
              { id: 'big-mac', name: 'Big Mac', price: 0.00 },
              { id: 'marocaine', name: 'Marocaine', price: 0.00 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0.00 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
              { id: 'moutarde', name: 'Moutarde', price: 0.00 },
              { id: 'boursin', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre burger.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
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
          salade: {
            title: 'Supplément',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'salade-verte-lasagne1', name: 'Salade verte', price: 1.50 },
              { id: 'pas-de-salade-lasagne1', name: 'Sans supplément', price: 0.00 }
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
          salade: {
            title: 'Supplément',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'salade-verte-lasagne2', name: 'Salade verte', price: 1.50 },
              { id: 'pas-de-salade-lasagne2', name: 'Sans supplément', price: 0.00 }
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
          salade: {
            title: 'Supplément',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'salade-verte-lasagne3', name: 'Salade verte', price: 1.50 },
              { id: 'pas-de-salade-lasagne3', name: 'Sans supplément', price: 0.00 }
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
              { id: 'kebab', name: 'KEBAB', price: 0, popular: true },
              { id: 'cordon-bleu', name: 'CORDON BLEU', price: 0 },
              { id: 'nugget', name: 'NUGGET', price: 0, popular: true },
              { id: 'merguez', name: 'MERGUEZ', price: 0 },
              { id: 'tenders', name: 'TENDERS', price: 0, popular: true },
              { id: 'falafel', name: 'FALAFEL', price: 0 },
              { id: 'poulet', name: 'POULET', price: 0, popular: true },
              { id: 'escalope-poulet', name: 'ESCALOPE DE POULET', price: 0 },
              { id: 'poulet-boursin', name: 'POULET BOURSIN', price: 0 },
              { id: 'viande-hachee', name: 'VIANDE HACHEE', price: 0 },
              { id: 'steak-hache', name: 'STEAK HACHÉ', price: 0 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0, popular: true },
              { id: 'samourai', name: 'Samouraï', price: 0, popular: true },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0, popular: true },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha pimenté', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre tacos.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.SANDWICH_AMERICAIN]: [
      {
        id: 'americain1',
        name: 'Américain Bacon',
        description: 'Steak frais 110 gr, Cheddar, bacon, tomates, oignons grillés, salade et sauce au choix.',
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Choisissez-en 1 max.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Choisissez-en 1 max.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0 }
            ]
          }
        }
      },
      {
        id: 'americain3',
        name: 'Américain Classic',
        description: 'Steak frais 110 gr, salade, tomate et sauce au choix.',
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Choisissez-en 1 max.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0 }
            ]
          }
        }
      },
      {
        id: 'americain4',
        name: 'Américain Spicy Kefta',
        description: 'Kefta fraîche 110 gr, salade, poivrons grillés, oignons grillés, tomate grillées et sauce épicée et sauce au choix.',
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Choisissez-en 1 max.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50, popular: true }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Choisissez-en 1 max.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'frites-oui', name: 'Oui', price: 1.50, popular: true },
              { id: 'frites-non', name: 'Non', price: 0 }
            ]
          }
        }
      },
      {
        id: 'americain-double',
        name: 'Américain Double',
        description: 'C\'est toi le chef',
        price: 15.00,
        rating: 80,
        reviews: 31,
        popular: false,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Choix pain',
            subtitle: 'Choisissez-en 1 max.',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'pain-artisanal', name: 'Pain Artisanal', price: 0 },
              { id: 'galette', name: 'Galette', price: 0 }
            ]
          },
          viande: {
            title: 'Viande',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'steak', name: 'Steak', price: 0 },
              { id: 'poulet', name: 'Poulet', price: 0 },
              { id: 'escalope-poulet', name: 'Escalope de poulet', price: 0 },
              { id: 'steak-hache', name: 'Steak haché', price: 0 },
              { id: 'bacon', name: 'Bacon', price: 1.50 },
              { id: 'kebab', name: 'Kebab', price: 0 },
              { id: 'kefta', name: 'Kefta', price: 0 },
              { id: 'merguez', name: 'Merguez', price: 0 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Jusqu\'à 3 fromages.',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'mozzarella', name: 'Mozzarella', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: false,
            multiSelect: true,
            options: [
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'boursin', name: 'Boursin', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'oui-frites', name: 'Oui', price: 1.50 },
              { id: 'non-frites', name: 'Non', price: 0 }
            ]
          }
        }
      },
      {
        id: 'americain-simple',
        name: 'Américain Simple',
        description: 'C\'est toi le chef',
        price: 12.00,
        rating: 81,
        reviews: 16,
        popular: false,
        customizable: true,
        customizationOptions: {
          pain: {
            title: 'Choix pain',
            subtitle: 'Choisissez-en 1 max.',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'pain-artisanal', name: 'Pain Artisanal', price: 0 },
              { id: 'galette', name: 'Galette', price: 0 }
            ]
          },
          viande: {
            title: 'Viande',
            subtitle: 'Choisissez-en 1.',
            required: true,
            multiSelect: false,
            options: [
              { id: 'steak', name: 'Steak', price: 0 },
              { id: 'poulet', name: 'Poulet', price: 0 },
              { id: 'escalope-poulet', name: 'Escalope de poulet', price: 0 },
              { id: 'steak-hache', name: 'Steak haché', price: 0 },
              { id: 'bacon', name: 'Bacon', price: 1.50 },
              { id: 'kebab', name: 'Kebab', price: 0 },
              { id: 'kefta', name: 'Kefta', price: 0 },
              { id: 'merguez', name: 'Merguez', price: 0 },
              { id: 'cordon-bleu', name: 'Cordon bleu', price: 0 }
            ]
          },
          fromage: {
            title: 'Fromage',
            subtitle: 'Jusqu\'à 3 fromages.',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'mozzarella', name: 'Mozzarella', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 }
            ]
          },
          sauce: {
            title: 'Sauce',
            required: false,
            multiSelect: false,
            options: [
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'boursin', name: 'Boursin', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            required: false,
            multiSelect: false,
            options: [
              { id: 'oui-frites', name: 'Oui', price: 1.50 },
              { id: 'non-frites', name: 'Non', price: 0 }
            ]
          }
        }
      },
    ],
    [ProductCategory.MENU_KIDS]: [
      {
        id: 'menukids1',
        name: 'Menu kids',
        description: 'Plat, frites et Capri-Sun.',
        price: 9.00,
        rating: 87,
        reviews: 54,
        popular: false,
        customizable: true,
        image: 'MenuKidss',
        customizationOptions: {
          plat: {
            title: 'Choix du plat',
            required: true,
            multiSelect: false,
            options: [
              { name: 'Cheeseburger', price: 0.00 },
              { name: 'Nuggets', price: 0.00 }
            ]
          }
        }
      },
    ],
    [ProductCategory.BRUNCH]: [
      {
        id: 'menu-brunch',
        name: 'Menu Brunch',
        description: '1 boisson + 1 recette salée + 1 dessert au choix',
        price: 16.00,
        rating: 95,
        reviews: 48,
        popular: true,
        customizable: true,
        image: productImages.brunch,
        customizationOptions: {
          boisson: {
            title: 'Choisissez votre boisson',
            required: true,
            multiSelect: false,
            options: [
              { name: 'Jus d\'orange', price: 0.00 },
              { name: 'Jus de fraise', price: 0.00 },
              { name: 'Jus de citron', price: 0.00 },
              { name: 'Jus de mangue', price: 0.00 },
              { name: 'Café allongé', price: 0.00 },
              { name: 'Chocolat au lait', price: 0.00 }
            ]
          },
          recetteSalee: {
            title: 'Choisissez votre recette salée',
            required: true,
            multiSelect: false,
            options: [
              { name: 'Toast poulet Boursin', price: 0.00 },
              { name: 'Toast tomates burrata pesto', price: 2.00 },
              { name: 'Gaufres poulet Boursin', price: 0.00 },
              { name: 'Toast saumon', price: 2.00 }
            ]
          },
          dessert: {
            title: 'Choisissez votre dessert',
            required: true,
            multiSelect: false,
            options: [
              { name: 'Pancake topping Nutella', price: 0.00 },
              { name: 'Pancake topping caramel', price: 0.00 },
              { name: 'Pancake crème de speculoos', price: 0.00 },
              { name: 'Pancake topping miel', price: 0.00 },
              { name: 'Gaufre topping Nutella', price: 0.00 },
              { name: 'Gaufre topping caramel', price: 0.00 },
              { name: 'Gaufre crème de speculoos', price: 0.00 },
              { name: 'Gaufre topping miel', price: 0.00 },
              { name: 'En-cas fromage blanc musli + fruit', price: 0.00 },
              { name: 'Tiramisu du moment', price: 0.00 }
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
      },
    ],
    [ProductCategory.PETITES_FAIM]: [
      {
        id: 'petitfaim1',
        name: 'Hot Dog',
        description: 'Pain hot dog et saucisse sauce au choix',
        price: 6.50,
        rating: 75,
        reviews: 16,
        popular: false,
        image: productImages.hotDog,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'petitfaim2',
        name: 'Croque',
        description: 'Pain retourné et toasté, 2 tranches de fromages fondu, une tranche de dinde.',
        price: 5.50,
        rating: 84,
        reviews: 32,
        popular: false,
        image: productImages.croque,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'petitfaim3',
        name: 'Hot Dog Crispy',
        description: 'Pain hot dog, saucisse Hot dog, cheddar, oignon frit, sauce au choix',
        price: 6.90,
        rating: 72,
        reviews: 11,
        popular: false,
        image: productImages.hotDogCrispy,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'petitfaim4',
        name: 'Double ptit cheese',
        description: '2 steak 50 g, double cheddar, sauce au choix',
        price: 7.00,
        rating: 77,
        reviews: 9,
        popular: false,
        image: productImages.doublePtitCheese,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'petitfaim5',
        name: 'Ptit Cheese',
        description: '60 gr steak frais, cheddar Sauce au choix',
        price: 6.50,
        rating: 81,
        reviews: 32,
        popular: false,
        image: productImages.cheese,
        customizable: true,
        customizationOptions: {
          sauce: {
            title: 'Sauce',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            minSelections: 1,
            maxSelections: 2,
            options: [
              { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin-sauce', name: 'Boursin', price: 1.50 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'petitfaim6',
        name: 'Croq chèvre miel',
        description: 'jambon, fromage de chèvre, miel',
        price: 6.00,
        rating: 100,
        reviews: 13,
        popular: false,
        image: productImages.croqChevreMiel,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre petite faim.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          },
          frites: {
            title: 'Frites',
            subtitle: 'Ajoutez une portion de frites.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'frites-simple', name: 'Frites simple', price: 1.50 }
            ]
          }
        }
      },
    ],
    [ProductCategory.TEX_MEX]: [
      {
        id: 'texmex1',
        name: 'Sticks Mozza x 3',
        description: 'x 3 Pièces',
        price: 4.50,
        rating: 80,
        reviews: 72,
        popular: false,
        image: productImages.sticksMozza,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'texmex2',
        name: 'Tenders x 3',
        description: 'x 3 Pièces',
        price: 6.90,
        rating: 83,
        reviews: 62,
        popular: false,
        image: productImages.tenders,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'texmex3',
        name: 'Wings x 3',
        description: 'x 3 Pièces',
        price: 4.90,
        rating: 86,
        reviews: 23,
        popular: false,
        customizable: true,
        customizationOptions: {
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'cocacola', name: 'Coca-Cola', price: 1.50 },
              { id: 'cocacola-cherry', name: 'Coca-Cola Cherry', price: 1.50 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 1.50 },
              { id: 'fanta-berry', name: 'Fanta Berry (Fruits rouges)', price: 1.50 },
              { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)', price: 1.50 },
              { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)', price: 1.50 },
              { id: 'orangina', name: 'Orangina', price: 1.50 },
              { id: 'sprite', name: 'Sprite', price: 1.50 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 1.50 },
              { id: 'capri-sun', name: 'Capri Sun', price: 1.50 },
              { id: 'eau-plate', name: 'Eau plate', price: 1.50 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 1.50 }
            ]
          }
        }
      },
      {
        id: 'texmex4',
        name: 'Sticks chèvre x 3',
        description: 'x 3 Pièces',
        price: 4.50,
        rating: 78,
        reviews: 14,
        popular: false,
        image: productImages.sticksChevre,
      },
      {
        id: 'texmex5',
        name: 'Chilicheese x 3',
        description: 'x 3 pièces',
        price: 4.50,
        rating: 80,
        reviews: 20,
        popular: false,
        image: productImages.chilliCheese,
      },
      {
        id: 'texmex6',
        name: 'Nuggets x 3',
        description: 'x 3 Pièces',
        price: 4.90,
        rating: 91,
        reviews: 34,
        popular: false,
        image: productImages.nuggets,
      },
      {
        id: 'texmex7',
        name: 'Boucheés Camembert x 3',
        description: 'x 3 Pièces',
        price: 4.50,
        rating: 90,
        reviews: 55,
        popular: false,
        image: productImages.boucheeCamembert,
      },
      {
        id: 'texmex8',
        name: 'Oignons rings x 4',
        description: 'x 4 Pièces',
        price: 4.00,
        rating: 85,
        reviews: 21,
        popular: false,
        image: productImages.onionRings,
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
        rating: 82,
        reviews: 28,
        popular: false,
      },
      {
        id: 'frites7',
        name: 'Frites sauce fromagère bacon 🍟',
        description: 'Frites sauce fromagère maison bacon',
        price: 5.90,
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
        popular: false,
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
      },
    ],
    [ProductCategory.DESSERTS]: [
      {
        id: 'tiramisu-du-moment',
        name: 'Tiramisu du moment',
        description: 'Tiramisu fait maison avec le goût de votre choix',
        price: 4.50,
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
        name: 'Tarte Daim',
        description: 'Tarte Daim',
        price: 4.50,
        rating: 92,
        reviews: 39,
        popular: false,
        image: productImages.tarteDaim,
      },
      {
        id: 'dessert5',
        name: 'Gaufre',
        description: 'Parfum au choix.',
        price: 6.90,
        rating: 92,
        reviews: 68,
        popular: false,
        image: productImages.Gaufre,
      },
      {
        id: 'dessert8',
        name: 'Pizza briochée',
        description: 'Pizza briochée',
        price: 9.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.pizzaBrioche,
      },
      {
        id: 'milkshake-custom',
        name: 'Milkshake 🧋',
        description: 'Délicieux milkshake avec votre base préférée',
        price: 6.90,
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
              { id: 'fraise', name: 'Fraise', price: 0 }
            ]
          }
        }
      },
    ],
    [ProductCategory.BOISSONS]: [
      {
        id: 'cocacola-cherry-33',
        name: 'Coca-Cola cherry',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.cocaCherry,
      },
      {
        id: 'jus-bissap',
        name: 'Jus de bissap',
        description: 'Jus de fleurs d\'hibiscus.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.bissap,
      },
      {
        id: 'bouteille-cocacola-125',
        name: 'Bouteille Coca-cola 1.25 L',
        description: '',
        price: 5.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.cocaColaBouteille,
      },
      {
        id: 'cocacola',
        name: 'Coca-Cola',
        description: '',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.coca,
      },
      {
        id: 'capri-sun',
        name: 'Capri Sun',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.capriSun,
      },
      {
        id: 'fanta-fruit-dragon',
        name: 'Fanta fruit du dragon',
        description: '33 cl.',
        price: 2.00,
        rating: 100,
        reviews: 7,
        popular: false,
        image: productImages.fantaDragon,
      },
      {
        id: 'fanta-berry',
        name: 'Fanta Berry ( Fruits rouges)',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.fantaBerry,
      },
      {
        id: 'fanta-strawberry',
        name: 'Fanta Strawberry (Fraise)',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fantaStrawberry,
      },
      {
        id: 'bouteille-orangina-15',
        name: 'Bouteille Orangina 1.5L',
        description: '',
        price: 5.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.oranginabouteille,
      },
      {
        id: 'oasis-tropical',
        name: 'Oasis Tropical',
        description: '33 cl.',
        price: 2.00,
        rating: 100,
        reviews: 6,
        popular: false,
        image: productImages.oasisTropical,
      },
      {
        id: 'fanta-pineapple',
        name: 'Fanta Pineapple (Ananas)',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fantaAnanas,
      },
      {
        id: 'hawaii',
        name: 'Hawaï',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: true,
        image: productImages.hawai,
      },
      {
        id: 'fanta-grape',
        name: 'Fanta Grape (Raisin)',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fantaGrape,
      },
      {
        id: 'ice-the-peche',
        name: 'Ice The Pêche',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.iceTeaPeachh,
      },
      {
        id: 'cocacola-vanille',
        name: 'Coca cola Vanille',
        description: '',
        price: 3.50,
        rating: 100,
        reviews: 3,
        popular: false,
        image: productImages.cocaVanille,
      },
      {
        id: 'oasis-pomme-cassis-framboise',
        name: 'Oasis Pomme Cassis Framboise',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oasisPommeCassisFramboise,
      },
      {
        id: 'monster',
        name: 'Monster',
        description: '',
        price: 4.90,
        rating: 100,
        reviews: 45,
        popular: false,
        image: productImages.monsterEnergy,
      },
      {
        id: 'redbull',
        name: 'Redbull',
        description: '33 cl.',
        price: 3.90,
        rating: 100,
        reviews: 12,
        popular: false,
      },
      {
        id: 'ice-the-pasteque-menthe',
        name: 'Ice The Pastèque Menthe',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'cocacola-zero',
        name: 'Coca-Cola zero',
        description: '',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.cocaZero,
      },
      {
        id: 'eau',
        name: 'Eau',
        description: '',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: '7up-cherry',
        name: '7 Up cherry',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.sevenupCherry,
      },
      {
        id: 'oasis-pomme-poire',
        name: 'Oasis Pomme Poire',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.oasisPOmmePoire,
      },
      {
        id: '7up-mojito',
        name: '7 Up-Mojito',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.sevenupMojito,
      },
      {
        id: 'fanta-orange',
        name: 'Fanta orange',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
        image: productImages.fanta,
      },
      {
        id: 'schweppes-agrumes',
        name: 'Schweppes Agrumes',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'ice-the-framboise',
        name: 'Ice The Framboise',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'sprite',
        name: 'Sprite',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'bissap-50cl',
        name: 'Bissap 50 cl',
        description: 'Fait maison',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'fanta-fraise-kiwi',
        name: 'Fanta Fraise Kiwi',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'fanta-peach',
        name: 'Fanta peach (pèche)',
        description: '',
        price: 3.90,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'oasis-fraise-framboise',
        name: 'Oasis Fraise Framboise',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'fanta-citron',
        name: 'Fanta citron',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'orangina',
        name: 'Orangina',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'tropico',
        name: 'Tropico',
        description: '33 cl.',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'perrier',
        name: 'Perrier',
        description: '',
        price: 2.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'cocacola-50cl',
        name: 'Coca cola 50 CL',
        description: 'Petite bouteille 0.50 cl',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'cocacola-cherry-50cl',
        name: 'Coca Cola Cherry 50 CL',
        description: 'Petite bouteille 0.50 cl',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'cocacola-zero-50cl',
        name: 'Coca cola zéro 50 CL',
        description: 'Petite bouteille 0.50 cl',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'bouteille-cocacola-zero-125',
        name: 'Bouteille Coca-cola zéro 1.25 L',
        description: '',
        price: 5.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
      {
        id: 'bouteille-fanta-orange-15',
        name: 'Bouteille Fanta Orange 1.50 L',
        description: '',
        price: 5.00,
        rating: null,
        reviews: 0,
        popular: true,
      },
      {
        id: 'bouteille-cristaline-15',
        name: 'Bouteille Cristaline 1.5L',
        description: '',
        price: 4.00,
        rating: null,
        reviews: 0,
        popular: false,
      },
    ],
    [ProductCategory.FORMULES_PIZZA_DUO]: [
      {
        id: 'formule-pizza-duo',
        name: 'Formule Pizza Duo',
        description: '2 pizzas M, servi avec 1 grande bouteille au choix.',
        price: 26.50,
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
              { id: 'pizza-fermiere-1', name: 'Pizza fermière', price: 0.00 },
              { id: 'pizza-chevre-miel-1', name: 'Pizza chèvre miel', price: 0.00 },
              { id: 'pizza-curry-1', name: 'Pizza curry', price: 0.00 },
              { id: 'pizza-kebab-1', name: 'Pizza kebab', price: 0.00 },
              { id: 'pizza-western-1', name: 'Pizza western', price: 0.00 },
              { id: 'pizza-burger-1', name: 'Pizza burger', price: 0.00 },
              { id: 'pizza-tex-mex-1', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-raclette-1', name: 'Pizza raclette', price: 0.00 },
              { id: 'pizza-saumon-1', name: 'Pizza saumon', price: 0.00 },
              { id: 'pizza-margherita-1', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-4-fromages-1', name: 'Pizza 4 Fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-1', name: 'Pizza chèvre figue', price: 0.00 },
              { id: 'pizza-chevre-poulet-1', name: 'Pizza chèvre poulet', price: 0.00 },
              { id: 'pizza-raclette-poulet-1', name: 'Pizza raclette poulet', price: 0.00 },
              { id: 'pizza-spicy-1', name: 'Pizza spicy', price: 0.00 },
              { id: 'pizza-chicken-spicy-1', name: 'Pizza chicken spicy', price: 0.00 },
              { id: 'pizza-cannibale-1', name: 'Pizza cannibale', price: 0.00 },
              { id: 'pizza-kebab-raclette-1', name: 'Pizza kebab raclette', price: 0.00 },
              { id: 'pizza-saumon-boursin-1', name: 'Pizza Saumon Boursin', price: 0.00 }
            ]
          },
          pizza2: {
            title: 'Choix Pizza 2 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-fermiere-2', name: 'Pizza fermière', price: 0.00 },
              { id: 'pizza-chevre-miel-2', name: 'Pizza chèvre miel', price: 0.00 },
              { id: 'pizza-curry-2', name: 'Pizza curry', price: 0.00 },
              { id: 'pizza-kebab-2', name: 'Pizza kebab', price: 0.00 },
              { id: 'pizza-western-2', name: 'Pizza western', price: 0.00 },
              { id: 'pizza-burger-2', name: 'Pizza burger', price: 0.00 },
              { id: 'pizza-tex-mex-2', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-raclette-2', name: 'Pizza raclette', price: 0.00 },
              { id: 'pizza-saumon-2', name: 'Pizza saumon', price: 0.00 },
              { id: 'pizza-margherita-2', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-4-fromages-2', name: 'Pizza 4 Fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-2', name: 'Pizza chèvre figue', price: 0.00 },
              { id: 'pizza-chevre-poulet-2', name: 'Pizza chèvre poulet', price: 0.00 },
              { id: 'pizza-raclette-poulet-2', name: 'Pizza raclette poulet', price: 0.00 },
              { id: 'pizza-spicy-2', name: 'Pizza spicy', price: 0.00 },
              { id: 'pizza-chicken-spicy-2', name: 'Pizza chicken spicy', price: 0.00 },
              { id: 'pizza-cannibale-2', name: 'Pizza cannibale', price: 0.00 },
              { id: 'pizza-kebab-raclette-2', name: 'Pizza kebab raclette', price: 0.00 },
              { id: 'pizza-saumon-boursin-2', name: 'Pizza Saumon Boursin', price: 0.00 }
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
              { id: 'orangina-15-duo', name: 'Bouteille Orangina 1.5L', price: 0.00 },
              { id: 'fanta-orange-15-duo', name: 'Bouteille Fanta Orange 1.50 L', price: 0.00 },
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
              { id: 'pizza-fermiere-1', name: 'Pizza fermière', price: 0.00 },
              { id: 'pizza-chevre-miel-1', name: 'Pizza chèvre miel', price: 0.00 },
              { id: 'pizza-curry-1', name: 'Pizza curry', price: 0.00 },
              { id: 'pizza-kebab-1', name: 'Pizza kebab', price: 0.00 },
              { id: 'pizza-western-1', name: 'Pizza western', price: 0.00 },
              { id: 'pizza-burger-1', name: 'Pizza burger', price: 0.00 },
              { id: 'pizza-tex-mex-1', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-raclette-1', name: 'Pizza raclette', price: 0.00 },
              { id: 'pizza-saumon-1', name: 'Pizza saumon', price: 0.00 },
              { id: 'pizza-margherita-1', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-4-fromages-1', name: 'Pizza 4 Fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-1', name: 'Pizza chèvre figue', price: 0.00 },
              { id: 'pizza-chevre-poulet-1', name: 'Pizza chèvre poulet', price: 0.00 },
              { id: 'pizza-raclette-poulet-1', name: 'Pizza raclette poulet', price: 0.00 },
              { id: 'pizza-spicy-1', name: 'Pizza spicy', price: 0.00 },
              { id: 'pizza-chicken-spicy-1', name: 'Pizza chicken spicy', price: 0.00 },
              { id: 'pizza-cannibale-1', name: 'Pizza cannibale', price: 0.00 },
              { id: 'pizza-kebab-raclette-1', name: 'Pizza kebab raclette', price: 0.00 },
              { id: 'pizza-saumon-boursin-1', name: 'Pizza Saumon Boursin', price: 0.00 }
            ]
          },
          pizza2: {
            title: 'Choix Pizza 2 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-fermiere-2', name: 'Pizza fermière', price: 0.00 },
              { id: 'pizza-chevre-miel-2', name: 'Pizza chèvre miel', price: 0.00 },
              { id: 'pizza-curry-2', name: 'Pizza curry', price: 0.00 },
              { id: 'pizza-kebab-2', name: 'Pizza kebab', price: 0.00 },
              { id: 'pizza-western-2', name: 'Pizza western', price: 0.00 },
              { id: 'pizza-burger-2', name: 'Pizza burger', price: 0.00 },
              { id: 'pizza-tex-mex-2', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-raclette-2', name: 'Pizza raclette', price: 0.00 },
              { id: 'pizza-saumon-2', name: 'Pizza saumon', price: 0.00 },
              { id: 'pizza-margherita-2', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-4-fromages-2', name: 'Pizza 4 Fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-2', name: 'Pizza chèvre figue', price: 0.00 },
              { id: 'pizza-chevre-poulet-2', name: 'Pizza chèvre poulet', price: 0.00 },
              { id: 'pizza-raclette-poulet-2', name: 'Pizza raclette poulet', price: 0.00 },
              { id: 'pizza-spicy-2', name: 'Pizza spicy', price: 0.00 },
              { id: 'pizza-chicken-spicy-2', name: 'Pizza chicken spicy', price: 0.00 },
              { id: 'pizza-cannibale-2', name: 'Pizza cannibale', price: 0.00 },
              { id: 'pizza-kebab-raclette-2', name: 'Pizza kebab raclette', price: 0.00 },
              { id: 'pizza-saumon-boursin-2', name: 'Pizza Saumon Boursin', price: 0.00 }
            ]
          },
          pizza3: {
            title: 'Choix Pizza 3 (M)',
            required: true,
            multiSelect: false,
            maxSelections: 1,
            options: [
              { id: 'pizza-fermiere-3', name: 'Pizza fermière', price: 0.00 },
              { id: 'pizza-chevre-miel-3', name: 'Pizza chèvre miel', price: 0.00 },
              { id: 'pizza-curry-3', name: 'Pizza curry', price: 0.00 },
              { id: 'pizza-kebab-3', name: 'Pizza kebab', price: 0.00 },
              { id: 'pizza-western-3', name: 'Pizza western', price: 0.00 },
              { id: 'pizza-burger-3', name: 'Pizza burger', price: 0.00 },
              { id: 'pizza-tex-mex-3', name: 'Pizza Tex-Mex', price: 0.00 },
              { id: 'pizza-raclette-3', name: 'Pizza raclette', price: 0.00 },
              { id: 'pizza-saumon-3', name: 'Pizza saumon', price: 0.00 },
              { id: 'pizza-margherita-3', name: 'Pizza Margherita', price: 0.00 },
              { id: 'pizza-4-fromages-3', name: 'Pizza 4 Fromages', price: 0.00 },
              { id: 'pizza-chevre-figue-3', name: 'Pizza chèvre figue', price: 0.00 },
              { id: 'pizza-chevre-poulet-3', name: 'Pizza chèvre poulet', price: 0.00 },
              { id: 'pizza-raclette-poulet-3', name: 'Pizza raclette poulet', price: 0.00 },
              { id: 'pizza-spicy-3', name: 'Pizza spicy', price: 0.00 },
              { id: 'pizza-chicken-spicy-3', name: 'Pizza chicken spicy', price: 0.00 },
              { id: 'pizza-cannibale-3', name: 'Pizza cannibale', price: 0.00 },
              { id: 'pizza-kebab-raclette-3', name: 'Pizza kebab raclette', price: 0.00 },
              { id: 'pizza-saumon-boursin-3', name: 'Pizza Saumon Boursin', price: 0.00 }
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
              { id: 'orangina-15', name: 'Bouteille Orangina 1.5L', price: 0.00 },
              { id: 'fanta-orange-15', name: 'Bouteille Fanta Orange 1.50 L', price: 0.00 },
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
          'XL': { name: 'XL (3 viandes)', price: 12.00 }
        },
        customizationOptions: {
          viandes: {
            title: 'Choix des viandes',
            subtitle: 'Nombre de viandes selon la taille choisie.',
            required: true,
            minSelections: 1,
            maxSelections: 4,
            options: [
              { id: 'kebab', name: 'KEBAB', price: 0, popular: true },
              { id: 'cordon-bleu', name: 'CORDON BLEU', price: 0 },
              { id: 'nugget', name: 'NUGGET', price: 0, popular: true },
              { id: 'merguez', name: 'MERGUEZ', price: 0 },
              { id: 'tenders', name: 'TENDERS', price: 0, popular: true },
              { id: 'falafel', name: 'FALAFEL', price: 0 },
              { id: 'poulet', name: 'POULET', price: 0, popular: true },
              { id: 'escalope-poulet', name: 'ESCALOPE DE POULET', price: 0 },
              { id: 'poulet-boursin', name: 'POULET BOURSIN', price: 0 },
              { id: 'viande-hachee', name: 'VIANDE HACHEE', price: 0 },
              { id: 'steak-hache', name: 'STEAK HACHÉ', price: 0 }
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
              { id: 'biggy-burger', name: 'Biggy burger', price: 0 },
              { id: 'samourai', name: 'Samouraï', price: 0 },
              { id: 'ketchup', name: 'Ketchup', price: 0 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
              { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
              { id: 'brazil', name: 'Brazil', price: 0 },
              { id: 'curry', name: 'Curry', price: 0 },
              { id: 'barbecue', name: 'Barbecue', price: 0 },
              { id: 'sriracha', name: 'Sriracha (pimenté)', price: 0 },
              { id: 'harissa', name: 'Harissa', price: 0 },
              { id: 'algerienne', name: 'Algérienne', price: 0 },
              { id: 'andalouse', name: 'Andalouse', price: 0 },
              { id: 'big-mac', name: 'Big Mac', price: 0 },
              { id: 'marocaine', name: 'Marocaine', price: 0 },
              { id: 'sauce-poivre', name: 'Sauce Poivre', price: 0 },
              { id: 'chili-tai', name: 'Chili Tai', price: 0 },
              { id: 'moutarde', name: 'Moutarde', price: 0 },
              { id: 'boursin', name: 'Boursin', price: 1.50 }
            ]
          },
          supplement: {
            title: 'Suppléments',
            subtitle: 'Jusqu\'à 4 suppléments.',
            required: false,
            minSelections: 0,
            maxSelections: 4,
            options: [
              { id: 'oignons-rings', name: 'Oignons rings', price: 2.50 },
              { id: 'chili-cheese', name: 'Chili cheese', price: 2.50 },
              { id: 'oignon-frits', name: 'Oignon Frits', price: 1.50 },
              { id: 'bacon', name: 'Bacon', price: 1.50 },
              { id: 'parmesan', name: 'Parmesan', price: 1.00 },
              { id: 'emmental', name: 'Emmental', price: 1.00 },
              { id: 'mozzarella', name: 'Mozzarella', price: 1.00 },
              { id: 'raclette', name: 'Raclette', price: 1.00 },
              { id: 'chevre', name: 'Chèvre', price: 1.00 },
            ]
          }
        }
      }
    ]
};

export default productsByCategory;
