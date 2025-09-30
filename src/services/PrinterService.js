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

  // Imprime le ticket automatiquement avec fallbacks intelligents
  async printReceipt(order) {
    console.log(`🖨️ Démarrage impression avec timeout de 10 secondes...`);
    console.log(`🖨️ Impression commande #${order.id} via serveur distant...`);
    console.log(`📤 Envoi vers serveur:`, order);

    // Créer une promesse avec timeout de 10 secondes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout impression après 10 secondes')), 10000);
    });

    try {
      // 🎯 STRATÉGIE MULTI-RÉSEAU: Teste plusieurs possibilités
      const printStrategies = [
        () => this.printViaRemoteServer(order),
        () => this.printViaDirectConnection(order),
        () => this.printViaExpoPrint(order),
        () => this.generatePDFFallback(order)
      ];

      // Exécuter avec timeout
      const result = await Promise.race([
        this.tryPrintStrategies(printStrategies, order),
        timeoutPromise
      ]);

      return result;

    } catch (error) {
      if (error.message.includes('Timeout')) {
        console.warn('⏰ Timeout impression après 10 secondes');
        return this.generatePDFFallback(order);
      }

      console.error('❌ Erreur critique impression:', error);
      return {
        success: false,
        error: `Erreur critique: ${error.message}`
      };
    }
  }

  // Essaie les stratégies d'impression une par une
  async tryPrintStrategies(strategies, order) {
    let lastError;

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Tentative ${i + 1}/${strategies.length}...`);
        const result = await strategies[i]();
        if (result.success) {
          console.log(`✅ Stratégie ${i + 1} réussie:`, result.message);
          return result;
        }
      } catch (error) {
        console.log(`⚠️ Stratégie ${i + 1} échouée:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error('Toutes les stratégies ont échoué');
  }

  // STRATÉGIE 1: Serveur d'impression distant
  async printViaRemoteServer(order) {
    const servers = [
      'http://localhost:3001',
      'http://192.168.10.110:3001', // Serveur d'impression sur même réseau que l'imprimante
      'http://192.168.223.13:3001', // Ancien réseau
      'http://192.168.1.100:3001',  // Réseau alternatif
    ];

    for (const server of servers) {
      try {
        const response = await fetch(`${server}/print/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
          timeout: 5000
        });

        if (response.ok) {
          const result = await response.json();
          return { success: true, message: `Imprimé via ${server}` };
        }
      } catch (error) {
        console.log(`❌ ${server} indisponible`);
        continue;
      }
    }

    throw new Error('Aucun serveur d\'impression accessible');
  }

  // STRATÉGIE 2: Connexion directe à l'imprimante (via réseau)
  async printViaDirectConnection(order) {
    console.log('🔄 Tentative connexion directe imprimante via HTTP...');

    // Pour Epson TM-M30III, nous pouvons utiliser l'interface web/HTTP de l'imprimante
    const printerIP = '192.168.10.110';
    const printerPorts = [80, 631, 8080]; // Ports HTTP courants pour les imprimantes Epson

    for (const port of printerPorts) {
      try {
        const printerUrl = `http://${printerIP}:${port}`;
        console.log(`🔗 Tentative connexion ${printerUrl}...`);

        // Test de connectivité d'abord
        const testResponse = await fetch(printerUrl, {
          method: 'GET',
          timeout: 3000
        });

        if (testResponse.ok || testResponse.status === 404) {
          console.log(`✅ Imprimante accessible sur ${printerUrl}`);

          // Essayer d'envoyer via l'interface web de l'imprimante
          const printResult = await this.sendDirectHTTPPrint(printerUrl, order);
          if (printResult.success) {
            return printResult;
          }
        }
      } catch (error) {
        console.log(`❌ Port ${port} inaccessible: ${error.message}`);
        continue;
      }
    }

    // Si HTTP ne fonctionne pas, essayer via socket TCP (port 9100 - Raw mode)
    try {
      return await this.sendRawTCPPrint(printerIP, order);
    } catch (tcpError) {
      throw new Error(`Connexion directe échouée: ${tcpError.message}`);
    }
  }

  // Envoie la commande d'impression via HTTP vers l'interface web de l'imprimante
  async sendDirectHTTPPrint(printerUrl, order) {
    try {
      // Générer les commandes ESC/POS pour Epson
      const escPosCommands = this.generateESCPOSCommands(order);

      // Essayer différents endpoints pour l'impression directe
      const endpoints = [
        '/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000',
        '/receipt',
        '/print',
        '/api/print'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${printerUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'SOAPAction': '"http://www.epson-pos.com/schemas/2011/03/epos-print"'
            },
            body: JSON.stringify({
              document: escPosCommands,
              cut: true,
              feed: 3
            }),
            timeout: 5000
          });

          if (response.ok) {
            console.log(`✅ Impression envoyée via ${printerUrl}${endpoint}`);
            return { success: true, message: `Imprimé directement via ${printerUrl}` };
          }
        } catch (endpointError) {
          console.log(`⚠️ Endpoint ${endpoint} échoué`);
          continue;
        }
      }

      throw new Error('Aucun endpoint d\'impression trouvé');
    } catch (error) {
      throw new Error(`Impression HTTP échouée: ${error.message}`);
    }
  }

  // Envoie via socket TCP Raw (port 9100)
  async sendRawTCPPrint(printerIP, order) {
    console.log(`🔗 Tentative connexion TCP ${printerIP}:9100...`);

    // Pour React Native, nous devons utiliser une approche différente
    // car nous n'avons pas accès aux sockets TCP natifs
    // On peut utiliser une API proxy ou WebSocket

    try {
      // Alternative: Utiliser un proxy WebSocket si disponible
      const escPosData = this.generateESCPOSRaw(order);

      // Essayer via un service proxy local
      const response = await fetch('http://localhost:3002/tcp-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: printerIP,
          port: 9100,
          data: escPosData
        }),
        timeout: 5000
      });

      if (response.ok) {
        console.log(`✅ Impression TCP envoyée via proxy`);
        return { success: true, message: 'Imprimé via connexion TCP directe' };
      }

      throw new Error('Service proxy TCP non disponible');
    } catch (error) {
      throw new Error(`Connexion TCP échouée: ${error.message}`);
    }
  }

  // Génère les commandes ESC/POS pour Epson TM-M30III
  generateESCPOSCommands(order) {
    const commands = [];
    const currentDate = new Date().toLocaleString('fr-FR');

    // En-tête
    commands.push(
      { type: 'align', position: 'center' },
      { type: 'style', bold: true, size: 'double' },
      { type: 'text', data: '🍽️ COMMANDE CUISINE 🍽️\n' },
      { type: 'style', bold: false, size: 'normal' },
      { type: 'text', data: '================================\n' }
    );

    // Infos commande
    commands.push(
      { type: 'style', bold: true },
      { type: 'text', data: `COMMANDE #${order.id}\n` },
      { type: 'style', bold: false },
      { type: 'text', data: `${currentDate}\n` },
      { type: 'text', data: '================================\n' }
    );

    // Client
    commands.push(
      { type: 'align', position: 'left' },
      { type: 'style', bold: true },
      { type: 'text', data: `CLIENT: ${order.customerName || 'Anonyme'}\n` },
      { type: 'style', bold: false }
    );

    if (order.phone) {
      commands.push(
        { type: 'style', bold: true },
        { type: 'text', data: `TEL: ${order.phone}\n` },
        { type: 'style', bold: false }
      );
    }

    // Mode de commande
    commands.push(
      { type: 'text', data: '================================\n' },
      { type: 'align', position: 'center' },
      { type: 'style', bold: true },
      { type: 'text', data: `📦 ${this.getModeText(order.mode).toUpperCase()}\n` },
      { type: 'style', bold: false }
    );

    if (order.mode === 'DELIVERY' && order.address) {
      commands.push(
        { type: 'style', bold: true },
        { type: 'text', data: `📍 ${order.address}\n` },
        { type: 'style', bold: false }
      );
    }

    // Articles
    commands.push(
      { type: 'text', data: '================================\n' },
      { type: 'align', position: 'center' },
      { type: 'style', bold: true },
      { type: 'text', data: '🍴 ARTICLES À PRÉPARER\n' },
      { type: 'style', bold: false },
      { type: 'align', position: 'left' }
    );

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        commands.push(
          { type: 'text', data: '\n' },
          { type: 'style', bold: true },
          { type: 'text', data: `${item.quantity}x ${item.name}\n` },
          { type: 'style', bold: false },
          { type: 'text', data: `Taille: ${item.size}\n` }
        );

        if (item.options) {
          commands.push({ type: 'text', data: `Options: ${item.options}\n` });
        }

        commands.push({ type: 'text', data: '--------------------------------\n' });
      });
    }

    // Total et paiement
    commands.push(
      { type: 'text', data: '\n' },
      { type: 'style', bold: true },
      { type: 'text', data: `💳 PAIEMENT: ${order.paymentMethod === 'cash' ? '💵 ESPÈCES' : '💳 CARTE'}\n` },
      { type: 'text', data: `💰 TOTAL: ${(order.total || 0).toFixed(2)}€\n` },
      { type: 'style', bold: false }
    );

    // Instructions finales
    commands.push(
      { type: 'text', data: '================================\n' },
      { type: 'align', position: 'center' },
      { type: 'style', bold: true },
      { type: 'text', data: '⏰ À PRÉPARER MAINTENANT\n' },
      { type: 'style', bold: false }
    );

    const modeText = this.getModeText(order.mode);
    if (modeText === 'Livraison') {
      commands.push({ type: 'text', data: '🚴 PRÉVOIR LIVREUR\n' });
    } else if (modeText === 'À emporter') {
      commands.push({ type: 'text', data: '🏃 CLIENT VIENT RÉCUPÉRER\n' });
    } else if (modeText === 'Sur place') {
      commands.push({ type: 'text', data: '🍽️ À SERVIR EN SALLE\n' });
    }

    commands.push(
      { type: 'text', data: '\n\n' },
      { type: 'cut' }
    );

    return commands;
  }

  // Génère les données ESC/POS raw pour connexion TCP
  generateESCPOSRaw(order) {
    // Commandes ESC/POS brutes en hexadécimal
    let data = '';

    // ESC @ - Initialiser l'imprimante
    data += '\x1B\x40';

    // Center align
    data += '\x1B\x61\x01';

    // Bold + Double size
    data += '\x1B\x45\x01\x1D\x21\x11';
    data += '🍽️ COMMANDE CUISINE 🍽️\n';

    // Normal style
    data += '\x1B\x45\x00\x1D\x21\x00';
    data += '================================\n';

    // Left align
    data += '\x1B\x61\x00';

    // Bold
    data += '\x1B\x45\x01';
    data += `COMMANDE #${order.id}\n`;

    // Normal
    data += '\x1B\x45\x00';
    data += `${new Date().toLocaleString('fr-FR')}\n`;
    data += '================================\n';

    // Client info
    data += '\x1B\x45\x01';
    data += `CLIENT: ${order.customerName || 'Anonyme'}\n`;
    data += '\x1B\x45\x00';

    if (order.phone) {
      data += '\x1B\x45\x01';
      data += `TEL: ${order.phone}\n`;
      data += '\x1B\x45\x00';
    }

    // Mode
    data += '================================\n';
    data += '\x1B\x61\x01'; // Center
    data += '\x1B\x45\x01'; // Bold
    data += `📦 ${this.getModeText(order.mode).toUpperCase()}\n`;
    data += '\x1B\x45\x00'; // Normal

    // Articles
    data += '================================\n';
    data += '🍴 ARTICLES À PRÉPARER\n';
    data += '\x1B\x61\x00'; // Left align

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        data += '\n';
        data += '\x1B\x45\x01'; // Bold
        data += `${item.quantity}x ${item.name}\n`;
        data += '\x1B\x45\x00'; // Normal
        data += `Taille: ${item.size}\n`;

        if (item.options) {
          data += `Options: ${item.options}\n`;
        }
        data += '--------------------------------\n';
      });
    }

    // Total
    data += '\n';
    data += '\x1B\x45\x01'; // Bold
    data += `💳 PAIEMENT: ${order.paymentMethod === 'cash' ? '💵 ESPÈCES' : '💳 CARTE'}\n`;
    data += `💰 TOTAL: ${(order.total || 0).toFixed(2)}€\n`;
    data += '\x1B\x45\x00'; // Normal

    // Instructions
    data += '================================\n';
    data += '\x1B\x61\x01'; // Center
    data += '\x1B\x45\x01'; // Bold
    data += '⏰ À PRÉPARER MAINTENANT\n';
    data += '\x1B\x45\x00'; // Normal

    const modeText = this.getModeText(order.mode);
    if (modeText === 'Livraison') {
      data += '🚴 PRÉVOIR LIVREUR\n';
    } else if (modeText === 'À emporter') {
      data += '🏃 CLIENT VIENT RÉCUPÉRER\n';
    } else if (modeText === 'Sur place') {
      data += '🍽️ À SERVIR EN SALLE\n';
    }

    // Feed et coupe
    data += '\n\n\n';
    data += '\x1D\x56\x42\x00'; // Cut paper

    return data;
  }

  // STRATÉGIE 3: Expo Print avec interface native d'impression
  async printViaExpoPrint(order, useNativeDialog = true) {
    try {
      const html = this.generateReceiptHTML(order);

      if (useNativeDialog) {
        // Ouvrir le dialogue natif de sélection d'imprimante
        console.log('🖨️ Ouverture de l\'interface native d\'impression...');

        const result = await Print.printAsync({
          html,
          printerUrl: undefined, // Laisse l'utilisateur choisir
          orientation: Print.Orientation.portrait,
          margins: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          },
        });

        if (result.success) {
          return {
            success: true,
            message: 'Ticket imprimé via l\'interface native',
            details: result
          };
        } else {
          throw new Error('Impression annulée par l\'utilisateur');
        }
      } else {
        // Impression directe sans dialogue (pour l'automatique)
        const result = await Print.printAsync({
          html,
          orientation: Print.Orientation.portrait,
          margins: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          },
        });

        return {
          success: true,
          message: 'Imprimé via Expo Print (automatique)',
          details: result
        };
      }
    } catch (error) {
      throw new Error(`Expo Print échoué: ${error.message}`);
    }
  }

  // Impression manuelle avec choix d'imprimante
  async printManually(order) {
    console.log('📱 Démarrage impression manuelle...');
    console.log('👤 L\'utilisateur va choisir son imprimante');

    try {
      // Vérifier que l'impression est disponible
      const isAvailable = await Print.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Service d\'impression non disponible sur cet appareil');
      }

      // Utiliser la nouvelle méthode avec sélection native avancée
      return await this.printWithNativeSelection(order);

    } catch (error) {
      console.error('❌ Erreur impression manuelle:', error);

      // Fallback vers PDF si l'impression native échoue
      try {
        console.log('🔄 Fallback vers génération PDF...');
        return await this.generatePDFFallback(order);
      } catch (pdfError) {
        return {
          success: false,
          error: `Impression manuelle échouée: ${error.message}`
        };
      }
    }
  }

  // Aperçu avant impression
  async previewReceipt(order) {
    try {
      console.log('👁️ Génération aperçu ticket...');

      const html = this.generateReceiptHTML(order);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      console.log('👁️ Aperçu ticket: AFFICHÉ');
      return {
        success: true,
        previewUri: uri,
        message: 'Aperçu généré avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur génération aperçu:', error);
      return {
        success: false,
        error: `Erreur aperçu: ${error.message}`
      };
    }
  }

  // Obtenir les imprimantes disponibles (si supporté)
  async getAvailablePrinters() {
    try {
      // Note: Cette fonctionnalité peut ne pas être disponible sur tous les appareils
      if (Print.selectPrinterAsync) {
        console.log('🔍 Recherche imprimantes disponibles...');
        const printer = await Print.selectPrinterAsync();
        return {
          success: true,
          selectedPrinter: printer,
          message: 'Imprimante sélectionnée'
        };
      } else {
        return {
          success: false,
          error: 'Sélection d\'imprimante non supportée sur cet appareil'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erreur sélection imprimante: ${error.message}`
      };
    }
  }

  // Impression avec sélection manuelle d'imprimante avancée
  async printWithNativeSelection(order) {
    try {
      console.log('🖨️ Ouverture du sélecteur d\'imprimante natif...');

      // Vérifier la disponibilité du service d'impression
      const isAvailable = await Print.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Service d\'impression non disponible sur cet appareil');
      }

      // Générer le HTML du ticket
      const html = this.generateReceiptHTML(order);

      // Options d'impression avancées
      const printOptions = {
        html,
        orientation: Print.Orientation.portrait,
        margins: {
          left: 0.2,
          top: 0.2,
          right: 0.2,
          bottom: 0.2,
        },
        // Laisser l'utilisateur choisir l'imprimante
        printerUrl: undefined,
        // Options supplémentaires pour iOS/Android
        ...(Platform.OS === 'ios' && {
          useMarkupFormatter: false,
          markupFormatterIOS: 'UIMarkupTextPrintFormatter',
        }),
        ...(Platform.OS === 'android' && {
          colorMode: Print.ColorMode.color,
          duplex: Print.Duplex.none,
          outputType: Print.OutputType.grayscale,
        }),
      };

      console.log('📱 Ouverture du dialogue de sélection d\'imprimante...');

      // Lancer l'impression avec dialogue natif
      const result = await Print.printAsync(printOptions);

      if (result.success) {
        console.log('✅ Impression native réussie');
        return {
          success: true,
          message: 'Ticket imprimé avec succès via l\'interface native',
          details: result
        };
      } else {
        console.log('⚠️ Impression annulée par l\'utilisateur');
        return {
          success: false,
          error: 'Impression annulée par l\'utilisateur'
        };
      }

    } catch (error) {
      console.error('❌ Erreur impression native:', error);
      throw new Error(`Impression native échouée: ${error.message}`);
    }
  }

  // Découverte d'imprimantes réseau (expérimental)
  async discoverNetworkPrinters() {
    console.log('🔍 Recherche d\'imprimantes réseau...');

    // Cette fonction essaie de détecter les imprimantes sur le réseau local
    const commonPrinterIPs = [
      '192.168.10.110', // Votre imprimante Epson TM-M30III
      '192.168.1.100', '192.168.1.101', '192.168.1.102',
      '192.168.223.13', '192.168.223.14', '192.168.223.15',
      '10.0.0.100', '10.0.0.101', '10.0.0.102'
    ];

    const availablePrinters = [];
    const timeoutMs = 2000;

    for (const ip of commonPrinterIPs) {
      try {
        console.log(`🔗 Test ${ip}...`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`http://${ip}`, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok || response.status === 404) {
          availablePrinters.push({
            ip,
            name: `Imprimante réseau ${ip}`,
            type: 'network',
            available: true
          });
          console.log(`✅ Imprimante trouvée: ${ip}`);
        }
      } catch (error) {
        // Imprimante non accessible, continuer
        continue;
      }
    }

    return {
      success: true,
      printers: availablePrinters,
      message: `${availablePrinters.length} imprimante(s) réseau trouvée(s)`
    };
  }

  // STRATÉGIE 4: Fallback PDF (toujours disponible)
  async generatePDFFallback(order) {
    try {
      const html = this.generateReceiptHTML(order);
      const { uri } = await Print.printToFileAsync({ html });
      console.log(`📄 Ticket sauvegardé en PDF: ${uri}`);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Ticket Commande #${order.id}`,
          mimeType: 'application/pdf',
        });
        return {
          success: true,
          message: '⚠️ Impression automatique indisponible. Ticket sauvegardé en PDF.'
        };
      }

      return {
        success: false,
        error: '❌ Impossible de partager le PDF'
      };
    } catch (pdfError) {
      return {
        success: false,
        error: `❌ Erreur génération PDF: ${pdfError.message}`
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
    
    const VOTRE_IP_IMPRIMANTE = '192.168.10.110'; // ⬅️ IP de votre Epson TM-M30III
    
    // URLs à tester selon votre configuration réseau
    const urlsToTry = [
      `http://${VOTRE_IP_IMPRIMANTE}:631/ipp/print`,  // IPP standard
      `http://${VOTRE_IP_IMPRIMANTE}:9100`,           // Port RAW
      `http://${VOTRE_IP_IMPRIMANTE}:80`,             // HTTP standard
    ];
    
    console.log(`🖨️ Tentative connexion imprimante: ${urlsToTry[0]}`);
    return urlsToTry[0];
  }

  // Test de connexion avec l'imprimante via serveur dédié
  async testConnection() {
    try {
      console.log('🔄 Test de connexion au serveur d\'impression...');

      // Test du serveur d'impression
      const response = await fetch('http://localhost:3001/printer/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test serveur réussi:', result);
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        console.error('❌ Test serveur échoué:', error);
        return { success: false, error: error.error };
      }

    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      return {
        success: false,
        error: 'Serveur d\'impression non accessible. Vérifiez qu\'il est démarré avec: cd printer-server && npm start'
      };
    }
  }
}

// Instance singleton
const printerService = new PrinterService();
export default printerService;