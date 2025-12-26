import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
const db = getFirestore(app);

// Initialisation du stockage
const storage = getStorage(app);

export { auth, db, storage };
export default app;