import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import localProductsData from '../data/products.js';
import { ProductCategory } from '../types';

class ProductService {
  constructor() {
    this.collectionName = 'products';
  }

  // Exécuter une migration une seule fois (flag stocké dans Firebase)
  // Verrou global : une fois toutes les migrations passées, on ne relit plus
  // les 35 drapeaux à chaque démarrage. Cela évite surtout qu'une migration
  // rejouée n'écrase les prix modifiés à la main dans l'interface admin.
  async areMigrationsCompleted(version) {
    try {
      const snap = await getDoc(doc(db, 'migrations', '_allCompleted'));
      return snap.exists() && snap.data().version === version;
    } catch (error) {
      // En cas d'erreur de lecture, on ne relance pas : ne jamais risquer
      // d'écraser des données par défaut
      console.warn('⚠️ Lecture du verrou de migrations impossible:', error.message);
      return true;
    }
  }

  async markMigrationsCompleted(version) {
    try {
      await setDoc(doc(db, 'migrations', '_allCompleted'), {
        version,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('⚠️ Impossible d\'enregistrer le verrou de migrations:', error.message);
    }
  }

  async runMigrationOnce(name, fn) {
    try {
      const migRef = doc(db, 'migrations', name);
      const migSnap = await getDoc(migRef);
      if (migSnap.exists()) {
        return { success: true, skipped: true, updatedCount: 0 };
      }
      const result = await fn();
      if (result && result.success) {
        await setDoc(migRef, { completedAt: serverTimestamp() });
      }
      return result;
    } catch (error) {
      console.error(`❌ Migration ${name} error:`, error);
      return { success: false, error: error.message };
    }
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

      // __delete : champs à retirer réellement du document.
      // Indispensable car merge:true ne peut jamais supprimer un champ —
      // sans ça, passer un produit "tailles" en "prix unique" laisserait
      // l'ancien objet sizes en base et le client continuerait à l'afficher.
      const { __delete = [], ...cleanUpdates } = updates;

      const productRef = doc(db, this.collectionName, productId);
      const existing = await getDoc(productRef);

      const updateData = {
        ...cleanUpdates,
        id: productId,
        updatedAt: serverTimestamp(),
      };

      __delete.forEach(field => {
        updateData[field] = deleteField();
      });

      // Ne jamais ressusciter un produit supprimé : on conserve l'état existant
      if (updates.active === undefined) {
        updateData.active = existing.exists()
          ? existing.data().active !== false
          : true;
      }

      // createdAt sert au tri du listener temps réel : un produit sans cette
      // date serait invisible pour les clients
      if (!existing.exists() || !existing.data().createdAt) {
        updateData.createdAt = updates.createdAt || serverTimestamp();
      }

      await setDoc(productRef, updateData, { merge: true });

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
        // Snapshot valide : on transmet même une liste vide (dernier produit supprimé)
        callback(products, { error: null });
      }, (error) => {
        console.error('❌ Error in real-time listener:', error);
        // Erreur réseau : surtout ne pas vider le catalogue affiché
        callback(null, { error });
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

    // Debug: compter les pizzas
    const pizzaProducts = products.filter(p => p.category === 'pizza');
    console.log(`🍕 organizeProductsByCategory: ${pizzaProducts.length} pizzas trouvées sur ${products.length} produits totaux`);
    if (pizzaProducts.length < 15) {
      console.log('⚠️ Pizzas manquantes ! IDs présents:', pizzaProducts.map(p => p.id));
      // Vérifier les produits sans catégorie ou avec catégorie différente
      const noCat = products.filter(p => !p.category);
      const pizzaLike = products.filter(p => (p.name || '').toLowerCase().includes('pizza') && p.category !== 'pizza');
      if (noCat.length > 0) console.log('⚠️ Produits SANS catégorie:', noCat.length);
      if (pizzaLike.length > 0) console.log('⚠️ Produits avec "pizza" dans le nom mais catégorie différente:', pizzaLike.map(p => `${p.id}(${p.category})`));
    }

    // Trier les produits par order (si défini) puis par prix
    Object.keys(organized).forEach(category => {
      organized[category].sort((a, b) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        return (a.price || 0) - (b.price || 0);
      });
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

  // Mettre à jour le prix des boissons (1.50 -> 2.00) dans tous les produits Firebase
  async updateDrinkPrices() {
    try {
      console.log('🔄 Updating drink prices in Firebase (1.50 -> 2.00)...');

      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true)
      );

      const snapshot = await getDocs(q);
      let updatedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let needsUpdate = false;
        const updatedOptions = { ...data.customizationOptions };

        // Parcourir toutes les sections de customisation
        if (updatedOptions) {
          for (const [key, section] of Object.entries(updatedOptions)) {
            if (section && section.options && Array.isArray(section.options)) {
              const updatedSectionOptions = section.options.map(option => {
                if (option.price === 1.50) {
                  needsUpdate = true;
                  return { ...option, price: 2.00 };
                }
                return option;
              });
              updatedOptions[key] = { ...section, options: updatedSectionOptions };
            }
          }
        }

        if (needsUpdate) {
          const productRef = doc(db, this.collectionName, docSnapshot.id);
          await updateDoc(productRef, {
            customizationOptions: updatedOptions,
            updatedAt: serverTimestamp()
          });
          updatedCount++;
          console.log(`✅ Updated drink prices for: ${data.name}`);
        }
      }

      console.log(`✅ Drink prices updated for ${updatedCount} products`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error updating drink prices:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter les options de sauce aux produits Petit Cheese dans Firebase
  async addSauceToCheeseProducts() {
    try {
      console.log('🔄 Adding sauce customization to cheese products in Firebase...');

      const sauceOptions = {
        sauce: {
          title: 'Sauce',
          required: true,
          multiSelect: true,
          minSelection: 1,
          maxSelection: 2,
          options: [
            { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
            { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
            { id: 'samourai', name: 'Samouraï', price: 0.00 },
            { id: 'ketchup', name: 'Ketchup', price: 0.00 },
            { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
            { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
            { id: 'brazil', name: 'Brazil', price: 0.00 },
            { id: 'curry', name: 'Curry', price: 0.00 },
            { id: 'barbecue', name: 'Barbecue', price: 0.00 },
            { id: 'harissa', name: 'Harissa', price: 0.00 },
            { id: 'algerienne', name: 'Algérienne', price: 0.00 },
            { id: 'andalouse', name: 'Andalouse', price: 0.00 },
            { id: 'big-mac', name: 'Big Mac', price: 0.00 },
            { id: 'marocaine', name: 'Marocaine', price: 0.00 },
            { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
            { id: 'moutarde', name: 'Moutarde', price: 0.00 },
            { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
          ]
        }
      };

      const productIds = ['petitfaim1', 'petitfaim3', 'petitfaim4', 'petitfaim5', 'menukids1'];
      let updatedCount = 0;

      for (const productId of productIds) {
        try {
          const productRef = doc(db, this.collectionName, productId);
          const q = query(
            collection(db, this.collectionName),
            where('active', '==', true)
          );
          const snapshot = await getDocs(q);
          const productDoc = snapshot.docs.find(d => d.id === productId || d.data().id === productId);

          if (productDoc) {
            const data = productDoc.data();
            const existingOptions = data.customizationOptions || {};

            // Ajouter la section sauce aux options existantes
            const updatedOptions = {
              ...existingOptions,
              ...sauceOptions
            };

            const docRef = doc(db, this.collectionName, productDoc.id);
            await updateDoc(docRef, {
              customizable: true,
              customizationOptions: updatedOptions,
              updatedAt: serverTimestamp()
            });

            updatedCount++;
            console.log(`✅ Added sauce options to: ${data.name} (${productId})`);
          } else {
            console.log(`⚠️ Product not found in Firebase: ${productId}`);
          }
        } catch (productError) {
          console.error(`❌ Error updating ${productId}:`, productError);
        }
      }

      console.log(`✅ Sauce customization added to ${updatedCount} products`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error adding sauce to cheese products:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter le Bissap dans Firebase (produit standalone + option dans toutes les personnalisations boissons)
  async addBissapToDrinks() {
    try {
      console.log('🔄 Adding Bissap to Firebase...');

      // 1. Ajouter le Bissap comme produit standalone dans la catégorie Boissons
      const bissapProduct = {
        id: 'bissap',
        name: 'Bissap',
        description: '33 cl.',
        price: 2.00,
        category: 'boissons',
        rating: null,
        reviews: 0,
        popular: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
        migrated: true
      };

      const bissapRef = doc(db, this.collectionName, 'bissap');
      await setDoc(bissapRef, bissapProduct);
      console.log('✅ Bissap added as standalone drink');

      // 2. Ajouter l'option Bissap dans les personnalisations boissons de tous les produits
      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true)
      );

      const snapshot = await getDocs(q);
      let updatedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let needsUpdate = false;
        const updatedOptions = { ...data.customizationOptions };

        if (updatedOptions) {
          for (const [key, section] of Object.entries(updatedOptions)) {
            if (key === 'boisson' && section && section.options && Array.isArray(section.options)) {
              // Vérifier que le Bissap n'est pas déjà présent
              const hasBissap = section.options.some(opt => opt.id === 'bissap');
              if (!hasBissap) {
                const updatedSectionOptions = [
                  ...section.options,
                  { id: 'bissap', name: 'Bissap', price: 2.00 }
                ];
                updatedOptions[key] = { ...section, options: updatedSectionOptions };
                needsUpdate = true;
              }
            }
          }
        }

        if (needsUpdate) {
          const productRef = doc(db, this.collectionName, docSnapshot.id);
          await updateDoc(productRef, {
            customizationOptions: updatedOptions,
            updatedAt: serverTimestamp()
          });
          updatedCount++;
          console.log(`✅ Added Bissap option to: ${data.name}`);
        }
      }

      console.log(`✅ Bissap added to ${updatedCount} products customization options`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error adding Bissap:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter les 3 nouvelles pizzas + mettre à jour les formules et américains à composer
  async addMissingPizzasAndUpdateComposables() {
    try {
      console.log('🔄 Adding missing pizzas and updating composables in Firebase...');

      // Pizzas supprimées (pizza19, pizza20, pizza21) - ne plus les créer

      // Mettre à jour les américains à composer (viandes, crudités, suppléments)
      const americainIds = ['americain-simple', 'americain-double'];
      const newViandes = [
        { id: 'tender', name: 'Tender', price: 0.50 },
        { id: 'nuggets', name: 'Nuggets', price: 0 },
        { id: 'falafel', name: 'Falafel', price: 0 },
        { id: 'poulet-boursin', name: 'Poulet Boursin', price: 0 }
      ];
      const cruditesSection = {
        title: 'Crudités',
        subtitle: 'Gratuit.',
        required: false,
        multiSelect: true,
        options: [
          { id: 'salade', name: 'Salade', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'oignon', name: 'Oignon', price: 0 }
        ]
      };
      const supplementsSection = {
        title: 'Suppléments',
        subtitle: 'Ajoutez des extras.',
        required: false,
        multiSelect: true,
        options: [
          { id: 'miel', name: 'Miel', price: 1.00 },
          { id: 'poivron-grille', name: 'Poivron grillé', price: 1.00 },
          { id: 'oignon-grille', name: 'Oignon grillé', price: 1.00 },
          { id: 'oignon-frit', name: 'Oignon frit', price: 1.00 },
          { id: 'oeuf', name: 'Oeuf', price: 1.00 },
          { id: 'bacon', name: 'Bacon', price: 1.00 }
        ]
      };

      for (const americainId of americainIds) {
        try {
          const q = query(
            collection(db, this.collectionName),
            where('active', '==', true)
          );
          const snapshot = await getDocs(q);
          const americainDoc = snapshot.docs.find(d => d.id === americainId || d.data().id === americainId);

          if (americainDoc) {
            const data = americainDoc.data();
            const updatedOptions = { ...data.customizationOptions };
            let needsUpdate = false;

            // Ajouter viandes manquantes et supprimer doublon escalope-poulet
            if (updatedOptions.viande && updatedOptions.viande.options) {
              const currentViandes = updatedOptions.viande.options;
              // Supprimer escalope-poulet (doublon de poulet)
              const filteredViandes = currentViandes.filter(v => v.id !== 'escalope-poulet');
              // Ajouter les nouvelles viandes
              for (const viande of newViandes) {
                if (!filteredViandes.some(v => v.id === viande.id)) {
                  filteredViandes.push(viande);
                }
              }
              updatedOptions.viande = { ...updatedOptions.viande, options: filteredViandes };
              needsUpdate = true;
            }

            // Ajouter crudités si absentes
            if (!updatedOptions.crudites) {
              updatedOptions.crudites = cruditesSection;
              needsUpdate = true;
            }

            // Ajouter suppléments si absents
            if (!updatedOptions.supplements) {
              updatedOptions.supplements = supplementsSection;
              needsUpdate = true;
            }

            if (needsUpdate) {
              const docRef = doc(db, this.collectionName, americainDoc.id);
              await updateDoc(docRef, {
                customizationOptions: updatedOptions,
                updatedAt: serverTimestamp()
              });
              console.log(`✅ Updated américain: ${americainId}`);
            }
          }
        } catch (err) {
          console.error(`❌ Error updating américain ${americainId}:`, err);
        }
      }

      console.log(`✅ Migration completed: formules and américains updated`);
      return { success: true, updatedCount: 0 };
    } catch (error) {
      console.error('❌ Error in addMissingPizzasAndUpdateComposables:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter les options de personnalisation au Veggie Burger (steak, sauce, frites, boisson)
  async addOptionsToVeggieBurger() {
    try {
      console.log('🔄 Adding customization options to Veggie Burger...');

      const q = query(
        collection(db, this.collectionName),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      const veggieBurger = snapshot.docs.find(d => d.id === 'burger10' || d.data().id === 'burger10');

      if (!veggieBurger) {
        console.log('⚠️ Veggie Burger not found in Firebase');
        return { success: false };
      }

      const data = veggieBurger.data();
      // Ne pas écraser si les options existent déjà
      if (data.customizationOptions && data.customizationOptions.steak) {
        console.log('✅ Veggie Burger already has customization options');
        return { success: true };
      }

      const customizationOptions = {
        steak: {
          title: 'Nombre de steak',
          required: true,
          multiSelect: false,
          options: [
            { id: 'simple-steak', name: 'Simple Steak', price: 0.00 },
            { id: 'double-steak', name: 'Double Steak', price: 2.00 },
            { id: 'triple-steak', name: 'Triple Steak', price: 4.00 }
          ]
        },
        sauce: {
          title: 'Sauce',
          required: true,
          multiSelect: true,
          minSelection: 1,
          maxSelection: 2,
          options: [
            { id: 'pas-sauce', name: 'Pas de sauce', price: 0.00 },
            { id: 'ketchup', name: 'Ketchup', price: 0.00 },
            { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
            { id: 'moutarde', name: 'Moutarde', price: 0.00 },
            { id: 'samourai', name: 'Samouraï', price: 0.00 },
            { id: 'algerienne', name: 'Algérienne', price: 0.00 },
            { id: 'biggy-burger', name: 'Biggy burger', price: 0.00 },
            { id: 'sauce-blanche', name: 'Sauce blanche', price: 0.00 },
            { id: 'barbecue', name: 'Barbecue', price: 0.00 },
            { id: 'curry', name: 'Curry', price: 0.00 },
            { id: 'harissa', name: 'Harissa', price: 0.00 },
            { id: 'andalouse', name: 'Andalouse', price: 0.00 },
            { id: 'brazil', name: 'Brazil', price: 0.00 },
            { id: 'big-mac', name: 'Big Mac', price: 0.00 },
            { id: 'marocaine', name: 'Marocaine', price: 0.00 },
            { id: 'chili-tai', name: 'Chili Tai', price: 0.00 },
            { id: 'boursin', name: 'Boursin', price: 0.50, popular: true }
          ]
        },
        frites: {
          title: 'Frites',
          required: false,
          multiSelect: false,
          options: [
            { id: 'frites-oui', name: 'Oui', price: 1.00, popular: true },
            { id: 'frites-non', name: 'Non', price: 0.00 }
          ]
        },
        boisson: {
          title: 'Boisson',
          subtitle: 'Ajoutez une boisson à votre burger.',
          required: false,
          maxSelections: 1,
          options: [
            { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
            { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
            { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
            { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
            { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
            { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
            { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
            { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
            { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
            { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
            { id: 'sprite', name: 'Sprite', price: 2.00 },
            { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
            { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
            { id: 'orangina', name: 'Orangina', price: 2.00 },
            { id: 'schweppes', name: 'Schweppes', price: 2.00 },
            { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
            { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
            { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
            { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
            { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
            { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
            { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
            { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
            { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
            { id: 'hawai', name: 'Hawaï', price: 2.00 },
            { id: 'tropico', name: 'Tropico', price: 2.00 },
            { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
            { id: 'bissap', name: 'Bissap', price: 2.00 },
            { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
            { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
            { id: 'redbull', name: 'Redbull', price: 2.50 },
            { id: 'monster', name: 'Monster', price: 2.50 }
          ]
        }
      };

      const docRef = doc(db, this.collectionName, veggieBurger.id);
      await updateDoc(docRef, {
        customizable: true,
        customizationOptions,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Veggie Burger customization options added successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding options to Veggie Burger:', error);
      return { success: false, error: error.message };
    }
  }

  // Réordonner toutes les options de personnalisation dans Firebase
  async reorderAllProductOptions() {
    try {
      console.log('🔄 Reordering options for all products in Firebase...');

      // Ordres standards par ID
      const sauceOrder = ['pas-sauce-fromagere-tacos', 'pas-sauce', 'ketchup', 'mayonnaise', 'moutarde', 'samourai', 'algerienne', 'biggy-burger', 'sauce-blanche', 'barbecue', 'curry', 'harissa', 'andalouse', 'brazil', 'big-mac', 'marocaine', 'chili-tai', 'boursin', 'boursin-sauce'];
      const boissonOrder = ['pas-de-boisson', 'cocacola', 'coca-zero', 'coca-vanille', 'coca-cherry', 'fanta-orange', 'fanta-citron', 'fanta-raisin', 'fanta-framboise', 'fanta-fruit-dragon', 'sprite', '7up-cherry', '7up-mojito', 'orangina', 'schweppes', 'oasis-tropical', 'oasis-fraise-framboise', 'oasis-pomme-cassis-framboise', 'oasis-pomme-poire', 'fuzetea', 'ice-tea-peche', 'ice-tea-tropical', 'ice-tea-framboise', 'ice-tea-pasteque-menthe', 'hawai', 'tropico', 'capri-sun', 'bissap', 'eau-plate', 'eau-gazeuse', 'redbull', 'monster'];
      const viandeOrderTacos = ['poulet', 'kebab', 'tenders', 'nugget', 'cordon-bleu', 'merguez', 'viande-hachee', 'poulet-boursin', 'escalope-poulet', 'falafel'];
      const viandeOrderAmericain = ['steak', 'poulet', 'kebab', 'kefta', 'cordon-bleu', 'merguez', 'nuggets', 'poulet-boursin', 'falafel', 'tender'];
      const viandeOrderBowl = ['poulet', 'kebab', 'tenders', 'nuggets', 'cordon-bleu', 'merguez', 'viande-hachee', 'falafel'];
      const fromageOrder = ['emmental', 'mozzarella', 'raclette', 'chevre', 'parmesan'];
      const sauceOrderReduced = ['ketchup', 'mayonnaise', 'samourai', 'barbecue', 'curry', 'boursin'];
      const bowlSupplOrder = ['bacon', 'oignon-frit', 'oignons-rings', 'chili-cheese', 'sauce-fromagere', 'cheddar', 'emmental', 'mozzarella', 'raclette', 'chevre', 'parmesan', 'boursin', 'vache-kiri'];
      const pizzaNameOrder = ['Pizza à composer', 'Pizza Margherita', 'Pizza 4 Fromages', 'Pizza fermière', 'Pizza kebab', 'Pizza burger', 'Pizza curry', 'Pizza Tex-Mex', 'Pizza raclette', 'Pizza saumon', 'Pizza chèvre miel', 'Pizza chèvre figue', 'Pizza chèvre poulet', 'Pizza cannibale', 'Pizza kebab raclette'];

      const reorderById = (options, order) => {
        if (!options || !Array.isArray(options)) return options;
        return [...options].sort((a, b) => {
          const iA = order.indexOf(a.id);
          const iB = order.indexOf(b.id);
          if (iA === -1 && iB === -1) return 0;
          if (iA === -1) return 1;
          if (iB === -1) return -1;
          return iA - iB;
        });
      };

      const reorderByName = (options, nameOrder) => {
        if (!options || !Array.isArray(options)) return options;
        return [...options].sort((a, b) => {
          const iA = nameOrder.indexOf(a.name);
          const iB = nameOrder.indexOf(b.name);
          if (iA === -1 && iB === -1) return 0;
          if (iA === -1) return 1;
          if (iB === -1) return -1;
          return iA - iB;
        });
      };

      const result = await this.getAllProducts();
      if (!result.success) return { success: false, error: 'Failed to fetch products' };

      let updatedCount = 0;

      for (const product of result.products) {
        if (!product.customizationOptions) continue;

        const opts = { ...product.customizationOptions };
        let changed = false;

        // Sauces
        if (opts.sauce?.options) {
          const isComposable = product.id === 'americain-double' || product.id === 'americain-simple';
          opts.sauce = { ...opts.sauce, options: reorderById(opts.sauce.options, isComposable ? sauceOrderReduced : sauceOrder) };
          changed = true;
        }

        // Boissons
        if (opts.boisson?.options) {
          opts.boisson = { ...opts.boisson, options: reorderById(opts.boisson.options, boissonOrder) };
          changed = true;
        }

        // Viandes (tacos/bowl)
        if (opts.viandes?.options) {
          const order = product.id === 'tacos-custom' ? viandeOrderTacos : viandeOrderBowl;
          opts.viandes = { ...opts.viandes, options: reorderById(opts.viandes.options, order) };
          changed = true;
        }

        // Viande (américains composables)
        if (opts.viande?.options) {
          opts.viande = { ...opts.viande, options: reorderById(opts.viande.options, viandeOrderAmericain) };
          changed = true;
        }

        // Fromage
        if (opts.fromage?.options) {
          opts.fromage = { ...opts.fromage, options: reorderById(opts.fromage.options, fromageOrder) };
          changed = true;
        }

        // Pizza choices (formules)
        for (const key of ['pizza1', 'pizza2', 'pizza3']) {
          if (opts[key]?.options) {
            opts[key] = { ...opts[key], options: reorderByName(opts[key].options, pizzaNameOrder) };
            changed = true;
          }
        }

        // Bowl supplements
        if (opts.supplement?.options && product.id === 'bowl-custom') {
          opts.supplement = { ...opts.supplement, options: reorderById(opts.supplement.options, bowlSupplOrder) };
          changed = true;
        }

        // Lasagnes: supprimé — remplacé par updateLasagnesPainOption

        if (changed) {
          const productRef = doc(db, this.collectionName, product.id);
          await setDoc(productRef, { customizationOptions: opts, updatedAt: serverTimestamp() }, { merge: true });
          updatedCount++;
        }
      }

      console.log(`✅ Reordered options for ${updatedCount} products in Firebase`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error reordering options:', error);
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
  // Migration: Mettre à jour la recette Pâtes 3 Fromages (cheddar, emmental, parmesan)
  async updatePates3FromagesRecipe() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);

      let updated = false;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id === '5' && data.category === 'pates') {
          // Vérifier si déjà migré
          if (data.description && data.description.includes('Cheddar')) {
            console.log('✅ Pâtes 3 Fromages recipe already updated');
            return { success: true, alreadyDone: true };
          }

          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            description: 'Penne, Sauce 3 fromages, Cheddar, Emmental, Parmesan.',
            updatedAt: serverTimestamp()
          });

          console.log('✅ Pâtes 3 Fromages recipe updated to: Cheddar, Emmental, Parmesan');
          updated = true;
          break;
        }
      }

      if (!updated) {
        console.log('⚠️ Pâtes 3 Fromages not found in Firebase');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating Pâtes 3 Fromages recipe:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Mise à jour des prix (salade verte, capri sun, cristalline, redbull, monster, pain) + renommer œufs au plat → cristalline
  async updateVariousPricesFeb2026() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let updates = {};

        // Standalone BOISSONS price changes
        if (data.id === 'capri-sun' && data.price !== 1.50) {
          updates.price = 1.50;
        }
        if (data.id === 'cristalline' && data.price !== 1.50) {
          updates.price = 1.50;
        }
        if (data.id === 'redbull' && data.price !== 3.00) {
          updates.price = 3.00;
        }
        if (data.id === 'monster' && data.price !== 3.50) {
          updates.price = 3.50;
        }

        // Pain standalone → 0.50
        if (data.name && data.name.toLowerCase() === 'pain' && data.price !== 0.50) {
          updates.price = 0.50;
        }

        // Salade verte standalone → 1.50
        if (data.name && data.name.toLowerCase() === 'salade verte' && data.price !== 1.50) {
          updates.price = 1.50;
        }

        // Rename "Œufs au plat" or "Oeuf au plat" → "Cristalline" at 1.50
        if (data.name && (data.name.toLowerCase().includes('oeuf') || data.name.toLowerCase().includes('œuf')) && data.name.toLowerCase().includes('plat')) {
          updates.name = 'Cristalline';
          updates.price = 1.50;
        }

        // Update salade verte option price in lasagnes customization options
        if (data.customizationOptions) {
          let optionsChanged = false;
          const updatedOptions = { ...data.customizationOptions };

          for (const [catKey, cat] of Object.entries(updatedOptions)) {
            if (cat && cat.options) {
              const newOpts = cat.options.map(opt => {
                if (opt.name === 'Salade verte' && opt.price !== 1.50) {
                  optionsChanged = true;
                  return { ...opt, price: 1.50 };
                }
                return opt;
              });
              if (optionsChanged) {
                updatedOptions[catKey] = { ...cat, options: newOpts };
              }
            }
          }

          if (optionsChanged) {
            updates.customizationOptions = updatedOptions;
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
          console.log(`✅ Updated ${data.name || data.id}:`, Object.keys(updates).filter(k => k !== 'updatedAt').join(', '));
          updatedCount++;
        }
      }

      console.log(`✅ Price update migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in price update migration:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Ajouter les suppléments aux pâtes (oeuf, oignons, bacon, légumes, cordon-bleu, tender, steak)
  async addSupplementsToPates() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const patesSupplements = {
        title: 'Suppléments',
        subtitle: 'Ajoutez des extras à vos pâtes.',
        required: false,
        multiSelect: true,
        options: [
          { id: 'oeuf-pate', name: 'Oeuf', price: 1.00 },
          { id: 'oignon-pate', name: 'Oignons', price: 1.00 },
          { id: 'oignon-frit-pate', name: 'Oignons frits', price: 1.00 },
          { id: 'bacon-pate', name: 'Bacon', price: 1.50 },
          { id: 'legumes-pate', name: 'Légumes', price: 1.00 },
          { id: 'sauce-pate', name: 'Sauce', price: 1.50 },
          { id: 'pain-pate', name: 'Pain', price: 1.00 },
          { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
          { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
          { id: 'cordon-bleu-pate', name: 'Cordon-bleu', price: 2.50 },
          { id: 'tender-pate', name: 'Tender', price: 2.50 },
          { id: 'steak-pate', name: 'Steak', price: 2.50 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Cibler les pâtes (id 1-6, category pates)
        if (data.category === 'pates' && ['1', '2', '3', '4', '5', '6'].includes(data.id)) {
          // Vérifier si déjà migré (avec la version complète incluant sauce-pate)
          const existingSupps = data.customizationOptions?.supplements;
          if (existingSupps?.options?.some(o => o.id === 'sauce-pate')) {
            console.log(`✅ ${data.name} already has updated supplements`);
            continue;
          }

          const updatedOptions = {
            ...(data.customizationOptions || {}),
            supplements: patesSupplements
          };

          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            customizable: true,
            customizationOptions: updatedOptions,
            updatedAt: serverTimestamp()
          });

          console.log(`✅ Added supplements to ${data.name}`);
          updatedCount++;
        }
      }

      console.log(`✅ Pâtes supplements migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error adding supplements to pâtes:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync: Récupérer les prix des frites depuis la catégorie frites_garnies et les appliquer aux options de tous les menus
  async updateFritesOptions() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      // 1. Récupérer les produits frites depuis la catégorie frites_garnies dans Firebase
      const fritesQuery = query(
        productsRef,
        where('category', '==', 'frites_garnies'),
        where('active', '==', true)
      );
      const fritesSnapshot = await getDocs(fritesQuery);
      const fritesProducts = fritesSnapshot.docs.map(d => d.data());

      // Mapping entre les IDs de produits frites et les IDs d'options dans les menus
      const fritesMapping = {
        'frites2': { id: 'frites-normales', name: 'Frites normales', popular: true },
        'frites4': { id: 'frites-cheddar', name: 'Frites Cheddar' },
        'frites5': { id: 'frites-fromagere', name: 'Frites fromagère' },
        'frites3': { id: 'frites-cheddar-bacon', name: 'Frites Cheddar bacon' },
        'frites7': { id: 'frites-fromagere-bacon', name: 'Frites fromagère bacon' },
        'frites6': { id: 'frites-cheddar-oignons', name: 'Frites Cheddar oignons frits' },
        'frites8': { id: 'frites-fromagere-oignons', name: 'Frites fromagère oignons frits' },
        'frites1': { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar bacon oignons frits' },
        'frites9': { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons frits' },
      };

      // 2. Construire les options frites dynamiquement à partir des prix Firebase
      const fritesOptions = [
        { id: 'frites-non', name: 'Pas de frites', price: 0.00 }
      ];

      for (const fritesProd of fritesProducts) {
        const mapping = fritesMapping[fritesProd.id];
        if (mapping) {
          // Frites normales à 1€ en option menu (le prix Firebase est le prix vendu seul)
          const menuPrice = (fritesProd.id === 'frites2') ? 1.00 : (fritesProd.price || 0);
          const option = {
            id: mapping.id,
            name: mapping.name,
            price: menuPrice
          };
          if (mapping.popular) {
            option.popular = true;
          }
          fritesOptions.push(option);
        }
      }

      // Trier les options par prix croissant (après "Pas de frites")
      const pasDefrites = fritesOptions.shift();
      fritesOptions.sort((a, b) => a.price - b.price);
      fritesOptions.unshift(pasDefrites);

      // Si aucun produit frites trouvé dans Firebase, ne rien faire
      if (fritesOptions.length <= 1) {
        console.log('⚠️ Aucun produit frites trouvé dans la catégorie frites_garnies');
        return { success: true, updatedCount: 0 };
      }

      const newFritesBlock = {
        title: 'Frites',
        required: false,
        multiSelect: false,
        maxSelections: 1,
        options: fritesOptions
      };

      console.log('🍟 Prix frites depuis Firebase:', fritesOptions.map(o => `${o.name}: ${o.price}€`).join(', '));

      // 3. Appliquer à tous les produits qui ont une option frites OU qui sont des tacos (ajout frites)
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        const hasFrites = data.customizationOptions?.frites;
        const isTacos = data.category === 'tacos' || (data.name && data.name.toLowerCase().includes('tacos'));
        const isPizzdwich = data.category === 'pizzdwich';

        if (hasFrites || ((isTacos || isPizzdwich) && data.customizationOptions)) {
          if (hasFrites) {
            // Vérifier si les prix sont déjà identiques
            const currentOptions = data.customizationOptions.frites.options || [];
            const pricesMatch = fritesOptions.length === currentOptions.length &&
              fritesOptions.every(newOpt => {
                const existing = currentOptions.find(o => o.id === newOpt.id);
                return existing && existing.price === newOpt.price;
              });

            if (pricesMatch) {
              continue;
            }
          }

          // Dot notation pour ne pas écraser les autres sections
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.frites': newFritesBlock,
            updatedAt: serverTimestamp()
          });

          console.log(`✅ Synced frites prices for ${data.name}`);
          updatedCount++;
        }
      }

      console.log(`✅ Frites sync complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error syncing frites options:', error);
      return { success: false, error: error.message };
    }
  }

  async addSupplementsToTacos() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const supplementsBlock = {
        title: 'Suppléments',
        subtitle: 'Ajoutez des extras à votre tacos.',
        required: false,
        multiSelect: true,
        options: [
          { id: 'chevre-tacos', name: 'Chèvre', price: 1.00 },
          { id: 'emmental-tacos', name: 'Emmental', price: 1.00 },
          { id: 'mozzarella-tacos', name: 'Mozzarella', price: 1.00 },
          { id: 'parmesan-tacos', name: 'Parmesan', price: 1.00 },
          { id: 'raclette-tacos', name: 'Raclette', price: 1.00 },
          { id: 'sauce-fromagere-tacos', name: 'Sauce fromagère', price: 1.00 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Cibler uniquement le tacos (catégorie tacos)
        if (data.category === 'tacos' && data.customizationOptions) {
          // Vérifier si déjà migré
          const hasSupplements = data.customizationOptions.supplements?.options?.some(o => o.id === 'chevre-tacos');
          if (hasSupplements) {
            continue;
          }

          const updatedOptions = {
            ...data.customizationOptions,
            supplements: supplementsBlock
          };

          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            customizationOptions: updatedOptions,
            updatedAt: serverTimestamp()
          });

          console.log(`✅ Added supplements to tacos: ${data.name}`);
          updatedCount++;
        }
      }

      console.log(`✅ Tacos supplements migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error adding supplements to tacos:', error);
      return { success: false, error: error.message };
    }
  }

  async addToppingsToPizzaBriochee() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const customizationOptions = {
        gout: {
          title: 'Choix du goût',
          subtitle: 'Choisissez votre topping préféré.',
          required: true,
          minSelections: 1,
          maxSelections: 1,
          options: [
            { id: 'nutella', name: 'Nutella', price: 0 },
            { id: 'caramel', name: 'Caramel', price: 0 }
          ]
        },
        topping: {
          title: 'Topping',
          subtitle: 'Ajoutez jusqu\'à 3 toppings.',
          required: false,
          minSelections: 0,
          maxSelections: 3,
          options: [
            { id: 'kinder-bueno', name: 'Kinder Bueno', price: 1.00 },
            { id: 'kinder-bueno-white', name: 'Kinder Bueno White', price: 1.00 },
            { id: 'kinder-country', name: 'Kinder Country', price: 1.00 },
            { id: 'oreo', name: 'Oreo', price: 1.00 },
            { id: 'mms', name: 'M&M\'s', price: 1.00 },
            { id: 'speculoos', name: 'Speculoos', price: 1.00 },
            { id: 'banane', name: 'Banane', price: 1.00 }
          ]
        },
        supplement: {
          title: 'Supplément',
          subtitle: 'Ajoutez de la chantilly.',
          required: false,
          minSelections: 0,
          maxSelections: 1,
          options: [
            { id: 'chantilly', name: 'Chantilly', price: 0.50 }
          ]
        }
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (data.id === 'dessert8') {
          // Vérifier si déjà migré
          if (data.customizationOptions?.topping) {
            continue;
          }

          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            customizable: true,
            customizationOptions: customizationOptions,
            updatedAt: serverTimestamp()
          });

          console.log(`✅ Added toppings to Pizza briochée`);
          updatedCount++;
        }
      }

      console.log(`✅ Pizza briochée toppings migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error adding toppings to pizza briochée:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteRemovedPizzas() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      const pizzasToDelete = ['pizza19', 'pizza20', 'pizza21', 'pizza22'];
      const pizzaNamesToDelete = ['pizza chorizo', 'pizza poulet raclette', 'pizza kebab chèvre'];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const shouldDelete = pizzasToDelete.includes(data.id) ||
          pizzasToDelete.includes(docSnap.id) ||
          pizzaNamesToDelete.includes((data.name || '').toLowerCase());

        if (shouldDelete) {
          await deleteDoc(doc(db, this.collectionName, docSnap.id));
          console.log(`🗑️ Deleted pizza: ${data.name || docSnap.id} (doc: ${docSnap.id}, data.id: ${data.id})`);
        }
      }

      // Aussi nettoyer les options chorizo/poulet-raclette/kebab-chevre des formules
      const formulesIds = ['formule-pizza-duo', 'formule-pizza-trio'];
      const optionIdsToRemove = ['pizza-chorizo', 'pizza-poulet-raclette', 'pizza-kebab-chevre'];

      for (const formuleId of formulesIds) {
        const formuleDoc = snapshot.docs.find(d => d.id === formuleId || d.data().id === formuleId);
        if (formuleDoc) {
          const data = formuleDoc.data();
          const updatedOptions = { ...data.customizationOptions };
          let needsUpdate = false;

          for (const [key, section] of Object.entries(updatedOptions)) {
            if (section && section.options && Array.isArray(section.options)) {
              const filtered = section.options.filter(opt =>
                !optionIdsToRemove.some(removeId => (opt.id || '').includes(removeId))
              );
              if (filtered.length !== section.options.length) {
                updatedOptions[key] = { ...section, options: filtered };
                needsUpdate = true;
              }
            }
          }

          if (needsUpdate) {
            const docRef = doc(db, this.collectionName, formuleDoc.id);
            await updateDoc(docRef, {
              customizationOptions: updatedOptions,
              updatedAt: serverTimestamp()
            });
            console.log(`✅ Cleaned pizza options from formule: ${formuleId}`);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting pizzas:', error);
      return { success: false, error: error.message };
    }
  }

  async addPizzaComposee() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);

      // Vérifier si déjà existante (par id ou par nom)
      const existingDocs = snapshot.docs.filter(d => {
        const data = d.data();
        return data.id === 'pizza-composee' ||
          d.id === 'pizza-composee' ||
          (data.name || '').toLowerCase() === 'pizza à composer';
      });

      // Supprimer les doublons s'il y en a plusieurs
      if (existingDocs.length > 1) {
        console.log(`🗑️ Found ${existingDocs.length} duplicates of Pizza à composer, cleaning up...`);
        // Garder le premier, supprimer les autres
        for (let i = 1; i < existingDocs.length; i++) {
          await deleteDoc(doc(db, this.collectionName, existingDocs[i].id));
          console.log(`🗑️ Deleted duplicate pizza-composee: ${existingDocs[i].id}`);
        }
      }

      if (existingDocs.length >= 1) {
        console.log('⏭️ Pizza à composer already exists, skipping');
        return { success: true, skipped: true };
      }

      const pizzaComposee = {
        id: 'pizza-composee',
        name: 'Pizza à composer',
        description: 'Composez votre pizza selon vos envies : base, viande, crudités, fromage et suppléments.',
        price: 9.50,
        category: 'pizza',
        popular: true,
        sizes: {
          'M': { name: 'M (1 viande)', price: 9.50 },
          'L': { name: 'L (2 viandes)', price: 10.50 },
          'XL': { name: 'XL (3 viandes)', price: 11.50 }
        },
        customizable: true,
        customizationOptions: {
          taille: {
            title: 'Taille de la pizza',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'pizza-29cm', name: '29 cm', price: 0 },
              { id: 'pizza-33cm', name: '33 cm', price: 3.00 }
            ]
          },
          base: {
            title: 'Choix de la base',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'base-creme', name: 'Crème', price: 0 },
              { id: 'base-tomate', name: 'Tomate', price: 0 }
            ]
          },
          viandes: {
            title: 'Choix des viandes',
            subtitle: 'Nombre de viandes selon la taille choisie.',
            required: true,
            minSelections: 1,
            maxSelections: 3,
            options: [
              { id: 'kebab-pizza', name: 'Kebab', price: 0 },
              { id: 'steak-pizza', name: 'Steak', price: 0 },
              { id: 'poulet-pizza', name: 'Poulet', price: 0 },
              { id: 'merguez-pizza', name: 'Merguez', price: 0 },
              { id: 'pepperoni-pizza', name: 'Pepperoni', price: 0 },
              { id: 'lardon-pizza', name: 'Lardon', price: 0 }
            ]
          },
          crudites: {
            title: 'Crudités',
            subtitle: 'Choisissez jusqu\'à 2 crudités.',
            required: false,
            minSelections: 0,
            maxSelections: 2,
            options: [
              { id: 'poivron-pizza', name: 'Poivron', price: 0 },
              { id: 'oignons-rouges-pizza', name: 'Oignons rouges', price: 0 },
              { id: 'champignons-pizza', name: 'Champignons', price: 0 },
              { id: 'pomme-de-terre-pizza', name: 'Pomme de terre', price: 0 },
              { id: 'olive-pizza', name: 'Olive', price: 0 }
            ]
          },
          fromages: {
            title: 'Fromage',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'raclette-pizza', name: 'Raclette', price: 0 },
              { id: 'chevre-pizza', name: 'Chèvre', price: 0 },
              { id: 'cheddar-pizza', name: 'Cheddar', price: 0 },
              { id: 'mozza-pizza', name: 'Mozzarella', price: 0 },
              { id: 'parmesan-pizza', name: 'Parmesan', price: 0 },
              { id: 'emmental-pizza', name: 'Emmental', price: 0 },
              { id: 'vache-qui-rit-pizza', name: 'Vache qui rit / Kiri', price: 0 }
            ]
          },
          supplements: {
            title: 'Suppléments',
            subtitle: '1€ par supplément.',
            required: false,
            multiSelect: true,
            options: [
              { id: 'oeuf-pizza', name: 'Oeuf', price: 1.00 },
              { id: 'boursin-pizza', name: 'Boursin', price: 1.00 },
              { id: 'bacon-pizza', name: 'Bacon', price: 1.00 },
              { id: 'oignons-frits-pizza', name: 'Oignons frits', price: 1.00 },
              { id: 'frites-pizza', name: 'Frites', price: 1.00 }
            ]
          },
          boisson: {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre plat.',
            required: false,
            maxSelections: 1,
            options: [
              { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
              { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
              { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
              { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
              { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
              { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
              { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
              { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
              { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
              { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
              { id: 'sprite', name: 'Sprite', price: 2.00 },
              { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
              { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
              { id: 'orangina', name: 'Orangina', price: 2.00 },
              { id: 'schweppes', name: 'Schweppes', price: 2.00 },
              { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
              { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
              { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
              { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
              { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
              { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
              { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
              { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
              { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
              { id: 'hawai', name: 'Hawaï', price: 2.00 },
              { id: 'tropico', name: 'Tropico', price: 2.00 },
              { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
              { id: 'bissap', name: 'Bissap', price: 2.00 },
              { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
              { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
              { id: 'redbull', name: 'Redbull', price: 2.50 },
              { id: 'monster', name: 'Monster', price: 2.50 }
            ]
          }
        },
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = doc(db, this.collectionName, 'pizza-composee');
      await setDoc(docRef, pizzaComposee);

      console.log('✅ Pizza à composer added to Firebase with ID: pizza-composee');
      return { success: true, id: 'pizza-composee' };
    } catch (error) {
      console.error('❌ Error adding pizza à composer:', error);
      return { success: false, error: error.message };
    }
  }

  async addOasisFraiseFramboise() {
    try {
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);

      const exists = snapshot.docs.some(d => d.data().id === 'oasis-fraise-framboise' && d.data().sizes);
      if (exists) {
        console.log('⏭️ Oasis Fraise Framboise with sizes already exists, skipping');
        return { success: true, skipped: true };
      }

      // Chercher si une version sans tailles existe déjà
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id === 'oasis-fraise-framboise' && !data.sizes) {
          // Mettre à jour avec les tailles
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            description: 'Cannette 33 cl ou Bouteille 2L.',
            sizes: {
              'Cannette': { name: 'Cannette 33cl', price: 2.00 },
              'Bouteille': { name: 'Bouteille 2L', price: 4.50 }
            },
            updatedAt: serverTimestamp()
          });
          console.log('✅ Oasis Fraise Framboise updated with sizes');
          return { success: true };
        }
      }

      // Sinon créer le produit avec setDoc et ID fixe
      const product = {
        id: 'oasis-fraise-framboise',
        name: 'Oasis Fraise Framboise',
        description: 'Cannette 33 cl ou Bouteille 2L.',
        price: 2.00,
        category: 'boissons',
        popular: false,
        sizes: {
          'Cannette': { name: 'Cannette 33cl', price: 2.00 },
          'Bouteille': { name: 'Bouteille 2L', price: 4.50 }
        },
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, this.collectionName, 'oasis-fraise-framboise'), product);

      console.log('✅ Oasis Fraise Framboise added to Firebase');
      return { success: true, id: 'oasis-fraise-framboise' };
    } catch (error) {
      console.error('❌ Error adding Oasis Fraise Framboise:', error);
      return { success: false, error: error.message };
    }
  }
  // Migration: Fix Américain prices (7.50 simple / 9.50 double) + steak supplement (2€ par steak supplémentaire) dans tous les burgers
  async fixAmericainAndSteakPrices() {
    try {
      console.log('🔄 Fixing Américain prices and steak supplement prices...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let updates = {};

        // Fix Américain Simple → 7.50€
        if (data.id === 'americain-simple' && data.price !== 7.50) {
          updates.price = 7.50;
        }

        // Fix Bacon B burger → Bacon Burger
        if (data.id === 'burger7' && data.name && data.name.includes('Bacon B')) {
          updates.name = 'Bacon Burger';
        }

        // Fix Américain Double → 9.50€
        if (data.id === 'americain-double' && data.price !== 9.50) {
          updates.price = 9.50;
        }

        // Fix sauce Boursin → 0.50€ (au lieu de 1€) — dot notation pour ne pas écraser les autres sections
        if (data.customizationOptions?.sauce?.options) {
          let sauceChanged = false;
          const updatedSauceOpts = data.customizationOptions.sauce.options.map(opt => {
            if ((opt.id === 'boursin' || opt.id === 'boursin-sauce') && opt.price !== 0.50) {
              sauceChanged = true;
              return { ...opt, price: 0.50 };
            }
            return opt;
          });
          if (sauceChanged) {
            updates['customizationOptions.sauce.options'] = updatedSauceOpts;
          }
        }

        // Fix steak supplement prices in all burger customizationOptions — dot notation
        if (data.customizationOptions?.steak?.options) {
          let steakChanged = false;
          const updatedSteakOpts = data.customizationOptions.steak.options.map(opt => {
            if (opt.id === 'double-steak' && opt.price !== 2.00) {
              steakChanged = true;
              return { ...opt, price: 2.00 };
            }
            if (opt.id === 'triple-steak' && opt.price !== 4.00) {
              steakChanged = true;
              return { ...opt, price: 4.00 };
            }
            return opt;
          });

          if (steakChanged) {
            updates['customizationOptions.steak.options'] = updatedSteakOpts;
          }
        }

        // Fix Menu Kids sauce: seulement Ketchup, Mayonnaise, Biggy, Barbecue (max 2)
        if (data.category === 'menu_kids' && data.customizationOptions?.sauce) {
          updates['customizationOptions.sauce'] = {
            title: 'Vous souhaitez commander :',
            required: false,
            multiSelect: true,
            minSelections: 0,
            maxSelections: 2,
            options: [
              { id: 'ketchup', name: 'Ketchup', price: 0.00 },
              { id: 'mayonnaise', name: 'Mayonnaise', price: 0.00 },
              { id: 'biggy-burger', name: 'Biggy', price: 0.00 },
              { id: 'barbecue', name: 'Barbecue', price: 0.00 }
            ]
          };
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
          console.log(`✅ Updated ${data.name || data.id}:`, Object.keys(updates).filter(k => k !== 'updatedAt').join(', '));
          updatedCount++;
        }
      }

      console.log(`✅ Américain & steak prices migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in fixAmericainAndSteakPrices:', error);
      return { success: false, error: error.message };
    }
  }
  // Migration: Forcer Tenders à 0.50€ dans toutes les options viandes/viande de tous les produits
  async fixTendersPrice() {
    try {
      console.log('🔄 Fixing Tenders price to 0.50€ on all products...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const updates = {};

        // Vérifier viandes (pluriel - tacos, etc.)
        if (data.customizationOptions?.viandes?.options) {
          let changed = false;
          const newOpts = data.customizationOptions.viandes.options.map(opt => {
            if (opt.id === 'tenders' && opt.price !== 0.50) {
              changed = true;
              return { ...opt, price: 0.50 };
            }
            return opt;
          });
          if (changed) {
            updates['customizationOptions.viandes.options'] = newOpts;
          }
        }

        // Vérifier viande (singulier - sandwich compose, etc.)
        if (data.customizationOptions?.viande?.options) {
          let changed = false;
          const newOpts = data.customizationOptions.viande.options.map(opt => {
            if (opt.id === 'tenders' && opt.price !== 0.50) {
              changed = true;
              return { ...opt, price: 0.50 };
            }
            return opt;
          });
          if (changed) {
            updates['customizationOptions.viande.options'] = newOpts;
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
          console.log(`✅ Fixed Tenders price for ${data.name || data.id}`);
          updatedCount++;
        }
      }

      console.log(`✅ Tenders price fix complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in fixTendersPrice:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Mettre à jour les suppléments des tacos pour correspondre à la borne
  async updateTacosSupplements() {
    try {
      console.log('🔄 Updating tacos supplements to match borne...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const newSupplements = {
        title: 'Suppléments',
        subtitle: 'Maximum 10.',
        required: false,
        multiSelect: true,
        maxSelections: 10,
        options: [
          { id: 'sauce-fromagere-tacos', name: 'Sauce fromagère', price: 0.50 },
          { id: 'cheddar-tacos', name: 'Cheddar', price: 1.00 },
          { id: 'boursin-tacos', name: 'Boursin', price: 1.00 },
          { id: 'raclette-tacos', name: 'Raclette', price: 1.00 },
          { id: 'chevre-tacos', name: 'Chèvre', price: 1.00 },
          { id: 'parmesan-tacos', name: 'Parmesan', price: 1.00 },
          { id: 'emmental-tacos', name: 'Emmental', price: 1.00 },
          { id: 'vache-qui-rit-tacos', name: 'Vache qui rit', price: 1.00 },
          { id: 'toastinette-tacos', name: 'Toastinette', price: 1.00 },
          { id: 'oignons-frits-tacos', name: 'Oignons frits', price: 1.00 },
          { id: 'bacon-tacos', name: 'Bacon', price: 1.00 },
          { id: 'oeuf-tacos', name: 'Œuf', price: 1.00 },
          { id: 'salade-tacos', name: 'Salade', price: 0.50 },
          { id: 'tomate-tacos', name: 'Tomate', price: 0.50 },
          { id: 'oignon-rouge-tacos', name: 'Oignon rouge', price: 0.50 },
          { id: 'poivron-grille-tacos', name: 'Poivron grillé', price: 1.00 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Cibler par catégorie OU par nom (l'id Firestore est auto-généré)
        if (!(data.category === 'tacos' || (data.name && data.name.toLowerCase().includes('tacos')))) continue;
        if (!data.customizationOptions) continue;

        // Retirer Boursin de la section sauce + ajouter suppléments (frites gérées par updateFritesOptions)
        const updatePayload = {
          'customizationOptions.supplements': newSupplements,
          updatedAt: serverTimestamp()
        };

        if (data.customizationOptions?.sauce?.options) {
          // Retirer Boursin de la sauce
          let sauceOpts = data.customizationOptions.sauce.options.filter(
            opt => opt.id !== 'boursin-sauce' && opt.id !== 'boursin'
          );
          // Ajouter "Pas de fromagère dans le Tacos" en premier si absent
          if (!sauceOpts.some(opt => opt.id === 'pas-sauce-fromagere-tacos')) {
            sauceOpts = [
              { id: 'pas-sauce-fromagere-tacos', name: 'Pas de fromagère dans le Tacos', price: 0 },
              ...sauceOpts
            ];
          }
          updatePayload['customizationOptions.sauce.options'] = sauceOpts;
        }

        await updateDoc(doc(db, this.collectionName, docSnap.id), updatePayload);
        console.log(`✅ Updated tacos (supplements + frites + sauce cleanup) for ${data.name || data.id}`);
        updatedCount++;
      }

      console.log(`✅ Tacos supplements migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateTacosSupplements:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Mettre à jour les options du sandwich composé (americain-simple et americain-double) pour correspondre à la borne
  async updateSandwichComposeOptions() {
    try {
      console.log('🔄 Updating sandwich composé options to match borne...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const composableIds = ['americain-simple', 'americain-double'];

      // Options communes
      const painOptions = [
        { id: 'pain-rond', name: 'Pain Rond', price: 0 },
        { id: 'galette', name: 'Galette', price: 0 }
      ];

      const viandeOptions = [
        { id: 'steak', name: 'Steak', price: 0 },
        { id: 'escalope', name: 'Escalope', price: 0 },
        { id: 'escalope-boursin', name: 'Escalope Boursin', price: 0 },
        { id: 'kebab', name: 'Kebab', price: 0 },
        { id: 'cordon-bleu', name: 'Cordon Bleu', price: 0 },
        { id: 'merguez', name: 'Merguez', price: 0 },
        { id: 'nuggets', name: 'Nuggets', price: 0 },
        { id: 'falafel', name: 'Falafel', price: 0 },
        { id: 'tenders', name: 'Tenders', price: 0.50 }
      ];

      const cruditesOptions = [
        { id: 'salade', name: 'Salade', price: 0 },
        { id: 'tomate', name: 'Tomate', price: 0 },
        { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
        { id: 'cornichons', name: 'Cornichons', price: 1.00 },
        { id: 'poivron-grille', name: 'Poivron grillé', price: 1.00 },
        { id: 'oignon-frit', name: 'Oignons frits', price: 1.00 },
        { id: 'bacon', name: 'Bacon', price: 1.00 },
        { id: 'oeuf', name: 'Oeuf', price: 1.00 },
        { id: 'poulet-fume', name: 'Poulet fumé', price: 1.00 },
        { id: 'miel', name: 'Miel', price: 1.00 }
      ];

      const fromageOptions = [
        { id: 'emmental', name: 'Emmental', price: 1.00 },
        { id: 'cheddar', name: 'Cheddar', price: 1.00 },
        { id: 'raclette', name: 'Raclette', price: 1.00 },
        { id: 'chevre', name: 'Chèvre', price: 1.00 },
        { id: 'parmesan', name: 'Parmesan', price: 1.00 },
        { id: 'boursin', name: 'Boursin', price: 1.00 },
        { id: 'vache-kiri', name: 'Vache kiri', price: 1.00 }
      ];

      const sauceOptions = [
        { id: 'pas-sauce', name: 'Pas de sauce', price: 0 },
        { id: 'ketchup', name: 'Ketchup', price: 0 },
        { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
        { id: 'moutarde', name: 'Moutarde', price: 0 },
        { id: 'samourai', name: 'Samouraï', price: 0 },
        { id: 'algerienne', name: 'Algérienne', price: 0 },
        { id: 'biggy-burger', name: 'Biggy', price: 0 },
        { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
        { id: 'barbecue', name: 'Barbecue', price: 0 },
        { id: 'curry', name: 'Curry', price: 0 },
        { id: 'big-mac', name: 'Big Mac', price: 0 },
        { id: 'brazil', name: 'Brazil', price: 0 },
        { id: 'marocaine', name: 'Marocaine', price: 0 },
        { id: 'andalouse', name: 'Andalouse', price: 0 },
        { id: 'harissa', name: 'Harissa', price: 0 },
        { id: 'chili-tai', name: 'Chili Thaï', price: 0 },
        { id: 'boursin-sauce', name: 'Boursin', price: 0.50 }
      ];

      const fritesOptions = [
        { id: 'frites-non', name: 'Pas de frites', price: 0.00 },
        { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
        { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
        { id: 'frites-fromagere', name: 'Frites Fromagères', price: 3.00 },
        { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
        { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
        { id: 'frites-fromagere-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
        { id: 'frites-fromagere-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
        { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
        { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagères bacon oignons', price: 4.00 }
      ];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!composableIds.includes(data.id)) continue;

        const isSimple = data.id === 'americain-simple';

        const newOptions = {
          pain: {
            title: 'Choix du pain',
            subtitle: 'Choisissez-en 1.',
            required: true,
            maxSelections: 1,
            options: painOptions
          },
          viande: {
            title: 'Choix de votre viande',
            subtitle: isSimple ? 'Choisissez-en 1.' : 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: !isSimple,
            minSelections: 1,
            maxSelections: isSimple ? 1 : 2,
            options: viandeOptions
          },
          crudites: {
            title: 'Choix des crudités',
            subtitle: 'Jusqu\'à 3.',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: cruditesOptions
          },
          fromage: {
            title: 'Choix du fromage',
            subtitle: 'Jusqu\'à 1 fromage.',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: fromageOptions
          },
          sauce: {
            title: 'Choisissez jusqu\'à 2 sauces',
            subtitle: 'Choisissez-en de 1 à 2.',
            required: true,
            multiSelect: true,
            minSelections: 1,
            maxSelections: 2,
            options: sauceOptions
          },
          frites: {
            title: 'Souhaitez-vous des frites ?',
            required: false,
            multiSelect: false,
            maxSelections: 1,
            options: fritesOptions
          }
        };

        // Conserver la section boisson existante
        if (data.customizationOptions?.boisson) {
          newOptions.boisson = data.customizationOptions.boisson;
        }

        const updatePayload = {
          customizationOptions: newOptions,
          category: 'sandwich_compose',
          name: isSimple ? 'Sandwich Simple' : 'Sandwich Double',
          description: isSimple ? '1 viande' : '2 viandes au choix',
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, this.collectionName, docSnap.id), updatePayload);
        console.log(`✅ Updated ${data.name || data.id} → ${updatePayload.name} (sandwich_compose)`);
        updatedCount++;
      }

      console.log(`✅ Sandwich composé options migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateSandwichComposeOptions:', error);
      return { success: false, error: error.message };
    }
  }
  // Migration Tex-Mex: mettre à jour les prix, ajouter les x6 et Falafels, supprimer Sticks chèvre
  async updateTexMexProducts() {
    try {
      console.log('🔄 Updating Tex-Mex products...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      // Produits Tex-Mex attendus
      const texMexProducts = [
        { id: 'texmex2', name: 'Tenders x3', price: 5.00 },
        { id: 'texmex2-x6', name: 'Tenders x6', price: 8.00 },
        { id: 'texmex6', name: 'Nuggets x3', price: 3.50 },
        { id: 'texmex6-x6', name: 'Nuggets x6', price: 6.00 },
        { id: 'texmex3', name: 'Wings x3', price: 3.50 },
        { id: 'texmex3-x6', name: 'Wings x6', price: 6.00 },
        { id: 'texmex7', name: 'Bouchées Camembert x3', price: 3.50 },
        { id: 'texmex7-x6', name: 'Bouchées Camembert x6', price: 5.50 },
        { id: 'texmex1', name: 'Sticks Mozza x3', price: 3.50 },
        { id: 'texmex1-x6', name: 'Sticks Mozza x6', price: 5.50 },
        { id: 'texmex5', name: 'Chili Cheese x3', price: 3.50 },
        { id: 'texmex5-x6', name: 'Chili Cheese x6', price: 5.50 },
        { id: 'texmex8', name: 'Onions Rings x3', price: 2.00 },
        { id: 'texmex8-x6', name: 'Onions Rings x6', price: 3.00 },
        { id: 'texmex9', name: 'Falafels x3', price: 3.00 },
        { id: 'texmex9-x6', name: 'Falafels x6', price: 5.50 },
      ];

      // IDs des produits tex-mex valides
      const validIds = texMexProducts.map(p => p.id);

      // 1. Supprimer les produits tex-mex qui ne sont plus dans la liste (ex: Sticks chèvre texmex4)
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category === 'tex_mex' && data.id && data.id.startsWith('texmex') && !validIds.includes(data.id)) {
          await deleteDoc(doc(db, this.collectionName, docSnap.id));
          console.log(`🗑️ Deleted Tex-Mex product: ${data.name || data.id}`);
          updatedCount++;
        }
      }

      // 2. Ajouter ou mettre à jour chaque produit
      for (const product of texMexProducts) {
        // Chercher si le produit existe déjà
        const existing = snapshot.docs.find(d => {
          const data = d.data();
          return data.id === product.id || d.id === product.id;
        });

        if (existing) {
          // Mettre à jour prix et nom si nécessaire
          const data = existing.data();
          const updates = {};
          if (data.price !== product.price) {
            updates.price = product.price;
          }
          if (data.name !== product.name) {
            updates.name = product.name;
          }
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(doc(db, this.collectionName, existing.id), updates);
            console.log(`✅ Updated Tex-Mex: ${product.name} → ${product.price}€`);
            updatedCount++;
          }
        } else {
          // Ajouter le nouveau produit
          const newProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            category: 'tex_mex',
            description: product.name,
            customizable: false,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          const docRef = doc(db, this.collectionName, product.id);
          await setDoc(docRef, newProduct);
          console.log(`➕ Added Tex-Mex: ${product.name} (${product.price}€)`);
          updatedCount++;
        }
      }

      console.log(`✅ Tex-Mex migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateTexMexProducts:', error);
      return { success: false, error: error.message };
    }
  }
  // Migration Petites Faims: mettre à jour les prix et noms
  async updatePetitesFaimPrices() {
    try {
      console.log('🔄 Updating Petites Faim prices...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const priceUpdates = {
        'petitfaim1': { name: 'Hot Dog', price: 4.00 },
        'petitfaim2': { name: 'Croq', price: 4.00 },
        'petitfaim3': { name: 'Hot Dogs Cryspi', price: 4.50 },
        'petitfaim4': { name: "Double Pti' Cheese", price: 5.00 },
        'petitfaim5': { name: "Pti' Cheese", price: 4.00 },
        'petitfaim6': { name: 'Croq Chèvre Miel', price: 5.00 },
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category !== 'petites_faim') continue;

        const expected = priceUpdates[data.id];
        if (!expected) continue;

        const updates = {};
        if (data.price !== expected.price) {
          updates.price = expected.price;
        }
        if (data.name !== expected.name) {
          updates.name = expected.name;
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
          console.log(`✅ Updated Petites Faim: ${expected.name} → ${expected.price}€`);
          updatedCount++;
        }
      }

      console.log(`✅ Petites Faim prices migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updatePetitesFaimPrices:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration Salades: ajouter pain + boisson
  async addOptionsToSalades() {
    try {
      console.log('🔄 Adding pain + boisson options to salades...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const boissonOptions = [
        { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
        { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
        { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
        { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
        { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
        { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
        { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
        { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
        { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
        { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
        { id: 'sprite', name: 'Sprite', price: 2.00 },
        { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
        { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
        { id: 'orangina', name: 'Orangina', price: 2.00 },
        { id: 'schweppes', name: 'Schweppes', price: 2.00 },
        { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
        { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
        { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
        { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
        { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
        { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
        { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
        { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
        { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
        { id: 'hawai', name: 'Hawaï', price: 2.00 },
        { id: 'tropico', name: 'Tropico', price: 2.00 },
        { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
        { id: 'bissap', name: 'Bissap', price: 2.00 },
        { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
        { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
        { id: 'redbull', name: 'Redbull', price: 2.50 },
        { id: 'monster', name: 'Monster', price: 2.50 }
      ];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category !== 'salades') continue;

        // Vérifier si pain existe déjà
        if (data.customizationOptions?.pain) continue;

        const saladId = data.id || docSnap.id;
        const painOptions = [
          { id: `pas-de-pain-${saladId}`, name: 'Non, pas de pain merci', price: 0.00 },
          { id: `pain-${saladId}`, name: 'Oui, du pain svp', price: 0.50 },
        ];

        const updates = {
          customizable: true,
          'customizationOptions.pain': {
            title: 'Souhaitez du pain pour accompagner ?',
            required: true,
            multiSelect: false,
            minSelections: 1,
            maxSelections: 1,
            options: painOptions
          },
          'customizationOptions.boisson': {
            title: 'Boisson',
            subtitle: 'Ajoutez une boisson à votre salade.',
            required: false,
            maxSelections: 1,
            options: boissonOptions
          },
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
        console.log(`✅ Added pain + boisson to: ${data.name}`);
        updatedCount++;
      }

      console.log(`✅ Salades options migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in addOptionsToSalades:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration Desserts: prix + ajout Donuts et Hot dog sucré
  async updateDessertPrices() {
    try {
      console.log('🔄 Updating dessert prices...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const dessertPrices = {
        'tiramisu-du-moment': { price: 3.50 },
        'dessert4': { price: 3.00, name: 'Tarte au Daim' },
        'dessert5': { price: 4.50 },
        'milkshake-custom': { price: 5.00 },
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category !== 'desserts') continue;

        const expected = dessertPrices[data.id];
        if (!expected) continue;

        const updates = {};
        if (data.price !== expected.price) {
          updates.price = expected.price;
        }
        if (expected.name && data.name !== expected.name) {
          updates.name = expected.name;
        }

        // Fix milkshake options: boules + toppings gratuits
        if (data.id === 'milkshake-custom') {
          updates['customizationOptions.base.options'] = [
            { id: 'vanille', name: 'Vanille', price: 0 },
            { id: 'fraise', name: 'Fraise', price: 0 },
            { id: 'pistache', name: 'Pistache', price: 0 }
          ];
          updates['customizationOptions.supplement'] = {
            title: 'Vous souhaitez commander :',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'boule-vanille', name: 'Boule vanille', price: 1.00 },
              { id: 'boule-fraise', name: 'Boule fraise', price: 1.00 },
              { id: 'boule-pistache', name: 'Boule pistache', price: 1.00 }
            ]
          };
          updates['customizationOptions.topping'] = {
            title: 'Choix de topping',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'kinder-bueno', name: 'Kinder Bueno', price: 0 },
              { id: 'kinder-bueno-white', name: 'Kinder Bueno White', price: 0 },
              { id: 'kinder-country', name: 'Kinder Country', price: 0 },
              { id: 'oreo', name: 'Oreo', price: 0 },
              { id: 'mms', name: "M&M's", price: 0 },
              { id: 'speculoos', name: 'Speculoos', price: 0 },
              { id: 'banane', name: 'Banane', price: 0 }
            ]
          };
          updates['customizationOptions.supplements'] = {
            title: 'Suppléments de toppings',
            required: false,
            minSelections: 0,
            maxSelections: 10,
            options: [
              { id: 'sup-nutella', name: 'Nutella', price: 1.00 },
              { id: 'sup-kinder-bueno', name: 'Kinder Bueno', price: 1.00 },
              { id: 'sup-kinder-bueno-white', name: 'Kinder Bueno White', price: 1.00 },
              { id: 'sup-kinder-country', name: 'Kinder Country', price: 1.00 },
              { id: 'sup-oreo', name: 'Oreo', price: 1.00 },
              { id: 'sup-mms', name: "M&M's", price: 1.00 },
              { id: 'sup-speculoos', name: 'Speculoos', price: 1.00 },
              { id: 'sup-banane', name: 'Banane', price: 1.00 }
            ]
          };
          updates['customizationOptions.chantilly'] = {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
              { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
            ]
          };
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, docSnap.id), updates);
          console.log(`✅ Updated dessert: ${expected.name || data.name} → ${expected.price}€`);
          updatedCount++;
        }
      }

      // Ajouter Donuts si manquant
      const donutsExists = snapshot.docs.some(d => {
        const data = d.data();
        return data.id === 'dessert-donuts' || (data.name || '').toLowerCase() === 'donuts';
      });
      if (!donutsExists) {
        const docRef = doc(db, this.collectionName, 'dessert-donuts');
        await setDoc(docRef, {
          id: 'dessert-donuts',
          name: 'Donuts',
          description: 'Selon disposition du soir (kinder bueno, oréo, daim ...)',
          price: 3.50,
          category: 'desserts',
          customizable: false,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('➕ Added Donuts (3.50€)');
        updatedCount++;
      }

      // Ajouter Hot dog sucré si manquant
      const hotdogSucreExists = snapshot.docs.some(d => {
        const data = d.data();
        return data.id === 'dessert-hotdog-sucre' || (data.name || '').toLowerCase().includes('hot dog sucr');
      });
      if (!hotdogSucreExists) {
        const docRef = doc(db, this.collectionName, 'dessert-hotdog-sucre');
        await setDoc(docRef, {
          id: 'dessert-hotdog-sucre',
          name: 'Hot dog sucré',
          description: 'Hot dog sucré',
          price: 5.00,
          category: 'desserts',
          customizable: true,
          customizationOptions: {
            base: {
              title: 'Vous souhaitez commander :',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'banane', name: 'Banane', price: 0 },
                { id: 'kinder-bueno', name: 'Kinder bueno', price: 0 },
                { id: 'kinder-bueno-white', name: 'Kinder bueno white', price: 0 }
              ]
            },
            gout: {
              title: 'Choisis ton nappage',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'nutella', name: 'Nutella', price: 0 },
                { id: 'chocolat-noisette', name: 'Chocolat noisette', price: 0 },
                { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
                { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 },
                { id: 'creme-speculoos', name: 'Crème de spéculoos', price: 0 }
              ]
            },
            supplement: {
              title: 'Vous souhaitez commander :',
              required: false,
              minSelections: 0,
              maxSelections: 10,
              options: [
                { id: 'sup-kinder-bueno', name: 'Kinder bueno', price: 1.00 },
                { id: 'sup-kinder-bueno-white', name: 'Kinder bueno white', price: 1.00 },
                { id: 'sup-kinder-country', name: 'Kinder country', price: 1.00 },
                { id: 'sup-speculoos', name: 'Spéculoos', price: 1.00 },
                { id: 'sup-oreo', name: 'Oréo', price: 1.00 },
                { id: 'sup-mms', name: "M&M's", price: 1.00 }
              ]
            },
            chantilly: {
              title: 'Chantilly ?',
              required: false,
              minSelections: 0,
              maxSelections: 1,
              options: [
                { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
                { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
              ]
            }
          },
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('➕ Added Hot dog sucré (5.00€)');
        updatedCount++;
      }

      // Mettre à jour le hot dog sucré existant avec les options
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id === 'dessert-hotdog-sucre' && !data.customizationOptions?.base) {
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            customizable: true,
            'customizationOptions.base': {
              title: 'Vous souhaitez commander :',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'banane', name: 'Banane', price: 0 },
                { id: 'kinder-bueno', name: 'Kinder bueno', price: 0 },
                { id: 'kinder-bueno-white', name: 'Kinder bueno white', price: 0 }
              ]
            },
            'customizationOptions.gout': {
              title: 'Choisis ton nappage',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'nutella', name: 'Nutella', price: 0 },
                { id: 'chocolat-noisette', name: 'Chocolat noisette', price: 0 },
                { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
                { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 },
                { id: 'creme-speculoos', name: 'Crème de spéculoos', price: 0 }
              ]
            },
            'customizationOptions.supplement': {
              title: 'Vous souhaitez commander :',
              required: false,
              minSelections: 0,
              maxSelections: 10,
              options: [
                { id: 'sup-kinder-bueno', name: 'Kinder bueno', price: 1.00 },
                { id: 'sup-kinder-bueno-white', name: 'Kinder bueno white', price: 1.00 },
                { id: 'sup-kinder-country', name: 'Kinder country', price: 1.00 },
                { id: 'sup-speculoos', name: 'Spéculoos', price: 1.00 },
                { id: 'sup-oreo', name: 'Oréo', price: 1.00 },
                { id: 'sup-mms', name: "M&M's", price: 1.00 }
              ]
            },
            'customizationOptions.chantilly': {
              title: 'Chantilly ?',
              required: false,
              minSelections: 0,
              maxSelections: 1,
              options: [
                { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
                { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
              ]
            },
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated Hot dog sucré with customization options');
          updatedCount++;
        }
      }

      // Ajouter Gauffre gourmande si manquante
      const gauffreGourmandeExists = snapshot.docs.some(d => {
        const data = d.data();
        return data.id === 'dessert-gauffre-gourmande' || (data.name || '').toLowerCase().includes('gauffre gourmande');
      });
      if (!gauffreGourmandeExists) {
        const docRef = doc(db, this.collectionName, 'dessert-gauffre-gourmande');
        await setDoc(docRef, {
          id: 'dessert-gauffre-gourmande',
          name: 'Gauffre gourmande',
          description: "Gauffre nappage au choix et mélange de topping (kinder, oréo, m&m's ...)",
          price: 7.50,
          category: 'desserts',
          customizable: true,
          customizationOptions: {
            gout: {
              title: 'Fais ton choix',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'nutella', name: 'Nutella', price: 0 },
                { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
                { id: 'creme-speculoos', name: 'Crème de Speculoos', price: 0 },
                { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 }
              ]
            },
            chantilly: {
              title: 'Chantilly ?',
              required: false,
              minSelections: 0,
              maxSelections: 1,
              options: [
                { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
                { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
              ]
            }
          },
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('➕ Added Gauffre gourmande (7.50€)');
        updatedCount++;
      }

      // Supprimer les toppings de la gaufre simple (juste goût + chantilly)
      // + Mettre à jour la gauffre gourmande si elle a les anciens toppings
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id === 'dessert5' && data.customizationOptions?.topping) {
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.topping': null,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Removed toppings from Gaufre simple');
          updatedCount++;
        }
        if (data.id === 'dessert-gauffre-gourmande' && data.customizationOptions?.topping) {
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.gout': {
              title: 'Fais ton choix',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              options: [
                { id: 'nutella', name: 'Nutella', price: 0 },
                { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
                { id: 'creme-speculoos', name: 'Crème de Speculoos', price: 0 },
                { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 }
              ]
            },
            'customizationOptions.topping': null,
            'customizationOptions.supplement': null,
            'customizationOptions.chantilly': {
              title: 'Chantilly ?',
              required: false,
              minSelections: 0,
              maxSelections: 1,
              options: [
                { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
                { id: 'non-chantilly', name: 'Non, pas de chantilly merci', price: 0 }
              ]
            },
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated Gauffre gourmande options');
          updatedCount++;
        }
      }

      console.log(`✅ Desserts migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateDessertPrices:', error);
      return { success: false, error: error.message };
    }
  }

  async addPizzdwichProducts() {
    try {
      console.log('🔄 Adding Pizzdwich products...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const sauceOptions = [
        { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
        { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
        { id: 'ketchup', name: 'Ketchup', price: 0 },
        { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
        { id: 'algerienne', name: 'Algérienne', price: 0 },
        { id: 'samourai', name: 'Samouraï', price: 0 },
        { id: 'biggy-burger', name: 'Biggy', price: 0 },
        { id: 'barbecue', name: 'Barbecue', price: 0 },
        { id: 'brazil', name: 'Brazil', price: 0 },
        { id: 'big-mac', name: 'Big Mac', price: 0 },
        { id: 'curry', name: 'Curry', price: 0 },
        { id: 'marocaine', name: 'Marocaine', price: 0 },
        { id: 'andalouse', name: 'Andalouse', price: 0 },
        { id: 'moutarde', name: 'Moutarde', price: 0 },
        { id: 'chili-tai', name: 'Chili thaï', price: 0 },
        { id: 'harissa', name: 'Harissa', price: 0 },
        { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0 }
      ];

      const viandeOptions = [
        { id: 'poulet', name: 'Poulet', price: 0 },
        { id: 'kebab', name: 'Kebab', price: 0 },
        { id: 'merguez', name: 'Merguez', price: 0 },
        { id: 'steak', name: 'Steak', price: 0 },
        { id: 'falafel', name: 'Falafel', price: 0 },
        { id: 'tenders', name: 'Tenders', price: 0.50 },
        { id: 'kfta', name: 'Kfta', price: 0 },
        { id: 'cordon-bleu', name: 'Cordon bleu', price: 0 },
        { id: 'nuggets', name: 'Nuggets', price: 0 }
      ];

      const fritesOptions = [
        { id: 'frites-non', name: 'Pas de frites', price: 0 },
        { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
        { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
        { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
        { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
        { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
        { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
        { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
        { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
        { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
      ];

      const supplementsOptions = [
        { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
        { id: 'emmental', name: 'Emmental', price: 1.00 },
        { id: 'oeufs', name: 'Oeufs', price: 1.00 },
        { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
        { id: 'cheddar', name: 'Cheddar', price: 1.00 },
        { id: 'raclette', name: 'Raclette', price: 1.00 },
        { id: 'chevre', name: 'Chèvre', price: 1.00 },
        { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
        { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
        { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
        { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
        { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
        { id: 'bacon', name: 'Bacon', price: 1.00 }
      ];

      const boissonOptions = [
        { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0 },
        { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
        { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
        { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
        { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
        { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
        { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
        { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
        { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
        { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
        { id: 'sprite', name: 'Sprite', price: 2.00 },
        { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
        { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
        { id: 'orangina', name: 'Orangina', price: 2.00 },
        { id: 'schweppes', name: 'Schweppes', price: 2.00 },
        { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
        { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
        { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
        { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
        { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
        { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
        { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
        { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
        { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
        { id: 'hawai', name: 'Hawaï', price: 2.00 },
        { id: 'tropico', name: 'Tropico', price: 2.00 },
        { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
        { id: 'bissap', name: 'Bissap', price: 2.00 },
        { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
        { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
        { id: 'redbull', name: 'Redbull', price: 2.50 },
        { id: 'monster', name: 'Monster', price: 2.50 }
      ];

      const customizationOptions = {
        sauce: {
          title: 'Sauce',
          required: true,
          multiSelect: true,
          minSelections: 1,
          maxSelections: 3,
          options: sauceOptions
        },
        viande: {
          title: 'Chois ta viande',
          required: true,
          multiSelect: false,
          minSelections: 1,
          maxSelections: 1,
          options: viandeOptions
        },
        crudites: {
          title: 'Fais ton choix',
          required: true,
          multiSelect: true,
          minSelections: 1,
          maxSelections: 3,
          options: [
            { id: 'salade', name: 'Salade', price: 0 },
            { id: 'tomate', name: 'Tomate', price: 0 },
            { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
            { id: 'sans-crudites', name: 'Sans crudités', price: 0 }
          ]
        },
        frites: {
          title: 'Souhaitez-vous des frites ?',
          required: false,
          multiSelect: false,
          maxSelections: 1,
          options: fritesOptions
        },
        supplements: {
          title: 'Vous souhaitez commander :',
          required: false,
          multiSelect: true,
          minSelections: 0,
          maxSelections: 3,
          options: supplementsOptions
        },
        boisson: {
          title: 'Boisson',
          subtitle: 'Ajoutez une boisson.',
          required: false,
          maxSelections: 1,
          options: boissonOptions
        }
      };

      const pizzdwichProducts = [
        { id: 'pizzdwich-m', name: 'Pizzdwich M', price: 7.50, order: 1 },
        { id: 'pizzdwich-l', name: 'Pizzdwich L', price: 9.50, order: 2 },
        { id: 'pizzdwich-xl', name: 'Pizzdwich XL', price: 11.50, order: 3 },
      ];

      for (const product of pizzdwichProducts) {
        const existing = snapshot.docs.find(d => {
          const data = d.data();
          return data.id === product.id || d.id === product.id;
        });

        if (existing) {
          // Supprimer explicitement crudites avec deleteField puis réécrire tout
          await updateDoc(doc(db, this.collectionName, existing.id), {
            'customizationOptions.crudites': deleteField()
          });
          // Puis forcer la mise à jour complète
          await updateDoc(doc(db, this.collectionName, existing.id), {
            price: product.price,
            name: product.name,
            order: product.order,
            image: 'pizzdwich',
            customizable: true,
            customizationOptions,
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Updated Pizzdwich: ${product.name} → ${product.price}€`);
          updatedCount++;
        } else {
          const newProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            order: product.order,
            image: 'pizzdwich',
            category: 'pizzdwich',
            description: 'Pizzdwich garni sauce et crudités au choix',
            customizable: true,
            customizationOptions,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          const docRef = doc(db, this.collectionName, product.id);
          await setDoc(docRef, newProduct);
          console.log(`➕ Added Pizzdwich: ${product.name} (${product.price}€)`);
          updatedCount++;
        }
      }

      console.log(`✅ Pizzdwich migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in addPizzdwichProducts:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter les options de crudités aux pizzdwich (juste avant les frites)
  async addCruditesToPizzdwich() {
    try {
      console.log('🔄 Adding crudites options to Pizzdwich products...');
      const productsRef = collection(db, this.collectionName);
      const q = query(productsRef, where('category', '==', 'pizzdwich'));
      const snapshot = await getDocs(q);
      let updatedCount = 0;

      const cruditesOption = {
        title: 'Fais ton choix',
        required: true,
        multiSelect: true,
        minSelections: 1,
        maxSelections: 3,
        options: [
          { id: 'salade', name: 'Salade', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
          { id: 'sans-crudites', name: 'Sans crudités', price: 0 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.customizationOptions) continue;

        // Reconstruire customizationOptions dans le bon ordre : sauce, viande, crudites, frites, supplements, boisson
        const oldOpts = data.customizationOptions;
        const newOpts = {};
        if (oldOpts.sauce) newOpts.sauce = oldOpts.sauce;
        if (oldOpts.viande) newOpts.viande = oldOpts.viande;
        newOpts.crudites = cruditesOption;
        if (oldOpts.frites) newOpts.frites = oldOpts.frites;
        if (oldOpts.supplements) newOpts.supplements = oldOpts.supplements;
        if (oldOpts.boisson) newOpts.boisson = oldOpts.boisson;

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          customizationOptions: newOpts,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added crudites to Pizzdwich: ${data.name}`);
        updatedCount++;
      }

      console.log(`✅ Pizzdwich crudites migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in addCruditesToPizzdwich:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePizzaProducts() {
    try {
      console.log('🔄 Updating pizza products...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      // Pizzas valides sur la borne
      const validPizzaIds = ['pizza10', 'pizza1', 'pizza18', 'pizza17', 'pizza9', 'pizza2', 'pizza13', 'pizza3', 'pizza4', 'pizza7', 'pizza6', 'pizza11', 'pizza12', 'pizza8', 'pizza-composee'];

      // Pizzas à supprimer (celles qui ne sont PAS sur la borne)
      const pizzaIdsToDelete = ['pizza5', 'pizza14', 'pizza15', 'pizza16', 'pizza19'];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category === 'pizza' && pizzaIdsToDelete.includes(data.id)) {
          await deleteDoc(doc(db, this.collectionName, docSnap.id));
          console.log(`🗑️ Deleted pizza: ${data.name || data.id}`);
          updatedCount++;
        }
      }

      // Nouveaux prix des pizzas nommées (prix = 29cm base)
      const pizzaPrices = {
        'pizza10': { name: 'Pizza Margherita', price: 9.00, description: 'Sauce tomate, Mozzarella et olives.', image: 'pizzaMargherita' },
        'pizza1': { name: 'Pizza Fermière', price: 11.50, description: 'Crème fraîche, poulet rôti, pommes de terre, champignons frais, origan et Mozzarella.', image: 'pizzaFermiere' },
        'pizza18': { name: 'Pizza Kebab raclette', price: 11.50, description: 'Base tomate, kebab, oignon rouge, raclette, pomme terre, mozza.', image: 'pizzaKebabRaclette' },
        'pizza17': { name: 'Pizza Cannibale', price: 11.50, description: 'Base tomate, steak, merguez, poulet, oignon rouge, olives, mozza.', image: 'pizzaCannibale' },
        'pizza9': { name: 'Pizza Saumon', price: 13.00, description: 'Crème fraîche, saumon fumé frais, jus de citron, aneth et Mozzarella.', image: 'pizzaSaumon' },
        'pizza2': { name: 'Pizza Chèvre miel', price: 11.50, description: 'Crème fraîche, chèvre, miel et Mozzarella.', image: 'pizzaChevreMiel' },
        'pizza13': { name: 'Pizza Chèvre Poulet', price: 11.50, description: 'Base crème, poulet, chèvre, oignon rouge, olives, mozza.', image: 'pizzaChevrePoulet' },
        'pizza3': { name: 'Pizza Curry', price: 11.50, description: 'Crème fraîche, poulet rôti, pommes de terre, poivrons, curry et Mozzarella.', image: 'pizzaCurry' },
        'pizza4': { name: 'Pizza Kebab', price: 11.50, description: 'Sauce tomate, kebab, poivrons, pomme de terre, oignons rouges, sauce blanche et Mozzarella.', image: 'pizzaKebab' },
        'pizza7': { name: 'Pizza Tex-Mex', price: 11.50, description: 'Sauce tomate, viande hachée, merguez, poivrons, oignons rouges et Mozzarella.', image: 'pizzaTexMex' },
        'pizza6': { name: 'Pizza Burger', price: 11.50, description: 'Sauce tomate, viande hachée, Cheddar, cornichons, oignons rouges, sauce burger et Mozzarella.', image: 'pizzaBurger' },
        'pizza11': { name: 'Pizza 4 fromages', price: 11.50, description: '4 fromages et base tomate.', image: 'pizza4Fromages' },
        'pizza12': { name: 'Pizza Chèvre Figue', price: 11.50, description: 'Crème fraîche, chèvre, confiture de figue et Mozzarella.', image: 'pizzaChevreFigue' },
        'pizza8': { name: 'Pizza Raclette', price: 11.50, description: 'Crème fraîche, lardons de volailles, pommes de terre, oignons rouges, fromage raclette et Mozzarella.', image: 'pizzaRaclette' },
      };

      const supplementOptions = [
        { id: 'kebab-sup', name: 'Kebab', price: 2.00 },
        { id: 'steak-sup', name: 'Steak 120 g', price: 2.00 },
        { id: 'saumon-sup', name: 'Saumon', price: 3.00 },
        { id: 'legumes-sup', name: 'Légumes (oignon rouge, poivron, pomme de terre)', price: 1.00 },
        { id: 'oeuf-sup', name: 'Œuf', price: 1.50 }
      ];

      const fromageOptions = [
        { id: 'emmentale-sup', name: 'Emmentale', price: 1.50 },
        { id: 'mozzarella-sup', name: 'Mozzarella', price: 1.50 },
        { id: 'parmesan-sup', name: 'Parmesan', price: 1.50 }
      ];

      const boissonOptions = [
        { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0 },
        { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
        { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
        { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
        { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
        { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
        { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
        { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
        { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
        { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
        { id: 'sprite', name: 'Sprite', price: 2.00 },
        { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
        { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
        { id: 'orangina', name: 'Orangina', price: 2.00 },
        { id: 'schweppes', name: 'Schweppes', price: 2.00 },
        { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
        { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
        { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
        { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
        { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
        { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
        { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
        { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
        { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
        { id: 'hawai', name: 'Hawaï', price: 2.00 },
        { id: 'tropico', name: 'Tropico', price: 2.00 },
        { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
        { id: 'bissap', name: 'Bissap', price: 2.00 },
        { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
        { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
        { id: 'redbull', name: 'Redbull', price: 2.50 },
        { id: 'monster', name: 'Monster', price: 2.50 }
      ];

      // Compter les pizzas existantes dans Firebase
      const existingPizzas = snapshot.docs.filter(d => d.data().category === 'pizza');
      console.log(`📊 Pizzas existantes dans Firebase: ${existingPizzas.length}`);
      existingPizzas.forEach(d => console.log(`   - ${d.data().id}: ${d.data().name}`));

      // Mettre à jour les pizzas nommées
      for (const [pizzaId, pizzaData] of Object.entries(pizzaPrices)) {
        const existing = snapshot.docs.find(d => {
          const data = d.data();
          return data.id === pizzaId || d.id === pizzaId;
        });
        console.log(`🔍 Pizza ${pizzaId} (${pizzaData.name}): ${existing ? 'EXISTS → update' : 'MISSING → create'}`);

        const pizzaDoc = {
            name: pizzaData.name,
            price: pizzaData.price,
            description: pizzaData.description,
            imageKey: pizzaData.image,
            id: pizzaId,
            category: 'pizza',
            active: true,
            customizable: true,
            popular: pizzaId === 'pizza10' || pizzaId === 'pizza1',
            sizes: {
              '29cm': { name: '29cm', price: pizzaData.price },
              '33cm': { name: '33cm', price: pizzaData.price + 3.00 }
            },
            customizationOptions: {
              taille: {
                title: 'Choisis ta taille !',
                required: true,
                minSelections: 1,
                maxSelections: 1,
                options: [
                  { id: 'pizza-29cm', name: 'Moyenne 29 cm', price: 0 },
                  { id: 'pizza-33cm', name: 'Grande 33 cm', price: 3.00 }
                ]
              },
              supplement: {
                title: 'Choisis ton supplément !',
                required: false,
                maxSelections: 1,
                options: supplementOptions
              },
              fromage: {
                title: 'Choisis ton supplément fromage !',
                required: false,
                maxSelections: 1,
                options: fromageOptions
              },
              boisson: {
                title: 'Boisson',
                subtitle: 'Ajoutez une boisson à votre plat.',
                required: false,
                maxSelections: 1,
                options: boissonOptions
              }
            },
            updatedAt: serverTimestamp()
          };

        if (existing) {
          const existingData = existing.data();
          const updateFields = { ...pizzaDoc };
          // Ajouter createdAt si manquant (requis par orderBy('createdAt'))
          if (!existingData.createdAt) {
            updateFields.createdAt = serverTimestamp();
            console.log(`⚠️ Pizza ${pizzaId} n'avait pas de createdAt → ajouté`);
          }
          await updateDoc(doc(db, this.collectionName, existing.id), updateFields);
          console.log(`✅ Updated pizza: ${pizzaData.name} → ${pizzaData.price}€`);
          updatedCount++;
        } else {
          // Créer la pizza si elle n'existe pas dans Firebase
          await addDoc(collection(db, this.collectionName), {
            ...pizzaDoc,
            createdAt: serverTimestamp()
          });
          console.log(`➕ Created pizza: ${pizzaData.name} → ${pizzaData.price}€`);
          updatedCount++;
        }
      }

      // S'assurer que pizza-composee a aussi active: true et createdAt
      const composeeDoc = snapshot.docs.find(d => {
        const data = d.data();
        return data.id === 'pizza-composee' || d.id === 'pizza-composee';
      });
      if (composeeDoc) {
        const composeeData = composeeDoc.data();
        const composeeUpdates = {};
        if (composeeData.active !== true) composeeUpdates.active = true;
        if (!composeeData.createdAt) composeeUpdates.createdAt = serverTimestamp();
        if (Object.keys(composeeUpdates).length > 0) {
          composeeUpdates.updatedAt = serverTimestamp();
          await updateDoc(doc(db, this.collectionName, composeeDoc.id), composeeUpdates);
          console.log('✅ Fixed pizza-composee:', Object.keys(composeeUpdates).filter(k => k !== 'updatedAt').join(', '));
          updatedCount++;
        }
      }

      // Mettre à jour les formules duo/trio avec les 14 pizzas
      const validPizzaChoices = [
        'Pizza Margherita', 'Pizza Fermière', 'Pizza Kebab raclette', 'Pizza Cannibale', 'Pizza Saumon',
        'Pizza Chèvre miel', 'Pizza Chèvre Poulet', 'Pizza Curry', 'Pizza Kebab',
        'Pizza Tex-Mex', 'Pizza Burger', 'Pizza 4 fromages', 'Pizza Chèvre Figue', 'Pizza Raclette'
      ];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Formule Duo
        if (data.id === 'formule-pizza-duo' && data.customizationOptions) {
          const makeOptions = (suffix) => validPizzaChoices.map(name => ({
            id: `pizza-${name.toLowerCase().replace(/\s+/g, '-').replace(/[éè]/g, 'e')}-${suffix}`,
            name,
            price: 0
          }));
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.pizza1': {
              title: 'Choix Pizza 1 (M)',
              required: true,
              multiSelect: false,
              maxSelections: 1,
              options: makeOptions('1')
            },
            'customizationOptions.pizza2': {
              title: 'Choix Pizza 2 (M)',
              required: true,
              multiSelect: false,
              maxSelections: 1,
              options: makeOptions('2')
            },
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated Formule Duo pizza choices');
          updatedCount++;
        }

        // Formule Trio
        if (data.id === 'formule-pizza-trio' && data.customizationOptions) {
          const makeOptions = (suffix) => validPizzaChoices.map(name => ({
            id: `pizza-${name.toLowerCase().replace(/\s+/g, '-').replace(/[éè]/g, 'e')}-${suffix}`,
            name,
            price: 0
          }));
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.pizza1': {
              title: 'Choix Pizza 1 (M)',
              required: true,
              multiSelect: false,
              maxSelections: 1,
              options: makeOptions('1')
            },
            'customizationOptions.pizza2': {
              title: 'Choix Pizza 2 (M)',
              required: true,
              multiSelect: false,
              maxSelections: 1,
              options: makeOptions('2')
            },
            'customizationOptions.pizza3': {
              title: 'Choix Pizza 3 (M)',
              required: true,
              multiSelect: false,
              maxSelections: 1,
              options: makeOptions('3')
            },
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated Formule Trio pizza choices');
          updatedCount++;
        }
      }

      console.log(`✅ Pizza migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updatePizzaProducts:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Remplacer supplements par viande, fromage, pain pour les pâtes
  async updatePatesCustomizations() {
    try {
      console.log('🔄 Updating pâtes customizations (viande, fromage, pain)...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const patesIds = ['1', '2', '3', '4', '5', '6'];

      const newViande = {
        title: 'Viande',
        subtitle: 'Ajoutez de la viande à vos pâtes. (max 2)',
        required: false,
        multiSelect: true,
        maxSelections: 2,
        options: [
          { id: 'cordon-bleu-pate', name: 'Cordon bleu', price: 2.00 },
          { id: 'tenders-pate', name: 'Tenders', price: 2.50 },
          { id: 'kebab-pate', name: 'Kebab', price: 2.00 },
          { id: 'steak-120g-pate', name: 'Steak 120g', price: 2.00 },
          { id: 'saumon-pate', name: 'Saumon', price: 3.00 },
          { id: 'oeuf-pate', name: 'Oeuf', price: 1.50 },
          { id: 'poulet-pate', name: 'Poulet', price: 2.00 },
          { id: 'nuggets-pate', name: 'Nuggets', price: 2.00 },
          { id: 'merguez-pate', name: 'Merguez', price: 2.00 },
          { id: 'falafel-pate', name: 'Falafel', price: 2.00 }
        ]
      };

      const newFromage = {
        title: 'Fromage',
        subtitle: 'Ajoutez du fromage à vos pâtes. (max 2)',
        required: false,
        multiSelect: true,
        maxSelections: 2,
        options: [
          { id: 'emmental-pate', name: 'Emmentale', price: 1.50 },
          { id: 'mozzarella-pate', name: 'Mozzarella', price: 1.50 },
          { id: 'parmesan-pate', name: 'Parmesan', price: 1.50 },
          { id: 'raclette-pate', name: 'Raclette', price: 1.50 },
          { id: 'chevre-pate', name: 'Chèvre', price: 1.50 },
          { id: 'cheddar-pate', name: 'Cheddar', price: 1.50 },
          { id: 'vache-qui-rit-pate', name: 'Vache qui rit', price: 1.50 }
        ]
      };

      const newPain = {
        title: 'Pain',
        subtitle: 'Souhaitez-vous du pain ?',
        required: true,
        multiSelect: false,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { id: 'pas-de-pain-pate', name: 'Non, pas de pain merci', price: 0.00 },
          { id: 'oui-pain-pate', name: 'Oui, du pain svp', price: 0.50 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category !== 'pates' || !patesIds.includes(data.id)) continue;

        // Guard : si déjà migré (viande présent dans customizationOptions)
        if (data.customizationOptions?.viande) {
          console.log(`✅ ${data.name} already has viande customization, skipping`);
          continue;
        }

        // Garder la boisson existante
        const existingBoisson = data.customizationOptions?.boisson;

        const updatedOptions = {
          viande: newViande,
          fromage: newFromage,
          pain: newPain,
          ...(existingBoisson ? { boisson: existingBoisson } : {})
        };

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          customizationOptions: updatedOptions,
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Updated pâtes customizations for ${data.name}`);
        updatedCount++;
      }

      console.log(`✅ Pâtes customizations migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updatePatesCustomizations:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Coca-Cola Vanille 2.00 → 2.50€
  async updateCocaVanillePrice() {
    try {
      console.log('🔄 Updating Coca-Cola Vanille price to 2.50€...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // 1. Mettre à jour le produit Coca-Cola Vanille lui-même
        if (data.id === 'cocacola-vanille' && data.price !== 2.50) {
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            price: 2.50,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated Coca-Cola Vanille standalone price to 2.50€');
          updatedCount++;
          continue;
        }

        // 2. Mettre à jour le prix dans les customizationOptions.boisson des autres produits
        if (!data.customizationOptions) continue;

        let needsUpdate = false;
        const updatedOptions = { ...data.customizationOptions };

        for (const [key, section] of Object.entries(updatedOptions)) {
          if (section?.options && Array.isArray(section.options)) {
            const updatedSectionOptions = section.options.map(option => {
              if (option.id === 'coca-vanille' && option.price !== 2.50) {
                needsUpdate = true;
                return { ...option, price: 2.50 };
              }
              return option;
            });
            updatedOptions[key] = { ...section, options: updatedSectionOptions };
          }
        }

        if (needsUpdate) {
          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            customizationOptions: updatedOptions,
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Updated Coca Vanille price for ${data.name}`);
          updatedCount++;
        }
      }

      console.log(`✅ Coca Vanille price migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateCocaVanillePrice:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Ajouter boisson aux bowls
  async addBoissonToBowls() {
    try {
      console.log('🔄 Adding boisson to bowls...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const boissonOptions = {
        title: 'Boisson',
        subtitle: 'Ajoutez une boisson à votre bowl.',
        required: false,
        maxSelections: 1,
        options: [
          { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
          { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
          { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
          { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
          { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
          { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
          { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
          { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
          { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
          { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
          { id: 'sprite', name: 'Sprite', price: 2.00 },
          { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
          { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
          { id: 'orangina', name: 'Orangina', price: 2.00 },
          { id: 'schweppes', name: 'Schweppes', price: 2.00 },
          { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
          { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
          { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
          { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
          { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
          { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
          { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
          { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
          { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
          { id: 'hawai', name: 'Hawaï', price: 2.00 },
          { id: 'tropico', name: 'Tropico', price: 2.00 },
          { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
          { id: 'bissap', name: 'Bissap', price: 2.00 },
          { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
          { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
          { id: 'redbull', name: 'Redbull', price: 2.50 },
          { id: 'monster', name: 'Monster', price: 2.50 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id !== 'bowl-custom') continue;
        if (data.customizationOptions?.boisson) {
          console.log(`✅ Bowl already has boisson, skipping`);
          continue;
        }

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          'customizationOptions.boisson': boissonOptions,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added boisson to bowl`);
        updatedCount++;
      }

      console.log(`✅ Bowl boisson migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in addBoissonToBowls:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Remplacer salade par pain (1€) dans les lasagnes
  async updateLasagnesPainOption() {
    try {
      console.log('🔄 Updating lasagnes: replacing salade with pain...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const lasagneIds = ['lasagne1', 'lasagne2', 'lasagne3'];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!lasagneIds.includes(data.id)) continue;

        // Guard : si déjà migré (pain présent dans customizationOptions)
        if (data.customizationOptions?.pain) {
          console.log(`✅ ${data.name} already has pain option, skipping`);
          continue;
        }

        const painOption = {
          title: 'Pain',
          subtitle: 'Souhaitez-vous du pain ?',
          required: false,
          multiSelect: false,
          maxSelections: 1,
          options: [
            { id: `pas-de-pain-${data.id}`, name: 'Non, pas de pain merci', price: 0.00 },
            { id: `pain-${data.id}`, name: 'Oui, du pain svp', price: 1.00 }
          ]
        };

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          'customizationOptions.pain': painOption,
          'customizationOptions.salade': deleteField(),
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Updated ${data.name}: replaced salade with pain`);
        updatedCount++;
      }

      console.log(`✅ Lasagnes pain migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updateLasagnesPainOption:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Ajouter boisson aux bruschettas
  async addBoissonToBruschettas() {
    try {
      console.log('🔄 Adding boisson to bruschettas...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      const bruschettaIds = ['bruschetta1', 'bruschetta2', 'bruschetta3', 'bruschetta4'];

      const boissonOptions = {
        title: 'Boisson',
        subtitle: 'Ajoutez une boisson à votre plat.',
        required: false,
        maxSelections: 1,
        options: [
          { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0.00 },
          { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
          { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
          { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
          { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
          { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
          { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
          { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
          { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
          { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
          { id: 'sprite', name: 'Sprite', price: 2.00 },
          { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
          { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
          { id: 'orangina', name: 'Orangina', price: 2.00 },
          { id: 'schweppes', name: 'Schweppes', price: 2.00 },
          { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
          { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
          { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
          { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
          { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
          { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
          { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
          { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
          { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
          { id: 'hawai', name: 'Hawaï', price: 2.00 },
          { id: 'tropico', name: 'Tropico', price: 2.00 },
          { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
          { id: 'bissap', name: 'Bissap', price: 2.00 },
          { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
          { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
          { id: 'redbull', name: 'Redbull', price: 2.50 },
          { id: 'monster', name: 'Monster', price: 2.50 }
        ]
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!bruschettaIds.includes(data.id)) continue;
        if (data.customizationOptions?.boisson) {
          console.log(`✅ ${data.name} already has boisson, skipping`);
          continue;
        }

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          customizable: true,
          'customizationOptions.boisson': boissonOptions,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added boisson to ${data.name}`);
        updatedCount++;
      }

      console.log(`✅ Bruschettas boisson migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in addBoissonToBruschettas:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Mettre à jour Pizza briochée → Pizza briochée Nutella + nouvelles options
  async updatePizzaBriocheeNutella() {
    try {
      console.log('🔄 Updating Pizza briochée Nutella...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.id !== 'dessert8') continue;

        // Guard : si déjà migré
        if (data.name === 'Pizza briochée Nutella' && data.customizationOptions?.chantilly) {
          console.log('✅ Pizza briochée Nutella already updated, skipping');
          continue;
        }

        const updatedOptions = {
          gout: {
            title: 'Choisis ton nappage',
            subtitle: 'Obligatoire.',
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: 'nutella', name: 'Nutella', price: 0 },
              { id: 'chocolat-noisette', name: 'Chocolat noisette', price: 0 },
              { id: 'caramel-beurre-sale', name: 'Caramel beurre salé', price: 0 },
              { id: 'beurre-cacahuete', name: 'Beurre de cacahuète', price: 0 },
              { id: 'creme-speculoos', name: 'Crème de spéculoos', price: 0 }
            ]
          },
          topping: {
            title: 'Choix de topping',
            subtitle: 'Obligatoire.',
            required: true,
            minSelections: 1,
            maxSelections: 7,
            options: [
              { id: 'kinder-bueno', name: 'Kinder Bueno', price: 1.00 },
              { id: 'kinder-bueno-white', name: 'Kinder Bueno White', price: 1.00 },
              { id: 'kinder-country', name: 'Kinder Country', price: 1.00 },
              { id: 'oreo', name: 'Oreo', price: 1.00 },
              { id: 'mms', name: "M&M's", price: 1.00 },
              { id: 'speculoos', name: 'Speculoos', price: 1.00 },
              { id: 'banane', name: 'Banane', price: 1.00 }
            ]
          },
          chantilly: {
            title: 'Chantilly ?',
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: 'oui-chantilly', name: 'Oui, de la chantilly svp', price: 0.50 },
              { id: 'pas-chantilly', name: 'Non, pas de chantilly merci', price: 0.00 }
            ]
          }
        };

        await updateDoc(doc(db, this.collectionName, docSnap.id), {
          name: 'Pizza briochée Nutella',
          description: 'Pizza briochée Nutella',
          customizationOptions: updatedOptions,
          updatedAt: serverTimestamp()
        });

        console.log('✅ Updated Pizza briochée Nutella');
        updatedCount++;
      }

      console.log(`✅ Pizza briochée Nutella migration complete: ${updatedCount} products updated`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updatePizzaBriocheeNutella:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration: Nettoyer TOUS les doublons de boissons (par nom) puis s'assurer que toutes existent
  async ensureAllDrinksInFirebase() {
    try {
      console.log('🔄 Ensuring all drinks exist in Firebase (with dedup by name)...');
      const productsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(productsRef);
      let deletedCount = 0;
      let updatedCount = 0;

      // Phase 1: Collecter TOUTES les boissons et grouper par NOM
      const drinkDocsByName = {}; // { 'Oasis Fraise Framboise': [docSnap1, docSnap2, ...] }
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.category === 'boissons' && data.name) {
          if (!drinkDocsByName[data.name]) {
            drinkDocsByName[data.name] = [];
          }
          drinkDocsByName[data.name].push(docSnap);
        }
      }

      // Phase 2: Pour chaque nom, garder 1 seul doc, supprimer tous les autres
      const localDrinks = localProductsData[ProductCategory.BOISSONS] || [];
      const localDrinksByName = {};
      for (const drink of localDrinks) {
        localDrinksByName[drink.name] = drink;
      }

      for (const [drinkName, docs] of Object.entries(drinkDocsByName)) {
        if (docs.length > 1) {
          console.log(`🗑️ ${drinkName}: ${docs.length} doublons, suppression de ${docs.length - 1}`);
          // Garder le premier, supprimer le reste
          for (let i = 1; i < docs.length; i++) {
            await deleteDoc(doc(db, this.collectionName, docs[i].id));
            deletedCount++;
          }

          // Corriger l'id du doc restant si besoin (remettre l'id local)
          const localDrink = localDrinksByName[drinkName];
          if (localDrink) {
            const remainingDoc = docs[0];
            const remainingData = remainingDoc.data();
            if (remainingData.id !== localDrink.id) {
              await updateDoc(doc(db, this.collectionName, remainingDoc.id), { id: localDrink.id });
            }
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ Nettoyage terminé: ${deletedCount} doublons supprimés`);
      }

      // Phase 3: Ajouter les boissons manquantes avec setDoc (ID fixe = pas de doublons futurs)
      const existingNames = new Set(Object.keys(drinkDocsByName));

      for (const drink of localDrinks) {
        if (existingNames.has(drink.name)) continue;

        // Exclure 'image' (c'est un require() local, pas sérialisable pour Firebase)
        const { image, ...drinkData } = drink;
        const product = {
          ...drinkData,
          category: 'boissons',
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, this.collectionName, drink.id), product);
        console.log(`✅ Added drink to Firebase: ${drink.name}`);
        updatedCount++;
      }

      console.log(`✅ Drinks sync: ${updatedCount} ajoutées, ${deletedCount} doublons supprimés`);
      return { success: true, updatedCount: updatedCount + deletedCount };
    } catch (error) {
      console.error('❌ Error in ensureAllDrinksInFirebase:', error);
      return { success: false, error: error.message };
    }
  }
  // Migration: Mettre à jour les viandes des Pizzdwich (multi-select par taille) + ajouter XXL
  async updatePizzdwichViandes() {
    try {
      console.log('🔄 Updating Pizzdwich viandes (multi-select per size) + adding XXL...');
      const productsRef = collection(db, this.collectionName);
      const q = query(productsRef, where('category', '==', 'pizzdwich'));
      const snapshot = await getDocs(q);
      let updatedCount = 0;

      const viandeOptions = [
        { id: 'poulet', name: 'Poulet', price: 0 },
        { id: 'kebab', name: 'Kebab', price: 0 },
        { id: 'merguez', name: 'Merguez', price: 0 },
        { id: 'steak', name: 'Steak', price: 0 },
        { id: 'falafel', name: 'Falafel', price: 0 },
        { id: 'tenders', name: 'Tenders', price: 0.50 },
        { id: 'kfta', name: 'Kfta', price: 0 },
        { id: 'cordon-bleu', name: 'Cordon bleu', price: 0 },
        { id: 'nuggets', name: 'Nuggets', price: 0 }
      ];

      // Config viande par taille
      const viandeConfigBySize = {
        'pizzdwich-m': { title: 'Choisis ta viande', multiSelect: false, minSelections: 1, maxSelections: 1 },
        'pizzdwich-l': { title: 'Choisis tes 2 viandes', multiSelect: true, minSelections: 2, maxSelections: 2 },
        'pizzdwich-xl': { title: 'Choisis tes 3 viandes', multiSelect: true, minSelections: 3, maxSelections: 3 },
        'pizzdwich-xxl': { title: 'Choisis tes 4 viandes', multiSelect: true, minSelections: 4, maxSelections: 4 },
      };

      // Mettre à jour les produits existants (M, L, XL)
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const productId = data.id || docSnap.id;
        const config = viandeConfigBySize[productId];

        if (config) {
          const viandeUpdate = {
            ...config,
            required: true,
            options: viandeOptions
          };

          const nameBySize = {
            'pizzdwich-m': 'Pizzdwich M',
            'pizzdwich-l': 'Pizzdwich L',
            'pizzdwich-xl': 'Pizzdwich XL',
          };

          const descriptionBySize = {
            'pizzdwich-m': 'Pizzdwich garni sauce et crudités au choix',
            'pizzdwich-l': 'Pizzdwich garni sauce et crudités au choix - 2 viandes',
            'pizzdwich-xl': 'Pizzdwich garni sauce et crudités au choix - 3 viandes',
          };

          await updateDoc(doc(db, this.collectionName, docSnap.id), {
            'customizationOptions.viande': viandeUpdate,
            name: nameBySize[productId] || data.name,
            description: descriptionBySize[productId] || data.description,
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Updated ${productId} viande: multiSelect=${config.multiSelect}, max=${config.maxSelections}`);
          updatedCount++;
        }
      }

      // Ajouter le XXL s'il n'existe pas
      const existingIds = snapshot.docs.map(d => d.data().id || d.id);
      if (!existingIds.includes('pizzdwich-xxl')) {
        // Récupérer les options du XL comme base
        const xlDoc = snapshot.docs.find(d => (d.data().id || d.id) === 'pizzdwich-xl');
        let customizationOptions;

        if (xlDoc) {
          customizationOptions = { ...xlDoc.data().customizationOptions };
        } else {
          // Fallback: construire les options complètes
          const sauceOptions = [
            { id: 'boursin', name: 'Boursin', price: 0.50, popular: true },
            { id: 'mayonnaise', name: 'Mayonnaise', price: 0 },
            { id: 'ketchup', name: 'Ketchup', price: 0 },
            { id: 'sauce-blanche', name: 'Sauce blanche', price: 0 },
            { id: 'algerienne', name: 'Algérienne', price: 0 },
            { id: 'samourai', name: 'Samouraï', price: 0 },
            { id: 'biggy-burger', name: 'Biggy', price: 0 },
            { id: 'barbecue', name: 'Barbecue', price: 0 },
            { id: 'brazil', name: 'Brazil', price: 0 },
            { id: 'big-mac', name: 'Big Mac', price: 0 },
            { id: 'curry', name: 'Curry', price: 0 },
            { id: 'marocaine', name: 'Marocaine', price: 0 },
            { id: 'andalouse', name: 'Andalouse', price: 0 },
            { id: 'moutarde', name: 'Moutarde', price: 0 },
            { id: 'chili-tai', name: 'Chili thaï', price: 0 },
            { id: 'harissa', name: 'Harissa', price: 0 },
            { id: 'pas-sauce-fromagere', name: 'Sans sauce fromagère', price: 0 }
          ];
          const fritesOptions = [
            { id: 'frites-non', name: 'Pas de frites', price: 0 },
            { id: 'frites-natures', name: 'Frites Natures', price: 1.00 },
            { id: 'frites-cheddar', name: 'Frites Cheddar', price: 3.00 },
            { id: 'frites-cheddar-oignons', name: 'Frites Cheddar Oignons Frits', price: 3.50 },
            { id: 'frites-cheddar-bacon', name: 'Frites Cheddar Bacon', price: 3.50 },
            { id: 'frites-cheddar-bacon-oignons', name: 'Frites Cheddar Bacon Oignons', price: 4.00 },
            { id: 'frites-fromageres', name: 'Frites Fromagères', price: 3.00 },
            { id: 'frites-fromageres-oignons', name: 'Frites fromagères et oignons frits', price: 3.50 },
            { id: 'frites-fromageres-bacon', name: 'Frites fromagères et bacon', price: 3.50 },
            { id: 'frites-fromagere-bacon-oignons', name: 'Frites fromagère bacon oignons', price: 4.00 }
          ];
          const supplementsOptions = [
            { id: 'vache-qui-rit', name: 'Vache qui rit', price: 1.00 },
            { id: 'emmental', name: 'Emmental', price: 1.00 },
            { id: 'oeufs', name: 'Oeufs', price: 1.00 },
            { id: 'sup-boursin', name: 'Boursin', price: 1.00 },
            { id: 'cheddar', name: 'Cheddar', price: 1.00 },
            { id: 'raclette', name: 'Raclette', price: 1.00 },
            { id: 'chevre', name: 'Chèvre', price: 1.00 },
            { id: 'oignons-frits', name: 'Oignons frits', price: 1.00 },
            { id: 'oignons-grilles', name: 'Oignons grillés', price: 1.00 },
            { id: 'oignon-frais', name: 'Oignon frais', price: 1.00 },
            { id: 'champignon-frais', name: 'Champignon frais', price: 1.00 },
            { id: 'champignon-grilles', name: 'Champignon grillés', price: 1.00 },
            { id: 'bacon', name: 'Bacon', price: 1.00 }
          ];
          const boissonOptions = [
            { id: 'pas-de-boisson', name: 'Pas de boisson', price: 0 },
            { id: 'cocacola', name: 'Coca-Cola', price: 2.00 },
            { id: 'coca-zero', name: 'Coca-Cola Zéro', price: 2.00 },
            { id: 'coca-vanille', name: 'Coca-Cola Vanille', price: 2.50 },
            { id: 'coca-cherry', name: 'Coca-Cola Cherry', price: 2.00 },
            { id: 'fanta-orange', name: 'Fanta Orange', price: 2.00 },
            { id: 'fanta-citron', name: 'Fanta Citron', price: 2.00 },
            { id: 'fanta-raisin', name: 'Fanta Raisin', price: 2.00 },
            { id: 'fanta-framboise', name: 'Fanta Framboise', price: 2.00 },
            { id: 'fanta-fruit-dragon', name: 'Fanta Fruit du Dragon', price: 2.00 },
            { id: 'sprite', name: 'Sprite', price: 2.00 },
            { id: '7up-cherry', name: '7up Cherry', price: 2.00 },
            { id: '7up-mojito', name: '7up Mojito', price: 2.00 },
            { id: 'orangina', name: 'Orangina', price: 2.00 },
            { id: 'schweppes', name: 'Schweppes', price: 2.00 },
            { id: 'oasis-tropical', name: 'Oasis Tropical', price: 2.00 },
            { id: 'oasis-fraise-framboise', name: 'Oasis Fraise/Framboise', price: 2.00 },
            { id: 'oasis-pomme-cassis-framboise', name: 'Oasis Pomme Cassis Framboise', price: 2.00 },
            { id: 'oasis-pomme-poire', name: 'Oasis Pomme Poire', price: 2.00 },
            { id: 'fuzetea', name: 'Fuzetea', price: 2.00 },
            { id: 'ice-tea-peche', name: 'Ice Tea Pêche', price: 2.00 },
            { id: 'ice-tea-tropical', name: 'Ice Tea Tropical', price: 2.00 },
            { id: 'ice-tea-framboise', name: 'Ice Tea Framboise', price: 2.00 },
            { id: 'ice-tea-pasteque-menthe', name: 'Ice Tea Pastèque Menthe', price: 2.00 },
            { id: 'hawai', name: 'Hawaï', price: 2.00 },
            { id: 'tropico', name: 'Tropico', price: 2.00 },
            { id: 'capri-sun', name: 'Capri Sun', price: 2.00 },
            { id: 'bissap', name: 'Bissap', price: 2.00 },
            { id: 'eau-plate', name: 'Eau plate', price: 2.00 },
            { id: 'eau-gazeuse', name: 'Eau gazeuse', price: 2.00 },
            { id: 'redbull', name: 'Redbull', price: 2.50 },
            { id: 'monster', name: 'Monster', price: 2.50 }
          ];
          customizationOptions = {
            sauce: { title: 'Sauce', required: true, multiSelect: true, minSelections: 1, maxSelections: 3, options: sauceOptions },
            viande: { title: 'Choisis tes 4 viandes', required: true, multiSelect: true, minSelections: 4, maxSelections: 4, options: viandeOptions },
            crudites: { title: 'Fais ton choix', required: true, multiSelect: true, minSelections: 1, maxSelections: 3, options: [
              { id: 'salade', name: 'Salade', price: 0 },
              { id: 'tomate', name: 'Tomate', price: 0 },
              { id: 'oignon-rouge', name: 'Oignon rouge', price: 0 },
              { id: 'sans-crudites', name: 'Sans crudités', price: 0 }
            ]},
            frites: { title: 'Souhaitez-vous des frites ?', required: false, multiSelect: false, maxSelections: 1, options: fritesOptions },
            supplements: { title: 'Vous souhaitez commander :', required: false, multiSelect: true, minSelections: 0, maxSelections: 3, options: supplementsOptions },
            boisson: { title: 'Boisson', subtitle: 'Ajoutez une boisson.', required: false, maxSelections: 1, options: boissonOptions }
          };
        }

        // Mettre la bonne config viande pour XXL
        customizationOptions.viande = {
          title: 'Choisis tes 4 viandes',
          required: true,
          multiSelect: true,
          minSelections: 4,
          maxSelections: 4,
          options: viandeOptions
        };

        const xxlProduct = {
          id: 'pizzdwich-xxl',
          name: 'Pizzdwich XXL',
          price: 13.50,
          order: 4,
          image: 'pizzdwich',
          category: 'pizzdwich',
          description: 'Pizzdwich garni sauce et crudités au choix - 4 viandes',
          customizable: true,
          customizationOptions,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = doc(db, this.collectionName, 'pizzdwich-xxl');
        await setDoc(docRef, xxlProduct);
        console.log('➕ Added Pizzdwich XXL (13.50€, 4 viandes)');
        updatedCount++;
      }

      console.log(`✅ Pizzdwich viandes migration complete: ${updatedCount} changes`);
      return { success: true, updatedCount };
    } catch (error) {
      console.error('❌ Error in updatePizzdwichViandes:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ProductService();