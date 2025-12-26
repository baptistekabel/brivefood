/**
 * Script de migration Firebase Authentication
 *
 * IMPORTANT: Ce script nécessite Firebase Admin SDK avec des credentials de service
 * pour les DEUX projets (ancien et nouveau).
 *
 * Les utilisateurs Firebase Auth ne peuvent PAS être migrés via le SDK client.
 * Il faut utiliser la console Firebase ou Firebase Admin SDK.
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('        🔐 MIGRATION FIREBASE AUTHENTICATION');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('⚠️  Les utilisateurs Firebase Authentication ne peuvent pas');
console.log('   être migrés automatiquement avec un script client.');
console.log('');
console.log('📋 OPTIONS DISPONIBLES:');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPTION 1: Export/Import via Console Firebase (Recommandé)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('1. Va sur https://console.firebase.google.com');
console.log('2. Sélectionne l\'ancien projet: brive-food');
console.log('3. Va dans Authentication → Users');
console.log('4. Clique sur ⋮ (3 points) → Export users');
console.log('5. Télécharge le fichier CSV/JSON');
console.log('');
console.log('6. Sélectionne le nouveau projet: brivefood-49d20');
console.log('7. Va dans Authentication → Users');
console.log('8. Clique sur ⋮ (3 points) → Import users');
console.log('9. Upload le fichier exporté');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPTION 2: Firebase CLI (avec hash passwords)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('# Exporter depuis l\'ancien projet:');
console.log('firebase auth:export users.json --project brive-food');
console.log('');
console.log('# Importer dans le nouveau projet:');
console.log('firebase auth:import users.json --project brivefood-49d20');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPTION 3: Laisser les utilisateurs se réinscrire');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Si c\'est une nouvelle version de l\'app, les utilisateurs');
console.log('peuvent simplement créer un nouveau compte.');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
