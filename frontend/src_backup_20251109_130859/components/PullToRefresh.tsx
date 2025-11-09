import { Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = (e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0 || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance * 0.5, threshold));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing]);

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pulling || refreshing ? 1 : 0,
          transform: `translateY(-${pulling || refreshing ? 0 : 20}px)`,
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 
            className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${pullDistance * 4}deg)`,
            }}
          />
          <span className="caption">
            {refreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
      
      <div 
        style={{
          transform: `translateY(${pulling || refreshing ? pullDistance : 0}px)`,
          transition: pulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
