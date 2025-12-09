import { ProductCategory } from '../types/index.js';

const categoryInfo = {
  [ProductCategory.PATES]: {
    name: 'Pâtes',
    emoji: '🍝',
    color: '#22C55E',
    gradient: ['#22C55E', '#16A34A'],
  },
  [ProductCategory.PIZZA]: {
    name: 'Pizzas',
    emoji: '🍕',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  [ProductCategory.FORMULES_PIZZA_DUO]: {
    name: 'Formule Pizza Duo',
    emoji: '🍕',
    color: '#000000',
    gradient: ['#000000', '#000000'],
  },
  [ProductCategory.FORMULES_PIZZA_TRIO]: {
    name: 'Formule Pizza Trio',
    emoji: '🍕',
    color: '#DC2626',
    gradient: ['#DC2626', '#EF4444'],
  },
  [ProductCategory.BURGER]: {
    name: 'Burgers',
    emoji: '🍔',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  [ProductCategory.LASAGNES]: {
    name: 'Lasagnes',
    emoji: '🧀',
    color: '#DC2626',
    gradient: ['#DC2626', '#EF4444'],
  },
  [ProductCategory.SALADES]: {
    name: 'Salades',
    emoji: '🥗',
    color: '#16A34A',
    gradient: ['#16A34A', '#22C55E'],
  },
  [ProductCategory.DESSERTS]: {
    name: 'Desserts',
    emoji: '🍰',
    color: '#000000',
    gradient: ['#000000', '#000000'],
  },
  [ProductCategory.BOISSONS]: {
    name: 'Boissons',
    emoji: '🥤',
    color: '#0891B2',
    gradient: ['#0891B2', '#0EA5E9'],
  },
  [ProductCategory.TACOS]: {
    name: 'Tacos',
    emoji: '🌮',
    color: '#F97316',
    gradient: ['#F97316', '#FB923C'],
  },
  [ProductCategory.SANDWICH_AMERICAIN]: {
    name: 'Sandwich Américain',
    emoji: '🥪',
    color: '#F97316',
    gradient: ['#F97316', '#FB923C'],
  },
  [ProductCategory.MENU_KIDS]: {
    name: 'Menu Kids',
    emoji: '🧒',
    color: '#000000',
    gradient: ['#000000', '#F97316'],
  },
  [ProductCategory.PETIT_FAIM_BRUSCHETTA]: {
    name: 'Bruschetta',
    emoji: '🍞',
    color: '#DC2626',
    gradient: ['#DC2626', '#EF4444'],
  },
  [ProductCategory.PETITES_FAIM]: {
    name: 'Petites Faims',
    emoji: '🌭',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  [ProductCategory.BRUNCH]: {
    name: 'Brunch',
    emoji: '🥐',
    color: '#F97316',
    gradient: ['#F97316', '#FB923C'],
  },
  [ProductCategory.TEX_MEX]: {
    name: 'Tex-Mex',
    emoji: '🔥',
    color: '#DC2626',
    gradient: ['#DC2626', '#EF4444'],
  },
  [ProductCategory.FRITES_GARNIES]: {
    name: 'Frites Garnies',
    emoji: '🍟',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  [ProductCategory.BOWLS]: {
    name: 'Bowls',
    emoji: '🥣',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
};

export default categoryInfo;