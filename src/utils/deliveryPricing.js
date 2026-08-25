import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Les tarifs sont publiés sur Firestore : enregistrés uniquement dans
// l'AsyncStorage de la tablette admin, ils n'atteignaient jamais les clients,
// qui facturaient donc systématiquement la grille par défaut. L'écran de
// configuration des prix n'avait aucun effet réel.
const SETTINGS_DOC = ['settings', 'delivery_pricing'];

// Copie locale, conservée comme cache hors ligne uniquement
export const DELIVERY_SETTINGS_KEY = '@deliverySettings';

// Un palier par kilomètre : index 0 = 0-1 km, index 1 = 1-2 km, etc.
export const DEFAULT_TIER_PRICES = [5, 5, 5, 8, 8, 10, 10, 10, 10, 10];
export const DEFAULT_MAX_DISTANCE = 10;

// Position réelle du restaurant, relevée sur l'adresse ci-dessous via
// api-adresse.data.gouv.fr. La valeur utilisée jusqu'ici était le centre de
// Brive-la-Gaillarde, à environ 950 m — soit près d'un palier d'écart sur
// chaque livraison.
export const DEFAULT_RESTAURANT_COORDS = { lat: 45.157566, lng: 1.524584 };

export const DEFAULT_DELIVERY_SETTINGS = {
  // Interrupteur admin : à false, le mode « Livraison » disparaît côté client
  deliveryEnabled: true,
  restaurantAddress: '23 Bis Avenue Du Président Roosevelt, Brive-La-Gaillarde',
  restaurantCoords: DEFAULT_RESTAURANT_COORDS,
  tierPrices: DEFAULT_TIER_PRICES,
  maxDistance: DEFAULT_MAX_DISTANCE,
};

// Ancien format (3 zones) : converti en paliers d'1 km pour rester compatible
const migrateZonesToTiers = (settings) => {
  const maxDistance = settings.maxDistance || DEFAULT_MAX_DISTANCE;
  const tierPrices = [];

  for (let km = 0; km < Math.round(maxDistance); km++) {
    if (km < 3) {
      tierPrices.push(settings.priceZone1 ?? DEFAULT_TIER_PRICES[0]);
    } else if (km < 5) {
      tierPrices.push(settings.priceZone2 ?? DEFAULT_TIER_PRICES[3]);
    } else {
      tierPrices.push(settings.priceZone3 ?? DEFAULT_TIER_PRICES[5]);
    }
  }

  return tierPrices;
};

// Complète ou tronque la grille pour qu'elle couvre exactement la distance maximale
export const normalizeTierPrices = (tierPrices, maxDistance) => {
  const tierCount = Math.max(1, Math.round(maxDistance || DEFAULT_MAX_DISTANCE));
  const source = Array.isArray(tierPrices) && tierPrices.length > 0
    ? tierPrices
    : DEFAULT_TIER_PRICES;

  return Array.from({ length: tierCount }, (_, index) => {
    const price = source[index] ?? source[source.length - 1];
    return Number(price) || 0;
  });
};

// Met en forme un enregistrement brut (Firestore ou cache local)
const normalizeSettings = (raw) => {
  if (!raw) return DEFAULT_DELIVERY_SETTINGS;

  const maxDistance = raw.maxDistance || DEFAULT_MAX_DISTANCE;
  const tierPrices = Array.isArray(raw.tierPrices)
    ? raw.tierPrices
    : migrateZonesToTiers(raw);

  const coords = raw.restaurantCoords;
  const hasCoords = typeof coords?.lat === 'number' && typeof coords?.lng === 'number';

  return {
    ...DEFAULT_DELIVERY_SETTINGS,
    ...raw,
    // Absent du document = livraison active (comportement historique)
    deliveryEnabled: raw.deliveryEnabled !== false,
    maxDistance,
    tierPrices: normalizeTierPrices(tierPrices, maxDistance),
    restaurantCoords: hasCoords ? coords : DEFAULT_RESTAURANT_COORDS,
  };
};

// Cache local : sert de repli quand le réseau est coupé
const cacheSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('⚠️ Cache des paramètres de livraison indisponible:', error.message);
  }
};

const readCachedSettings = async () => {
  try {
    const stored = await AsyncStorage.getItem(DELIVERY_SETTINGS_KEY);
    return stored ? normalizeSettings(JSON.parse(stored)) : null;
  } catch (error) {
    console.error('Erreur lecture du cache des paramètres de livraison:', error);
    return null;
  }
};

// Lit les réglages publiés par l'admin, avec repli sur le cache puis les valeurs
// par défaut : une coupure réseau ne doit pas empêcher de commander.
export const loadDeliverySettings = async () => {
  try {
    const snapshot = await getDoc(doc(db, ...SETTINGS_DOC));

    if (snapshot.exists()) {
      const settings = normalizeSettings(snapshot.data());
      await cacheSettings(settings);
      return settings;
    }

    // Document jamais publié : la tablette admin peut encore avoir sa grille
    // en local, on la conserve jusqu'à son prochain enregistrement
    console.warn('⚠️ Tarifs de livraison absents de Firestore, repli sur le cache local');
  } catch (error) {
    console.error('Erreur lecture des paramètres de livraison:', error);
  }

  return (await readCachedSettings()) || DEFAULT_DELIVERY_SETTINGS;
};

export const saveDeliverySettings = async (settings) => {
  try {
    const toStore = normalizeSettings({
      ...settings,
      tierPrices: normalizeTierPrices(settings.tierPrices, settings.maxDistance),
    });

    await setDoc(
      doc(db, ...SETTINGS_DOC),
      { ...toStore, updatedAt: serverTimestamp() },
      { merge: true }
    );
    await cacheSettings(toStore);

    return { success: true, settings: toStore };
  } catch (error) {
    console.error('Erreur sauvegarde des paramètres de livraison:', error);
    return { success: false, error: error.message };
  }
};

// Activation / désactivation de la livraison depuis les paramètres admin.
// Écriture ciblée : les tarifs et la distance maximale ne sont pas retouchés.
export const setDeliveryEnabled = async (enabled) => {
  try {
    await setDoc(
      doc(db, ...SETTINGS_DOC),
      { deliveryEnabled: !!enabled, updatedAt: serverTimestamp() },
      { merge: true }
    );

    const cached = (await readCachedSettings()) || DEFAULT_DELIVERY_SETTINGS;
    const settings = { ...cached, deliveryEnabled: !!enabled };
    await cacheSettings(settings);

    return { success: true, settings };
  } catch (error) {
    console.error('Erreur mise à jour de l\'activation de la livraison:', error);
    return { success: false, error: error.message };
  }
};

// Reprise de l'existant : la grille configurée avant le passage à Firestore
// n'existe que dans l'AsyncStorage de la tablette admin. On la publie une fois,
// sinon le restaurant retomberait sans prévenir sur les tarifs par défaut.
export const ensureDeliverySettingsPublished = async () => {
  try {
    const snapshot = await getDoc(doc(db, ...SETTINGS_DOC));
    if (snapshot.exists()) return { success: true, published: false };

    const cached = await readCachedSettings();
    const result = await saveDeliverySettings(cached || DEFAULT_DELIVERY_SETTINGS);

    if (result.success) {
      console.log('☁️ Tarifs de livraison publiés pour les clients');
      return { success: true, published: true, settings: result.settings };
    }

    return result;
  } catch (error) {
    console.error('Erreur publication des paramètres de livraison:', error);
    return { success: false, error: error.message };
  }
};

// Écoute temps réel : l'admin change un palier, les paniers ouverts suivent
export const subscribeToDeliverySettings = (callback) => {
  try {
    return onSnapshot(
      doc(db, ...SETTINGS_DOC),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const settings = normalizeSettings(snapshot.data());
        cacheSettings(settings);
        callback(settings);
      },
      (error) => console.error('❌ Erreur écoute des tarifs de livraison:', error)
    );
  } catch (error) {
    console.error('❌ Erreur souscription aux tarifs de livraison:', error);
    return () => {};
  }
};

// Frais de livraison pour une distance donnée, null si hors zone
export const getDeliveryFee = (distanceKm, settings = DEFAULT_DELIVERY_SETTINGS) => {
  const maxDistance = settings.maxDistance || DEFAULT_MAX_DISTANCE;
  const tierPrices = normalizeTierPrices(settings.tierPrices, maxDistance);

  if (typeof distanceKm !== 'number' || isNaN(distanceKm) || distanceKm < 0) return null;
  if (distanceKm > maxDistance) return null;

  // 0,5 km appartient au palier 0-1 ; 3,2 km au palier 3-4
  const index = Math.min(
    Math.max(Math.ceil(distanceKm) - 1, 0),
    tierPrices.length - 1
  );

  return tierPrices[index];
};

// Libellés des paliers pour l'affichage : "0-1 km", "1-2 km", ...
export const getTierLabel = (index) => `${index}-${index + 1} km`;

// Position du restaurant à partir de son adresse, via l'API adresse du
// gouvernement — la même que celle utilisée pour les adresses clients.
export const geocodeAddress = async (address) => {
  if (!address) return null;

  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    const feature = data?.features?.[0];

    if (!feature) return null;

    return {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    };
  } catch (error) {
    console.error('Erreur géocodage de l\'adresse:', error);
    return null;
  }
};
