-- Migration: Create Feature Tables (safe_zones, activities, alerts)
-- Feature: 001-supabase-db-setup
-- User Story: US1 - Database Schema Creation
-- Dependencies: 20251109000002_create_core_tables.sql

-- ============================================================
-- Table: safe_zones
-- Description: Zonas seguras geofenced definidas pelo caregiver
-- ============================================================
CREATE TABLE IF NOT EXISTS safe_zones (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT safe_zone_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT safe_zone_longitude_range CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT safe_zone_radius_positive CHECK (radius > 0)
);

COMMENT ON TABLE safe_zones IS 'Zonas geográficas seguras com alertas de entrada/saída';
COMMENT ON COLUMN safe_zones.radius IS 'Raio da zona segura em metros';
COMMENT ON COLUMN safe_zones.is_active IS 'Se false, zona não gera alertas';

-- ============================================================
-- Table: activities
-- Description: Timeline de atividades do ente querido
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT activity_type_valid CHECK (activity_type IN (
        'movement', 'rest', 'exercise', 'meal', 'medication',
        'social', 'alert', 'location_change', 'other'
    ))
);

COMMENT ON TABLE activities IS 'Timeline de atividades detectadas ou registadas manualmente';
COMMENT ON COLUMN activities.metadata IS 'Dados adicionais específicos do tipo de atividade (JSONB)';

-- ============================================================
-- Table: alerts
-- Description: Alertas gerados automaticamente ou manualmente
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT alert_type_valid CHECK (alert_type IN (
        'safe_zone_breach', 'low_battery', 'fall_detected',
        'heart_rate_anomaly', 'inactivity', 'sos', 'other'
    )),
    CONSTRAINT alert_severity_valid CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

COMMENT ON TABLE alerts IS 'Sistema de alertas para caregivers';
COMMENT ON COLUMN alerts.severity IS 'Níveis: low, medium, high, critical';
COMMENT ON COLUMN alerts.is_acknowledged IS 'Se o caregiver tomou ação sobre o alerta';
