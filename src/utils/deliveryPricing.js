import AsyncStorage from '@react-native-async-storage/async-storage';

export const DELIVERY_SETTINGS_KEY = '@deliverySettings';

// Un palier par kilomètre : index 0 = 0-1 km, index 1 = 1-2 km, etc.
export const DEFAULT_TIER_PRICES = [5, 5, 5, 8, 8, 10, 10, 10, 10, 10];
export const DEFAULT_MAX_DISTANCE = 10;

export const DEFAULT_DELIVERY_SETTINGS = {
  restaurantAddress: '23 Bis Avenue Du Président Roosevelt, Brive-La-Gaillarde',
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

// Lit les réglages enregistrés par l'admin (avec migration de l'ancien format)
export const loadDeliverySettings = async () => {
  try {
    const stored = await AsyncStorage.getItem(DELIVERY_SETTINGS_KEY);
    if (!stored) return DEFAULT_DELIVERY_SETTINGS;

    const parsed = JSON.parse(stored);
    const maxDistance = parsed.maxDistance || DEFAULT_MAX_DISTANCE;

    const tierPrices = Array.isArray(parsed.tierPrices)
      ? parsed.tierPrices
      : migrateZonesToTiers(parsed);

    return {
      ...DEFAULT_DELIVERY_SETTINGS,
      ...parsed,
      maxDistance,
      tierPrices: normalizeTierPrices(tierPrices, maxDistance),
    };
  } catch (error) {
    console.error('Erreur lecture des paramètres de livraison:', error);
    return DEFAULT_DELIVERY_SETTINGS;
  }
};

export const saveDeliverySettings = async (settings) => {
  try {
    const toStore = {
      ...settings,
      tierPrices: normalizeTierPrices(settings.tierPrices, settings.maxDistance),
    };
    await AsyncStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(toStore));
    return { success: true, settings: toStore };
  } catch (error) {
    console.error('Erreur sauvegarde des paramètres de livraison:', error);
    return { success: false, error: error.message };
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
