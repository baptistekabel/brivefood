import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../../src/constants/theme';

// Hauteurs adaptées par plateforme
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 25 : 10;

export default function TabLayout() {
  return (
    <Tabs
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
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: 8,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: typography.fontFamily.semibold,
          marginTop: 2,
          letterSpacing: 0.05,
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
              height: TAB_BAR_HEIGHT,
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
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? "restaurant" : "restaurant-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: 'Fidélité',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
