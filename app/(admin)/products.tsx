import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { ProductCategory } from '../../src/types';

export default function ProductPriceManagement() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPriceM, setNewPriceM] = useState('');
  const [newPriceL, setNewPriceL] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Animations pour les emojis flottants (15 emojis pour la page produits)
  const floatingEmojis = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(0))
  ).current;

  // Catégories avec leurs couleurs et noms du menu client
  const categoryStyles = {
    [ProductCategory.PIZZA]: { name: 'Pizzas', color: '#EF4444', gradient: ['#EF4444', '#F87171'] },
    [ProductCategory.PATES]: { name: 'Pâtes', color: '#22C55E', gradient: ['#22C55E', '#4ADE80'] },
    [ProductCategory.LASAGNES]: { name: 'Lasagnes', color: '#DC2626', gradient: ['#DC2626', '#EF4444'] },
    [ProductCategory.BURGER]: { name: 'Burgers', color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] },
    [ProductCategory.TACOS]: { name: 'Tacos', color: '#F97316', gradient: ['#F97316', '#FB923C'] },
    [ProductCategory.SALADES]: { name: 'Salades', color: '#16A34A', gradient: ['#16A34A', '#22C55E'] },
    [ProductCategory.DESSERTS]: { name: 'Desserts', color: '#000000', gradient: ['#000000', '#000000'] },
    [ProductCategory.BOISSONS]: { name: 'Boissons', color: '#0891B2', gradient: ['#0891B2', '#0EA5E9'] },
    [ProductCategory.FORMULES_PIZZA_DUO]: { name: 'Formules Duo', color: '#000000', gradient: ['#000000', '#000000'] },
    [ProductCategory.FORMULES_PIZZA_TRIO]: { name: 'Formules Trio', color: '#6366F1', gradient: ['#6366F1', '#8B5CF6'] },
  };

  // Produits par défaut - synchronisés avec l'app client
  const defaultProducts = [
    // PÂTES (avec tailles)
    { id: '1', name: 'Pâtes bolognaise', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 10.50, L: 14.50 }, description: 'Penne, sauce tomate, viande hachée, oignons et herbes aromatiques.', hasSizes: true },
    { id: '2', name: 'Pâtes carbonara', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 10.50, L: 14.50 }, description: 'Penne, crème fraîche, lardons de volailles et Emmental.', hasSizes: true },
    { id: '3', name: 'Pâtes saumon', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 11.50, L: 15.50 }, description: 'Penne, crème fraîche, saumon frais et aneth.', hasSizes: true },
    { id: '4', name: 'Pâtes forestière', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 11.50, L: 15.50 }, description: 'Penne, crème fraîche, poulet rôti et champignons de Paris frais.', hasSizes: true },
    { id: '5', name: 'Pâtes 3 fromages', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 11.50, L: 15.50 }, description: 'Penne, crème fraîche, bleu d\'Auvergne, Roquefort et Emmental.', hasSizes: true },
    { id: '6', name: 'Pâtes poulet curry', category: ProductCategory.PATES, categoryName: 'Pâtes', prices: { M: 11.50, L: 15.50 }, description: 'Penne, crème fraîche au curry et poulet rôti.', hasSizes: true },

    // PIZZAS (avec tailles)
    { id: 'pizza1', name: 'Pizza Margherita', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 9.90, L: 13.90 }, description: 'Base tomate, mozzarella, basilic frais', hasSizes: true },
    { id: 'pizza2', name: 'Pizza 4 Fromages', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 12.90, L: 16.90 }, description: 'Mozzarella, chèvre, roquefort, emmental', hasSizes: true },
    { id: 'pizza3', name: 'Pizza Chèvre Miel', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 11.90, L: 15.90 }, description: 'Base crème, chèvre, miel, noix', hasSizes: true },
    { id: 'pizza4', name: 'Pizza Saumon', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 13.90, L: 17.90 }, description: 'Base crème, saumon fumé, câpres, aneth', hasSizes: true },
    { id: 'pizza5', name: 'Pizza Tex-Mex', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 12.90, L: 16.90 }, description: 'Base tomate, viande hachée, haricots rouges, maïs, poivrons', hasSizes: true },
    { id: 'pizza6', name: 'Pizza Fermière', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 11.90, L: 15.90 }, description: 'Base crème, lardons, pommes de terre, reblochon', hasSizes: true },
    { id: 'pizza7', name: 'Pizza Raclette', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 12.90, L: 16.90 }, description: 'Base crème, pommes de terre, lardons, fromage à raclette', hasSizes: true },
    { id: 'pizza8', name: 'Pizza Western', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 12.90, L: 16.90 }, description: 'Base barbecue, poulet, poivrons, oignons rouges', hasSizes: true },
    { id: 'pizza9', name: 'Pizza Kebab', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 11.90, L: 15.90 }, description: 'Base tomate, viande kebab, oignons, sauce blanche', hasSizes: true },
    { id: 'pizza10', name: 'Pizza Curry', category: ProductCategory.PIZZA, categoryName: 'Pizzas', prices: { M: 12.90, L: 16.90 }, description: 'Base curry, poulet, ananas, courgettes', hasSizes: true },

    // BURGERS (avec tailles)
    { id: 'burger1', name: 'Burger Classic', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 8.90, L: 12.90 }, description: 'Steak, salade, tomate, cornichons, sauce burger', hasSizes: true },
    { id: 'burger2', name: 'Cheeseburger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 9.90, L: 13.90 }, description: 'Steak, fromage, salade, tomate, sauce burger', hasSizes: true },
    { id: 'burger3', name: 'Double Cheeseburger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 11.90, L: 15.90 }, description: 'Double steak, double fromage, salade, tomate', hasSizes: true },
    { id: 'burger4', name: 'Chicken Burger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 9.90, L: 13.90 }, description: 'Escalope de poulet, salade, tomate, sauce mayo', hasSizes: true },
    { id: 'burger5', name: 'Burger Chèvre Miel', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 10.90, L: 14.90 }, description: 'Steak, chèvre, miel, salade, tomate', hasSizes: true },
    { id: 'burger6', name: 'Bacon Burger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 10.90, L: 14.90 }, description: 'Steak, bacon, fromage, salade, tomate', hasSizes: true },
    { id: 'burger7', name: 'Spicy Burger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 9.90, L: 13.90 }, description: 'Steak épicé, salade, tomate, sauce piquante', hasSizes: true },
    { id: 'burger8', name: 'Veggie Burger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 8.90, L: 12.90 }, description: 'Steak végétal, salade, tomate, avocat', hasSizes: true },
    { id: 'burger9', name: 'Wi Mac Burger', category: ProductCategory.BURGER, categoryName: 'Burgers', prices: { M: 11.90, L: 15.90 }, description: 'Double steak, sauce spéciale, salade, fromage', hasSizes: true },

    // SALADES (avec tailles)
    { id: 'salade1', name: 'Salade Chèvre Miel', category: ProductCategory.SALADES, categoryName: 'Salades', prices: { M: 9.50, L: 13.50 }, description: 'Salade, chèvre chaud, miel, noix, tomates cerises', hasSizes: true },
    { id: 'salade2', name: 'Salade Saumon', category: ProductCategory.SALADES, categoryName: 'Salades', prices: { M: 11.50, L: 15.50 }, description: 'Salade, saumon fumé, avocat, œuf, câpres', hasSizes: true },
    { id: 'salade3', name: 'Salade Chicken', category: ProductCategory.SALADES, categoryName: 'Salades', prices: { M: 9.50, L: 13.50 }, description: 'Salade, poulet grillé, tomates, maïs, croûtons', hasSizes: true },
    { id: 'salade4', name: 'Salade Crudités', category: ProductCategory.SALADES, categoryName: 'Salades', prices: { M: 7.50, L: 11.50 }, description: 'Salade, tomates, concombre, carottes râpées', hasSizes: true },
    { id: 'salade5', name: 'Salade Tomate Mozza', category: ProductCategory.SALADES, categoryName: 'Salades', prices: { M: 8.50, L: 12.50 }, description: 'Salade, tomates, mozzarella, basilic', hasSizes: true },

    // DESSERTS (prix unique)
    { id: 'dessert1', name: 'Tiramisu Nutella Spéculoos', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.50, description: 'Tiramisu maison Nutella et spéculoos', hasSizes: false },
    { id: 'dessert2', name: 'Tiramisu Oréo', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.50, description: 'Tiramisu maison aux biscuits Oréo', hasSizes: false },
    { id: 'dessert3', name: 'Tiramisu Spéculoos Caramel', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.50, description: 'Tiramisu maison spéculoos et caramel', hasSizes: false },
    { id: 'dessert4', name: 'Tarte Daim', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.00, description: 'Tarte aux éclats de Daim', hasSizes: false },
    { id: 'dessert5', name: 'Gaufre', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 3.50, description: 'Gaufre chaude avec garniture au choix', hasSizes: false },
    { id: 'dessert6', name: 'Milkshake Vanille', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.00, description: 'Milkshake à la vanille avec chantilly', hasSizes: false },
    { id: 'dessert7', name: 'Milkshake Fraise', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 4.00, description: 'Milkshake à la fraise avec chantilly', hasSizes: false },
    { id: 'dessert8', name: 'Pizza Briochée', category: ProductCategory.DESSERTS, categoryName: 'Desserts', price: 5.50, description: 'Pizza sucrée avec Nutella et fruits', hasSizes: false },

    // BOISSONS (prix unique)
    { id: 'coca', name: 'Coca-Cola', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Coca-Cola 33cl', hasSizes: false },
    { id: 'coca-cherry', name: 'Coca-Cola Cherry', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Coca-Cola Cherry 33cl', hasSizes: false },
    { id: 'coca-zero', name: 'Coca-Cola Zéro', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Coca-Cola Zéro 33cl', hasSizes: false },
    { id: 'fanta-orange', name: 'Fanta Orange', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Fanta Orange 33cl', hasSizes: false },
    { id: 'fanta-strawberry', name: 'Fanta Strawberry', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Fanta Fraise 33cl', hasSizes: false },
    { id: 'sprite', name: 'Sprite', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Sprite 33cl', hasSizes: false },
    { id: 'orangina', name: 'Orangina', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 2.50, description: 'Orangina 33cl', hasSizes: false },
    { id: 'eau', name: 'Eau', category: ProductCategory.BOISSONS, categoryName: 'Boissons', price: 1.50, description: 'Eau plate 50cl', hasSizes: false },

    // TACOS (prix unique par taille)
    { id: 'tacos1', name: 'Tacos M', category: ProductCategory.TACOS, categoryName: 'Tacos', price: 6.50, description: 'Tacos taille M avec viande au choix', hasSizes: false },
    { id: 'tacos2', name: 'Tacos L', category: ProductCategory.TACOS, categoryName: 'Tacos', price: 7.50, description: 'Tacos taille L avec viande au choix', hasSizes: false },
    { id: 'tacos3', name: 'Tacos XL', category: ProductCategory.TACOS, categoryName: 'Tacos', price: 8.50, description: 'Tacos taille XL avec viande au choix', hasSizes: false },
    { id: 'tacos4', name: 'Tacos XXL', category: ProductCategory.TACOS, categoryName: 'Tacos', price: 9.50, description: 'Tacos taille XXL avec viande au choix', hasSizes: false },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Animation des emojis flottants
  useEffect(() => {
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: 8000 + (index * 500), // Durées différentes pour chaque emoji
            useNativeDriver: true,
          }),
          { resetBeforeIteration: true }
        ).start();
      });
    };

    startFloatingEmojisAnimation();
  }, []);

  const loadProducts = async () => {
    try {
      // Force la mise à jour avec les nouveaux produits pour le développement
      console.log('Loading new product catalog with', defaultProducts.length, 'products');
      setProducts(defaultProducts);
      await AsyncStorage.setItem('@products', JSON.stringify(defaultProducts));
      
      // Version pour la production (utiliser les produits stockés)
      // const storedProducts = await AsyncStorage.getItem('@products');
      // if (storedProducts) {
      //   setProducts(JSON.parse(storedProducts));
      // } else {
      //   setProducts(defaultProducts);
      //   await AsyncStorage.setItem('@products', JSON.stringify(defaultProducts));
      // }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(defaultProducts);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      await AsyncStorage.setItem('@products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    if (product.hasSizes) {
      setNewPriceM(product.prices.M.toString());
      setNewPriceL(product.prices.L.toString());
    } else {
      setNewPrice(product.price.toString());
    }
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePrice = async () => {
    if (editingProduct.hasSizes) {
      // Produits avec tailles (pizzas, burgers, pâtes, salades)
      if (!newPriceM || !newPriceL) {
        Alert.alert('Erreur', 'Veuillez remplir tous les prix');
        return;
      }

      const priceM = parseFloat(newPriceM);
      const priceL = parseFloat(newPriceL);

      if (isNaN(priceM) || isNaN(priceL) || priceM <= 0 || priceL <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer des prix valides');
        return;
      }

      if (priceL <= priceM) {
        Alert.alert('Erreur', 'Le prix L doit être supérieur au prix M');
        return;
      }

      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...product, prices: { M: priceM, L: priceL } }
          : product
      );

      await saveProducts(updatedProducts);
    } else {
      // Produits sans tailles (desserts, boissons, tacos)
      if (!newPrice) {
        Alert.alert('Erreur', 'Veuillez remplir le prix');
        return;
      }

      const price = parseFloat(newPrice);

      if (isNaN(price) || price <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer un prix valide');
        return;
      }

      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...product, price: price }
          : product
      );

      await saveProducts(updatedProducts);
    }

    setIsModalVisible(false);
    setEditingProduct(null);
    setNewPriceM('');
    setNewPriceL('');
    setNewPrice('');

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Prix mis à jour avec succès');
  };

  // Filtrer les produits par catégorie
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);


  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.pricesContainer}>
        {item.hasSizes ? (
          // Produits avec tailles (pizzas, burgers, pâtes, salades)
          <>
            <View style={styles.priceItem}>
              <Text style={styles.sizeLabel}>Taille M</Text>
              <Text style={styles.priceValue}>{item.prices.M.toFixed(2)} €</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.sizeLabel}>Taille L</Text>
              <Text style={styles.priceValue}>{item.prices.L.toFixed(2)} €</Text>
            </View>
          </>
        ) : (
          // Produits sans tailles (desserts, boissons, tacos)
          <View style={[styles.priceItem, styles.singlePriceItem]}>
            <Text style={styles.singlePriceLabel}>Prix</Text>
            <Text style={[styles.priceValue, styles.singlePriceValue]}>{item.price.toFixed(2)} €</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditProduct(item)}
      >
        <LinearGradient
          colors={['#000000', '#000000', '#000000']}
          style={styles.editButtonGradient}
        >
          <Ionicons name="pencil" size={16} color={colors.neutral.white} />
          <Text style={styles.editButtonText}>Modifier les prix</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestion des Prix</Text>
          <View style={styles.headerRight}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{filteredProducts.length} produits</Text>
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersList}
          >
            <TouchableOpacity
              style={[styles.filterBadge, selectedCategory === 'all' && styles.activeFilterBadge]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.filterText, selectedCategory === 'all' && styles.activeFilterText]}>Tout ({products.length})</Text>
            </TouchableOpacity>
            {Object.keys(categoryStyles).map((categoryKey) => {
              const style = categoryStyles[categoryKey];
              const categoryProducts = products.filter(p => p.category === categoryKey);
              if (categoryProducts.length === 0) return null;
              
              return (
                <TouchableOpacity
                  key={categoryKey}
                  style={[styles.filterBadge, selectedCategory === categoryKey && styles.activeFilterBadge]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(categoryKey);
                  }}
                >
                  <Text style={[styles.filterText, selectedCategory === categoryKey && styles.activeFilterText]}>
                    {style.name} ({categoryProducts.length})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={styles.productsContainer}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Edit Price Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Modifier les prix - {editingProduct?.name}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {editingProduct?.hasSizes ? (
                  // Produits avec tailles (pizzas, burgers, pâtes, salades)
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Prix Taille M (€)</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={newPriceM}
                        onChangeText={setNewPriceM}
                        keyboardType="decimal-pad"
                        placeholder="10.50"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Prix Taille L (€)</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={newPriceL}
                        onChangeText={setNewPriceL}
                        keyboardType="decimal-pad"
                        placeholder="14.50"
                      />
                    </View>
                  </>
                ) : (
                  // Produits sans tailles (desserts, boissons, tacos)
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Prix (€)</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="decimal-pad"
                      placeholder="4.50"
                    />
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSavePrice}
                  >
                    <LinearGradient
                      colors={['#000000', '#000000', '#000000']}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>Sauvegarder</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Emojis flottants de fast food avec trajectoires variables */}
        {floatingEmojis.map((animValue, index) => {
          // Liste d'emojis de fast food uniquement
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🍖', '🧀', '🥯', '🌯', '🧈', '🫓'];
          const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];

          // Différents types de trajectoires selon l'index
          const screenWidth = 350; // Largeur approximative
          const screenHeight = 800; // Hauteur approximative

          let startX, endX, startY, endY;

          // Alterner les côtés de départ pour plus de diversité
          switch (index % 4) {
            case 0: // Gauche vers droite, montant
              startX = -30;
              endX = screenWidth + 30;
              startY = screenHeight * 0.8;
              endY = screenHeight * 0.2;
              break;
            case 1: // Droite vers gauche, montant
              startX = screenWidth + 30;
              endX = -30;
              startY = screenHeight * 0.7;
              endY = screenHeight * 0.3;
              break;
            case 2: // Diagonal gauche-bas vers droite-haut
              startX = -30;
              endX = screenWidth + 30;
              startY = screenHeight * 0.9;
              endY = screenHeight * 0.1;
              break;
            default: // Diagonal droite-bas vers gauche-haut
              startX = screenWidth + 30;
              endX = -30;
              startY = screenHeight * 0.85;
              endY = screenHeight * 0.25;
              break;
          }

          // Trajectoire sinusoïdale différente pour chaque emoji
          const amplitude = 20 + (index % 3) * 15; // Amplitude de l'oscillation plus douce

          return (
            <Animated.View
              key={index}
              style={[
                styles.floatingEmoji,
                {
                  transform: [
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startX, endX],
                      }),
                    },
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [
                          startY,
                          startY + (endY - startY) * 0.25 + Math.sin(Math.PI * 0.5) * amplitude,
                          startY + (endY - startY) * 0.5 + Math.sin(Math.PI) * amplitude,
                          startY + (endY - startY) * 0.75 + Math.sin(Math.PI * 1.5) * amplitude,
                          endY,
                        ],
                      }),
                    },
                  ],
                  opacity: animValue.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 0.8, 0.8, 0],
                  }),
                },
              ]}
            >
              <Text style={styles.emojiText}>{currentEmoji}</Text>
            </Animated.View>
          );
        })}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  productsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  productsList: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for tab bar
  },
  productCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    marginBottom: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statsText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  singlePriceItem: {
    flex: 1,
  },
  singlePriceLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  singlePriceValue: {
    fontSize: typography.fontSizes['2xl'],
    textAlign: 'center',
  },
  editButton: {
    borderRadius: borderRadius.md,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    backgroundColor: colors.neutral.gray50,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Filter styles
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filtersList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  filterBadge: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  activeFilterBadge: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  activeFilterText: {
    color: colors.neutral.white,
  },

  // Styles pour les emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 26,
  },
});