import { createContext, useContext, useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase';

const C = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('================================');
      console.log('AUTH STATE CHANGED');
      console.log('================================');

      try {
        setUser(currentUser);

        // No user is logged in
        if (!currentUser) {
          console.log('No authenticated user.');

          setProfile(null);
          setLoading(false);

          return;
        }

        console.log('AUTH UID:', currentUser.uid);
        console.log('AUTH EMAIL:', currentUser.email);
        console.log('AUTH DISPLAY NAME:', currentUser.displayName);

        // Get the Firestore user document
        const userRef = doc(db, 'users', currentUser.uid);

        console.log(
          'Reading Firestore document:',
          `users/${currentUser.uid}`
        );

        const snapshot = await getDoc(userRef);

        console.log(
          'FIRESTORE USER EXISTS:',
          snapshot.exists()
        );

        // Firestore profile exists
        if (snapshot.exists()) {
          const userProfile = snapshot.data();

          console.log('FIRESTORE PROFILE:', userProfile);
          console.log('FIRESTORE ROLE:', userProfile.role);

          // Store profile in React state
          setProfile(userProfile);

          console.log(
            'PROFILE STATE SET TO:',
            userProfile
          );
        } else {
          console.error(
            '❌ FIRESTORE USER DOCUMENT DOES NOT EXIST'
          );

          console.error(
            'Expected document:',
            `users/${currentUser.uid}`
          );

          setProfile(null);
        }
      } catch (error) {
        console.error(
          '❌ FIRESTORE PROFILE LOAD FAILED'
        );

        console.error(
          'ERROR CODE:',
          error.code
        );

        console.error(
          'ERROR MESSAGE:',
          error.message
        );

        console.error(
          'FULL FIREBASE ERROR:',
          error
        );

        setProfile(null);
      } finally {
        setLoading(false);

        console.log(
          'AUTH LOADING FINISHED'
        );

        console.log('================================');
      }
    });

    // Cleanup Firebase listener
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Register a new customer
   */
  const register = async (name, email, password) => {
    try {
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Update Firebase Authentication profile
      await updateProfile(credential.user, {
        displayName: name,
      });

      // Create Firestore user profile
      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          uid: credential.user.uid,
          name: name,
          email: email,
          role: 'customer',
          createdAt: serverTimestamp(),
        }
      );

      console.log(
        'New customer profile created:',
        credential.user.uid
      );

      return credential.user;
    } catch (error) {
      console.error(
        'Registration failed:',
        error
      );

      throw error;
    }
  };

  /**
   * Login
   */
  const login = async (email, password) => {
    try {
      console.log(
        'Attempting login for:',
        email
      );

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      console.log(
        'Login successful:',
        credential.user.uid
      );

      return credential.user;
    } catch (error) {
      console.error(
        'Login failed:',
        error
      );

      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(auth, provider);
    const userRef = doc(db, 'users', credential.user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: credential.user.uid,
        name: credential.user.displayName || '',
        email: credential.user.email || '',
        photoURL: credential.user.photoURL || '',
        role: 'customer',
        createdAt: serverTimestamp(),
      });
    }

    return credential.user;
  };

  const resetPassword = async (email) => {
    if (!email?.trim()) throw new Error('Enter your email address first.');
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateCustomerProfile = async (updates) => {
    if (!user) throw new Error('You must be signed in.');
    const safeUpdates = {
      name: updates.name?.trim() || '',
      phone: updates.phone?.trim() || '',
      photoURL: updates.photoURL || user.photoURL || '',
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, 'users', user.uid), safeUpdates);
    await updateProfile(user, {
      displayName: safeUpdates.name || user.displayName || '',
      photoURL: safeUpdates.photoURL || user.photoURL || '',
    });
    setProfile((current) => ({ ...(current || {}), ...safeUpdates }));
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);

      console.log(
        'User logged out successfully.'
      );
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      );

      throw error;
    }
  };

  return (
    <C.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        loginWithGoogle,
        resetPassword,
        updateCustomerProfile,
        logout,
      }}
    >
      {children}
    </C.Provider>
  );
}

export const useAuth = () => {
  return useContext(C);q
};