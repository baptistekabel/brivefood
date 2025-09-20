#!/bin/bash

# Script de démarrage pour BriveFood App
echo "🍕 Démarrage de BriveFood App..."
echo "================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer pour continuer."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer pour continuer."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "📦 Version Node.js détectée: $NODE_VERSION"

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances..."
    npm install
fi

# Vérifier si Expo CLI est installé
if ! command -v npx expo &> /dev/null; then
    echo "📱 Installation d'Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Configuration terminée!"
echo ""
echo "🚀 Choix de démarrage:"
echo "1. Démarrer avec Expo (recommandé)"
echo "2. Démarrer pour iOS"
echo "3. Démarrer pour Android"
echo "4. Démarrer pour Web"
echo ""

read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo "🌟 Démarrage avec Expo..."
        npm start
        ;;
    2)
        echo "📱 Démarrage pour iOS..."
        npm run ios
        ;;
    3)
        echo "🤖 Démarrage pour Android..."
        npm run android
        ;;
    4)
        echo "🌐 Démarrage pour Web..."
        npm run web
        ;;
    *)
        echo "❌ Choix invalide. Démarrage par défaut..."
        npm start
        ;;
esac

echo ""
echo "🎉 BriveFood App est en cours de démarrage!"
echo "📲 Scannez le QR code avec l'app Expo Go ou utilisez l'émulateur"
echo "🔧 N'oubliez pas de configurer Firebase dans config/firebase.js"