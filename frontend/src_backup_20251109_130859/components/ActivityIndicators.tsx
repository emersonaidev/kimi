import { Heart, Activity, Moon } from 'lucide-react';

interface ActivityIndicatorProps {
  icon: 'heart' | 'activity' | 'sleep';
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'alert';
  trend?: 'up' | 'down' | 'stable';
}

export function ActivityIndicator({ icon, label, value, status, trend }: ActivityIndicatorProps) {
  const icons = {
    heart: Heart,
    activity: Activity,
    sleep: Moon,
  };

  const colors = {
    normal: 'var(--chart-2)',
    warning: 'var(--chart-3)',
    alert: 'var(--destructive)',
  };

  const Icon = icons[icon];

  return (
    <div 
      className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)] hover:shadow-[var(--shadow-elevation-md)] transition-all active:scale-[0.98]"
      style={{
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${colors[status]}20`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: colors[status] }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: trend === 'up' ? '6px solid var(--chart-2)' : 'none',
                borderTop: trend === 'down' ? '6px solid var(--destructive)' : 'none',
              }}
            />
          </div>
        )}
      </div>
      
      <div>
        <p className="text-muted-foreground caption mb-1">{label}</p>
        <h3 style={{ color: colors[status] }}>{value}</h3>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Dashboard Grid of Activity Indicators
export function ActivityGrid() {
  return (
    <div className="px-4 py-4">
      <label className="block mb-3 text-muted-foreground caption">Health Metrics</label>
      <div className="grid grid-cols-2 gap-3">
        <ActivityIndicator
          icon="heart"
          label="Heart Rate"
          value="72 bpm"
          status="normal"
          trend="stable"
        />
        <ActivityIndicator
          icon="activity"
          label="Activity"
          value="3,247 steps"
          status="normal"
          trend="up"
        />
        <ActivityIndicator
          icon="sleep"
          label="Sleep Quality"
          value="7.5 hrs"
          status="normal"
          trend="up"
        />
        <ActivityIndicator
          icon="heart"
          label="Stress Level"
          value="Low"
          status="normal"
          trend="stable"
        />
      </div>
    </div>
  );
}
