import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

class ImageStorageService {
  /**
   * Convertit une URI en blob de manière compatible React Native
   * @param {string} uri - URI de l'image
   * @returns {Promise<Blob>}
   */
  async uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.error('❌ Erreur XMLHttpRequest:', e);
        reject(new Error('Erreur lors de la conversion de l\'image'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }

  /**
   * Upload une image vers Firebase Storage
   * @param {string} imageUri - URI locale de l'image
   * @param {string} productId - ID du produit
   * @param {string} fileName - Nom du fichier (optionnel)
   * @returns {Promise<string>} - URL de download de l'image
   */
  async uploadProductImage(imageUri, productId, fileName = null) {
    try {
      console.log('📸 Début upload image pour produit:', productId);
      console.log('📸 URI image:', imageUri);

      // Générer un nom de fichier unique si non fourni
      const finalFileName = fileName || `product_${productId}_${Date.now()}.jpg`;

      // Référence dans Firebase Storage
      const imageRef = ref(storage, `products/${finalFileName}`);

      // Convertir l'URI en blob avec XMLHttpRequest (plus fiable en React Native)
      console.log('🔄 Conversion de l\'image en blob...');
      const blob = await this.uriToBlob(imageUri);
      console.log('✅ Blob créé, taille:', blob.size, 'type:', blob.type);

      console.log('📤 Upload du blob vers Firebase Storage...');

      // Upload vers Firebase avec metadata
      const metadata = {
        contentType: blob.type || 'image/jpeg',
      };

      const uploadResult = await uploadBytes(imageRef, blob, metadata);

      // Récupérer l'URL de download
      const downloadURL = await getDownloadURL(uploadResult.ref);

      console.log('✅ Image uploadée avec succès:', downloadURL);

      return {
        success: true,
        downloadURL,
        fileName: finalFileName,
        path: uploadResult.ref.fullPath
      };

    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      console.error('❌ Code erreur:', error.code);
      console.error('❌ Message:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprime une image de Firebase Storage
   * @param {string} imagePath - Chemin de l'image dans Firebase Storage
   */
  async deleteProductImage(imagePath) {
    try {
      console.log('🗑️ Suppression image:', imagePath);

      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);

      console.log('✅ Image supprimée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupère l'URL de download d'une image
   * @param {string} imagePath - Chemin de l'image dans Firebase Storage
   * @returns {Promise<string>} - URL de download
   */
  async getImageDownloadURL(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('❌ Erreur récupération URL image:', error);
      return null;
    }
  }

  /**
   * Met à jour l'image d'un produit (supprime l'ancienne et upload la nouvelle)
   * @param {string} newImageUri - URI de la nouvelle image
   * @param {string} productId - ID du produit
   * @param {string} oldImagePath - Chemin de l'ancienne image (optionnel)
   * @returns {Promise<object>} - Résultat de l'opération
   */
  async updateProductImage(newImageUri, productId, oldImagePath = null) {
    try {
      console.log('🔄 Mise à jour image produit:', productId);

      // Supprimer l'ancienne image si elle existe
      if (oldImagePath) {
        await this.deleteProductImage(oldImagePath);
      }

      // Upload la nouvelle image
      const uploadResult = await this.uploadProductImage(newImageUri, productId);

      return uploadResult;

    } catch (error) {
      console.error('❌ Erreur mise à jour image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifie si une image existe dans Firebase Storage
   * @param {string} imagePath - Chemin de l'image
   * @returns {Promise<boolean>}
   */
  async imageExists(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await getDownloadURL(imageRef);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const imageStorageService = new ImageStorageService();
export default imageStorageService;