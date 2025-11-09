import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: 'var(--chart-2)',
    error: 'var(--destructive)',
    info: 'var(--primary)',
    warning: 'var(--warning, orange)',
  };

  const Icon = icons[type];

  return (
    <div
      className="fixed top-[max(1rem,calc(env(safe-area-inset-top)+4px))] left-4 right-4 z-[9999] mx-auto max-w-md"
      style={{
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out',
      }}
    >
      <div
        className="flex items-start gap-3 p-4 rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-md)] border border-border"
        style={{
          backgroundColor: theme === 'dark' 
            ? 'rgba(44, 44, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors[type] }} />
        <p className="flex-1 text-foreground">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="p-1 -mt-1 -mr-1 hover:bg-secondary rounded-[var(--radius)] active:scale-95 transition-all"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  const ToastComponent = toast ? (
    <Toast
      type={toast.type}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}