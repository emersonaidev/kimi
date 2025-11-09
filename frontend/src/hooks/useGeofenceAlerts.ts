import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useGeofence } from './useGeofence';
import type { GPSLocation } from '@/types/app.types';

interface UseGeofenceAlertsProps {
  lovedOneId: string | undefined;
  currentLocation: GPSLocation | null;
  onViolation?: (zoneName: string) => void;
}

export function useGeofenceAlerts({ lovedOneId, currentLocation, onViolation }: UseGeofenceAlertsProps) {
  const { checkGeofenceBreach } = useGeofence();

  useEffect(() => {
    if (!lovedOneId || !currentLocation) return;

    async function checkAndCreateAlert() {
      // Check geofence breach when new GPS location arrives
      const result = await checkGeofenceBreach(
        lovedOneId!,
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (!result) return;

      // If there are violated zones, create alerts
      if (result.violatedZones && result.violatedZones.length > 0) {
        for (const violation of result.violatedZones) {
          try {
            // Create alert conforme data-model.md linha 460-483
            const { error: insertError } = await supabase.from('alerts').insert({
              loved_one_id: lovedOneId,
              alert_type: 'geofence_breach',
              severity: 'high',
              message: 'Saiu da safe zone: ' + violation.name,
              metadata: {
                safe_zone_id: violation.safe_zone_id,
                safe_zone_name: violation.name,
                distance_from_center: violation.distance_from_center,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
            });

            if (insertError) {
              console.error('Error creating alert:', insertError);
            } else {
              console.log('Geofence alert created for zone:', violation.name);
              onViolation?.(violation.name);
            }
          } catch (err) {
            console.error('Error creating geofence alert:', err);
          }
        }
      }
    }

    checkAndCreateAlert();
  }, [currentLocation, lovedOneId, checkGeofenceBreach, onViolation]);
}
