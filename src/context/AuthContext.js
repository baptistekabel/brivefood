import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../../config/firebase';
import { UserRole } from '../types';
import * as Haptics from 'expo-haptics';
import { registerCustomerForBroadcast, removeCustomerFromBroadcast } from '../services/broadcastNotificationService';
import { getExpoProjectId } from '../utils/pushProject';

const AuthContext = createContext({});

// Clé de persistance du mode invité (survit au redémarrage de l'app)
const GUEST_MODE_KEY = '@guestMode';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Fonction pour demander les permissions de notifications
const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      Alert.alert(
        '🔔 Notifications activées',
        'Vous recevrez des notifications pour vos commandes, promotions et nouveautés !',
        [{ text: 'Parfait !', style: 'default' }]
      );
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
};

// Fonction pour enregistrer le token client pour les notifications broadcast
const registerCustomerPushToken = async (userId, userProfile) => {
  try {
    // Vérifier si l'utilisateur est bien un client
    if (!userProfile || userProfile.role !== 'customer') {
      console.log('📱 Pas un client - pas d\'enregistrement pour broadcast');
      return;
    }

    // Vérifier les permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('📱 Permissions notifications non accordées');
      return;
    }

    // Obtenir le token push
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: getExpoProjectId(),
    });

    if (tokenData?.data) {
      // Enregistrer le token dans Firebase pour les broadcasts
      await registerCustomerForBroadcast(userId, tokenData.data, {
        name: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        email: userProfile.email,
        phone: userProfile.phone,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      });
      console.log('✅ Token client enregistré pour les notifications broadcast');
    }
  } catch (error) {
    console.log('⚠️ Erreur enregistrement token broadcast:', error.message);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Restaurer le mode invité choisi lors d'une session précédente
  useEffect(() => {
    AsyncStorage.getItem(GUEST_MODE_KEY)
      .then(value => {
        if (value === 'true') {
          setIsGuest(true);
        }
      })
      .catch(error => console.log('Erreur lecture mode invité:', error));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      setUser(user);

      if (user) {
        // Un utilisateur connecté n'est plus un invité
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_MODE_KEY).catch(error =>
          console.log('Erreur suppression mode invité:', error)
        );

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
              console.log('Admin user detected - letting AdminAuthContext handle redirection');
              // Ne pas rediriger automatiquement - laisser AdminAuthContext gérer
              setLoading(false);
              return;
            } else if (userData.role === 'delivery') {
              console.log('Delivery user detected - letting DeliveryAuthContext handle redirection');
              // Ne pas rediriger automatiquement - laisser DeliveryAuthContext gérer
              setLoading(false);
              return;
            } else if (userData.role === 'customer') {
              // Enregistrer le token pour les notifications broadcast
              registerCustomerPushToken(user.uid, userData);
            }
          } else {
            console.log('No user profile found, checking if this might be a delivery user...');

            // Vérifier si c'est un admin autorisé - ne pas créer de profil client
            const adminEmails = ['admin@brivefood.com', 'kabelbaptiste971@gmail.com'];
            if (adminEmails.includes(user.email)) {
              console.log('Admin email detected - deferring to AdminAuthContext');
              setUserProfile(null);
              setLoading(false);
              return;
            }

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

              // Demander les permissions de notifications pour les nouveaux utilisateurs
              setTimeout(async () => {
                const granted = await requestNotificationPermissions();
                if (granted) {
                  // Enregistrer le token pour les notifications broadcast
                  registerCustomerPushToken(user.uid, defaultProfile);
                }
              }, 1000);
            } catch (createError) {
              console.error('Error creating user profile:', createError);
              // Utiliser le profil par défaut même en cas d'erreur de création
              setUserProfile(defaultProfile);

              // Demander les permissions même en cas d'erreur de création du profil
              setTimeout(async () => {
                const granted = await requestNotificationPermissions();
                if (granted) {
                  registerCustomerPushToken(user.uid, defaultProfile);
                }
              }, 1000);
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

  // Un compte bloqué par l'admin est déconnecté immédiatement, même si la session
  // était déjà ouverte au moment du blocage
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (!snapshot.exists()) return;

        if (snapshot.data().blocked === true) {
          console.log('🚫 Compte bloqué par l\'administrateur, déconnexion forcée');
          signOut(auth).catch(error =>
            console.error('Erreur déconnexion forcée:', error)
          );
          Alert.alert(
            'Compte bloqué',
            'Votre accès à l\'application a été suspendu. Contactez le restaurant pour plus d\'informations.'
          );
        }
      },
      (error) => console.error('Erreur écoute statut du compte:', error)
    );

    return unsubscribe;
  }, [user?.uid]);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Vérifier que le compte n'a pas été bloqué par l'administrateur
      const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (profileDoc.exists() && profileDoc.data().blocked === true) {
        await signOut(auth);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return {
          success: false,
          blocked: true,
          error: 'Votre accès à l\'application a été suspendu. Contactez le restaurant.',
        };
      }

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

      // Demander les permissions de notifications pour les nouveaux inscrits
      setTimeout(async () => {
        const granted = await requestNotificationPermissions();
        if (granted && userProfile.role === UserRole.CUSTOMER) {
          // Enregistrer le token pour les notifications broadcast
          registerCustomerPushToken(user.uid, userProfile);
        }
      }, 1500);

      return { success: true, user, emailSent: true };
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, error: error.message };
    }
  };

  // Continuer sans compte : l'utilisateur peut parcourir le menu, mais les
  // actions nécessitant un profil (commander, fidélité, etc.) le redirigent
  // vers la création de compte
  const continueAsGuest = async () => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsGuest(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const exitGuestMode = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Supprimer le token du broadcast si c'est un client
      if (user && userProfile?.role === 'customer') {
        await removeCustomerFromBroadcast(user.uid);
        console.log('🗑️ Token client supprimé du broadcast');
      }

      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // On n'écrit QUE les champs modifiés : `merge: true` s'occupe de préserver le
  // reste. Réécrire `{ ...userProfile, ...updates }` renvoyait tout le profil
  // tel qu'il était au dernier rendu — deux mises à jour enchaînées dans la même
  // frame (confirmation de plusieurs récompenses de fidélité) et la seconde
  // écrasait la première avec des données périmées.
  const updateUserProfile = async (updates) => {
    try {
      if (!user) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      setUserProfile(prev => ({ ...(prev || {}), ...updates }));
      return { success: true };
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

  // Supprimer le compte utilisateur
  const deleteUserAccount = async (password) => {
    try {
      if (!user) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      // Ré-authentifier l'utilisateur avant la suppression (requis par Firebase)
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Supprimer le token du broadcast si c'est un client
      if (userProfile?.role === 'customer') {
        try {
          await removeCustomerFromBroadcast(user.uid);
          console.log('🗑️ Token client supprimé du broadcast');
        } catch (broadcastError) {
          console.log('⚠️ Erreur suppression token broadcast:', broadcastError.message);
        }
      }

      // Supprimer le document utilisateur dans Firestore
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        console.log('🗑️ Document utilisateur supprimé de Firestore');
      } catch (firestoreError) {
        console.log('⚠️ Erreur suppression document Firestore:', firestoreError.message);
      }

      // Supprimer le compte Firebase Auth
      await deleteUser(user);
      console.log('🗑️ Compte Firebase Auth supprimé');

      // Nettoyer l'état local
      setUser(null);
      setUserProfile(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Messages d'erreur personnalisés
      let errorMessage = error.message;
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Veuillez vous reconnecter pour effectuer cette action.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    isGuest,
    continueAsGuest,
    exitGuestMode,
    updateUserProfile,
    resendEmailVerification,
    resetPassword,
    reloadUser,
    deleteUserAccount,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    isCustomer: userProfile?.role === UserRole.CUSTOMER,
    isRestaurantAdmin: userProfile?.role === UserRole.RESTAURANT_ADMIN,
    isDelivery: userProfile?.role === UserRole.DELIVERY
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};