// Debug utility to check AsyncStorage content
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugAsyncStorage = async () => {
  try {
    console.log('=== ASYNC STORAGE DEBUG ===');

    // Check orders
    const ordersData = await AsyncStorage.getItem('@orders');
    console.log('Raw @orders data:', ordersData);

    if (ordersData) {
      const parsedOrders = JSON.parse(ordersData);
      console.log('Parsed @orders:', parsedOrders);
      console.log('Number of orders:', parsedOrders.length);
    } else {
      console.log('No @orders data found');
    }

    // Check last order number
    const lastOrderNumber = await AsyncStorage.getItem('@lastOrderNumber');
    console.log('Last order number:', lastOrderNumber);

    // Check active order
    const activeOrder = await AsyncStorage.getItem('@activeOrder');
    console.log('Active order:', activeOrder);

    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', allKeys);

    console.log('=== END DEBUG ===');
  } catch (error) {
    console.error('Error debugging AsyncStorage:', error);
  }
};