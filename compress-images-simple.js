#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const JPEG_QUALITY = 85;
const PNG_QUALITY = 80;

// Dossiers d'images
const IMAGE_DIRS = [
  'assets/images/pizzas',
  'assets/images/burgers',
  'assets/images/pates',
  'assets/images/salades',
  'assets/images/desserts',
  'assets/images/tex-mex',
  'assets/images/petitesFaims',
  'assets/images/petiteFaimBruschetta',
  'assets/images/frites',
  'assets/images/boissons',
  'assets/images/lasagnes',
  'assets/images/tacos',
  'assets/images'
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

console.log('🖼️  Compression d\'images BriveFood');
console.log('===================================\n');

// Vérifier la disponibilité des outils
function checkTools() {
  const tools = [];

  try {
    execSync('sips --version', { stdio: 'pipe' });
    tools.push('sips'); // macOS natif
  } catch {}

  try {
    execSync('convert --version', { stdio: 'pipe' });
    tools.push('imagemagick');
  } catch {}

  return tools;
}

// Obtenir la taille d'un fichier
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

// Compresser avec sips (macOS)
function compressWithSips(inputPath, quality) {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.png') {
    // Pour PNG, on ne peut pas ajuster la qualité avec sips facilement
    return execSync(`sips -s formatOptions normal "${inputPath}"`, { stdio: 'pipe' });
  } else {
    return execSync(`sips -s formatOptions ${quality} "${inputPath}"`, { stdio: 'pipe' });
  }
}

// Compresser avec ImageMagick
function compressWithImageMagick(inputPath, quality) {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.png') {
    return execSync(`convert "${inputPath}" -quality ${quality} -strip "${inputPath}"`, { stdio: 'pipe' });
  } else {
    return execSync(`convert "${inputPath}" -quality ${quality} -strip "${inputPath}"`, { stdio: 'pipe' });
  }
}

// Compresser une image
function compressImage(filePath, tool) {
  const originalSize = getFileSize(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Créer une sauvegarde
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  try {
    const quality = ext === '.png' ? PNG_QUALITY : JPEG_QUALITY;

    if (tool === 'sips') {
      compressWithSips(filePath, quality);
    } else if (tool === 'imagemagick') {
      compressWithImageMagick(filePath, quality);
    }

    const newSize = getFileSize(filePath);
    const savings = originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;

    return {
      success: true,
      originalSize,
      newSize,
      savings: Math.max(0, savings)
    };
  } catch (error) {
    // Restaurer la sauvegarde en cas d'erreur
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
    }

    return {
      success: false,
      error: error.message,
      originalSize,
      newSize: originalSize,
      savings: 0
    };
  }
}

// Traiter un dossier
function processDirectory(dirPath, tool) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Dossier introuvable: ${dirPath}`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0 };
  }

  const files = fs.readdirSync(dirPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log(`📁 ${dirPath}: Aucune image trouvée`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0 };
  }

  console.log(`\n📁 ${dirPath} (${files.length} images)`);
  console.log('─'.repeat(60));

  let processed = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = compressImage(filePath, tool);

    totalOriginalSize += result.originalSize;
    totalNewSize += result.newSize;

    if (result.success) {
      processed++;
      const status = result.savings > 0 ? `(-${result.savings}%)` : '(identique)';
      console.log(`✅ ${file.padEnd(30)} ${result.originalSize}Ko → ${result.newSize}Ko ${status}`);
    } else {
      errors++;
      console.log(`❌ ${file.padEnd(30)} Erreur: ${result.error.substring(0, 30)}...`);
    }
  }

  const totalSavings = totalOriginalSize > 0 ?
    Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100) : 0;

  console.log(`\n📊 Résumé: ${processed}/${files.length} compressées, ${totalSavings}% d'économie`);

  return { processed, totalOriginalSize, totalNewSize, errors };
}

// Fonction principale
function main() {
  const availableTools = checkTools();

  if (availableTools.length === 0) {
    console.log('❌ Aucun outil de compression trouvé.');
    console.log('\n💡 Pour installer les outils nécessaires :');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    console.log('   Windows: https://imagemagick.org/script/download.php');
    process.exit(1);
  }

  const tool = availableTools.includes('imagemagick') ? 'imagemagick' : 'sips';
  console.log(`🔧 Outil utilisé: ${tool}`);
  console.log(`🎯 Qualité: JPEG ${JPEG_QUALITY}%, PNG ${PNG_QUALITY}%\n`);

  let grandTotal = {
    processed: 0,
    originalSize: 0,
    newSize: 0,
    errors: 0
  };

  // Traiter tous les dossiers
  for (const dir of IMAGE_DIRS) {
    const result = processDirectory(dir, tool);
    grandTotal.processed += result.processed;
    grandTotal.originalSize += result.totalOriginalSize;
    grandTotal.newSize += result.totalNewSize;
    grandTotal.errors += result.errors;
  }

  // Résultats finaux
  const totalSavings = grandTotal.originalSize > 0 ?
    Math.round(((grandTotal.originalSize - grandTotal.newSize) / grandTotal.originalSize) * 100) : 0;

  const savedKb = grandTotal.originalSize - grandTotal.newSize;

  console.log('\n🎉 COMPRESSION TERMINÉE');
  console.log('======================');
  console.log(`📈 Images traitées: ${grandTotal.processed}`);
  console.log(`📏 Taille originale: ${grandTotal.originalSize}Ko`);
  console.log(`📏 Nouvelle taille: ${grandTotal.newSize}Ko`);
  console.log(`💾 Espace économisé: ${savedKb}Ko (${totalSavings}%)`);
  console.log(`❌ Erreurs: ${grandTotal.errors}`);

  if (grandTotal.processed > 0) {
    console.log('\n💡 Les fichiers originaux sont sauvegardés avec l\'extension .backup');
    console.log('   Pour les supprimer: node compress-images-simple.js --clean');
  }
}

// Option pour nettoyer les sauvegardes
if (process.argv[2] === '--clean') {
  console.log('🧹 Suppression des sauvegardes...');

  let cleaned = 0;
  for (const dir of IMAGE_DIRS) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.backup')) {
          fs.unlinkSync(path.join(dir, file));
          cleaned++;
        }
      }
    }
  }

  console.log(`✅ ${cleaned} fichiers de sauvegarde supprimés`);
  process.exit(0);
}

// Aide
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
Usage: node compress-images-simple.js [option]

Options:
  --clean    Supprimer tous les fichiers .backup
  --help     Afficher cette aide

Le script compresse automatiquement les images JPEG et PNG
dans tous les dossiers d'assets/images/.
`);
  process.exit(0);
}

main();