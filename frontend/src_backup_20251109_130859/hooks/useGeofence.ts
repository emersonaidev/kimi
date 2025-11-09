import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GeofenceCheckResult {
  violatedZones: Array<{
    safe_zone_id: string;
    name: string;
    distance_from_center: number;
  }>;
  isInSafeZone: boolean;
}

export function useGeofence() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function checkGeofenceBreach(
    lovedOneId: string,
    latitude: number,
    longitude: number
  ): Promise<GeofenceCheckResult | null> {
    try {
      setChecking(true);
      setError(null);

      // Call RPC function check_geofence_breach conforme contracts/ linha 327-369
      const { data, error: rpcError } = await supabase.rpc('check_geofence_breach', {
        p_loved_one_id: lovedOneId,
        p_latitude: latitude,
        p_longitude: longitude,
      });

      if (rpcError) throw rpcError;

      return data as GeofenceCheckResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check geofence'));
      console.error('Error checking geofence:', err);
      return null;
    } finally {
      setChecking(false);
    }
  }

  return { checkGeofenceBreach, checking, error };
}
