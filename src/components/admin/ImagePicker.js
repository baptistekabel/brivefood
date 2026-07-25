import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePickerExpo from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import productImages from '../../data/productImages';

export default function ImagePicker({
  productId,
  currentImageUrl = null,
  currentImageKey = null,
  onImageSelected,
  style = {}
}) {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtenir l'image fallback depuis les assets locaux
  const getLocalFallbackImage = () => {
    if (currentImageKey && productImages[currentImageKey]) {
      return productImages[currentImageKey];
    }
    return null;
  };

  // Demander les permissions et ouvrir le picker
  const pickImage = async (sourceType = 'library') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Demander les permissions
      let permissionResult;
      if (sourceType === 'camera') {
        permissionResult = await ImagePickerExpo.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos ou votre caméra.'
        );
        return;
      }

      setLoading(true);

      // Lancer le picker
      let result;
      if (sourceType === 'camera') {
        result = await ImagePickerExpo.launchCameraAsync({
          mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePickerExpo.launchImageLibraryAsync({
          mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      setLoading(false);

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);

        // Notifier le parent
        if (onImageSelected) {
          onImageSelected(imageUri);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  // Afficher le menu de sélection
  const showImageOptions = () => {
    Alert.alert(
      'Choisir une photo',
      'D\'où souhaitez-vous sélectionner votre image ?',
      [
        {
          text: 'Galerie photos',
          onPress: () => pickImage('library'),
        },
        {
          text: 'Appareil photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  // Supprimer l'image sélectionnée
  const removeSelectedImage = () => {
    setSelectedImageUri(null);
    if (onImageSelected) {
      onImageSelected(null);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Déterminer quelle image afficher
  const getDisplayImage = () => {
    if (selectedImageUri) {
      return { uri: selectedImageUri };
    }
    if (currentImageUrl) {
      return { uri: currentImageUrl };
    }
    const localImage = getLocalFallbackImage();
    if (localImage) {
      return localImage;
    }
    return null;
  };

  const displayImage = getDisplayImage();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Photo du produit</Text>

      <View style={styles.imageContainer}>
        {displayImage ? (
          <View style={styles.imageWrapper}>
            <Image source={displayImage} style={styles.image} resizeMode="cover" />

            {/* Overlay avec actions */}
            <View style={styles.imageOverlay}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={showImageOptions}
              >
                <Ionicons name="camera" size={20} color={colors.neutral.white} />
              </TouchableOpacity>

              {selectedImageUri && (
                <TouchableOpacity
                  style={[styles.overlayButton, styles.deleteButton]}
                  onPress={removeSelectedImage}
                >
                  <Ionicons name="trash" size={20} color={colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>

            {/* Badge de source */}
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>
                {selectedImageUri ? 'Nouvelle' : currentImageUrl ? 'Firebase' : 'Locale'}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.placeholderContainer}
            onPress={showImageOptions}
            disabled={loading}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.placeholder}
            >
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary.main} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={48} color={colors.neutral.gray400} />
                  <Text style={styles.placeholderText}>Ajouter une photo</Text>
                  <Text style={styles.placeholderSubtext}>Galerie ou Appareil photo</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      {displayImage && !loading && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={showImageOptions}
          >
            <Ionicons name="camera-outline" size={16} color={colors.primary.main} />
            <Text style={styles.actionText}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  overlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  sourceBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  sourceBadgeText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.medium,
  },
  placeholderContainer: {
    width: '100%',
    height: 200,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
  },
  placeholderText: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing.sm,
  },
  placeholderSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray400,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    fontFamily: typography.fontFamily.medium,
  },
});