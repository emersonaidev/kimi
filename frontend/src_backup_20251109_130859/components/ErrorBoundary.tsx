import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              padding: '32px',
              borderRadius: '12px',
              backgroundColor: 'var(--card)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--destructive)',
              }}
            >
              Algo deu errado
            </h1>
            <p
              style={{
                fontSize: '16px',
                marginBottom: '24px',
                color: 'var(--muted-foreground)',
              }}
            >
              Ocorreu um erro inesperado. Por favor, recarregue a página ou tente novamente mais tarde.
            </p>
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '24px',
                  padding: '12px',
                  backgroundColor: 'var(--muted)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Detalhes do erro
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: 'var(--primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
