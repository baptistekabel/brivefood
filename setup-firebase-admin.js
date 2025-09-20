#!/usr/bin/env node

/**
 * Script pour créer automatiquement les comptes admin et livreur sur Firebase
 * 
 * Ce script utilise Firebase Admin SDK pour :
 * 1. Créer les utilisateurs dans Firebase Authentication
 * 2. Créer leurs profils dans Firestore
 * 
 * Usage: node setup-firebase-admin.js
 */

const admin = require('firebase-admin');

// Configuration Firebase Admin (utilisez votre clé de service)
const serviceAccount = {
  "type": "service_account",
  "project_id": "brive-food",
  "private_key_id": "VOTRE_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nVOTRE_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@brive-food.iam.gserviceaccount.com",
  "client_id": "VOTRE_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/service-accounts/v1/metadata/x509/firebase-adminsdk-xxxxx%40brive-food.iam.gserviceaccount.com"
};

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://brive-food-default-rtdb.firebaseapp.com"
});

const auth = admin.auth();
const firestore = admin.firestore();

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
  },
  {
    email: 'delivery@brivefood.com',
    password: 'Brivefood',
    displayName: 'Livreur 2',
    role: 'delivery'
  }
];

async function createUser(userData) {
  try {
    console.log(`🔄 Création de l'utilisateur ${userData.email}...`);
    
    // 1. Créer l'utilisateur dans Authentication
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      emailVerified: true
    });
    
    console.log(`✅ Utilisateur créé dans Authentication: ${userRecord.uid}`);
    
    // 2. Créer le profil dans Firestore
    const userProfile = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      isActive: true
    };
    
    await firestore.collection('users').doc(userRecord.uid).set(userProfile);
    
    console.log(`✅ Profil créé dans Firestore pour ${userData.email} (${userData.role})`);
    
    return {
      success: true,
      uid: userRecord.uid,
      email: userData.email,
      role: userData.role
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log(`ℹ️  L'utilisateur ${userData.email} existe déjà`);
      
      try {
        // Récupérer l'utilisateur existant
        const existingUser = await auth.getUserByEmail(userData.email);
        
        // Mettre à jour le profil Firestore
        const userProfile = {
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        };
        
        await firestore.collection('users').doc(existingUser.uid).set(userProfile, { merge: true });
        console.log(`✅ Profil mis à jour dans Firestore pour ${userData.email}`);
        
        return {
          success: true,
          uid: existingUser.uid,
          email: userData.email,
          role: userData.role,
          updated: true
        };
      } catch (updateError) {
        console.error(`❌ Erreur lors de la mise à jour:`, updateError.message);
        return { success: false, email: userData.email, error: updateError.message };
      }
    }
    
    return { success: false, email: userData.email, error: error.message };
  }
}

async function setupFirebaseUsers() {
  console.log('🚀 Début de la configuration des utilisateurs Firebase...\n');
  
  const results = [];
  
  for (const userData of users) {
    const result = await createUser(userData);
    results.push(result);
    console.log(''); // Ligne vide pour la lisibilité
  }
  
  console.log('📊 Résumé de la configuration:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    if (result.success) {
      const status = result.updated ? '🔄 MISE À JOUR' : '✨ CRÉÉ';
      console.log(`${status} ${result.email} (${result.role}) - UID: ${result.uid}`);
    } else {
      console.log(`❌ ÉCHEC ${result.email} - Erreur: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎉 ${successCount}/${users.length} utilisateurs configurés avec succès!`);
  
  if (successCount > 0) {
    console.log('\n📱 Vous pouvez maintenant vous connecter avec:');
    results.forEach(result => {
      if (result.success) {
        console.log(`   📧 ${result.email} / 🔑 Brivefood (${result.role})`);
      }
    });
  }
  
  console.log('\n✅ Configuration terminée!');
  process.exit(0);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Lancer le script
setupFirebaseUsers().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});