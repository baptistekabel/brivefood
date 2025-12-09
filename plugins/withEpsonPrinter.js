const { withInfoPlist, withPodfile } = require('@expo/config-plugins');

/**
 * Config plugin pour react-native-esc-pos-printer
 * Ajoute les configurations iOS nécessaires pour le SDK Epson
 */

function withEpsonPrinterIOS(config) {
  // Ajouter les protocoles External Accessory
  config = withInfoPlist(config, (config) => {
    // Protocoles Epson pour Bluetooth
    const protocols = config.modResults.UISupportedExternalAccessoryProtocols || [];

    if (!protocols.includes('com.epson.escpos')) {
      protocols.push('com.epson.escpos');
    }

    config.modResults.UISupportedExternalAccessoryProtocols = protocols;

    // Permissions Bluetooth
    if (!config.modResults.NSBluetoothAlwaysUsageDescription) {
      config.modResults.NSBluetoothAlwaysUsageDescription =
        'BriveFood utilise le Bluetooth pour se connecter à l\'imprimante de tickets.';
    }

    if (!config.modResults.NSBluetoothPeripheralUsageDescription) {
      config.modResults.NSBluetoothPeripheralUsageDescription =
        'BriveFood utilise le Bluetooth pour imprimer les tickets de commande.';
    }

    // Mode background pour Bluetooth
    const bgModes = config.modResults.UIBackgroundModes || [];
    if (!bgModes.includes('bluetooth-central')) {
      bgModes.push('bluetooth-central');
    }
    if (!bgModes.includes('external-accessory')) {
      bgModes.push('external-accessory');
    }
    config.modResults.UIBackgroundModes = bgModes;

    return config;
  });

  return config;
}

module.exports = function withEpsonPrinter(config) {
  config = withEpsonPrinterIOS(config);
  return config;
};
