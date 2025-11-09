-- Migration: Create Support Tables (chat_messages, emergency_contacts, preferences, location_shares)
-- Feature: 001-supabase-db-setup
-- User Story: US1 - Database Schema Creation
-- Dependencies: 20251109000002_create_core_tables.sql

-- ============================================================
-- Table: chat_messages
-- Description: Mensagens de chat entre caregiver e ente querido
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chat_sender_type_valid CHECK (sender_type IN ('caregiver', 'loved_one'))
);

COMMENT ON TABLE chat_messages IS 'Sistema de mensagens entre caregiver e ente querido';
COMMENT ON COLUMN chat_messages.sender_type IS 'Quem enviou: caregiver ou loved_one';

-- ============================================================
-- Table: emergency_contacts
-- Description: Contactos de emergência do caregiver
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT emergency_priority_range CHECK (priority >= 1 AND priority <= 10)
);

COMMENT ON TABLE emergency_contacts IS 'Lista de contactos de emergência priorizados';
COMMENT ON COLUMN emergency_contacts.priority IS 'Ordem de contacto (1 = mais prioritário)';

-- ============================================================
-- Table: caregiver_preferences
-- Description: Preferências e configurações do caregiver
-- ============================================================
CREATE TABLE IF NOT EXISTS caregiver_preferences (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID UNIQUE NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    notification_email BOOLEAN NOT NULL DEFAULT true,
    notification_push BOOLEAN NOT NULL DEFAULT true,
    notification_sms BOOLEAN NOT NULL DEFAULT false,
    alert_threshold_low_battery INTEGER NOT NULL DEFAULT 20,
    alert_threshold_heart_rate_high INTEGER NOT NULL DEFAULT 120,
    alert_threshold_heart_rate_low INTEGER NOT NULL DEFAULT 50,
    language TEXT NOT NULL DEFAULT 'pt',
    timezone TEXT NOT NULL DEFAULT 'Europe/Lisbon',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT prefs_battery_range CHECK (alert_threshold_low_battery >= 0 AND alert_threshold_low_battery <= 100),
    CONSTRAINT prefs_hr_high_range CHECK (alert_threshold_heart_rate_high > 0 AND alert_threshold_heart_rate_high < 300),
    CONSTRAINT prefs_hr_low_range CHECK (alert_threshold_heart_rate_low > 0 AND alert_threshold_heart_rate_low < 300)
);

COMMENT ON TABLE caregiver_preferences IS 'Configurações personalizadas do caregiver';
COMMENT ON COLUMN caregiver_preferences.alert_threshold_low_battery IS 'Percentagem para alerta de bateria baixa';

-- ============================================================
-- Table: location_shares
-- Description: Links temporários para partilha de localização com terceiros
-- ============================================================
CREATE TABLE IF NOT EXISTS location_shares (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    recipient_name TEXT,
    recipient_phone TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT location_share_expiry_future CHECK (expires_at > created_at)
);

COMMENT ON TABLE location_shares IS 'Sistema de partilha temporária de localização via links seguros';
COMMENT ON COLUMN location_shares.share_token IS 'Token único para URL pública de partilha';
COMMENT ON COLUMN location_shares.expires_at IS 'Data/hora de expiração do link';
