import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase BriveFood
const firebaseConfig = {
  apiKey: "AIzaSyAcpY3flMSHG-8N4mcrbH3E5ngplUUYHzQ",
  authDomain: "brive-food.firebaseapp.com",
  projectId: "brive-food",
  storageBucket: "brive-food.firebasestorage.app",
  messagingSenderId: "8050658488",
  appId: "1:8050658488:web:e0fd7a8a2d1db78770784d",
  measurementId: "G-CNFPVQEQL4"
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