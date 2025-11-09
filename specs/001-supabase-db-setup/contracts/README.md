# API Contracts - KIMI Database

**Feature**: 001-supabase-db-setup
**Data**: 2025-11-09

## Overview

Supabase auto-generates REST API endpoints para todas as tabelas. Não é necessário criar API controllers manualmente.

## Base URL

```
KIMI-DEV: https://[project-id].supabase.co/rest/v1/
KIMI-PROD: https://[project-id].supabase.co/rest/v1/
```

## Authentication

Todas as requests requerem header:
```
Authorization: Bearer <user-jwt-token>
apikey: <anon-key>
```

RLS policies enforçam automaticamente acesso baseado em `auth.uid()`.

## Auto-Generated Endpoints

### Caregivers
- `GET /caregivers` - List (filtered by RLS)
- `GET /caregivers?select=*&user_id=eq.{id}` - Get by user_id
- `PATCH /caregivers?id=eq.{id}` - Update profile

### Loved Ones
- `GET /loved_ones` - List (filtered by RLS)
- `GET /loved_ones?select=*,caregivers(*)` - With caregiver
- `POST /loved_ones` - Create
- `PATCH /loved_ones?id=eq.{id}` - Update
- `DELETE /loved_ones?id=eq.{id}` - Delete

### GPS Locations
- `GET /gps_locations?loved_one_id=eq.{id}&order=recorded_at.desc&limit=1` - Latest location
- `GET /gps_locations?loved_one_id=eq.{id}&order=recorded_at.desc&limit=100` - History
- `POST /gps_locations` - Insert (service role only)

### Health Metrics
- `GET /health_metrics?loved_one_id=eq.{id}&order=recorded_at.desc&limit=1` - Latest
- `GET /health_metrics?loved_one_id=eq.{id}&order=recorded_at.desc&limit=24` - Last 24h
- `POST /health_metrics` - Insert (service role only)

### Safe Zones
- `GET /safe_zones?loved_one_id=eq.{id}&is_active=eq.true` - Active zones
- `POST /safe_zones` - Create
- `PATCH /safe_zones?id=eq.{id}` - Update
- `DELETE /safe_zones?id=eq.{id}` - Delete

### Activities
- `GET /activities?loved_one_id=eq.{id}&order=occurred_at.desc&limit=50` - Timeline
- `GET /activities?loved_one_id=eq.{id}&occurred_at=gte.{date}` - Since date

### Alerts
- `GET /alerts?caregiver_id=eq.{id}&is_read=eq.false` - Unread
- `PATCH /alerts?id=eq.{id}` - Mark as read/acknowledged

### Chat Messages
- `GET /chat_messages?caregiver_id=eq.{id}&order=sent_at.asc` - Conversation
- `POST /chat_messages` - Send message

### Emergency Contacts
- `GET /emergency_contacts?caregiver_id=eq.{id}&order=priority.desc` - By priority
- `POST /emergency_contacts` - Create
- `PATCH /emergency_contacts?id=eq.{id}` - Update
- `DELETE /emergency_contacts?id=eq.{id}` - Delete

### Preferences
- `GET /caregiver_preferences?caregiver_id=eq.{id}` - Get
- `PATCH /caregiver_preferences?caregiver_id=eq.{id}` - Update

### Location Shares
- `GET /location_shares?caregiver_id=eq.{id}&is_active=eq.true` - Active shares
- `POST /location_shares` - Create share link
- `PATCH /location_shares?id=eq.{id}` - Deactivate

## Realtime Subscriptions

Frontend subscreve via Supabase Realtime:

```typescript
// GPS location updates
supabase
  .channel('gps-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'gps_locations', filter: `loved_one_id=eq.${lovedOneId}` },
    (payload) => console.log('New location:', payload)
  )
  .subscribe()

// New alerts
supabase
  .channel('alert-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'alerts', filter: `caregiver_id=eq.${caregiverId}` },
    (payload) => console.log('New alert:', payload)
  )
  .subscribe()
```

## TypeScript Types

Gerados automaticamente via:
```bash
supabase gen types typescript --project-id [project-id] > shared/types/database.types.ts
```

## Service Role Operations

Wearable devices usam service role key (bypasses RLS) para inserir dados:

```typescript
// GPS insertion from device
const { data, error } = await supabaseServiceRole
  .from('gps_locations')
  .insert({
    loved_one_id: deviceConfig.loved_one_id,
    latitude: gpsData.lat,
    longitude: gpsData.lon,
    battery_level: deviceData.battery
  })
```

## Testing

Use Postman collection ou curl:

```bash
# Get loved ones
curl -X GET 'https://[project-id].supabase.co/rest/v1/loved_ones' \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [jwt-token]"

# Create safe zone
curl -X POST 'https://[project-id].supabase.co/rest/v1/safe_zones' \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [jwt-token]" \
  -H "Content-Type: application/json" \
  -d '{"loved_one_id":"...", "caregiver_id":"...", "name":"Home", "latitude":38.7223, "longitude":-9.1393, "radius":200}'
```
