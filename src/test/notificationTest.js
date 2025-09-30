// Test et validation du système de notifications push
import { Alert } from 'react-native';
import notificationService from '../services/notificationService';
import orderNotificationService, { simulateOrder, getStats } from '../services/orderNotificationService';

class NotificationTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  // Exécuter tous les tests
  async runAllTests() {
    if (this.isRunning) {
      console.log('⏳ Tests déjà en cours...');
      return;
    }

    this.isRunning = true;
    this.testResults = [];

    console.log('🧪 Début des tests de notifications...');

    try {
      await this.testPermissions();
      await this.testTokenGeneration();
      await this.testLocalNotification();
      await this.testOrderNotification();
      await this.testNotificationData();
      await this.testBadgeUpdate();

      this.displayResults();
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Test 1: Vérifier les permissions
  async testPermissions() {
    console.log('🔐 Test des permissions...');

    try {
      await notificationService.initialize();
      const token = await notificationService.getPushToken();

      if (token) {
        this.addResult('✅ Permissions', 'Accordées et token généré');
      } else {
        this.addResult('⚠️ Permissions', 'Non accordées ou erreur token');
      }
    } catch (error) {
      this.addResult('❌ Permissions', `Erreur: ${error.message}`);
    }
  }

  // Test 2: Génération du token
  async testTokenGeneration() {
    console.log('🔑 Test de génération du token...');

    try {
      const token = await notificationService.getPushToken();

      if (token && token.length > 20) {
        this.addResult('✅ Token', `Généré (${token.substring(0, 20)}...)`);
      } else {
        this.addResult('❌ Token', 'Non généré ou invalide');
      }
    } catch (error) {
      this.addResult('❌ Token', `Erreur: ${error.message}`);
    }
  }

  // Test 3: Notification locale
  async testLocalNotification() {
    console.log('📱 Test notification locale...');

    try {
      await notificationService.sendLocalNotification(
        '🧪 Test Notification',
        'Ceci est un test du système de notifications',
        { type: 'test', timestamp: Date.now() }
      );

      this.addResult('✅ Notification locale', 'Envoyée avec succès');

      // Attendre un peu pour voir si elle arrive
      await this.delay(1000);
    } catch (error) {
      this.addResult('❌ Notification locale', `Erreur: ${error.message}`);
    }
  }

  // Test 4: Notification de commande
  async testOrderNotification() {
    console.log('🍕 Test notification de commande...');

    try {
      const testOrder = {
        id: 'TEST-' + Date.now(),
        customerName: 'Client Test',
        total: 25.50,
        items: ['Pizza Test', 'Boisson Test'],
      };

      await simulateOrder(testOrder);
      this.addResult('✅ Notification commande', `Commande ${testOrder.id} simulée`);
    } catch (error) {
      this.addResult('❌ Notification commande', `Erreur: ${error.message}`);
    }
  }

  // Test 5: Données de notification
  async testNotificationData() {
    console.log('📊 Test des données de notification...');

    try {
      const stats = getStats();

      if (stats) {
        this.addResult('✅ Données', `Tokens admin: ${stats.activeAdminTokens}, Mode: ${stats.simulationMode ? 'Simulation' : 'Production'}`);
      } else {
        this.addResult('❌ Données', 'Impossible de récupérer les statistiques');
      }
    } catch (error) {
      this.addResult('❌ Données', `Erreur: ${error.message}`);
    }
  }

  // Test 6: Badge de l'app
  async testBadgeUpdate() {
    console.log('🔴 Test mise à jour du badge...');

    try {
      await notificationService.updateBadgeCount();
      this.addResult('✅ Badge', 'Mis à jour avec succès');
    } catch (error) {
      this.addResult('❌ Badge', `Erreur: ${error.message}`);
    }
  }

  // Ajouter un résultat de test
  addResult(test, result) {
    this.testResults.push({ test, result, timestamp: new Date().toLocaleTimeString() });
    console.log(`${test}: ${result}`);
  }

  // Afficher les résultats
  displayResults() {
    console.log('\n📋 RÉSULTATS DES TESTS:');
    console.log('='.repeat(50));

    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.result} (${result.timestamp})`);
    });

    const successCount = this.testResults.filter(r => r.test.startsWith('✅')).length;
    const totalTests = this.testResults.length;

    console.log('='.repeat(50));
    console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);

    if (successCount === totalTests) {
      console.log('🎉 Tous les tests sont passés avec succès!');
      Alert.alert(
        '🎉 Tests réussis!',
        `Tous les tests de notifications sont passés (${successCount}/${totalTests})`,
        [{ text: 'Parfait!' }]
      );
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
      Alert.alert(
        '⚠️ Tests partiels',
        `${successCount}/${totalTests} tests réussis. Vérifiez la configuration.`,
        [{ text: 'OK' }]
      );
    }
  }

  // Test rapide pour les notifications
  async quickTest() {
    console.log('⚡ Test rapide des notifications...');

    try {
      // Test de base
      const token = await notificationService.getPushToken();

      if (!token) {
        Alert.alert('❌ Test échoué', 'Aucun token de notification disponible');
        return false;
      }

      // Envoyer une notification test
      await notificationService.sendLocalNotification(
        '⚡ Test Rapide',
        'Notification test envoyée!',
        { type: 'quick_test' }
      );

      Alert.alert(
        '✅ Test rapide réussi',
        'Notification envoyée. Si vous ne la voyez pas, vérifiez les paramètres de votre appareil.',
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('❌ Erreur test rapide:', error);
      Alert.alert('❌ Test échoué', `Erreur: ${error.message}`);
      return false;
    }
  }

  // Test d'intégration avec simulation de commande
  async integrationTest() {
    console.log('🔄 Test d\'intégration...');

    const scenarios = [
      {
        name: 'Commande normale',
        order: { id: 'INT-001', customerName: 'Marie Dupont', total: 28.50, items: ['Pizza Margherita'] }
      },
      {
        name: 'Grosse commande',
        order: { id: 'INT-002', customerName: 'Société ABC', total: 125.80, items: ['5 Pizzas', '3 Boissons'] }
      },
      {
        name: 'Commande express',
        order: { id: 'INT-003', customerName: 'Client Pressé', total: 15.20, items: ['Sandwich'] }
      }
    ];

    for (const scenario of scenarios) {
      console.log(`📦 Test: ${scenario.name}`);
      await simulateOrder(scenario.order);
      await this.delay(2000); // Attendre entre chaque test
    }

    Alert.alert(
      '🔄 Tests d\'intégration terminés',
      `${scenarios.length} scénarios de commandes testés`,
      [{ text: 'OK' }]
    );
  }

  // Fonction utilitaire pour attendre
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtenir les résultats des tests
  getTestResults() {
    return this.testResults;
  }

  // Réinitialiser les tests
  reset() {
    this.testResults = [];
    this.isRunning = false;
    console.log('🔄 Tests réinitialisés');
  }
}

// Instance singleton pour les tests
const notificationTester = new NotificationTester();

// Fonctions exportées
export default notificationTester;

export const runAllTests = () => notificationTester.runAllTests();
export const quickTest = () => notificationTester.quickTest();
export const integrationTest = () => notificationTester.integrationTest();
export const getResults = () => notificationTester.getTestResults();
export const resetTests = () => notificationTester.reset();

// Test automatique au démarrage de l'app (optionnel)
export const autoTest = async () => {
  console.log('🚀 Test automatique des notifications au démarrage...');

  try {
    const token = await notificationService.getPushToken();
    if (token) {
      console.log('✅ Notifications prêtes au démarrage');
    } else {
      console.log('⚠️ Notifications non configurées');
    }
  } catch (error) {
    console.log('❌ Erreur lors du test automatique:', error.message);
  }
};