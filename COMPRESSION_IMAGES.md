# 🖼️ Compression d'Images BriveFood

Ce guide explique comment utiliser les scripts de compression d'images pour optimiser les performances de l'application.

## 📋 Scripts Disponibles

### 1. Script Simple (Recommandé)
```bash
npm run compress-images
```
- Utilise les outils natifs du système (sips sur macOS, ImageMagick si disponible)
- Configuration optimisée pour React Native
- Sauvegarde automatique des fichiers originaux

### 2. Script Avancé
```bash
npm run compress-images-advanced
```
- Utilise ImageMagick avec plus d'options
- Support WebP
- Installation automatique d'ImageMagick (macOS)

### 3. Nettoyage des Sauvegardes
```bash
npm run clean-backups
```
- Supprime tous les fichiers `.backup` créés lors de la compression

## ⚙️ Configuration de Compression

| Format | Qualité | Description |
|--------|---------|-------------|
| **JPEG** | 85% | Optimal pour photos avec beaucoup de détails |
| **PNG** | 80% | Préserve la transparence, bon pour logos/icônes |
| **WebP** | 80% | Format moderne, meilleur rapport qualité/taille |

## 📁 Dossiers Traités

Les scripts compressen automatiquement toutes les images dans :

```
assets/images/
├── pizzas/          # Images de pizzas
├── burgers/         # Images de burgers
├── pates/           # Images de pâtes
├── salades/         # Images de salades
├── desserts/        # Images de desserts
├── tex-mex/         # Images tex-mex
├── petitesFaims/    # Images petites faims
├── petiteFaimBruschetta/ # Images bruschetta
├── frites/          # Images de frites
├── boissons/        # Images de boissons
├── lasagnes/        # Images de lasagnes
├── tacos/           # Images de tacos
└── (autres)         # Images diverses
```

## 🚀 Utilisation Rapide

1. **Compresser toutes les images :**
   ```bash
   npm run compress-images
   ```

2. **Vérifier les résultats :**
   Le script affiche un rapport détaillé avec :
   - Nombre d'images traitées
   - Taille avant/après compression
   - Pourcentage d'économie d'espace

3. **Si tout fonctionne bien, nettoyer les sauvegardes :**
   ```bash
   npm run clean-backups
   ```

## 📊 Exemple de Sortie

```
🖼️  Compression d'images BriveFood
===================================

🔧 Outil utilisé: imagemagick
🎯 Qualité: JPEG 85%, PNG 80%

📁 assets/images/pizzas (12 images)
────────────────────────────────────────────────────────
✅ pizzaMargherita.jpg           245Ko → 180Ko (-27%)
✅ pizza4Fromages.png           189Ko → 145Ko (-23%)
✅ pizzaChevreMiel.jpg          298Ko → 201Ko (-33%)

📊 Résumé: 12/12 compressées, 28% d'économie

🎉 COMPRESSION TERMINÉE
======================
📈 Images traitées: 147
📏 Taille originale: 12,450Ko
📏 Nouvelle taille: 8,890Ko
💾 Espace économisé: 3,560Ko (29%)
❌ Erreurs: 0
```

## 🛠️ Prérequis

### macOS
```bash
brew install imagemagick
```

### Ubuntu/Debian
```bash
sudo apt-get install imagemagick
```

### Windows
Télécharger depuis : https://imagemagick.org/script/download.php

## ⚠️ Points Importants

1. **Sauvegardes :** Les fichiers originaux sont sauvegardés avec l'extension `.backup`
2. **Réversible :** En cas de problème, les originaux peuvent être restaurés
3. **Formats supportés :** JPEG, PNG, WebP
4. **Performance :** Une compression correcte peut réduire la taille de l'app de 20-40%

## 🎯 Pourquoi Compresser ?

- **Performance** : Chargement plus rapide des images
- **Bande passante** : Moins de données téléchargées
- **Stockage** : Application moins volumineuse
- **UX** : Interface plus fluide

## 🔧 Options Avancées

### Compression personnalisée
Modifiez les variables dans `compress-images-simple.js` :
```javascript
const JPEG_QUALITY = 85; // 1-100
const PNG_QUALITY = 80;  // 1-100
```

### Compression manuelle d'une image
```bash
# Avec ImageMagick
convert input.jpg -quality 85 -strip output.jpg

# Avec sips (macOS)
sips -s formatOptions 85 input.jpg
```

## 🆘 Dépannage

### Erreur "command not found"
Installez ImageMagick selon votre système d'exploitation.

### Images corrompues
Les sauvegardes `.backup` permettent de restaurer les originaux :
```bash
# Restaurer une image spécifique
cp image.jpg.backup image.jpg

# Restaurer toutes les images
find assets -name "*.backup" -exec sh -c 'cp "$1" "${1%.backup}"' _ {} \;
```

### Compression insuffisante
Diminuez la qualité dans la configuration, mais attention à ne pas dégrader visuellement les images.

---

💡 **Conseil :** Testez toujours l'application après compression pour vérifier que la qualité visuelle reste acceptable.