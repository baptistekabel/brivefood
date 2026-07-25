import { RESTAURANT_PHONE, RESTAURANT_PHONE_URI } from './phoneOrderWindow';

// Délai laissé au client pour joindre le restaurant et faire annuler ou
// modifier sa commande. Passé ce délai la préparation est lancée en cuisine.
export const CANCELLATION_WINDOW_MINUTES = 2;
export const CANCELLATION_WINDOW_MS = CANCELLATION_WINDOW_MINUTES * 60 * 1000;

export { RESTAURANT_PHONE, RESTAURANT_PHONE_URI };

// Millisecondes restantes avant la fin du délai (0 si dépassé)
export const getRemainingCancellationMs = (createdAt, now = Date.now()) => {
  if (!createdAt) return 0;

  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return 0;

  return Math.max(0, created + CANCELLATION_WINDOW_MS - now);
};

export const isWithinCancellationWindow = (createdAt, now = Date.now()) =>
  getRemainingCancellationMs(createdAt, now) > 0;

// Formate un reste de temps en m:ss
export const formatRemaining = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const CANCELLATION_NOTICE =
  `Annulation ou modification possible pendant ${CANCELLATION_WINDOW_MINUTES} minutes `
  + `après validation, en appelant le restaurant au ${RESTAURANT_PHONE}. Passé ce délai, `
  + `la préparation est lancée et la commande ne peut plus être modifiée.`;
