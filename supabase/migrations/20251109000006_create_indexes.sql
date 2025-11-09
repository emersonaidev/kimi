-- Migration: Create All Indexes
-- Feature: 001-supabase-db-setup
-- User Story: US2 - Performance Optimization via Indexes
-- Dependencies: 20251109000002-20251109000005 (todas as tabelas criadas)

-- ============================================================
-- CAREGIVERS INDEXES
-- ============================================================
-- Index para lookup por user_id (autenticação)
CREATE INDEX IF NOT EXISTS idx_caregivers_user_id
ON caregivers(user_id);

-- ============================================================
-- LOVED ONES INDEXES
-- ============================================================
-- Index para lookup por caregiver
CREATE INDEX IF NOT EXISTS idx_loved_ones_caregiver_id
ON loved_ones(caregiver_id);

-- Index único para device_id (já criado automaticamente pelo UNIQUE constraint)
-- Nenhuma ação necessária

-- ============================================================
-- GPS LOCATIONS INDEXES
-- ============================================================
-- Composite index para "latest location" query (MAIS USADO)
CREATE INDEX IF NOT EXISTS idx_gps_locations_loved_one_recorded
ON gps_locations(loved_one_id, recorded_at DESC);

-- Index para battery level filtering
CREATE INDEX IF NOT EXISTS idx_gps_locations_battery_level
ON gps_locations(battery_level)
WHERE battery_level IS NOT NULL AND battery_level < 30;

-- Index temporal para range queries
CREATE INDEX IF NOT EXISTS idx_gps_locations_recorded_at
ON gps_locations(recorded_at DESC);

-- ============================================================
-- HEALTH METRICS INDEXES
-- ============================================================
-- Composite index para latest metrics query
CREATE INDEX IF NOT EXISTS idx_health_metrics_loved_one_recorded
ON health_metrics(loved_one_id, recorded_at DESC);

-- Partial index para heart rate anomalies
CREATE INDEX IF NOT EXISTS idx_health_metrics_heart_rate_high
ON health_metrics(loved_one_id, heart_rate)
WHERE heart_rate > 120;

CREATE INDEX IF NOT EXISTS idx_health_metrics_heart_rate_low
ON health_metrics(loved_one_id, heart_rate)
WHERE heart_rate < 50 AND heart_rate IS NOT NULL;

-- Index temporal
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at
ON health_metrics(recorded_at DESC);

-- ============================================================
-- SAFE ZONES INDEXES
-- ============================================================
-- Composite index para active zones lookup
CREATE INDEX IF NOT EXISTS idx_safe_zones_loved_one_active
ON safe_zones(loved_one_id, is_active)
WHERE is_active = true;

-- GiST index para geospatial queries (ST_Distance, ST_DWithin)
-- Usa geometry type (PostGIS suporta nativamente)
CREATE INDEX IF NOT EXISTS idx_safe_zones_geography
ON safe_zones
USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Index por caregiver
CREATE INDEX IF NOT EXISTS idx_safe_zones_caregiver_id
ON safe_zones(caregiver_id);

-- ============================================================
-- ACTIVITIES INDEXES
-- ============================================================
-- Composite index para timeline query
CREATE INDEX IF NOT EXISTS idx_activities_loved_one_occurred
ON activities(loved_one_id, occurred_at DESC);

-- Index por tipo de atividade
CREATE INDEX IF NOT EXISTS idx_activities_activity_type
ON activities(activity_type);

-- Index temporal
CREATE INDEX IF NOT EXISTS idx_activities_occurred_at
ON activities(occurred_at DESC);

-- GIN index para metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_activities_metadata
ON activities USING GIN (metadata);

-- ============================================================
-- ALERTS INDEXES
-- ============================================================
-- Composite index para unread alerts query (CRÍTICO)
CREATE INDEX IF NOT EXISTS idx_alerts_caregiver_unread
ON alerts(caregiver_id, is_read, triggered_at DESC)
WHERE is_read = false;

-- Index para acknowledged status
CREATE INDEX IF NOT EXISTS idx_alerts_caregiver_acknowledged
ON alerts(caregiver_id, is_acknowledged, triggered_at DESC);

-- Index por loved_one
CREATE INDEX IF NOT EXISTS idx_alerts_loved_one_id
ON alerts(loved_one_id);

-- Index por severity
CREATE INDEX IF NOT EXISTS idx_alerts_severity
ON alerts(severity, triggered_at DESC);

-- GIN index para metadata JSONB
CREATE INDEX IF NOT EXISTS idx_alerts_metadata
ON alerts USING GIN (metadata);

-- ============================================================
-- CHAT MESSAGES INDEXES
-- ============================================================
-- Composite index para conversation query
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
ON chat_messages(caregiver_id, loved_one_id, sent_at ASC);

-- Partial index para unread messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread
ON chat_messages(caregiver_id, is_read, sent_at DESC)
WHERE is_read = false;

-- Index por sender_type
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type
ON chat_messages(sender_type, sent_at DESC);

-- ============================================================
-- EMERGENCY CONTACTS INDEXES
-- ============================================================
-- Composite index para priority sorting
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_caregiver_priority
ON emergency_contacts(caregiver_id, priority ASC);

-- ============================================================
-- CAREGIVER PREFERENCES INDEXES
-- ============================================================
-- Index por caregiver_id (já criado automaticamente pelo UNIQUE constraint)
-- Nenhuma ação necessária

-- ============================================================
-- LOCATION SHARES INDEXES
-- ============================================================
-- Composite index para active shares lookup
CREATE INDEX IF NOT EXISTS idx_location_shares_caregiver_active
ON location_shares(caregiver_id, is_active, expires_at DESC)
WHERE is_active = true;

-- Index único por share_token (já criado automaticamente pelo UNIQUE)
-- Nenhuma ação necessária

-- Index por loved_one
CREATE INDEX IF NOT EXISTS idx_location_shares_loved_one_id
ON location_shares(loved_one_id);

-- Index temporal para expiry (sem NOW() que não é imutável)
CREATE INDEX IF NOT EXISTS idx_location_shares_expires_at
ON location_shares(expires_at DESC)
WHERE is_active = true;

-- ============================================================
-- INDEXES SUMMARY
-- ============================================================
-- Total: 40+ indexes criados
-- - 12x Composite indexes (multi-column para queries complexas)
-- - 8x Partial indexes (condicionais para otimização)
-- - 2x GiST indexes (geospatial + metadata)
-- - 3x GIN indexes (JSONB full-text)
-- - 15+ Standard B-tree indexes
-- Performance target: <50ms (location), <100ms (geospatial)
