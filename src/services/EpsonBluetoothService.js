import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  PRINTER_CONFIG: '@epson_printer_config',
  AUTO_PRINT_ENABLED: '@epson_auto_print',
  CONNECTION_TYPE: '@epson_connection_type', // 'bluetooth' ou 'wifi'
  SIMULATION_MODE: '@epson_simulation_mode', // Mode simulation pour tester sans imprimante
};

class EpsonBluetoothService {
  constructor() {
    this.Printer = null;
    this.PrintersDiscovery = null;
    this.PrinterConstants = null;
    this.connectedDevice = null;
    this.isConnecting = false;
    this.isScanning = false;
    this.autoPrintEnabled = true;
    this.savedConfig = null;
    this.discoveredPrinters = [];
    this.isInitialized = false;
    this.initPromise = null;
    this.simulationMode = false; // Mode simulation pour tester sans imprimante

    // Initialiser le module
    this.initPromise = this.initModule();
  }

  // Attendre que le module soit initialisé
  async waitForInit() {
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.isInitialized;
  }

  // Initialiser le module Epson ePOS
  async initModule() {
    try {
      console.log('🔄 Initialisation module Epson ePOS...');
      const EscPosModule = require('react-native-esc-pos-printer');

      console.log('📦 Module chargé, contenu:', Object.keys(EscPosModule));

      this.Printer = EscPosModule.Printer;
      this.PrintersDiscovery = EscPosModule.PrintersDiscovery;
      this.PrinterConstants = EscPosModule.PrinterConstants;

      console.log('✅ Module Epson ePOS chargé');
      console.log('   - Printer:', this.Printer ? 'OK' : 'NULL');
      console.log('   - PrintersDiscovery:', this.PrintersDiscovery ? 'OK' : 'NULL');
      console.log('   - PrinterConstants:', this.PrinterConstants ? 'OK' : 'NULL');

      // Charger la configuration sauvegardée
      await this.loadSavedConfig();

      this.isInitialized = true;
      console.log('✅ Service Epson initialisé avec succès');

    } catch (error) {
      console.warn('⚠️ Module Epson ePOS non disponible:', error.message);
      console.warn('   Stack:', error.stack);
      this.Printer = null;
      this.PrintersDiscovery = null;
      this.PrinterConstants = null;
      this.isInitialized = false;
    }
  }

  // Charger la configuration sauvegardée
  async loadSavedConfig() {
    try {
      const configStr = await AsyncStorage.getItem(STORAGE_KEYS.PRINTER_CONFIG);
      if (configStr) {
        this.savedConfig = JSON.parse(configStr);
        console.log('📋 Config imprimante chargee:', this.savedConfig?.name);
      }

      const autoPrint = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_PRINT_ENABLED);
      this.autoPrintEnabled = autoPrint !== 'false';

      // Charger le mode simulation
      const simulation = await AsyncStorage.getItem(STORAGE_KEYS.SIMULATION_MODE);
      this.simulationMode = simulation === 'true';
      if (this.simulationMode) {
        console.log('🎮 Mode SIMULATION activé');
      }

    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  }

  // Sauvegarder la configuration
  async saveConfig(config) {
    try {
      this.savedConfig = config;
      await AsyncStorage.setItem(STORAGE_KEYS.PRINTER_CONFIG, JSON.stringify(config));
      console.log('💾 Config imprimante sauvegardee');
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  }

  // Activer/désactiver l'impression automatique
  async setAutoPrintEnabled(enabled) {
    this.autoPrintEnabled = enabled;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_PRINT_ENABLED, enabled.toString());
    console.log(`🖨️ Impression auto: ${enabled ? 'activee' : 'desactivee'}`);
  }

  // Activer/désactiver le mode simulation
  async setSimulationMode(enabled) {
    this.simulationMode = enabled;
    await AsyncStorage.setItem(STORAGE_KEYS.SIMULATION_MODE, enabled.toString());
    console.log(`🎮 Mode simulation: ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  }

  // Vérifier si le mode simulation est activé
  isSimulationEnabled() {
    return this.simulationMode;
  }

  // Vérifier si le module est disponible
  isModuleAvailable() {
    return this.Printer !== null && this.PrintersDiscovery !== null;
  }

  // Scanner les imprimantes Bluetooth
  async discoverPrinters() {
    if (!this.PrintersDiscovery) {
      console.warn('Module non disponible');
      return [];
    }

    return new Promise((resolve) => {
      this.isScanning = true;
      this.discoveredPrinters = [];
      console.log('🔍 Recherche imprimantes...');

      // Callback pour les imprimantes découvertes
      const unsubscribe = this.PrintersDiscovery.onDiscovery((printers) => {
        console.log('📡 Imprimantes trouvees:', printers.length);
        this.discoveredPrinters = printers.map(printer => ({
          id: printer.target || printer.macAddress,
          name: printer.name || 'Imprimante Epson',
          address: printer.target,
          mac: printer.macAddress,
          ip: printer.ipAddress,
          type: printer.deviceType,
        }));
      });

      // Callback pour les erreurs
      const unsubscribeError = this.PrintersDiscovery.onError((error) => {
        console.error('❌ Erreur discovery:', error);
      });

      // Callback pour le changement de statut
      const unsubscribeStatus = this.PrintersDiscovery.onStatusChange((status) => {
        console.log('📊 Status discovery:', status);
        if (status === 'inactive') {
          this.isScanning = false;
          unsubscribe();
          unsubscribeError();
          unsubscribeStatus();
          resolve(this.discoveredPrinters);
        }
      });

      // Démarrer la découverte (timeout 10 secondes)
      this.PrintersDiscovery.start({
        timeout: 10000,
        autoStop: true,
        filterOption: {
          portType: 'bluetooth', // Bluetooth uniquement
        }
      }).catch((error) => {
        console.error('❌ Erreur start discovery:', error);
        this.isScanning = false;
        resolve([]);
      });
    });
  }

  // Jumeler une imprimante Bluetooth (iOS)
  async pairBluetoothPrinter(macAddress = '') {
    if (!this.PrintersDiscovery) {
      return { success: false, error: 'Module non disponible' };
    }

    try {
      console.log('📱 Jumelage Bluetooth...');
      await this.PrintersDiscovery.pairBluetoothDevice(macAddress);
      console.log('✅ Jumelage reussi');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur jumelage:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Lancer le pairing Bluetooth iOS (sans adresse MAC - ouvre la popup système)
  async startBluetoothPairing() {
    if (!this.PrintersDiscovery) {
      return { success: false, error: 'Module non disponible' };
    }

    try {
      console.log('📱 Ouverture popup pairing iOS...');
      console.log('💡 Assurez-vous que l\'imprimante est en mode pairing (voyant Bluetooth clignotant rapidement)');

      // Appeler sans adresse MAC pour ouvrir la popup de sélection iOS
      await this.PrintersDiscovery.pairBluetoothDevice();

      console.log('✅ Pairing iOS réussi !');
      return { success: true, message: 'Imprimante jumelée avec succès' };
    } catch (error) {
      console.error('❌ Erreur pairing iOS:', error.message);

      let errorMsg = error.message;
      if (error.message.includes('cancel')) {
        errorMsg = 'Pairing annulé. Réessayez et sélectionnez votre imprimante.';
      } else if (error.message.includes('not found') || error.message.includes('No device')) {
        errorMsg = 'Aucune imprimante trouvée.\n\nMettez l\'imprimante en mode pairing:\n1. Éteignez l\'imprimante\n2. Maintenez FEED et allumez\n3. Relâchez quand le voyant clignote vite';
      }

      return { success: false, error: errorMsg };
    }
  }

  // Se connecter à une imprimante (sauvegarder la config)
  async connectToPrinter(device) {
    if (this.isConnecting) {
      return { success: false, error: 'Connexion en cours...' };
    }

    this.isConnecting = true;
    console.log(`🔗 Configuration de: ${device.name} (${device.address})`);

    try {
      if (!this.Printer) {
        throw new Error('Module Epson non disponible');
      }

      this.connectedDevice = {
        ...device,
        connectedAt: new Date().toISOString(),
      };

      // Sauvegarder la configuration
      await this.saveConfig(this.connectedDevice);

      console.log(`✅ Imprimante ${device.name} configuree`);
      this.isConnecting = false;

      return {
        success: true,
        device: this.connectedDevice,
        message: `Imprimante ${device.name} configuree`
      };

    } catch (error) {
      console.error('❌ Erreur configuration:', error.message);
      this.isConnecting = false;
      return { success: false, error: error.message };
    }
  }

  // Reconnecter à l'imprimante sauvegardée
  async reconnect() {
    if (!this.savedConfig) {
      return { success: false, error: 'Aucune imprimante configuree' };
    }

    console.log(`🔄 Reconnexion a ${this.savedConfig.name}...`);
    this.connectedDevice = this.savedConfig;
    return { success: true, device: this.connectedDevice };
  }

  // Déconnecter
  async disconnect() {
    try {
      const deviceName = this.connectedDevice?.name || 'imprimante';
      this.connectedDevice = null;

      console.log(`🔌 Deconnecte de ${deviceName}`);
      return { success: true, message: `Deconnecte de ${deviceName}` };

    } catch (error) {
      console.error('Erreur deconnexion:', error);
      this.connectedDevice = null;
      return { success: false, error: error.message };
    }
  }

  // Vérifier si connecté
  isConnected() {
    return this.connectedDevice !== null || this.savedConfig !== null;
  }

  // Configurer une imprimante WiFi
  async connectToWiFiPrinter(ipAddress) {
    if (!ipAddress) {
      return { success: false, error: 'Adresse IP requise' };
    }

    console.log(`📶 Configuration imprimante WiFi: ${ipAddress}`);

    const device = {
      id: ipAddress,
      name: 'TM-M30II (WiFi)',
      address: `TCP:${ipAddress}`,
      ip: ipAddress,
      type: 'wifi',
      connectedAt: new Date().toISOString(),
    };

    await this.saveConfig(device);
    this.connectedDevice = device;

    return {
      success: true,
      device: device,
      message: `Imprimante WiFi configurée: ${ipAddress}`,
    };
  }

  // Test d'impression
  async printTest() {
    console.log('🧪 Test impression...');

    const device = this.connectedDevice || this.savedConfig;
    if (!device) {
      return { success: false, error: 'Aucune imprimante configuree' };
    }

    // MODE SIMULATION - Teste sans vraie imprimante
    if (this.simulationMode) {
      console.log('🎮 ========== MODE SIMULATION ==========');
      console.log('🎮 Imprimante:', device.name);
      console.log('🎮 Adresse:', device.address || device.ip);
      console.log('🎮 Type:', device.type);
      console.log('🎮 ');
      console.log('🎮 📄 TICKET TEST SIMULÉ:');
      console.log('🎮 ================================');
      console.log('🎮       BON DE CUISINE');
      console.log('🎮 ================================');
      console.log('🎮 ');
      console.log('🎮        #' + (Math.floor(Math.random() * 900) + 100));
      console.log('🎮 ');
      console.log('🎮        ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      console.log('🎮 ================================');
      console.log('🎮       Jean Dupont');
      console.log('🎮 ');
      console.log('🎮        LIVRAISON');
      console.log('🎮 ');
      console.log('🎮  12 Rue de la Paix');
      console.log('🎮  75001 Paris');
      console.log('🎮  TEL: 06 12 34 56 78');
      console.log('🎮 ================================');
      console.log('🎮  PRODUITS');
      console.log('🎮  --------------------------------');
      console.log('🎮  2x Bacon BBQ Burger');
      console.log('🎮  1x Frites Cheddar Bacon');
      console.log('🎮  2x Coca-Cola');
      console.log('🎮  1x Tiramisu Speculoos');
      console.log('🎮 ================================');
      console.log('🎮        40.80 EUR');
      console.log('🎮        CARTE');
      console.log('🎮 ================================');
      console.log('🎮       *** TEST OK ***');
      console.log('🎮 ');
      console.log('🎮 ✅ Simulation terminée avec succès');
      console.log('🎮 =====================================');

      // Simuler un délai d'impression
      await new Promise(resolve => setTimeout(resolve, 1500));

      return { success: true, message: '🎮 Test SIMULÉ imprimé avec succès !' };
    }

    if (!this.Printer || !this.PrinterConstants) {
      console.error('❌ Module Epson non disponible');
      console.error('   - Printer:', this.Printer ? 'OK' : 'NULL');
      console.error('   - PrinterConstants:', this.PrinterConstants ? 'OK' : 'NULL');
      return { success: false, error: 'Module Epson non disponible.\n\nVérifiez que l\'app est compilée avec le module natif.\nUtilisez: npx expo run:ios' };
    }

    // Déterminer le type de connexion (WiFi ou Bluetooth)
    let targetAddress = device.address;
    const isWiFi = device.type === 'wifi' || device.ip || targetAddress.startsWith('TCP:');

    if (isWiFi) {
      // Mode WiFi - utiliser TCP:IP_ADDRESS
      if (!targetAddress.startsWith('TCP:')) {
        targetAddress = `TCP:${device.ip || targetAddress}`;
      }
      console.log('📶 Mode WiFi détecté');
    } else {
      // Mode Bluetooth - utiliser BT:MAC_ADDRESS
      if (!targetAddress.startsWith('BT:') && !targetAddress.startsWith('TCP:')) {
        targetAddress = `BT:${targetAddress}`;
      }
      console.log('📱 Mode Bluetooth détecté');
    }

    console.log('📍 Target imprimante:', targetAddress);

    try {
      // Créer l'instance printer
      console.log('🔗 Création instance printer...');
      const printer = new this.Printer({
        target: targetAddress,
        deviceName: device.name || 'TM-M30II',
      });

      // Connexion à l'imprimante
      console.log('🔗 Connexion a l\'imprimante...');
      console.log('⏳ Timeout: 30 secondes...');
      await printer.connect(30000);

      // BON DE CUISINE - Ticket test BriveFood
      const PC = this.PrinterConstants;
      const now = new Date();
      const heureCommande = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const orderNumber = Math.floor(Math.random() * 900) + 100;

      // Mode LIVRAISON pour le test (montre toutes les infos)
      const mode = 'LIVRAISON';
      const isLivraison = true;

      // === EN-TÊTE ===
      await printer.addTextAlign(PC.ALIGN_CENTER);
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText('BON DE CUISINE\n');
      await printer.addTextStyle({ em: PC.FALSE });
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('================================\n\n');

      // === NUMÉRO DE COMMANDE (TRÈS GROS) ===
      await printer.addTextSize({ width: 2, height: 3 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText(`#${orderNumber}\n\n`);

      // === HEURE ===
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addText(`${heureCommande}\n`);
      await printer.addTextStyle({ em: PC.FALSE });
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('================================\n\n');

      // === NOM CLIENT (GROS) ===
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText('Jean Dupont\n\n');
      await printer.addTextStyle({ em: PC.FALSE });

      // === MODE (TRÈS VISIBLE) ===
      await printer.addTextSize({ width: 2, height: 3 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText(`${mode}\n`);
      await printer.addTextStyle({ em: PC.FALSE });
      await printer.addTextSize({ width: 1, height: 1 });

      // === INFOS LIVRAISON (si livraison) ===
      if (isLivraison) {
        await printer.addText('\n');
        await printer.addTextSize({ width: 1, height: 2 });
        await printer.addTextAlign(PC.ALIGN_LEFT);
        await printer.addText('12 Rue de la Paix\n');
        await printer.addText('75001 Paris\n\n');
        await printer.addTextStyle({ em: PC.TRUE });
        await printer.addText('TEL: 06 12 34 56 78\n');
        await printer.addTextStyle({ em: PC.FALSE });
        await printer.addTextSize({ width: 1, height: 1 });
        await printer.addTextAlign(PC.ALIGN_CENTER);
      }

      await printer.addText('\n================================\n');

      // === PRODUITS A PREPARER ===
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText('PRODUITS\n');
      await printer.addTextStyle({ em: PC.FALSE });
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('--------------------------------\n\n');

      // Liste des produits (GROS et LISIBLE)
      await printer.addTextAlign(PC.ALIGN_LEFT);
      await printer.addTextSize({ width: 2, height: 2 });

      await printer.addText('2x Bacon BBQ\n');
      await printer.addText('   Burger\n\n');
      await printer.addText('1x Frites\n');
      await printer.addText('   Cheddar Bacon\n\n');
      await printer.addText('2x Coca-Cola\n\n');
      await printer.addText('1x Tiramisu\n');
      await printer.addText('   Speculoos\n');

      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addTextAlign(PC.ALIGN_CENTER);
      await printer.addText('\n================================\n\n');

      // === TOTAL (TRÈS GROS) ===
      await printer.addTextSize({ width: 2, height: 3 });
      await printer.addTextStyle({ em: PC.TRUE });
      await printer.addText('40.80 EUR\n\n');

      // === PAIEMENT ===
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addText('CARTE\n');
      await printer.addTextStyle({ em: PC.FALSE });

      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('\n================================\n');
      await printer.addText('*** TEST OK ***\n');

      await printer.addFeedLine(4);
      await printer.addCut();

      // Envoyer les données
      console.log('📤 Envoi des donnees...');
      const status = await printer.sendData(10000);
      console.log('✅ Test impression reussi, status:', status);

      // Déconnexion
      await printer.disconnect();

      return { success: true, message: 'Test imprime avec succes !' };

    } catch (error) {
      console.error('❌ Erreur test impression:', error.message);
      console.error('❌ Stack:', error.stack);

      // Messages d'erreur plus explicites selon le type de connexion
      let errorMsg = error.message;
      const isWiFiConnection = device.type === 'wifi' || device.ip;

      if (error.message.includes('Failed to open the device')) {
        if (isWiFiConnection) {
          errorMsg = 'Impossible d\'ouvrir la connexion WiFi.\n\nVérifiez que:\n• L\'imprimante est allumée\n• L\'iPad et l\'imprimante sont sur le même réseau WiFi\n• L\'adresse IP est correcte\n• La permission réseau local est activée';
        } else {
          errorMsg = 'Impossible d\'ouvrir la connexion Bluetooth.\n\nVérifiez que:\n• L\'imprimante est allumée\n• Le Bluetooth est activé\n• L\'imprimante est jumelée dans les réglages iOS';
        }
      } else if (error.message.includes('connect') || error.message.includes('Connect')) {
        if (isWiFiConnection) {
          errorMsg = 'Échec de connexion WiFi.\n\nVérifiez:\n• L\'imprimante est allumée\n• L\'adresse IP est correcte\n• Même réseau WiFi\n• Permission réseau local activée';
        } else {
          errorMsg = 'Échec de connexion Bluetooth.\n\nL\'imprimante doit être jumelée dans Réglages → Bluetooth avant utilisation.';
        }
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorMsg = 'Délai d\'attente dépassé (30s).\n\nL\'imprimante ne répond pas. Vérifiez qu\'elle est allumée et accessible.';
      } else if (error.message.includes('Network') || error.message.includes('network')) {
        errorMsg = 'Erreur réseau.\n\nVérifiez la permission réseau local dans Réglages > Confidentialité > Réseau local > BriveFood';
      }

      return { success: false, error: errorMsg };
    }
  }

  // Imprimer une commande (BON DE CUISINE)
  async printOrder(order) {
    if (!order || !order.id) {
      return { success: false, error: 'Donnees de commande invalides' };
    }

    if (!this.autoPrintEnabled) {
      console.log('⏸️ Impression auto desactivee');
      return { success: false, error: 'Impression automatique desactivee' };
    }

    const device = this.connectedDevice || this.savedConfig;
    if (!device) {
      return { success: false, error: 'Aucune imprimante configuree' };
    }

    // MODE SIMULATION - Simule l'impression sans vraie imprimante
    if (this.simulationMode) {
      const mode = this.getModeText(order.mode);
      const customerName = order.customerName || order.firstName || 'Client';

      console.log('🎮 ========== MODE SIMULATION ==========');
      console.log(`🎮 📄 COMMANDE #${order.id} SIMULÉE:`);
      console.log('🎮 ================================');
      console.log('🎮       BON DE CUISINE');
      console.log('🎮 ================================');
      console.log(`🎮        #${order.id}`);
      console.log(`🎮        ${order.orderTime || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      console.log('🎮 ================================');
      console.log(`🎮       ${customerName}`);
      console.log(`🎮        ${mode}`);
      if (order.address) {
        console.log(`🎮  ${order.address}`);
      }
      if (order.phone) {
        console.log(`🎮  TEL: ${order.phone}`);
      }
      console.log('🎮 ================================');
      console.log('🎮  PRODUITS');
      console.log('🎮  --------------------------------');
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          console.log(`🎮  ${item.quantity}x ${item.name}`);
          if (item.options) {
            console.log(`🎮     OPTIONS: ${item.options}`);
          }
        });
      }
      console.log('🎮 ================================');
      console.log(`🎮        ${(order.total || 0).toFixed(2)} EUR`);
      console.log(`🎮        ${order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE'}`);
      console.log('🎮 ================================');
      console.log('🎮 ');
      console.log(`🎮 ✅ Commande #${order.id} simulée avec succès`);
      console.log('🎮 =====================================');

      // Simuler un délai d'impression
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, message: `🎮 Commande #${order.id} SIMULÉE` };
    }

    if (!this.Printer || !this.PrinterConstants) {
      console.error('❌ Module Epson non disponible');
      console.error('   - Printer:', this.Printer ? 'OK' : 'NULL');
      console.error('   - PrinterConstants:', this.PrinterConstants ? 'OK' : 'NULL');
      return { success: false, error: 'Module Epson non disponible.\n\nVérifiez que l\'app est compilée avec le module natif.\nUtilisez: npx expo run:ios' };
    }

    console.log(`🖨️ Impression commande #${order.id}...`);

    // Déterminer le type de connexion (WiFi ou Bluetooth)
    let targetAddress = device.address;
    const isWiFi = device.type === 'wifi' || device.ip || targetAddress.startsWith('TCP:');

    if (isWiFi) {
      if (!targetAddress.startsWith('TCP:')) {
        targetAddress = `TCP:${device.ip || targetAddress}`;
      }
      console.log('📶 Mode WiFi');
    } else {
      if (!targetAddress.startsWith('BT:') && !targetAddress.startsWith('TCP:')) {
        targetAddress = `BT:${targetAddress}`;
      }
      console.log('📱 Mode Bluetooth');
    }

    console.log('📍 Target imprimante:', targetAddress);

    try {
      const printer = new this.Printer({
        target: targetAddress,
        deviceName: device.name || 'TM-M30II',
      });

      const PC = this.PrinterConstants;

      // Connexion à l'imprimante
      console.log('🔗 Connexion a l\'imprimante...');
      console.log('⏳ Timeout: 30 secondes...');
      await printer.connect(30000);

      // Déterminer le mode
      const mode = this.getModeText(order.mode);
      const isLivraison = order.mode?.toUpperCase() === 'DELIVERY';

      // Heure de la commande
      const heureCommande = order.orderTime || new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // === TOUT EN GRAS ===
      await printer.addTextStyle({ em: PC.TRUE });

      // === EN-TÊTE ===
      await printer.addTextAlign(PC.ALIGN_CENTER);
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addText('BON DE CUISINE\n');
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('================================\n\n');

      // === NUMÉRO DE COMMANDE (TRÈS GROS) ===
      await printer.addTextSize({ width: 2, height: 3 });
      await printer.addText(`#${order.id}\n\n`);

      // === HEURE ===
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addText(`${heureCommande}\n`);
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('================================\n\n');

      // === NOM CLIENT ===
      const customerName = order.customerName ||
                          (order.firstName && order.lastName ? `${order.firstName} ${order.lastName}` : null) ||
                          order.firstName ||
                          'Client';
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addText(`${customerName}\n\n`);

      // === MODE (TRÈS VISIBLE) ===
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addText(`${mode}\n`);
      await printer.addTextSize({ width: 1, height: 1 });

      // === INFOS CLIENT ===
      if (isLivraison && order.address) {
        // Adresse centrée pour livraison
        await printer.addText('\n');
        await printer.addTextSize({ width: 1, height: 2 });
        await printer.addTextAlign(PC.ALIGN_CENTER);
        await printer.addText(`${order.address}\n`);
        await printer.addTextSize({ width: 1, height: 1 });
      }

      // Téléphone pour TOUS les types de commande
      const customerPhone = order.phone || order.phoneNumber || '';
      if (customerPhone) {
        await printer.addText('\n');
        await printer.addTextSize({ width: 1, height: 2 });
        await printer.addTextAlign(PC.ALIGN_CENTER);
        await printer.addText(`TEL: ${customerPhone}\n`);
        await printer.addTextSize({ width: 1, height: 1 });
      }

      await printer.addText('\n================================\n');

      // === PRODUITS A PREPARER ===
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addText('PRODUITS\n');
      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('--------------------------------\n\n');

      // Liste des produits (GRAS et LISIBLE)
      await printer.addTextAlign(PC.ALIGN_LEFT);
      await printer.addTextSize({ width: 1, height: 2 });

      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          // Nom du produit en gras avec prix
          await printer.addText(`${item.quantity}x ${item.name} — ${(item.price || 0).toFixed(2)}€\n`);

          // Taille si présente
          if (item.size) {
            await printer.addText(`   Taille: ${item.size}\n`);
          }

          // PERSONNALISATIONS DÉTAILLÉES — item.options contient toutes les options (frites, sauces, boissons, viandes, etc.)
          if (item.options) {
            const optionsList = item.options.split(' | ');
            for (const opt of optionsList) {
              await printer.addText(`   > ${opt}\n`);
            }
          }
          // Toujours vérifier customizations en complément (au cas où options est incomplet ou absent)
          if (item.customizations && item.customizationOptions) {
            const alreadyShown = item.options || '';
            for (const [catKey, selectedOpts] of Object.entries(item.customizations)) {
              const cat = item.customizationOptions[catKey];
              if (cat && selectedOpts && selectedOpts.length > 0) {
                for (const optId of selectedOpts) {
                  const opt = cat.options?.find(o => o.id === optId);
                  if (opt && !alreadyShown.includes(opt.name)) {
                    await printer.addText(`   > ${cat.title || catKey}: ${opt.name}${opt.price > 0 ? ` (+${opt.price.toFixed(2)}€)` : ''}\n`);
                  }
                }
              }
            }
          }

          // Notes/commentaires importants
          if (item.comment || item.comments) {
            await printer.addText(`   NOTE: ${item.comment || item.comments}\n`);
          }

          await printer.addText('\n');
        }
      }

      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addTextAlign(PC.ALIGN_CENTER);
      await printer.addText('\n================================\n\n');

      // === TOTAL ===
      await printer.addTextSize({ width: 2, height: 2 });
      await printer.addText(`${(order.total || 0).toFixed(2)} EUR\n\n`);

      // === PAIEMENT ===
      const paymentText = order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE';
      await printer.addTextSize({ width: 1, height: 2 });
      await printer.addText(`${paymentText}\n`);

      await printer.addTextSize({ width: 1, height: 1 });
      await printer.addText('\n================================\n');

      await printer.addTextStyle({ em: PC.FALSE });
      await printer.addFeedLine(4);
      await printer.addCut();

      // Envoyer à l'imprimante
      console.log('📤 Envoi des donnees...');
      const status = await printer.sendData(15000);

      // Déconnexion
      await printer.disconnect();

      console.log(`✅ Commande #${order.id} imprimee, status:`, status);
      return { success: true, message: `Ticket #${order.id} imprime` };

    } catch (error) {
      console.error('❌ Erreur impression:', error.message);

      // Messages d'erreur plus explicites
      let errorMsg = error.message;
      if (error.message.includes('Failed to open the device')) {
        errorMsg = 'Impossible d\'ouvrir la connexion. Vérifiez que l\'imprimante est allumée.';
      } else if (error.message.includes('connect')) {
        errorMsg = 'Échec de connexion WiFi.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Délai dépassé. L\'imprimante ne répond pas.';
      }

      return { success: false, error: errorMsg };
    }
  }

  // Convertir le mode en texte
  getModeText(mode) {
    switch (mode?.toUpperCase()) {
      case 'DELIVERY':
        return 'LIVRAISON';
      case 'TAKEOUT':
        return 'A EMPORTER';
      case 'DINE_IN':
        return 'SUR PLACE';
      default:
        return mode || 'A EMPORTER';
    }
  }

  // Message selon le mode
  getModeMessage(mode) {
    switch (mode?.toUpperCase()) {
      case 'DELIVERY':
        return 'Prevoir livreur';
      case 'TAKEOUT':
        return 'Client vient chercher';
      case 'DINE_IN':
        return 'A servir en salle';
      default:
        return '';
    }
  }

  // Obtenir le statut actuel
  getStatus() {
    return {
      isConnected: this.isConnected(),
      device: this.connectedDevice || this.savedConfig,
      autoPrintEnabled: this.autoPrintEnabled,
      moduleAvailable: this.isModuleAvailable(),
      savedConfig: this.savedConfig,
      simulationMode: this.simulationMode,
    };
  }

  // Obtenir la configuration sauvegardée
  getSavedConfig() {
    return this.savedConfig;
  }
}

// Instance singleton
const epsonBluetoothService = new EpsonBluetoothService();
export default epsonBluetoothService;
