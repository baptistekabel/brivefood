#!/usr/bin/env node

/**
 * 🚀 BRIVEFOOD - COMPRESSION & UPLOAD FIREBASE STORAGE
 *
 * Ce script :
 * 1. Compresse toutes les images du projet
 * 2. Les upload sur Firebase Storage
 * 3. Génère un fichier de mapping avec les URLs publiques
 *
 * Usage: node upload-images-to-firebase.js [options]
 * Options:
 *   --compress-only    Uniquement compresser sans upload
 *   --upload-only      Uniquement uploader (sans compression)
 *   --preview          Aperçu des fichiers sans action
 *   --quality=XX       Qualité JPEG (60-95, défaut: 75)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration Firebase Admin (pour l'upload côté serveur)
const admin = require('firebase-admin');

// 🎨 Couleurs console
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

// 📋 Configuration
const CONFIG = {
  ASSETS_DIR: path.join(process.cwd(), 'assets', 'images'),
  OUTPUT_MAPPING: path.join(process.cwd(), 'src', 'data', 'firebaseImageUrls.js'),
  COMPRESSED_DIR: path.join(process.cwd(), 'assets', 'images-compressed'),
  EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  QUALITY: {
    jpeg: 75,
    png: 80,
    maxSize: 800 // pixels max
  },
  FIREBASE: {
    storageBucket: 'brivefood-49d20.firebasestorage.app',
    uploadPath: 'product-images' // dossier dans Firebase Storage
  }
};

// 🔧 Parse arguments
const args = process.argv.slice(2);
const PREVIEW_MODE = args.includes('--preview');
const COMPRESS_ONLY = args.includes('--compress-only');
const UPLOAD_ONLY = args.includes('--upload-only');

const qualityArg = args.find(a => a.startsWith('--quality='));
if (qualityArg) {
  CONFIG.QUALITY.jpeg = parseInt(qualityArg.split('=')[1]) || 75;
}

console.log(colorize('\n🚀 BRIVEFOOD - IMAGE UPLOADER TO FIREBASE', 'cyan'));
console.log(colorize('==========================================\n', 'cyan'));

// 📁 Découvrir toutes les images
function discoverImages() {
  const images = [];

  function scanDir(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = relativePath ? `${relativePath}/${item}` : item;
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath, relPath);
      } else if (CONFIG.EXTENSIONS.includes(path.extname(item).toLowerCase())) {
        if (!item.endsWith('.backup')) {
          images.push({
            fullPath,
            relativePath: relPath,
            fileName: item,
            size: stat.size
          });
        }
      }
    }
  }

  scanDir(CONFIG.ASSETS_DIR);
  return images;
}

// 🗜️ Compresser une image avec sips (macOS) ou ImageMagick
function compressImage(imagePath, outputPath) {
  const ext = path.extname(imagePath).toLowerCase();

  // Créer le dossier de sortie si nécessaire
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copier d'abord le fichier
  fs.copyFileSync(imagePath, outputPath);

  try {
    // Vérifier si sips est disponible (macOS)
    try {
      execSync('sips --version', { stdio: 'pipe' });

      // Redimensionner si nécessaire
      execSync(`sips --resampleHeightWidthMax ${CONFIG.QUALITY.maxSize} "${outputPath}"`, { stdio: 'pipe' });

      // Compresser
      if (ext === '.jpg' || ext === '.jpeg') {
        execSync(`sips -s formatOptions ${CONFIG.QUALITY.jpeg} "${outputPath}"`, { stdio: 'pipe' });
      }

      return true;
    } catch {
      // Essayer ImageMagick
      try {
        execSync('magick --version', { stdio: 'pipe' });

        let cmd = `magick "${imagePath}" -resize ${CONFIG.QUALITY.maxSize}x${CONFIG.QUALITY.maxSize}>`;

        if (ext === '.jpg' || ext === '.jpeg') {
          cmd += ` -quality ${CONFIG.QUALITY.jpeg} -strip -interlace JPEG`;
        } else if (ext === '.png') {
          cmd += ` -quality ${CONFIG.QUALITY.png} -strip`;
        }

        cmd += ` "${outputPath}"`;
        execSync(cmd, { stdio: 'pipe' });

        return true;
      } catch {
        // Aucun outil disponible, garder l'original
        console.log(colorize('⚠️  Aucun outil de compression trouvé (sips ou ImageMagick)', 'yellow'));
        return false;
      }
    }
  } catch (error) {
    console.log(colorize(`❌ Erreur compression: ${error.message}`, 'red'));
    return false;
  }
}

// 🔥 Initialiser Firebase Admin
function initFirebase() {
  // Chercher le fichier de credentials
  const credentialsPath = path.join(process.cwd(), 'firebase-service-account.json');

  if (!fs.existsSync(credentialsPath)) {
    console.log(colorize('\n⚠️  Fichier firebase-service-account.json non trouvé!', 'yellow'));
    console.log(colorize('\n📋 Pour créer ce fichier:', 'cyan'));
    console.log('1. Aller sur https://console.firebase.google.com');
    console.log('2. Projet BriveFood → Paramètres → Comptes de service');
    console.log('3. Cliquer "Générer une nouvelle clé privée"');
    console.log('4. Renommer le fichier en "firebase-service-account.json"');
    console.log('5. Le placer à la racine du projet\n');
    return null;
  }

  try {
    const serviceAccount = require(credentialsPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: CONFIG.FIREBASE.storageBucket
    });

    return admin.storage().bucket();
  } catch (error) {
    console.log(colorize(`❌ Erreur init Firebase: ${error.message}`, 'red'));
    return null;
  }
}

// ☁️ Upload une image vers Firebase Storage
async function uploadToFirebase(bucket, localPath, remotePath) {
  try {
    const destination = `${CONFIG.FIREBASE.uploadPath}/${remotePath}`;

    await bucket.upload(localPath, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000', // 1 an de cache
        contentType: getContentType(localPath)
      }
    });

    // Rendre le fichier public et obtenir l'URL
    const file = bucket.file(destination);
    await file.makePublic();

    // Construire l'URL publique
    const publicUrl = `https://storage.googleapis.com/${CONFIG.FIREBASE.storageBucket}/${destination}`;

    return publicUrl;
  } catch (error) {
    console.log(colorize(`❌ Upload failed: ${error.message}`, 'red'));
    return null;
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return types[ext] || 'image/jpeg';
}

// 📝 Générer le fichier de mapping
function generateMappingFile(urlMapping) {
  const content = `// 🔥 URLs des images Firebase Storage
// Généré automatiquement le ${new Date().toLocaleString('fr-FR')}
// NE PAS MODIFIER MANUELLEMENT

const firebaseImageUrls = ${JSON.stringify(urlMapping, null, 2)};

export default firebaseImageUrls;
`;

  fs.writeFileSync(CONFIG.OUTPUT_MAPPING, content);
  console.log(colorize(`\n✅ Fichier de mapping généré: ${CONFIG.OUTPUT_MAPPING}`, 'green'));
}

// 🔑 Générer une clé à partir du chemin
function generateKey(relativePath) {
  // Convertir "burgers/baconBBurger.png" en "burgers_baconBBurger"
  return relativePath
    .replace(/\\/g, '/')
    .replace(/\.[^/.]+$/, '') // Enlever extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Remplacer caractères spéciaux
    .replace(/_+/g, '_') // Éviter doubles underscores
    .replace(/^_|_$/g, ''); // Enlever underscores début/fin
}

// 🚀 Fonction principale
async function main() {
  console.log(colorize('📁 Recherche des images...', 'blue'));
  const images = discoverImages();

  if (images.length === 0) {
    console.log(colorize('❌ Aucune image trouvée dans assets/images/', 'red'));
    return;
  }

  const totalSizeOriginal = images.reduce((sum, img) => sum + img.size, 0);
  console.log(colorize(`\n📊 ${images.length} images trouvées`, 'green'));
  console.log(colorize(`💾 Taille totale: ${Math.round(totalSizeOriginal / 1024 / 1024)}MB`, 'blue'));

  if (PREVIEW_MODE) {
    console.log(colorize('\n📋 APERÇU DES IMAGES:', 'magenta'));
    images.forEach(img => {
      console.log(`   ${img.relativePath} (${Math.round(img.size / 1024)}KB)`);
    });
    return;
  }

  // Étape 1: Compression
  if (!UPLOAD_ONLY) {
    console.log(colorize('\n🗜️  ÉTAPE 1: COMPRESSION DES IMAGES', 'magenta'));
    console.log(colorize(`   Qualité JPEG: ${CONFIG.QUALITY.jpeg}%`, 'blue'));
    console.log(colorize(`   Taille max: ${CONFIG.QUALITY.maxSize}px\n`, 'blue'));

    // Créer le dossier de sortie
    if (!fs.existsSync(CONFIG.COMPRESSED_DIR)) {
      fs.mkdirSync(CONFIG.COMPRESSED_DIR, { recursive: true });
    }

    let compressed = 0;
    for (const img of images) {
      const outputPath = path.join(CONFIG.COMPRESSED_DIR, img.relativePath);
      const success = compressImage(img.fullPath, outputPath);

      if (success) {
        const newSize = fs.statSync(outputPath).size;
        const savings = Math.round((1 - newSize / img.size) * 100);
        console.log(`✅ ${img.relativePath} (${Math.round(img.size/1024)}KB → ${Math.round(newSize/1024)}KB, -${savings}%)`);
        compressed++;
      } else {
        console.log(`⚠️  ${img.relativePath} (copié sans compression)`);
      }
    }

    console.log(colorize(`\n✅ ${compressed}/${images.length} images compressées`, 'green'));

    if (COMPRESS_ONLY) {
      console.log(colorize(`\n📁 Images compressées dans: ${CONFIG.COMPRESSED_DIR}`, 'cyan'));
      return;
    }
  }

  // Étape 2: Upload Firebase
  console.log(colorize('\n☁️  ÉTAPE 2: UPLOAD VERS FIREBASE STORAGE', 'magenta'));

  const bucket = initFirebase();
  if (!bucket) {
    console.log(colorize('\n💡 Pour continuer sans Firebase, utilisez --compress-only', 'yellow'));
    return;
  }

  const urlMapping = {};
  let uploaded = 0;

  for (const img of images) {
    const localPath = UPLOAD_ONLY
      ? img.fullPath
      : path.join(CONFIG.COMPRESSED_DIR, img.relativePath);

    if (!fs.existsSync(localPath)) {
      console.log(colorize(`⚠️  Fichier non trouvé: ${localPath}`, 'yellow'));
      continue;
    }

    process.stdout.write(`☁️  Upload: ${img.relativePath}... `);

    const url = await uploadToFirebase(bucket, localPath, img.relativePath);

    if (url) {
      const key = generateKey(img.relativePath);
      urlMapping[key] = url;
      console.log(colorize('✅', 'green'));
      uploaded++;
    } else {
      console.log(colorize('❌', 'red'));
    }
  }

  console.log(colorize(`\n✅ ${uploaded}/${images.length} images uploadées`, 'green'));

  // Étape 3: Générer le fichier de mapping
  if (Object.keys(urlMapping).length > 0) {
    console.log(colorize('\n📝 ÉTAPE 3: GÉNÉRATION DU MAPPING', 'magenta'));
    generateMappingFile(urlMapping);
  }

  // Résumé final
  console.log(colorize('\n🎉 TERMINÉ !', 'green'));
  console.log(colorize('=============', 'green'));
  console.log(`📊 Images traitées: ${images.length}`);
  console.log(`☁️  Images uploadées: ${uploaded}`);
  console.log(`📝 Mapping: ${CONFIG.OUTPUT_MAPPING}`);

  console.log(colorize('\n📋 PROCHAINES ÉTAPES:', 'cyan'));
  console.log('1. Vérifier les images sur Firebase Console');
  console.log('2. Mettre à jour productImages.js pour utiliser les URLs');
  console.log('3. Tester l\'app avec les nouvelles images');
}

main().catch(error => {
  console.log(colorize(`\n❌ Erreur fatale: ${error.message}`, 'red'));
  console.log(error.stack);
  process.exit(1);
});
