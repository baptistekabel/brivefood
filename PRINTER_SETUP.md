# Configuration Imprimante Epson TM-M30III

## 📋 Étapes de configuration

### 1. Configuration réseau de l'imprimante

1. **Connexion WiFi** :
   - Allumez votre imprimante Epson TM-M30III
   - Appuyez sur le bouton WiFi jusqu'à ce que la LED clignote
   - Connectez-vous au réseau WiFi de l'imprimante depuis votre téléphone/ordinateur
   - Ouvrez un navigateur et allez sur `192.168.192.168`
   - Configurez votre imprimante pour qu'elle se connecte à votre WiFi principal

2. **Trouver l'adresse IP** :
   - Une fois connectée à votre WiFi, imprimez le statut réseau (maintenir le bouton FEED)
   - Notez l'adresse IP affichée (ex: 192.168.1.100)

### 2. Configuration dans l'application

1. **Modifier l'IP dans PrinterService.js** :
   ```javascript
   // Dans src/services/PrinterService.js, ligne ~95
   findEpsonPrinter() {
     return 'http://VOTRE_IP_IMPRIMANTE:631/ipp/print';
     // Exemple: 'http://192.168.1.100:631/ipp/print'
   }
   ```

2. **Tester la connexion** :
   - Ouvrez l'app BriveFood
   - Allez dans l'espace Admin
   - Dans le Dashboard, cliquez sur l'icône 🖨️ en haut à droite
   - Cliquez sur "Imprimer" pour tester

### 3. Résolution des problèmes

#### Problème : "Imprimante non trouvée"
- Vérifiez que l'imprimante et le téléphone sont sur le même réseau WiFi
- Vérifiez l'adresse IP de l'imprimante
- Redémarrez l'imprimante

#### Problème : "Ticket sauvegardé au lieu d'imprimé"
- L'imprimante n'est pas accessible via l'IP configurée
- Essayez les ports 631, 80 ou 9100
- Exemple d'URLs à tester :
  - `http://192.168.1.100:631/ipp/print`
  - `http://192.168.1.100:9100`
  - `http://192.168.1.100:80`

### 4. Fonctionnement automatique

✅ **Une fois configurée correctement** :
- Chaque nouvelle commande client déclenchera automatiquement l'impression
- Le ticket sera imprimé sur papier thermique 58mm
- Format optimisé pour votre Epson TM-M30III

### 5. Exemple d'adresses IP communes

- Router Livebox : `192.168.1.100` à `192.168.1.199`
- Router Freebox : `192.168.0.100` à `192.168.0.199`
- Router SFR : `192.168.1.100` à `192.168.1.199`

### 6. Test avancé

Si les problèmes persistent, vous pouvez tester manuellement :

1. **Test ping** (depuis un ordinateur sur le même réseau) :
   ```bash
   ping 192.168.1.100  # Remplacez par l'IP de votre imprimante
   ```

2. **Test HTTP** (dans le navigateur) :
   ```
   http://192.168.1.100:631
   ```

---

## 🔧 Support technique

- **Modèle** : Epson TM-M30III
- **Largeur papier** : 58mm (papier thermique)
- **Protocoles** : IPP, ESC/POS
- **Connectivité** : WiFi, Ethernet, USB

Pour plus d'aide, consultez le manuel de votre imprimante Epson TM-M30III.