-- Migration: Enable RLS on All Tables
-- Feature: 001-supabase-db-setup
-- User Story: US3 - Row Level Security & GDPR Compliance
-- Dependencies: 20251109000002-20251109000005 (tabelas)

-- ============================================================
-- ENABLE RLS (MANDATORY GDPR COMPLIANCE)
-- ============================================================

ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loved_ones ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Todas as 11 tabelas devem ter rls_enabled = TRUE
-- Verificar via: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
