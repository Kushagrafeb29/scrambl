import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function googleLogin() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Permanently deletes the signed-in user: Firestore profile/scores first, then the auth account.
  // Email users must re-enter their password if their sign-in is old (Firebase requires recent login).
  async function deleteAccount(password) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    if (password && user.email) {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    }
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
  }

  function verifyEmail() {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    googleLogin,
    verifyEmail,
    deleteAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
