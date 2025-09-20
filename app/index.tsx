import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoadingScreen from '../src/components/common/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';

// Garder le splash screen natif affiché pendant qu'on charge
SplashScreen.preventAutoHideAsync();

export default function AppEntry() {
  const { user, userProfile, loading, isEmailVerified } = useAuth();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  // Cacher le splash natif immédiatement et afficher le nôtre
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  // Timer pour notre splash custom - durée fixe
  useEffect(() => {
    console.log('Custom splash starting - will show for 6 seconds');

    const timer = setTimeout(() => {
      console.log('Custom splash timer completed - hiding splash');
      setShowCustomSplash(false);
      // Attendre un peu après avoir caché le splash avant de naviguer
      setTimeout(() => {
        setReadyToNavigate(true);
      }, 500);
    }, 6000); // 6 secondes

    return () => clearTimeout(timer);
  }, []);

  // Rendu conditionnel
  if (showCustomSplash) {
    return (
      <View style={styles.container}>
        <LoadingScreen isVisible={true} />
      </View>
    );
  }

  // Attendre que tout soit prêt avant de naviguer
  if (!readyToNavigate || loading) {
    return (
      <View style={styles.container}>
        {/* Écran noir pendant la transition */}
      </View>
    );
  }

  // Attendre que le profil utilisateur soit chargé
  if (user && !userProfile) {
    console.log('🚀 DEBUGGING - Waiting for user profile to load...');
    return (
      <View style={styles.container}>
        {/* Attendre le chargement du profil */}
      </View>
    );
  }

  // Navigation finale
  if (!user) {
    return <Redirect href="/auth/login" />;
  }
  if (user && !isEmailVerified) {
    return <Redirect href="/auth/email-verification" />;
  }

  // Redirection basée sur le rôle de l'utilisateur
  console.log('🚀 DEBUGGING - App Entry Navigation:', {
    hasUser: !!user,
    emailVerified: isEmailVerified,
    userProfile: userProfile,
    userRole: userProfile?.role
  });

  if (userProfile?.role === 'admin') {
    console.log('🚀 Redirecting admin to admin dashboard');
    return <Redirect href="/(admin)/dashboard" />;
  } else if (userProfile?.role === 'delivery') {
    console.log('🚀 Redirecting delivery user to delivery login for proper auth');
    return <Redirect href="/auth/delivery-login" />;
  } else {
    console.log('🚀 Redirecting customer to main app');
    return <Redirect href="/(tabs)" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});