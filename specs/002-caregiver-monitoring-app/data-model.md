# Modelo de Dados: Aplicação KIMI Caregiver Monitoring

**Feature**: 002-caregiver-monitoring-app
**Data**: 2025-11-09
**Dependência**: 001-supabase-db-setup (schema PostgreSQL + PostGIS)

## Visão Geral

Esta aplicação frontend consome o schema de base de dados definido em `001-supabase-db-setup`. Não cria novas tabelas, apenas:
1. Consome dados via Supabase Client (PostgREST + Realtime)
2. Define TypeScript types que espelham o schema PostgreSQL
3. Adiciona funções PostgreSQL para lógica de negócio complexa (geofencing)

---

## Schema Existente (Referência)

### Tabelas Core (já existem)

Ver documentação completa em: `specs/001-supabase-db-setup/data-model.md`

**Resumo das 11 tabelas**:
1. `caregivers` - Perfis de utilizadores autenticados
2. `loved_ones` - Pessoas monitorizadas (wearables)
3. `gps_locations` - Coordenadas geográficas + metadados
4. `safe_zones` - Geofences circulares
5. `alerts` - Notificações de eventos críticos
6. `health_metrics` - Dados biométricos (BPM, passos, sono)
7. `activities` - Timeline de eventos
8. `chat_messages` - Mensagens entre caregiver e loved one
9. `emergency_contacts` - Contactos de emergência
10. `caregiver_preferences` - Configurações personalizadas
11. `location_shares` - Partilha temporária de localização

**Indexes**: 40+ indexes (composite, partial, GiST, GIN) para performance
**RLS Policies**: 34 políticas para isolamento de dados
**Triggers**: 8 triggers para auto-updates e alertas

---

## TypeScript Types (Frontend)

### Core Domain Types

Baseados no schema PostgreSQL, gerados via `supabase gen types typescript`:

```typescript
// types/database.types.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      caregivers: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      loved_ones: {
        Row: {
          id: string;
          caregiver_id: string;
          device_id: string;
          full_name: string;
          date_of_birth: string;
          medical_conditions: string | null;
          emergency_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        // ... Insert, Update
      };
      gps_locations: {
        Row: {
          id: string;
          loved_one_id: string;
          latitude: number;
          longitude: number;
          accuracy: number;
          battery_level: number;
          recorded_at: string;
        };
        // ... Insert, Update
      };
      safe_zones: {
        Row: {
          id: string;
          loved_one_id: string;
          caregiver_id: string;
          name: string;
          latitude: number;
          longitude: number;
          radius: number; // metros
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        // ... Insert, Update
      };
      alerts: {
        Row: {
          id: string;
          caregiver_id: string;
          loved_one_id: string;
          alert_type: 'safe_zone_breach' | 'low_battery' | 'abnormal_heart_rate' | 'fall_detected' | 'sos_triggered';
          severity: 'low' | 'medium' | 'high';
          title: string;
          message: string;
          metadata: Record<string, any> | null;
          acknowledged_at: string | null;
          created_at: string;
        };
        // ... Insert, Update
      };
      health_metrics: {
        Row: {
          id: string;
          loved_one_id: string;
          heart_rate: number | null;
          steps: number | null;
          calories_burned: number | null;
          sleep_hours: number | null;
          recorded_at: string;
        };
        // ... Insert, Update
      };
      activities: {
        Row: {
          id: string;
          loved_one_id: string;
          activity_type: string;
          description: string;
          metadata: Record<string, any> | null;
          occurred_at: string;
        };
        // ... Insert, Update
      };
      emergency_contacts: {
        Row: {
          id: string;
          caregiver_id: string;
          contact_name: string;
          phone_number: string;
          relationship: string;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        // ... Insert, Update
      };
      caregiver_preferences: {
        Row: {
          id: string;
          caregiver_id: string;
          notifications_enabled: boolean;
          alert_sound_enabled: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          created_at: string;
          updated_at: string;
        };
        // ... Insert, Update
      };
    };
    Functions: {
      check_geofence_breach: {
        Args: { p_loved_one_id: string; p_lat: number; p_lng: number };
        Returns: Array<{ breached_zone_id: string; breached_zone_name: string; distance_meters: number }>;
      };
    };
  };
};
```

### Application-Level Types

Complementam os types do database para UX:

```typescript
// types/app.types.ts

import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Tipo base para Loved One com dados agregados
export interface LovedOneWithStatus {
  // Campos base (de loved_ones table)
  id: string;
  caregiver_id: string;
  device_id: string;
  full_name: string;
  date_of_birth: string;
  medical_conditions: string | null;
  emergency_notes: string | null;

  // Dados agregados de última localização
  lastLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    battery_level: number;
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
  accuracy: number;
  batteryLevel: number;
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
  icon: React.ComponentType;
  color: string; // CSS variable name
  canContactEmergency: boolean;
}
```

---

## Queries Supabase (Contratos Frontend → Backend)

### 1. Dashboard - Listar Loved Ones com Status

**Query**:
```typescript
const { data: lovedOnes, error } = await supabase
  .from('loved_ones')
  .select(`
    *,
    last_location:gps_locations(latitude, longitude, accuracy, battery_level, recorded_at)
      .order(recorded_at.desc)
      .limit(1)
      .single(),
    last_metrics:health_metrics(heart_rate, steps, recorded_at)
      .order(recorded_at.desc)
      .limit(1)
      .single(),
    pending_alerts:alerts(count)
      .is(acknowledged_at, null)
  `)
  .eq('caregiver_id', caregiverId)
  .order('created_at');
```

**Transformação para UI**:
```typescript
const transformedLovedOnes: LovedOneWithStatus[] = lovedOnes.map(lo => ({
  ...lo,
  lastLocation: lo.last_location ? {
    ...lo.last_location,
    isStale: Date.now() - new Date(lo.last_location.recorded_at).getTime() > 30 * 60 * 1000
  } : null,
  lastMetrics: lo.last_metrics,
  safeZoneStatus: { isInSafeZone: true, violatedZones: [] }, // TODO: chamar RPC
  pendingAlertsCount: lo.pending_alerts[0]?.count ?? 0
}));
```

**RLS Policy**: Caregiver só vê seus próprios loved ones

---

### 2. Mapa - Obter Trail de 24h

**Query**:
```typescript
const { data: trail, error } = await supabase
  .from('gps_locations')
  .select('latitude, longitude, accuracy, battery_level, recorded_at')
  .eq('loved_one_id', lovedOneId)
  .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('recorded_at', { ascending: true })
  .limit(50); // Mitigação R-002: limitar pontos
```

**Transformação para MapLibre GeoJSON**:
```typescript
const geoJsonTrail: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: trail.map(p => [p.longitude, p.latitude])
    },
    properties: {
      lovedOneId,
      timestamps: trail.map(p => p.recorded_at)
    }
  }]
};
```

**RLS Policy**: Loved one pertence ao caregiver autenticado

---

### 3. Safe Zones - Listar e Renderizar

**Query**:
```typescript
const { data: safeZones, error } = await supabase
  .from('safe_zones')
  .select('*')
  .eq('loved_one_id', lovedOneId);
```

**Transformação para MapLibre**:
```typescript
const circles: SafeZoneCircle[] = safeZones.map(zone => ({
  id: zone.id,
  center: { lat: zone.latitude, lng: zone.longitude },
  radius: zone.radius,
  name: zone.name,
  isActive: zone.is_active,
  color: zone.is_active ? 'var(--primary)' : 'var(--muted)'
}));
```

---

### 4. Geofencing - Verificar Violações (RPC)

**PostgreSQL Function** (nova migration para feature 002):
```sql
CREATE OR REPLACE FUNCTION check_geofence_breach(
  p_loved_one_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE(
  breached_zone_id UUID,
  breached_zone_name TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sz.id AS breached_zone_id,
    sz.name AS breached_zone_name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography
    ) AS distance_meters
  FROM safe_zones sz
  WHERE sz.loved_one_id = p_loved_one_id
    AND sz.is_active = true
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography,
      sz.radius
    ) = false; -- Retorna zonas onde o ponto está FORA
END;
$$;

COMMENT ON FUNCTION check_geofence_breach IS 'Verifica se coordenadas violam safe zones ativas usando PostGIS';
```

**Chamada no Frontend**:
```typescript
const { data: violations, error } = await supabase.rpc('check_geofence_breach', {
  p_loved_one_id: lovedOneId,
  p_lat: newLocation.latitude,
  p_lng: newLocation.longitude
});

if (violations && violations.length > 0) {
  // Criar alertas para cada violação
  for (const v of violations) {
    await supabase.from('alerts').insert({
      caregiver_id: caregiverId,
      loved_one_id: lovedOneId,
      alert_type: 'safe_zone_breach',
      severity: 'high',
      title: `Zona Segura Violada: ${v.breached_zone_name}`,
      message: `${lovedOneName} saiu da zona "${v.breached_zone_name}" (${v.distance_meters.toFixed(0)}m de distância)`,
      metadata: {
        safe_zone_id: v.breached_zone_id,
        distance_meters: v.distance_meters
      }
    });
  }
}
```

---

### 5. Realtime - Subscribe GPS Updates

**Subscription**:
```typescript
const subscription = supabase
  .channel(`gps:${lovedOneId}`)
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'gps_locations',
      filter: `loved_one_id=eq.${lovedOneId}`
    },
    async (payload) => {
      const newLocation = payload.new as Tables['gps_locations']['Row'];

      // Atualizar estado local
      setCurrentLocation(newLocation);

      // Verificar geofence
      const violations = await checkGeofenceBreach(newLocation);

      // Atualizar mapa
      updateMapMarker(newLocation);
    }
  )
  .subscribe();
```

**RLS Policy**: Subscription respeita RLS (só recebe updates de loved ones do caregiver)

---

### 6. Alertas - Listar e Acknowledge

**Query (pendentes)**:
```typescript
const { data: alerts, error } = await supabase
  .from('alerts')
  .select('*')
  .eq('caregiver_id', caregiverId)
  .is('acknowledged_at', null)
  .order('created_at', { ascending: false });
```

**Acknowledge (update)**:
```typescript
const acknowledgeAlert = async (alertId: string) => {
  const { error } = await supabase
    .from('alerts')
    .update({ acknowledged_at: new Date().toISOString() })
    .eq('id', alertId);
};
```

---

### 7. Health Metrics - Gráficos Recharts

**Query (últimas 24h)**:
```typescript
const { data: metrics, error } = await supabase
  .from('health_metrics')
  .select('heart_rate, steps, sleep_hours, recorded_at')
  .eq('loved_one_id', lovedOneId)
  .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('recorded_at');
```

**Transformação para Recharts**:
```typescript
const heartRateData: HeartRateDataPoint[] = metrics
  .filter(m => m.heart_rate !== null)
  .map(m => ({
    timestamp: m.recorded_at,
    bpm: m.heart_rate!,
    isAbnormal: m.heart_rate! < 40 || m.heart_rate! > 150
  }));

const stepsData: StepsDataPoint[] = metrics
  .filter(m => m.steps !== null)
  .map(m => ({
    timestamp: m.recorded_at,
    steps: m.steps!,
    date: new Date(m.recorded_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
  }));
```

---

### 8. Timeline - Combinar GPS + Activities

**Query (union via RPC ou client-side merge)**:
```typescript
const { data: locations } = await supabase
  .from('gps_locations')
  .select('latitude, longitude, recorded_at')
  .eq('loved_one_id', lovedOneId)
  .gte('recorded_at', startDate)
  .lte('recorded_at', endDate)
  .order('recorded_at', { ascending: false });

const { data: activities } = await supabase
  .from('activities')
  .select('*')
  .eq('loved_one_id', lovedOneId)
  .gte('occurred_at', startDate)
  .lte('occurred_at', endDate)
  .order('occurred_at', { ascending: false });

// Merge client-side
const timeline: TimelineEvent[] = [
  ...locations.map(l => ({
    id: `loc-${l.recorded_at}`,
    type: 'location_change',
    timestamp: l.recorded_at,
    description: `Localização registada`,
    metadata: { latitude: l.latitude, longitude: l.longitude }
  })),
  ...activities.map(a => ({
    id: a.id,
    type: a.activity_type,
    timestamp: a.occurred_at,
    description: a.description,
    metadata: a.metadata
  }))
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
```

---

## Validações e Regras de Negócio

### Client-Side Validations

```typescript
// Validação de criação de safe zone
const validateSafeZone = (zone: Partial<Tables['safe_zones']['Insert']>) => {
  const errors: string[] = [];

  if (!zone.name || zone.name.trim().length === 0) {
    errors.push('Nome da zona é obrigatório');
  }

  if (zone.latitude === undefined || zone.latitude < -90 || zone.latitude > 90) {
    errors.push('Latitude inválida (-90 a 90)');
  }

  if (zone.longitude === undefined || zone.longitude < -180 || zone.longitude > 180) {
    errors.push('Longitude inválida (-180 a 180)');
  }

  if (zone.radius === undefined || zone.radius < 10 || zone.radius > 5000) {
    errors.push('Raio deve estar entre 10m e 5000m');
  }

  return errors;
};

// Validação de contacto de emergência
const validateEmergencyContact = (contact: Partial<Tables['emergency_contacts']['Insert']>) => {
  const errors: string[] = [];

  if (!contact.contact_name || contact.contact_name.trim().length === 0) {
    errors.push('Nome do contacto é obrigatório');
  }

  // Regex PT phone number: +351 ou 9 dígitos
  const phoneRegex = /^(\+351)?9[1236]\d{7}$/;
  if (!contact.phone_number || !phoneRegex.test(contact.phone_number.replace(/\s/g, ''))) {
    errors.push('Número de telefone inválido (formato PT)');
  }

  if (!contact.relationship || contact.relationship.trim().length === 0) {
    errors.push('Relação é obrigatória');
  }

  return errors;
};
```

### Regras de Negócio (Server-Side via RLS + Triggers)

Já implementadas na feature 001:
- **RLS**: Caregiver só acede aos seus loved ones
- **Trigger**: `check_safe_zone_breach()` cria alertas automaticamente
- **Trigger**: `log_activity()` regista mudanças de localização
- **Trigger**: `update_updated_at()` atualiza timestamps

---

## Migrações PostgreSQL Adicionais (Feature 002)

### Migration: 20251109000020_add_geofence_rpc_function.sql

```sql
-- Criar função RPC para geofencing (já documentada acima)
CREATE OR REPLACE FUNCTION check_geofence_breach(...) ...;

-- Criar índice GiST se ainda não existir (otimização PostGIS)
CREATE INDEX IF NOT EXISTS idx_gps_locations_geog
ON gps_locations USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

CREATE INDEX IF NOT EXISTS idx_safe_zones_geog
ON safe_zones USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
```

**Justificação**: Índices GiST permitem queries `ST_DWithin` em <100ms mesmo com milhares de pontos.

---

## Sumário

✅ **Nenhuma tabela nova** - usa schema existente (001-supabase-db-setup)
✅ **Types TypeScript** - gerados via `supabase gen types` + types app-level
✅ **Queries Supabase** - documentadas com transformações UX
✅ **RPC Function** - `check_geofence_breach` para lógica PostGIS
✅ **Validações** - client-side para UX, server-side via RLS/triggers
✅ **Migrações** - apenas 1 migration adicional (RPC function)

**Próximos Passos**:
→ Gerar `contracts/` (endpoints/subscriptions Supabase)
→ Gerar `quickstart.md` (setup dev environment)
