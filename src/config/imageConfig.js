/**
 * Configuration des images BriveFood
 *
 * USE_FIREBASE_STORAGE = true  → Charge les images depuis Firebase Storage
 * USE_FIREBASE_STORAGE = false → Charge les images locales (assets/)
 */

// Active Firebase Storage pour les images
export const USE_FIREBASE_STORAGE = true;

// URL de base Firebase Storage
export const FIREBASE_STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/brivefood-49d20.firebasestorage.app/o';

// Dossier des images dans Firebase Storage
export const FIREBASE_IMAGES_FOLDER = 'product-images';

/**
 * Génère l'URL Firebase Storage pour une image
 * @param {string} imagePath - Chemin relatif de l'image (ex: "burgers/baconBBurger.png")
 * @returns {string} URL complète Firebase Storage
 */
export function getFirebaseImageUrl(imagePath) {
  // Encoder le chemin pour l'URL
  const encodedPath = encodeURIComponent(`${FIREBASE_IMAGES_FOLDER}/${imagePath}`);
  return `${FIREBASE_STORAGE_BASE_URL}/${encodedPath}?alt=media`;
}

/**
 * Mapping des clés d'images vers les chemins Firebase
 * Ce mapping sera rempli après l'upload des images
 */
export const firebaseImagePaths = {
  // Pâtes
  patebolognaise: 'pates/patebolognaise.jpg',
  patescarbonara: 'pates/patescarbonara.jpg',
  patesaumon: 'pates/patesaumon.png',
  patesforestieres: 'pates/patesforestieres.png',
  pates3fromages: 'pates/pates3fromages.png',
  patespouletcurry: 'pates/patespouletcurry.png',

  // Burgers
  wiMac: 'burgers/wiMac.png',
  veggieBurger: 'burgers/veggieBurger.png',
  spicyBurger: 'burgers/spicyBurger.png',
  burgerClassic: 'burgers/burgerClassic.png',
  burgerBleu: 'burgers/burgerBleu.jpeg',
  baconBBurger: 'nouveauxProduits/BaconBBurger.png',
  doubleCheeseBurger: 'nouveauxProduits/DoubleCheese.png',
  duoBurger: 'nouveauxProduits/DuoBurger.png',
  burgerChevreMiel: 'burgers/burgerChevreMiel.png',
  chickenBurger: 'nouveauxProduits/ChickenBurger.png',
  frenchyBurger: 'nouveauxProduits/FrenchyBurger.png',

  // Tacos
  menuTacos: 'nouveauxProduits/MenuTacos.png',

  // Salades
  saladeCrudités: 'salades/saladeCrudites.png',
  saladeTomateMozza: 'salades/saladeTomateMozza.png',
  saladeChevreMiel: 'salades/saladeChevreMiel.png',
  saladeSaumon: 'salades/saladeSaumon.png',
  saladeChicken: 'nouveauxProduits/saladeChicken.png',

  // Desserts
  pizzaBrioche: 'desserts/pizzaBrioche.jpg',
  tiramisuSpeculosCaramel: 'desserts/tiramisuSpeculosCaramel.png',
  tiramisuOreo: 'desserts/tiramisuOreo.png',
  MilkshakeVanille: 'desserts/MilkshakeVanille.png',
  MilkshakeFraise: 'desserts/MilkshakeFraise.png',
  milkshake: 'nouveauxProduits/Milkshake.png',
  tarteDaim: 'desserts/tarteDaim.png',
  Gaufre: 'nouveauxProduits/Gaufre.png',
  tiramisuNutellaSpeculos: 'desserts/tiramisuNutellaSpeculos.png',
  kinderBueno: 'nouveauxProduits/kinderBueno.png',
  kinderBuenoWhite: 'nouveauxProduits/kinderbuenowhite.png',

  // Petites Faims
  hotDog: 'nouveauxProduits/HotDog.png',
  croque: 'nouveauxProduits/CroqueMonsieur.png',
  hotDogCrispy: 'nouveauxProduits/HotDogCrispy.png',
  doublePtitCheese: 'nouveauxProduits/DoublePtitCheese.png',
  cheese: 'nouveauxProduits/Cheese.png',
  croqChevreMiel: 'petitesFaims/croqChevreMiel.png',

  // Tex-Mex
  sticksMozza: 'tex-mex/scticksMozza.png',
  tenders: 'tex-mex/tenders.png',
  sticksChevre: 'tex-mex/sticksChevre.png',
  chilliCheese: 'nouveauxProduits/ChilliCheese.png',
  nuggets: 'nouveauxProduits/NUGGETS.png',
  boucheeCamembert: 'nouveauxProduits/BoucheeCammenbert.png',
  onionRings: 'nouveauxProduits/OignonsRings.png',
  wings: 'new/WINGS.png',

  // Frites
  fritesCheddar: 'frites/fritesCheddar.png',
  barquetteFrites: 'nouveauxProduits/frites.png',
  fritesCheddarBacon: 'nouveauxProduits/FritesCheddarBacon.png',
  fritesSauceFromagereOnionsFrits: 'nouveauxProduits/FritesOignonsFrits.png',
  fritesSauceFromagere: 'nouveauxProduits/FritesSauceFromagere.png',
  fritesSauceFromagereBaconOignonsFrits: 'nouveauxProduits/FritesCheddarBaconOign.png',
  friteBlanche: 'frites/friteBlanche.png',
  fritesFromage: 'nouveauxProduits/fritesFromage.png',
  fritesBacon: 'nouveauxProduits/FritesBacon.png',

  // Boissons
  iceTeaPeachh: 'boissons/iceTeaPeachh.png',
  oranginabouteille: 'boissons/oranginabouteille.png',
  capriSun: 'boissons/capriSun.png',
  coca: 'boissons/coca.png',
  cocaZero: 'boissons/cocaZero.png',
  hawai: 'boissons/hawai.png',
  fantaDragon: 'boissons/fantaDragon.png',
  cocaCherry: 'boissons/cocaCherry.png',
  oasisTropical: 'boissons/oasisTropical.png',
  sevenupMojito: 'boissons/sevenupMojito.png',
  oranginapetitebouteille: 'boissons/oranginapetitebouteille.png',
  cocaColaBouteille: 'boissons/cocaColaBouteille.png',
  cocaPetiteBouteille: 'boissons/cocaPetiteBouteille.png',
  cocaBouteilleSansSucres: 'boissons/cocaBouteilleSansSucres.png',
  fantaStrawberry: 'boissons/fantaStrawberry.png',
  fantaGrape: 'boissons/fantaGrape.png',
  fantaBerry: 'boissons/fantaBerry.png',
  monsterEnergy: 'boissons/monsterEnergy.png',
  crazyTiger: 'boissons/crazyTiger.png',
  sevenupCherry: 'boissons/sevenupCherry.png',
  oasisPommeCassisFramboise: 'boissons/oasisPommeCassisFramboise.png',
  oasisTeaPeach: 'boissons/oasisTeaPeach.png',
  liptonFramboise: 'boissons/liptonFramboise.png',
  fantaCitron: 'boissons/fantaCitron.png',
  dadaFraise: 'boissons/dadaFraise.png',
  oasisPOmmePoire: 'boissons/oasisPOmmePoire.png',
  fantaAnanas: 'boissons/fantaAnanas.png',
  cocaVanille: 'boissons/cocaVanille.png',
  fanta: 'boissons/fanta.png',
  orangina: 'boissons/orangina.png',
  sprite: 'boissons/sprite.png',
  perrier: 'boissons/perrier.png',
  cristalline: 'boissons/cristaline.png',
  oasisPcf2L: 'boissons/oasisPcf2L.jpg',
  schweppesAgrumes: 'boissons/schweppesAgrumes.jpg',
  bissap: 'nouveauxProduits/bissap.png',
  jusOrange: 'boissonsNouvelles/jusOrange.png',
  jusCitron: 'boissonsNouvelles/jusCitron.png',
  jusFraise: 'boissonsNouvelles/jusFraise.png',

  // Pizzas
  pizzaSaumon: 'pizzas/pizzaSaumon.png',
  pizzaTexMex: 'pizzas/pizzaTexMex.png',
  pizzaCurry: 'pizzas/pizzaCurry.png',
  pizza4Fromages: 'nouveauxProduits/pizza4fromages.png',
  pizzaRaclette: 'pizzas/pizzaRaclette.png',
  pizzaWestern: 'pizzas/pizzaWestern.png',
  pizzaKebab: 'pizzas/pizzaKebab.png',
  pizzaMargherita: 'nouveauxProduits/margaritha.png',
  pizzaChevreMiel: 'pizzas/pizzaChevreMiel.png',
  pizzaFermiere: 'nouveauxProduits/pizzaFermiere.png',
  pizzaBurger: 'pizzas/pizzaburger.png',

  // Lasagnes
  lasagneBolognaise: 'nouveauxProduits/lasagneBolognaise.png',
  lasagnePoulet: 'lasagnes/lasagnePoulet.png',
  lasagneSaumon: 'lasagnes/lasagneSaumon.png',

  // Autres
  kebab: 'nouveauxProduits/kebab.png',
  MenuKidss: 'nouveauxProduits/MenuKidss.png',
  bowls: 'nouveauxProduits/bowls.png',
  brunch: 'nouveauxProduits/brunch.png',
  toastSpecial: 'nouveauxProduits/toast.png',
  croissantBurger: 'nouveauxProduits/croissantBurger.png',
  croissantSaumon: 'nouveauxProduits/croissantSaumon.png',
  americainDouble: 'nouveauxProduits/AmericainDouble.png',
  americainSimple: 'nouveauxProduits/AmericainSimple.png',
  msSpecial: 'nouveauxProduits/M&S.png',
  cafe: 'nouveauxProduits/cafe.png',
  chocolatChaud: 'nouveauxProduits/chocolatChaud.png',
  sandwichAmericain: 'sandwichAmericain.png',
  formuleDuo: 'nouveauxProduits/FormulePizza.Duo.png',
  formuleTrio: 'formuleTrio.png',

  // Bruschetta
  bruschettaMargarita: 'petiteFaimBruschetta/bruschettaMargarita.png',
  bruschetta4Fromages: 'petiteFaimBruschetta/bruschetta4Fromages.png',
  bruschettaPouletCurry: 'petiteFaimBruschetta/bruschettaPouletCurry.png',
  bruschettaChevreMiel: 'petiteFaimBruschetta/bruschettaChevreMiel.png',
};

export default {
  USE_FIREBASE_STORAGE,
  FIREBASE_STORAGE_BASE_URL,
  FIREBASE_IMAGES_FOLDER,
  getFirebaseImageUrl,
  firebaseImagePaths,
};
