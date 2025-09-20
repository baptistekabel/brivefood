# 🔥 Configuration Automatique Firebase Admin

Ce guide vous explique comment utiliser le script pour créer automatiquement tous les comptes admin et livreur sur Firebase.

## 📋 Prérequis

1. **Firebase Admin SDK** installé
2. **Clé de service Firebase** téléchargée
3. **Node.js** installé sur votre machine

## 🚀 Installation

### 1. Installer Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Obtenir la clé de service Firebase

1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **brive-food**
3. Allez dans **Paramètres du projet** (icône engrenage)
4. Onglet **Comptes de service**
5. Cliquez **Générer une nouvelle clé privée**
6. Téléchargez le fichier JSON

### 3. Configurer le script

Ouvrez `setup-firebase-admin.js` et remplacez la configuration `serviceAccount` par le contenu de votre fichier JSON téléchargé.

**Exemple :**
```javascript
const serviceAccount = {
  "type": "service_account",
  "project_id": "brive-food",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@brive-food.iam.gserviceaccount.com",
  // ... autres champs du fichier JSON
};
```

## 🎯 Utilisation

### Exécuter le script

```bash
node setup-firebase-admin.js
```

### Ce que fait le script

Le script va créer automatiquement :

#### 👑 Comptes Admin
- **kabelbaptiste971@gmail.com** / **Brivefood** (admin)
- **test@gmail.com** / **Brivefood** (admin)

#### 🚲 Comptes Livreur  
- **livreur@brivefood.com** / **Brivefood** (delivery)
- **delivery@brivefood.com** / **Brivefood** (delivery)

### Pour chaque utilisateur, le script :

1. ✅ **Crée le compte** dans Firebase Authentication
2. ✅ **Crée le profil** dans Firestore Database (collection `users`)
3. ✅ **Configure le rôle** (admin ou delivery)
4. ✅ **Gère les doublons** (met à jour si existe déjà)

## 📊 Structure des profils créés

Dans Firestore > `users` > `{uid}` :

```json
{
  "email": "kabelbaptiste971@gmail.com",
  "displayName": "Baptiste Admin", 
  "role": "admin",
  "createdAt": "2024-09-13T...",
  "isActive": true,
  "lastLoginAt": null
}
```

## 🔐 Sécurité

⚠️ **Important** : Ne committez jamais votre clé de service dans Git !

Ajoutez à votre `.gitignore` :
```
setup-firebase-admin.js
firebase-service-account.json
```

## 🐛 Résolution des problèmes

### Erreur "Permission denied"
- Vérifiez que votre clé de service a les bonnes permissions
- Dans Firebase Console > IAM, vérifiez que le compte de service a le rôle "Firebase Admin SDK Administrator Service Agent"

### Erreur "Project not found"  
- Vérifiez que le `project_id` dans la configuration correspond à votre projet Firebase

### Erreur "Invalid private key"
- Assurez-vous que la clé privée est correctement formatée avec les `\n` 
- Vérifiez que vous avez copié tout le contenu du fichier JSON

## ✅ Après l'exécution

Une fois le script exécuté avec succès, vous pourrez vous connecter dans l'app avec :

- **Email** : `kabelbaptiste971@gmail.com`
- **Mot de passe** : `Brivefood` 
- **Type** : Admin

L'authentification persistera automatiquement grâce à Firebase ! 🎉