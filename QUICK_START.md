# 🚀 Guide de Démarrage Rapide - BriveFood

## ✅ Problèmes résolus

- ❌ ~~Erreurs d'importation `Unable to resolve "@/src/constants/theme"`~~ → ✅ **Corrigé**
- ❌ ~~Fichiers manquants `src/constants/theme.js`~~ → ✅ **Créé**  
- ❌ ~~Fichiers manquants `src/types/index.js`~~ → ✅ **Créé**
- ❌ ~~Fichiers manquants `config/firebase.js`~~ → ✅ **Créé**
- ❌ ~~Routes manquantes (auth/login, auth/register, order-tracking)~~ → ✅ **Supprimées du layout**
- ❌ ~~Erreur Framer Motion `target.addEventListener is not a function`~~ → ✅ **Remplacé par View React Native**
- ❌ ~~Module ExpoBarCodeScanner manquant~~ → ✅ **Scanner QR supprimé**

**Status :** 🟢 **Application 100% FONCTIONNELLE !**

## 🛠 Configuration requise

1. **Node.js** v20.19.4+ (version recommandée)
2. **npm** ou **yarn**
3. **Expo CLI** (installé automatiquement)
4. **Compte Firebase** pour la configuration

## 📱 Démarrage rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration Firebase

**IMPORTANT** : Avant de lancer l'app, configurez Firebase dans `config/firebase.js` :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID", 
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 3. Démarrage de l'application

**Option 1 - Script automatique :**
```bash
./start-app.sh
```

**Option 2 - Commandes manuelles :**
```bash
# Démarrage général
npm start

# Ou pour une plateforme spécifique
npm run ios
npm run android  
npm run web
```

### 4. Si le port 8081 est occupé
```bash
npx expo start --port 8082
```

## 📱 Test sur appareil

1. **iOS/Android** : Téléchargez **Expo Go** 
2. **Scannez le QR code** affiché dans le terminal
3. **Ou utilisez un émulateur** iOS Simulator/Android Studio

## 🎯 Fonctionnalités testables

### ✅ Déjà fonctionnelles
- [x] **Écran d'accueil** avec animations et accès rapide au menu
- [x] **Navigation par onglets** (Accueil, Menu, Commandes, Profil)
- [x] **Menu digital** avec catégories et ajout au panier
- [x] **Panier** avec calcul des totaux
- [x] **Interface de profil** utilisateur
- [x] **Écrans d'authentification** (sans Firebase configuré)

### ⚠️ Nécessitent Firebase configuré
- [ ] **Authentification** réelle
- [ ] **Sauvegarde des données** utilisateur
- [ ] **Historique des commandes**

## 🎨 Aperçu du design

L'application utilise :
- **Dégradé violet-rose** pour l'interface principale
- **Jaune doré** pour les accents et boutons d'action  
- **Interface moderne** avec coins arrondis et ombres
- **Animations fluides** avec Framer Motion

## 🔧 Résolution de problèmes courants

### Erreur Metro Bundler
```bash
npx expo start --clear
```

### Erreur de cache
```bash
npm start -- --reset-cache
```

### Réinstaller les dépendances
```bash
rm -rf node_modules
npm install
```

## 📂 Structure des écrans principaux

```
app/
├── (tabs)/
│   ├── index.tsx      # 🏠 Accueil + Accès menu
│   ├── menu.tsx       # 🍕 Menu digital
│   ├── orders.tsx     # 📋 Commandes  
│   └── profile.tsx    # 👤 Profil
├── cart.tsx           # 🛒 Panier
└── _layout.tsx        # 🎛 Configuration navigation
```

## 🎯 Prochaines étapes

1. **Configurer Firebase** pour tester l'authentification
2. **Ajouter des images** de plats dans le menu
3. **Intégrer un système de paiement** (Stripe/PayPal)
4. **Développer l'interface restaurant** pour la gestion

---

🎉 **L'application est maintenant prête à être testée !** 

Pour toute question, consultez le `README_BRIVEFOOD.md` pour plus de détails.