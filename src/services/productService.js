import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';

class ProductService {
  constructor() {
    this.collectionName = 'products';
  }

  // Ajouter un nouveau produit
  async addProduct(productData) {
    try {
      console.log('📝 Adding new product:', productData.name);

      const product = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
        id: null // sera généré par Firestore
      };

      const docRef = await addDoc(collection(db, this.collectionName), product);

      // Mettre à jour avec l'ID généré
      await updateDoc(docRef, {
        id: docRef.id
      });

      console.log('✅ Product added successfully with ID:', docRef.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error adding product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  }

  // Modifier un produit existant (ou créer s'il n'existe pas)
  async updateProduct(productId, updates) {
    try {
      console.log('📝 Updating product:', productId);
      console.log('📝 Updates data:', {
        name: updates.name,
        firebaseImageUrl: updates.firebaseImageUrl ? updates.firebaseImageUrl.substring(0, 60) + '...' : 'null',
        firebaseImagePath: updates.firebaseImagePath || 'null',
      });

      const updateData = {
        ...updates,
        id: productId,
        active: true, // S'assurer que le produit est actif pour être visible
        updatedAt: serverTimestamp()
      };

      // Ajouter createdAt seulement si c'est une nouvelle création
      const productRef = doc(db, this.collectionName, productId);

      // Utiliser setDoc avec merge: true pour créer le document s'il n'existe pas
      await setDoc(productRef, {
        ...updateData,
        createdAt: updates.createdAt || serverTimestamp() // Préserve ou crée
      }, { merge: true });

      console.log('✅ Product updated successfully with firebaseImageUrl:', updates.firebaseImageUrl ? 'YES' : 'NO');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un produit (soft delete)
  async deleteProduct(productId) {
    try {
      console.log('🗑️ Deleting product:', productId);

      const productRef = doc(db, this.collectionName, productId);
      await updateDoc(productRef, {
        active: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Product deleted successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les produits actifs
  async getAllProducts() {
    try {
      console.log('📥 Fetching all products from Firebase');

      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Fetched ${products.length} products`);
      return { success: true, products };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return { success: false, error: error.message, products: [] };
    }
  }

  // Récupérer les produits par catégorie
  async getProductsByCategory(category) {
    try {
      console.log('📥 Fetching products for category:', category);

      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        where('active', '==', true),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Fetched ${products.length} products for category ${category}`);
      return { success: true, products };
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      return { success: false, error: error.message, products: [] };
    }
  }

  // Écouter les changements en temps réel
  subscribeToProducts(callback) {
    try {
      console.log('🔄 Setting up real-time products listener');

      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });

        console.log(`🔄 Real-time update: ${products.length} products`);
        callback(products);
      }, (error) => {
        console.error('❌ Error in real-time listener:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      return () => {};
    }
  }

  // Écouter les changements pour une catégorie spécifique
  subscribeToProductsByCategory(category, callback) {
    try {
      console.log('🔄 Setting up real-time listener for category:', category);

      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        where('active', '==', true),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });

        console.log(`🔄 Real-time update for ${category}: ${products.length} products`);
        callback(products);
      }, (error) => {
        console.error('❌ Error in category real-time listener:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up category real-time listener:', error);
      return () => {};
    }
  }

  // Organiser les produits par catégorie (format compatible avec l'app existante)
  organizeProductsByCategory(products) {
    const organized = {};

    products.forEach(product => {
      if (!organized[product.category]) {
        organized[product.category] = [];
      }
      organized[product.category].push(product);
    });

    return organized;
  }

  // Migrer une catégorie spécifique vers Firebase (supprime les anciens d'abord)
  async migrateCategoryProducts(category, products) {
    try {
      console.log(`🔄 Starting migration of ${category} to Firebase (${products.length} products)`);

      // 1. D'abord, supprimer tous les produits de cette catégorie dans Firebase
      console.log(`🗑️ Deleting old ${category} products from Firebase...`);
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category)
      );
      const snapshot = await getDocs(q);
      let deletedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, this.collectionName, docSnapshot.id));
        deletedCount++;
      }
      console.log(`🗑️ Deleted ${deletedCount} old products`);

      // 2. Ensuite, ajouter les nouveaux produits
      let migratedCount = 0;
      let skippedCount = 0;

      for (const product of products) {
        try {
          const productRef = doc(db, this.collectionName, product.id);

          const productData = {
            ...product,
            id: product.id,
            category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            active: true,
            migrated: true
          };

          // Supprimer la propriété image (objet require) car Firebase ne peut pas la stocker
          delete productData.image;

          await setDoc(productRef, productData);
          migratedCount++;
          console.log(`✅ Migrated: ${product.name} (${product.id})`);
        } catch (productError) {
          console.error(`❌ Error migrating ${product.name}:`, productError);
          skippedCount++;
        }
      }

      console.log(`✅ Category migration completed: ${deletedCount} deleted, ${migratedCount} migrated, ${skippedCount} skipped`);
      return { success: true, migratedCount, skippedCount, deletedCount };
    } catch (error) {
      console.error('❌ Error during category migration:', error);
      return { success: false, error: error.message };
    }
  }

  // Migrer les données existantes vers Firebase (pour l'initialisation)
  // Utilise setDoc avec l'ID local pour que les IDs correspondent
  async migrateExistingProducts(existingProducts) {
    try {
      console.log('🔄 Starting migration of existing products to Firebase');
      let migratedCount = 0;
      let skippedCount = 0;

      // Parcourir toutes les catégories de produits existants
      for (const [category, products] of Object.entries(existingProducts)) {
        console.log(`📦 Migrating category: ${category} (${products.length} products)`);

        for (const product of products) {
          try {
            // Utiliser l'ID du produit local comme ID du document Firebase
            const productRef = doc(db, this.collectionName, product.id);

            const productData = {
              ...product,
              id: product.id, // S'assurer que l'ID est dans les données
              category,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              active: true,
              migrated: true
            };

            // setDoc avec merge:false pour créer ou remplacer
            await setDoc(productRef, productData);
            migratedCount++;
            console.log(`✅ Migrated: ${product.name} (${product.id})`);
          } catch (productError) {
            console.error(`❌ Error migrating ${product.name}:`, productError);
            skippedCount++;
          }
        }
      }

      console.log(`✅ Migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
      return { success: true, migratedCount, skippedCount };
    } catch (error) {
      console.error('❌ Error during migration:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ProductService();