import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

class TabletPrinterService {
  constructor() {
    this.printerIP = '192.168.10.110'; // IP de votre Epson TM-M30III
    this.isTabletMode = false; // Mode tablette restaurant
    this.pendingOrders = []; // Commandes en attente d'impression
  }

  // Activer le mode tablette restaurant
  async enableTabletMode() {
    this.isTabletMode = true;
    await AsyncStorage.setItem('@tabletMode', 'true');
    console.log('🏪 Mode tablette restaurant activé');
    
    // Démarrer l'écoute des nouvelles commandes
    this.startListeningForOrders();
  }

  // Désactiver le mode tablette
  async disableTabletMode() {
    this.isTabletMode = false;
    await AsyncStorage.setItem('@tabletMode', 'false');
    console.log('📱 Mode tablette restaurant désactivé');
  }

  // Vérifier si on est en mode tablette
  async checkTabletMode() {
    const tabletMode = await AsyncStorage.getItem('@tabletMode');
    this.isTabletMode = tabletMode === 'true';
    return this.isTabletMode;
  }

  // Configuration de l'IP imprimante
  async setPrinterIP(ip) {
    this.printerIP = ip;
    await AsyncStorage.setItem('@printerIP', ip);
    console.log(`🖨️ IP imprimante configurée: ${ip}`);
  }

  async getPrinterIP() {
    const stored = await AsyncStorage.getItem('@printerIP');
    if (stored) this.printerIP = stored;
    return this.printerIP;
  }

  // Écouter les nouvelles commandes (simulation avec AsyncStorage)
  async startListeningForOrders() {
    if (!this.isTabletMode) return;

    console.log('👂 Écoute des nouvelles commandes...');
    
    // Vérifier les nouvelles commandes toutes les 2 secondes
    setInterval(async () => {
      try {
        const orders = await this.checkForNewOrders();
        
        if (orders && orders.length > 0) {
          console.log(`📥 ${orders.length} nouvelle(s) commande(s) détectée(s)`);
          
          for (const order of orders) {
            await this.printOrderAutomatically(order);
            await this.markOrderAsPrinted(order.id);
          }
        }
      } catch (error) {
        console.error('Erreur écoute commandes:', error);
      }
    }, 2000);
  }

  // Vérifier s'il y a de nouvelles commandes
  async checkForNewOrders() {
    try {
      // Récupérer toutes les commandes
      const storedOrders = await AsyncStorage.getItem('@orders');
      if (!storedOrders) return [];

      const allOrders = JSON.parse(storedOrders);
      
      // Récupérer les commandes déjà imprimées
      const printedOrders = await AsyncStorage.getItem('@printedOrders');
      const printedIds = printedOrders ? JSON.parse(printedOrders) : [];
      
      // Filtrer les nouvelles commandes (non imprimées)
      const newOrders = allOrders.filter(order => !printedIds.includes(order.id));
      
      return newOrders;
    } catch (error) {
      console.error('Erreur vérification nouvelles commandes:', error);
      return [];
    }
  }

  // Marquer une commande comme imprimée
  async markOrderAsPrinted(orderId) {
    try {
      const printedOrders = await AsyncStorage.getItem('@printedOrders');
      const printedIds = printedOrders ? JSON.parse(printedOrders) : [];
      
      if (!printedIds.includes(orderId)) {
        printedIds.push(orderId);
        await AsyncStorage.setItem('@printedOrders', JSON.stringify(printedIds));
        console.log(`✅ Commande #${orderId} marquée comme imprimée`);
      }
    } catch (error) {
      console.error('Erreur marquage commande:', error);
    }
  }

  // Imprimer automatiquement une commande (sur tablette restaurant)
  async printOrderAutomatically(order) {
    if (!this.isTabletMode) {
      console.log('⚠️ Pas en mode tablette, impression annulée');
      return { success: false, error: 'Mode tablette non activé' };
    }

    try {
      console.log(`🖨️ [TABLETTE] Impression automatique commande #${order.id}`);
      
      const html = this.generateKitchenTicketHTML(order);
      
      // Tentatives d'impression par priorité
      
      // 1. Impression directe sur imprimante réseau (meilleure option)
      try {
        const result = await this.printToNetworkPrinter(html);
        if (result.success) {
          console.log(`✅ [TABLETTE] Impression réseau réussie #${order.id}`);
          return result;
        }
      } catch (networkError) {
        console.log('⚠️ [TABLETTE] Impression réseau échouée, essai système...');
      }

      // 2. Impression via système (AirPrint, etc.)
      try {
        const result = await Print.printAsync({
          html,
          width: 220, // 58mm
          margins: { left: 0, right: 0, top: 5, bottom: 5 }
        });
        
        if (result.uri || result.success !== false) {
          console.log(`✅ [TABLETTE] Impression système réussie #${order.id}`);
          return { success: true, message: 'Imprimé via système' };
        }
      } catch (systemError) {
        console.log('⚠️ [TABLETTE] Impression système échouée, sauvegarde PDF...');
      }

      // 3. Sauvegarde PDF comme fallback
      const { uri } = await Print.printToFileAsync({ html });
      console.log(`📄 [TABLETTE] PDF sauvegardé: ${uri}`);
      
      // Auto-partage du PDF pour impression manuelle
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `🍽️ Ticket Cuisine #${order.id}`,
          mimeType: 'application/pdf'
        });
      }
      
      return { 
        success: true, 
        message: `PDF généré pour commande #${order.id}. Impression manuelle nécessaire.`,
        uri 
      };

    } catch (error) {
      console.error(`❌ [TABLETTE] Erreur impression #${order.id}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Impression directe sur imprimante réseau
  async printToNetworkPrinter(html) {
    try {
      const printOptions = {
        html,
        width: 220, // 58mm pour imprimante thermique
        margins: { left: 0, right: 0, top: 5, bottom: 5 },
        orientation: 'portrait',
        printerUrl: `http://${this.printerIP}:631/ipp/print`, // IPP standard
      };

      const result = await Print.printAsync(printOptions);
      
      if (result.success || result.uri) {
        return { success: true, message: 'Impression réseau réussie' };
      } else {
        throw new Error('Impression réseau échouée');
      }
    } catch (error) {
      throw new Error(`Erreur impression réseau: ${error.message}`);
    }
  }

  // Génération HTML ticket cuisine optimisé
  generateKitchenTicketHTML(order) {
    const now = new Date().toLocaleString('fr-FR');
    
    const style = `
      <style>
        @page { margin: 0; size: 58mm auto; }
        body { 
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.2;
          margin: 0;
          padding: 3mm;
          width: 52mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 2px 0; }
        .big { font-size: 13px; }
        .item-box { 
          border: 1px solid #000; 
          margin: 4px 0; 
          padding: 2px; 
          background: #f9f9f9;
        }
        .urgent { 
          background: #ffebee; 
          border: 2px solid #f44336;
          padding: 4px;
          margin: 4px 0;
        }
      </style>
    `;

    const modeText = this.getModeText(order.mode);
    const modeIcon = this.getModeIcon(order.mode);
    const urgentClass = (order.mode === 'DELIVERY') ? 'urgent' : '';

    return `
      ${style}
      <body>
        <div class="center bold big">
          COMMANDE CUISINE
        </div>
        <div class="line"></div>
        
        <div class="center bold">
          COMMANDE #${order.id}
        </div>
        <div class="center">${now}</div>
        <div class="line"></div>
        
        <div class="bold">CLIENT: ${order.customerName || 'Anonyme'}</div>
        ${order.phone ? `<div class="bold">TEL: ${order.phone}</div>` : ''}
        <div class="line"></div>
        
        <div class="center bold ${urgentClass}">
          ${modeText.toUpperCase()}
        </div>
        ${order.mode === 'DELIVERY' && order.address ? 
          `<div class="bold">ADRESSE: ${order.address}</div>` : ''
        }
        <div class="line"></div>
        
        <div class="center bold">ARTICLES A PREPARER</div>
        ${order.items ? order.items.map(item => `
          <div class="item-box">
            <div class="bold">${item.quantity}x ${item.name}</div>
            <div>Taille: ${item.size}</div>
            ${item.options ? `<div>OPTIONS: ${item.options}</div>` : ''}
          </div>
        `).join('') : '<div>Aucun article</div>'}
        
        <div class="line"></div>
        <div class="bold">PAIEMENT: ${order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE'}</div>
        <div class="bold">TOTAL: ${(order.total || 0).toFixed(2)} EUR</div>
        <div class="line"></div>
        
        
        <div style="height: 15px;"></div>
      </body>
    `;
  }

  getModeText(mode) {
    switch (mode) {
      case 'DINE_IN': return 'Sur place';
      case 'TAKEOUT': return 'À emporter';
      case 'DELIVERY': return 'Livraison';
      default: return mode || 'Non spécifié';
    }
  }

  getModeIcon(mode) {
    switch (mode) {
      case 'DINE_IN': return '🍽️';
      case 'TAKEOUT': return '🏃';
      case 'DELIVERY': return '🚴';
      default: return '📦';
    }
  }

  getInstructions(mode) {
    switch (mode) {
      case 'DINE_IN': return '🍽️ À SERVIR EN SALLE';
      case 'TAKEOUT': return '🏃 CLIENT VIENT RÉCUPÉRER';
      case 'DELIVERY': return '🚴 PRÉVOIR LIVREUR';
      default: return '📦 PRÉPARER LA COMMANDE';
    }
  }

  // Test de connexion tablette
  async testTabletConnection() {
    try {
      console.log('🧪 Test connexion tablette...');
      
      const testOrder = {
        id: 'TEST' + Date.now(),
        customerName: 'Test Tablette',
        phone: '05 55 00 00 00',
        mode: 'TAKEOUT',
        paymentMethod: 'cash',
        items: [
          { name: 'Pizza Test', size: 'M', quantity: 1, price: 10.00 }
        ],
        total: 10.00,
        createdAt: new Date().toISOString()
      };

      const result = await this.printOrderAutomatically(testOrder);
      return result;
      
    } catch (error) {
      return { success: false, error: `Test tablette échoué: ${error.message}` };
    }
  }
}

// Instance singleton
const tabletPrinterService = new TabletPrinterService();
export default tabletPrinterService;