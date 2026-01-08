import React, { createContext, useContext, useEffect, useState } from 'react';
import productService from '../services/productService';
import localProductsData from '../data/products.js'; // Données existantes pour fallback
import { ProductCategory } from '../types';

const ProductsContext = createContext({});

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Initialiser et écouter les produits
  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      await initializeProducts();
      // Activer le listener après l'initialisation
      unsubscribe = setupRealtimeListener();
    };

    init();

    // Cleanup: arrêter le listener quand le composant se démonte
    return () => {
      if (unsubscribe) {
        console.log('🔇 Cleaning up products listener');
        unsubscribe();
      }
    };
  }, []);

  // Recalculer productsByCategory quand les produits changent
  useEffect(() => {
    if (products.length > 0) {
      setProductsByCategory(productService.organizeProductsByCategory(products));
    }
  }, [products]);

  const initializeProducts = async () => {
    try {
      console.log('🔄 Initializing products...');
      setLoading(true);

      // Charger immédiatement les données locales pour éviter un écran vide
      loadLocalProducts();

      try {
        // Essayer de charger depuis Firebase en arrière-plan
        const result = await productService.getAllProducts();

        if (result.success && result.products.length > 0) {
          console.log('✅ Products loaded from Firebase:', result.products.length, 'products');
          setProducts(result.products);
          setProductsByCategory(productService.organizeProductsByCategory(result.products));
          setIsFirebaseConnected(true);
        } else {
          console.log('⚠️ No products in Firebase, keeping local data');
        }

      } catch (firebaseError) {
        console.error('❌ Firebase unavailable, using local data:', firebaseError);
        setIsFirebaseConnected(false);
      }

      setError(null);
    } catch (err) {
      console.error('❌ Error initializing products:', err);
      setError(err.message);
      // En cas d'erreur, s'assurer que les données locales sont chargées
      loadLocalProducts();
      setIsFirebaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Référence aux produits locaux (ne change jamais)
  const getLocalProducts = () => {
    const allProducts = [];
    Object.entries(localProductsData).forEach(([category, categoryProducts]) => {
      categoryProducts.forEach(product => {
        allProducts.push({
          ...product,
          category,
          source: 'local'
        });
      });
    });
    return allProducts;
  };

  const loadLocalProducts = () => {
    console.log('📦 Loading local products from data/products.js');
    const allProducts = getLocalProducts();
    console.log(`✅ Loaded ${allProducts.length} products from local data`);
    setProducts(allProducts);
    setProductsByCategory(localProductsData);
  };

  const setupRealtimeListener = () => {
    console.log('🔄 Setting up real-time products listener');

    const unsubscribe = productService.subscribeToProducts((firebaseProducts) => {
      console.log('🔄 Firebase real-time update received:', firebaseProducts.length, 'products');

      if (firebaseProducts.length > 0) {
        // Vérifier si des produits ont des images Firebase
        const productsWithImages = firebaseProducts.filter(p => p.firebaseImageUrl);
        console.log('📸 Produits avec images Firebase:', productsWithImages.length);

        // Log les URLs des images pour debug
        if (__DEV__ && productsWithImages.length > 0) {
          productsWithImages.slice(0, 3).forEach(p => {
            console.log(`   - ${p.name}: ${p.firebaseImageUrl?.substring(0, 50)}...`);
          });
        }

        // Utiliser les produits Firebase directement
        setProducts(firebaseProducts);
        setProductsByCategory(productService.organizeProductsByCategory(firebaseProducts));
        setIsFirebaseConnected(true);
      }
    });

    return unsubscribe;
  };

  const migrateLocalProducts = async () => {
    try {
      console.log('🚀 Starting migration of local products to Firebase');
      const result = await productService.migrateExistingProducts(localProductsData);

      if (result.success) {
        console.log(`✅ Migration completed: ${result.migratedCount} products`);
        // Recharger depuis Firebase après migration
        await initializeProducts();
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  };

  // Migrer une catégorie spécifique (ex: BOISSONS)
  const migrateCategoryToFirebase = async (category) => {
    try {
      console.log(`🚀 Starting migration of ${category} to Firebase`);
      const categoryProducts = localProductsData[category];

      if (!categoryProducts || categoryProducts.length === 0) {
        console.log(`⚠️ No products found for category ${category}`);
        return { success: false, error: 'No products found' };
      }

      const result = await productService.migrateCategoryProducts(category, categoryProducts);

      if (result.success) {
        console.log(`✅ Category migration completed: ${result.migratedCount} products`);
        // Recharger depuis Firebase après migration
        await initializeProducts();
        return result;
      }
      return result;
    } catch (error) {
      console.error('❌ Category migration failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Ajouter un produit (admin)
  const addProduct = async (productData) => {
    try {
      console.log('➕ Adding new product:', productData.name);
      const result = await productService.addProduct(productData);

      if (result.success) {
        console.log('✅ Product added successfully');
        // Les données se mettront à jour automatiquement via le listener temps réel
        return { success: true, id: result.id };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error adding product:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Modifier un produit (admin)
  const updateProduct = async (productId, updates) => {
    try {
      console.log('✏️ Updating product:', productId);
      const result = await productService.updateProduct(productId, updates);

      if (result.success) {
        console.log('✅ Product updated successfully');
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Supprimer un produit (admin)
  const deleteProduct = async (productId) => {
    try {
      console.log('🗑️ Deleting product:', productId);
      const result = await productService.deleteProduct(productId);

      if (result.success) {
        console.log('✅ Product deleted successfully');
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Obtenir les produits d'une catégorie
  const getProductsByCategory = (category) => {
    return productsByCategory[category] || [];
  };

  // Obtenir un produit par son ID
  const getProductById = (productId) => {
    return products.find(product => product.id === productId) || null;
  };

  // Rechercher des produits
  const searchProducts = (query) => {
    if (!query || query.trim() === '') {
      return products;
    }

    const searchTerm = query.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  };

  // Forcer une actualisation
  const refreshProducts = async () => {
    await initializeProducts();
  };

  const value = {
    // Data
    products,
    productsByCategory,
    isFirebaseConnected,

    // State
    loading,
    error,

    // Methods - Read
    getProductsByCategory,
    getProductById,
    searchProducts,
    refreshProducts,

    // Methods - Write (Admin)
    addProduct,
    updateProduct,
    deleteProduct,

    // Utility
    migrateLocalProducts,
    migrateCategoryToFirebase,

    // Stats
    totalProducts: products.length,
    categoriesCount: Object.keys(productsByCategory).length,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};