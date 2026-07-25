import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../../src/constants/theme';
import AdminProtectedRoute from '../../src/components/auth/AdminProtectedRoute';
import { useNotifications } from '../../src/hooks/useNotifications';

export default function AdminTabLayout() {
  const { requestPermission, isPermissionGranted, isInitialized } = useNotifications();

  useEffect(() => {
    // Initialiser les notifications pour l'admin dès l'ouverture
    const initNotifications = async () => {
      if (!isPermissionGranted && isInitialized) {
        await requestPermission();
      }
    };

    initNotifications();
  }, [isInitialized, isPermissionGranted]);

  return (
    <AdminProtectedRoute requiredType="admin">
      <Tabs
      initialRouteName="dashboard"
      id="admin-tabs"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#010101',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.fontFamily.semibold,
          marginTop: 2,
          letterSpacing: 0.2,
          textAlign: 'center',
        },
        tabBarAllowFontScaling: false,
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          paddingHorizontal: 2,
          flex: 1,
        },
        tabBarBackground: () => (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 85,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(500px)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
            }}
          />
        ),
      })}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "speedometer" : "speedometer-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products-manager"
        options={{
          title: 'Produits',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Statistiques',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="delivery-management"
        options={{
          title: 'Gestion livreur',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tablet-setup"
        options={{
          href: null, // Cache cet écran des tabs
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Cache cet écran des tabs
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          href: null, // Cache cet écran des tabs
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Cache cet écran des tabs
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Cache cet écran des tabs - redirection automatique
        }}
      />
      <Tabs.Screen
        name="order-details"
        options={{
          href: null, // Cache cet écran des tabs - écran de détail
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          href: null, // Cache cet écran des tabs - accessible via les statistiques
        }}
      />
      <Tabs.Screen
        name="printer-setup"
        options={{
          href: null, // Cache cet écran des tabs - accessible via les paramètres
        }}
      />
      <Tabs.Screen
        name="archives"
        options={{
          href: null, // Cache cet écran des tabs - accessible via les paramètres
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null, // Cache cet écran des tabs - accessible via les paramètres
        }}
      />
      <Tabs.Screen
        name="dashboard-backup"
        options={{
          href: null, // Cache cet écran des tabs
        }}
      />
      </Tabs>
    </AdminProtectedRoute>
  );
}