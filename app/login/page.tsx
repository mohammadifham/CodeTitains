'use client';

import { FormEvent, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

const getReadableAuthError = (error: unknown) => {
  const code = (error as { code?: string })?.code || '';
  const message = (error as { message?: string })?.message || '';

  if (code === 'auth/unauthorized-domain') return 'This domain is not authorized in Firebase. Add localhost to Firebase Authentication -> Settings -> Authorized domains.';
  if (code === 'auth/operation-not-allowed') return 'Google Sign-In is disabled in Firebase. Enable it under Authentication -> Sign-in method.';
  if (code === 'auth/configuration-not-found') return 'Firebase auth configuration is missing. In Firebase Console, open Authentication, click Get started, and enable Google under Sign-in method.';
  if (code === 'auth/popup-closed-by-user') return 'The sign-in popup was closed before completing login. Please try again.';
  if (code === 'auth/popup-blocked') return 'Your browser blocked the popup. We switched to redirect sign-in. Please continue the Google flow.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') return 'Invalid email or password.';
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Please log in instead.';
  if (code === 'auth/weak-password') return 'Password is too weak. Use at least 6 characters.';
  if (code) return `Authentication failed (${code}). Check Firebase Auth settings and try again.`;
  if (message) return `Sign-in failed: ${message}`;
  
  return 'Google sign-in failed. Please try again.';
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useAuth();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');

  const redirectTarget = searchParams.get('redirect');
  const safeRedirect = redirectTarget?.startsWith('/') ? redirectTarget : null;
  const forceAuth = searchParams.get('forceAuth') === '1';
  const authIntentKey = 'disasterhub_auth_redirect';
  const authIntentRoleKey = 'disasterhub_auth_role_intent';

  const getStoredRole = (uid: string): 'admin' | 'user' => {
    if (typeof window === 'undefined') return 'user';
    const role = localStorage.getItem(`disasterhub_user_role_${uid}`);
    return role === 'admin' ? 'admin' : 'user';
  };

  const getRoleRoute = (role: 'admin' | 'user') => (role === 'admin' ? '/dashboard' : '/user');

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === 'signup') {
      return fullName.trim().length >= 2 && password.length >= 6 && password === confirmPassword;
    }
    return true;
  }, [confirmPassword, email, fullName, mode, password]);

  useEffect(() => {
    if (!loading && user) {
      const pendingRedirect = sessionStorage.getItem(authIntentKey);
      const pendingRole = sessionStorage.getItem(authIntentRoleKey);
      const effectiveRole: 'admin' | 'user' = pendingRole
        ? pendingRole === 'admin'
          ? 'admin'
          : 'user'
        : getStoredRole(user.uid);

      if (pendingRole) {
        localStorage.setItem(`disasterhub_user_role_${user.uid}`, effectiveRole);
        sessionStorage.removeItem(authIntentRoleKey);
      }

      if (pendingRedirect) {
        sessionStorage.removeItem(authIntentKey);

        if (effectiveRole === 'user' && pendingRedirect.startsWith('/dashboard')) {
          router.replace('/user');
          return;
        }

        router.replace(pendingRedirect);
        return;
      }

      if (!forceAuth) {
        const targetRoute = safeRedirect ?? getRoleRoute(effectiveRole);
        router.replace(effectiveRole === 'user' && targetRoute.startsWith('/dashboard') ? '/user' : targetRoute);
      }
    }
  }, [forceAuth, loading, router, safeRedirect, user]);

  const setAuthIntent = (role?: 'admin' | 'user') => {
    if (safeRedirect) {
      sessionStorage.setItem(authIntentKey, safeRedirect);
    }

    if (role) {
      sessionStorage.setItem(authIntentRoleKey, role);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        setAuthIntent(selectedRole);
        await signUpWithEmailPassword(email.trim(), password, fullName, selectedRole);
      } else {
        setAuthIntent();
        await signInWithEmailPassword(email.trim(), password);
      }
    } catch (err) {
      setError(getReadableAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSubmitting(true);

    try {
      setAuthIntent(mode === 'signup' ? selectedRole : undefined);
      await signInWithGoogle();
    } catch (err) {
      setError(getReadableAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.05)_0%,transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[500px] z-10"
      >
        <div className="mb-12 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-base text-slate-400">
            {mode === 'signup' ? 'Enter your details to register.' : 'Sign in to access the command center.'}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 shadow-2xl">
          <div className="flex bg-white/5 rounded-2xl p-1.5 mb-10">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl py-3 text-base font-medium transition-all ${
                mode === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl py-3 text-base font-medium transition-all ${
                mode === 'signup' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div
                  key="fullname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-base text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="Jane Doe"
                    required
                  />
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  <label className="text-sm font-medium text-slate-300 ml-1">Account Type</label>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('user')}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        selectedRole === 'user'
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        selectedRole === 'admin'
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </motion.div>
              )}

              <motion.div layout key="email" className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-base text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </motion.div>

              <motion.div layout key="password" className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  {mode === 'login' && <span className="text-sm text-cyan-400 cursor-pointer hover:underline">Forgot?</span>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-base text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </motion.div>

              {mode === 'signup' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-base text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              layout
              type="submit"
              disabled={loading || submitting || !canSubmit}
              className="w-full rounded-2xl bg-white text-slate-950 px-5 py-4 text-base font-semibold hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all mt-6"
            >
              {submitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900 px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || submitting}
            className="mt-8 w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          {error && (
            <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-cyan-400">Loading authentication...</div>}>
      <LoginContent />
    </Suspense>
  );
}
