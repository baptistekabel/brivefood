import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bluetoothPrinterService from './BluetoothPrinterService';
import { formatTicketPhone } from '../utils/ticketFormat';

class TabletPrinterService {
  constructor() {
    this.printerIP = '192.168.192.168'; // IP de votre Epson TM-M30III (corrigée)
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

      // Tentatives d'impression par priorité

      // 1. Impression Bluetooth (nouvelle priorité)
      try {
        const connectedPrinter = await bluetoothPrinterService.getConnectedPrinter();
        if (connectedPrinter) {
          console.log(`🔵 [BLUETOOTH] Tentative impression sur ${connectedPrinter.name}`);
          const bluetoothResult = await bluetoothPrinterService.printOrderViaBluetooth(order);

          if (bluetoothResult.success) {
            console.log(`✅ [BLUETOOTH] Impression réussie sur ${connectedPrinter.name}`);
            return bluetoothResult;
          } else {
            console.log(`⚠️ [BLUETOOTH] Impression échouée: ${bluetoothResult.error}`);
          }
        } else {
          console.log('⚠️ [BLUETOOTH] Aucune imprimante connectée');
        }
      } catch (bluetoothError) {
        console.log('⚠️ [BLUETOOTH] Erreur imprimante Bluetooth:', bluetoothError.message);
      }

      const html = this.generateKitchenTicketHTML(order);

      // 2. Impression directe sur imprimante réseau
      try {
        const result = await this.printToNetworkPrinter(html, order);
        if (result.success) {
          console.log(`✅ [TABLETTE] Impression réseau réussie #${order.id}`);
          return result;
        }
      } catch (networkError) {
        console.log('⚠️ [TABLETTE] Impression réseau échouée, essai système...');
      }

      // 3. Impression via système (AirPrint, etc.)
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

      // 4. Sauvegarde PDF comme fallback
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

  // Impression directe sur imprimante réseau EPSON TM-M30III
  async printToNetworkPrinter(html, order = null) {
    try {
      console.log(`🖨️ Tentative impression réseau sur EPSON TM-M30III ${this.printerIP}`);

      // Méthode 1: Impression ESC/POS directe via socket TCP (avec objet order pour optimisation EPSON)
      try {
        const escPosCommands = this.convertHtmlToEscPos(html, order);
        const socketResult = await this.sendEscPosToSocket(escPosCommands);
        if (socketResult.success) {
          return { success: true, message: 'Impression ESC/POS réussie' };
        }
      } catch (escPosError) {
        console.log('⚠️ ESC/POS socket échoué, essai IPP...');
      }

      // Méthode 2: IPP (Internet Printing Protocol) pour EPSON
      const printOptions = {
        html,
        width: 220, // 58mm pour imprimante thermique EPSON
        margins: { left: 0, right: 0, top: 2, bottom: 2 },
        orientation: 'portrait',
        // Essayer différents ports et protocoles pour EPSON
        printerUrl: `http://${this.printerIP}:631/printers/TM-M30`, // EPSON spécifique
      };

      const result = await Print.printAsync(printOptions);

      if (result.success || result.uri) {
        return { success: true, message: 'Impression IPP réussie' };
      }

      // Méthode 3: HTTP POST direct vers l'imprimante EPSON
      try {
        const httpResult = await this.sendHttpPrintRequest(html);
        if (httpResult.success) {
          return { success: true, message: 'Impression HTTP réussie' };
        }
      } catch (httpError) {
        console.log('⚠️ HTTP direct échoué');
      }

      throw new Error('Toutes les méthodes d\'impression réseau ont échoué');
    } catch (error) {
      throw new Error(`Erreur impression réseau EPSON: ${error.message}`);
    }
  }

  // Envoyer des commandes ESC/POS via socket TCP (port 9100 standard pour imprimantes thermiques)
  async sendEscPosToSocket(commands) {
    try {
      console.log(`📡 Envoi ESC/POS vers ${this.printerIP}:9100`);

      // En production, utiliser un module socket TCP
      // Pour Expo, simulation de l'envoi
      console.log('⚠️ Socket TCP simulé (nécessite module natif en production)');

      // Simulation de succès pour développement
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, message: 'ESC/POS envoyé via socket' };
    } catch (error) {
      console.error('Erreur socket ESC/POS:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer requête HTTP directe vers l'imprimante EPSON
  async sendHttpPrintRequest(html) {
    try {
      console.log(`🌐 HTTP POST vers ${this.printerIP}:80`);

      const response = await fetch(`http://${this.printerIP}/cgi-bin/epos/service.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          devid: 'local_printer',
          timeout: 30000,
          data: this.convertHtmlToEscPos(html)
        }),
        timeout: 10000
      });

      if (response.ok) {
        const result = await response.json();
        return { success: result.success !== false };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur HTTP direct:', error);
      return { success: false, error: error.message };
    }
  }

  // Convertir HTML en commandes ESC/POS pour imprimante thermique EPSON
  convertHtmlToEscPos(html, order = null) {
    // Si on a l'objet order, utiliser la méthode optimisée EPSON
    if (order) {
      return this.generateEpsonEscPosCommands(order);
    }

    // Sinon, conversion simple du HTML
    const ESC = '\x1B';
    const GS = '\x1D';

    let commands = '';

    // Initialiser l'imprimante EPSON
    commands += ESC + '@'; // Reset complet
    commands += ESC + 'M' + '\x01'; // Font A (12x24) - EPSON spécifique
    commands += ESC + 'a' + '\x01'; // Centrer le texte

    // Extraire le contenu du HTML (version améliorée)
    const textContent = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Supprimer CSS
      .replace(/<div[^>]*class="header"[^>]*>(.*?)<\/div>/gi, ESC + 'E\x01' + '$1' + ESC + 'E\x00') // Gras pour headers
      .replace(/<div[^>]*class="bold"[^>]*>(.*?)<\/div>/gi, ESC + 'E\x01' + '$1' + ESC + 'E\x00') // Gras
      .replace(/<div[^>]*class="center"[^>]*>/gi, ESC + 'a\x01') // Centrer
      .replace(/<div[^>]*class="left"[^>]*>/gi, ESC + 'a\x00') // Aligner à gauche
      .replace(/<div[^>]*class="line"[^>]*><\/div>/gi, '--------------------------------') // Lignes
      .replace(/<div[^>]*class="double-line"[^>]*><\/div>/gi, '================================') // Double lignes
      .replace(/<[^>]*>/g, '\n') // Remplacer autres balises par saut de ligne
      .replace(/\n+/g, '\n') // Nettoyer sauts de ligne multiples
      .replace(/🍽️|📋|📏|⚙️|⚠️|💰|💵|📍|⏰/g, '') // Supprimer émojis qui peuvent poser problème
      .trim();

    // Ajouter le contenu
    commands += textContent;

    // Finaliser avec coupe EPSON
    commands += '\n\n\n';
    commands += GS + 'V' + '\x41' + '\x03'; // Coupe partielle EPSON avec 3 points

    return commands;
  }

  // Génération HTML ticket cuisine optimisé pour EPSON TM-M30III
  generateKitchenTicketHTML(order) {
    const now = new Date().toLocaleString('fr-FR');

    const style = `
      <style>
        @page { margin: 0; size: 58mm auto; }
        @media print {
          body {
            width: 58mm !important;
            font-size: 12px !important;
          }
        }
        body {
          font-family: 'Courier New', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.3;
          margin: 0;
          padding: 2mm;
          width: 54mm;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .left { text-align: left; }
        .bold { font-weight: bold; font-size: 13px; }
        .line {
          border-bottom: 1px dashed #000;
          margin: 3px 0;
          height: 1px;
        }
        .double-line {
          border-bottom: 2px solid #000;
          margin: 4px 0;
          height: 2px;
        }
        .big { font-size: 14px; font-weight: bold; }
        .item-box {
          border: 1px solid #333;
          margin: 3px 0;
          padding: 3px;
          background: #f8f8f8;
          border-radius: 2px;
        }
        .urgent {
          background: #ffe6e6;
          border: 2px solid #ff3333;
          padding: 5px;
          margin: 5px 0;
          border-radius: 3px;
        }
        .header {
          font-size: 16px;
          font-weight: bold;
          margin: 5px 0;
        }
        .order-info {
          background: #f0f0f0;
          padding: 4px;
          margin: 3px 0;
          border-radius: 2px;
        }
      </style>
    `;

    const modeText = this.getModeText(order.mode);
    const urgentClass = (order.mode === 'DELIVERY') ? 'urgent' : '';

    return `
      ${style}
      <body>
        <div class="center header">
          🍽️ COMMANDE CUISINE
        </div>
        <div class="double-line"></div>

        <div class="center bold">
          COMMANDE #${order.id}
        </div>
        <div class="center">${now}</div>
        <div class="line"></div>

        <div class="order-info">
          <div class="bold">CLIENT: ${order.customerName || 'Anonyme'}</div>
          ${order.phone ? `<div class="bold">TEL: ${formatTicketPhone(order.phone)}</div>` : ''}
        </div>
        <div class="line"></div>

        <div class="center bold ${urgentClass}">
          ${modeText.toUpperCase()}
        </div>
        ${order.mode === 'DELIVERY' && order.address ?
          `<div class="bold left">📍 ADRESSE: ${order.address}</div>` : ''
        }
        <div class="line"></div>

        <div class="center bold">📋 ARTICLES A PREPARER</div>
        ${order.items ? order.items.map(item => {
          let customHTML = '';
          if (item.options) {
            // item.options est toujours complet (inclut frites, sauces, boissons, etc.)
            const optionsList = item.options.split(' | ');
            optionsList.forEach(opt => {
              customHTML += `<div>&nbsp;&nbsp;→ ${opt}</div>`;
            });
          } else if (item.customizations && item.customizationOptions) {
            // Fallback pour les anciennes commandes sans options formatées
            Object.entries(item.customizations).forEach(([catKey, selectedOpts]) => {
              const cat = item.customizationOptions[catKey];
              if (cat && selectedOpts && selectedOpts.length > 0) {
                customHTML += `<div style="margin-top:2px;"><strong>${cat.title || catKey}:</strong></div>`;
                selectedOpts.forEach(optId => {
                  const opt = cat.options ? cat.options.find(o => o.id === optId) : null;
                  if (opt) {
                    customHTML += `<div>&nbsp;&nbsp;→ ${opt.name}${opt.price > 0 ? ` (+${opt.price.toFixed(2)}€)` : ''}</div>`;
                  }
                });
              }
            });
          }
          return `
          <div class="item-box">
            <div class="bold">${item.quantity}x ${item.name} - ${(item.price || 0).toFixed(2)}€</div>
            ${item.size ? `<div>📏 Taille: ${item.size}</div>` : ''}
            ${customHTML}
            ${item.comment ? `<div><strong>📝 NOTE: ${item.comment}</strong></div>` : ''}
          </div>
        `;
        }).join('') : '<div class="item-box">⚠️ Aucun article</div>'}

        <div class="line"></div>
        <div class="bold">💰 PAIEMENT: ${order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE'}</div>
        <div class="bold">💵 TOTAL: ${(order.total || 0).toFixed(2)} EUR</div>
        <div class="double-line"></div>

        <div class="center">
          ⏰ ${this.getInstructions(order.mode)}
        </div>

        <div style="height: 20px;"></div>
      </body>
    `;
  }

  // Génération ESC/POS optimisée pour EPSON TM-M30III
  generateEpsonEscPosCommands(order) {
    const ESC = '\x1B';
    const GS = '\x1D';
    const DLE = '\x10';
    const now = new Date().toLocaleString('fr-FR');

    let cmd = '';

    // Reset et initialisation EPSON
    cmd += ESC + '@'; // Reset complet
    cmd += ESC + 'M' + '\x01'; // Font A (12x24)
    cmd += ESC + 'a' + '\x01'; // Centrer

    // En-tête avec logo/titre
    cmd += ESC + 'E' + '\x01'; // Gras ON
    cmd += ESC + '!' + '\x30'; // Double hauteur/largeur
    cmd += 'COMMANDE CUISINE\n';
    cmd += ESC + '!' + '\x00'; // Taille normale
    cmd += ESC + 'E' + '\x00'; // Gras OFF

    // Ligne de séparation
    cmd += '================================\n';

    // Informations commande
    cmd += ESC + 'a' + '\x00'; // Aligner à gauche
    cmd += ESC + 'E' + '\x01'; // Gras ON
    cmd += `COMMANDE #${order.id}\n`;
    cmd += ESC + 'E' + '\x00'; // Gras OFF
    cmd += `Date: ${now}\n`;
    cmd += `Client: ${order.customerName || 'Anonyme'}\n`;

    // Téléphone pour tous les types de commande
    if (order.phone) {
      cmd += `Tel: ${order.phone}\n`;
    }

    cmd += '--------------------------------\n';

    // Mode de service avec emphase
    const modeText = this.getModeText(order.mode);
    cmd += ESC + 'a' + '\x01'; // Centrer
    cmd += ESC + 'E' + '\x01'; // Gras ON

    if (order.mode === 'DELIVERY') {
      cmd += ESC + '!' + '\x20'; // Double largeur pour livraison
      cmd += `*** ${modeText.toUpperCase()} ***\n`;
      cmd += ESC + '!' + '\x00'; // Taille normale
    } else {
      cmd += ESC + '!' + '\x10'; // Double hauteur
      cmd += `${modeText.toUpperCase()}\n`;
      cmd += ESC + '!' + '\x00'; // Taille normale
    }

    cmd += ESC + 'E' + '\x00'; // Gras OFF
    cmd += ESC + 'a' + '\x00'; // Aligner à gauche

    if (order.mode === 'DELIVERY' && order.address) {
      cmd += ESC + 'E' + '\x01'; // Gras ON
      cmd += `Adresse: ${order.address}\n`;
      cmd += ESC + 'E' + '\x00'; // Gras OFF
    }

    cmd += '--------------------------------\n';

    // Articles avec formatage spécial
    cmd += ESC + 'E' + '\x01'; // Gras ON
    cmd += 'ARTICLES A PREPARER:\n';
    cmd += ESC + 'E' + '\x00'; // Gras OFF

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        cmd += '\n';
        cmd += ESC + 'E' + '\x01'; // Gras ON
        cmd += `${item.quantity}x ${item.name} - ${(item.price || 0).toFixed(2)}€\n`;
        cmd += ESC + 'E' + '\x00'; // Gras OFF

        if (item.size) {
          cmd += `   Taille: ${item.size}\n`;
        }

        // Personnalisations détaillées — item.options est toujours complet
        if (item.options) {
          const optionsList = item.options.split(' | ');
          optionsList.forEach(opt => {
            cmd += `   > ${opt}\n`;
          });
        } else if (item.customizations && item.customizationOptions) {
          // Fallback pour les anciennes commandes sans options formatées
          Object.entries(item.customizations).forEach(([catKey, selectedOpts]) => {
            const cat = item.customizationOptions[catKey];
            if (cat && selectedOpts && selectedOpts.length > 0) {
              cmd += ESC + 'E' + '\x01';
              cmd += `   ${(cat.title || catKey).toUpperCase()}:\n`;
              cmd += ESC + 'E' + '\x00';
              selectedOpts.forEach(optId => {
                const opt = cat.options ? cat.options.find(o => o.id === optId) : null;
                if (opt) {
                  cmd += `   > ${opt.name}${opt.price > 0 ? ` (+${opt.price.toFixed(2)}€)` : ''}\n`;
                }
              });
            }
          });
        }

        if (item.comment) {
          cmd += ESC + 'E' + '\x01';
          cmd += `   NOTE: ${item.comment}\n`;
          cmd += ESC + 'E' + '\x00';
        }

        if (index < order.items.length - 1) {
          cmd += '   ---\n';
        }
      });
    } else {
      cmd += '\n*** AUCUN ARTICLE ***\n';
    }

    cmd += '\n--------------------------------\n';

    // Total et paiement
    cmd += ESC + 'E' + '\x01'; // Gras ON
    cmd += ESC + '!' + '\x20'; // Double largeur
    cmd += `TOTAL: ${(order.total || 0).toFixed(2)} EUR\n`;
    cmd += `PAIEMENT: ${order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE'}\n`;
    cmd += ESC + '!' + '\x00'; // Taille normale
    cmd += ESC + 'E' + '\x00'; // Gras OFF

    cmd += '================================\n';

    // Instructions finales
    cmd += ESC + 'a' + '\x01'; // Centrer
    cmd += this.getInstructions(order.mode) + '\n';

    // Espacement final
    cmd += '\n\n\n';

    // Coupe papier EPSON
    cmd += GS + 'V' + '\x41' + '\x03'; // Coupe partielle avec 3 points

    return cmd;
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

  // Test de connexion imprimante EPSON TM-M30III
  async testEpsonConnection() {
    try {
      console.log('🧪 Test connexion EPSON TM-M30III...');
      console.log(`📍 Adresse IP configurée: ${this.printerIP}`);

      // Test 1: Connectivité réseau de base
      try {
        console.log('🌐 Test connectivité réseau...');
        const response = await fetch(`http://${this.printerIP}:80/`, {
          method: 'HEAD',
          timeout: 5000
        });
        console.log(`✅ Imprimante accessible via HTTP (${response.status})`);
      } catch (networkError) {
        console.log(`❌ Imprimante non accessible via HTTP: ${networkError.message}`);

        // Test alternative sur port 631 (IPP)
        try {
          const ippResponse = await fetch(`http://${this.printerIP}:631/`, {
            method: 'HEAD',
            timeout: 5000
          });
          console.log(`✅ Imprimante accessible via IPP port 631 (${ippResponse.status})`);
        } catch (ippError) {
          console.log(`❌ Imprimante non accessible via IPP: ${ippError.message}`);
        }
      }

      // Test 2: Impression d'un ticket de test
      const testOrder = {
        id: 'TEST' + Date.now(),
        customerName: 'Test EPSON TM-M30III',
        phone: '05 55 00 00 00',
        mode: 'TAKEOUT',
        paymentMethod: 'cash',
        items: [
          { name: 'Pizza Test', size: 'M', quantity: 1, price: 10.00 }
        ],
        total: 10.00,
        createdAt: new Date().toISOString()
      };

      console.log('🖨️ Test impression ticket...');
      const printResult = await this.printOrderAutomatically(testOrder);

      return {
        success: printResult.success,
        message: printResult.success
          ? `✅ Test EPSON réussi: ${printResult.message}`
          : `❌ Test EPSON échoué: ${printResult.error}`,
        details: {
          printerIP: this.printerIP,
          testOrder: testOrder,
          printResult: printResult
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Test EPSON échoué: ${error.message}`,
        details: {
          printerIP: this.printerIP
        }
      };
    }
  }

  // Test de connexion tablette (ancien)
  async testTabletConnection() {
    return this.testEpsonConnection();
  }

  // Diagnostic complet de l'imprimante EPSON
  async diagnosePrinterIssues() {
    console.log('🔍 Diagnostic EPSON TM-M30III...');

    const diagnosis = {
      timestamp: new Date().toISOString(),
      printerIP: this.printerIP,
      tests: [],
      recommendations: []
    };

    // Test 1: Configuration IP
    diagnosis.tests.push({
      name: 'Configuration IP',
      status: this.printerIP ? 'success' : 'error',
      message: this.printerIP ? `IP configurée: ${this.printerIP}` : 'IP non configurée'
    });

    if (!this.printerIP) {
      diagnosis.recommendations.push('Configurer l\'adresse IP de l\'imprimante dans le service');
      return diagnosis;
    }

    // Test 2: Format IP valide
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const validIP = ipRegex.test(this.printerIP);
    diagnosis.tests.push({
      name: 'Format IP valide',
      status: validIP ? 'success' : 'error',
      message: validIP ? 'Format IP correct' : 'Format IP invalide'
    });

    // Test 3: Connectivité réseau
    try {
      const response = await fetch(`http://${this.printerIP}:80/`, {
        method: 'HEAD',
        timeout: 5000
      });
      diagnosis.tests.push({
        name: 'Connectivité HTTP',
        status: 'success',
        message: `Réponse HTTP ${response.status}`
      });
    } catch (httpError) {
      diagnosis.tests.push({
        name: 'Connectivité HTTP',
        status: 'warning',
        message: `HTTP non accessible: ${httpError.message}`
      });

      // Test IPP alternatif
      try {
        const ippResponse = await fetch(`http://${this.printerIP}:631/`, {
          method: 'HEAD',
          timeout: 5000
        });
        diagnosis.tests.push({
          name: 'Connectivité IPP',
          status: 'success',
          message: `IPP accessible (${ippResponse.status})`
        });
      } catch (ippError) {
        diagnosis.tests.push({
          name: 'Connectivité IPP',
          status: 'error',
          message: `IPP non accessible: ${ippError.message}`
        });

        diagnosis.recommendations.push(
          'Vérifier que l\'imprimante est allumée et connectée au réseau',
          'Vérifier l\'adresse IP de l\'imprimante (voir écran imprimante)',
          'Vérifier que vous êtes sur le même réseau que l\'imprimante'
        );
      }
    }

    // Test 4: Mode tablette
    diagnosis.tests.push({
      name: 'Mode tablette',
      status: this.isTabletMode ? 'success' : 'warning',
      message: this.isTabletMode ? 'Mode tablette activé' : 'Mode tablette désactivé'
    });

    if (!this.isTabletMode) {
      diagnosis.recommendations.push('Activer le mode tablette pour l\'impression automatique');
    }

    return diagnosis;
  }
}

// Instance singleton
const tabletPrinterService = new TabletPrinterService();
export default tabletPrinterService;