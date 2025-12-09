import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

// Storage keys
const STORAGE_KEYS = {
  PRINTER_CONFIG: '@bluetooth_printer_config_v2',
  AUTO_PRINT_ENABLED: '@bluetooth_auto_print_v2',
};

// Commandes ESC/POS pour imprimantes thermiques
const ESC = '\x1B';
const GS = '\x1D';
const COMMANDS = {
  // Initialisation
  INIT: ESC + '@',

  // Alignement
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',

  // Taille texte
  TEXT_NORMAL: GS + '!' + '\x00',
  TEXT_DOUBLE_HEIGHT: GS + '!' + '\x01',
  TEXT_DOUBLE_WIDTH: GS + '!' + '\x10',
  TEXT_DOUBLE: GS + '!' + '\x11',

  // Style
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  UNDERLINE_ON: ESC + '-' + '\x01',
  UNDERLINE_OFF: ESC + '-' + '\x00',

  // Coupe papier
  CUT_PAPER: GS + 'V' + '\x00',
  CUT_PAPER_PARTIAL: GS + 'V' + '\x01',

  // Avance papier
  FEED_LINE: '\n',
  FEED_LINES_3: '\n\n\n',
  FEED_LINES_5: '\n\n\n\n\n',
};

class BluetoothPrinterServiceV2 {
  constructor() {
    this.RNBluetoothClassic = null;
    this.connectedDevice = null;
    this.isConnecting = false;
    this.autoPrintEnabled = true;
    this.savedConfig = null;
    this.isInitialized = false;

    // Initialiser de manière asynchrone pour éviter les crashs
    setTimeout(() => this.initModule(), 100);
  }

  async initModule() {
    try {
      // Charger d'abord la config sauvegardée (ne dépend pas du module Bluetooth)
      await this.loadSavedConfig();

      // Essayer de charger le module Bluetooth
      const BtModule = require('react-native-bluetooth-classic');
      if (BtModule && (BtModule.default || BtModule.RNBluetoothClassic)) {
        this.RNBluetoothClassic = BtModule.default || BtModule.RNBluetoothClassic;
        this.isInitialized = true;
        console.log('✅ Module Bluetooth Classic chargé');
      } else {
        console.warn('⚠️ Module Bluetooth Classic: structure invalide');
      }
    } catch (error) {
      console.warn('⚠️ Module Bluetooth Classic non disponible:', error.message);
      this.RNBluetoothClassic = null;
      this.isInitialized = false;
    }
  }

  async loadSavedConfig() {
    try {
      const configStr = await AsyncStorage.getItem(STORAGE_KEYS.PRINTER_CONFIG);
      if (configStr) {
        this.savedConfig = JSON.parse(configStr);
        console.log('📋 Config imprimante chargée:', this.savedConfig?.name);
      }

      const autoPrint = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_PRINT_ENABLED);
      this.autoPrintEnabled = autoPrint !== 'false';
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  }

  async saveConfig(config) {
    try {
      this.savedConfig = config;
      await AsyncStorage.setItem(STORAGE_KEYS.PRINTER_CONFIG, JSON.stringify(config));
      console.log('💾 Config imprimante sauvegardée');
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  }

  async setAutoPrintEnabled(enabled) {
    this.autoPrintEnabled = enabled;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_PRINT_ENABLED, enabled.toString());
    console.log(`🖨️ Impression auto: ${enabled ? 'activée' : 'désactivée'}`);
  }

  isModuleAvailable() {
    return this.RNBluetoothClassic !== null && this.isInitialized;
  }

  // Vérifier si Bluetooth est activé
  async isBluetoothEnabled() {
    if (!this.RNBluetoothClassic) return false;
    try {
      return await this.RNBluetoothClassic.isBluetoothEnabled();
    } catch (error) {
      console.error('Erreur vérification Bluetooth:', error);
      return false;
    }
  }

  // Demander permissions Android
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Erreur permissions:', error);
        return false;
      }
    }
    return true; // iOS gère les permissions automatiquement
  }

  // Lister les appareils jumelés
  async getPairedDevices() {
    if (!this.RNBluetoothClassic) {
      console.warn('Module Bluetooth non disponible');
      return [];
    }

    try {
      await this.requestPermissions();

      const enabled = await this.isBluetoothEnabled();
      if (!enabled) {
        console.warn('Bluetooth désactivé');
        return [];
      }

      console.log('🔍 Récupération appareils jumelés...');
      const devices = await this.RNBluetoothClassic.getBondedDevices();
      console.log('📱 Appareils trouvés:', devices.length);

      // Filtrer pour trouver les imprimantes (TM-M30, etc.)
      const printers = devices.filter(device => {
        const name = (device.name || '').toLowerCase();
        return name.includes('tm-') ||
               name.includes('epson') ||
               name.includes('printer') ||
               name.includes('m30');
      });

      console.log('🖨️ Imprimantes trouvées:', printers.length);

      return devices.map(device => ({
        id: device.id || device.address,
        name: device.name || 'Appareil Bluetooth',
        address: device.address || device.id,
        bonded: device.bonded,
      }));
    } catch (error) {
      console.error('Erreur liste appareils:', error);
      return [];
    }
  }

  // Connecter à un appareil
  async connectToDevice(device) {
    if (!this.RNBluetoothClassic) {
      return { success: false, error: 'Module Bluetooth non disponible' };
    }

    if (this.isConnecting) {
      return { success: false, error: 'Connexion en cours...' };
    }

    this.isConnecting = true;
    console.log(`🔗 Connexion à: ${device.name} (${device.address})`);

    try {
      // Vérifier si déjà connecté
      const isConnected = await this.RNBluetoothClassic.isDeviceConnected(device.address);

      if (isConnected) {
        console.log('✅ Déjà connecté');
        this.connectedDevice = await this.RNBluetoothClassic.getConnectedDevice(device.address);
      } else {
        // Connecter
        console.log('📡 Tentative de connexion...');
        this.connectedDevice = await this.RNBluetoothClassic.connectToDevice(device.address, {
          delimiter: '',
          charset: 'utf-8',
        });
      }

      // Sauvegarder la config
      await this.saveConfig({
        ...device,
        connectedAt: new Date().toISOString(),
      });

      console.log(`✅ Connecté à ${device.name}`);
      this.isConnecting = false;

      return {
        success: true,
        device: this.connectedDevice,
        message: `Connecté à ${device.name}`,
      };
    } catch (error) {
      console.error('❌ Erreur connexion:', error.message);
      this.isConnecting = false;
      return { success: false, error: error.message };
    }
  }

  // Déconnecter
  async disconnect() {
    try {
      if (this.connectedDevice) {
        await this.connectedDevice.disconnect();
        const name = this.connectedDevice.name || 'imprimante';
        this.connectedDevice = null;
        console.log(`🔌 Déconnecté de ${name}`);
        return { success: true, message: `Déconnecté de ${name}` };
      }
      return { success: true, message: 'Aucune connexion active' };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      this.connectedDevice = null;
      return { success: false, error: error.message };
    }
  }

  // Vérifier connexion
  async isConnected() {
    if (!this.savedConfig?.address) return false;

    try {
      if (this.RNBluetoothClassic) {
        return await this.RNBluetoothClassic.isDeviceConnected(this.savedConfig.address);
      }
    } catch (error) {
      console.log('Erreur vérification connexion:', error);
    }
    return false;
  }

  // Reconnecter à l'imprimante sauvegardée
  async reconnect() {
    if (!this.savedConfig) {
      return { success: false, error: 'Aucune imprimante configurée' };
    }

    console.log(`🔄 Reconnexion à ${this.savedConfig.name}...`);
    return await this.connectToDevice(this.savedConfig);
  }

  // Envoyer des données à l'imprimante
  async sendData(data) {
    try {
      // S'assurer qu'on est connecté
      if (!this.connectedDevice) {
        if (this.savedConfig) {
          const reconnectResult = await this.reconnect();
          if (!reconnectResult.success) {
            return { success: false, error: 'Impossible de se reconnecter' };
          }
        } else {
          return { success: false, error: 'Aucune imprimante connectée' };
        }
      }

      console.log('📤 Envoi données à l\'imprimante...');
      await this.connectedDevice.write(data, 'utf-8');
      console.log('✅ Données envoyées');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur envoi:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test d'impression
  async printTest() {
    console.log('🧪 Test impression...');

    const device = this.savedConfig;
    if (!device) {
      return { success: false, error: 'Aucune imprimante configurée' };
    }

    try {
      // Connecter si nécessaire
      const connectResult = await this.connectToDevice(device);
      if (!connectResult.success) {
        return { success: false, error: connectResult.error };
      }

      // Construire le ticket test
      let ticket = '';
      ticket += COMMANDS.INIT;
      ticket += COMMANDS.ALIGN_CENTER;
      ticket += COMMANDS.TEXT_DOUBLE;
      ticket += 'TEST IMPRESSION\n';
      ticket += COMMANDS.TEXT_NORMAL;
      ticket += '================================\n';
      ticket += `Imprimante: ${device.name}\n`;
      ticket += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
      ticket += '================================\n';
      ticket += COMMANDS.BOLD_ON;
      ticket += 'Configuration OK !\n';
      ticket += COMMANDS.BOLD_OFF;
      ticket += 'BriveFood App\n';
      ticket += COMMANDS.FEED_LINES_3;
      ticket += COMMANDS.CUT_PAPER;

      const result = await this.sendData(ticket);

      if (result.success) {
        console.log('✅ Test impression réussi');
        return { success: true, message: 'Test imprimé avec succès !' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur test impression:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Imprimer une commande
  async printOrder(order) {
    if (!order || !order.id) {
      return { success: false, error: 'Données de commande invalides' };
    }

    if (!this.autoPrintEnabled) {
      console.log('⏸️ Impression auto désactivée');
      return { success: false, error: 'Impression automatique désactivée' };
    }

    const device = this.savedConfig;
    if (!device) {
      return { success: false, error: 'Aucune imprimante configurée' };
    }

    console.log(`🖨️ Impression commande #${order.id}...`);

    try {
      // Connecter si nécessaire
      const connectResult = await this.connectToDevice(device);
      if (!connectResult.success) {
        return { success: false, error: connectResult.error };
      }

      const currentDate = new Date().toLocaleString('fr-FR');

      // Construire le ticket
      let ticket = '';

      // Initialisation
      ticket += COMMANDS.INIT;

      // En-tête
      ticket += COMMANDS.ALIGN_CENTER;
      ticket += COMMANDS.TEXT_DOUBLE;
      ticket += COMMANDS.BOLD_ON;
      ticket += 'NOUVELLE COMMANDE\n';
      ticket += COMMANDS.TEXT_NORMAL;
      ticket += COMMANDS.BOLD_OFF;
      ticket += '================================\n';

      // Numéro de commande
      ticket += COMMANDS.TEXT_DOUBLE_HEIGHT;
      ticket += `#${order.id}\n`;
      ticket += COMMANDS.TEXT_NORMAL;
      ticket += `${currentDate}\n`;
      ticket += '================================\n';

      // Client
      ticket += COMMANDS.ALIGN_LEFT;
      const customerName = order.customerName || order.firstName || 'Client';
      ticket += COMMANDS.BOLD_ON;
      ticket += `CLIENT: ${customerName}\n`;
      ticket += COMMANDS.BOLD_OFF;

      if (order.phone) {
        ticket += `TEL: ${order.phone}\n`;
      }

      ticket += '--------------------------------\n';

      // Mode de service
      ticket += COMMANDS.ALIGN_CENTER;
      ticket += COMMANDS.TEXT_DOUBLE_HEIGHT;
      ticket += COMMANDS.BOLD_ON;
      ticket += `${this.getModeText(order.mode)}\n`;
      ticket += COMMANDS.TEXT_NORMAL;
      ticket += COMMANDS.BOLD_OFF;

      if (order.mode === 'DELIVERY' && order.address) {
        ticket += COMMANDS.ALIGN_LEFT;
        ticket += `Adresse: ${order.address}\n`;
      }

      ticket += '================================\n';

      // Articles
      ticket += COMMANDS.ALIGN_CENTER;
      ticket += COMMANDS.BOLD_ON;
      ticket += 'ARTICLES A PREPARER\n';
      ticket += COMMANDS.BOLD_OFF;
      ticket += '--------------------------------\n';

      if (order.items && order.items.length > 0) {
        ticket += COMMANDS.ALIGN_LEFT;

        for (const item of order.items) {
          ticket += COMMANDS.BOLD_ON;
          ticket += `${item.quantity}x ${item.name}\n`;
          ticket += COMMANDS.BOLD_OFF;

          if (item.size) {
            ticket += `   Taille: ${item.size}\n`;
          }

          if (item.price) {
            ticket += `   Prix: ${(item.price * item.quantity).toFixed(2)} EUR\n`;
          }

          if (item.options) {
            ticket += `   ${item.options}\n`;
          }

          if (item.comment || item.comments) {
            ticket += COMMANDS.BOLD_ON;
            ticket += `   NOTE: ${item.comment || item.comments}\n`;
            ticket += COMMANDS.BOLD_OFF;
          }

          ticket += '- - - - - - - - - - - - - - - -\n';
        }
      }

      ticket += '================================\n';

      // Total
      ticket += COMMANDS.TEXT_DOUBLE_HEIGHT;
      ticket += COMMANDS.BOLD_ON;
      ticket += `TOTAL: ${(order.total || 0).toFixed(2)} EUR\n`;
      ticket += COMMANDS.TEXT_NORMAL;
      ticket += COMMANDS.BOLD_OFF;

      const paymentText = order.paymentMethod === 'cash' ? 'ESPECES' : 'CARTE';
      ticket += `Paiement: ${paymentText}\n`;

      ticket += '================================\n';

      // Instructions
      ticket += COMMANDS.ALIGN_CENTER;
      ticket += COMMANDS.BOLD_ON;
      ticket += 'A PREPARER MAINTENANT !\n';
      ticket += COMMANDS.BOLD_OFF;

      const modeMessage = this.getModeMessage(order.mode);
      if (modeMessage) {
        ticket += `${modeMessage}\n`;
      }

      // Fin
      ticket += COMMANDS.FEED_LINES_5;
      ticket += COMMANDS.CUT_PAPER;

      // Envoyer
      const result = await this.sendData(ticket);

      if (result.success) {
        console.log(`✅ Commande #${order.id} imprimée`);
        return { success: true, message: `Ticket #${order.id} imprimé` };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur impression:', error.message);
      return { success: false, error: error.message };
    }
  }

  getModeText(mode) {
    switch (mode?.toUpperCase()) {
      case 'DELIVERY': return 'LIVRAISON';
      case 'TAKEOUT': return 'A EMPORTER';
      case 'DINE_IN': return 'SUR PLACE';
      default: return mode || 'A EMPORTER';
    }
  }

  getModeMessage(mode) {
    switch (mode?.toUpperCase()) {
      case 'DELIVERY': return 'Prevoir livreur';
      case 'TAKEOUT': return 'Client vient chercher';
      case 'DINE_IN': return 'A servir en salle';
      default: return '';
    }
  }

  getStatus() {
    return {
      isConnected: this.connectedDevice !== null,
      device: this.savedConfig,
      autoPrintEnabled: this.autoPrintEnabled,
      moduleAvailable: this.isModuleAvailable(),
      savedConfig: this.savedConfig,
    };
  }

  getSavedConfig() {
    return this.savedConfig;
  }
}

// Instance singleton
const bluetoothPrinterServiceV2 = new BluetoothPrinterServiceV2();
export default bluetoothPrinterServiceV2;
