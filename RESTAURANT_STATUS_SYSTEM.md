# 🏪 Système de Statut Restaurant Automatique avec Forçage Manuel

## 📋 Vue d'Ensemble

Le système de statut restaurant gère automatiquement l'ouverture et la fermeture du restaurant selon des horaires configurés, avec la possibilité de forcer manuellement le statut si nécessaire.

## 🚀 Fonctionnalités

### ✨ **Gestion Automatique**
- **Horaires configurables** par jour de la semaine
- **Calcul automatique** du statut selon l'heure actuelle
- **Monitoring continu** avec vérification chaque minute
- **Transitions fluides** entre ouvert/fermé

### 🎛️ **Contrôle Manuel**
- **Toggle rapide** pour ouvrir/fermer immédiatement
- **Forçage avancé** avec raison personnalisée
- **Durée limitée** pour les overrides temporaires
- **Retour automatique** au mode automatique

### 📱 **Interface Utilisateur**
- **Statut visuel** clair avec indicateurs colorés
- **Informations contextuelles** (raison, prochaine ouverture/fermeture)
- **Contrôles intuitifs** dans le dashboard admin
- **Feedback temps réel** des changements

## 🏗️ Architecture

### **Composants Principaux**

1. **`RestaurantStatusService`** - Service central de gestion
2. **`RestaurantStatusControl`** - Interface de contrôle admin
3. **Intégration Dashboard** - Affichage dans l'espace admin

### **Flux de Données**
```
Horaires configurés → Calcul automatique → Statut actuel
                    ↑                    ↓
                Forçage manuel ← Interface admin
```

## ⚙️ Configuration

### **Horaires par Défaut**
```javascript
{
  monday: { open: '11:00', close: '22:00', enabled: true },
  tuesday: { open: '11:00', close: '22:00', enabled: true },
  wednesday: { open: '11:00', close: '22:00', enabled: true },
  thursday: { open: '11:00', close: '22:00', enabled: true },
  friday: { open: '11:00', close: '22:00', enabled: true },
  saturday: { open: '11:00', close: '23:00', enabled: true },
  sunday: { open: '12:00', close: '21:00', enabled: true }
}
```

### **Personnalisation**
- **Horaires modifiables** pour chaque jour
- **Jours fermés** configurables (enabled: false)
- **Horaires de nuit** supportés (ex: 23:00 - 01:00)

## 🎯 Interface Administrateur

### **Affichage du Statut**
- **Indicateur visuel** : Vert (ouvert) / Rouge (fermé)
- **Mode actuel** : Automatique / Manuel
- **Raison** : Texte explicatif du statut
- **Prochaine transition** : Temps restant avant changement

### **Contrôles Disponibles**

#### **Toggle Rapide**
- **Un clic** pour inverser le statut
- **Confirmation** avant application
- **Feedback immédiat** visuel et haptique

#### **Forçage Avancé**
- **Modal dédiée** pour configurations détaillées
- **Raison personnalisée** pour documenter le changement
- **Durée limitée** (en minutes) ou permanent
- **Validation** avant application

#### **Retour Automatique**
- **Bouton "Auto"** visible en mode manuel
- **Confirmation** avant retour au mode automatique
- **Recalcul immédiat** du statut selon les horaires

## 💾 Persistance des Données

### **Stockage Local (AsyncStorage)**
- `@restaurant_status` - Statut actuel
- `@restaurant_schedule` - Horaires configurés
- `@restaurant_override` - Forçage manuel actif

### **Gestion des Données**
- **Sauvegarde automatique** de tous les changements
- **Récupération** au redémarrage de l'application
- **Expiration automatique** des forçages temporaires

## 🔄 Monitoring Automatique

### **Vérification Continue**
- **Interval de 1 minute** pour vérifier le statut
- **Calcul en temps réel** selon les horaires
- **Notifications** aux écouteurs en cas de changement

### **Gestion des Écouteurs**
```javascript
// S'abonner aux changements
const removeListener = restaurantStatusService.addStatusListener((newStatus, previousStatus) => {
  console.log(`Statut changé: ${newStatus.isOpen ? 'OUVERT' : 'FERMÉ'}`);
});

// Se désabonner
removeListener();
```

## 🎨 Design et UX

### **Indicateurs Visuels**
- **Couleurs significatives** : Vert/Rouge pour ouvert/fermé
- **Icônes contextuelles** : Checkmark/Close, Manual/Auto
- **États intermédiaires** : Chargement, erreur

### **Interactions**
- **Feedback haptique** sur toutes les interactions
- **Animations fluides** pour les transitions
- **Messages informatifs** pour chaque action

### **Responsive Design**
- **Compatible tablette** et mobile
- **Adaptation** aux différentes tailles d'écran
- **Accessibilité** optimisée

## 📊 API du Service

### **Méthodes Principales**
```javascript
// Initialisation
await restaurantStatusService.initialize();

// Obtenir le statut
const status = await restaurantStatusService.getStatus();

// Forcer le statut
await restaurantStatusService.forceStatus(true, 'Ouverture exceptionnelle', 120);

// Annuler le forçage
await restaurantStatusService.clearOverride();

// Gérer les horaires
const schedule = await restaurantStatusService.getSchedule();
await restaurantStatusService.setSchedule(newSchedule);
```

### **Format du Statut**
```javascript
{
  isOpen: true,           // Restaurant ouvert/fermé
  mode: 'automatic',      // 'automatic' ou 'manual'
  reason: 'Ouvert jusqu\'à 22:00',  // Explication
  lastUpdated: '2025-01-19T19:30:00.000Z',  // Dernière MAJ
  nextChange: '2025-01-19T22:00:00.000Z'    // Prochaine transition
}
```

## 🛠️ Utilisation

### **Pour l'Administrateur**
1. **Dashboard admin** → Section "Statut du restaurant"
2. **Consulter** le statut actuel et les informations
3. **Toggle rapide** pour changements immédiats
4. **Forçage avancé** pour contrôle précis
5. **Retour auto** quand nécessaire

### **Cas d'Usage Typiques**

#### **Fermeture d'urgence**
- Clic sur "Fermer" → Confirmation → Restaurant fermé immédiatement

#### **Ouverture exceptionnelle**
- "Ouvrir" → Modal → Raison : "Service exceptionnel" → Confirmer

#### **Fermeture temporaire**
- "Fermer" → Modal → Durée : "30" minutes → Raison : "Maintenance" → Confirmer

#### **Retour à la normale**
- Bouton "Auto" → Confirmation → Retour aux horaires programmés

## 🔧 Maintenance et Monitoring

### **Nettoyage Automatique**
- **Expiration** des forçages temporaires
- **Nettoyage** au redémarrage de l'app
- **Logs détaillés** pour le debugging

### **Robustesse**
- **Gestion d'erreurs** complète
- **Fallbacks** en cas de problème
- **Récupération automatique** après erreurs

## 🚀 Avantages

### **Pour le Restaurateur**
- **Automatisation** de l'ouverture/fermeture
- **Contrôle total** quand nécessaire
- **Traçabilité** des actions manuelles
- **Interface intuitive** et rapide

### **Pour les Clients**
- **Statut fiable** du restaurant
- **Information en temps réel** de la disponibilité
- **Pas de commandes** quand fermé

### **Technique**
- **Architecture modulaire** et extensible
- **Performance optimisée** avec monitoring minimal
- **Compatibilité** React Native complète
- **Code maintenable** et documenté

Le système est maintenant **opérationnel** et permet un contrôle intelligent et flexible du statut du restaurant ! 🏪✨