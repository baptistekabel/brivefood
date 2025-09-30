// Script de test pour vérifier la connexion à l'imprimante Epson TM-M30III
import printerService from './src/services/PrinterService.js';

console.log('🖨️ Test de connexion à l\'imprimante Epson TM-M30III...');
console.log('IP configurée: 192.168.223.13');

// Test de connexion
printerService.testConnection()
  .then(result => {
    if (result.success) {
      console.log('✅ Test réussi:', result.message);
    } else {
      console.log('❌ Test échoué:', result.error);
      console.log('\n🔧 SOLUTIONS POSSIBLES:');
      console.log('1. Vérifiez que l\'imprimante est allumée');
      console.log('2. Vérifiez que l\'appareil et l\'imprimante sont sur le même réseau WiFi');
      console.log('3. Vérifiez l\'IP de l\'imprimante (imprimez le statut réseau)');
      console.log('4. Sur iOS: Vérifiez que l\'imprimante est compatible AirPrint');
      console.log('5. Sur Android: Configurez le service d\'impression dans Paramètres > Impression');
    }
  })
  .catch(error => {
    console.error('❌ Erreur lors du test:', error);
  });