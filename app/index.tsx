import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import LoadingScreen from '../src/components/common/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';

// Garder le splash screen natif affiché pendant qu'on charge
SplashScreen.preventAutoHideAsync();

export default function AppEntry() {
  const { user, userProfile, loading, isEmailVerified, isGuest } = useAuth();
  const {
    user: adminUser,
    userProfile: adminProfile,
    loading: adminLoading,
    isAdmin
  } = useAdminAuth();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [readyToNavigate, setReadyToNavigate] = useState(false);
  const [forceNavigation, setForceNavigation] = useState(false);

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

  // Timer de sécurité - forcer la navigation si Firebase prend trop de temps
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.log('🚨 Safety timer triggered - forcing navigation to avoid infinite loading');
      setForceNavigation(true);
    }, 12000); // 12 secondes max

    return () => clearTimeout(safetyTimer);
  }, []);

  // Rendu conditionnel
  if (showCustomSplash) {
    return (
      <View style={styles.container}>
        <LoadingScreen isVisible={true} />
      </View>
    );
  }

  // Attendre que tout soit prêt avant de naviguer - timeout de sécurité pour déboguer
  if (!readyToNavigate) {
    return (
      <View style={styles.container}>
        {/* Écran noir pendant la transition */}
      </View>
    );
  }

  // Déterminer l'état de chargement global
  const isLoading = loading || adminLoading;

  // Timeout de sécurité - si Firebase met trop de temps, rediriger
  if (isLoading && !forceNavigation) {
    // Attendre un peu plus si on a un utilisateur mais pas encore de profil
    const hasUser = user || adminUser;
    if (hasUser && !forceNavigation) {
      console.log('🚀 DEBUGGING - User found, waiting for profile...');
      return (
        <View style={styles.container}>
          {/* Attendre le chargement du profil */}
        </View>
      );
    }

    console.log('🚨 Firebase loading too long - forcing navigation');
    return <Redirect href="/(tabs)" />;
  }

  // Forcer la navigation si le timer de sécurité a été déclenché
  if (forceNavigation) {
    console.log('🚨 Force navigation activated - going to main app');
    return <Redirect href="/(tabs)" />;
  }

  // PRIORITÉ 1: Vérifier si c'est un admin connecté
  if (adminUser && adminProfile && isAdmin) {
    console.log('🚀 DEBUGGING - Admin detected:', {
      adminUser: !!adminUser,
      adminProfile: !!adminProfile,
      isAdmin,
      adminEmail: adminUser?.email
    });
    console.log('🚀 Redirecting admin to admin dashboard');
    return <Redirect href="/(admin)/dashboard" />;
  }

  // PRIORITÉ 2: Gestion des utilisateurs normaux
  const currentUser = user || adminUser;
  const currentProfile = userProfile || adminProfile;

  // Navigation finale
  if (!currentUser) {
    // Mode invité : accès à l'app sans compte, les actions nécessitant un
    // profil redirigeront vers la création de compte
    if (isGuest) {
      console.log('🚀 Guest mode active - redirecting to main app');
      return <Redirect href="/(tabs)" />;
    }
    console.log('🚀 No user found - redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  if (currentUser && !isEmailVerified && !isAdmin) {
    console.log('🚀 User not verified - redirecting to verification');
    return <Redirect href="/auth/email-verification" />;
  }

  // Attendre le profil si on a un utilisateur mais pas de profil
  if (currentUser && !currentProfile && !isLoading) {
    console.log('🚀 DEBUGGING - Waiting for user profile to load...');
    return (
      <View style={styles.container}>
        {/* Attendre le chargement du profil */}
      </View>
    );
  }

  // Redirection basée sur le rôle de l'utilisateur
  console.log('🚀 DEBUGGING - App Entry Navigation:', {
    hasUser: !!currentUser,
    emailVerified: isEmailVerified,
    userProfile: currentProfile,
    userRole: currentProfile?.role,
    isAdmin
  });

  if (currentProfile?.role === 'delivery') {
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