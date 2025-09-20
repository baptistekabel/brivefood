# 🔤 Guide d'Utilisation des Polices Personnalisées - BriveFood

## 📁 Où placer vos fichiers de police

Placez vos fichiers `.ttf` dans le dossier :
```
assets/fonts/
├── YourFont-Regular.ttf
├── YourFont-Medium.ttf  
├── YourFont-SemiBold.ttf
└── YourFont-Bold.ttf
```

## ⚙️ Configuration

### 1. Modifier le hook useFonts.js
Dans `src/hooks/useFonts.js`, décommentez et modifiez les lignes :
```js
await Font.loadAsync({
  'YourFont-Regular': require('../../assets/fonts/YourFont-Regular.ttf'),
  'YourFont-Medium': require('../../assets/fonts/YourFont-Medium.ttf'),
  'YourFont-SemiBold': require('../../assets/fonts/YourFont-SemiBold.ttf'),
  'YourFont-Bold': require('../../assets/fonts/YourFont-Bold.ttf'),
});
```

### 2. Modifier le thème
Dans `src/constants/theme.js`, décommentez et modifiez :
```js
fontFamily: {
  regular: 'YourFont-Regular',
  medium: 'YourFont-Medium', 
  semibold: 'YourFont-SemiBold',
  bold: 'YourFont-Bold',
},
```

## 🎯 Utilisation

### Méthode 1: Composant CustomText (Recommandé)
```jsx
import CustomText from '../components/common/CustomText';

<CustomText weight="bold" size="xl" color={colors.primary.main}>
  Titre Principal
</CustomText>

<CustomText weight="medium" size="base">
  Texte normal
</CustomText>
```

### Méthode 2: Style traditionnel
```jsx
import { typography } from '../constants/theme';

<Text style={{
  fontFamily: typography.fontFamily.bold,
  fontSize: typography.fontSizes.xl
}}>
  Mon texte
</Text>
```

## 🔄 Migration des écrans existants

Pour appliquer automatiquement vos polices dans toute l'app, ajoutez dans vos écrans :

```jsx
import useFonts from '../hooks/useFonts';

export default function YourScreen() {
  const fontsLoaded = useFonts();
  
  if (!fontsLoaded) {
    return <LoadingScreen />; // Optionnel
  }
  
  // Votre écran ici
}
```

## 📝 Exemples de noms de polices populaires

- **Poppins**: Poppins-Regular, Poppins-Medium, Poppins-SemiBold, Poppins-Bold
- **Inter**: Inter-Regular, Inter-Medium, Inter-SemiBold, Inter-Bold
- **Roboto**: Roboto-Regular, Roboto-Medium, Roboto-Bold
- **Open Sans**: OpenSans-Regular, OpenSans-SemiBold, OpenSans-Bold

## 🚀 Commandes utiles

```bash
# Installer les dépendances de polices (déjà incluses dans Expo)
npm install expo-font

# Redémarrer avec cache clear après ajout de polices
npx expo start --clear
```

## ✅ Checklist

- [ ] Fichiers .ttf placés dans `assets/fonts/`
- [ ] Configuration dans `useFonts.js`
- [ ] Modification du thème `theme.js`
- [ ] Test avec CustomText
- [ ] Application dans les écrans principaux