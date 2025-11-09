import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import Group11 from '../imports/Group11';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const { theme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        showToast('warning', 'Supabase is not configured. Please add your credentials to .env file.');
        return;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      showToast('error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('warning', 'Please fill in all fields');
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      showToast('warning', 'Supabase is not configured. Please add your credentials to .env file.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      showToast('success', 'Welcome back!');
      onAuthSuccess();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      showToast('warning', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showToast('warning', 'Password must be at least 6 characters');
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      showToast('warning', 'Supabase is not configured. Please add your credentials to .env file.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      showToast('success', 'Account created! Please check your email to verify.');
      setMode('signin');
      setPassword('');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 mx-auto mb-6">
          <Group11 />
        </div>
        <h1 
          className="mb-3"
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 'var(--font-weight-bold)',
            letterSpacing: '0.5px',
          }}
        >
          KIMI
        </h1>
        <p 
          className="text-muted-foreground"
          style={{
            fontSize: 'var(--text-base)',
            opacity: 0.7,
          }}
        >
          Care & monitoring for your loved ones
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-md)] overflow-hidden"
      >
        {/* Tab Switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('signin')}
            className="flex-1 py-4 relative transition-colors text-center"
            style={{
              color: mode === 'signin' ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            Sign In
            {mode === 'signin' && (
              <motion.div
                layoutId="authTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            )}
          </button>
          <button
            onClick={() => setMode('signup')}
            className="flex-1 py-4 relative transition-colors text-center"
            style={{
              color: mode === 'signup' ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            Sign Up
            {mode === 'signup' && (
              <motion.div
                layoutId="authTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {mode === 'signin' ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSignIn}
                className="space-y-4"
              >
                {/* Email Input */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--text-label)',
                      color: 'var(--muted-foreground)',
                      opacity: 0.8,
                    }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--background)',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--text-label)',
                      color: 'var(--muted-foreground)',
                      opacity: 0.8,
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-11 pr-12 py-3 border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--background)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[var(--radius-button)] text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative mt-3 mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span 
                      className="px-4 text-muted-foreground bg-card"
                      style={{
                        fontSize: 'var(--text-caption)',
                      }}
                    >
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 rounded-[var(--radius-button)] border border-border hover:bg-secondary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: 'rgba(28, 28, 30, 1)',
                    color: 'rgba(255, 255, 255, 1)',
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Google</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailSignUp}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--text-label)',
                      color: 'var(--muted-foreground)',
                      opacity: 0.8,
                    }}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--background)',
                      }}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--text-label)',
                      color: 'var(--muted-foreground)',
                      opacity: 0.8,
                    }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--background)',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--text-label)',
                      color: 'var(--muted-foreground)',
                      opacity: 0.8,
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-11 pr-12 py-3 border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--background)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p 
                    className="mt-2 text-muted-foreground"
                    style={{
                      fontSize: 'var(--text-caption)',
                    }}
                  >
                    Minimum 6 characters
                  </p>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[var(--radius-button)] text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center text-muted-foreground"
        style={{
          fontSize: 'var(--text-caption)',
          opacity: 0.6,
        }}
      >
        By continuing, you agree to KIMI's Terms of Service and Privacy Policy
      </motion.p>
      </div>
    </>
  );
}