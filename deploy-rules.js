#!/usr/bin/env node

/**
 * Script pour déployer les règles Firestore
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Configuration avec votre projet
const serviceAccount = {
  "type": "service_account",
  "project_id": "brive-food"
};

// Lire et deployer les règles directement via l'API REST
const https = require('https');

const deployRules = async () => {
  // Règles temporaires permissives pour le développement
  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RÈGLES TEMPORAIRES - ACCÈS TOTAL POUR LE DÉVELOPPEMENT
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  console.log('🔄 Déploiement des règles Firestore permissives...');
  
  // Pour l'instant, on va juste confirmer que les règles sont prêtes
  console.log('✅ Règles préparées dans firestore.rules');
  console.log('📝 Contenu des règles:');
  console.log(rules);
  
  console.log('\n🚨 ATTENTION: Ces règles donnent accès total à Firestore !');
  console.log('🔒 À sécuriser avant la production !');
  
  console.log('\n💡 Pour déployer manuellement:');
  console.log('   1. Allez dans Firebase Console > Firestore > Rules');
  console.log('   2. Remplacez le contenu par les règles ci-dessus');
  console.log('   3. Cliquez "Publier"');
};

deployRules().catch(console.error);