import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import LoadingScreen from '../common/LoadingScreen';

export default function AdminProtectedRoute({ children, requiredType = 'admin' }) {
  const { isAuthenticated, userType, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || userType !== requiredType) {
        console.log('AdminProtectedRoute redirect:', { isAuthenticated, userType, requiredType });
        // Rediriger vers la page de connexion appropriée
        if (requiredType === 'admin') {
          router.replace('/auth/admin-login');
        } else if (requiredType === 'delivery') {
          router.replace('/auth/delivery-login');
        }
      }
    }
  }, [isAuthenticated, userType, loading, requiredType]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || userType !== requiredType) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});