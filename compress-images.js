#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const QUALITY = 85; // Qualité JPEG (1-100)
const PNG_QUALITY = '65-80'; // Qualité PNG (0-100)
const WEBP_QUALITY = 80; // Qualité WebP (0-100)

// Dossiers d'images à traiter
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

// Extensions d'images supportées
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

console.log('🖼️  Script de compression d\'images BriveFood');
console.log('===============================================\n');

// Vérifier si ImageMagick est installé
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    try {
      execSync('convert --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Installer ImageMagick si nécessaire
function installImageMagick() {
  console.log('📦 Installation d\'ImageMagick...');
  try {
    // Pour macOS avec Homebrew
    execSync('brew install imagemagick', { stdio: 'inherit' });
    console.log('✅ ImageMagick installé avec succès');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de l\'installation d\'ImageMagick');
    console.log('💡 Veuillez installer ImageMagick manuellement :');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    console.log('   Windows: https://imagemagick.org/script/download.php');
    return false;
  }
}

// Obtenir la taille d'un fichier en Ko
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

// Compresser une image
function compressImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const originalSize = getFileSize(inputPath);

  try {
    let command;
    const magickCmd = checkImageMagick() ? (fs.existsSync('/usr/local/bin/magick') ? 'magick' : 'convert') : 'convert';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        command = `${magickCmd} "${inputPath}" -quality ${QUALITY} -strip "${outputPath}"`;
        break;
      case '.png':
        command = `${magickCmd} "${inputPath}" -quality ${PNG_QUALITY} -strip "${outputPath}"`;
        break;
      case '.webp':
        command = `${magickCmd} "${inputPath}" -quality ${WEBP_QUALITY} -strip "${outputPath}"`;
        break;
      default:
        return { success: false, error: 'Format non supporté' };
    }

    execSync(command, { stdio: 'pipe' });

    const newSize = getFileSize(outputPath);
    const savings = Math.round(((originalSize - newSize) / originalSize) * 100);

    return {
      success: true,
      originalSize,
      newSize,
      savings: savings > 0 ? savings : 0
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Traiter tous les fichiers d'un dossier
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Dossier non trouvé: ${dirPath}`);
    return { processed: 0, totalSavings: 0, errors: 0 };
  }

  const files = fs.readdirSync(dirPath);
  let processed = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let errors = 0;

  console.log(`\n📁 Traitement du dossier: ${dirPath}`);
  console.log('─'.repeat(50));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      // Créer une sauvegarde
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }

      const result = compressImage(filePath, filePath);

      if (result.success) {
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        processed++;

        console.log(`✅ ${file}: ${result.originalSize}Ko → ${result.newSize}Ko (-${result.savings}%)`);
      } else {
        errors++;
        console.log(`❌ ${file}: ${result.error}`);

        // Restaurer depuis la sauvegarde en cas d'erreur
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, filePath);
        }
      }
    }
  }

  const totalSavings = totalOriginalSize > 0 ? Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100) : 0;

  if (processed > 0) {
    console.log(`\n📊 Résultats pour ${dirPath}:`);
    console.log(`   Fichiers traités: ${processed}`);
    console.log(`   Taille originale: ${totalOriginalSize}Ko`);
    console.log(`   Nouvelle taille: ${totalNewSize}Ko`);
    console.log(`   Économie totale: ${totalSavings}%`);
  }

  return { processed, totalSavings: totalOriginalSize - totalNewSize, errors };
}

// Fonction principale
function main() {
  // Vérifier si ImageMagick est disponible
  if (!checkImageMagick()) {
    console.log('❌ ImageMagick n\'est pas installé');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Voulez-vous installer ImageMagick automatiquement ? (y/N): ', (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        if (!installImageMagick()) {
          process.exit(1);
        }
        processAllDirectories();
      } else {
        console.log('Veuillez installer ImageMagick et relancer le script');
        process.exit(1);
      }
    });

    return;
  }

  processAllDirectories();
}

function processAllDirectories() {
  let totalProcessed = 0;
  let totalSavings = 0;
  let totalErrors = 0;

  console.log(`🎯 Qualité de compression configurée:`);
  console.log(`   JPEG: ${QUALITY}%`);
  console.log(`   PNG: ${PNG_QUALITY}%`);
  console.log(`   WebP: ${WEBP_QUALITY}%\n`);

  // Traiter chaque dossier
  for (const dir of IMAGE_DIRS) {
    const result = processDirectory(dir);
    totalProcessed += result.processed;
    totalSavings += result.totalSavings;
    totalErrors += result.errors;
  }

  // Résultats finaux
  console.log('\n🎉 COMPRESSION TERMINÉE !');
  console.log('========================');
  console.log(`📈 Total fichiers traités: ${totalProcessed}`);
  console.log(`💾 Espace économisé: ${Math.round(totalSavings)}Ko`);
  console.log(`❌ Erreurs: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log('\n💡 Conseil: Les fichiers de sauvegarde (.backup) ont été créés.');
    console.log('   Vous pouvez les supprimer si tout fonctionne correctement.');
    console.log('   Commande: find assets -name "*.backup" -delete');
  }
}

// Ajouter une option pour nettoyer les sauvegardes
if (process.argv[2] === '--clean-backups') {
  console.log('🧹 Suppression des fichiers de sauvegarde...');
  try {
    execSync('find assets -name "*.backup" -delete', { stdio: 'inherit' });
    console.log('✅ Fichiers de sauvegarde supprimés');
  } catch (error) {
    console.log('❌ Erreur lors de la suppression des sauvegardes');
  }
  process.exit(0);
}

// Ajouter une option d'aide
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
Usage: node compress-images.js [options]

Options:
  --clean-backups    Supprimer tous les fichiers .backup
  --help, -h         Afficher cette aide

Le script compresse automatiquement toutes les images dans les dossiers:
${IMAGE_DIRS.map(dir => `  - ${dir}`).join('\n')}

Formats supportés: ${IMAGE_EXTENSIONS.join(', ')}
  `);
  process.exit(0);
}

// Lancer le script
main();