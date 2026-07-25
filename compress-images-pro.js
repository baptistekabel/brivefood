#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 🎯 CONFIGURATION AVANCÉE
const CONFIG = {
  // Modes de compression
  MODES: {
    CONSERVATIVE: { jpeg: 90, png: 85, maxSize: 1200, strip: true },
    BALANCED: { jpeg: 80, png: 75, maxSize: 1000, strip: true },
    AGGRESSIVE: { jpeg: 70, png: 65, maxSize: 800, strip: true },
    ULTRA: { jpeg: 60, png: 55, maxSize: 600, strip: true }
  },

  // Dossiers d'images (dynamiquement détectés)
  IMAGE_DIRS: [],

  // Extensions supportées
  EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],

  // Options par défaut
  DEFAULT_MODE: 'BALANCED',
  BACKUP: true,
  PARALLEL: true,
  PREVIEW: false
};

// 🎨 Couleurs pour la console
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

console.log(colorize('🚀 BRIVEFOOD - COMPRESSEUR D\'IMAGES PRO', 'cyan'));
console.log(colorize('==========================================', 'cyan'));
console.log('');

// 📁 Découverte automatique des dossiers d'images
function discoverImageDirectories() {
  const assetsPath = path.join(process.cwd(), 'assets', 'images');
  const directories = [];

  if (!fs.existsSync(assetsPath)) {
    console.log(colorize('❌ Dossier assets/images introuvable', 'red'));
    return directories;
  }

  function scanDirectory(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      let hasImages = false;

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subPath = relativePath ? `${relativePath}/${item}` : item;
          scanDirectory(fullPath, subPath);
        } else if (CONFIG.EXTENSIONS.includes(path.extname(item).toLowerCase())) {
          hasImages = true;
        }
      }

      if (hasImages) {
        const dirPath = relativePath ? `assets/images/${relativePath}` : 'assets/images';
        directories.push(dirPath);
      }
    } catch (error) {
      console.log(colorize(`⚠️  Erreur lors du scan de ${dir}: ${error.message}`, 'yellow'));
    }
  }

  scanDirectory(assetsPath);
  return directories.sort();
}

// 🛠️ Vérification des outils disponibles
function checkCompressionTools() {
  const tools = [];

  // ImageMagick
  try {
    execSync('magick --version', { stdio: 'pipe' });
    tools.push({ name: 'ImageMagick (magick)', command: 'magick', priority: 1 });
  } catch {
    try {
      execSync('convert --version', { stdio: 'pipe' });
      tools.push({ name: 'ImageMagick (convert)', command: 'convert', priority: 2 });
    } catch {}
  }

  // SIPS (macOS)
  try {
    execSync('sips --version', { stdio: 'pipe' });
    tools.push({ name: 'SIPS (macOS)', command: 'sips', priority: 3 });
  } catch {}

  // FFmpeg pour WebP
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    tools.push({ name: 'FFmpeg', command: 'ffmpeg', priority: 4 });
  } catch {}

  return tools.sort((a, b) => a.priority - b.priority);
}

// 📊 Obtenir les informations d'une image
function getImageInfo(filePath, tool) {
  try {
    const stats = fs.statSync(filePath);
    const sizeKb = Math.round(stats.size / 1024);

    let dimensions = { width: 0, height: 0 };

    if (tool.command === 'sips') {
      const output = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: 'utf8' });
      const widthMatch = output.match(/pixelWidth: (\d+)/);
      const heightMatch = output.match(/pixelHeight: (\d+)/);
      dimensions.width = widthMatch ? parseInt(widthMatch[1]) : 0;
      dimensions.height = heightMatch ? parseInt(heightMatch[1]) : 0;
    } else if (tool.command === 'magick' || tool.command === 'convert') {
      const output = execSync(`${tool.command} identify -format "%wx%h" "${filePath}"`, { encoding: 'utf8' });
      const [width, height] = output.trim().split('x').map(Number);
      dimensions.width = width || 0;
      dimensions.height = height || 0;
    }

    return {
      size: sizeKb,
      dimensions: dimensions,
      megapixels: Math.round((dimensions.width * dimensions.height) / 1000000 * 10) / 10
    };
  } catch (error) {
    return { size: 0, dimensions: { width: 0, height: 0 }, megapixels: 0 };
  }
}

// 🗜️ Compresser une image avec options avancées
function compressImage(filePath, mode, tool, options = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const config = CONFIG.MODES[mode];
  const originalInfo = getImageInfo(filePath, tool);

  // Créer une sauvegarde si demandée
  const backupPath = filePath + '.backup';
  if (CONFIG.BACKUP && !fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  try {
    let command = '';
    const needsResize = originalInfo.dimensions.width > config.maxSize ||
                      originalInfo.dimensions.height > config.maxSize;

    if (tool.command === 'sips') {
      // Commandes SIPS (macOS)
      if (needsResize) {
        execSync(`sips --resampleHeightWidthMax ${config.maxSize} "${filePath}"`, { stdio: 'pipe' });
      }

      if (ext === '.png') {
        execSync(`sips -s formatOptions normal "${filePath}"`, { stdio: 'pipe' });
      } else {
        execSync(`sips -s formatOptions ${config.jpeg} "${filePath}"`, { stdio: 'pipe' });
      }

    } else if (tool.command === 'magick' || tool.command === 'convert') {
      // Commandes ImageMagick
      command = `${tool.command} "${filePath}"`;

      // Redimensionnement
      if (needsResize) {
        command += ` -resize ${config.maxSize}x${config.maxSize}>`;
      }

      // Compression selon le format
      if (ext === '.png') {
        command += ` -quality ${config.png}`;
        command += ` -define png:compression-filter=5`;
        command += ` -define png:compression-level=9`;
        command += ` -define png:compression-strategy=1`;
      } else if (ext === '.jpg' || ext === '.jpeg') {
        command += ` -quality ${config.jpeg}`;
        command += ` -sampling-factor 4:2:0`;
        command += ` -interlace JPEG`;
      } else if (ext === '.webp') {
        command += ` -quality ${config.jpeg}`;
      }

      // Options avancées
      if (config.strip) {
        command += ` -strip`;
      }

      // Optimisations supplémentaires
      if (options.optimize) {
        command += ` -enhance -sharpen 0x0.5`;
      }

      if (options.progressive && (ext === '.jpg' || ext === '.jpeg')) {
        command += ` -interlace Plane`;
      }

      command += ` "${filePath}"`;
      execSync(command, { stdio: 'pipe' });
    }

    const newInfo = getImageInfo(filePath, tool);
    const savings = originalInfo.size > 0 ?
      Math.round(((originalInfo.size - newInfo.size) / originalInfo.size) * 100) : 0;

    return {
      success: true,
      originalSize: originalInfo.size,
      newSize: newInfo.size,
      originalDimensions: originalInfo.dimensions,
      newDimensions: newInfo.dimensions,
      savings: Math.max(0, savings),
      resized: needsResize,
      megapixels: originalInfo.megapixels
    };

  } catch (error) {
    // Restaurer la sauvegarde en cas d'erreur
    if (CONFIG.BACKUP && fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, filePath);
      } catch {}
    }

    return {
      success: false,
      error: error.message,
      originalSize: originalInfo.size,
      newSize: originalInfo.size,
      savings: 0,
      resized: false
    };
  }
}

// 📁 Traiter un dossier complet
function processDirectory(dirPath, mode, tool, options = {}) {
  if (!fs.existsSync(dirPath)) {
    console.log(colorize(`⚠️  Dossier introuvable: ${dirPath}`, 'yellow'));
    return { processed: 0, errors: 0, totalOriginalSize: 0, totalNewSize: 0, resized: 0 };
  }

  const files = fs.readdirSync(dirPath)
    .filter(file => CONFIG.EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .filter(file => !file.endsWith('.backup'));

  if (files.length === 0) {
    console.log(colorize(`📁 ${dirPath}: Aucune image trouvée`, 'yellow'));
    return { processed: 0, errors: 0, totalOriginalSize: 0, totalNewSize: 0, resized: 0 };
  }

  console.log(colorize(`\n📁 ${dirPath}`, 'cyan'));
  console.log(colorize(`   ${files.length} images à traiter`, 'blue'));
  console.log('─'.repeat(90));

  let stats = {
    processed: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalNewSize: 0,
    resized: 0
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dirPath, file);
    const progress = `[${(i + 1).toString().padStart(3)}/${files.length}]`;

    if (CONFIG.PREVIEW) {
      const info = getImageInfo(filePath, tool);
      console.log(`${colorize(progress, 'blue')} ${file} (${info.size}Ko, ${info.dimensions.width}×${info.dimensions.height})`);
      continue;
    }

    const result = compressImage(filePath, mode, tool, options);

    stats.totalOriginalSize += result.originalSize;
    stats.totalNewSize += result.newSize;

    if (result.success) {
      stats.processed++;
      if (result.resized) stats.resized++;

      const status = result.savings > 0 ? colorize(`(-${result.savings}%)`, 'green') : colorize('(identique)', 'yellow');
      const resizeIcon = result.resized ? ' 📏' : '';
      const sizeInfo = result.originalDimensions.width > 0 ?
        ` [${result.originalDimensions.width}×${result.originalDimensions.height}]` : '';

      console.log(`${colorize(progress, 'blue')} ✅ ${file.padEnd(30)} ${result.originalSize}Ko → ${result.newSize}Ko ${status}${resizeIcon}${sizeInfo}`);
    } else {
      stats.errors++;
      console.log(`${colorize(progress, 'blue')} ❌ ${file.padEnd(30)} ${colorize('Erreur:', 'red')} ${result.error.substring(0, 40)}...`);
    }
  }

  if (!CONFIG.PREVIEW && stats.processed > 0) {
    const totalSavings = stats.totalOriginalSize > 0 ?
      Math.round(((stats.totalOriginalSize - stats.totalNewSize) / stats.totalOriginalSize) * 100) : 0;

    console.log(colorize(`\n📊 Résumé: ${stats.processed}/${files.length} traitées, ${stats.resized} redimensionnées, ${totalSavings}% d'économie`, 'cyan'));
  }

  return stats;
}

// 🎮 Interface utilisateur interactive
function askUserChoice(question, choices) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(colorize(question, 'cyan'));
    choices.forEach((choice, index) => {
      console.log(`  ${colorize((index + 1).toString(), 'yellow')}. ${choice}`);
    });

    rl.question(colorize('\nVotre choix (1-' + choices.length + '): ', 'cyan'), (answer) => {
      rl.close();
      const choice = parseInt(answer) - 1;
      if (choice >= 0 && choice < choices.length) {
        resolve(choice);
      } else {
        console.log(colorize('Choix invalide, utilisation de l\'option par défaut', 'yellow'));
        resolve(0);
      }
    });
  });
}

// 📋 Afficher un aperçu des images
function showPreview() {
  CONFIG.PREVIEW = true;
  console.log(colorize('\n📋 APERÇU DES IMAGES', 'magenta'));
  console.log(colorize('===================', 'magenta'));

  const tool = checkCompressionTools()[0];
  let totalImages = 0;
  let totalSize = 0;

  for (const dir of CONFIG.IMAGE_DIRS) {
    const result = processDirectory(dir, CONFIG.DEFAULT_MODE, tool);
    // Dans le mode aperçu, on calcule différemment
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file =>
        CONFIG.EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
        !file.endsWith('.backup')
      );

      for (const file of files) {
        const filePath = path.join(dir, file);
        const info = getImageInfo(filePath, tool);
        totalImages++;
        totalSize += info.size;
      }
    }
  }

  console.log(colorize(`\n📊 STATISTIQUES GLOBALES`, 'cyan'));
  console.log(`📁 Dossiers: ${CONFIG.IMAGE_DIRS.length}`);
  console.log(`🖼️  Images totales: ${totalImages}`);
  console.log(`💾 Taille totale: ${Math.round(totalSize / 1024)}MB`);
}

// 🚀 Fonction principale
async function main() {
  // Découvrir les dossiers d'images
  CONFIG.IMAGE_DIRS = discoverImageDirectories();

  if (CONFIG.IMAGE_DIRS.length === 0) {
    console.log(colorize('❌ Aucun dossier d\'images trouvé dans assets/images/', 'red'));
    process.exit(1);
  }

  console.log(colorize(`📁 ${CONFIG.IMAGE_DIRS.length} dossiers d'images détectés:`, 'green'));
  CONFIG.IMAGE_DIRS.forEach(dir => console.log(`   • ${dir}`));

  // Vérifier les outils disponibles
  const tools = checkCompressionTools();

  if (tools.length === 0) {
    console.log(colorize('\n❌ Aucun outil de compression trouvé!', 'red'));
    console.log(colorize('\n💡 Pour installer ImageMagick:', 'yellow'));
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    console.log('   Windows: https://imagemagick.org/script/download.php');
    process.exit(1);
  }

  console.log(colorize(`\n🛠️  Outil sélectionné: ${tools[0].name}`, 'green'));

  // Options du menu
  const mainOptions = [
    'Aperçu des images (sans modification)',
    'Compression CONSERVATIVE (qualité max)',
    'Compression ÉQUILIBRÉE (recommandée)',
    'Compression AGRESSIVE (espace max)',
    'Compression ULTRA (extrême)',
    'Options avancées'
  ];

  const choice = await askUserChoice('\n🎯 Que souhaitez-vous faire ?', mainOptions);

  switch (choice) {
    case 0:
      showPreview();
      break;

    case 1:
    case 2:
    case 3:
    case 4:
      const modes = ['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE', 'ULTRA'];
      const selectedMode = modes[choice - 1];
      await processAllImages(selectedMode, tools[0]);
      break;

    case 5:
      await advancedOptions(tools[0]);
      break;

    default:
      await processAllImages('BALANCED', tools[0]);
  }
}

// 🔧 Options avancées
async function advancedOptions(tool) {
  const advancedChoices = [
    'Compression personnalisée',
    'Nettoyer les fichiers .backup',
    'Convertir toutes les images en WebP',
    'Statistiques détaillées',
    'Retour au menu principal'
  ];

  const choice = await askUserChoice('\n⚙️  Options avancées', advancedChoices);

  switch (choice) {
    case 0:
      // Compression personnalisée - à implémenter
      console.log(colorize('🔧 Fonction en développement', 'yellow'));
      break;

    case 1:
      cleanBackups();
      break;

    case 2:
      // Conversion WebP - à implémenter
      console.log(colorize('🔧 Fonction en développement', 'yellow'));
      break;

    case 3:
      showDetailedStats(tool);
      break;

    case 4:
      await main();
      break;
  }
}

// 🗑️ Nettoyer les fichiers de sauvegarde
function cleanBackups() {
  console.log(colorize('\n🧹 Nettoyage des fichiers de sauvegarde...', 'cyan'));

  try {
    const result = execSync('find assets -name "*.backup" -type f', { encoding: 'utf8' });
    const backupFiles = result.trim().split('\n').filter(file => file);

    if (backupFiles.length === 0) {
      console.log(colorize('✅ Aucun fichier .backup trouvé', 'green'));
      return;
    }

    console.log(colorize(`🗑️  ${backupFiles.length} fichiers .backup trouvés`, 'yellow'));

    let totalSize = 0;
    for (const file of backupFiles) {
      try {
        const stats = fs.statSync(file);
        totalSize += stats.size;
        fs.unlinkSync(file);
      } catch (error) {
        console.log(colorize(`❌ Erreur suppression ${file}: ${error.message}`, 'red'));
      }
    }

    const sizeMB = Math.round(totalSize / (1024 * 1024));
    console.log(colorize(`✅ ${backupFiles.length} fichiers supprimés (${sizeMB}MB libérés)`, 'green'));

  } catch (error) {
    console.log(colorize(`❌ Erreur lors du nettoyage: ${error.message}`, 'red'));
  }
}

// 📊 Statistiques détaillées
function showDetailedStats(tool) {
  console.log(colorize('\n📊 STATISTIQUES DÉTAILLÉES', 'magenta'));
  console.log(colorize('==========================', 'magenta'));

  const stats = {
    totalImages: 0,
    totalSize: 0,
    formats: {},
    sizes: { small: 0, medium: 0, large: 0, huge: 0 },
    directories: {}
  };

  for (const dir of CONFIG.IMAGE_DIRS) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(file =>
      CONFIG.EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
      !file.endsWith('.backup')
    );

    stats.directories[dir] = files.length;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const info = getImageInfo(filePath, tool);
      const ext = path.extname(file).toLowerCase();

      stats.totalImages++;
      stats.totalSize += info.size;

      // Stats par format
      stats.formats[ext] = (stats.formats[ext] || 0) + 1;

      // Stats par taille
      if (info.size < 50) stats.sizes.small++;
      else if (info.size < 200) stats.sizes.medium++;
      else if (info.size < 500) stats.sizes.large++;
      else stats.sizes.huge++;
    }
  }

  console.log(`📁 Dossiers analysés: ${CONFIG.IMAGE_DIRS.length}`);
  console.log(`🖼️  Images totales: ${stats.totalImages}`);
  console.log(`💾 Taille totale: ${Math.round(stats.totalSize / 1024)}MB`);
  console.log(`📊 Taille moyenne: ${Math.round(stats.totalSize / stats.totalImages)}Ko`);

  console.log(colorize('\n📋 Répartition par format:', 'cyan'));
  Object.entries(stats.formats).forEach(([ext, count]) => {
    const percentage = Math.round((count / stats.totalImages) * 100);
    console.log(`   ${ext}: ${count} images (${percentage}%)`);
  });

  console.log(colorize('\n📏 Répartition par taille:', 'cyan'));
  console.log(`   Petites (<50Ko): ${stats.sizes.small}`);
  console.log(`   Moyennes (50-200Ko): ${stats.sizes.medium}`);
  console.log(`   Grandes (200-500Ko): ${stats.sizes.large}`);
  console.log(`   Très grandes (>500Ko): ${stats.sizes.huge}`);
}

// 🏃‍♂️ Traiter toutes les images
async function processAllImages(mode, tool, options = {}) {
  console.log(colorize(`\n🚀 LANCEMENT DE LA COMPRESSION`, 'magenta'));
  console.log(colorize(`Mode: ${mode}`, 'cyan'));
  console.log(colorize(`Paramètres: JPEG ${CONFIG.MODES[mode].jpeg}%, PNG ${CONFIG.MODES[mode].png}%, Max ${CONFIG.MODES[mode].maxSize}px`, 'blue'));
  console.log('');

  const startTime = Date.now();
  let grandTotal = {
    processed: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalNewSize: 0,
    resized: 0
  };

  // Traiter chaque dossier
  for (const dir of CONFIG.IMAGE_DIRS) {
    const result = processDirectory(dir, mode, tool, options);
    grandTotal.processed += result.processed;
    grandTotal.errors += result.errors;
    grandTotal.totalOriginalSize += result.totalOriginalSize;
    grandTotal.totalNewSize += result.totalNewSize;
    grandTotal.resized += result.resized;
  }

  // Résultats finaux
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  const totalSavings = grandTotal.totalOriginalSize > 0 ?
    Math.round(((grandTotal.totalOriginalSize - grandTotal.totalNewSize) / grandTotal.totalOriginalSize) * 100) : 0;
  const savedKb = grandTotal.totalOriginalSize - grandTotal.totalNewSize;
  const savedMb = Math.round(savedKb / 1024);

  console.log(colorize('\n🎉 COMPRESSION TERMINÉE !', 'green'));
  console.log(colorize('========================', 'green'));
  console.log(`⏱️  Durée: ${duration}s`);
  console.log(`📈 Images traitées: ${grandTotal.processed}`);
  console.log(`📏 Images redimensionnées: ${grandTotal.resized}`);
  console.log(`📊 Taille originale: ${Math.round(grandTotal.totalOriginalSize / 1024)}MB`);
  console.log(`📊 Nouvelle taille: ${Math.round(grandTotal.totalNewSize / 1024)}MB`);
  console.log(colorize(`💾 ESPACE LIBÉRÉ: ${savedMb}MB (${totalSavings}%)`, 'green'));
  console.log(`❌ Erreurs: ${grandTotal.errors}`);

  if (savedMb > 50) {
    console.log(colorize(`\n🏆 EXCELLENT ! Plus de ${savedMb}MB libérés !`, 'green'));
  } else if (savedMb > 20) {
    console.log(colorize(`\n👍 BIEN ! ${savedMb}MB libérés !`, 'green'));
  } else if (savedMb > 5) {
    console.log(colorize(`\n👌 Correct ! ${savedMb}MB libérés !`, 'yellow'));
  }

  if (CONFIG.BACKUP) {
    console.log(colorize('\n💡 Les fichiers originaux sont sauvegardés (.backup)', 'cyan'));
    console.log('   Testez votre app puis supprimez-les avec l\'option de nettoyage');
  }
}

// 🎯 Traitement des arguments de ligne de commande
function handleArguments() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(colorize(`
🚀 BRIVEFOOD - COMPRESSEUR D'IMAGES PRO

Usage: node compress-images-pro.js [options]

Options:
  --help, -h           Afficher cette aide
  --preview            Aperçu sans modification
  --mode=MODE          Mode de compression (conservative, balanced, aggressive, ultra)
  --no-backup          Ne pas créer de sauvegarde
  --clean-backups      Supprimer les fichiers .backup
  --stats              Afficher les statistiques détaillées

Modes de compression:
  conservative         Qualité maximale (JPEG 90%, PNG 85%)
  balanced            Équilibré (JPEG 80%, PNG 75%) [défaut]
  aggressive          Agressif (JPEG 70%, PNG 65%)
  ultra               Ultra (JPEG 60%, PNG 55%)

Exemples:
  node compress-images-pro.js --preview
  node compress-images-pro.js --mode=aggressive
  node compress-images-pro.js --clean-backups
    `, 'cyan'));
    process.exit(0);
  }

  if (args.includes('--clean-backups')) {
    cleanBackups();
    process.exit(0);
  }

  if (args.includes('--preview')) {
    CONFIG.PREVIEW = true;
  }

  if (args.includes('--no-backup')) {
    CONFIG.BACKUP = false;
  }

  const modeArg = args.find(arg => arg.startsWith('--mode='));
  if (modeArg) {
    const mode = modeArg.split('=')[1].toUpperCase();
    if (CONFIG.MODES[mode]) {
      CONFIG.DEFAULT_MODE = mode;
    }
  }

  if (args.includes('--stats')) {
    CONFIG.IMAGE_DIRS = discoverImageDirectories();
    const tools = checkCompressionTools();
    if (tools.length > 0) {
      showDetailedStats(tools[0]);
    }
    process.exit(0);
  }
}

// 🚀 Point d'entrée
handleArguments();

if (CONFIG.PREVIEW) {
  CONFIG.IMAGE_DIRS = discoverImageDirectories();
  showPreview();
} else {
  main().catch(error => {
    console.log(colorize(`❌ Erreur fatale: ${error.message}`, 'red'));
    process.exit(1);
  });
}

// 📝 Export pour utilisation en module
module.exports = {
  compress: compressImage,
  discover: discoverImageDirectories,
  CONFIG
};