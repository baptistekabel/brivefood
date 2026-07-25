// Script de test pour le système de notation des commandes
import orderRatingService from './src/services/orderRatingService.js';

console.log('🧪 Test du système de notation des commandes');

// Données de test pour une commande terminée
const mockOrderData = {
  id: 'TEST-123',
  customerName: 'Jean Dupont',
  total: 24.50,
  orderDate: '2025-01-19',
  orderTime: '19:30',
  items: [
    { name: 'Pizza Margherita M', price: 12.90, quantity: 1 },
    { name: 'Coca Cola', price: 2.50, quantity: 1 },
    { name: 'Tiramisu', price: 4.50, quantity: 1 }
  ],
  mode: 'delivery',
  status: 'delivered'
};

async function testRatingSystem() {
  try {
    console.log('\n📋 Test 1: Traitement d\'une commande terminée');

    // Simuler une commande terminée
    const result = await orderRatingService.handleCompletedOrder(mockOrderData);
    console.log('Résultat:', result);

    console.log('\n📋 Test 2: Vérification des notations en attente');

    // Vérifier les notations en attente
    const pendingRatings = await orderRatingService.getPendingRatings();
    console.log('Notations en attente:', pendingRatings);

    console.log('\n📋 Test 3: Vérification du statut de notation');

    // Vérifier si la commande est déjà notée
    const isRated = await orderRatingService.isOrderRated(mockOrderData.id);
    console.log('Commande déjà notée:', isRated);

    console.log('\n📋 Test 4: Simulation d\'une notation');

    // Simuler une notation
    const ratingData = {
      orderId: mockOrderData.id,
      rating: 5,
      comment: 'Excellent service, livraison rapide !',
      timestamp: new Date().toISOString()
    };

    const saveResult = await orderRatingService.saveRating(ratingData);
    console.log('Résultat sauvegarde notation:', saveResult);

    console.log('\n📋 Test 5: Vérification des statistiques');

    // Vérifier les statistiques
    const stats = await orderRatingService.getRatingStats();
    console.log('Statistiques:', stats);

    console.log('\n✅ Tous les tests sont terminés !');

  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error);
  }
}

// Exécuter les tests
testRatingSystem();

export { testRatingSystem, mockOrderData };