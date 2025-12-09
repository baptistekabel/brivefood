import {
  collection,
  doc,
  addDoc,
  updateDoc,
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

  // Modifier un produit existant
  async updateProduct(productId, updates) {
    try {
      console.log('📝 Updating product:', productId);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      const productRef = doc(db, this.collectionName, productId);
      await updateDoc(productRef, updateData);

      console.log('✅ Product updated successfully');
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

  // Migrer les données existantes vers Firebase (pour l'initialisation)
  async migrateExistingProducts(existingProducts) {
    try {
      console.log('🔄 Starting migration of existing products to Firebase');
      let migratedCount = 0;

      // Parcourir toutes les catégories de produits existants
      for (const [category, products] of Object.entries(existingProducts)) {
        console.log(`📦 Migrating category: ${category} (${products.length} products)`);

        for (const product of products) {
          // Vérifier si le produit existe déjà
          const existingQuery = query(
            collection(db, this.collectionName),
            where('id', '==', product.id)
          );
          const existingSnapshot = await getDocs(existingQuery);

          if (existingSnapshot.empty) {
            // Le produit n'existe pas, le migrer
            const productData = {
              ...product,
              category,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              active: true,
              migrated: true
            };

            await addDoc(collection(db, this.collectionName), productData);
            migratedCount++;
            console.log(`✅ Migrated product: ${product.name}`);
          } else {
            console.log(`⏭️ Product already exists: ${product.name}`);
          }
        }
      }

      console.log(`✅ Migration completed: ${migratedCount} products migrated`);
      return { success: true, migratedCount };
    } catch (error) {
      console.error('❌ Error during migration:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ProductService();