-- Migration: Create Data Tables (gps_locations, health_metrics)
-- Feature: 001-supabase-db-setup
-- User Story: US1 - Database Schema Creation
-- Dependencies: 20251109000002_create_core_tables.sql

-- ============================================================
-- Table: gps_locations
-- Description: Histórico de localizações GPS do wearable
-- ============================================================
CREATE TABLE IF NOT EXISTS gps_locations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_level INTEGER,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT gps_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT gps_longitude_range CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT gps_battery_range CHECK (battery_level >= 0 AND battery_level <= 100)
);

COMMENT ON TABLE gps_locations IS 'Histórico de localizações GPS reportadas pelos wearables';
COMMENT ON COLUMN gps_locations.accuracy IS 'Precisão da leitura GPS em metros';
COMMENT ON COLUMN gps_locations.battery_level IS 'Nível de bateria do wearable (0-100%)';
COMMENT ON COLUMN gps_locations.recorded_at IS 'Timestamp da leitura GPS (pode diferir de created_at se offline)';

-- ============================================================
-- Table: health_metrics
-- Description: Métricas de saúde do ente querido (heart rate, steps, etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    heart_rate INTEGER,
    steps INTEGER,
    calories_burned INTEGER,
    sleep_hours DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT health_heart_rate_range CHECK (heart_rate > 0 AND heart_rate < 300),
    CONSTRAINT health_steps_positive CHECK (steps >= 0),
    CONSTRAINT health_calories_positive CHECK (calories_burned >= 0),
    CONSTRAINT health_sleep_range CHECK (sleep_hours >= 0 AND sleep_hours <= 24)
);

COMMENT ON TABLE health_metrics IS 'Métricas de saúde coletadas pelos wearables';
COMMENT ON COLUMN health_metrics.heart_rate IS 'Batimentos por minuto';
COMMENT ON COLUMN health_metrics.steps IS 'Passos registados no período';
COMMENT ON COLUMN health_metrics.sleep_hours IS 'Horas de sono detectadas pelo wearable';
