import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Admin auth state changed:', user ? 'Admin logged in' : 'Admin logged out');
      setUser(user);

      if (user) {
        try {
          // Vérifier d'abord si c'est un admin autorisé (bypass)
          const adminEmails = ['admin@brivefood.com', 'kabelbaptiste971@gmail.com', 'brivefood@gmail.com'];
          if (adminEmails.includes(user.email)) {
            console.log('Admin autorisé détecté:', user.email);
            const adminProfile = {
              role: 'admin',
              email: user.email,
              name: user.email === 'kabelbaptiste971@gmail.com' ? 'Baptiste Kabel' : user.email === 'brivefood@gmail.com' ? 'BriveFood' : 'Administrateur BriveFood',
              uid: user.uid,
              emailVerified: true // Admin n'a pas besoin de vérifier son email
            };
            setUserProfile(adminProfile);
            setLoading(false);
            return;
          }

          // Récupérer le profil utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Admin profile loaded:', userData);

            // Vérifier si c'est un admin ou livreur
            if (userData.role === 'admin' || userData.role === 'delivery') {
              setUserProfile(userData);
            } else {
              console.log('User is not admin or delivery, ignoring in AdminAuthContext');
              setUserProfile(null);
              // Ne pas déconnecter - laisser l'AuthContext client gérer
            }
          } else {
            console.log('No admin profile found');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, requestedType) => {
    try {
      console.log('Attempting admin login:', { email, requestedType });

      // Se connecter avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Vérifier si c'est un admin autorisé (bypass)
      const adminEmails = ['admin@brivefood.com', 'kabelbaptiste971@gmail.com', 'brivefood@gmail.com'];
      if (adminEmails.includes(email) && requestedType === 'admin') {
        console.log('Admin autorisé connecté:', email);
        // Le profil sera défini automatiquement par onAuthStateChanged
        return { success: true, type: 'admin' };
      }

      // Récupérer le profil utilisateur pour les autres cas
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Login successful, user role:', userData.role);

        // Vérifier si le rôle correspond au type demandé
        if (userData.role === requestedType) {
          return { success: true, type: userData.role };
        } else {
          console.log('Role mismatch:', userData.role, 'vs', requestedType);
          await signOut(auth);
          return { success: false, error: 'role_mismatch' };
        }
      } else {
        console.log('No user profile found');
        await signOut(auth);
        return { success: false, error: 'no_profile' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.code || 'login_failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'logout_failed' };
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user && !!userProfile,
    userType: userProfile?.role || null,
    loading,
    login,
    logout,
    isAdmin: userProfile?.role === 'admin',
    isDelivery: userProfile?.role === 'delivery',
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};