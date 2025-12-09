import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import productImages from '../../data/productImages';
import imageStorageService from '../../services/imageStorageService';

export default function ProductImage({
  product,
  style = {},
  resizeMode = 'cover',
  showPlaceholder = true,
  placeholderIcon = 'restaurant-outline',
  ...imageProps
}) {
  const [imageState, setImageState] = useState({
    firebaseUrl: null,
    loading: true,
    error: false,
    usingFallback: false,
  });

  // Obtenir l'image locale depuis les assets
  const getLocalImage = () => {
    // Récupérer l'ID (supporte id ou productId)
    const productId = product.id || product.productId;

    // Debug en mode développement
    if (__DEV__) {
      console.log('🔍 ProductImage - Recherche image pour:', {
        productId: productId,
        productName: product.name,
        imageKey: product.imageKey,
      });
    }

    // Essayer d'abord avec l'ID du produit
    if (productId && productImages[productId]) {
      if (__DEV__) console.log('✅ Image trouvée par ID:', productId);
      return productImages[productId];
    }

    // Essayer avec imageKey si défini
    if (product.imageKey && productImages[product.imageKey]) {
      if (__DEV__) console.log('✅ Image trouvée par imageKey:', product.imageKey);
      return productImages[product.imageKey];
    }

    // Fonction pour normaliser les accents français
    const normalizeText = (text) => {
      if (!text) return '';
      return text
        .toLowerCase()
        .replace(/[àáâäã]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôöõ]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]/g, '');
    };

    // Essayer avec le nom du produit normalisé (sans accents, sans espaces)
    const normalizedName = normalizeText(product.name);

    if (normalizedName && productImages[normalizedName]) {
      if (__DEV__) console.log('✅ Image trouvée par nom normalisé:', normalizedName);
      return productImages[normalizedName];
    }

    // Essayer avec le nom du produit (en camelCase simple)
    const camelCaseName = product.name
      ?.replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    if (camelCaseName && productImages[camelCaseName]) {
      if (__DEV__) console.log('✅ Image trouvée par nom camelCase:', camelCaseName);
      return productImages[camelCaseName];
    }

    // Essayer d'autres variations du nom
    if (product.name) {
      const normalized = normalizeText(product.name);
      const variations = [
        normalized,
        product.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        product.name.replace(/\s+/g, '').toLowerCase(),
        product.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
        product.name.split(' ')[0].toLowerCase(),
        normalizeText(product.name.split(' ')[0]),
        // Variations spécifiques pour les produits français
        product.name.toLowerCase().replace(/pâtes/g, 'pate').replace(/[^a-z]/g, ''),
        product.name.toLowerCase().replace(/ä|â|à/g, 'a').replace(/[^a-z]/g, ''),
      ];

      for (const variation of variations) {
        if (variation && productImages[variation]) {
          if (__DEV__) console.log('✅ Image trouvée par variation:', variation, 'pour produit:', product.name);
          return productImages[variation];
        }
      }

      // Essayer de matcher avec les clés disponibles (insensible à la casse)
      const productKeys = Object.keys(productImages);
      for (const key of productKeys) {
        const keyLower = key.toLowerCase();
        // Correspondance exacte insensible à la casse
        if (normalized && keyLower === normalized) {
          if (__DEV__) console.log('✅ Image trouvée par correspondance exacte (insensible casse):', key, 'pour produit:', product.name);
          return productImages[key];
        }
      }

      // Essayer de matcher partiellement avec les clés disponibles
      for (const key of productKeys) {
        const keyLower = key.toLowerCase();
        if (normalized && (keyLower.includes(normalized) || normalized.includes(keyLower))) {
          if (__DEV__) console.log('✅ Image trouvée par correspondance partielle:', key, 'pour produit:', product.name);
          return productImages[key];
        }
      }
    }

    if (__DEV__) console.log('❌ Aucune image locale trouvée pour:', product.name);
    return null;
  };

  // Charger l'image Firebase si elle existe
  useEffect(() => {
    const loadFirebaseImage = async () => {
      try {
        setImageState(prev => ({ ...prev, loading: true, error: false }));

        // Si le produit a une Firebase URL directe
        if (product.firebaseImageUrl) {
          setImageState({
            firebaseUrl: product.firebaseImageUrl,
            loading: false,
            error: false,
            usingFallback: false,
          });
          return;
        }

        // Si le produit a un path Firebase
        if (product.firebaseImagePath) {
          const downloadUrl = await imageStorageService.getImageDownloadURL(product.firebaseImagePath);
          if (downloadUrl) {
            setImageState({
              firebaseUrl: downloadUrl,
              loading: false,
              error: false,
              usingFallback: false,
            });
            return;
          }
        }

        // Essayer de chercher par ID du produit
        const imagePath = `products/product_${product.id}`;
        const exists = await imageStorageService.imageExists(imagePath);

        if (exists) {
          const downloadUrl = await imageStorageService.getImageDownloadURL(imagePath);
          if (downloadUrl) {
            setImageState({
              firebaseUrl: downloadUrl,
              loading: false,
              error: false,
              usingFallback: false,
            });
            return;
          }
        }

        // Aucune image Firebase trouvée, utiliser le fallback local
        setImageState({
          firebaseUrl: null,
          loading: false,
          error: false,
          usingFallback: true,
        });

      } catch (error) {
        console.error('Erreur chargement image Firebase:', error);
        setImageState({
          firebaseUrl: null,
          loading: false,
          error: true,
          usingFallback: true,
        });
      }
    };

    loadFirebaseImage();
  }, [product.id, product.firebaseImageUrl, product.firebaseImagePath]);

  // Obtenir une image par défaut du projet
  const getDefaultProjectImage = () => {
    // Utiliser une image depuis productImages pour éviter les problèmes de chemin
    return productImages.pizzaMargherita || productImages.burgerClassic || Object.values(productImages)[0];
  };

  // Déterminer quelle image utiliser
  const getImageSource = () => {
    // Si en cours de chargement Firebase
    if (imageState.loading) {
      return null;
    }

    // Prioriser les images locales du projet d'abord
    const localImage = getLocalImage();
    if (localImage) {
      return localImage;
    }

    // Ensuite Firebase si disponible
    if (imageState.firebaseUrl && !imageState.error) {
      return { uri: imageState.firebaseUrl };
    }

    // Toujours retourner une image par défaut du projet
    return getDefaultProjectImage();
  };

  const imageSource = getImageSource();

  // Gestion des erreurs d'image
  const handleImageError = (error) => {
    console.warn('Erreur chargement image:', error);
    setImageState(prev => ({
      ...prev,
      error: true,
      usingFallback: true,
    }));
  };

  // Gestion du chargement réussi
  const handleImageLoad = () => {
    setImageState(prev => ({ ...prev, error: false }));
  };

  // Afficher le loading pendant le chargement Firebase
  if (imageState.loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={colors.primary.main} />
      </View>
    );
  }

  // Toujours afficher une image (jamais de placeholder vide)
  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...imageProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.neutral.gray100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
  },
});