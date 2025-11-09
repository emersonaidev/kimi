# Contratos de API: KIMI Caregiver Monitoring App

**Feature**: 002-caregiver-monitoring-app
**Data**: 2025-11-09
**Base URL**: `https://jkzwrqmbpxptncpdmbew.supabase.co/rest/v1/`
**Anon Key**: (ver `.env.local` ou feature 001 contracts)

## Visão Geral

Esta aplicação frontend consome a API Supabase via:
1. **PostgREST** - REST API auto-gerada do PostgreSQL schema
2. **Supabase Realtime** - WebSocket subscriptions para updates em tempo real
3. **Supabase Auth** - Autenticação via email/password ou OAuth

**Referência Completa**: Ver `specs/001-supabase-db-setup/contracts/README.md` para endpoints base de todas as 11 tabelas.

Este documento **complementa** os contratos existentes com:
- Queries agregadas específicas do frontend
- Subscriptions realtime
- Chamadas RPC para lógica complexa

---

## Autenticação

### Headers Obrigatórios

Todas as requests requerem:

```http
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**JWT Token**: Obtido após login via `supabase.auth.signInWithPassword()` ou OAuth.

**RLS**: Todas as queries respeitam Row Level Security policies - utilizador só acede aos seus dados.

---

## Queries Agregadas (Frontend-Specific)

### 1. Dashboard - Listar Loved Ones com Dados Agregados

**Endpoint**: `GET /loved_ones`

**Query Parameters**:
```http
?select=*,
  last_location:gps_locations(latitude,longitude,accuracy,battery_level,recorded_at).order(recorded_at.desc).limit(1).single(),
  last_metrics:health_metrics(heart_rate,steps,recorded_at).order(recorded_at.desc).limit(1).single(),
  pending_alerts:alerts(count).is(acknowledged_at,null)
&caregiver_id=eq.<CAREGIVER_ID>
&order=created_at
```

**Response** (200 OK):
```json
[
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "caregiver_id": "...",
    "device_id": "KIMI-8472",
    "full_name": "Avó Maria",
    "date_of_birth": "1945-03-15",
    "medical_conditions": "Diabetes Tipo 2, Hipertensão",
    "emergency_notes": "Medicação diária às 8h e 20h",
    "last_location": {
      "latitude": 38.7223,
      "longitude": -9.1393,
      "accuracy": 10.5,
      "battery_level": 85,
      "recorded_at": "2025-11-09T10:30:00Z"
    },
    "last_metrics": {
      "heart_rate": 72,
      "steps": 3450,
      "recorded_at": "2025-11-09T10:00:00Z"
    },
    "pending_alerts": [{ "count": 2 }]
  }
]
```

**Tratamento de Erros**:
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: RLS policy negou acesso (loved one não pertence ao caregiver)

---

### 2. Mapa - Obter Trail de Localizações (24h)

**Endpoint**: `GET /gps_locations`

**Query Parameters**:
```http
?select=latitude,longitude,accuracy,battery_level,recorded_at
&loved_one_id=eq.<LOVED_ONE_ID>
&recorded_at=gte.2025-11-08T10:30:00Z
&order=recorded_at.asc
&limit=50
```

**Response** (200 OK):
```json
[
  {
    "latitude": 38.7223,
    "longitude": -9.1393,
    "accuracy": 10.5,
    "battery_level": 85,
    "recorded_at": "2025-11-09T10:30:00Z"
  },
  {
    "latitude": 38.7300,
    "longitude": -9.1400,
    "accuracy": 12.0,
    "battery_level": 87,
    "recorded_at": "2025-11-09T09:30:00Z"
  }
  // ... até 50 pontos
]
```

**Uso**:
```typescript
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const { data, error } = await supabase
  .from('gps_locations')
  .select('latitude, longitude, accuracy, battery_level, recorded_at')
  .eq('loved_one_id', lovedOneId)
  .gte('recorded_at', twentyFourHoursAgo)
  .order('recorded_at', { ascending: true })
  .limit(50);
```

---

### 3. Safe Zones - Listar por Loved One

**Endpoint**: `GET /safe_zones`

**Query Parameters**:
```http
?select=*
&loved_one_id=eq.<LOVED_ONE_ID>
```

**Response** (200 OK):
```json
[
  {
    "id": "f1e2d3c4-b5a6-4978-8c9d-0e1f2a3b4c5d",
    "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "caregiver_id": "...",
    "name": "Casa",
    "latitude": 38.7223,
    "longitude": -9.1393,
    "radius": 200,
    "is_active": true,
    "created_at": "2025-11-09T08:00:00Z",
    "updated_at": "2025-11-09T08:00:00Z"
  },
  {
    "id": "f2e3d4c5-b6a7-4089-8d9e-0f1e2a3b4c5d",
    "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "caregiver_id": "...",
    "name": "Centro de Dia",
    "latitude": 38.7380,
    "longitude": -9.1424,
    "radius": 150,
    "is_active": true,
    "created_at": "2025-11-09T08:00:00Z",
    "updated_at": "2025-11-09T08:00:00Z"
  }
]
```

---

### 4. Alertas - Listar Pendentes (Não Acknowledged)

**Endpoint**: `GET /alerts`

**Query Parameters**:
```http
?select=*
&caregiver_id=eq.<CAREGIVER_ID>
&acknowledged_at=is.null
&order=created_at.desc
```

**Response** (200 OK):
```json
[
  {
    "id": "alert-123",
    "caregiver_id": "...",
    "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "alert_type": "safe_zone_breach",
    "severity": "high",
    "title": "Zona Segura Violada: Casa",
    "message": "Avó Maria saiu da zona \"Casa\" (250m de distância)",
    "metadata": {
      "safe_zone_id": "f1e2d3c4-b5a6-4978-8c9d-0e1f2a3b4c5d",
      "distance_meters": 250.5
    },
    "acknowledged_at": null,
    "created_at": "2025-11-09T10:35:00Z"
  },
  {
    "id": "alert-456",
    "caregiver_id": "...",
    "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "alert_type": "low_battery",
    "severity": "medium",
    "title": "Bateria Baixa",
    "message": "Bateria do dispositivo em 15%",
    "metadata": {
      "battery_level": 15
    },
    "acknowledged_at": null,
    "created_at": "2025-11-09T10:00:00Z"
  }
]
```

**Acknowledge Alert** (PATCH):
```http
PATCH /alerts?id=eq.alert-123
Content-Type: application/json

{
  "acknowledged_at": "2025-11-09T10:40:00Z"
}
```

**Response** (204 No Content)

---

### 5. Health Metrics - Obter Últimas 24h

**Endpoint**: `GET /health_metrics`

**Query Parameters**:
```http
?select=heart_rate,steps,sleep_hours,recorded_at
&loved_one_id=eq.<LOVED_ONE_ID>
&recorded_at=gte.2025-11-08T10:40:00Z
&order=recorded_at.asc
```

**Response** (200 OK):
```json
[
  {
    "heart_rate": 72,
    "steps": 500,
    "sleep_hours": null,
    "recorded_at": "2025-11-09T09:00:00Z"
  },
  {
    "heart_rate": 75,
    "steps": 1200,
    "sleep_hours": null,
    "recorded_at": "2025-11-09T10:00:00Z"
  },
  {
    "heart_rate": 68,
    "steps": 1800,
    "sleep_hours": 7.5,
    "recorded_at": "2025-11-09T08:00:00Z"
  }
]
```

---

### 6. Timeline - Combinar GPS + Activities

**Abordagem**: Fazer 2 queries separadas e merge client-side (mais performático que SQL UNION).

**Query 1 - GPS Locations**:
```http
GET /gps_locations?select=latitude,longitude,recorded_at
  &loved_one_id=eq.<LOVED_ONE_ID>
  &recorded_at=gte.<START_DATE>
  &recorded_at=lte.<END_DATE>
  &order=recorded_at.desc
  &limit=100
```

**Query 2 - Activities**:
```http
GET /activities?select=*
  &loved_one_id=eq.<LOVED_ONE_ID>
  &occurred_at=gte.<START_DATE>
  &occurred_at=lte.<END_DATE>
  &order=occurred_at.desc
  &limit=100
```

**Merge Client-Side**:
```typescript
const timeline = [
  ...gpsData.map(g => ({
    type: 'location',
    timestamp: g.recorded_at,
    data: g
  })),
  ...activitiesData.map(a => ({
    type: 'activity',
    timestamp: a.occurred_at,
    data: a
  }))
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
```

---

## RPC Functions (Lógica Complexa no Servidor)

### check_geofence_breach - Verificar Violações de Safe Zone

**Endpoint**: `POST /rpc/check_geofence_breach`

**Request Body**:
```json
{
  "p_loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "p_lat": 38.7500,
  "p_lng": -9.1600
}
```

**Response** (200 OK):
```json
[
  {
    "breached_zone_id": "f1e2d3c4-b5a6-4978-8c9d-0e1f2a3b4c5d",
    "breached_zone_name": "Casa",
    "distance_meters": 250.5
  }
]
```

**Response (sem violações)**: `[]`

**Uso**:
```typescript
const { data: violations, error } = await supabase.rpc('check_geofence_breach', {
  p_loved_one_id: lovedOneId,
  p_lat: 38.7500,
  p_lng: -9.1600
});

if (violations && violations.length > 0) {
  // Criar alertas
}
```

**Tratamento de Erros**:
- `400 Bad Request`: Parâmetros inválidos (lat/lng fora de range)
- `404 Not Found`: Função RPC não existe (migration não executada)
- `500 Internal Server Error`: Erro PostGIS (ex: geometria inválida)

---

## Supabase Realtime (WebSocket Subscriptions)

### GPS Locations - Subscribe para Updates em Tempo Real

**Channel**: `gps:{loved_one_id}`

**Subscription**:
```typescript
const channel = supabase
  .channel(`gps:${lovedOneId}`)
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'gps_locations',
      filter: `loved_one_id=eq.${lovedOneId}`
    },
    (payload) => {
      const newLocation = payload.new;
      console.log('Nova localização:', newLocation);
      // Atualizar estado React
      setCurrentLocation(newLocation);
      // Atualizar mapa
      updateMapMarker(newLocation);
    }
  )
  .subscribe();
```

**Payload Example**:
```json
{
  "type": "INSERT",
  "table": "gps_locations",
  "schema": "public",
  "new": {
    "id": "uuid-...",
    "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "latitude": 38.7223,
    "longitude": -9.1393,
    "accuracy": 10.5,
    "battery_level": 85,
    "recorded_at": "2025-11-09T10:45:00Z"
  },
  "old": null
}
```

**Cleanup**:
```typescript
useEffect(() => {
  // Subscribe
  const channel = supabase.channel(...).subscribe();

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, [lovedOneId]);
```

---

### Alerts - Subscribe para Novos Alertas

**Channel**: `alerts:{caregiver_id}`

**Subscription**:
```typescript
const channel = supabase
  .channel(`alerts:${caregiverId}`)
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'alerts',
      filter: `caregiver_id=eq.${caregiverId}`
    },
    (payload) => {
      const newAlert = payload.new;
      // Mostrar notificação
      showNotification(newAlert);
      // Atualizar badge
      setUnreadCount(prev => prev + 1);
      // Adicionar à lista
      setAlerts(prev => [newAlert, ...prev]);
    }
  )
  .subscribe();
```

---

### Safe Zones - Subscribe para Mudanças

**Channel**: `safe_zones:{loved_one_id}`

**Subscription**:
```typescript
const channel = supabase
  .channel(`safe_zones:${lovedOneId}`)
  .on('postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'safe_zones',
      filter: `loved_one_id=eq.${lovedOneId}`
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        // Adicionar círculo no mapa
        addSafeZoneCircle(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        // Atualizar círculo
        updateSafeZoneCircle(payload.new);
      } else if (payload.eventType === 'DELETE') {
        // Remover círculo
        removeSafeZoneCircle(payload.old.id);
      }
    }
  )
  .subscribe();
```

---

## Mutation Operations (Create, Update, Delete)

### Criar Safe Zone

**Endpoint**: `POST /safe_zones`

**Request Body**:
```json
{
  "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "caregiver_id": "...",
  "name": "Supermercado",
  "latitude": 38.7400,
  "longitude": -9.1500,
  "radius": 100,
  "is_active": true
}
```

**Response** (201 Created):
```json
{
  "id": "f4e5d6c7-b8a9-4012-8f9e-0g1h2i3j4k5l",
  "loved_one_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "caregiver_id": "...",
  "name": "Supermercado",
  "latitude": 38.7400,
  "longitude": -9.1500,
  "radius": 100,
  "is_active": true,
  "created_at": "2025-11-09T11:00:00Z",
  "updated_at": "2025-11-09T11:00:00Z"
}
```

**Validações** (client-side antes de POST):
- `name`: não vazio
- `latitude`: -90 a 90
- `longitude`: -180 a 180
- `radius`: 10 a 5000 metros

---

### Ativar/Desativar Safe Zone

**Endpoint**: `PATCH /safe_zones?id=eq.<SAFE_ZONE_ID>`

**Request Body**:
```json
{
  "is_active": false
}
```

**Response** (204 No Content)

---

### Adicionar Emergency Contact

**Endpoint**: `POST /emergency_contacts`

**Request Body**:
```json
{
  "caregiver_id": "...",
  "contact_name": "Dr. João Silva",
  "phone_number": "+351912345678",
  "relationship": "Médico de Família",
  "priority": 1
}
```

**Response** (201 Created)

**Validações** (client-side):
- `phone_number`: regex `/^(\+351)?9[1236]\d{7}$/`

---

### Atualizar Caregiver Preferences

**Endpoint**: `PATCH /caregiver_preferences?caregiver_id=eq.<CAREGIVER_ID>`

**Request Body**:
```json
{
  "notifications_enabled": true,
  "alert_sound_enabled": false,
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00"
}
```

**Response** (204 No Content)

---

## Rate Limits e Quotas

**Supabase Free Tier**:
- Realtime: 200 concurrent connections
- API Requests: 50,000/month
- Database: 500 MB storage
- Bandwidth: 2 GB egress

**Recomendações**:
- Limitar subscriptions ativas (max 3-5 channels simultâneos)
- Usar pagination em queries grandes (`limit` + `offset`)
- Cache client-side para reduzir requests repetidas

---

## Tratamento de Erros Global

### HTTP Status Codes

| Code | Significado | Ação Recomendada |
|------|-------------|-------------------|
| 200 OK | Sucesso (GET, RPC) | Processar dados |
| 201 Created | Recurso criado (POST) | Redirecionar ou mostrar sucesso |
| 204 No Content | Sucesso sem body (PATCH, DELETE) | Atualizar UI local |
| 400 Bad Request | Validação falhou | Mostrar erros de validação |
| 401 Unauthorized | Token inválido/expirado | Redirect para login |
| 403 Forbidden | RLS policy negou acesso | Mostrar "Sem permissão" |
| 404 Not Found | Recurso não existe | Redirect para 404 page |
| 409 Conflict | Violação de constraint (ex: device_id duplicado) | Mostrar erro específico |
| 500 Internal Server Error | Erro servidor/DB | Mostrar "Erro interno, tente novamente" |

### Error Response Format

```json
{
  "message": "duplicate key value violates unique constraint \"loved_ones_device_id_key\"",
  "details": "Key (device_id)=(KIMI-8472) already exists.",
  "hint": null,
  "code": "23505"
}
```

**Uso no Frontend**:
```typescript
try {
  const { data, error } = await supabase.from(...).insert(...);

  if (error) {
    if (error.code === '23505') {
      // Conflict - device_id já existe
      toast.error('Este ID de dispositivo já está registado');
    } else if (error.code === 'PGRST301') {
      // RLS policy violation
      toast.error('Não tem permissão para aceder a este recurso');
    } else {
      toast.error('Erro ao guardar: ' + error.message);
    }
    return;
  }

  toast.success('Guardado com sucesso!');
} catch (err) {
  // Network error ou timeout
  toast.error('Erro de conexão. Verifique a sua internet.');
}
```

---

## Sumário

✅ **11 Endpoints REST** - via PostgREST (CRUD completo)
✅ **Queries Agregadas** - 6 queries frontend-specific documentadas
✅ **1 RPC Function** - `check_geofence_breach` para geospatial logic
✅ **3 Realtime Channels** - GPS, Alerts, Safe Zones
✅ **Mutation Ops** - Create, Update, Delete documentados
✅ **Error Handling** - Status codes e error format
✅ **Rate Limits** - Documentados com mitigações

**Próximos Passos**:
→ Gerar `quickstart.md` (como configurar ambiente dev)
→ Atualizar `plan.md` com contexto técnico completo
