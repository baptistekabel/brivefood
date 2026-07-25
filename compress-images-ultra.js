#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration ULTRA-AGRESSIVE
const WEBP_QUALITY = 70;    // Qualité WebP pour maximum d'économie
const JPEG_QUALITY = 70;    // Qualité JPEG très réduite
const PNG_QUALITY = 60;     // Qualité PNG très réduite
const MAX_WIDTH = 600;      // Taille réduite pour mobile
const MAX_HEIGHT = 600;     // Taille réduite pour mobile
const CONVERT_TO_WEBP = true; // Convertir en WebP quand possible

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
  'assets/images/tacos'
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

console.log('💥 COMPRESSION ULTRA-AGRESSIVE - BriveFood');
console.log('===========================================\n');

// Vérifier les outils
function checkTools() {
  const tools = [];
  try {
    execSync('convert --version', { stdio: 'pipe' });
    tools.push('imagemagick');
  } catch {}
  return tools;
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

// Compression ULTRA avec conversion WebP
function compressImageUltra(filePath) {
  const originalSize = getFileSize(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  // Créer sauvegarde
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  try {
    let finalPath = filePath;
    let converted = false;

    // Décider si convertir en WebP
    if (CONVERT_TO_WEBP && (ext === '.jpg' || ext === '.jpeg' || ext === '.png')) {
      const webpPath = path.join(dirName, baseName + '.webp');

      // Convertir en WebP avec compression agressive
      let command = `convert "${filePath}" -resize ${MAX_WIDTH}x${MAX_HEIGHT}> -quality ${WEBP_QUALITY} -strip`;

      // Optimisations WebP spécifiques
      command += ` -define webp:lossless=false -define webp:method=6 -define webp:alpha-quality=80`;
      command += ` "${webpPath}"`;

      execSync(command, { stdio: 'pipe' });

      // Supprimer l'ancien fichier et renommer
      fs.unlinkSync(filePath);
      finalPath = webpPath;
      converted = true;

    } else {
      // Compression normale sans conversion
      const quality = ext === '.webp' ? WEBP_QUALITY : ext === '.png' ? PNG_QUALITY : JPEG_QUALITY;

      let command = `convert "${filePath}" -resize ${MAX_WIDTH}x${MAX_HEIGHT}> -quality ${quality} -strip`;

      if (ext === '.png') {
        command += ` -define png:compression-filter=5 -define png:compression-level=9`;
      }

      command += ` "${filePath}"`;
      execSync(command, { stdio: 'pipe' });
    }

    const newSize = getFileSize(finalPath);
    const savings = originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;

    return {
      success: true,
      originalSize,
      newSize,
      savings: Math.max(0, savings),
      converted,
      newPath: finalPath
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
      converted: false
    };
  }
}

// Traiter un dossier
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Dossier introuvable: ${dirPath}`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0, converted: 0 };
  }

  const files = fs.readdirSync(dirPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext) && !file.includes('.backup');
  });

  if (files.length === 0) {
    console.log(`📁 ${dirPath}: Aucune image trouvée`);
    return { processed: 0, totalOriginalSize: 0, totalNewSize: 0, errors: 0, converted: 0 };
  }

  console.log(`\n📁 ${dirPath} (${files.length} images)`);
  console.log('─'.repeat(90));

  let processed = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let errors = 0;
  let converted = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = compressImageUltra(filePath);

    totalOriginalSize += result.originalSize;
    totalNewSize += result.newSize;

    if (result.success) {
      processed++;
      if (result.converted) converted++;

      const status = result.savings > 0 ? `(-${result.savings}%)` : '(identique)';
      const convertInfo = result.converted ? ' 🔄→WebP' : '';
      const newFileName = result.newPath ? path.basename(result.newPath) : file;

      console.log(`✅ ${file.padEnd(35)} → ${newFileName.padEnd(35)} ${result.originalSize}Ko → ${result.newSize}Ko ${status}${convertInfo}`);
    } else {
      errors++;
      console.log(`❌ ${file.padEnd(35)} Erreur: ${result.error.substring(0, 40)}...`);
    }
  }

  const totalSavings = totalOriginalSize > 0 ?
    Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100) : 0;

  console.log(`\n📊 Résumé: ${processed}/${files.length} compressées, ${converted} converties en WebP, ${totalSavings}% d'économie`);

  return { processed, totalOriginalSize, totalNewSize, errors, converted };
}

// Mettre à jour les références dans le code
function updateCodeReferences() {
  console.log('\n🔄 Mise à jour des références dans le code...');

  const codeFiles = [
    'app/category/[id].tsx',
    'app/(tabs)/menu.tsx'
  ];

  let updatedFiles = 0;

  for (const file of codeFiles) {
    if (fs.existsSync(file)) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let hasChanges = false;

        // Remplacer les extensions .jpg, .jpeg, .png par .webp
        const regex = /require\(['"`]([^'"`]+)\.(jpg|jpeg|png)['"`]\)/g;
        content = content.replace(regex, (match, path, ext) => {
          hasChanges = true;
          return `require('${path}.webp')`;
        });

        if (hasChanges) {
          fs.writeFileSync(file, content);
          updatedFiles++;
          console.log(`✅ Mis à jour: ${file}`);
        }
      } catch (error) {
        console.log(`❌ Erreur mise à jour ${file}: ${error.message}`);
      }
    }
  }

  console.log(`📝 ${updatedFiles} fichiers de code mis à jour`);
}

// Fonction principale
function main() {
  const availableTools = checkTools();

  if (!availableTools.includes('imagemagick')) {
    console.log('❌ ImageMagick requis pour la compression ultra-agressive');
    console.log('💡 Installation: brew install imagemagick');
    process.exit(1);
  }

  console.log(`🔧 Outil: ImageMagick avec optimisations WebP`);
  console.log(`🎯 Qualité ULTRA: WebP ${WEBP_QUALITY}%, JPEG ${JPEG_QUALITY}%, PNG ${PNG_QUALITY}%`);
  console.log(`📏 Taille max: ${MAX_WIDTH}×${MAX_HEIGHT} pixels`);
  console.log('💥 Mode: COMPRESSION MAXIMALE + WebP\n');

  console.log('⚠️  ATTENTION: Cette compression est très agressive !');
  console.log('   Testez soigneusement l\'app après compression.\n');

  let grandTotal = {
    processed: 0,
    originalSize: 0,
    newSize: 0,
    errors: 0,
    converted: 0
  };

  // Traiter tous les dossiers
  for (const dir of IMAGE_DIRS) {
    const result = processDirectory(dir);
    grandTotal.processed += result.processed;
    grandTotal.originalSize += result.totalOriginalSize;
    grandTotal.newSize += result.totalNewSize;
    grandTotal.errors += result.errors;
    grandTotal.converted += result.converted;
  }

  // Mettre à jour les références dans le code
  if (grandTotal.converted > 0) {
    updateCodeReferences();
  }

  // Résultats finaux
  const totalSavings = grandTotal.originalSize > 0 ?
    Math.round(((grandTotal.originalSize - grandTotal.newSize) / grandTotal.originalSize) * 100) : 0;

  const savedKb = grandTotal.originalSize - grandTotal.newSize;
  const savedMb = Math.round(savedKb / 1024);

  console.log('\n💥 COMPRESSION ULTRA-AGRESSIVE TERMINÉE');
  console.log('========================================');
  console.log(`📈 Images traitées: ${grandTotal.processed}`);
  console.log(`🔄 Converties en WebP: ${grandTotal.converted}`);
  console.log(`📊 Taille originale: ${Math.round(grandTotal.originalSize / 1024)}MB`);
  console.log(`📊 Nouvelle taille: ${Math.round(grandTotal.newSize / 1024)}MB`);
  console.log(`💾 ESPACE LIBÉRÉ: ${savedMb}MB (${totalSavings}%)`);
  console.log(`❌ Erreurs: ${grandTotal.errors}`);

  if (savedMb > 100) {
    console.log(`\n🚀 INCROYABLE ! Plus de ${savedMb}MB libérés !`);
  } else if (savedMb > 50) {
    console.log(`\n🎉 EXCELLENT ! ${savedMb}MB libérés !`);
  }

  console.log('\n⚠️  IMPORTANT: Testez l\'application minutieusement !');
  console.log('   Les images sont maintenant en WebP avec qualité réduite.');
  console.log('   Sauvegardes: npm run clean-backups (après tests)');
}

if (process.argv[2] === '--help') {
  console.log(`
💥 COMPRESSION ULTRA-AGRESSIVE

Cette compression est la plus agressive possible:
- Conversion automatique en WebP (format le plus efficient)
- Qualité très réduite: ${WEBP_QUALITY}%
- Redimensionnement: ${MAX_WIDTH}×${MAX_HEIGHT}px max
- Mise à jour automatique du code

⚠️  ATTENTION: Peut affecter la qualité visuelle !
   Testez soigneusement avant de supprimer les sauvegardes.
  `);
  process.exit(0);
}

main();