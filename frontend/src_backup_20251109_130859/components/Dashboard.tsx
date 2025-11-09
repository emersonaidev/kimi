import { motion } from 'motion/react';
import { Heart, Activity, Battery, BatteryWarning, MapPin, Clock, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLovedOnes } from '@/hooks/useLovedOnes';
import { useNavigate } from 'react-router-dom';
import type { LovedOneWithStatus } from '@/types/app.types';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const caregiverId = user?.id;
  
  const { lovedOnes, loading, error } = useLovedOnes(caregiverId);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return 'Há ' + diffMins + ' min';
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return 'Há ' + diffHours + 'h';
    return date.toLocaleDateString('pt-PT');
  };

  const getBatteryIcon = (level: number | null) => {
    if (!level) return <Battery className="w-4 h-4" />;
    return level < 20 ? (
      <BatteryWarning className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
    ) : (
      <Battery className="w-4 h-4" />
    );
  };

  const handleCardClick = (lovedOneId: string) => {
    navigate('/loved-one/' + lovedOneId + '/map');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          padding: '20px',
        }}
      >
        <Loader2
          className="animate-spin"
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--primary)',
          }}
        />
        <p
          style={{
            marginTop: '16px',
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
          }}
        >
          A carregar...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          padding: '20px',
        }}
      >
        <AlertCircle
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--destructive)',
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Erro ao carregar
        </p>
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
          }}
        >
          {error.message}
        </p>
      </div>
    );
  }

  if (lovedOnes.length === 0) {
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
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          padding: '20px',
        }}
      >
        <div
          style={{
            padding: '48px 32px',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--card)',
            boxShadow: 'var(--elevation-sm)',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <UserPlus
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
            Nenhum ente querido
          </h2>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--muted-foreground)',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            Adicione o primeiro ente querido para começar a monitorização
          </p>
          <p
            style={{
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Use o Supabase SQL Editor para adicionar dados de teste
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        padding: '24px 20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '24px' }}
      >
        <h1
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
          }}
        >
          {lovedOnes.length} ente querido
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {lovedOnes.map((lovedOne, index) => (
          <LovedOneCard
            key={lovedOne.id}
            lovedOne={lovedOne}
            index={index}
            onClick={() => handleCardClick(lovedOne.id)}
            formatTimestamp={formatTimestamp}
            getBatteryIcon={getBatteryIcon}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface LovedOneCardProps {
  lovedOne: LovedOneWithStatus;
  index: number;
  onClick: () => void;
  formatTimestamp: (timestamp: string) => string;
  getBatteryIcon: (level: number | null) => JSX.Element;
}

function LovedOneCard(props: LovedOneCardProps) {
  const { lovedOne, index, onClick, formatTimestamp, getBatteryIcon } = props;
  const isStale = lovedOne.lastLocation?.isStale ?? true;
  const batteryLow = (lovedOne.lastLocation?.battery_level ?? 100) < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--elevation-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      className="active:scale-[0.98]"
      whileHover={{ boxShadow: 'var(--elevation-md)' }}
    >
      {lovedOne.pendingAlertsCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-caption)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          {lovedOne.pendingAlertsCount}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-weight-semibold)',
            marginRight: '12px',
          }}
        >
          {lovedOne.full_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '4px',
            }}
          >
            {lovedOne.full_name}
          </h3>
          <p
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--muted-foreground)',
            }}
          >
            {lovedOne.device_id}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px',
          borderRadius: 'var(--radius)',
          backgroundColor: isStale ? 'var(--muted)' : 'var(--secondary)',
        }}
      >
        <MapPin
          style={{
            width: '16px',
            height: '16px',
            color: isStale ? 'var(--muted-foreground)' : 'var(--primary)',
            marginRight: '8px',
          }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 'var(--text-label)',
              color: isStale ? 'var(--muted-foreground)' : 'var(--foreground)',
            }}
          >
            {lovedOne.lastLocation
              ? lovedOne.lastLocation.latitude.toFixed(4) + ', ' + lovedOne.lastLocation.longitude.toFixed(4)
              : 'Sem localização'}
          </p>
        </div>
        <Clock
          style={{
            width: '14px',
            height: '14px',
            color: 'var(--muted-foreground)',
            marginLeft: '8px',
            marginRight: '4px',
          }}
        />
        <p
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--muted-foreground)',
          }}
        >
          {lovedOne.lastLocation ? formatTimestamp(lovedOne.lastLocation.recorded_at) : '-'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Heart
            style={{
              width: '20px',
              height: '20px',
              color: 'var(--primary)',
              margin: '0 auto 4px',
            }}
          />
          <p
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
            }}
          >
            {lovedOne.lastMetrics?.heart_rate ?? '-'}
          </p>
          <p
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--muted-foreground)',
            }}
          >
            BPM
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Activity
            style={{
              width: '20px',
              height: '20px',
              color: 'var(--primary)',
              margin: '0 auto 4px',
            }}
          />
          <p
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
            }}
          >
            {lovedOne.lastMetrics?.steps ?? '-'}
          </p>
          <p
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--muted-foreground)',
            }}
          >
            Passos
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          {getBatteryIcon(lovedOne.lastLocation?.battery_level ?? null)}
          <p
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 'var(--font-weight-semibold)',
              color: batteryLow ? 'var(--destructive)' : 'var(--foreground)',
              marginTop: '4px',
            }}
          >
            {lovedOne.lastLocation?.battery_level ?? '-'}%
          </p>
          <p
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--muted-foreground)',
            }}
          >
            Bateria
          </p>
        </div>
      </div>
    </motion.div>
  );
}
