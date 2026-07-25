/**
 * Script de migration Firebase
 * Transfère les données de l'ancienne base vers la nouvelle
 *
 * Usage: node migrate-firebase.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

// ==================== CONFIGURATION ====================

// Ancienne base de données
const oldFirebaseConfig = {
  apiKey: "AIzaSyAcpY3flMSHG-8N4mcrbH3E5ngplUUYHzQ",
  authDomain: "brive-food.firebaseapp.com",
  projectId: "brive-food",
  storageBucket: "brive-food.firebasestorage.app",
  messagingSenderId: "8050658488",
  appId: "1:8050658488:web:e0fd7a8a2d1db78770784d",
  measurementId: "G-CNFPVQEQL4"
};

// Nouvelle base de données
const newFirebaseConfig = {
  apiKey: "AIzaSyAJ1uBXMasfgJGFgtS2RQ_QKI2_zAXkpMI",
  authDomain: "brivefood-49d20.firebaseapp.com",
  projectId: "brivefood-49d20",
  storageBucket: "brivefood-49d20.firebasestorage.app",
  messagingSenderId: "1083217505624",
  appId: "1:1083217505624:web:f8a9fca32bbeb61e8c492d",
  measurementId: "G-35T68KFZ86"
};

// Collections à migrer
const COLLECTIONS_TO_MIGRATE = [
  'products',
  'categories',
  'orders',
  'users',
  'ratings',
  'loyalty',
  'settings',
  'notifications',
  'deliveryPersons',
  'restaurantStatus',
  'customizations',
  'promos',
  'adminUsers'
];

// ==================== INITIALISATION ====================

// Initialiser les deux apps Firebase
const oldApp = initializeApp(oldFirebaseConfig, 'old-firebase');
const newApp = initializeApp(newFirebaseConfig, 'new-firebase');

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

// ==================== FONCTIONS DE MIGRATION ====================

/**
 * Migre une collection complète
 */
async function migrateCollection(collectionName) {
  console.log(`\n📦 Migration de la collection: ${collectionName}`);

  try {
    // Lire tous les documents de l'ancienne base
    const oldCollectionRef = collection(oldDb, collectionName);
    const snapshot = await getDocs(oldCollectionRef);

    if (snapshot.empty) {
      console.log(`   ⚠️  Collection vide ou inexistante: ${collectionName}`);
      return { success: true, count: 0 };
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Migrer chaque document
    for (const docSnapshot of snapshot.docs) {
      try {
        const docData = docSnapshot.data();
        const docId = docSnapshot.id;

        // Écrire dans la nouvelle base
        const newDocRef = doc(newDb, collectionName, docId);
        await setDoc(newDocRef, docData);

        migratedCount++;
        process.stdout.write(`   ✅ ${migratedCount}/${snapshot.size} documents migrés\r`);

      } catch (docError) {
        errorCount++;
        console.error(`   ❌ Erreur document ${docSnapshot.id}:`, docError.message);
      }
    }

    console.log(`   ✅ ${migratedCount} documents migrés avec succès (${errorCount} erreurs)`);
    return { success: true, count: migratedCount, errors: errorCount };

  } catch (error) {
    console.error(`   ❌ Erreur migration ${collectionName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Migre un document spécifique (pour les singletons comme settings)
 */
async function migrateSingleDocument(collectionName, docId) {
  console.log(`\n📄 Migration du document: ${collectionName}/${docId}`);

  try {
    const oldDocRef = doc(oldDb, collectionName, docId);
    const oldDocSnapshot = await getDoc(oldDocRef);

    if (!oldDocSnapshot.exists()) {
      console.log(`   ⚠️  Document inexistant: ${collectionName}/${docId}`);
      return { success: true, exists: false };
    }

    const docData = oldDocSnapshot.data();
    const newDocRef = doc(newDb, collectionName, docId);
    await setDoc(newDocRef, docData);

    console.log(`   ✅ Document migré avec succès`);
    return { success: true, exists: true };

  } catch (error) {
    console.error(`   ❌ Erreur:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fonction principale de migration
 */
async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('        🚀 MIGRATION FIREBASE - BRIVEFOOD');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📍 Ancienne base: ${oldFirebaseConfig.projectId}`);
  console.log(`📍 Nouvelle base: ${newFirebaseConfig.projectId}`);
  console.log('\n⏳ Début de la migration...\n');

  const results = {
    success: [],
    failed: [],
    empty: []
  };

  // Migrer toutes les collections
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    const result = await migrateCollection(collectionName);

    if (result.success) {
      if (result.count > 0) {
        results.success.push({ name: collectionName, count: result.count });
      } else {
        results.empty.push(collectionName);
      }
    } else {
      results.failed.push({ name: collectionName, error: result.error });
    }
  }

  // Résumé
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    📊 RÉSUMÉ DE LA MIGRATION');
  console.log('═══════════════════════════════════════════════════════════');

  if (results.success.length > 0) {
    console.log('\n✅ Collections migrées avec succès:');
    results.success.forEach(c => {
      console.log(`   - ${c.name}: ${c.count} documents`);
    });
  }

  if (results.empty.length > 0) {
    console.log('\n⚠️  Collections vides/inexistantes:');
    results.empty.forEach(name => {
      console.log(`   - ${name}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Collections en erreur:');
    results.failed.forEach(c => {
      console.log(`   - ${c.name}: ${c.error}`);
    });
  }

  const totalMigrated = results.success.reduce((sum, c) => sum + c.count, 0);
  console.log(`\n📈 Total: ${totalMigrated} documents migrés`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    ✨ MIGRATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Exécuter la migration
runMigration()
  .then(() => {
    console.log('👋 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
