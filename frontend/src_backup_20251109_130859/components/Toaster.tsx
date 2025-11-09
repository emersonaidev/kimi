import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: toast.variant === 'destructive' ? 'var(--destructive)' : 'var(--card)',
              color: toast.variant === 'destructive' ? 'var(--destructive-foreground)' : 'var(--foreground)',
              boxShadow: 'var(--elevation-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ flex: 1 }}>
              {toast.title && (
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: toast.description ? '4px' : 0,
                  }}
                >
                  {toast.title}
                </h4>
              )}
              {toast.description && (
                <p
                  style={{
                    fontSize: 'var(--text-label)',
                    opacity: 0.9,
                  }}
                >
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              style={{
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                color: 'inherit',
              }}
              className="active:scale-[0.9]"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
