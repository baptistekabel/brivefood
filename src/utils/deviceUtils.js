import React from 'react';
import { Dimensions, Platform } from 'react-native';

// Obtenir les dimensions de l'écran
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Détecter si l'appareil est une tablette
export const isTablet = () => {
  const { width, height } = getScreenDimensions();
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  // Considérer comme tablette si :
  // - Dimension minimale >= 768px (iPad et tablettes Android)
  // - Ou ratio d'aspect proche du carré (tablettes carrées)
  return minDimension >= 768 || (maxDimension / minDimension < 1.6);
};

// Détecter l'orientation
export const isLandscape = () => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

// Détecter si c'est une tablette en mode paysage
export const isTabletLandscape = () => {
  return isTablet() && isLandscape();
};

// Obtenir les breakpoints adaptatifs
export const getBreakpoints = () => {
  const { width } = getScreenDimensions();

  return {
    sm: width >= 576,   // Petit téléphone en paysage
    md: width >= 768,   // Tablette
    lg: width >= 1024,  // Grande tablette
    xl: width >= 1280,  // Desktop
  };
};

// Obtenir les styles adaptatifs selon l'appareil
export const getResponsiveStyles = () => {
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();
  const { width } = getScreenDimensions();

  return {
    // Padding horizontal adaptatif
    paddingHorizontal: isTabletDevice ? (isLandscapeMode ? 80 : 48) : 24,

    // Largeur maximale pour le contenu
    maxContentWidth: isTabletDevice ? (isLandscapeMode ? 600 : 480) : '100%',

    // Espacement vertical
    verticalSpacing: isTabletDevice ? 32 : 24,

    // Taille des formulaires
    formWidth: isTabletDevice && isLandscapeMode ? '50%' : '100%',

    // Disposition en colonnes pour tablette paysage
    useColumns: isTabletDevice && isLandscapeMode,

    // Taille des polices adaptative
    scaleFactor: isTabletDevice ? 1.1 : 1,
  };
};

// Hook personnalisé pour les dimensions réactives
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(getScreenDimensions());

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  return {
    ...dimensions,
    isTablet: isTablet(),
    isLandscape: dimensions.width > dimensions.height,
    isTabletLandscape: isTablet() && dimensions.width > dimensions.height,
    responsiveStyles: getResponsiveStyles(),
  };
};

export default {
  getScreenDimensions,
  isTablet,
  isLandscape,
  isTabletLandscape,
  getBreakpoints,
  getResponsiveStyles,
  useResponsiveDimensions,
};