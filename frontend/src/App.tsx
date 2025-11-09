import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { ChatAssistant } from './components/ChatAssistant';
import { Health } from './components/Health';
import { Auth } from './components/Auth';
import { SupabaseSetupBanner } from './components/SupabaseSetupBanner';
import { useToast } from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'settings' | 'chat' | 'health'>('dashboard');
  const [previousScreen, setPreviousScreen] = useState<'dashboard' | 'chat' | 'health'>('dashboard');
  const { showToast, ToastComponent } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (screen: 'dashboard' | 'settings' | 'chat' | 'health') => {
    if (screen !== 'settings') {
      setPreviousScreen(activeScreen as 'dashboard' | 'chat' | 'health');
    }
    setActiveScreen(screen);
  };

  const handleBackFromSettings = () => {
    setActiveScreen(previousScreen);
  };
  
  const handleBackFromChat = () => {
    setActiveScreen(previousScreen);
  };

  const handleAuthSuccess = () => {
    showToast('success', 'Welcome to KIMI!');
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Not authenticated - show auth screen
  if (!session) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <SupabaseSetupBanner />
          {ToastComponent}
          <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
      </ThemeProvider>
    );
  }

  // Authenticated - show main app
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <SupabaseSetupBanner />
        {ToastComponent}
        <div className="mx-auto max-w-md h-screen flex flex-col">
          {activeScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activeScreen === 'health' && <Health onNavigate={handleNavigate} />}
          {activeScreen === 'settings' && <Settings onNavigate={handleNavigate} onBack={handleBackFromSettings} />}
          {activeScreen === 'chat' && <ChatAssistant onNavigate={handleNavigate} onBack={handleBackFromChat} />}
        </div>
      </div>
    </ThemeProvider>
  );
}