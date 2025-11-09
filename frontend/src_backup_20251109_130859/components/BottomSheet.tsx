import { motion, PanInfo } from 'motion/react';
import { useState, useRef } from 'react';

type SheetPosition = 'collapsed' | 'medium' | 'full';

interface BottomSheetProps {
  position: SheetPosition;
  onPositionChange: (position: SheetPosition) => void;
  children: React.ReactNode;
  isDragDisabled?: boolean; // New prop to disable dragging
}

const POSITIONS = {
  collapsed: 0.88, // 88% from top (mostra só a alça para puxar)
  medium: 0.71,    // 71% from top (mostra só o location card - como estava antes)
  full: 0.12,      // 12% from top (quase full screen, mantém header visível)
};

export function BottomSheet({ position, onPositionChange, children, isDragDisabled }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediumGoesToFull, setMediumGoesToFull] = useState(true); // Toggle para medium alternar

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isDragDisabled) return; // Don't allow drag if disabled
    
    setIsDragging(false);
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Determinar nova posição baseado em velocity e offset
    if (Math.abs(velocity) > 500) {
      // Fast swipe
      if (velocity > 0) {
        // Swipe down
        if (position === 'full') onPositionChange('medium');
        else if (position === 'medium') onPositionChange('collapsed');
      } else {
        // Swipe up
        if (position === 'collapsed') onPositionChange('medium');
        else if (position === 'medium') onPositionChange('full');
      }
    } else {
      // Slow drag - snap to nearest
      if (position === 'collapsed') {
        if (offset < -100) onPositionChange('medium');
      } else if (position === 'medium') {
        if (offset > 100) onPositionChange('collapsed');
        else if (offset < -100) onPositionChange('full');
      } else if (position === 'full') {
        if (offset > 100) onPositionChange('medium');
      }
    }
  };

  const handleTap = () => {
    if (isDragDisabled) return; // Don't allow tap if disabled
    
    // Single tap on drag handle cycles: medium → full → medium → collapsed → medium...
    if (position === 'collapsed') {
      onPositionChange('medium');
      setMediumGoesToFull(true); // próximo medium vai para full
    } else if (position === 'medium') {
      if (mediumGoesToFull) {
        onPositionChange('full');
      } else {
        onPositionChange('collapsed');
      }
    } else {
      // full → medium
      onPositionChange('medium');
      setMediumGoesToFull(false); // próximo medium vai para collapsed
    }
  };

  return (
    <div 
      className="fixed left-0 right-0 z-[80] pointer-events-none"
      style={{
        top: 0,
        height: '100vh',
      }}
    >
      <motion.div
        ref={sheetRef}
        className="absolute left-0 right-0 pointer-events-none"
        initial={{ top: `${POSITIONS.medium * 100}vh` }}
        animate={{ top: `${POSITIONS[position] * 100}vh` }}
        transition={{ 
          type: 'spring', 
          damping: 35,
          stiffness: 400,
          mass: 0.8
        }}
        style={{
          height: '100vh',
        }}
      >
        <div className="mx-auto max-w-md h-full relative pointer-events-auto">
          {/* Drag Handle Area */}
          <motion.div
            className="absolute top-0 left-0 right-0 cursor-grab active:cursor-grabbing"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onTap={handleTap}
            style={{
              touchAction: 'none',
              height: '60px',
              zIndex: 100,
            }}
            dragConstraints={isDragDisabled ? { top: 0, bottom: 0 } : undefined}
          >
            {/* Transparent drag area for better UX */}
            <div className="absolute inset-0" />
          </motion.div>

          {/* Sheet Content */}
          <div 
            className="h-full bg-background overflow-hidden flex flex-col"
            style={{
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -2px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            {/* Drag Handle Visual */}
            <div className="flex items-center justify-center py-3 shrink-0">
              <div 
                className="w-9 h-1 rounded-full bg-muted-foreground opacity-40"
                style={{
                  transition: 'opacity 0.2s',
                }}
              />
            </div>

            {/* Content with overflow scroll */}
            <div 
              className="flex-1 overflow-hidden"
              style={{
                overscrollBehavior: 'contain',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}