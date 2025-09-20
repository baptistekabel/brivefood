import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import { AuthProvider } from '../src/context/AuthContext';
import { OrderProvider } from '../src/context/OrderContext';
import { OrdersProvider } from '../src/context/OrdersContext';
import { LoyaltyProvider } from '../src/context/LoyaltyContext';
import { AdminAuthProvider } from '../src/context/AdminAuthContext';
import { DeliveryManagementProvider } from '../src/context/DeliveryManagementContext';
import { DeliveryAuthProvider } from '../src/context/DeliveryAuthContext';
import { colors } from '../src/constants/theme';
import OrderThumbnail from '../src/components/common/OrderThumbnail';
import useFonts from '../src/hooks/useFonts';


// Thème personnalisé
const BriveFoodTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.main,
    background: colors.background.primary,
    card: colors.neutral.white,
    text: colors.neutral.gray800,
    border: colors.neutral.gray200,
    notification: colors.accent.main,
  },
};

export default function RootLayout() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <DeliveryManagementProvider>
          <DeliveryAuthProvider>
            <OrderProvider>
              <OrdersProvider>
                <LoyaltyProvider>
                <ThemeProvider value={BriveFoodTheme}>
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
              <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
              <Stack.Screen name="auth/email-verification" options={{ headerShown: false }} />
              <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="auth/admin-login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/delivery-login" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
              <Stack.Screen name="profile/edit" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="profile/addresses" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="profile/add-address" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="profile/orders" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="profile/payment" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen 
                name="cart" 
                options={{ 
                  title: 'Panier',
                  presentation: 'modal',
                  headerStyle: { backgroundColor: '#000000' },
                  headerTintColor: colors.neutral.white,
                }} 
              />
            </Stack>
            <OrderThumbnail />
            <StatusBar style="auto" />
            </View>
            </ThemeProvider>
                </LoyaltyProvider>
              </OrdersProvider>
            </OrderProvider>
          </DeliveryAuthProvider>
        </DeliveryManagementProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
