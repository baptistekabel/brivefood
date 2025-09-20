#!/usr/bin/env node

/**
 * Script simplifié pour créer les profils Firestore
 * Utilise la même configuration que votre app
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (même que votre app)
const firebaseConfig = {
  apiKey: "AIzaSyAcpY3flMSHG-8N4mcrbH3E5ngplUUYHzQ",
  authDomain: "brive-food.firebaseapp.com",
  projectId: "brive-food",
  storageBucket: "brive-food.firebasestorage.app",
  messagingSenderId: "8050658488",
  appId: "1:8050658488:web:e0fd7a8a2d1db78770784d",
  measurementId: "G-CNFPVQEQL4"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utilisateurs à créer
const users = [
  {
    email: 'kabelbaptiste971@gmail.com',
    password: 'Brivefood',
    displayName: 'Baptiste Admin',
    role: 'admin'
  },
  {
    email: 'test@gmail.com', 
    password: 'Brivefood',
    displayName: 'Test Admin',
    role: 'admin'
  },
  {
    email: 'livreur@brivefood.com',
    password: 'Brivefood',
    displayName: 'Livreur Principal',
    role: 'delivery'
  }
];

async function createFirebaseUser(userData) {
  try {
    console.log(`🔄 Création de ${userData.email}...`);
    
    // Créer l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    console.log(`✅ Utilisateur créé: ${user.uid}`);
    
    // Créer le profil Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      createdAt: serverTimestamp(),
      isActive: true,
      lastLoginAt: null
    });
    
    console.log(`✅ Profil Firestore créé pour ${userData.email} (${userData.role})`);
    
    return { success: true, uid: user.uid, email: userData.email };
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`ℹ️  ${userData.email} existe déjà`);
      return { success: true, email: userData.email, existing: true };
    }
    
    console.error(`❌ Erreur pour ${userData.email}:`, error.message);
    return { success: false, email: userData.email, error: error.message };
  }
}

async function setupUsers() {
  console.log('🚀 Configuration des utilisateurs Firebase...\n');
  
  for (const userData of users) {
    await createFirebaseUser(userData);
    console.log(''); // Ligne vide
  }
  
  console.log('🎉 Configuration terminée!');
  console.log('\n📱 Connectez-vous avec:');
  console.log('   📧 kabelbaptiste971@gmail.com');
  console.log('   🔑 Brivefood');
  
  process.exit(0);
}

setupUsers().catch(console.error);