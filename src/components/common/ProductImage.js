import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  View,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import { colors, borderRadius } from '../../constants/theme';
import productImages from '../../data/productImages';

// Image par défaut : logo BriveFood
const defaultImage = require('../../../assets/images/logoBrivefood.png');

export default function ProductImage({
  product,
  style = {},
  resizeMode = 'cover',
  ...imageProps
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when product changes
  useEffect(() => {
    setHasError(false);
  }, [product?.id, product?.firebaseImageUrl, product?.updatedAt]);

  // Générer un cache-buster basé sur updatedAt
  const cacheBuster = useMemo(() => {
    if (product?.updatedAt) {
      // Si c'est un Timestamp Firestore
      if (product.updatedAt.toDate) {
        return product.updatedAt.toDate().getTime();
      }
      // Si c'est un objet avec seconds (format Firestore sérialisé)
      if (product.updatedAt.seconds) {
        return product.updatedAt.seconds * 1000;
      }
      // Si c'est déjà une date ou un timestamp
      return new Date(product.updatedAt).getTime();
    }
    return Date.now();
  }, [product?.updatedAt]);

  // Obtenir l'image locale depuis les assets
  const getLocalImage = () => {
    const productId = product?.id || product?.productId;

    // Essayer avec l'ID du produit
    if (productId && productImages[productId]) {
      return productImages[productId];
    }

    // Essayer avec imageKey
    if (product?.imageKey && productImages[product.imageKey]) {
      return productImages[product.imageKey];
    }

    // Fonction pour normaliser les accents
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

    // Essayer avec le nom normalisé
    const normalizedName = normalizeText(product?.name);
    if (normalizedName && productImages[normalizedName]) {
      return productImages[normalizedName];
    }

    // Essayer variations
    if (product?.name) {
      const variations = [
        product.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        product.name.replace(/\s+/g, '').toLowerCase(),
        product.name.split(' ')[0]?.toLowerCase(),
      ];

      for (const variation of variations) {
        if (variation && productImages[variation]) {
          return productImages[variation];
        }
      }

      // Correspondance partielle
      const productKeys = Object.keys(productImages);
      for (const key of productKeys) {
        const keyLower = key.toLowerCase();
        if (normalizedName && (keyLower.includes(normalizedName) || normalizedName.includes(keyLower))) {
          return productImages[key];
        }
      }
    }

    return null;
  };

  // Déterminer la source de l'image
  const imageSource = useMemo(() => {
    // 1. PRIORITÉ: URL Firebase avec cache-buster (image uploadée par admin)
    if (product?.firebaseImageUrl && !hasError) {
      const separator = product.firebaseImageUrl.includes('?') ? '&' : '?';
      const urlWithCacheBuster = `${product.firebaseImageUrl}${separator}t=${cacheBuster}`;

      if (__DEV__) {
        console.log('🖼️ ProductImage - Utilisation Firebase URL:', {
          productName: product?.name,
          url: urlWithCacheBuster.substring(0, 80) + '...',
        });
      }

      return { uri: urlWithCacheBuster };
    }

    // 2. Image locale
    const localImage = getLocalImage();
    if (localImage) {
      if (__DEV__) {
        console.log('🖼️ ProductImage - Utilisation image locale pour:', product?.name);
      }
      return localImage;
    }

    // 3. Image par défaut (logo BriveFood)
    if (__DEV__) {
      console.log('🖼️ ProductImage - Utilisation logo BriveFood pour:', product?.name);
    }

    return defaultImage;
  }, [product?.firebaseImageUrl, product?.id, product?.name, product?.imageKey, cacheBuster, hasError]);

  // Gestion des erreurs
  const handleImageError = () => {
    console.warn('❌ Erreur chargement image pour:', product?.name);
    setHasError(true);
  };

  // Pour les URLs Firebase, forcer le rechargement
  const isRemoteUrl = imageSource?.uri;

  // Extraire le borderRadius du style pour l'appliquer au container
  const flatStyle = RNStyleSheet.flatten(style) || {};
  const containerBorderRadius = flatStyle.borderRadius || borderRadius.md;

  return (
    <View style={[
      styles.container,
      { borderRadius: containerBorderRadius },
      style
    ]}>
      <Image
        source={isRemoteUrl ? { ...imageSource, cache: 'reload' } : imageSource}
        style={[styles.image, { borderRadius: containerBorderRadius }]}
        resizeMode={resizeMode}
        onError={handleImageError}
        {...imageProps}
      />
    </View>
  );
}

const styles = RNStyleSheet.create({
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
});
