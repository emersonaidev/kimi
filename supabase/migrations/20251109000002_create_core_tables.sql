-- Migration: Create Core Tables (caregivers, loved_ones)
-- Feature: 001-supabase-db-setup
-- User Story: US1 - Database Schema Creation
-- Dependencies: 20251109000001_enable_extensions.sql

-- ============================================================
-- Table: caregivers
-- Description: Perfis de cuidadores com link para Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS caregivers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE caregivers IS 'Perfis de cuidadores vinculados a Supabase Auth users';
COMMENT ON COLUMN caregivers.user_id IS 'Foreign key para auth.users - garante 1:1 relationship';
COMMENT ON COLUMN caregivers.updated_at IS 'Atualizado automaticamente via trigger update_updated_at';

-- ============================================================
-- Table: loved_ones
-- Description: Perfis de entes queridos (idosos/doentes) monitorados
-- ============================================================
CREATE TABLE IF NOT EXISTS loved_ones (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    device_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    medical_conditions TEXT,
    emergency_notes TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT loved_ones_device_id_format CHECK (device_id ~ '^KIMI-[0-9]{4,6}$')
);

COMMENT ON TABLE loved_ones IS 'Entes queridos monitorados via wearable devices';
COMMENT ON COLUMN loved_ones.device_id IS 'ID único do wearable (formato: KIMI-XXXX)';
COMMENT ON COLUMN loved_ones.medical_conditions IS 'Condições médicas relevantes para monitorização';
COMMENT ON COLUMN loved_ones.emergency_notes IS 'Notas críticas para situações de emergência';
COMMENT ON CONSTRAINT loved_ones_device_id_format ON loved_ones IS 'Valida formato KIMI-XXXX do device ID';
