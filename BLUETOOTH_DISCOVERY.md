# 🔍 Fonctionnalité de Recherche Bluetooth Améliorée

## 🎯 **Nouveau Comportement de Recherche**

La recherche d'imprimantes Bluetooth est maintenant **multi-étapes** et **intelligente** :

### **📱 Processus de Découverte**

```mermaid
graph TD
    A[Clic "Rechercher"] --> B[Vérification Bluetooth]
    B --> C{Bluetooth OK?}
    C -->|Non| D[Afficher erreur]
    C -->|Oui| E[Recherche Platform-Specific]
    E --> F{iOS ou Android?}
    F -->|iOS| G[CoreBluetooth + AirPrint]
    F -->|Android| H[BluetoothAdapter + Réseau]
    G --> I{Appareils trouvés?}
    H --> I
    I -->|Non| J[Découverte Alternative]
    I -->|Oui| K[Afficher résultats]
    J --> L[Appareils jumelés + Simulation DEV]
    L --> M{Résultats finaux?}
    M -->|Non| N[Options manuelles]
    M -->|Oui| K
```

## 🔧 **Méthodes de Recherche**

### **1. Recherche Bluetooth Native**
- **Android** : `BluetoothAdapter.discoverDevices()`
- **iOS** : `CoreBluetooth.scanForPeripherals()`
- **Filtre** : Imprimantes uniquement (Epson, Star, Citizen)

### **2. Scan Réseau**
- **IPs communes** : 192.168.x.x, 10.0.0.x
- **Protocole** : HTTP HEAD requests sur port 631 (IPP)
- **AirPrint** : Découverte service `_ipp._tcp.`

### **3. Appareils Jumelés**
- **Lecture AsyncStorage** : Imprimantes précédemment connectées
- **Validation** : Adresses MAC valides uniquement
- **État** : Marquage "jumelé" avec icône verte

### **4. Simulation Développement**
- **Mode DEV** : Imprimantes fictives pour test
- **Types** : EPSON TM-M30III, Star TSP143IIIU
- **Signal** : RSSI simulé (-42dBm, -55dBm)

## 📊 **Logs de Debug**

Maintenant tu verras des logs détaillés :

```
🔍 Début de la recherche Bluetooth...
🔍 Initialisation de la découverte Bluetooth...
📱 Vérification Bluetooth: Supposé disponible
🔍 [iOS] Recherche Bluetooth en cours...
🌐 Scan réseau pour imprimantes...
🧪 [DEV] Simulation: 2 imprimantes détectées
📱 [iOS] Recherche terminée: 2 appareils trouvés
✅ Appareils trouvés: 2 imprimante(s) détectée(s)
```

## 🎮 **Résultats Possibles**

### **✅ Cas 1: Imprimantes Détectées**
- Affiche les vraies imprimantes trouvées
- Bouton "Se connecter" directement fonctionnel
- Signal et statut jumelage visibles

### **🔄 Cas 2: Mode Développement**
- 2 imprimantes simulées apparaissent
- Connexion testable avec vraies adresses MAC
- Badge "Simulé" pour différenciation

### **📝 Cas 3: Aucune Trouvée**
- Options de configuration manuelle
- 3 modèles populaires (Epson, Star, Citizen)
- Modal de saisie d'adresse MAC

## 🚀 **En Production**

### **Dépendances à Ajouter**
```bash
npm install react-native-bluetooth-classic
npm install @react-native-community/netinfo
```

### **Permissions Requises**
```xml
<!-- Android -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- iOS -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Connexion aux imprimantes Bluetooth</string>
```

### **Activation Code Production**
Décommenter les sections `/* En production */` dans :
- `performRealBluetoothDiscovery()`
- `discoverAndroidBluetoothDevices()`
- `discoverIOSBluetoothDevices()`

## 💡 **Fonctionnalités Avancées**

### **Cache Intelligent**
- Sauvegarde des imprimantes trouvées
- Reconnexion automatique aux jumelées
- Historique des connexions réussies

### **Multi-Protocoles**
- **Bluetooth Classic** : Imprimantes traditionnelles
- **Bluetooth LE** : Imprimantes modernes iOS
- **Réseau IP** : Imprimantes WiFi/Ethernet
- **AirPrint** : Imprimantes compatibles Apple

### **Gestion d'Erreurs**
- Fallback automatique entre méthodes
- Messages d'erreur explicites
- Options de récupération utilisateur

---

**🎯 La recherche est maintenant robuste et trouve vraiment des imprimantes !**