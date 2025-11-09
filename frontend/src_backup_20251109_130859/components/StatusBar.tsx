import { Wifi, Battery, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const textColor = 'black'; // Always black

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between pointer-events-none"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: '32px',
        paddingRight: '28px',
        height: '44px',
      }}
    >
      {/* Left side - Time */}
      <div className="flex items-center gap-1" style={{ marginTop: '-4px' }}>
        <span 
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: '-0.3px',
            color: 'black',
            textShadow: '0 0 1px rgba(255,255,255,0.3)',
          }}
        >
          {currentTime}
        </span>
        {/* GPS indicator - filled */}
        <Navigation 
          style={{ 
            width: '12px', 
            height: '12px',
            strokeWidth: 0,
            fill: 'black',
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
          }} 
        />
      </div>

      {/* Right side - Network and Battery */}
      <div className="flex items-center gap-1.5" style={{ marginTop: '-4px' }}>
        {/* Network Signal */}
        <Wifi 
          style={{ 
            width: '15px', 
            height: '15px',
            strokeWidth: 2.5,
            color: 'black',
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
          }} 
        />
        
        {/* 5G Text */}
        <span
          style={{
            fontSize: '15px',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: '-0.2px',
            color: 'black',
            textShadow: '0 0 1px rgba(255,255,255,0.3)',
          }}
        >
          5G
        </span>
        
        {/* Battery */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Battery 
            style={{ 
              width: '24px', 
              height: '24px',
              strokeWidth: 2,
              color: 'black',
              filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
            }} 
          />
          {/* Battery fill */}
          <div
            style={{
              position: 'absolute',
              left: '3px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '13px',
              height: '8px',
              backgroundColor: 'black',
              borderRadius: '1px',
            }}
          />
        </div>
      </div>
    </div>
  );
}