#!/usr/bin/env node

/**
 * Script pour créer manuellement les profils dans Firestore
 * Utilise l'authentification avec votre compte existant
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcpY3flMSHG-8N4mcrbH3E5ngplUUYHzQ",
  authDomain: "brive-food.firebaseapp.com",
  projectId: "brive-food",
  storageBucket: "brive-food.firebasestorage.app",
  messagingSenderId: "8050658488",
  appId: "1:8050658488:web:e0fd7a8a2d1db78770784d",
  measurementId: "G-CNFPVQEQL4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createProfiles() {
  try {
    console.log('🔐 Connexion avec votre compte admin...');
    
    // Se connecter avec votre compte admin existant
    await signInWithEmailAndPassword(auth, 'kabelbaptiste971@gmail.com', 'Brivefood');
    const user = auth.currentUser;
    console.log(`✅ Connecté: ${user.email} (${user.uid})`);
    
    // Profils à créer/mettre à jour
    const profiles = [
      {
        uid: user.uid, // Votre compte existant
        email: 'kabelbaptiste971@gmail.com',
        displayName: 'Baptiste Admin',
        role: 'admin'
      },
      {
        uid: 'QauIAUKCBMXLnGOV7ZxPnwGPO9V2', // UID du test créé
        email: 'test@gmail.com',
        displayName: 'Test Admin', 
        role: 'admin'
      },
      {
        uid: '8xjQfgimUyNPlzW67FHKMazeOK92', // UID du livreur créé
        email: 'livreur@brivefood.com',
        displayName: 'Livreur Principal',
        role: 'delivery'
      }
    ];
    
    console.log('\n📝 Création des profils Firestore...');
    
    for (const profile of profiles) {
      console.log(`🔄 Création du profil pour ${profile.email}...`);
      
      await setDoc(doc(db, 'users', profile.uid), {
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        lastLoginAt: null
      });
      
      console.log(`✅ Profil créé: ${profile.email} (${profile.role})`);
    }
    
    console.log('\n🎉 Tous les profils ont été créés avec succès!');
    console.log('\n📱 Comptes disponibles:');
    console.log('   👑 kabelbaptiste971@gmail.com / Brivefood (admin)');
    console.log('   👑 test@gmail.com / Brivefood (admin)');
    console.log('   🚲 livreur@brivefood.com / Brivefood (delivery)');
    
    console.log('\n✨ L\'authentification persistera maintenant automatiquement!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('   - Votre email/mot de passe sont corrects');
    console.log('   - Les règles Firestore autorisent l\'écriture');
    console.log('   - Votre connexion internet fonctionne');
    process.exit(1);
  }
}

setupProfiles().catch(console.error);

// Alias pour la fonction
async function setupProfiles() {
  return createProfiles();
}