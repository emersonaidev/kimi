import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <Construction
          style={{
            width: '64px',
            height: '64px',
            color: 'var(--muted-foreground)',
            margin: '0 auto 24px',
          }}
        />
        <h2
          style={{
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            marginBottom: '12px',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5',
          }}
        >
          {description || 'Esta funcionalidade está em desenvolvimento e estará disponível em breve.'}
        </p>
      </div>
    </motion.div>
  );
}
