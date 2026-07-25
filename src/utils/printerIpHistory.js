import AsyncStorage from '@react-native-async-storage/async-storage';

// Adresses IP d'imprimantes déjà utilisées, pour éviter de les retaper.
// Stockées sur l'appareil : une IP de réseau local n'a pas de sens ailleurs.
const STORAGE_KEY = '@printer_ip_history';

// Au-delà, la liste devient un mur d'adresses au lieu d'un raccourci
const MAX_ENTRIES = 5;

// Forme d'une IPv4, chaque octet entre 0 et 255
const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export const isValidIpAddress = (ip) => IPV4_PATTERN.test(String(ip || '').trim());

export const getPrinterIpHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // On refiltre à la lecture : une entrée corrompue ne doit pas être proposée
    return parsed.filter(isValidIpAddress).slice(0, MAX_ENTRIES);
  } catch (error) {
    console.error('❌ Erreur lecture historique IP imprimante:', error);
    return [];
  }
};

// Enregistre une adresse et la remonte en tête. Retourne l'historique à jour.
export const rememberPrinterIp = async (ip) => {
  const address = String(ip || '').trim();
  if (!isValidIpAddress(address)) return getPrinterIpHistory();

  try {
    const history = await getPrinterIpHistory();
    const next = [address, ...history.filter(entry => entry !== address)].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('❌ Erreur enregistrement IP imprimante:', error);
    return getPrinterIpHistory();
  }
};

export const forgetPrinterIp = async (ip) => {
  try {
    const history = await getPrinterIpHistory();
    const next = history.filter(entry => entry !== ip);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('❌ Erreur suppression IP imprimante:', error);
    return getPrinterIpHistory();
  }
};

export default {
  isValidIpAddress,
  getPrinterIpHistory,
  rememberPrinterIp,
  forgetPrinterIp,
};
