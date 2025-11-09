// Application-level types for KIMI Caregiver Monitoring App
// These complement the database types with UI-specific structures

import type { Database } from './database.types';
import type { ComponentType } from 'react';

type Tables = Database['public']['Tables'];

// Tipo base para Loved One com dados agregados
export interface LovedOneWithStatus {
  // Campos base (de loved_ones table)
  id: string;
  caregiver_id: string;
  device_id: string;
  full_name: string;
  date_of_birth: string | null;
  medical_conditions: string | null;
  emergency_notes: string | null;
  profile_picture_url: string | null;

  // Dados agregados de última localização
  lastLocation: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    battery_level: number | null;
    recorded_at: string;
    isStale: boolean; // true se > 30 min
  } | null;

  // Dados agregados de health metrics
  lastMetrics: {
    heart_rate: number | null;
    steps: number | null;
    recorded_at: string;
  } | null;

  // Status de safe zones
  safeZoneStatus: {
    isInSafeZone: boolean;
    violatedZones: Array<{ id: string; name: string; distance: number }>;
  };

  // Contagem de alertas pendentes
  pendingAlertsCount: number;
}

// Tipo para pontos do mapa
export interface MapMarker {
  id: string;
  type: 'current' | 'historical';
  position: { lat: number; lng: number };
  timestamp: string;
  accuracy: number | null;
  batteryLevel: number | null;
}

// Tipo para trail do mapa (linha de movimento)
export interface LocationTrail {
  lovedOneId: string;
  points: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

// Tipo para círculos de safe zones no mapa
export interface SafeZoneCircle {
  id: string;
  center: { lat: number; lng: number };
  radius: number; // metros
  name: string;
  isActive: boolean;
  color: string; // baseado em is_active
}

// Tipo para dados de gráfico Recharts
export interface HeartRateDataPoint {
  timestamp: string; // ISO string
  bpm: number;
  isAbnormal: boolean; // true se < 40 ou > 150
}

export interface StepsDataPoint {
  timestamp: string;
  steps: number;
  date: string; // formato humano "9 Nov"
}

export interface SleepDataPoint {
  timestamp: string;
  hours: number;
  date: string;
}

// Tipo para eventos da timeline
export interface TimelineEvent {
  id: string;
  type: 'location_change' | 'safe_zone_entry' | 'safe_zone_exit' | 'alert_triggered';
  timestamp: string;
  description: string;
  metadata: {
    // Para location_change
    latitude?: number;
    longitude?: number;
    address?: string; // reverse geocoding (opcional)

    // Para safe_zone_*
    zoneName?: string;

    // Para alert_triggered
    alertType?: string;
    severity?: string;
  };
}

// Tipo para estado de alert com ações
export interface AlertWithActions extends Tables['alerts']['Row'] {
  // Ação de acknowledge
  acknowledge: () => Promise<void>;

  // Ação de dismiss (soft delete ou flag)
  dismiss: () => Promise<void>;

  // Informação derivada para UX
  icon: ComponentType;
  color: string; // CSS variable name
  canContactEmergency: boolean;
}

// Re-export tipos úteis do database
export type Caregiver = Tables['caregivers']['Row'];
export type LovedOne = Tables['loved_ones']['Row'];
export type Alert = Tables['alerts']['Row'];
export type GPSLocation = Tables['gps_locations']['Row'];
export type HealthMetric = Tables['health_metrics']['Row'];
export type SafeZone = Tables['safe_zones']['Row'];
export type Activity = Tables['activities']['Row'];
export type EmergencyContact = Tables['emergency_contacts']['Row'];
export type CaregiverPreferences = Tables['caregiver_preferences']['Row'];
