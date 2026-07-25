// Test simple pour vérifier que les fichiers existent

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la structure BriveFood...\n');

const filesToCheck = [
  'src/constants/theme.js',
  'src/types/index.js', 
  'src/context/AuthContext.js',
  'config/firebase.js'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} manquant`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 Tous les fichiers requis sont présents !');
  console.log('📱 Vous pouvez maintenant lancer l\'app avec: npm start');
} else {
  console.log('\n❌ Certains fichiers sont manquants');
  process.exit(1);
}