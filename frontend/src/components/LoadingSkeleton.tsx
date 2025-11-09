interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <div key={i} className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)] animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-8 w-16 bg-muted rounded-[var(--radius-button)]"></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="bg-card rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-elevation-sm)] animate-pulse">
        {skeletons.map((_, i) => (
          <div 
            key={i} 
            className={`p-4 flex items-center justify-between ${i < count - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-5 w-5 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-pulse">
      {skeletons.map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded w-full"></div>
      ))}
    </div>
  );
}
