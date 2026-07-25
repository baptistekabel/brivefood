import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Document dédié, volontairement séparé de `settings/restaurant_status` :
// ce dernier est réécrit intégralement (setDoc sans merge) toutes les minutes
// par le monitoring automatique, ce qui effacerait tout champ ajouté ici.
const RUSH_DOC = ['settings', 'service_load'];

// Rallonges proposées à l'admin, en minutes
export const RUSH_DELAY_OPTIONS = [15, 30, 45];

export const DEFAULT_RUSH_DELAY = 15;

const emptyState = {
  active: false,
  extraMinutes: 0,
  updatedAt: null,
};

const parseSnapshot = (snapshot) => {
  if (!snapshot.exists()) return { ...emptyState };

  const data = snapshot.data();
  return {
    active: data.active === true,
    // Une affluence active sans délai n'aurait aucun effet visible
    extraMinutes: data.active === true ? (Number(data.extraMinutes) || DEFAULT_RUSH_DELAY) : 0,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
};

class RushModeService {
  constructor() {
    this.current = { ...emptyState };
  }

  async getRushMode() {
    try {
      const snapshot = await getDoc(doc(db, ...RUSH_DOC));
      this.current = parseSnapshot(snapshot);
      return this.current;
    } catch (error) {
      console.error('❌ Erreur lecture mode affluence:', error);
      return { ...emptyState };
    }
  }

  // Activer / desactiver l'affluence. Visible immediatement par les clients
  // grace au listener temps reel.
  async setRushMode(active, extraMinutes = DEFAULT_RUSH_DELAY) {
    try {
      const payload = {
        active: !!active,
        extraMinutes: active ? Number(extraMinutes) || DEFAULT_RUSH_DELAY : 0,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, ...RUSH_DOC), payload);
      this.current = {
        active: payload.active,
        extraMinutes: payload.extraMinutes,
        updatedAt: new Date().toISOString(),
      };

      console.log(
        `🕒 Mode affluence ${payload.active ? `ACTIVE (+${payload.extraMinutes} min)` : 'DESACTIVE'}`
      );
      return { success: true, rushMode: this.current };
    } catch (error) {
      console.error('❌ Erreur mise à jour mode affluence:', error);
      return { success: false, error: error.message };
    }
  }

  // Ecoute temps reel : l'admin active l'affluence, les clients le voient sans
  // avoir a relancer l'application
  subscribe(callback) {
    try {
      return onSnapshot(
        doc(db, ...RUSH_DOC),
        (snapshot) => {
          this.current = parseSnapshot(snapshot);
          callback(this.current);
        },
        (error) => {
          console.error('❌ Erreur écoute mode affluence:', error);
          callback({ ...emptyState });
        }
      );
    } catch (error) {
      console.error('❌ Erreur souscription mode affluence:', error);
      return () => {};
    }
  }
}

const rushModeService = new RushModeService();
export default rushModeService;
