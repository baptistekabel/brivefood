#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const screenFiles = [
  'app/(tabs)/menu.tsx',
  'app/(tabs)/orders.tsx', 
  'app/(tabs)/profile.tsx',
  'app/cart.tsx'
];

const fontMappings = {
  "fontWeight: typography.fontWeights.normal": "fontFamily: typography.fontFamily.regular",
  "fontWeight: typography.fontWeights.medium": "fontFamily: typography.fontFamily.medium",
  "fontWeight: typography.fontWeights.semibold": "fontFamily: typography.fontFamily.semibold",
  "fontWeight: typography.fontWeights.bold": "fontFamily: typography.fontFamily.bold",
  "fontWeight: typography.fontWeights.extrabold": "fontFamily: typography.fontFamily.bold",
  "fontWeight: '400'": "fontFamily: typography.fontFamily.regular",
  "fontWeight: '500'": "fontFamily: typography.fontFamily.medium",
  "fontWeight: '600'": "fontFamily: typography.fontFamily.semibold",
  "fontWeight: '700'": "fontFamily: typography.fontFamily.bold",
  "fontWeight: '800'": "fontFamily: typography.fontFamily.bold",
};

const addImports = `import useFonts from '../../src/hooks/useFonts';
import LoadingScreen from '../../src/components/common/LoadingScreen';`;

const addImportsCart = `import useFonts from '../src/hooks/useFonts';
import LoadingScreen from '../src/components/common/LoadingScreen';`;

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter les imports
    const isCartFile = filePath.includes('cart.tsx');
    const imports = isCartFile ? addImportsCart : addImports;
    
    if (!content.includes('useFonts')) {
      content = content.replace(
        /import \* as Haptics from 'expo-haptics';/,
        `import * as Haptics from 'expo-haptics';\n${imports}`
      );
    }
    
    // Ajouter le hook et loading screen
    if (!content.includes('const fontsLoaded = useFonts()')) {
      content = content.replace(
        /export default function (\w+)\(\) \{/,
        `export default function $1() {
  const fontsLoaded = useFonts();`
      );
      
      content = content.replace(
        /const fontsLoaded = useFonts\(\);\s+/,
        `const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  `
      );
    }
    
    // Remplacer fontWeight par fontFamily
    Object.entries(fontMappings).forEach(([oldWeight, newFamily]) => {
      content = content.replace(new RegExp(oldWeight, 'g'), newFamily);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} mis à jour`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

console.log('🔤 Application de DM Sans dans tous les écrans...\n');

screenFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
  }
});

console.log('\n✨ Application terminée !');
console.log('🚀 Lancez votre app avec: npx expo start --clear');