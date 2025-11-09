import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, var(--muted) 0%, var(--secondary) 100%)',
        }}
      >
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-button)] active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
