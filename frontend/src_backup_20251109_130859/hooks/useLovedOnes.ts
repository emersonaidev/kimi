import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { LovedOneWithStatus } from '@/types/app.types';

export function useLovedOnes(caregiverId: string | undefined) {
  const [lovedOnes, setLovedOnes] = useState<LovedOneWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caregiverId) {
      setLoading(false);
      return;
    }

    async function fetchLovedOnes() {
      try {
        setLoading(true);
        setError(null);

        // Query agregada conforme contracts/README.md linha 44-84
        const { data, error: queryError } = await supabase
          .from('loved_ones')
          .select(`
            *,
            last_location:gps_locations(latitude, longitude, accuracy, battery_level, recorded_at)
              .order(recorded_at, { ascending: false })
              .limit(1)
              .single(),
            last_metrics:health_metrics(heart_rate, steps, recorded_at)
              .order(recorded_at, { ascending: false })
              .limit(1)
              .single(),
            pending_alerts:alerts(count)
              .is(is_acknowledged, false)
          `)
          .eq('caregiver_id', caregiverId)
          .order('created_at', { ascending: true });

        if (queryError) throw queryError;

        // Transformar para LovedOneWithStatus[] conforme data-model.md linha 343-354
        const transformed: LovedOneWithStatus[] = (data || []).map((lo) => ({
          id: lo.id,
          caregiver_id: lo.caregiver_id,
          device_id: lo.device_id,
          full_name: lo.full_name,
          date_of_birth: lo.date_of_birth,
          medical_conditions: lo.medical_conditions,
          emergency_notes: lo.emergency_notes,
          profile_picture_url: lo.profile_picture_url,
          lastLocation: lo.last_location
            ? {
                latitude: lo.last_location.latitude,
                longitude: lo.last_location.longitude,
                accuracy: lo.last_location.accuracy,
                battery_level: lo.last_location.battery_level,
                recorded_at: lo.last_location.recorded_at,
                isStale:
                  Date.now() - new Date(lo.last_location.recorded_at).getTime() >
                  30 * 60 * 1000, // > 30 min
              }
            : null,
          lastMetrics: lo.last_metrics
            ? {
                heart_rate: lo.last_metrics.heart_rate,
                steps: lo.last_metrics.steps,
                recorded_at: lo.last_metrics.recorded_at,
              }
            : null,
          safeZoneStatus: {
            isInSafeZone: true, // TODO: chamar check_geofence_breach RPC
            violatedZones: [],
          },
          pendingAlertsCount: lo.pending_alerts?.[0]?.count ?? 0,
        }));

        setLovedOnes(transformed);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch loved ones'));
        console.error('Error fetching loved ones:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLovedOnes();
  }, [caregiverId]);

  return { lovedOnes, loading, error };
}
