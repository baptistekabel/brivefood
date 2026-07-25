/**
 * 🔥 BRIVEFOOD - Images depuis Firebase Storage
 *
 * Ce fichier permet de charger les images soit depuis Firebase Storage (production)
 * soit depuis les fichiers locaux (développement/fallback).
 *
 * Configuration: Changer USE_FIREBASE_IMAGES à true pour utiliser Firebase
 */

// Configuration: true = Firebase, false = local
const USE_FIREBASE_IMAGES = true;

// URLs Firebase Storage (générées par upload-images-to-firebase.js)
// Ce fichier sera créé automatiquement après le premier upload
let firebaseUrls = {};
try {
  firebaseUrls = require('./firebaseImageUrls').default || {};
} catch (e) {
  // Fichier pas encore généré, utiliser les images locales
  console.log('⚠️ firebaseImageUrls.js non trouvé, utilisation des images locales');
}

// Images locales (fallback)
const localImages = {
  // Pâtes
  patebolognaise: require('../../assets/images/pates/patebolognaise.jpg'),
  patescarbonara: require('../../assets/images/pates/patescarbonara.jpg'),
  patesaumon: require('../../assets/images/pates/patesaumon.png'),
  patesforestieres: require('../../assets/images/pates/patesforestieres.png'),
  pates3fromages: require('../../assets/images/pates/pates3fromages.png'),
  patespouletcurry: require('../../assets/images/pates/patespouletcurry.png'),

  // Burgers
  wiMac: require('../../assets/images/burgers/wiMac.png'),
  veggieBurger: require('../../assets/images/burgers/veggieBurger.png'),
  spicyBurger: require('../../assets/images/burgers/spicyBurger.png'),
  burgerClassic: require('../../assets/images/burgers/burgerClassic.png'),
  burgerBleu: require('../../assets/images/burgers/burgerBleu.jpeg'),
  baconBBurger: require('../../assets/images/nouveauxProduits/BaconBBurger.png'),
  doubleCheeseBurger: require('../../assets/images/nouveauxProduits/DoubleCheese.png'),
  duoBurger: require('../../assets/images/nouveauxProduits/DuoBurger.png'),
  burgerChevreMiel: require('../../assets/images/burgers/burgerChevreMiel.png'),
  chickenBurger: require('../../assets/images/nouveauxProduits/ChickenBurger.png'),
  frenchyBurger: require('../../assets/images/nouveauxProduits/FrenchyBurger.png'),

  // Tacos
  menuTacos: require('../../assets/images/nouveauxProduits/MenuTacos.png'),

  // Salades
  saladeCrudités: require('../../assets/images/salades/saladeCrudites.png'),
  saladeTomateMozza: require('../../assets/images/salades/saladeTomateMozza.png'),
  saladeChevreMiel: require('../../assets/images/salades/saladeChevreMiel.png'),
  saladeSaumon: require('../../assets/images/salades/saladeSaumon.png'),
  saladeChicken: require('../../assets/images/nouveauxProduits/saladeChicken.png'),

  // Desserts
  pizzaBrioche: require('../../assets/images/desserts/pizzaBrioche.jpg'),
  tiramisuSpeculosCaramel: require('../../assets/images/desserts/tiramisuSpeculosCaramel.png'),
  tiramisuOreo: require('../../assets/images/desserts/tiramisuOreo.png'),
  MilkshakeVanille: require('../../assets/images/desserts/MilkshakeVanille.png'),
  MilkshakeFraise: require('../../assets/images/desserts/MilkshakeFraise.png'),
  milkshake: require('../../assets/images/nouveauxProduits/Milkshake.png'),
  tarteDaim: require('../../assets/images/desserts/tarteDaim.png'),
  Gaufre: require('../../assets/images/nouveauxProduits/Gaufre.png'),
  tiramisuNutellaSpeculos: require('../../assets/images/desserts/tiramisuNutellaSpeculos.png'),
  kinderBueno: require('../../assets/images/nouveauxProduits/kinderBueno.png'),
  kinderBuenoWhite: require('../../assets/images/nouveauxProduits/kinderbuenowhite.png'),

  // Sandwich Américain
  sandwichAmericain: require('../../assets/images/sandwichAmericain.png'),

  // Bruschetta
  bruschettaMargarita: require('../../assets/images/petiteFaimBruschetta/bruschettaMargarita.png'),
  bruschetta4Fromages: require('../../assets/images/petiteFaimBruschetta/bruschetta4Fromages.png'),
  bruschettaPouletCurry: require('../../assets/images/petiteFaimBruschetta/bruschettaPouletCurry.png'),
  bruschettaChevreMiel: require('../../assets/images/petiteFaimBruschetta/bruschettaChevreMiel.png'),

  // Petites Faims
  hotDog: require('../../assets/images/nouveauxProduits/HotDog.png'),
  croque: require('../../assets/images/nouveauxProduits/CroqueMonsieur.png'),
  hotDogCrispy: require('../../assets/images/nouveauxProduits/HotDogCrispy.png'),
  doublePtitCheese: require('../../assets/images/nouveauxProduits/DoublePtitCheese.png'),
  cheese: require('../../assets/images/nouveauxProduits/Cheese.png'),
  croqChevreMiel: require('../../assets/images/petitesFaims/croqChevreMiel.png'),

  // Tex-Mex
  sticksMozza: require('../../assets/images/tex-mex/scticksMozza.png'),
  tenders: require('../../assets/images/tex-mex/tenders.png'),
  sticksChevre: require('../../assets/images/tex-mex/sticksChevre.png'),
  chilliCheese: require('../../assets/images/nouveauxProduits/ChilliCheese.png'),
  nuggets: require('../../assets/images/nouveauxProduits/NUGGETS.png'),
  boucheeCamembert: require('../../assets/images/nouveauxProduits/BoucheeCammenbert.png'),
  onionRings: require('../../assets/images/nouveauxProduits/OignonsRings.png'),
  wings: require('../../assets/images/new/WINGS.png'),

  // Formules
  formuleDuo: require('../../assets/images/nouveauxProduits/FormulePizza.Duo.png'),
  formuleTrio: require('../../assets/images/formuleTrio.png'),

  // Frites
  fritesCheddar: require('../../assets/images/frites/fritesCheddar.png'),
  barquetteFrites: require('../../assets/images/nouveauxProduits/frites.png'),
  fritesCheddarBacon: require('../../assets/images/nouveauxProduits/FritesCheddarBacon.png'),
  fritesSauceFromagereOnionsFrits: require('../../assets/images/nouveauxProduits/FritesOignonsFrits.png'),
  fritesSauceFromagere: require('../../assets/images/nouveauxProduits/FritesSauceFromagere.png'),
  fritesSauceFromagereBaconOignonsFrits: require('../../assets/images/nouveauxProduits/FritesCheddarBaconOign.png'),
  friteBlanche: require('../../assets/images/frites/friteBlanche.png'),
  fritesFromage: require('../../assets/images/nouveauxProduits/fritesFromage.png'),
  fritesBacon: require('../../assets/images/nouveauxProduits/FritesBacon.png'),

  // Boissons
  iceTeaPeachh: require('../../assets/images/boissons/iceTeaPeachh.png'),
  oranginabouteille: require('../../assets/images/boissons/oranginabouteille.png'),
  capriSun: require('../../assets/images/boissons/capriSun.png'),
  coca: require('../../assets/images/boissons/coca.png'),
  cocaZero: require('../../assets/images/boissons/cocaZero.png'),
  hawai: require('../../assets/images/boissons/hawai.png'),
  fantaDragon: require('../../assets/images/boissons/fantaDragon.png'),
  cocaCherry: require('../../assets/images/boissons/cocaCherry.png'),
  oasisTropical: require('../../assets/images/boissons/oasisTropical.png'),
  sevenupMojito: require('../../assets/images/boissons/sevenupMojito.png'),
  oranginapetitebouteille: require('../../assets/images/boissons/oranginapetitebouteille.png'),
  cocaColaBouteille: require('../../assets/images/boissons/cocaColaBouteille.png'),
  cocaPetiteBouteille: require('../../assets/images/boissons/cocaPetiteBouteille.png'),
  cocaBouteilleSansSucres: require('../../assets/images/boissons/cocaBouteilleSansSucres.png'),
  fantaStrawberry: require('../../assets/images/boissons/fantaStrawberry.png'),
  fantaGrape: require('../../assets/images/boissons/fantaGrape.png'),
  fantaBerry: require('../../assets/images/boissons/fantaBerry.png'),
  monsterEnergy: require('../../assets/images/boissons/monsterEnergy.png'),
  crazyTiger: require('../../assets/images/boissons/crazyTiger.png'),
  sevenupCherry: require('../../assets/images/boissons/sevenupCherry.png'),
  oasisPommeCassisFramboise: require('../../assets/images/boissons/oasisPommeCassisFramboise.png'),
  oasisTeaPeach: require('../../assets/images/boissons/oasisTeaPeach.png'),
  liptonFramboise: require('../../assets/images/boissons/liptonFramboise.png'),
  fantaCitron: require('../../assets/images/boissons/fantaCitron.png'),
  dadaFraise: require('../../assets/images/boissons/dadaFraise.png'),
  oasisPOmmePoire: require('../../assets/images/boissons/oasisPOmmePoire.png'),
  fantaAnanas: require('../../assets/images/boissons/fantaAnanas.png'),
  cocaVanille: require('../../assets/images/boissons/cocaVanille.png'),
  fanta: require('../../assets/images/boissons/fanta.png'),
  orangina: require('../../assets/images/boissons/orangina.png'),
  sprite: require('../../assets/images/boissons/sprite.png'),
  perrier: require('../../assets/images/boissons/perrier.png'),
  cristalline: require('../../assets/images/boissons/cristaline.png'),
  oasisPcf2L: require('../../assets/images/boissons/oasisPcf2L.jpg'),
  schweppesAgrumes: require('../../assets/images/boissons/schweppesAgrumes.jpg'),
  // Nouvelles Boissons
  bissap: require('../../assets/images/nouveauxProduits/bissap.png'),
  jusOrange: require('../../assets/images/boissonsNouvelles/jusOrange.png'),
  jusCitron: require('../../assets/images/boissonsNouvelles/jusCitron.png'),
  jusFraise: require('../../assets/images/boissonsNouvelles/jusFraise.png'),

  // Pizzas
  pizzaSaumon: require('../../assets/images/pizzas/pizzaSaumon.png'),
  pizzaTexMex: require('../../assets/images/pizzas/pizzaTexMex.png'),
  pizzaCurry: require('../../assets/images/pizzas/pizzaCurry.png'),
  pizza4Fromages: require('../../assets/images/nouveauxProduits/pizza4fromages.png'),
  pizzaRaclette: require('../../assets/images/pizzas/pizzaRaclette.png'),
  pizzaWestern: require('../../assets/images/pizzas/pizzaWestern.png'),
  pizzaKebab: require('../../assets/images/pizzas/pizzaKebab.png'),
  pizzaMargherita: require('../../assets/images/nouveauxProduits/margaritha.png'),
  pizzaChevreMiel: require('../../assets/images/pizzas/pizzaChevreMiel.png'),
  pizzaFermiere: require('../../assets/images/nouveauxProduits/pizzaFermiere.png'),
  pizzaBurger: require('../../assets/images/pizzas/pizzaburger.png'),

  // Lasagnes
  lasagneBolognaise: require('../../assets/images/nouveauxProduits/lasagneBolognaise.png'),
  lasagnePoulet: require('../../assets/images/lasagnes/lasagnePoulet.png'),
  lasagneSaumon: require('../../assets/images/lasagnes/lasagneSaumon.png'),

  // Nouveaux Produits
  kebab: require('../../assets/images/nouveauxProduits/kebab.png'),
  MenuKidss: require('../../assets/images/nouveauxProduits/MenuKidss.png'),
  bowls: require('../../assets/images/nouveauxProduits/bowls.png'),
  brunch: require('../../assets/images/nouveauxProduits/brunch.png'),
  toastSpecial: require('../../assets/images/nouveauxProduits/toast.png'),
  croissantBurger: require('../../assets/images/nouveauxProduits/croissantBurger.png'),
  croissantSaumon: require('../../assets/images/nouveauxProduits/croissantSaumon.png'),
  americainDouble: require('../../assets/images/nouveauxProduits/AmericainDouble.png'),
  americainSimple: require('../../assets/images/nouveauxProduits/AmericainSimple.png'),
  msSpecial: require('../../assets/images/nouveauxProduits/M&S.png'),

  // Boissons chaudes
  cafe: require('../../assets/images/nouveauxProduits/cafe.png'),
  chocolatChaud: require('../../assets/images/nouveauxProduits/chocolatChaud.png'),
};

/**
 * Obtenir l'image (URL Firebase ou require local)
 * @param {string} key - Clé de l'image (ex: 'baconBBurger')
 * @returns {string|number} URL Firebase ou require local
 */
export function getImage(key) {
  if (USE_FIREBASE_IMAGES && firebaseUrls[key]) {
    return { uri: firebaseUrls[key] };
  }
  return localImages[key] || null;
}

/**
 * Obtenir toutes les images (pour préchargement)
 */
export function getAllImages() {
  if (USE_FIREBASE_IMAGES) {
    return Object.entries(firebaseUrls).map(([key, url]) => ({
      key,
      source: { uri: url }
    }));
  }
  return Object.entries(localImages).map(([key, source]) => ({
    key,
    source
  }));
}

/**
 * Vérifier si on utilise Firebase
 */
export function isUsingFirebase() {
  return USE_FIREBASE_IMAGES && Object.keys(firebaseUrls).length > 0;
}

// Export par défaut : les images locales (compatibilité)
const productImages = localImages;
export default productImages;
