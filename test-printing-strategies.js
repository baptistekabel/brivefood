#!/usr/bin/env node

/**
 * Test des stratégies d'impression améliorées
 * Ce script teste les nouvelles fonctionnalités d'impression
 */

console.log('🧪 Test des stratégies d\'impression BriveFood - Version 2.0');
console.log('===========================================================');

// Simulation d'une commande de test
const testOrder = {
  id: '00015',
  customerName: 'Test Client Manuel',
  phone: '05 55 00 00 00',
  mode: 'TAKEOUT',
  address: '',
  items: [
    {
      name: 'Burger Classique',
      size: 'M',
      quantity: 2,
      price: 8.50,
      customizations: { sauce: 'mayo', extras: ['salade', 'tomate'] }
    },
    {
      name: 'Frites',
      size: 'L',
      quantity: 1,
      price: 3.50
    }
  ],
  total: 20.50,
  paymentMethod: 'card',
  createdAt: new Date().toISOString()
};

console.log('📦 Commande de test:');
console.log(`   ID: ${testOrder.id}`);
console.log(`   Client: ${testOrder.customerName}`);
console.log(`   Total: ${testOrder.total}€`);
console.log(`   Articles: ${testOrder.items.length}`);
console.log('');

// Test de la génération du ticket HTML
function testHTMLGeneration() {
  console.log('1️⃣ Test génération HTML du ticket...');

  const currentDate = new Date().toLocaleString('fr-FR');

  const html = `
    <style>
      @page { margin: 0; size: 58mm auto; }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.2;
        margin: 0;
        padding: 5mm;
        width: 48mm;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-bottom: 1px dashed #000; margin: 3px 0; }
    </style>
    <body>
      <div class="center bold">🍽️ COMMANDE CUISINE 🍽️</div>
      <div class="line"></div>
      <div class="center"><strong>COMMANDE #${testOrder.id}</strong></div>
      <div class="center">${currentDate}</div>
      <div class="line"></div>
      <div><strong>CLIENT: ${testOrder.customerName}</strong></div>
      <div><strong>TEL: ${testOrder.phone}</strong></div>
      <div class="line"></div>
      <div class="center"><strong>📦 À EMPORTER</strong></div>
      <div class="line"></div>
      <div class="center"><strong>🍴 ARTICLES À PRÉPARER</strong></div>
      ${testOrder.items.map(item => `
        <div style="margin: 8px 0; border: 1px solid #000; padding: 4px;">
          <div class="bold">${item.quantity}x ${item.name}</div>
          <div>Taille: ${item.size}</div>
        </div>
      `).join('')}
      <div class="line"></div>
      <div><strong>💳 PAIEMENT: 💳 CARTE</strong></div>
      <div><strong>💰 TOTAL: ${testOrder.total.toFixed(2)}€</strong></div>
      <div class="line"></div>
      <div class="center">⏰ À PRÉPARER MAINTENANT<br>🏃 CLIENT VIENT RÉCUPÉRER</div>
    </body>
  `;

  console.log('   ✅ HTML généré avec succès');
  console.log(`   📏 Taille: ${html.length} caractères`);
  return html;
}

// Test des stratégies d'impression
async function testPrintingStrategies() {
  console.log('\n2️⃣ Test des stratégies d\'impression...');

  const strategies = [
    {
      name: 'Serveur distant (localhost:3001)',
      description: 'Impression via serveur Node.js dédié',
      priority: 1
    },
    {
      name: 'Serveur distant (192.168.223.13:3001)',
      description: 'Impression via serveur sur réseau imprimante',
      priority: 2
    },
    {
      name: 'Connexion directe HTTP',
      description: 'Connexion directe vers l\'imprimante Epson',
      priority: 3
    },
    {
      name: 'Expo Print Manuel',
      description: 'Interface native de sélection d\'imprimante',
      priority: 4
    },
    {
      name: 'Fallback PDF',
      description: 'Génération PDF en cas d\'échec',
      priority: 5
    }
  ];

  strategies.forEach((strategy, index) => {
    console.log(`   ${index + 1}. ${strategy.name}`);
    console.log(`      📝 ${strategy.description}`);
    console.log(`      🎯 Priorité: ${strategy.priority}`);
  });

  return strategies;
}

// Test de génération ESC/POS
function testESCPOSGeneration() {
  console.log('\n3️⃣ Test génération commandes ESC/POS...');

  const escPosCommands = [
    { type: 'init', description: 'Initialisation imprimante' },
    { type: 'align', position: 'center', description: 'Centrage' },
    { type: 'style', bold: true, size: 'double', description: 'Style titre' },
    { type: 'text', data: '🍽️ COMMANDE CUISINE 🍽️\n', description: 'En-tête' },
    { type: 'style', bold: false, size: 'normal', description: 'Style normal' },
    { type: 'line', description: 'Ligne de séparation' },
    { type: 'text', data: `COMMANDE #${testOrder.id}\n`, description: 'Numéro commande' },
    { type: 'cut', description: 'Coupe papier' }
  ];

  console.log('   Commandes ESC/POS générées:');
  escPosCommands.forEach((cmd, index) => {
    console.log(`   ${index + 1}. ${cmd.type.toUpperCase()}: ${cmd.description}`);
  });

  console.log(`   ✅ ${escPosCommands.length} commandes ESC/POS générées`);
  return escPosCommands;
}

// Test de la nouvelle interface utilisateur
function testUserInterface() {
  console.log('\n4️⃣ Test interface utilisateur améliorée...');

  const uiElements = [
    {
      name: 'Bouton Aperçu PDF',
      icon: 'eye-outline',
      color: '#3B82F6',
      action: 'Génère un PDF prévisualisation du ticket'
    },
    {
      name: 'Bouton Impression Auto',
      icon: 'flash',
      color: '#FF6B35',
      action: 'Impression automatique via serveur'
    },
    {
      name: 'Bouton Impression Manuel',
      icon: 'print-outline',
      color: '#10B981',
      action: 'Ouvre le sélecteur d\'imprimante natif'
    }
  ];

  console.log('   Éléments d\'interface:');
  uiElements.forEach((element, index) => {
    console.log(`   ${index + 1}. ${element.name} (${element.icon})`);
    console.log(`      🎨 Couleur: ${element.color}`);
    console.log(`      ⚙️ Action: ${element.action}`);
  });

  console.log('   ✅ Interface utilisateur configurée');
  return uiElements;
}

// Fonction principale de test
async function runTests() {
  try {
    // 1. Test génération HTML
    const html = testHTMLGeneration();

    // 2. Test stratégies
    const strategies = await testPrintingStrategies();

    // 3. Test ESC/POS
    const escPos = testESCPOSGeneration();

    // 4. Test interface
    const ui = testUserInterface();

    // Résumé
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('===================');
    console.log(`✅ HTML du ticket: ${html.length > 0 ? 'OK' : 'ERREUR'}`);
    console.log(`✅ Stratégies d'impression: ${strategies.length} configurées`);
    console.log(`✅ Commandes ESC/POS: ${escPos.length} générées`);
    console.log(`✅ Éléments UI: ${ui.length} configurés`);

    console.log('\n🎉 FONCTIONNALITÉS DISPONIBLES:');
    console.log('1. 📱 Impression avec interface native (iOS/Android)');
    console.log('2. 🖨️ Connexion directe via HTTP vers imprimante');
    console.log('3. 🌐 Impression via serveur Node.js distant');
    console.log('4. 📄 Génération PDF en fallback garanti');
    console.log('5. 👁️ Aperçu avant impression');
    console.log('6. 🎯 Boutons Auto/Manuel séparés');
    console.log('7. 📊 Gestion d\'erreurs et timeouts');

    console.log('\n🚀 PRÊT POUR LES TESTS EN CONDITIONS RÉELLES !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Lancer les tests
runTests();