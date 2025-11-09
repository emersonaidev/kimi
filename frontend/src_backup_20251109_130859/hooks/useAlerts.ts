import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAlertStore } from '@/stores/useAlertStore';
import type { Alert } from '@/types/app.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useAlerts(caregiverId: string | undefined) {
  const { setAlerts, addAlert } = useAlertStore();

  useEffect(() => {
    if (!caregiverId) return;

    let channel: RealtimeChannel | null = null;

    async function fetchPendingAlerts() {
      try {
        // Query alertas pendentes conforme contracts/ linha 183-238
        const { data, error: queryError } = await supabase
          .from('alerts')
          .select(
            `
            *,
            loved_one:loved_ones!alerts_loved_one_id_fkey(full_name, device_id)
          `
          )
          .eq('caregiver_id', caregiverId)
          .is('acknowledged_at', null)
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;

        setAlerts(data as Alert[]);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    }

    function setupRealtimeSubscription() {
      // Subscribe realtime novos alertas conforme contracts/ linha 436-462
      channel = supabase
        .channel('alerts:' + caregiverId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: 'caregiver_id=eq.' + caregiverId,
          },
          async (payload) => {
            console.log('New alert received:', payload);

            // Fetch full alert with loved_one relation
            const { data, error } = await supabase
              .from('alerts')
              .select(
                `
                *,
                loved_one:loved_ones!alerts_loved_one_id_fkey(full_name, device_id)
              `
              )
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              addAlert(data as Alert);
            }
          }
        )
        .subscribe((status) => {
          console.log('Alerts subscription status:', status);
        });
    }

    fetchPendingAlerts();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [caregiverId, setAlerts, addAlert]);
}
