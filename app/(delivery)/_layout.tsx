import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../../src/constants/theme';
import DeliveryProtectedRoute from '../../src/components/auth/DeliveryProtectedRoute';

export default function DeliveryTabLayout() {
  return (
    <DeliveryProtectedRoute requiredType="delivery">
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
          title: 'Courses',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? "bicycle" : "bicycle-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
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
      </Tabs>
    </DeliveryProtectedRoute>
  );
}