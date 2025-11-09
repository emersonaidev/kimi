import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GPSLocation } from '@/types/app.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeLocation(lovedOneId: string | undefined) {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lovedOneId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    async function fetchCurrentLocation() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('gps_locations')
          .select('*')
          .eq('loved_one_id', lovedOneId)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        if (queryError) throw queryError;

        setCurrentLocation(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch location'));
        console.error('Error fetching current location:', err);
      } finally {
        setLoading(false);
      }
    }

    function setupRealtimeSubscription() {
      channel = supabase
        .channel('gps:' + lovedOneId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'gps_locations',
            filter: 'loved_one_id=eq.' + lovedOneId,
          },
          (payload) => {
            console.log('New GPS location received:', payload);
            setCurrentLocation(payload.new as GPSLocation);
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    }

    fetchCurrentLocation();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [lovedOneId]);

  return { currentLocation, loading, error };
}
