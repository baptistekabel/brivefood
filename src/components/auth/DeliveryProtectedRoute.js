import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { router } from 'expo-router';
import LoadingScreen from '../common/LoadingScreen';
import { colors, typography, spacing } from '../../constants/theme';

export default function DeliveryProtectedRoute({ children, requiredType = 'delivery' }) {
  const { user, userProfile, loading } = useAuth();
  const { currentDeliveryUser, isAuthenticated: isDeliveryAuthenticated, loading: deliveryLoading } = useDeliveryAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log('🔐 DeliveryProtectedRoute - Checking authorization...', {
      hasUser: !!user,
      hasProfile: !!userProfile,
      userRole: userProfile?.role,
      hasDeliveryUser: !!currentDeliveryUser,
      isDeliveryAuthenticated,
      requiredType,
      loading,
      deliveryLoading
    });

    if (loading || deliveryLoading) {
      return; // Still loading, don't make decisions yet
    }

    // Vérifier d'abord l'authentification de livreur spécialisée
    if (isDeliveryAuthenticated && currentDeliveryUser) {
      console.log('✅ User authorized via DeliveryAuth');
      setIsAuthorized(true);
      return;
    }

    // Ensuite vérifier l'authentification Firebase standard
    if (!user || !userProfile) {
      console.log('❌ No Firebase user or profile, redirecting to delivery login');
      router.replace('/auth/delivery-login');
      return;
    }

    // Vérifier le rôle de l'utilisateur
    if (userProfile.role === requiredType) {
      console.log('⚠️ User has delivery role in Firebase but not in DeliveryAuth - redirect to login');
      router.replace('/auth/delivery-login');
    } else {
      console.log('❌ User not authorized for delivery interface, role:', userProfile.role);

      // Rediriger selon le rôle
      if (userProfile.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (userProfile.role === 'customer') {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/delivery-login');
      }
    }
  }, [user, userProfile, loading, currentDeliveryUser, isDeliveryAuthenticated, deliveryLoading, requiredType]);

  if (loading || deliveryLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthorized) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>
          Vérification des autorisations...
        </Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.xl,
  },
  unauthorizedText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
});