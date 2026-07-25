#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🍎 COMPRESSION SIPS - BriveFood');
console.log('================================\n');

// Configuration
const JPEG_QUALITY = 80;
const PNG_MAX_SIZE = 800;
const JPEG_MAX_SIZE = 1000;

// Découverte automatique des dossiers
function findImageDirectories() {
  const assetsPath = 'assets/images';
  const directories = [assetsPath];

  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          directories.push(fullPath);
          scanDir(fullPath);
        }
      }
    } catch (e) {}
  }

  scanDir(assetsPath);
  return directories;
}

function getFileSize(filePath) {
  try {
    return Math.round(fs.statSync(filePath).size / 1024);
  } catch {
    return 0;
  }
}

function compressWithSips(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = getFileSize(filePath);

  try {
    if (ext === '.png') {
      // PNG: Redimensionner et optimiser
      execSync(`sips --resampleHeightWidthMax ${PNG_MAX_SIZE} "${filePath}"`, { stdio: 'pipe' });
      execSync(`sips --setProperty formatOptions normal "${filePath}"`, { stdio: 'pipe' });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // JPEG: Redimensionner et compresser
      execSync(`sips --resampleHeightWidthMax ${JPEG_MAX_SIZE} "${filePath}"`, { stdio: 'pipe' });
      execSync(`sips --setProperty formatOptions ${JPEG_QUALITY} "${filePath}"`, { stdio: 'pipe' });
    }

    const newSize = getFileSize(filePath);
    const savings = originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;

    return { success: true, originalSize, newSize, savings };
  } catch (error) {
    return { success: false, originalSize, newSize: originalSize, error: error.message };
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return { processed: 0, errors: 0, totalSavings: 0 };

  const files = fs.readdirSync(dirPath)
    .filter(file => ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase()))
    .filter(file => !file.endsWith('.backup'));

  if (files.length === 0) {
    console.log(`📁 ${dirPath}: Aucune image`);
    return { processed: 0, errors: 0, totalSavings: 0 };
  }

  console.log(`\n📁 ${dirPath} (${files.length} images)`);
  console.log('─'.repeat(70));

  let stats = { processed: 0, errors: 0, totalOriginal: 0, totalNew: 0 };

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    // Créer sauvegarde
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    const result = compressWithSips(filePath);
    stats.totalOriginal += result.originalSize;
    stats.totalNew += result.newSize;

    if (result.success) {
      stats.processed++;
      const savings = result.savings > 0 ? `(-${result.savings}%)` : '(identique)';
      const color = result.savings > 30 ? '🔥' : result.savings > 10 ? '✅' : '📦';
      console.log(`${color} ${file.padEnd(35)} ${result.originalSize}Ko → ${result.newSize}Ko ${savings}`);
    } else {
      stats.errors++;
      console.log(`❌ ${file.padEnd(35)} Erreur`);
    }
  }

  const totalSavings = stats.totalOriginal > 0 ?
    Math.round(((stats.totalOriginal - stats.totalNew) / stats.totalOriginal) * 100) : 0;

  console.log(`📊 ${stats.processed}/${files.length} compressées, ${totalSavings}% d'économie totale`);

  return {
    processed: stats.processed,
    errors: stats.errors,
    totalSavings: stats.totalOriginal - stats.totalNew
  };
}

// Fonction principale
function main() {
  console.log('🔍 Découverte des dossiers d\'images...');
  const directories = findImageDirectories();
  console.log(`📁 ${directories.length} dossiers trouvés`);

  console.log(`\n🎯 Configuration:`);
  console.log(`   • JPEG: Qualité ${JPEG_QUALITY}%, Max ${JPEG_MAX_SIZE}px`);
  console.log(`   • PNG: Max ${PNG_MAX_SIZE}px`);
  console.log(`   • Outil: SIPS (natif macOS)`);

  const startTime = Date.now();
  let grandTotal = { processed: 0, errors: 0, totalSavings: 0 };

  for (const dir of directories) {
    const result = processDirectory(dir);
    grandTotal.processed += result.processed;
    grandTotal.errors += result.errors;
    grandTotal.totalSavings += result.totalSavings;
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const savedMb = Math.round(grandTotal.totalSavings / 1024);

  console.log('\n🎉 COMPRESSION TERMINÉE !');
  console.log('========================');
  console.log(`⏱️  Durée: ${duration}s`);
  console.log(`📈 Images traitées: ${grandTotal.processed}`);
  console.log(`💾 Espace libéré: ${savedMb}MB`);
  console.log(`❌ Erreurs: ${grandTotal.errors}`);

  if (savedMb > 20) {
    console.log(`\n🏆 FANTASTIQUE ! ${savedMb}MB libérés !`);
  } else if (savedMb > 10) {
    console.log(`\n🎉 EXCELLENT ! ${savedMb}MB libérés !`);
  } else if (savedMb > 5) {
    console.log(`\n👍 BIEN ! ${savedMb}MB libérés !`);
  }

  console.log('\n💡 Sauvegardes créées avec extension .backup');
  console.log('   Pour nettoyer: find assets -name "*.backup" -delete');
}

// Options en ligne de commande
if (process.argv.includes('--help')) {
  console.log(`
🍎 COMPRESSION SIPS - Mode d'emploi

Usage: node compress-with-sips.js

Configuration:
• JPEG: Qualité ${JPEG_QUALITY}%, taille max ${JPEG_MAX_SIZE}px
• PNG: Taille max ${PNG_MAX_SIZE}px
• Crée des sauvegardes .backup automatiquement
• Fonctionne uniquement sur macOS (SIPS natif)

Exemple: node compress-with-sips.js
  `);
  process.exit(0);
}

// Vérifier que SIPS est disponible
try {
  execSync('sips --version', { stdio: 'pipe' });
} catch {
  console.log('❌ SIPS non disponible (macOS requis)');
  console.log('💡 Utilisez ImageMagick à la place: brew install imagemagick');
  process.exit(1);
}

main();