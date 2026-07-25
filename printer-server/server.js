const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS pour permettre les requêtes depuis l'app mobile
app.use(cors());
app.use(express.json());

// Configuration de l'imprimante Epson TM-M30III
let printer;

function initPrinter() {
  try {
    printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${process.env.PRINTER_IP || '192.168.1.100'}:9100`,
      characterSet: CharacterSet.PC858_EURO,
      removeSpecialCharacters: false,
      lineCharacter: "=",
      options: {
        timeout: 5000
      }
    });
    
    console.log(`🖨️ Imprimante configurée sur IP: ${process.env.PRINTER_IP || '192.168.1.100'}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration imprimante:', error);
    return false;
  }
}

// Initialisation de l'imprimante au démarrage
initPrinter();

// Route de test du serveur
app.get('/health', (req, res) => {
  res.json({ 
    status: 'active', 
    message: 'Serveur d\'impression BriveFood opérationnel',
    timestamp: new Date().toISOString(),
    printer_ip: process.env.PRINTER_IP || '192.168.1.100'
  });
});

// Test de connexion imprimante
app.get('/printer/test', async (req, res) => {
  try {
    if (!printer) {
      const initialized = initPrinter();
      if (!initialized) {
        return res.status(500).json({ error: 'Imprimante non initialisée' });
      }
    }

    const isConnected = await printer.isPrinterConnected();
    
    if (isConnected) {
      // Imprimer un ticket de test
      printer.clear();
      printer.alignCenter();
      printer.setTypeFontA();
      printer.bold(true);
      printer.println('🍽️ TEST BRIVEFOOD 🍽️');
      printer.bold(false);
      printer.drawLine();
      printer.alignLeft();
      printer.println('✅ Connexion réussie');
      printer.println(`📅 ${new Date().toLocaleString('fr-FR')}`);
      printer.drawLine();
      printer.alignCenter();
      printer.println('Imprimante opérationnelle');
      printer.newLine();
      printer.cut();

      const result = await printer.execute();
      
      res.json({ 
        success: true, 
        message: 'Test d\'impression réussi',
        connected: true 
      });
    } else {
      res.status(500).json({ 
        error: 'Imprimante non connectée',
        connected: false 
      });
    }
  } catch (error) {
    console.error('Erreur test imprimante:', error);
    res.status(500).json({ 
      error: 'Erreur lors du test d\'impression',
      details: error.message 
    });
  }
});

// Route principale : Imprimer une commande
app.post('/print/order', async (req, res) => {
  try {
    const order = req.body;
    
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Données de commande manquantes' });
    }

    console.log(`🖨️ Impression commande #${order.id}`);

    if (!printer) {
      const initialized = initPrinter();
      if (!initialized) {
        return res.status(500).json({ error: 'Imprimante non disponible' });
      }
    }

    // Construction du ticket cuisine
    printer.clear();
    
    // En-tête
    printer.alignCenter();
    printer.setTypeFontA();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println('🍽️ COMMANDE CUISINE 🍽️');
    printer.bold(false);
    printer.setTextNormal();
    printer.drawLine();
    
    // Infos commande
    printer.bold(true);
    printer.println(`COMMANDE #${order.id}`);
    printer.bold(false);
    printer.println(`${new Date().toLocaleString('fr-FR')}`);
    printer.drawLine();
    
    // Client
    printer.alignLeft();
    printer.bold(true);
    printer.println(`CLIENT: ${order.customerName || 'Anonyme'}`);
    printer.bold(false);
    // Téléphone pour tous les types de commande
    if (order.phone) {
      printer.bold(true);
      printer.println(`TEL: ${order.phone}`);
      printer.bold(false);
    }

    printer.drawLine();

    // Mode de commande
    printer.alignCenter();
    printer.bold(true);
    const modeText = getModeText(order.mode);
    printer.println(`📦 ${modeText.toUpperCase()}`);
    printer.bold(false);

    if (order.mode === 'DELIVERY' && order.address) {
      printer.bold(true);
      printer.println(`📍 ${order.address}`);
      printer.bold(false);
    }

    printer.drawLine();

    // Articles à préparer
    printer.alignCenter();
    printer.bold(true);
    printer.println('🍴 ARTICLES À PRÉPARER');
    printer.bold(false);
    printer.alignLeft();

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        printer.newLine();
        printer.bold(true);
        printer.println(`${item.quantity}x ${item.name} — ${(item.price || 0).toFixed(2)}€`);
        printer.bold(false);
        if (item.size) {
          printer.println(`Taille: ${item.size}`);
        }
        // Personnalisations détaillées — item.options contient toutes les options (frites, viandes, boissons, sauces, etc.)
        if (item.options) {
          const optionsList = item.options.split(' | ');
          optionsList.forEach(opt => {
            printer.println(`  > ${opt}`);
          });
        }
        // Toujours vérifier customizations en complément (au cas où options est incomplet ou absent)
        if (item.customizations && item.customizationOptions) {
          const alreadyShown = item.options || '';
          Object.entries(item.customizations).forEach(([catKey, selectedOpts]) => {
            const cat = item.customizationOptions[catKey];
            if (cat && selectedOpts && selectedOpts.length > 0) {
              selectedOpts.forEach(optId => {
                const opt = cat.options ? cat.options.find(o => o.id === optId) : null;
                if (opt && !alreadyShown.includes(opt.name)) {
                  printer.println(`  > ${cat.title || catKey}: ${opt.name}${opt.price > 0 ? ` (+${opt.price.toFixed(2)}€)` : ''}`);
                }
              });
            }
          });
        }
        if (item.comment) {
          printer.bold(true);
          printer.println(`NOTE: ${item.comment}`);
          printer.bold(false);
        }
        printer.drawLine();
      });
    }
    
    // Paiement et total
    printer.newLine();
    printer.bold(true);
    printer.println(`💳 PAIEMENT: ${order.paymentMethod === 'cash' ? '💵 ESPÈCES' : '💳 CARTE'}`);
    printer.println(`💰 TOTAL: ${(order.total || 0).toFixed(2)}€`);
    printer.bold(false);
    
    printer.drawLine();
    
    // Instructions
    printer.alignCenter();
    printer.bold(true);
    printer.println('⏰ À PRÉPARER MAINTENANT');
    printer.bold(false);
    
    if (order.mode === 'DELIVERY') {
      printer.println('🚴 PRÉVOIR LIVREUR');
    } else if (order.mode === 'TAKEOUT') {
      printer.println('🏃 CLIENT VIENT RÉCUPÉRER');
    } else if (order.mode === 'DINE_IN') {
      printer.println('🍽️ À SERVIR EN SALLE');
    }
    
    printer.newLine();
    printer.newLine();
    printer.cut();
    
    // Exécution de l'impression
    await printer.execute();
    
    console.log(`✅ Ticket imprimé pour commande #${order.id}`);
    
    res.json({
      success: true,
      message: `Ticket imprimé pour commande #${order.id}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur impression:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'impression',
      details: error.message
    });
  }
});

// Fonction utilitaire pour convertir le mode
function getModeText(mode) {
  switch (mode) {
    case 'DINE_IN': return 'Sur place';
    case 'TAKEOUT': return 'À emporter';
    case 'DELIVERY': return 'Livraison';
    default: return mode || 'Non spécifié';
  }
}

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('🚀 Serveur d\'impression BriveFood démarré');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🖨️ IP imprimante: ${process.env.PRINTER_IP || '192.168.1.100'}`);
  console.log(`🌍 API disponible sur: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Routes disponibles:');
  console.log('  GET  /health - Statut du serveur');
  console.log('  GET  /printer/test - Test imprimante');
  console.log('  POST /print/order - Imprimer commande');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur d\'impression...');
  process.exit(0);
});