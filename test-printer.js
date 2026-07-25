#!/usr/bin/env node

/**
 * Script de test pour l'imprimante Epson TM-M30III
 * Usage: node test-printer.js
 */

const fetch = require('node-fetch').default || require('node-fetch');

// Configuration
const PRINTER_IP = '192.168.223.13';
const SERVER_URL = 'http://localhost:3001';

console.log('🧪 Test de l\'imprimante Epson TM-M30III');
console.log('===========================================');

async function testPrinterConnection() {
  console.log('\n1️⃣ Test de connexion directe à l\'imprimante...');

  try {
    // Test ping sur port 9100 (ESC/POS)
    const net = require('net');
    const socket = new net.Socket();

    return new Promise((resolve) => {
      socket.setTimeout(3000);

      socket.on('connect', () => {
        console.log(`✅ Imprimante accessible sur ${PRINTER_IP}:9100`);
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        console.log(`❌ Timeout - Imprimante non accessible sur ${PRINTER_IP}:9100`);
        socket.destroy();
        resolve(false);
      });

      socket.on('error', (error) => {
        console.log(`❌ Erreur connexion: ${error.message}`);
        socket.destroy();
        resolve(false);
      });

      socket.connect(9100, PRINTER_IP);
    });

  } catch (error) {
    console.log(`❌ Erreur test connexion: ${error.message}`);
    return false;
  }
}

async function testServerHealth() {
  console.log('\n2️⃣ Test du serveur d\'impression...');

  try {
    const response = await fetch(`${SERVER_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });

    if (!response.ok) {
      console.log(`❌ Serveur inaccessible: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Serveur actif: ${data.message}`);
    console.log(`🖨️ IP imprimante configurée: ${data.printer_ip}`);
    return true;

  } catch (error) {
    console.log(`❌ Serveur non disponible: ${error.message}`);
    console.log(`💡 Démarrez le serveur avec: cd printer-server && npm start`);
    return false;
  }
}

async function testPrinterViaServer() {
  console.log('\n3️⃣ Test d\'impression via le serveur...');

  try {
    const response = await fetch(`${SERVER_URL}/printer/test`, {
      method: 'GET',
      timeout: 10000
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Test échoué: ${data.error}`);
      return false;
    }

    console.log(`✅ ${data.message}`);
    console.log(`🖨️ Un ticket de test devrait être imprimé !`);
    return true;

  } catch (error) {
    console.log(`❌ Erreur test impression: ${error.message}`);
    return false;
  }
}

async function testOrderPrinting() {
  console.log('\n4️⃣ Test d\'impression d\'une commande...');

  const testOrder = {
    id: 'TEST001',
    customerName: 'Client Test',
    phone: '05 55 00 00 00',
    mode: 'TAKEOUT',
    address: '',
    items: [
      {
        name: 'Pizza Margherita',
        size: 'M',
        quantity: 1,
        price: 12.50,
        options: 'Extra fromage'
      },
      {
        name: 'Coca-Cola',
        size: '33cl',
        quantity: 2,
        price: 2.50
      }
    ],
    total: 17.50,
    paymentMethod: 'cash',
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch(`${SERVER_URL}/print/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder),
      timeout: 15000
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Impression échouée: ${data.error}`);
      return false;
    }

    console.log(`✅ ${data.message}`);
    console.log(`🎟️ Ticket de commande imprimé !`);
    return true;

  } catch (error) {
    console.log(`❌ Erreur impression commande: ${error.message}`);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log(`🔧 Configuration: ${PRINTER_IP} via ${SERVER_URL}`);

  const tests = [
    { name: 'Connexion imprimante', fn: testPrinterConnection },
    { name: 'Serveur d\'impression', fn: testServerHealth },
    { name: 'Test impression', fn: testPrinterViaServer },
    { name: 'Impression commande', fn: testOrderPrinting }
  ];

  let passedTests = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) passedTests++;

    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 RÉSULTATS');
  console.log('=============');
  console.log(`✅ Tests réussis: ${passedTests}/${tests.length}`);
  console.log(`❌ Tests échoués: ${tests.length - passedTests}/${tests.length}`);

  if (passedTests === tests.length) {
    console.log('\n🎉 Tous les tests sont passés ! L\'impression est opérationnelle.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    console.log('\n🔧 DÉPANNAGE:');
    console.log('1. Vérifiez que l\'imprimante est allumée et connectée au réseau');
    console.log('2. Confirmez l\'IP avec le bouton FEED (statut réseau)');
    console.log('3. Démarrez le serveur: cd printer-server && npm start');
    console.log('4. Vérifiez le pare-feu (ports 9100 et 3001)');
  }
}

// Lancer les tests
runTests().catch(error => {
  console.error('❌ Erreur critique:', error);
  process.exit(1);
});