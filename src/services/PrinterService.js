import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

class PrinterService {
  constructor() {
    this.printerName = 'Epson TM-M30III';
    this.isConnected = false;
  }

  // Génère le HTML du ticket de caisse
  generateReceiptHTML(order) {
    const currentDate = new Date().toLocaleString('fr-FR');
    
    // Calcul des totaux
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = order.mode === 'DELIVERY' ? (order.deliveryFee || 0) : 0;
    const total = subtotal + deliveryFee;

    // Style CSS pour imprimante thermique (58mm)
    const style = `
      <style>
        @page { 
          margin: 0; 
          size: 58mm auto;
        }
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
        .header { font-size: 14px; margin-bottom: 5px; }
        .order-info { margin: 5px 0; }
        .item { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 13px; font-weight: bold; margin-top: 5px; }
        .footer { margin-top: 10px; font-size: 10px; }
      </style>
    `;

    // Contenu du ticket CUISINE/RESTAURATEUR
    const html = `
      ${style}
      <body>
        <div class="center header bold">
          🍽️ COMMANDE CUISINE 🍽️
        </div>
        
        <div class="line"></div>
        
        <div class="order-info">
          <div class="center"><strong>COMMANDE #${order.id}</strong></div>
          <div class="center">${currentDate}</div>
        </div>
        
        <div class="line"></div>
        
        <div><strong>CLIENT: ${order.customerName}</strong></div>
        ${order.phone ? `<div><strong>TEL: ${order.phone}</strong></div>` : ''}
        
        <div class="line"></div>
        
        <div class="center"><strong>📦 ${this.getModeText(order.mode).toUpperCase()}</strong></div>
        ${order.mode === 'DELIVERY' && order.address ? `<div><strong>📍 ${order.address}</strong></div>` : ''}
        
        <div class="line"></div>
        
        <div class="center"><strong>🍴 ARTICLES À PRÉPARER</strong></div>
        ${order.items.map(item => `
          <div style="margin: 8px 0; border: 1px solid #000; padding: 4px;">
            <div class="bold">${item.quantity}x ${item.name}</div>
            <div>Taille: ${item.size}</div>
            ${item.options ? `<div>Options: ${item.options}</div>` : ''}
          </div>
        `).join('')}
        
        <div class="line"></div>
        
        <div><strong>💳 PAIEMENT: ${order.paymentMethod === 'cash' ? '💵 ESPÈCES' : '💳 CARTE'}</strong></div>
        <div><strong>💰 TOTAL: ${total.toFixed(2)}€</strong></div>
        
        <div class="line"></div>
        
        <div class="center">
          ⏰ À PRÉPARER MAINTENANT<br>
          ${this.getModeText(order.mode) === 'Livraison' ? '🚴 PRÉVOIR LIVREUR' : ''}<br>
          ${this.getModeText(order.mode) === 'À emporter' ? '🏃 CLIENT VIENT RÉCUPÉRER' : ''}<br>
          ${this.getModeText(order.mode) === 'Sur place' ? '🍽️ À SERVIR EN SALLE' : ''}
        </div>
        
        <div style="height: 30px;"></div>
      </body>
    `;

    return html;
  }

  // Convertit le mode de commande en texte français
  getModeText(mode) {
    switch (mode) {
      case 'DINE_IN': return 'Sur place';
      case 'TAKEOUT': return 'À emporter';
      case 'DELIVERY': return 'Livraison';
      default: return mode;
    }
  }

  // Imprime le ticket automatiquement
  async printReceipt(order) {
    try {
      console.log(`🖨️  Impression du ticket pour la commande #${order.id}...`);
      
      const html = this.generateReceiptHTML(order);
      
      // 🎯 STRATÉGIE MULTI-NIVEAUX D'IMPRESSION
      
      // Niveau 1: Tentative impression directe sur imprimante réseau
      try {
        const printOptions = {
          html,
          width: 220, // 58mm = ~220 pixels
          margins: { left: 0, right: 0, top: 10, bottom: 10 },
          orientation: 'portrait',
          printerUrl: this.findEpsonPrinter(),
        };

        const result = await Print.printAsync(printOptions);
        
        if (result.success) {
          console.log('✅ Niveau 1: Impression réseau réussie');
          return { success: true, message: 'Ticket imprimé sur imprimante réseau' };
        }
      } catch (networkError) {
        console.log('⚠️ Niveau 1: Impression réseau échouée:', networkError.message);
      }

      // Niveau 2: Impression via système (AirPrint iOS, Google Cloud Print Android)
      try {
        const result = await Print.printAsync({ html });
        console.log('✅ Niveau 2: Impression système réussie');
        return { success: true, message: 'Ticket envoyé à l\'imprimante système' };
      } catch (systemError) {
        console.log('⚠️ Niveau 2: Impression système échouée:', systemError.message);
      }

      // Niveau 3: Sauvegarde PDF + partage
      const { uri } = await Print.printToFileAsync({ html });
      console.log(`📄 Niveau 3: Ticket sauvegardé en PDF: ${uri}`);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Ticket Commande #${order.id}`,
          mimeType: 'application/pdf',
        });
        return { 
          success: true, 
          message: 'Ticket sauvegardé en PDF et partagé. Vous pouvez l\'imprimer manuellement.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Imprimante non accessible. Ticket sauvegardé mais partage impossible.' 
      };
      
    } catch (error) {
      console.error('❌ Toutes les méthodes d\'impression ont échoué:', error);
      return { 
        success: false, 
        error: `Impression impossible: ${error.message}` 
      };
    }
  }

  // Configure l'IP de votre imprimante Epson TM-M30III
  findEpsonPrinter() {
    // 🔧 CONFIGUREZ ICI L'IP DE VOTRE IMPRIMANTE
    // 
    // Étapes pour trouver l'IP :
    // 1. Allumez votre imprimante Epson TM-M30III
    // 2. Maintenez le bouton FEED pour imprimer le statut réseau
    // 3. L'IP sera affichée sur le ticket imprimé
    // 4. Remplacez 192.168.1.100 par votre IP ci-dessous :
    
    const VOTRE_IP_IMPRIMANTE = '192.168.1.100'; // ⬅️ MODIFIEZ CETTE IP
    
    // URLs à tester selon votre configuration réseau
    const urlsToTry = [
      `http://${VOTRE_IP_IMPRIMANTE}:631/ipp/print`,  // IPP standard
      `http://${VOTRE_IP_IMPRIMANTE}:9100`,           // Port RAW
      `http://${VOTRE_IP_IMPRIMANTE}:80`,             // HTTP standard
    ];
    
    console.log(`🖨️ Tentative connexion imprimante: ${urlsToTry[0]}`);
    return urlsToTry[0];
  }

  // Test de connexion avec l'imprimante
  async testConnection() {
    try {
      const testOrder = {
        id: 'TEST001',
        customerName: 'Test Client',
        phone: '05 55 00 00 00',
        mode: 'TAKEOUT',
        paymentMethod: 'cash',
        items: [
          { name: 'Pizza Margherita', size: 'M', quantity: 1, price: 12.50 }
        ],
        total: 12.50
      };

      const result = await this.printReceipt(testOrder);
      return result;
      
    } catch (error) {
      console.error('Test connexion imprimante:', error);
      return { success: false, error: 'Test de connexion échoué' };
    }
  }
}

// Instance singleton
const printerService = new PrinterService();
export default printerService;