import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase BriveFood (nouvelle base)
const firebaseConfig = {
  apiKey: "AIzaSyAJ1uBXMasfgJGFgtS2RQ_QKI2_zAXkpMI",
  authDomain: "brivefood-49d20.firebaseapp.com",
  projectId: "brivefood-49d20",
  storageBucket: "brivefood-49d20.firebasestorage.app",
  messagingSenderId: "1083217505624",
  appId: "1:1083217505624:web:f8a9fca32bbeb61e8c492d",
  measurementId: "G-35T68KFZ86"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de l'authentification avec persistance
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialisation de Firestore
//
// Par défaut le SDK Web communique via WebChannel (flux continu) et tente de
// détecter tout seul s'il doit basculer en long polling. Sur React Native cette
// détection échoue régulièrement sur les vrais appareils (réseaux mobiles, wifi
// filtrés, proxies) : les lectures continuent d'être servies par le cache local,
// mais les écritures ne sont jamais confirmées. La commande semble alors échouer
// pour « connexion instable » alors que le réseau fonctionne.
//
// On force donc le long polling, transport HTTP classique et fiable partout.
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  // Les flux fetch ne sont pas pleinement supportés par React Native
  useFetchStreams: false,
});

// Initialisation du stockage
const storage = getStorage(app);

export { auth, db, storage };
export default app;