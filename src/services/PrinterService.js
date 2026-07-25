import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import epsonBluetoothService from './EpsonBluetoothService';
import {
  stripOptionPrice,
  getTicketItemTitle,
  getTicketItemOptions,
  getTicketItemNote,
  getPaymentLabel,
  TICKET_SEPARATOR,
} from '../utils/ticketFormat';

class PrinterService {
  constructor() {
    this.printerName = 'Epson TM-M30II';
    this.isConnected = false;
  }

  // Génère le HTML du ticket de caisse
  generateReceiptHTML(order) {
    // Rendu HTML (PDF de secours / impression systeme) : reprend la mise en page
    // du ticket papier via le formateur partage.
    const heure = order.orderTime || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const style = `
      <style>
        @page { margin: 0; size: 58mm auto; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.35;
          margin: 0;
          padding: 4mm;
          width: 50mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .big { font-size: 20px; font-weight: bold; }
        .item { font-size: 16px; font-weight: bold; margin-top: 4px; }
        .option { padding-left: 6px; }
        .note { font-weight: bold; }
        .sep { text-align: center; margin: 4px 0; }
      </style>
    `;

    const separator = `<div class="sep">${TICKET_SEPARATOR}</div>`;

    const itemsHtml = (order.items || []).map(item => {
      const options = getTicketItemOptions(item)
        .map(option => `<div class="option">${option}</div>`)
        .join('');
      const note = getTicketItemNote(item);
      const noteHtml = note ? `<div class="note">NOTE: ${note}</div>` : '';
      return `<div class="item">${getTicketItemTitle(item)}</div>${options}${noteHtml}${separator}`;
    }).join('');

    return `
      ${style}
      <body>
        <div class="center bold">BON DE CUISINE</div>
        ${separator}
        <div class="center big">#${order.orderNumber || order.id}</div>
        <div class="center bold">${heure}</div>
        ${separator}
        <div class="center bold">${order.customerName || 'Client'}</div>
        <div class="center big">${this.getModeText(order.mode).toUpperCase()}</div>
        ${order.mode === 'DELIVERY' && order.address ? `<div class="center bold">${order.address}</div>` : ''}
        ${order.phone ? `<div class="center bold">TEL: ${order.phone}</div>` : ''}
        ${separator}
        <div class="center bold">PRODUITS</div>
        ${separator}
        ${itemsHtml}
        <div class="center big">${(Number(order.total) || 0).toFixed(2)} EUR</div>
        <div class="center bold">${getPaymentLabel(order)}</div>
        ${separator}
      </body>
    `;
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
    // Meme mise en page que le ticket Bluetooth : le formateur partage garantit
    // qu'aucun chemin d'impression ne reste sur un ancien style.
    const commands = [];
    const heure = order.orderTime || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const sep = () => commands.push({ type: 'text', data: `${TICKET_SEPARATOR}\n` });

    commands.push(
      { type: 'align', position: 'center' },
      { type: 'style', bold: true },
      { type: 'text', data: 'BON DE CUISINE\n' }
    );
    sep();

    commands.push(
      { type: 'style', bold: true, size: 'double' },
      { type: 'text', data: `#${order.orderNumber || order.id}\n` },
      { type: 'style', bold: true, size: 'normal' },
      { type: 'text', data: `${heure}\n` }
    );
    sep();

    commands.push({ type: 'text', data: `${order.customerName || 'Client'}\n` });
    commands.push(
      { type: 'style', bold: true, size: 'double' },
      { type: 'text', data: `${this.getModeText(order.mode).toUpperCase()}\n` },
      { type: 'style', bold: true, size: 'normal' }
    );

    if (order.mode === 'DELIVERY' && order.address) {
      commands.push({ type: 'text', data: `${order.address}\n` });
    }
    if (order.phone) {
      commands.push({ type: 'text', data: `TEL: ${order.phone}\n` });
    }

    sep();
    commands.push({ type: 'text', data: 'PRODUITS\n' });
    sep();

    commands.push({ type: 'align', position: 'left' });
    (order.items || []).forEach(item => {
      commands.push(
        { type: 'style', bold: true, size: 'double' },
        { type: 'text', data: `${getTicketItemTitle(item)}\n` },
        { type: 'style', bold: true, size: 'normal' }
      );

      getTicketItemOptions(item).forEach(option => {
        commands.push({ type: 'text', data: ` ${option}\n` });
      });

      const note = getTicketItemNote(item);
      if (note) commands.push({ type: 'text', data: `NOTE: ${note}\n` });

      commands.push({ type: 'align', position: 'center' });
      sep();
      commands.push({ type: 'align', position: 'left' });
    });

    commands.push(
      { type: 'align', position: 'center' },
      { type: 'style', bold: true, size: 'double' },
      { type: 'text', data: `${(Number(order.total) || 0).toFixed(2)} EUR\n` },
      { type: 'style', bold: true, size: 'normal' },
      { type: 'text', data: `${getPaymentLabel(order)}\n` }
    );
    sep();

    commands.push(
      { type: 'style', bold: false },
      { type: 'feed', lines: 3 },
      { type: 'cut' }
    );

    return commands;
  }

  // Génère les données ESC/POS raw pour connexion TCP
  generateESCPOSRaw(order) {
    // Aperçu écran : reprend exactement la mise en page du ticket papier,
    // via le même formateur que l'impression réelle (utils/ticketFormat).
    const BOLD_ON = '\x1B\x45\x01';
    const BOLD_OFF = '\x1B\x45\x00';
    const CENTER = '\x1B\x61\x01';
    const LEFT = '\x1B\x61\x00';
    const BIG_ON = '\x1D\x21\x11';
    const BIG_OFF = '\x1D\x21\x00';
    const SEP = `${TICKET_SEPARATOR}\n`;

    const heure = order.orderTime || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let data = '\x1B\x40';

    // En-tete
    data += CENTER + BOLD_ON;
    data += 'BON DE CUISINE\n';
    data += SEP;

    // Numero de commande, tres visible
    data += BIG_ON;
    data += `#${order.orderNumber || order.id}\n`;
    data += BIG_OFF;
    data += `${heure}\n`;
    data += SEP;

    // Client et mode
    data += `${order.customerName || 'Client'}\n`;
    data += BIG_ON;
    data += `${this.getModeText(order.mode).toUpperCase()}\n`;
    data += BIG_OFF;

    if (order.mode === 'DELIVERY' && order.address) {
      data += `${order.address}\n`;
    }
    if (order.phone) {
      data += `TEL: ${order.phone}\n`;
    }

    data += SEP;
    data += 'PRODUITS\n';
    data += SEP;

    // Articles
    data += LEFT;
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        data += BIG_ON;
        data += `${getTicketItemTitle(item)}\n`;
        data += BIG_OFF;

        getTicketItemOptions(item).forEach(option => {
          data += ` ${option}\n`;
        });

        const note = getTicketItemNote(item);
        if (note) data += `NOTE: ${note}\n`;

        data += CENTER + SEP + LEFT;
      });
    }

    // Total et reglement
    data += CENTER;
    data += BIG_ON;
    data += `${(Number(order.total) || 0).toFixed(2)} EUR\n`;
    data += BIG_OFF;
    data += `${getPaymentLabel(order)}\n`;
    data += SEP;
    data += BOLD_OFF;

    data += '\n\n\n';
    data += '\x1D\x56\x42\x00';

    return data;
  }

  // Convertit le flux ESC/POS réel en lignes affichables à l'écran.
  // On repart des mêmes octets que ceux envoyés à la TM-M30II : l'aperçu
  // reflète donc exactement ce qui sortirait du rouleau, sans risque de
  // divergence entre le ticket simulé et le ticket imprimé.
  getTicketPreviewLines(order) {
    const raw = this.generateESCPOSRaw(order);
    const lines = [];

    let style = { bold: false, center: false, large: false };
    let text = '';

    const pushLine = () => {
      lines.push({ text, ...style });
      text = '';
    };

    let i = 0;
    while (i < raw.length) {
      const char = raw[i];

      // ESC : alignement, gras, initialisation
      if (char === '\x1B') {
        const command = raw[i + 1];
        if (command === '@') { i += 2; continue; }              // init
        if (command === 'a') {                                   // alignement
          style = { ...style, center: raw.charCodeAt(i + 2) === 1 };
          i += 3;
          continue;
        }
        if (command === 'E') {                                   // gras
          style = { ...style, bold: raw.charCodeAt(i + 2) === 1 };
          i += 3;
          continue;
        }
        i += 2;
        continue;
      }

      // GS : taille de police, coupe du papier
      if (char === '\x1D') {
        const command = raw[i + 1];
        if (command === '!') {                                   // taille double
          style = { ...style, large: raw.charCodeAt(i + 2) !== 0 };
          i += 3;
          continue;
        }
        if (command === 'V') { i += 4; continue; }               // coupe papier
        i += 2;
        continue;
      }

      if (char === '\n') {
        pushLine();
        i += 1;
        continue;
      }

      text += char;
      i += 1;
    }

    if (text.length > 0) pushLine();

    // Les sauts de ligne d'avance papier en fin de ticket n'ont pas d'intérêt à l'écran
    while (lines.length > 0 && lines[lines.length - 1].text.trim() === '') {
      lines.pop();
    }

    return lines;
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

  // Impression manuelle - directement sur l'imprimante Bluetooth
  async printManually(order) {
    console.log('🖨️ Impression directe sur imprimante Bluetooth...');

    try {
      // PRIORITÉ 1: Imprimante Bluetooth Epson
      const btStatus = epsonBluetoothService.getStatus();

      if (btStatus.savedConfig || btStatus.isConnected) {
        console.log('📱 Utilisation de l\'imprimante Bluetooth...');
        const result = await epsonBluetoothService.printOrder(order);

        if (result.success) {
          return {
            success: true,
            message: 'Ticket imprimé sur ' + (btStatus.device?.name || 'imprimante Bluetooth'),
          };
        } else {
          console.warn('⚠️ Bluetooth échoué:', result.error);
          // Continuer vers le fallback
        }
      }

      // FALLBACK: Utiliser le système natif iOS
      console.log('🔄 Fallback vers impression native...');
      const isAvailable = await Print.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Aucune imprimante disponible');
      }

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