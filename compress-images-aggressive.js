#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration AGRESSIVE pour maximum d'économie d'espace
const JPEG_QUALITY = 75; // Réduit de 85% à 75%
const PNG_QUALITY = 65;  // Réduit de 80% à 65%
const MAX_WIDTH = 800;   // Redimensionner les images trop larges
const MAX_HEIGHT = 800;  // Redimensionner les images trop hautes

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

console.log('🔥 COMPRESSION AGRESSIVE - BriveFood');
console.log('=====================================\n');

// Vérifier les outils disponibles
function checkTools() {
  const tools = [];
  try {
    execSync('sips --version', { stdio: 'pipe' });
    tools.push('sips');
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

// Obtenir les dimensions d'une image
function getImageDimensions(filePath, tool) {
  try {
    if (tool === 'sips') {
      const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: 'utf8' });
      const widthMatch = output.match(/pixelWidth: (\d+)/);
      const heightMatch = output.match(/pixelHeight: (\d+)/);

      return {
        width: widthMatch ? parseInt(widthMatch[1]) : 0,
        height: heightMatch ? parseInt(heightMatch[1]) : 0
      };
    } else if (tool === 'imagemagick') {
      const output = execSync(`identify -format "%wx%h" "${filePath}"`, { encoding: 'utf8' });
      const [width, height] = output.split('x').map(Number);
      return { width: width || 0, height: height || 0 };
    }
  } catch {
    return { width: 0, height: 0 };
  }
}

// Compression agressive avec redimensionnement
function compressImageAggressive(filePath, tool) {
  const originalSize = getFileSize(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Créer sauvegarde
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  try {
    const dimensions = getImageDimensions(filePath, tool);
    const needsResize = dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT;

    const quality = ext === '.png' ? PNG_QUALITY : JPEG_QUALITY;

    if (tool === 'sips') {
      // Redimensionner si nécessaire
      if (needsResize) {
        execSync(`sips --resampleHeightWidthMax ${MAX_WIDTH} "${filePath}"`, { stdio: 'pipe' });
      }

      // Compresser
      if (ext === '.png') {
        execSync(`sips -s formatOptions normal "${filePath}"`, { stdio: 'pipe' });
      } else {
        execSync(`sips -s formatOptions ${quality} "${filePath}"`, { stdio: 'pipe' });
      }

    } else if (tool === 'imagemagick') {
      let command = `convert "${filePath}"`;

      // Redimensionner si nécessaire
      if (needsResize) {
        command += ` -resize ${MAX_WIDTH}x${MAX_HEIGHT}>`;
      }

      // Compresser et optimiser
      command += ` -quality ${quality} -strip -interlace Plane`;

      // Pour PNG, ajouter des optimisations supplémentaires
      if (ext === '.png') {
        command += ` -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1`;
      }

      command += ` "${filePath}"`;

      execSync(command, { stdio: 'pipe' });
    }

    const newSize = getFileSize(filePath);
    const savings = originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;

    return {
      success: true,
      originalSize,
      newSize,
      savings: Math.max(0, savings),
      resized: needsResize,
      originalDimensions: dimensions
    };

  } catch (error) {
    // Restaurer la sauvegarde
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
    }

    return {
      success: false,
      error: error.message,
      originalSize,
      newSize: originalSize,
      savings: 0,
      resized: false
    };
  }
}

// Traiter un dossier
function processDirectory(dirPath, tool) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Dossier introuvable: ${dirPath}`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0, resized: 0 };
  }

  const files = fs.readdirSync(dirPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log(`📁 ${dirPath}: Aucune image trouvée`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0, resized: 0 };
  }

  console.log(`\n📁 ${dirPath} (${files.length} images)`);
  console.log('─'.repeat(80));

  let processed = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let errors = 0;
  let resized = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = compressImageAggressive(filePath, tool);

    totalOriginalSize += result.originalSize;
    totalNewSize += result.newSize;

    if (result.success) {
      processed++;
      if (result.resized) resized++;

      const status = result.savings > 0 ? `(-${result.savings}%)` : '(identique)';
      const resizeInfo = result.resized ? ' 📏' : '';
      const sizeInfo = result.originalDimensions.width > 0 ?
        ` [${result.originalDimensions.width}×${result.originalDimensions.height}]` : '';

      console.log(`✅ ${file.padEnd(35)} ${result.originalSize}Ko → ${result.newSize}Ko ${status}${resizeInfo}${sizeInfo}`);
    } else {
      errors++;
      console.log(`❌ ${file.padEnd(35)} Erreur: ${result.error.substring(0, 40)}...`);
    }
  }

  const totalSavings = totalOriginalSize > 0 ?
    Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100) : 0;

  console.log(`\n📊 Résumé: ${processed}/${files.length} compressées, ${resized} redimensionnées, ${totalSavings}% d'économie`);

  return { processed, totalOriginalSize, totalNewSize, errors, resized };
}

// Fonction principale
function main() {
  const availableTools = checkTools();

  if (availableTools.length === 0) {
    console.log('❌ Aucun outil de compression trouvé.');
    console.log('\n💡 Pour installer ImageMagick :');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    process.exit(1);
  }

  const tool = availableTools.includes('imagemagick') ? 'imagemagick' : 'sips';
  console.log(`🔧 Outil utilisé: ${tool}`);
  console.log(`🎯 Qualité AGRESSIVE: JPEG ${JPEG_QUALITY}%, PNG ${PNG_QUALITY}%`);
  console.log(`📏 Taille max: ${MAX_WIDTH}×${MAX_HEIGHT} pixels`);
  console.log('🔥 Mode: COMPRESSION MAXIMALE\n');

  let grandTotal = {
    processed: 0,
    originalSize: 0,
    newSize: 0,
    errors: 0,
    resized: 0
  };

  // Traiter tous les dossiers
  for (const dir of IMAGE_DIRS) {
    const result = processDirectory(dir, tool);
    grandTotal.processed += result.processed;
    grandTotal.originalSize += result.totalOriginalSize;
    grandTotal.newSize += result.totalNewSize;
    grandTotal.errors += result.errors;
    grandTotal.resized += result.resized;
  }

  // Résultats finaux
  const totalSavings = grandTotal.originalSize > 0 ?
    Math.round(((grandTotal.originalSize - grandTotal.newSize) / grandTotal.originalSize) * 100) : 0;

  const savedKb = grandTotal.originalSize - grandTotal.newSize;
  const savedMb = Math.round(savedKb / 1024);

  console.log('\n🔥 COMPRESSION AGRESSIVE TERMINÉE');
  console.log('==================================');
  console.log(`📈 Images traitées: ${grandTotal.processed}`);
  console.log(`📏 Images redimensionnées: ${grandTotal.resized}`);
  console.log(`📊 Taille originale: ${Math.round(grandTotal.originalSize / 1024)}MB`);
  console.log(`📊 Nouvelle taille: ${Math.round(grandTotal.newSize / 1024)}MB`);
  console.log(`💾 ESPACE LIBÉRÉ: ${savedMb}MB (${totalSavings}%)`);
  console.log(`❌ Erreurs: ${grandTotal.errors}`);

  if (savedMb > 50) {
    console.log(`\n🎉 EXCELLENT ! Plus de ${savedMb}MB d'espace libéré !`);
  } else if (savedMb > 20) {
    console.log(`\n👍 BIEN ! ${savedMb}MB d'espace libéré !`);
  }

  console.log('\n💡 Les fichiers originaux sont sauvegardés avec l\'extension .backup');
  console.log('   Testez l\'app puis supprimez-les: npm run clean-backups');
}

// Options
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
🔥 COMPRESSION AGRESSIVE - Libère un maximum d'espace

Usage: node compress-images-aggressive.js

Paramètres agressifs:
- Qualité JPEG: ${JPEG_QUALITY}% (vs 85% normal)
- Qualité PNG: ${PNG_QUALITY}% (vs 80% normal)
- Redimensionnement: max ${MAX_WIDTH}×${MAX_HEIGHT}px
- Optimisations avancées activées

⚠️  ATTENTION: Testez bien l'app après compression !
  `);
  process.exit(0);
}

main();