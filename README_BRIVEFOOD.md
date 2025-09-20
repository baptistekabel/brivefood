# 🍕 BriveFood - Application de Commande Restaurant

Une application mobile moderne de commande de nourriture développée avec React Native, Expo et Firebase.

## 🎨 Design & Interface

L'application utilise un thème moderne avec :
- **Couleurs principales** : Violet (#8B5CF6) vers Rose (#EC4899) en dégradé
- **Couleur d'accent** : Jaune doré (#FBBF24)  
- **Couleurs neutres** : Blanc, noir et nuances de gris
- **Animations fluides** avec Framer Motion
- **Interface intuitive** optimisée pour mobile

## ✨ Fonctionnalités Principales

### 🔍 Côté Client
- [x] **Accès rapide au menu** : Interface intuitive pour naviguer
- [x] **Menu digital interactif** avec catégories et recherche
- [x] **Personnalisation des plats** et options
- [x] **Modes de commande** : Sur place, à emporter, livraison
- [x] **Panier intelligent** avec gestion des quantités
- [x] **Système d'authentification** complet
- [x] **Profil utilisateur** avec historique et fidélité
- [ ] **Paiement digital** sécurisé
- [ ] **Suivi de commande** en temps réel
- [ ] **Notifications push** pour le statut des commandes
- [ ] **Programme de fidélité** avec points et récompenses

### 🏪 Côté Restaurant (À développer)
- [ ] **Dashboard administrateur** pour gestion des commandes
- [ ] **Gestion du menu** et disponibilités
- [ ] **Gestion des stocks** en temps réel
- [ ] **Suivi des livraisons** et livreurs
- [ ] **Impressions de tickets** automatiques
- [ ] **Analytics et rapports** de vente

## 🛠 Technologies Utilisées

### Frontend
- **React Native** avec Expo Router
- **TypeScript/JavaScript** 
- **Framer Motion** pour les animations
- **Expo Camera** pour le scanner QR
- **Linear Gradient** pour les dégradés
- **Vector Icons** (Ionicons)

### Backend & Services
- **Firebase Authentication** pour l'authentification
- **Firestore** pour la base de données NoSQL
- **Firebase Storage** pour les images
- **Expo Notifications** pour les notifications push

### Navigation & État
- **Expo Router** pour la navigation
- **React Context** pour la gestion d'état
- **AsyncStorage** pour la persistance locale

## 📁 Structure du Projet

```
brivefood-app/
├── app/                          # Pages et navigation (Expo Router)
│   ├── (tabs)/                   # Navigation par onglets
│   │   ├── index.tsx            # Écran d'accueil avec scanner QR
│   │   ├── menu.tsx             # Menu digital
│   │   ├── orders.tsx           # Commandes et historique
│   │   └── profile.tsx          # Profil utilisateur
│   ├── auth/                    # Authentification
│   ├── cart.tsx                 # Panier
│   └── _layout.tsx              # Layout principal
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── common/             # Composants génériques
│   │   ├── customer/           # Composants côté client
│   │   └── restaurant/         # Composants côté restaurant
│   ├── screens/                # Écrans supplémentaires
│   ├── context/                # Contextes React
│   │   └── AuthContext.js      # Gestion d'authentification
│   ├── services/               # Services et API
│   ├── utils/                  # Utilitaires
│   ├── constants/              # Constantes et configuration
│   │   └── theme.js            # Thème de l'application
│   ├── types/                  # Types et constantes
│   └── hooks/                  # Hooks personnalisés
├── config/
│   └── firebase.js             # Configuration Firebase
└── assets/                     # Images, icônes, polices
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v20.19.4 ou supérieur)
- npm ou yarn
- Expo CLI
- Compte Firebase

### Installation

1. **Cloner le projet**
```bash
git clone [url-du-repo]
cd brivefood-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Firebase**
   - Créer un projet Firebase
   - Activer Authentication, Firestore et Storage
   - Copier les clés de configuration dans `config/firebase.js`

4. **Démarrer l'application**
```bash
# Démarrage du serveur de développement
npm start

# Ou pour une plateforme spécifique
npm run ios
npm run android
npm run web
```

## 🔧 Configuration Firebase

Remplacez les valeurs dans `config/firebase.js` :

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN", 
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Fonctionnalités Détaillées

### Écran d'Accueil
- Dégradé violet-rose avec logo BriveFood
- Bouton principal pour accéder au menu
- Boutons d'accès rapide (Menu, Profil)
- Animations d'entrée avec Framer Motion

### Menu Digital
- Navigation par catégories (Entrées, Plats, Desserts, Boissons)
- Barre de recherche en temps réel
- Cartes de produits avec images, descriptions et prix
- Boutons d'ajout au panier avec feedback visuel
- Indication des produits indisponibles

### Système de Panier
- Gestion des quantités avec contrôles + / -
- Modes de commande (Sur place, À emporter, Livraison)
- Calcul automatique des totaux, taxes et frais
- Interface de validation de commande

### Profil Utilisateur
- Informations personnelles modifiables
- Historique des commandes avec détails
- Programme de fidélité avec points
- Paramètres de notifications
- Centre d'aide et support

## 🎯 Prochaines Étapes

### Phase 1 - Finalisation MVP
- [ ] Intégration système de paiement (Stripe/PayPal)
- [ ] Suivi de commande temps réel avec WebSockets
- [ ] Notifications push complètes
- [ ] Tests automatisés

### Phase 2 - Interface Restaurant
- [ ] Dashboard administrateur
- [ ] Gestion du menu en temps réel
- [ ] Système de gestion des stocks
- [ ] Interface de suivi des livraisons

### Phase 3 - Fonctionnalités Avancées
- [ ] Système de recommandations IA
- [ ] Programme de fidélité avancé
- [ ] Intégration réseaux sociaux
- [ ] Mode hors-ligne

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Développeur

Développé avec ❤️ par Claude Code pour créer une expérience de commande restaurant moderne et intuitive.

---

*BriveFood - Votre restaurant à portée de main* 🍽️✨