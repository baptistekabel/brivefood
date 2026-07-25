import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../../src/constants/theme';

// Hauteurs adaptées par plateforme
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 25 : 10;

// Palette de la barre de navigation — identité BriveFood (noir + doré chaleureux)
const TAB_BAR_ACTIVE = colors.accent.main;          // Doré : onglet sélectionné
const TAB_BAR_INACTIVE = 'rgba(255, 255, 255, 0.4)'; // Blanc estompé : onglets inactifs
const TAB_BAR_GLASS = ['rgba(28, 28, 30, 0.96)', 'rgba(10, 10, 12, 0.98)'];
const TAB_BAR_HAIRLINE = 'rgba(251, 191, 36, 0.22)'; // Liseré doré discret

// Barre d'onglets native avec effet Liquid Glass (iOS 26+)
function LiquidGlassTabs() {
  return (
    <NativeTabs
      tintColor={TAB_BAR_ACTIVE}
      iconColor={TAB_BAR_INACTIVE}
      labelStyle={{ color: TAB_BAR_INACTIVE }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Accueil</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="menu">
        <Icon sf="fork.knife" />
        <Label>Menu</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: 'receipt', selected: 'receipt.fill' }} />
        <Label>Commandes</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="loyalty">
        <Icon sf={{ default: 'star', selected: 'star.fill' }} />
        <Label>Fidélité</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Barre d'onglets classique (Android et iOS < 26)
function ClassicTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: TAB_BAR_ACTIVE,
        tabBarInactiveTintColor: TAB_BAR_INACTIVE,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.45,
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
          <LinearGradient
            colors={TAB_BAR_GLASS}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: TAB_BAR_HEIGHT,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              borderTopWidth: 1,
              borderColor: TAB_BAR_HAIRLINE,
              overflow: 'hidden',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 12,
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

// Liquid Glass disponible uniquement sur iOS 26+ (dernière mise à jour Apple)
const supportsLiquidGlass =
  Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;

export default function TabLayout() {
  return supportsLiquidGlass ? <LiquidGlassTabs /> : <ClassicTabs />;
}
