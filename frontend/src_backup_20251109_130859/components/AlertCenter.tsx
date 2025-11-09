import { motion } from 'motion/react';
import { ShieldAlert, Battery, Heart, AlertTriangle, Check, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useAlertStore } from '@/stores/useAlertStore';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Alert } from '@/types/app.types';

export function AlertCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { alerts } = useAlertStore();

  // Subscribe to alerts for the current caregiver
  useAlerts(user?.id);

  // Sort by severity: high > medium > low
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const handleAcknowledge = async (alert: Alert) => {
    try {
      // PATCH acknowledged_at conforme contracts/ linha 230-239
      const { error } = await supabase
        .from('alerts')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('id', alert.id);

      if (error) throw error;

      useAlertStore.getState().acknowledge(alert.id);

      toast({
        title: 'Alerta confirmado',
        description: 'O alerta foi marcado como lido',
      });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      toast({
        title: 'Erro',
        description: 'Falha ao confirmar alerta',
        variant: 'destructive',
      });
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'geofence_breach':
        return <ShieldAlert style={{ width: '24px', height: '24px' }} />;
      case 'low_battery':
        return <Battery style={{ width: '24px', height: '24px' }} />;
      case 'abnormal_heart_rate':
        return <Heart style={{ width: '24px', height: '24px' }} />;
      case 'fall_detected':
        return <AlertTriangle style={{ width: '24px', height: '24px' }} />;
      default:
        return <AlertTriangle style={{ width: '24px', height: '24px' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'var(--destructive)';
      case 'medium':
        return 'var(--warning, orange)';
      case 'low':
        return 'var(--info, blue)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return 'há ' + diffMins + ' min';
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return 'há ' + diffHours + 'h';
    const diffDays = Math.floor(diffHours / 24);
    return 'há ' + diffDays + 'd';
  };

  if (sortedAlerts.length === 0) {
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
        <CheckCircle
          style={{
            width: '64px',
            height: '64px',
            color: 'var(--success, green)',
            marginBottom: '24px',
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
          Tudo tranquilo!
        </h2>
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
          }}
        >
          Nenhum alerta pendente
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--foreground)',
          marginBottom: '24px',
        }}
      >
        Centro de Alertas
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--card)',
              boxShadow: 'var(--elevation-sm)',
              borderLeft: '4px solid ' + getSeverityColor(alert.severity),
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                color: getSeverityColor(alert.severity),
                flexShrink: 0,
              }}
            >
              {getAlertIcon(alert.alert_type)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--foreground)',
                  }}
                >
                  {alert.alert_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h3>
                <span
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {formatTimestamp(alert.created_at)}
                </span>
              </div>

              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                {alert.message}
              </p>

              {alert.loved_one && (
                <p
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {alert.loved_one.full_name} ({alert.loved_one.device_id})
                </p>
              )}
            </div>

            <button
              onClick={() => handleAcknowledge(alert)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-button)',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--text-label)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              className="active:scale-[0.95]"
            >
              <Check style={{ width: '16px', height: '16px' }} />
              Confirmar
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
