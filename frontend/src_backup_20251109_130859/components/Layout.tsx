import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertStore } from '@/stores/useAlertStore';
import { useAlerts } from '@/hooks/useAlerts';
import Group11 from '@/imports/Group11';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { unreadCount } = useAlertStore();

  // Subscribe to alerts to update badge
  useAlerts(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--elevation-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            <div style={{ width: '32px', height: '32px' }}>
              <Group11 />
            </div>
            <h1
              style={{
                fontSize: 'var(--text-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--foreground)',
              }}
            >
              KIMI
            </h1>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-button)',
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            className="active:scale-[0.98]"
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Sair
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          padding: '8px',
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            backgroundColor: isActive('/dashboard') ? 'var(--secondary)' : 'transparent',
            borderRadius: 'var(--radius)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="active:scale-[0.95]"
        >
          <Home
            style={{
              width: '24px',
              height: '24px',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-caption)',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: isActive('/dashboard') ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            Início
          </span>
        </button>

        <button
          onClick={() => navigate('/alerts')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            backgroundColor: isActive('/alerts') ? 'var(--secondary)' : 'transparent',
            borderRadius: 'var(--radius)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          className="active:scale-[0.95]"
        >
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-caption)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          <Bell
            style={{
              width: '24px',
              height: '24px',
              color: isActive('/alerts') ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-caption)',
              color: isActive('/alerts') ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: isActive('/alerts') ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            Alertas
          </span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            backgroundColor: isActive('/settings') ? 'var(--secondary)' : 'transparent',
            borderRadius: 'var(--radius)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="active:scale-[0.95]"
        >
          <Settings
            style={{
              width: '24px',
              height: '24px',
              color: isActive('/settings') ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          />
          <span
            style={{
              fontSize: 'var(--text-caption)',
              color: isActive('/settings') ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: isActive('/settings') ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            Definições
          </span>
        </button>
      </nav>
    </div>
  );
}
