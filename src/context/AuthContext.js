import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { UserRole } from '../types';
import * as Haptics from 'expo-haptics';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      setUser(user);

      if (user) {
        try {
          // Récupérer le profil utilisateur depuis Firestore
          console.log('Fetching user profile for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            console.log('User profile found');
            const userData = userDoc.data();
            setUserProfile(userData);

            // Redirection basée sur le rôle
            if (userData.role === 'admin') {
              console.log('Redirecting admin to admin interface');
              router.replace('/(admin)/dashboard');
              setLoading(false);
              return;
            } else if (userData.role === 'delivery') {
              console.log('Delivery user detected - letting DeliveryAuthContext handle redirection');
              // Ne pas rediriger automatiquement - laisser DeliveryAuthContext gérer
              setLoading(false);
              return;
            }
          } else {
            console.log('No user profile found, checking if this might be a delivery user...');

            // Vérifier s'il s'agit d'un livreur en attente d'activation
            // Chercher dans les profils en attente par email
            const emailDocId = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
            const pendingDoc = await getDoc(doc(db, 'users', emailDocId));

            if (pendingDoc.exists() && pendingDoc.data().accountStatus === 'pending_activation') {
              console.log('⚠️ Found pending delivery user - should not create default profile');
              console.log('📋 Pending profile data:', pendingDoc.data());

              // Ne pas créer de profil par défaut, laisser le système de livreur gérer cela
              setUserProfile(null);
              return;
            }

            console.log('Creating default customer profile');
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              firstName: user.displayName ? user.displayName.split(' ')[0] : 'Utilisateur',
              lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
              name: user.displayName || 'Utilisateur',
              role: 'customer',
              phone: '',
              emailVerified: user.emailVerified,
              loyaltyPoints: 0,
              favoriteItems: [],
              deliveryAddresses: [],
              createdAt: new Date().toISOString()
            };

            // Créer le document utilisateur
            try {
              await setDoc(doc(db, 'users', user.uid), defaultProfile);
              console.log('Default customer profile created successfully');
              setUserProfile(defaultProfile);
            } catch (createError) {
              console.error('Error creating user profile:', createError);
              // Utiliser le profil par défaut même en cas d'erreur de création
              setUserProfile(defaultProfile);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // En cas d'erreur Firestore, créer un profil temporaire pour les clients
          const fallbackProfile = {
            uid: user.uid,
            email: user.email,
            firstName: user.displayName ? user.displayName.split(' ')[0] : 'Utilisateur',
            lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
            name: user.displayName || 'Utilisateur',
            role: 'customer',
            phone: '',
            emailVerified: user.emailVerified,
            loyaltyPoints: 0,
            favoriteItems: [],
            deliveryAddresses: []
          };
          console.log('Using fallback profile for customer');
          setUserProfile(fallbackProfile);
        }
      } else {
        console.log('No user - clearing profile');
        setUserProfile(null);
      }

      console.log('Auth state processing complete - setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return { success: true, user: result.user };
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Mettre à jour le profil
      await updateProfile(user, {
        displayName: userData.name
      });

      // Créer le document utilisateur dans Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        role: userData.role || UserRole.CUSTOMER,
        phone: userData.phone || '',
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0,
        favoriteItems: [],
        deliveryAddresses: [],
        emailVerified: false
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);

      // Envoyer l'email de vérification
      await sendEmailVerification(user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return { success: true, user, emailSent: true };
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (user) {
        const updatedProfile = { ...userProfile, ...updates };
        await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
        setUserProfile(updatedProfile);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Renvoyer l'email de vérification
  const resendEmailVerification = async () => {
    try {
      if (user) {
        await sendEmailVerification(user);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return { success: true };
      }
      return { success: false, error: 'Aucun utilisateur connecté' };
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { success: true };
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  // Recharger l'utilisateur pour vérifier l'email
  const reloadUser = async () => {
    try {
      if (user) {
        await reload(user);
        // Mettre à jour le profil Firestore avec le statut de vérification
        if (user.emailVerified && userProfile && !userProfile.emailVerified) {
          await updateUserProfile({ emailVerified: true });
        }
        return { success: true, emailVerified: user.emailVerified };
      }
      return { success: false, error: 'Aucun utilisateur connecté' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    resendEmailVerification,
    resetPassword,
    reloadUser,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    isCustomer: userProfile?.role === UserRole.CUSTOMER,
    isRestaurantAdmin: userProfile?.role === UserRole.RESTAURANT_ADMIN,
    isDelivery: userProfile?.role === UserRole.DELIVERY
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};