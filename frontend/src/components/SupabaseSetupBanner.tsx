import { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured } from '../lib/supabase';

export function SupabaseSetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Don't show if already configured or dismissed
  if (isConfigured || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border"
        style={{
          backgroundColor: 'rgba(255, 204, 0, 0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-start gap-3">
          {/* Icon */}
          <AlertCircle 
            className="flex-shrink-0 mt-0.5"
            style={{
              width: '20px',
              height: '20px',
              color: 'rgba(255, 204, 0, 1)',
            }}
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p 
              className="text-foreground mb-1"
              style={{
                fontSize: 'var(--text-label)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Supabase not configured
            </p>
            <p 
              className="text-muted-foreground mb-2"
              style={{
                fontSize: 'var(--text-caption)',
              }}
            >
              Authentication and real-time features require Supabase credentials. Add your credentials to the <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)' }}>.env</code> file to enable full functionality.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline transition-colors"
              style={{
                fontSize: 'var(--text-caption)',
                color: 'var(--primary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Get started with Supabase
              <ExternalLink style={{ width: '12px', height: '12px' }} />
            </a>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-secondary rounded-[var(--radius)] transition-colors"
            aria-label="Dismiss"
          >
            <X style={{ width: '20px', height: '20px' }} className="text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
