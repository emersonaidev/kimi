import { Home, MessageCircle, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getBottomNavBg } from '../utils/theme';

interface BottomNavProps {
  active: 'dashboard' | 'health' | 'insights';
  onNavigate: (screen: 'dashboard' | 'settings' | 'chat' | 'health') => void;
  fixed?: boolean; // Optional prop to control if it's fixed or not
}

export function BottomNav({ active, onNavigate, fixed = true }: BottomNavProps) {
  const { theme } = useTheme();
  
  return (
    <nav 
      className={`${fixed ? 'fixed' : 'relative'} ${fixed ? 'bottom-0 left-0 right-0' : ''} border-t z-[200] transition-colors duration-300`}
      style={{
        backgroundColor: getBottomNavBg(theme),
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'var(--border)',
        height: fixed ? 'calc(75px + env(safe-area-inset-bottom))' : '75px',
        paddingBottom: fixed ? 'env(safe-area-inset-bottom)' : '0',
      }}
    >
      <div className="mx-auto max-w-md h-[75px] flex items-start justify-around" style={{ paddingTop: '8px' }}>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 px-6 py-1 active:scale-95 transition-all min-w-[60px] ${
            active === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Go to Home"
        >
          <Home 
            className="transition-transform duration-200" 
            style={{
              width: '24px',
              height: '24px',
              transform: active === 'dashboard' ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          <span 
            className="caption transition-all duration-200"
            style={{
              fontSize: '10px',
              fontWeight: active === 'dashboard' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            Home
          </span>
        </button>

        <button
          onClick={() => onNavigate('health')}
          className={`flex flex-col items-center justify-center gap-0.5 px-6 py-1 active:scale-95 transition-all min-w-[60px] ${
            active === 'health' ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Go to Health"
        >
          <Activity 
            className="transition-transform duration-200" 
            style={{
              width: '24px',
              height: '24px',
              transform: active === 'health' ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          <span 
            className="caption transition-all duration-200"
            style={{
              fontSize: '10px',
              fontWeight: active === 'health' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            Health
          </span>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className={`flex flex-col items-center justify-center gap-0.5 px-6 py-1 active:scale-95 transition-all min-w-[60px] ${
            active === 'insights' ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Go to AI Assistant"
        >
          <MessageCircle 
            className="transition-transform duration-200" 
            style={{
              width: '24px',
              height: '24px',
              transform: active === 'insights' ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          <span 
            className="caption transition-all duration-200"
            style={{
              fontSize: '10px',
              fontWeight: active === 'insights' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            KIMI
          </span>
        </button>
      </div>
    </nav>
  );
}