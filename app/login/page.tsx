'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const getReadableAuthError = (error: unknown) => {
  const code = (error as { code?: string })?.code || '';
  const message = (error as { message?: string })?.message || '';

  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase. Add localhost to Firebase Authentication -> Settings -> Authorized domains.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google Sign-In is disabled in Firebase. Enable it under Authentication -> Sign-in method.';
  }

  if (code === 'auth/configuration-not-found') {
    return 'Firebase auth configuration is missing. In Firebase Console, open Authentication, click Get started, and enable Google under Sign-in method.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The sign-in popup was closed before completing login. Please try again.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the popup. We switched to redirect sign-in. Please continue the Google flow.';
  }

  if (code) {
    return `Sign-in failed (${code}). Check Firebase Auth configuration and try again.`;
  }

  if (message) {
    return `Sign-in failed: ${message}`;
  }

  return 'Google sign-in failed. Please try again.';
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, router, user]);

  const handleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getReadableAuthError(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-8 text-center backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-cyan-100">Command Center Login</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in to access the emergency operations dashboard.</p>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Checking session...' : 'Continue with Google'}
        </button>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
