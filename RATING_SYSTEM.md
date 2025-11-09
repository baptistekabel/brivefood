# 🌟 Système de Notation des Commandes - BriveFood

## 📋 Vue d'ensemble

Le système de notation permet aux clients de noter leurs commandes une fois qu'elles sont terminées (statut `delivered` ou `ready`). Une notification push est envoyée et un modal élégant s'affiche pour collecter l'avis du client.

## 🚀 Fonctionnalités

### ✨ Détection automatique
- Détecte automatiquement quand une commande passe au statut terminé
- Gère les statuts : `DELIVERED` (livraison) et `READY` (à emporter/sur place)
- Évite les notifications en double

### 📱 Interface utilisateur
- Modal moderne avec animations fluides
- Interface de notation à 5 étoiles avec feedback visuel
- Texte adaptatif selon la note (😞 Très déçu → 🤩 Excellent !)
- Champ commentaire optionnel
- Design cohérent avec l'identité visuelle BriveFood

### 🔔 Notifications
- Notification push immédiate quand la commande est terminée
- Délai de 2 minutes pour la notification de demande de notation
- Gestion intelligente des notifications en attente

### 💾 Persistance des données
- Sauvegarde locale avec AsyncStorage
- Gestion des commandes déjà notées
- Statistiques de notation
- Nettoyage automatique des anciennes données

## 🏗️ Architecture

### Composants principaux

1. **`OrderRatingModal`** - Modal de notation avec UI/UX avancée
2. **`OrderRatingManager`** - Gestionnaire global des modals
3. **`OrderRatingContext`** - Context React pour l'état global
4. **`orderRatingService`** - Service de gestion des données

### Intégration

Le système s'intègre automatiquement dans :
- `ActiveOrderContext` - Détection des changements de statut
- `_layout.tsx` - Providers et composants globaux

## 🔧 Configuration

### Installation automatique
Le système est automatiquement configuré et ne nécessite aucune configuration supplémentaire.

### Personalisation

Vous pouvez personnaliser :
- Délai avant notification (2 min par défaut)
- Statuts considérés comme "terminés"
- Messages et textes d'interface
- Couleurs et animations

## 🧪 Tests

### Mode développement
Un bouton de test est disponible en mode `__DEV__` pour tester le modal sans avoir de vraie commande.

### Script de test
```bash
node test-rating-system.js
```

### Tests manuels
1. Passez une commande
2. Changez son statut vers `delivered` ou `ready`
3. Vérifiez que la notification apparaît
4. Testez le modal de notation

## 📊 Données collectées

### Structure d'une notation
```javascript
{
  id: "rating_1234567890",
  orderId: "ORD-123",
  rating: 5, // 1-5 étoiles
  comment: "Excellent service !",
  timestamp: "2025-01-19T19:30:00.000Z",
  createdAt: "2025-01-19T19:30:00.000Z"
}
```

### Statistiques disponibles
- Nombre total de notations
- Note moyenne
- Distribution des notes (1-5 étoiles)
- Nombre de notations en attente

## 🔄 Flux utilisateur

1. **Commande terminée** → Statut `delivered`/`ready`
2. **Détection automatique** → Ajout aux notifications en attente
3. **Notification immédiate** → "Votre commande est terminée"
4. **Délai 2 minutes** → Notification "Notez votre commande"
5. **Modal affiché** → Interface de notation
6. **Soumission** → Sauvegarde et statistiques

## 🎯 Avantages

### Pour le client
- Interface intuitive et agréable
- Feedback immédiat avec animations
- Pas de spam - une seule demande par commande

### Pour le restaurant
- Collecte d'avis structurés
- Statistiques détaillées
- Amélioration continue du service

### Technique
- Code modulaire et réutilisable
- Performance optimisée
- Gestion d'erreurs robuste
- Compatible React Native/Expo

## 🔧 Maintenance

### Nettoyage automatique
- Conservation des 100 dernières notations
- Suppression des notifications en attente > 7 jours

### Monitoring
- Logs détaillés pour le debugging
- Gestion d'erreurs avec fallbacks

## 📱 Compatibilité

- ✅ iOS
- ✅ Android
- ✅ Expo managed workflow
- ✅ TypeScript (conventions)
- ✅ React Native 0.70+

## 🚨 Notes importantes

- Le bouton de test (`RatingTestButton`) doit être retiré en production
- Les notifications nécessitent les permissions appropriées
- Le système fonctionne offline avec synchronisation ultérieure