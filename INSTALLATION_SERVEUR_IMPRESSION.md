# 🖨️ Installation Serveur d'Impression BriveFood
## Impression 100% Automatique à Distance

---

## 📋 **Prérequis**

### Matériel nécessaire :
- ✅ **Un ordinateur/PC** au restaurant (Windows/Mac/Linux)
- ✅ **Imprimante Epson TM-M30III** connectée en WiFi
- ✅ **Connexion internet stable** au restaurant
- ✅ **Réseau WiFi** fonctionnel

### Logiciels à installer :
- ✅ **Node.js** (version 16 ou plus récente)
- ✅ **Git** (pour télécharger le code)

---

## 🚀 **Installation Étape par Étape**

### **Étape 1 : Préparer l'ordinateur du restaurant**

1. **Télécharger Node.js** :
   - Allez sur https://nodejs.org
   - Téléchargez la version LTS
   - Installez Node.js

2. **Vérifier l'installation** :
   ```bash
   node --version
   npm --version
   ```

### **Étape 2 : Installer le serveur d'impression**

1. **Copier le dossier `printer-server`** sur l'ordinateur du restaurant

2. **Ouvrir un terminal** dans le dossier `printer-server`

3. **Installer les dépendances** :
   ```bash
   npm install
   ```

### **Étape 3 : Configuration de l'imprimante**

1. **Trouver l'IP de votre imprimante** :
   - Sur votre Epson TM-M30III, maintenez le bouton **FEED**
   - Un ticket avec les infos réseau s'imprime
   - Notez l'adresse IP (ex: `'192'.168.1.45`)

2. **Configurer le fichier `.env`** :
   ```env
   PORT=3001
   PRINTER_IP=192.168.1.45  # ⬅️ VOTRE IP ICI
   ```

### **Étape 4 : Tester le serveur**

1. **Démarrer le serveur** :
   ```bash
   npm start
   ```

2. **Vérifier dans votre navigateur** :
   - Allez sur : `http://localhost:3001/health`
   - Vous devriez voir : `{"status":"active","message":"Serveur d'impression BriveFood opérationnel"}`

3. **Tester l'impression** :
   - Allez sur : `http://localhost:3001/printer/test`
   - Un ticket de test devrait s'imprimer !

### **Étape 5 : Configuration de l'app mobile**

1. **Trouver l'IP de l'ordinateur du restaurant** :
   - Windows : `ipconfig` dans le cmd
   - Mac/Linux : `ifconfig` dans le terminal
   - Notez l'IP locale (ex: `192.168.1.50`)

2. **Modifier l'app mobile** :
   - Fichier : `src/services/RemotePrinterService.js`
   - Ligne 10 : `this.serverUrl = 'http://192.168.1.50:3001';`

---

## 🔧 **Configuration Avancée**

### **Option A : Serveur Local (Même WiFi)**
```javascript
// Dans RemotePrinterService.js
this.serverUrl = 'http://192.168.1.50:3001';
```
✅ **Avantages** : Rapide, fiable  
❌ **Inconvénients** : Fonctionne seulement au restaurant

### **Option B : Serveur Cloud (À Distance)**
```javascript
// Dans RemotePrinterService.js  
this.serverUrl = 'https://votre-serveur.herokuapp.com';
```
✅ **Avantages** : Fonctionne partout  
❌ **Inconvénients** : Plus complexe à configurer

### **Déployer sur Heroku (Option B)** :

1. **Créer un compte Heroku**
2. **Installer Heroku CLI**
3. **Déployer** :
   ```bash
   cd printer-server
   git init
   heroku create votre-nom-restaurant-printer
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

---

## ⚡ **Fonctionnement Automatique**

### **Flux complet** :
```
[Client commande] → [App Mobile] → [Internet] → [Serveur Restaurant] → [Imprimante]
       ↓                ↓             ↓              ↓                    ↓
   "Je commande"    API POST      Réseau WiFi    Node.js Server      Ticket imprimé
```

### **Système de Fallback** :
1. **1er essai** : Impression via serveur distant ✅
2. **2e essai** : Impression locale (si serveur indisponible) ⚠️
3. **3e essai** : Sauvegarde PDF (si tout échoue) 📄

---

## 🛠️ **Maintenance et Dépannage**

### **Logs du serveur** :
```bash
# Voir les logs en temps réel
tail -f logs/printer-server.log
```

### **Redémarrage automatique** :
```bash
# Installer PM2 pour redémarrage auto
npm install -g pm2
pm2 start server.js --name "brivefood-printer"
pm2 startup
pm2 save
```

### **Problèmes courants** :

| Problème | Solution |
|----------|----------|
| "Serveur inaccessible" | Vérifiez l'IP dans RemotePrinterService.js |
| "Imprimante non trouvée" | Vérifiez PRINTER_IP dans .env |
| "Port déjà utilisé" | Changez PORT dans .env |

---

## 🎯 **Test Final**

### **Protocole de test complet** :

1. **Serveur** : `http://localhost:3001/health` → ✅
2. **Imprimante** : `http://localhost:3001/printer/test` → ✅ Ticket imprimé
3. **App mobile** : Bouton 🖨️ → "Test serveur distant" → ✅
4. **Commande réelle** : Passer une commande → ✅ Ticket automatique

### **Résultat attendu** :
```
🍽️ COMMANDE CUISINE 🍽️
═══════════════════════
    COMMANDE #123456
   12/09/2024 14:30
═══════════════════════
CLIENT: Test Client
TEL: 06 12 34 56 78
═══════════════════════
    📦 À EMPORTER
═══════════════════════
🍴 ARTICLES À PRÉPARER
1x Pizza Margherita
Taille: M
═══════════════════════
💳 PAIEMENT: 💳 CARTE  
💰 TOTAL: 12.50€
═══════════════════════
⏰ À PRÉPARER MAINTENANT
🏃 CLIENT VIENT RÉCUPÉRER
```

---

## ✅ **Checklist Finale**

- [ ] Node.js installé sur PC restaurant
- [ ] Serveur d'impression configuré et démarré
- [ ] IP imprimante configurée dans `.env`
- [ ] IP serveur configurée dans l'app mobile
- [ ] Test d'impression réussi
- [ ] Commande test effectuée avec succès
- [ ] Système de fallback vérifié

**🎉 Félicitations ! Votre système d'impression 100% automatique est opérationnel !**

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Testez chaque composant individuellement
3. Consultez la section dépannage ci-dessus