import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { ProductCategory } from '../../src/types';
import { useOrder } from '../../src/context/OrderContext';

const { width } = Dimensions.get('window');

// Images représentatives par catégorie
const categoryImages = {
  [ProductCategory.PIZZA]: [
    require('../../assets/images/nouveauxProduits/margaritha.png'),
    require('../../assets/images/nouveauxProduits/pizza4fromages.png'),
    require('../../assets/images/nouveauxProduits/pizzaFermiere.png')
  ],
  [ProductCategory.BURGER]: [
    require('../../assets/images/nouveauxProduits/FrenchyBurger.png'),
    require('../../assets/images/nouveauxProduits/DoubleCheese.png'),
    require('../../assets/images/nouveauxProduits/ChickenBurger.png')
  ],
  [ProductCategory.PATES]: [
    require('../../assets/images/pates/patebolognaise.jpg'),
    require('../../assets/images/pates/patescarbonara.jpg'),
    require('../../assets/images/pates/patesaumon.png')
  ],
  [ProductCategory.SALADES]: [
    require('../../assets/images/nouveauxProduits/saladeChicken.png'),
    require('../../assets/images/salades/saladeSaumon.png'),
    require('../../assets/images/salades/saladeTomateMozza.png')
  ],
  [ProductCategory.DESSERTS]: [
    require('../../assets/images/nouveauxProduits/Gaufre.png'),
    require('../../assets/images/nouveauxProduits/Milkshake.png'),
    require('../../assets/images/nouveauxProduits/kinderBueno.png')
  ],
  [ProductCategory.TEX_MEX]: [
    require('../../assets/images/nouveauxProduits/NUGGETS.png'),
    require('../../assets/images/nouveauxProduits/ChilliCheese.png'),
    require('../../assets/images/nouveauxProduits/OignonsRings.png')
  ],
  [ProductCategory.PETITES_FAIM]: [
    require('../../assets/images/nouveauxProduits/CroqueMonsieur.png'),
    require('../../assets/images/nouveauxProduits/HotDog.png'),
    require('../../assets/images/nouveauxProduits/Cheese.png')
  ],
  [ProductCategory.PETIT_FAIM_BRUSCHETTA]: [
    require('../../assets/images/nouveauxProduits/BRUSHETA_POULET_CURRY.png'),
    require('../../assets/images/petiteFaimBruschetta/bruschetta4Fromages.png'),
    require('../../assets/images/petiteFaimBruschetta/bruschettaChevreMiel.png')
  ],
  [ProductCategory.FRITES_GARNIES]: [
    require('../../assets/images/nouveauxProduits/FritesCheddarBacon.png'),
    require('../../assets/images/nouveauxProduits/fritesFromage.png'),
    require('../../assets/images/nouveauxProduits/frites.png')
  ],
  [ProductCategory.BOISSONS]: [
    require('../../assets/images/nouveauxProduits/bissap.png'),
    require('../../assets/images/boissons/fantaStrawberry.png'),
    require('../../assets/images/boissons/sprite.png')
  ],
  [ProductCategory.LASAGNES]: [
    require('../../assets/images/nouveauxProduits/lasagneBolognaise.png'),
    require('../../assets/images/lasagnes/lasagnePoulet.png'),
    require('../../assets/images/lasagnes/lasagneSaumon.png')
  ],
  [ProductCategory.FORMULES_PIZZA_DUO]: [
    require('../../assets/images/nouveauxProduits/FormulePizza.Duo.png')
  ],
  [ProductCategory.FORMULES_PIZZA_TRIO]: [
    require('../../assets/images/formuleTrio.png')
  ],
  [ProductCategory.TACOS]: [
    require('../../assets/images/nouveauxProduits/MenuTacos.png')
  ],
  [ProductCategory.SANDWICH_AMERICAIN]: [
    require('../../assets/images/nouveauxProduits/AmericainSimple.png')
  ],
  [ProductCategory.SANDWICH_COMPOSE]: [
    require('../../assets/images/nouveauxProduits/AmericainSimple.png')
  ],
  [ProductCategory.MENU_KIDS]: [
    require('../../assets/images/nouveauxProduits/MenuKidss.png')
  ],
  [ProductCategory.BRUNCH]: [
    require('../../assets/images/nouveauxProduits/brunch.png')
  ],
  [ProductCategory.BOWLS]: [
    require('../../assets/images/nouveauxProduits/bowls.png')
  ],
  [ProductCategory.PIZZDWICH]: [
    require('../../assets/images/pizzdwich.jpeg')
  ]
};

export default function MenuScreen() {
  const fontsLoaded = useFonts();
  const { orderType, getCurrentOrderType, getItemCount, orderTotal } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animations d'apparition des cartes
  const cardAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(50),
      scale: new Animated.Value(0.8)
    }))
  ).current;

  // Animation du header
  const headerAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(-30)
  }).current;
  
  // Animations pour les emojis flottants (15 emojis pour le menu)
  const floatingEmojis = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(0))
  ).current;

  // Animations d'arrière-plan comme dans la page d'accueil
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(new Animated.Value(0.6)).current;

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  // Animation des emojis flottants et des arrière-plans
  useEffect(() => {
    // Animation d'entrée des cartes en cascade
    const animateCardsEntrance = () => {
      const animations = cardAnimations.map((cardAnim, index) =>
        Animated.timing(cardAnim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 100, // Délai en cascade
          useNativeDriver: true,
        })
      );

      const translateAnimations = cardAnimations.map((cardAnim, index) =>
        Animated.timing(cardAnim.translateY, {
          toValue: 0,
          duration: 800,
          delay: index * 100,
          useNativeDriver: true,
        })
      );

      const scaleAnimations = cardAnimations.map((cardAnim, index) =>
        Animated.spring(cardAnim.scale, {
          toValue: 1,
          delay: index * 100,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );

      Animated.parallel([
        ...animations,
        ...translateAnimations,
        ...scaleAnimations
      ]).start();
    };

    // Animation d'entrée du header
    const animateHeaderEntrance = () => {
      Animated.parallel([
        Animated.timing(headerAnimation.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerAnimation.translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    };

    // Tout ce qui est lancé ici doit pouvoir être arrêté au démontage, sinon
    // les boucles s'accumulent à chaque retour sur l'écran et figent l'app
    const timeouts = [];
    const loops = [];

    // Démarrer les animations d'entrée
    timeouts.push(setTimeout(animateHeaderEntrance, 200));
    timeouts.push(setTimeout(animateCardsEntrance, 600));

    // Animation des arrière-plans
    const startBackgroundAnimation = () => {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.timing(rotateAnimation, {
            toValue: 1,
            duration: 20000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnimation, {
              toValue: 1.1,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: 0.9,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(opacityAnimation, {
              toValue: 0.8,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnimation, {
              toValue: 0.4,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnimation, {
              toValue: 0.6,
              duration: 8000,
              useNativeDriver: true,
            })
          ])
        ])
      );
      loops.push(loop);
      loop.start();
    };

    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = Math.random() * 1000;
        const duration = 15000 + Math.random() * 15000;

        timeouts.push(setTimeout(() => {
          const loop = Animated.loop(
            Animated.timing(animValue, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            })
          );
          loops.push(loop);
          loop.start();
        }, delay));
      });
    };

    startBackgroundAnimation();
    startFloatingEmojisAnimation();

    return () => {
      timeouts.forEach(clearTimeout);
      loops.forEach(loop => loop.stop());
    };
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  // Données réelles des produits par catégorie
  const realProducts = {
    [ProductCategory.PATES]: [
      { id: 'patebolognaise', name: 'Pâtes bolognaise' },
      { id: 'patescarbonara', name: 'Pâtes carbonara' },
      { id: 'patesaumon', name: 'Pâtes saumon' },
      { id: 'patesforestieres', name: 'Pâtes forestière' },
      { id: 'pates3fromages', name: 'Pâtes 3 Fromages' },
      { id: 'patespouletcurry', name: 'Pâtes Poulet Curry' },
    ],
    [ProductCategory.PIZZA]: [
      { id: 'pizza10', name: 'Pizza Margherita' },
      { id: 'pizza1', name: 'Pizza Fermière' },
      { id: 'pizza18', name: 'Pizza Kebab raclette' },
      { id: 'pizza17', name: 'Pizza Cannibale' },
      { id: 'pizza9', name: 'Pizza Saumon' },
      { id: 'pizza2', name: 'Pizza Chèvre miel' },
      { id: 'pizza13', name: 'Pizza Chèvre Poulet' },
      { id: 'pizza3', name: 'Pizza Curry' },
      { id: 'pizza4', name: 'Pizza Kebab' },
      { id: 'pizza7', name: 'Pizza Tex-Mex' },
      { id: 'pizza6', name: 'Pizza Burger' },
      { id: 'pizza11', name: 'Pizza 4 fromages' },
      { id: 'pizza12', name: 'Pizza Chèvre Figue' },
      { id: 'pizza8', name: 'Pizza Raclette' },
      { id: 'pizza-composee', name: 'Compose ta pizza' },
    ],
    [ProductCategory.BURGER]: [
      { id: 'burger1', name: 'Frenchy Burger' },
      { id: 'burger2', name: 'Double Cheese Burger' },
      { id: 'burger3', name: 'DUO Burger' },
      { id: 'burger4', name: 'Burger Chèvre Miel' },
      { id: 'burger5', name: 'Chicken Burger' },
      { id: 'burger6', name: 'Wi-Mac' },
      { id: 'burger7', name: 'Bacon B burger' },
      { id: 'burger8', name: 'Spicy burger' },
      { id: 'burger9', name: 'Burger Classique' },
      { id: 'burger10', name: 'Veggie Burger' },
    ],
    [ProductCategory.LASAGNES]: [
      { id: 'lasagne1', name: 'Lasagne bolognaise' },
      { id: 'lasagne2', name: 'Lasagne poulet' },
      { id: 'lasagne3', name: 'Lasagne saumon' },
    ],
    [ProductCategory.TACOS]: [
      { id: 'tacos1', name: 'Tacos M' },
      { id: 'tacos2', name: 'Tacos L' },
      { id: 'tacos3', name: 'Tacos XL' },
      { id: 'tacos4', name: 'Tacos XXL' },
    ],
    [ProductCategory.SANDWICH_AMERICAIN]: [
      { id: 'americain1', name: 'Américain Bacon' },
      { id: 'americain2', name: 'Américain Kebab' },
      { id: 'americain3', name: 'Américain Classic' },
      { id: 'americain4', name: 'Américain Spicy Kefta' },
      { id: 'americain5', name: 'Américain Poulet Boursin' },
    ],
    [ProductCategory.SANDWICH_COMPOSE]: [
      { id: 'americain-double', name: 'Sandwich Double' },
      { id: 'americain-simple', name: 'Sandwich Simple' },
    ],
    [ProductCategory.MENU_KIDS]: [
      { id: 'menukids1', name: 'Menu kids' },
    ],
    [ProductCategory.PETIT_FAIM_BRUSCHETTA]: [
      { id: 'bruschetta1', name: 'Bruschetta-Margarita' },
      { id: 'bruschetta2', name: 'Bruschetta Chèvre Miel' },
      { id: 'bruschetta3', name: 'Bruschetta Poulet Curry' },
      { id: 'bruschetta4', name: 'Bruschetta 4 Fromages' },
    ],
    [ProductCategory.PETITES_FAIM]: [
      { id: 'petitfaim1', name: 'Hot Dog' },
      { id: 'petitfaim2', name: 'Croque' },
      { id: 'petitfaim3', name: 'Hot Dog Crispy' },
      { id: 'petitfaim4', name: 'Double ptit cheese' },
      { id: 'petitfaim5', name: 'Ptit Cheese' },
      { id: 'petitfaim6', name: 'Croq chèvre miel' },
    ],
    [ProductCategory.BRUNCH]: [
      { id: 'menu-brunch', name: 'Menu Brunch' },
    ],
    [ProductCategory.TEX_MEX]: [
      { id: 'texmex1', name: 'Sticks Mozza x 3' },
      { id: 'texmex2', name: 'Tenders x 3' },
      { id: 'texmex3', name: 'Wings x 3' },
      { id: 'texmex4', name: 'Sticks chèvre x 3' },
      { id: 'texmex5', name: 'Chilicheese x 3' },
      { id: 'texmex6', name: 'Nuggets x 3' },
      { id: 'texmex7', name: 'Boucheés Camembert x 3' },
      { id: 'texmex8', name: 'Oignons rings x 4' },
    ],
    [ProductCategory.SALADES]: [
      { id: 'salade1', name: 'Salade chicken 🥗' },
      { id: 'salade2', name: 'Salade chèvre miel 🥗' },
      { id: 'salade3', name: 'Salade saumon' },
      { id: 'salade4', name: 'Salade crudités' },
      { id: 'salade5', name: 'Salade Tomate Mozza' },
    ],
    [ProductCategory.DESSERTS]: [
      { id: 'dessert1', name: 'Tiramisu Nutella spéculoos maison' },
      { id: 'dessert2', name: 'Tiramisu Oréo maison' },
      { id: 'dessert3', name: 'Tiramisu Speculoos Caramel maison' },
      { id: 'dessert4', name: 'Tarte Daim' },
      { id: 'dessert5', name: 'Gaufre' },
      { id: 'dessert6', name: 'Milkshake Vanille 🧋' },
      { id: 'dessert7', name: 'Milkshake Fraise 🧋' },
      { id: 'dessert8', name: 'Pizza briochée' },
    ],
    // Boissons
    [ProductCategory.BOISSONS]: [
      { id: 'cocacola-cherry-33', name: 'Coca-Cola cherry' },
      { id: 'bouteille-cocacola-125', name: 'Bouteille Coca-cola 1.25 L' },
      { id: 'cocacola', name: 'Coca-Cola' },
      { id: 'capri-sun', name: 'Capri Sun' },
      { id: 'fanta-fruit-dragon', name: 'Fanta fruit du dragon' },
      { id: 'fanta-berry', name: 'Fanta Berry ( Fruits rouges)' },
      { id: 'fanta-strawberry', name: 'Fanta Strawberry (Fraise)' },
      { id: 'bouteille-orangina-15', name: 'Bouteille Orangina 1.5L' },
      { id: 'oasis-tropical', name: 'Oasis Tropical' },
      { id: 'fanta-pineapple', name: 'Fanta Pineapple (Ananas)' },
      { id: 'hawaii', name: 'Hawaï' },
      { id: 'fanta-grape', name: 'Fanta Grape (Raisin)' },
      { id: 'ice-the-peche', name: 'Ice The Pêche' },
      { id: 'cocacola-vanille', name: 'Coca cola Vanille' },
      { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise' },
      { id: 'monster', name: 'Monster' },
      { id: 'redbull', name: 'Redbull' },
      { id: 'ice-the-pasteque-menthe', name: 'Ice The Pastèque Menthe' },
      { id: 'cocacola-zero', name: 'Coca-Cola zero' },
      { id: 'eau', name: 'Eau' },
      { id: '7up-cherry', name: '7 Up cherry' },
      { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire' },
      { id: '7up-mojito', name: '7 Up-Mojito' },
      { id: 'fanta-orange', name: 'Fanta orange' },
      { id: 'schweppes-agrumes', name: 'Schweppes Agrumes' },
      { id: 'ice-the-framboise', name: 'Ice The Framboise' },
      { id: 'sprite', name: 'Sprite' },
      { id: 'bissap-50cl', name: 'Bissap 50 cl' },
      { id: 'fanta-fraise-kiwi', name: 'Fanta Fraise Kiwi' },
      { id: 'fanta-peach', name: 'Fanta peach (pèche)' },
      { id: 'oasis-fraise-framboise', name: 'Oasis Fraise Framboise' },
      { id: 'fanta-citron', name: 'Fanta citron' },
      { id: 'orangina', name: 'Orangina' },
      { id: 'tropico', name: 'Tropico' },
      { id: 'perrier', name: 'Perrier' },
      { id: 'cocacola-50cl', name: 'Coca cola 50 CL' },
      { id: 'cocacola-cherry-50cl', name: 'Coca Cola Cherry 50 CL' },
      { id: 'cocacola-zero-50cl', name: 'Coca cola zéro 50 CL' },
      { id: 'bouteille-cocacola-zero-125', name: 'Bouteille Coca-cola zéro 1.25 L' },
      { id: 'bouteille-fanta-orange-15', name: 'Bouteille Fanta Orange 1.50 L' },
      { id: 'bouteille-cristaline-15', name: 'Bouteille Cristaline 1.5L' },
    ],
    [ProductCategory.BOWLS]: [
      { id: 'bowl-m', name: 'Bowls M' },
      { id: 'bowl-l', name: 'Bowls L' },
      { id: 'bowl-xl', name: 'Bowls XL' },
      { id: 'bowl-xxl', name: 'Bowls XXL' },
    ],
    [ProductCategory.TACOS]: [
      { id: 'tacos-m', name: 'Tacos M 🌯' },
      { id: 'tacos-l', name: 'Tacos L 🌯' },
      { id: 'tacos-xl', name: 'Tacos XL 🌯' },
      { id: 'tacos-xxl', name: 'Tacos XXL 🌯' },
    ],
    [ProductCategory.FRITES_GARNIES]: [
      { id: 'frites1', name: 'Frites cheddar bacon et oignons frits 🍟🥓🧅' },
      { id: 'frites2', name: 'Barquette de frites 🍟' },
      { id: 'frites3', name: 'Frites Cheddar bacon 🍟🥓' },
      { id: 'frites4', name: 'Frites Cheddar 🍟' },
      { id: 'frites5', name: 'Frites et sauce fromagère 🍟' },
      { id: 'frites6', name: 'Frites cheddar aux oignons frits 🍟🧅' },
      { id: 'frites7', name: 'Frites sauce fromagère bacon 🍟' },
      { id: 'frites8', name: 'Frites sauce fromagère oignons frits 🍟' },
      { id: 'frites9', name: 'Frites sauce fromagère bacon et oignons frits 🍟' },
    ],
    [ProductCategory.FORMULES_PIZZA_DUO]: [
      { id: 'formule-pizza-duo', name: 'Formule Pizza Duo' },
    ],
    [ProductCategory.FORMULES_PIZZA_TRIO]: [
      { id: 'formule-pizza-trio', name: 'Formule Pizza Trio' },
    ],
    [ProductCategory.PIZZDWICH]: [
      { id: 'pizzdwich-m', name: 'Pizzdwich M' },
      { id: 'pizzdwich-l', name: 'Pizzdwich L' },
      { id: 'pizzdwich-xl', name: 'Pizzdwich XL' },
      { id: 'pizzdwich-xxl', name: 'Pizzdwich XXL' },
    ],
    // Autres catégories n'ont pas encore de produits définis
  };

  // Fonction pour calculer le nombre réel d'items par catégorie
  const getRealItemCount = (categoryId) => {
    return realProducts[categoryId] ? realProducts[categoryId].length : 0;
  };

  // Données des catégories ordonnées par importance (toutes uniform pour 2 par ligne)
  const categories = [
    // Catégories les plus importantes - formules et plats principaux
    {
      id: ProductCategory.FORMULES_PIZZA_DUO,
      name: 'Formules Duo',
      subtitle: '2 pizzas + boisson',
      color: '#000000',
      gradient: ['#000000', '#000000'],
      items: getRealItemCount(ProductCategory.FORMULES_PIZZA_DUO)
    },
    {
      id: ProductCategory.FORMULES_PIZZA_TRIO,
      name: 'Formules Trio',
      subtitle: '3 pizzas + boisson',
      emoji: '👨‍👩‍👧',
      color: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6'],
      items: getRealItemCount(ProductCategory.FORMULES_PIZZA_TRIO)
    },
    {
      id: ProductCategory.PIZZA,
      name: 'Pizzas',
      subtitle: 'Margherita, 4 fromages...',
      emoji: '🍕',
      color: '#EF4444',
      gradient: ['#EF4444', '#F87171'],
      items: getRealItemCount(ProductCategory.PIZZA)
    },
    {
      id: ProductCategory.BURGER,
      name: 'Burgers',
      subtitle: 'Steaks juteux et frites',
      emoji: '🍔',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      items: getRealItemCount(ProductCategory.BURGER)
    },
    {
      id: ProductCategory.TACOS,
      name: 'Tacos',
      subtitle: 'M, L, XL ou XXL',
      emoji: '🌮',
      color: '#F97316',
      gradient: ['#F97316', '#FB923C'],
      items: getRealItemCount(ProductCategory.TACOS)
    },
    {
      id: ProductCategory.PIZZDWICH,
      name: 'Pizzdwich',
      subtitle: 'M, L, XL ou XXL',
      emoji: '🫓',
      color: '#E11D48',
      gradient: ['#E11D48', '#F43F5E'],
      items: getRealItemCount(ProductCategory.PIZZDWICH)
    },
    {
      id: ProductCategory.PATES,
      name: 'Pâtes',
      subtitle: 'Sauces crémeuses variées',
      emoji: '🍝',
      color: '#22C55E',
      gradient: ['#22C55E', '#4ADE80'],
      items: getRealItemCount(ProductCategory.PATES)
    },
    {
      id: ProductCategory.LASAGNES,
      name: 'Lasagnes',
      subtitle: 'Gratinées au four',
      emoji: '🧀',
      color: '#DC2626',
      gradient: ['#DC2626', '#EF4444'],
      items: getRealItemCount(ProductCategory.LASAGNES)
    },
    {
      id: ProductCategory.SANDWICH_AMERICAIN,
      name: 'Américains',
      subtitle: 'Bacon, kebab...',
      emoji: '🥪',
      color: '#F97316',
      gradient: ['#F97316', '#FB923C'],
      items: getRealItemCount(ProductCategory.SANDWICH_AMERICAIN)
    },
    {
      id: ProductCategory.SANDWICH_COMPOSE,
      name: 'Compose ton\nSandwich',
      subtitle: 'Simple ou double',
      emoji: '🥖',
      color: '#D97706',
      gradient: ['#D97706', '#F59E0B'],
      items: getRealItemCount(ProductCategory.SANDWICH_COMPOSE)
    },
    // Catégories moyennes - plats légers et accompagnements
    {
      id: ProductCategory.SALADES,
      name: 'Salades',
      subtitle: 'Légumes croquants',
      emoji: '🥗',
      color: '#16A34A',
      gradient: ['#16A34A', '#22C55E'],
      items: getRealItemCount(ProductCategory.SALADES)
    },
    {
      id: ProductCategory.BOWLS,
      name: 'Bowls',
      subtitle: 'Bowls M, L, XL ou XXL',
      emoji: '🥣',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#A78BFA'],
      items: getRealItemCount(ProductCategory.BOWLS)
    },
    {
      id: ProductCategory.PETITES_FAIM,
      name: 'Petites Faims',
      subtitle: 'Hot-dogs, croques...',
      emoji: '🌭',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      items: getRealItemCount(ProductCategory.PETITES_FAIM)
    },
    {
      id: ProductCategory.PETIT_FAIM_BRUSCHETTA,
      name: 'Bruschetta',
      subtitle: 'Pain grillé garni',
      emoji: '🍞',
      color: '#DC2626',
      gradient: ['#DC2626', '#EF4444'],
      items: getRealItemCount(ProductCategory.PETIT_FAIM_BRUSCHETTA)
    },
    {
      id: ProductCategory.TEX_MEX,
      name: 'Tex-Mex',
      subtitle: 'Nuggets et onion rings',
      emoji: '🔥',
      color: '#DC2626',
      gradient: ['#DC2626', '#EF4444'],
      items: getRealItemCount(ProductCategory.TEX_MEX)
    },
    {
      id: ProductCategory.FRITES_GARNIES,
      name: 'Frites Garnies',
      subtitle: 'Cheddar, bacon...',
      emoji: '🍟',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      items: getRealItemCount(ProductCategory.FRITES_GARNIES)
    },
    {
      id: ProductCategory.BRUNCH,
      name: 'Brunch',
      subtitle: 'Spécialités brunch',
      emoji: '🥐',
      color: '#F97316',
      gradient: ['#F97316', '#FB923C'],
      items: getRealItemCount(ProductCategory.BRUNCH)
    },
    // Catégories spécialisées
    {
      id: ProductCategory.MENU_KIDS,
      name: 'Menu Enfant',
      subtitle: 'Menu kids',
      emoji: '🧒',
      color: '#000000',
      gradient: ['#000000', '#F97316'],
      items: getRealItemCount(ProductCategory.MENU_KIDS)
    },
    // Catégories les moins prioritaires - desserts et boissons
    {
      id: ProductCategory.DESSERTS,
      name: 'Desserts',
      subtitle: 'Tiramisus, gaufres...',
      emoji: '🍰',
      color: '#000000',
      gradient: ['#000000', '#000000'],
      items: getRealItemCount(ProductCategory.DESSERTS)
    },
    {
      id: ProductCategory.BOISSONS,
      name: 'Boissons',
      subtitle: 'Sodas et jus de fruits',
      emoji: '🥤',
      color: '#0891B2',
      gradient: ['#0891B2', '#0EA5E9'],
      items: getRealItemCount(ProductCategory.BOISSONS)
    },
  ];


  const handleCategoryPress = (category, cardIndex) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCategory(category.id);

    // Animation de rebond pour feedback visuel
    const cardAnim = cardAnimations[cardIndex];
    if (cardAnim) {
      Animated.sequence([
        Animated.spring(cardAnim.scale, {
          toValue: 0.95,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(cardAnim.scale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        })
      ]).start();
    }

    // Navigation vers la liste des produits de cette catégorie avec délai pour l'animation
    setTimeout(() => {
      router.push(`/category/${category.id}`);
    }, 150);
  };

  const renderCategoryCard = (category, index) => {
    // Toutes les cartes ont la même taille pour 2 par ligne
    const cardStyle = {
      width: (width - 48) / 2,
      height: 135
    };
    const images = categoryImages[category.id] || [];

    // Animation pour cette carte
    const cardAnim = cardAnimations[index] || { opacity: new Animated.Value(1), translateY: new Animated.Value(0), scale: new Animated.Value(1) };

    return (
      <Animated.View
        style={[
          {
            opacity: cardAnim.opacity,
            transform: [
              { translateY: cardAnim.translateY },
              { scale: cardAnim.scale }
            ]
          }
        ]}
      >
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryCard, cardStyle]}
          onPress={() => handleCategoryPress(category, index)}
          activeOpacity={0.9}
        >
        {/* Image de fond */}
        {images[0] && (
          <Image
            source={images[0]}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )}

        {/* Fallback gradient si pas d'image */}
        {!images[0] && (
          <LinearGradient
            colors={category.gradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Overlay sombre pour meilleure lisibilité du texte */}
            <View style={styles.cardOverlay} />

            <View style={styles.cardContent}>
              {/* Header avec badge de comptage */}
              <View style={styles.cardHeader}>
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>{category.items}</Text>
                </View>
                {/* Badge populaire pour formules duo */}
                {category.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>HOT</Text>
                  </View>
                )}
              </View>

              {/* Texte */}
              <View style={styles.cardText}>
                <Text style={styles.categoryName}>
                  {category.name.toUpperCase()}
                </Text>
                <Text style={styles.categorySubtitle}>
                  {category.subtitle}
                </Text>
              </View>

              {/* Flèche */}
              <View style={styles.cardArrow}>
                <View style={styles.arrowCircle}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.neutral.white}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Contenu pour les cartes avec image */}
        {images[0] && (
          <View style={styles.cardContainer}>
            {/* Overlay sombre pour meilleure lisibilité du texte */}
            <View style={styles.cardOverlay} />

            <View style={styles.cardContent}>
            {/* Header avec badge de comptage */}
            <View style={styles.cardHeader}>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>{category.items}</Text>
              </View>
              {/* Badge populaire pour formules duo */}
              {category.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐</Text>
                </View>
              )}
            </View>

            {/* Texte */}
            <View style={styles.cardText}>
              <Text style={styles.categoryName}>
                {category.name.toUpperCase()}
              </Text>
              <Text style={styles.categorySubtitle}>
                {category.subtitle}
              </Text>
            </View>

              {/* Flèche */}
              <View style={styles.cardArrow}>
                <View style={styles.arrowCircle}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.neutral.white}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoriesGrid = () => {
    // Organiser les catégories en paires pour 2 par ligne
    const categoryPairs = [];
    for (let i = 0; i < categories.length; i += 2) {
      categoryPairs.push(categories.slice(i, i + 2));
    }

    return (
      <View style={styles.gridContainer}>
        {categoryPairs.map((pair, pairIndex) => (
          <View key={pairIndex} style={styles.categoryRow}>
            {pair.map((category, index) => {
              // Calculer l'index global pour l'animation
              const globalIndex = pairIndex * 2 + index;
              return renderCategoryCard(category, globalIndex);
            })}
            {/* Si le nombre de catégories est impair, ajouter un espace vide */}
            {pair.length === 1 && <View style={styles.emptyCard} />}
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#000000', '#000000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />

      {/* Animation d'arrière-plan */}
      <Animated.View
        style={[
          styles.backgroundAnimation1,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundAnimation2,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundAnimation3,
          {
            transform: [
              {
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              },
              { scale: scaleAnimation }
            ],
            opacity: opacityAnimation
          }
        ]}
      />

      {/* Emojis flottants de fast food avec trajectoires variables */}
      {floatingEmojis.map((animValue, index) => {
        // Liste d'emojis de fast food uniquement
        const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓'];
        const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];
        
        // Différents types de trajectoires selon l'index
        const trajectoryType = index % 4;
        let startX, endX, startY, endY;
        
        switch (trajectoryType) {
          case 0: // Du bas vers le haut
            startX = Math.random() * 300 - 50;
            endX = startX + (Math.random() - 0.5) * 200;
            startY = 900;
            endY = -100;
            break;
          case 1: // De la gauche vers la droite
            startX = -100;
            endX = 400;
            startY = 200 + Math.random() * 400;
            endY = startY + (Math.random() - 0.5) * 300;
            break;
          case 2: // De la droite vers la gauche
            startX = 400;
            endX = -100;
            startY = 300 + Math.random() * 300;
            endY = startY + (Math.random() - 0.5) * 200;
            break;
          case 3: // Du haut vers le bas
            startX = Math.random() * 300 - 50;
            endX = startX + (Math.random() - 0.5) * 150;
            startY = -100;
            endY = 900;
            break;
        }
        
        // Trajectoire sinusoïdale différente pour chaque emoji
        const amplitude = 20 + (index % 3) * 15; // Amplitude de l'oscillation plus douce
        
        return (
          <Animated.View 
            key={index}
            style={[
              styles.floatingEmoji,
              {
                transform: [
                  {
                    translateY: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [startY, endY],
                    }),
                  },
                  {
                    translateX: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [startX, endX],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    translateX: animValue.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, amplitude, 0, -amplitude, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: animValue.interpolate({
                  inputRange: [0, 0.1, 0.9, 1],
                  outputRange: [0, 0.5, 0.5, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emojiText}>{currentEmoji}</Text>
          </Animated.View>
        );
      })}
      
      {/* Header avec animation */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnimation.opacity,
            transform: [
              { translateY: headerAnimation.translateY }
            ]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Notre Menu</Text>
              <Text style={styles.headerSubtitle}>Découvrez nos spécialités</Text>
            </View>
          </View>

        </View>
      </Animated.View>

      {/* Contenu principal */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderCategoriesGrid()}
      </Animated.ScrollView>


    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 120 : 110,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: 250,
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    width: (width - 48) / 2,
  },
  categoryCard: {
    marginBottom: spacing.sm,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
    borderRadius: 26,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -30,
    right: -30,
  },
  patternCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: -20,
    left: -20,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    zIndex: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  categoryEmoji: {
    lineHeight: 1,
  },
  itemCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCountText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  popularBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  popularText: {
    fontSize: typography.fontSizes.xs,
  },
  cardText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
    lineHeight: typography.lineHeights.tight * typography.fontSizes.sm,
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.xs,
    textAlign: 'center',
  },
  cardArrow: {
    alignSelf: 'flex-end',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 2,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },

  // Styles pour les animations d'arrière-plan
  backgroundAnimation1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
    zIndex: -2,
  },
  backgroundAnimation2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: 100,
    left: -75,
    zIndex: -2,
  },
  backgroundAnimation3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: '40%',
    right: -30,
    zIndex: -2,
  },
});