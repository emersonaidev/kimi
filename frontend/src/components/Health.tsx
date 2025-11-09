import { Settings, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useTheme } from '../contexts/ThemeContext';
import { getGlassmorphismBg } from '../utils/theme';
import { useState, useEffect, useRef } from 'react';
import { StressCircle } from './StressCircle';

interface HealthProps {
  onNavigate: (screen: 'dashboard' | 'settings' | 'chat' | 'health') => void;
}

export function Health({ onNavigate }: HealthProps) {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Mock data - will be replaced with real sensor data
  const stressScore = 75; // 0-100 from HRV algorithm
  const hrvIndex = 'Normal'; // Low / Normal / High
  const restingHR = 68; // bpm
  const restingHRBaseline = 72; // user's baseline
  const breathingStability = 'Stable'; // Stable / Variable / Elevated
  const gsrReactivity = 'Normal'; // Normal / Elevated / High Reactivity
  const wellnessLoad = 42; // 0-100 composite score
  
  // Stress trend data (last 24h) - Higher values = higher stress (worse), Lower values = lower stress (better)
  // Peak at 16h shows highest stress (spike)
  const stressTrendData = [
    { hour: '00h', value: 35 },
    { hour: '02h', value: 25 },
    { hour: '04h', value: 20 },
    { hour: '06h', value: 30 },
    { hour: '08h', value: 45 },
    { hour: '10h', value: 60 },
    { hour: '12h', value: 55 },
    { hour: '14h', value: 65 },
    { hour: '16h', value: 85 }, // Peak - highest stress
    { hour: '18h', value: 50 },
    { hour: '20h', value: 40 },
    { hour: '22h', value: 35 },
  ];

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      setScrolled(main.scrollTop > 10);
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const getHRTrend = () => {
    const diff = restingHR - restingHRBaseline;
    if (diff > 5) return { icon: TrendingUp, color: 'var(--chart-3)', text: 'Above baseline' };
    if (diff < -5) return { icon: TrendingDown, color: 'var(--chart-2)', text: 'Below baseline' };
    return { icon: Minus, color: 'var(--muted-foreground)', text: 'Normal' };
  };

  const hrTrend = getHRTrend();
  const HRIcon = hrTrend.icon;

  const getWellnessLoadColor = () => {
    if (wellnessLoad <= 30) return 'var(--chart-2)';
    if (wellnessLoad <= 60) return '#f97316';
    return 'var(--chart-3)';
  };

  const getWellnessLoadLabel = () => {
    if (wellnessLoad <= 30) return 'Low';
    if (wellnessLoad <= 60) return 'Moderate';
    return 'High';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Large Title Header with Glassmorphism */}
      <header 
        className="sticky top-0 z-[100] border-b transition-all duration-300"
        style={{
          backgroundColor: getGlassmorphismBg(theme, scrolled),
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderColor: scrolled ? 'var(--border)' : 'transparent',
        }}
      >
        <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div className="flex items-center justify-between mb-1">
            <h1 
              className="transition-all duration-300"
              style={{
                fontSize: scrolled ? 'var(--text-h2)' : 'var(--text-h1)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Health
            </h1>
            <button 
              onClick={() => onNavigate('settings')}
              className="p-2 -mr-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
              aria-label="Open settings"
            >
              <Settings className="w-6 h-6 text-foreground" />
            </button>
          </div>
          {!scrolled && (
            <p className="text-muted-foreground caption transition-opacity duration-300">
              Ester's vital signs and wellness
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-background pb-20">
        <div className="pt-4">
          
          {/* Stress Score - Hero Card */}
          <div className="px-4 mb-6">
            <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-md)] overflow-hidden">
              <StressCircle score={stressScore} />
            </div>
          </div>

          {/* Stress Trend - Last 24h */}
          <div className="px-4 mb-6">
            <label className="block mb-2 text-muted-foreground caption uppercase tracking-wide" style={{ fontSize: 'var(--text-label)' }}>
              Stress Trend (24h)
            </label>
            <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
              {/* Line Chart */}
              <div className="relative h-32 mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Baseline at 50 (middle) */}
                  <line 
                    x1="0" 
                    y1="50" 
                    x2="100" 
                    y2="50" 
                    stroke="var(--muted-foreground)" 
                    strokeWidth="0.3" 
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                  
                  {/* Gradient definition - smooth transitions based on data */}
                  <defs>
                    <linearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      {stressTrendData.map((point, index) => {
                        const offset = (index / (stressTrendData.length - 1)) * 100;
                        const getColorForValue = (value: number) => {
                          if (value >= 70) return '#ef4444'; // Red - high stress
                          if (value >= 50) return '#f97316'; // Orange
                          if (value >= 30) return '#facc15'; // Yellow
                          if (value >= 15) return '#22c55e'; // Green
                          return '#3b82f6'; // Blue - low stress
                        };
                        return (
                          <stop 
                            key={index}
                            offset={`${offset}%`} 
                            stopColor={getColorForValue(point.value)} 
                          />
                        );
                      })}
                    </linearGradient>
                  </defs>
                  
                  {/* Stress line path */}
                  <polyline
                    points={stressTrendData.map((point, index) => {
                      const x = (index / (stressTrendData.length - 1)) * 100;
                      const y = 100 - point.value; // Invert Y axis
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#stressGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points - Higher value = worse (red), Lower value = better (blue) */}
                  {stressTrendData.map((point, index) => {
                    const x = (index / (stressTrendData.length - 1)) * 100;
                    const y = 100 - point.value;
                    const getPointColor = (value: number) => {
                      if (value >= 70) return '#ef4444'; // Red - high stress
                      if (value >= 50) return '#f97316'; // Orange
                      if (value >= 30) return '#facc15'; // Yellow
                      if (value >= 15) return '#22c55e'; // Green
                      return '#3b82f6'; // Blue - low stress
                    };
                    
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="1.5"
                        fill={getPointColor(point.value)}
                        stroke="var(--card)"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>
                
                {/* Baseline label */}
                <div className="absolute top-[50%] right-0 transform -translate-y-1/2">
                  <span className="text-muted-foreground caption bg-card px-1 rounded" style={{ fontSize: '10px' }}>
                    Baseline
                  </span>
                </div>
              </div>
              
              {/* Time labels */}
              <div className="flex justify-between mb-4">
                {stressTrendData.map((point, index) => (
                  <span key={index} className="text-muted-foreground" style={{ fontSize: '10px' }}>
                    {point.hour}
                  </span>
                ))}
              </div>
              
              <div className="pt-3 border-t border-border">
                <p className="text-muted-foreground caption">
                  Lower is better • Peaks indicate high stress periods
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Window */}
          <div className="px-4 mb-6">
            <label className="block mb-2 text-muted-foreground caption uppercase tracking-wide" style={{ fontSize: 'var(--text-label)' }}>
              Recovery Window
            </label>
            <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="mb-1">Peak Recovery</p>
                  <p className="text-muted-foreground caption">Nervous system stabilized</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--chart-2)' }}>
                    3:00 AM
                  </p>
                  <p className="text-muted-foreground caption">to 6:30 AM</p>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: '85%',
                    background: 'linear-gradient(90deg, var(--chart-2) 0%, var(--chart-1) 100%)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* HRV & Vital Signs Grid */}
          <div className="px-4 mb-6">
            <label className="block mb-2 text-muted-foreground caption uppercase tracking-wide" style={{ fontSize: 'var(--text-label)' }}>
              Vital Signs
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* HRV Daily Index */}
              <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
                <p className="text-muted-foreground caption mb-2">HRV Index</p>
                <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {hrvIndex}
                </p>
                <p className="text-muted-foreground caption mt-1">Resilience</p>
              </div>

              {/* Resting HR */}
              <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
                <p className="text-muted-foreground caption mb-2">Resting HR</p>
                <div className="flex items-baseline gap-1">
                  <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {restingHR}
                  </p>
                  <span className="text-muted-foreground caption">bpm</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <HRIcon className="w-3 h-3" style={{ color: hrTrend.color }} />
                  <p className="caption" style={{ color: hrTrend.color }}>{hrTrend.text}</p>
                </div>
              </div>

              {/* Breathing Stability */}
              <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
                <p className="text-muted-foreground caption mb-2">Breathing</p>
                <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {breathingStability}
                </p>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-chart-2 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              {/* GSR Reactivity */}
              <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
                <p className="text-muted-foreground caption mb-2">GSR Reactivity</p>
                <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {gsrReactivity}
                </p>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-chart-1 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

            </div>
          </div>

          {/* Daily Wellness Load */}
          <div className="px-4 mb-6">
            <label className="block mb-2 text-muted-foreground caption uppercase tracking-wide" style={{ fontSize: 'var(--text-label)' }}>
              Daily Wellness Load
            </label>
            <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="mb-1">Overall Load</p>
                  <p className="text-muted-foreground caption">Composite stress + recovery + HR</p>
                </div>
                <div className="text-right">
                  <p 
                    style={{ 
                      fontSize: 'var(--text-h1)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: getWellnessLoadColor()
                    }}
                  >
                    {wellnessLoad}
                  </p>
                  <p className="caption" style={{ color: getWellnessLoadColor() }}>
                    {getWellnessLoadLabel()}
                  </p>
                </div>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${wellnessLoad}%`,
                    backgroundColor: getWellnessLoadColor()
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav active="health" onNavigate={onNavigate} />
    </div>
  );
}