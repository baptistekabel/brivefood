import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeliveryAuthContext = createContext();

export const useDeliveryAuth = () => {
  const context = useContext(DeliveryAuthContext);
  if (!context) {
    throw new Error('useDeliveryAuth must be used within a DeliveryAuthProvider');
  }
  return context;
};

export const DeliveryAuthProvider = ({ children }) => {
  const [currentDeliveryUser, setCurrentDeliveryUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Vérifier le statut d'authentification au démarrage
  const checkAuthStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@currentDeliveryUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentDeliveryUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur vérification auth livreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connexion livreur
  const login = async (deliveryUser) => {
    try {
      setCurrentDeliveryUser(deliveryUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('@currentDeliveryUser', JSON.stringify(deliveryUser));
      
      // Enregistrer la dernière connexion
      const loginTime = new Date().toISOString();
      await AsyncStorage.setItem('@lastDeliveryLogin', loginTime);
      
      console.log(`👤 Livreur connecté: ${deliveryUser.name}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur connexion livreur:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  // Déconnexion livreur
  const logout = async () => {
    try {
      setCurrentDeliveryUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('@currentDeliveryUser');
      await AsyncStorage.removeItem('@lastDeliveryLogin');
      
      console.log('👤 Livreur déconnecté');
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion livreur:', error);
      return { success: false, error: 'Erreur de déconnexion' };
    }
  };

  // Mettre à jour les informations du livreur connecté
  const updateCurrentUser = async (updatedData) => {
    try {
      if (!currentDeliveryUser) return { success: false, error: 'Aucun utilisateur connecté' };
      
      const updatedUser = { ...currentDeliveryUser, ...updatedData };
      setCurrentDeliveryUser(updatedUser);
      await AsyncStorage.setItem('@currentDeliveryUser', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      return { success: false, error: 'Erreur de mise à jour' };
    }
  };

  // Obtenir les statistiques du livreur connecté
  const getCurrentUserStats = async () => {
    try {
      if (!currentDeliveryUser) return null;
      
      const statsKey = `@deliveryStats_${currentDeliveryUser.id}`;
      const storedStats = await AsyncStorage.getItem(statsKey);
      
      if (storedStats) {
        return JSON.parse(storedStats);
      }
      
      // Statistiques par défaut
      return {
        totalDeliveries: 0,
        todayDeliveries: 0,
        weekDeliveries: 0,
        totalEarnings: 0,
        avgDeliveryTime: 0,
        lastDelivery: null,
      };
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return null;
    }
  };

  // Mettre à jour les statistiques du livreur
  const updateUserStats = async (newStats) => {
    try {
      if (!currentDeliveryUser) return { success: false, error: 'Aucun utilisateur connecté' };
      
      const statsKey = `@deliveryStats_${currentDeliveryUser.id}`;
      await AsyncStorage.setItem(statsKey, JSON.stringify(newStats));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
      return { success: false, error: 'Erreur de mise à jour des statistiques' };
    }
  };

  const value = {
    currentDeliveryUser,
    isAuthenticated,
    loading,
    login,
    logout,
    updateCurrentUser,
    getCurrentUserStats,
    updateUserStats,
    checkAuthStatus,
  };

  return (
    <DeliveryAuthContext.Provider value={value}>
      {children}
    </DeliveryAuthContext.Provider>
  );
};