import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
        }}
      >
        <Loader2
          className="animate-spin"
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--primary)',
          }}
        />
        <p
          style={{
            marginTop: '16px',
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
          }}
        >
          A verificar autenticação...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
