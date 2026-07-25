// Script de debug pour vérifier AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugOrders = async () => {
  console.log('🔍 === DEBUG ORDERS ===');

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All keys:', allKeys);

    const orderKeys = allKeys.filter(key =>
      key.includes('order') || key.includes('Order') || key.includes('@orders')
    );

    console.log('Order-related keys:', orderKeys);

    for (const key of orderKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'not array');
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Latest from ${key}:`, parsed[0]);
          }
        } catch (e) {
          console.log(`${key}: parse error`);
        }
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};