'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (
    email: string,
    password: string,
    fullName?: string,
    role?: 'admin' | 'user',
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string })?.code || '';

      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return;
      }

      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmailPassword = async (
    email: string,
    password: string,
    fullName?: string,
    role: 'admin' | 'user' = 'user',
  ) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (fullName?.trim()) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`disasterhub_user_role_${credential.user.uid}`, role);
    }
  };

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
