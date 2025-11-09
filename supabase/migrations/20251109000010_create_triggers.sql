-- Migration: Create Database Triggers
-- Feature: 001-supabase-db-setup
-- User Story: US4 - Automated Logic via Triggers
-- Dependencies: 20251109000009_create_functions.sql

-- ============================================================
-- NOTA: Trigger on_auth_user_created (auth.users) deve ser criado via Supabase Dashboard
-- devido a permissões especiais no schema auth
-- Dashboard > Database > Triggers > Create Trigger:
--   Table: auth.users
--   Events: Insert
--   Function: handle_new_user()
-- ============================================================

-- ============================================================
-- TRIGGER: update_caregivers_updated_at
-- Description: Auto-atualiza updated_at em caregivers
-- ============================================================
CREATE TRIGGER update_caregivers_updated_at
    BEFORE UPDATE ON caregivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: update_loved_ones_updated_at
-- Description: Auto-atualiza updated_at em loved_ones
-- ============================================================
CREATE TRIGGER update_loved_ones_updated_at
    BEFORE UPDATE ON loved_ones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: update_safe_zones_updated_at
-- Description: Auto-atualiza updated_at em safe_zones
-- ============================================================
CREATE TRIGGER update_safe_zones_updated_at
    BEFORE UPDATE ON safe_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: update_emergency_contacts_updated_at
-- Description: Auto-atualiza updated_at em emergency_contacts
-- ============================================================
CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: update_caregiver_preferences_updated_at
-- Description: Auto-atualiza updated_at em caregiver_preferences
-- ============================================================
CREATE TRIGGER update_caregiver_preferences_updated_at
    BEFORE UPDATE ON caregiver_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: on_gps_location_inserted
-- Description: Verifica safe zone breach após GPS insert
-- ============================================================
CREATE TRIGGER on_gps_location_inserted
    AFTER INSERT ON gps_locations
    FOR EACH ROW
    EXECUTE FUNCTION check_safe_zone_breach();

COMMENT ON TRIGGER on_gps_location_inserted ON gps_locations IS 'Detecta violação de safe zones via PostGIS';

-- ============================================================
-- TRIGGER: on_gps_location_log_activity
-- Description: Loga GPS changes como activities
-- ============================================================
CREATE TRIGGER on_gps_location_log_activity
    AFTER INSERT ON gps_locations
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

COMMENT ON TRIGGER on_gps_location_log_activity ON gps_locations IS 'Auto-loga mudanças de localização em activities timeline';

-- ============================================================
-- TRIGGERS SUMMARY
-- ============================================================
-- Total: 8 triggers criados via migration
-- - 6x update_*_updated_at (auto-update timestamps)
-- - 1x on_gps_location_inserted (safe zone breach detection)
-- - 1x on_gps_location_log_activity (activity logging)
--
-- MANUAL (via Dashboard): on_auth_user_created em auth.users
