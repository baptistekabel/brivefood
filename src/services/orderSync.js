import * as FileSystem from 'expo-file-system/legacy';

// Chemin du fichier partagé pour les commandes
const ORDERS_FILE_PATH = `${FileSystem.documentDirectory}shared_orders.json`;

// Service de synchronisation des commandes via fichier
export class OrderSyncService {
  static instance = null;

  static getInstance() {
    if (!OrderSyncService.instance) {
      OrderSyncService.instance = new OrderSyncService();
    }
    return OrderSyncService.instance;
  }

  // Sauvegarder les commandes dans le fichier partagé
  async saveOrdersToFile(orders) {
    try {
      console.log('🔄 [OrderSync] Saving orders to shared file:', orders.length);

      const data = {
        orders: orders,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      };

      await FileSystem.writeAsStringAsync(
        ORDERS_FILE_PATH,
        JSON.stringify(data),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      console.log('✅ [OrderSync] Orders saved to file successfully');
      return true;
    } catch (error) {
      console.error('❌ [OrderSync] Error saving orders to file:', error);
      return false;
    }
  }

  // Lire les commandes depuis le fichier partagé
  async loadOrdersFromFile() {
    try {
      const fileExists = await FileSystem.getInfoAsync(ORDERS_FILE_PATH);

      if (!fileExists.exists) {
        console.log('📄 [OrderSync] Shared orders file does not exist yet');
        return [];
      }

      const fileContent = await FileSystem.readAsStringAsync(ORDERS_FILE_PATH);
      const data = JSON.parse(fileContent);

      console.log('📖 [OrderSync] Loaded orders from file:', data.orders.length);
      console.log('📖 [OrderSync] File last updated:', data.lastUpdated);

      return data.orders || [];
    } catch (error) {
      console.error('❌ [OrderSync] Error loading orders from file:', error);
      return [];
    }
  }

  // Vérifier si le fichier a été modifié depuis la dernière vérification
  async checkForUpdates(lastKnownTimestamp = 0) {
    try {
      console.log('🔍 [OrderSync] Checking file:', ORDERS_FILE_PATH);
      console.log('🔍 [OrderSync] Last known timestamp:', lastKnownTimestamp);

      // Essayer de lire le fichier directement
      const fileContent = await FileSystem.readAsStringAsync(ORDERS_FILE_PATH);
      const data = JSON.parse(fileContent);

      console.log('📖 [OrderSync] File content loaded, timestamp:', data.timestamp);
      console.log('📖 [OrderSync] Orders in file:', data.orders.length);

      const hasUpdates = data.timestamp > lastKnownTimestamp;

      if (hasUpdates) {
        console.log('🔄 [OrderSync] File has updates:', data.timestamp, 'vs', lastKnownTimestamp);
      }

      return {
        hasUpdates,
        orders: data.orders || [],
        timestamp: data.timestamp,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error('❌ [OrderSync] Error checking for updates:', error);

      // Si le fichier n'existe pas, retourner pas de mises à jour
      if (error.message.includes('no such file')) {
        console.log('📄 [OrderSync] File does not exist yet');
        return { hasUpdates: false, orders: [] };
      }

      return { hasUpdates: false, orders: [] };
    }
  }

  // Supprimer le fichier de synchronisation (pour debug)
  async clearSyncFile() {
    try {
      const fileExists = await FileSystem.getInfoAsync(ORDERS_FILE_PATH);
      if (fileExists.exists) {
        await FileSystem.deleteAsync(ORDERS_FILE_PATH);
        console.log('🗑️ [OrderSync] Shared orders file deleted');
      }
    } catch (error) {
      console.error('❌ [OrderSync] Error deleting sync file:', error);
    }
  }

  // Obtenir les informations du fichier de synchronisation
  async getSyncFileInfo() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(ORDERS_FILE_PATH);
      return {
        exists: fileInfo.exists,
        size: fileInfo.size,
        modificationTime: fileInfo.modificationTime,
        path: ORDERS_FILE_PATH
      };
    } catch (error) {
      console.error('❌ [OrderSync] Error getting file info:', error);
      return { exists: false };
    }
  }
}

export default OrderSyncService.getInstance();