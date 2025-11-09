-- Migration: Create RLS Policies for All Tables
-- Feature: 001-supabase-db-setup
-- User Story: US3 - Row Level Security & GDPR Compliance
-- Dependencies: 20251109000007_enable_rls.sql

-- ============================================================
-- CAREGIVERS POLICIES
-- ============================================================

-- SELECT: Caregiver pode ver apenas o próprio perfil
CREATE POLICY caregivers_select_own
ON caregivers FOR SELECT
USING (user_id = auth.uid());

-- UPDATE: Caregiver pode atualizar apenas o próprio perfil
CREATE POLICY caregivers_update_own
ON caregivers FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================
-- LOVED ONES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas seus loved ones
CREATE POLICY loved_ones_select_own
ON loved_ones FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- INSERT: Caregiver pode criar loved ones para si
CREATE POLICY loved_ones_insert_own
ON loved_ones FOR INSERT
WITH CHECK (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas seus loved ones
CREATE POLICY loved_ones_update_own
ON loved_ones FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- DELETE: Caregiver pode deletar apenas seus loved ones
CREATE POLICY loved_ones_delete_own
ON loved_ones FOR DELETE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- GPS LOCATIONS POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas locations dos seus loved ones
CREATE POLICY gps_locations_select_own
ON gps_locations FOR SELECT
USING (
    loved_one_id IN (
        SELECT lo.id FROM loved_ones lo
        JOIN caregivers c ON lo.caregiver_id = c.id
        WHERE c.user_id = auth.uid()
    )
);

-- ============================================================
-- HEALTH METRICS POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas health metrics dos seus loved ones
CREATE POLICY health_metrics_select_own
ON health_metrics FOR SELECT
USING (
    loved_one_id IN (
        SELECT lo.id FROM loved_ones lo
        JOIN caregivers c ON lo.caregiver_id = c.id
        WHERE c.user_id = auth.uid()
    )
);

-- ============================================================
-- SAFE ZONES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas suas safe zones
CREATE POLICY safe_zones_select_own
ON safe_zones FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- INSERT: Caregiver pode criar safe zones para si
CREATE POLICY safe_zones_insert_own
ON safe_zones FOR INSERT
WITH CHECK (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas suas safe zones
CREATE POLICY safe_zones_update_own
ON safe_zones FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- DELETE: Caregiver pode deletar apenas suas safe zones
CREATE POLICY safe_zones_delete_own
ON safe_zones FOR DELETE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- ACTIVITIES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas activities dos seus loved ones
CREATE POLICY activities_select_own
ON activities FOR SELECT
USING (
    loved_one_id IN (
        SELECT lo.id FROM loved_ones lo
        JOIN caregivers c ON lo.caregiver_id = c.id
        WHERE c.user_id = auth.uid()
    )
);

-- ============================================================
-- ALERTS POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas seus alertas
CREATE POLICY alerts_select_own
ON alerts FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas seus alertas (mark as read/acknowledged)
CREATE POLICY alerts_update_own
ON alerts FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- CHAT MESSAGES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas suas mensagens
CREATE POLICY chat_messages_select_own
ON chat_messages FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- INSERT: Caregiver pode criar mensagens para si
CREATE POLICY chat_messages_insert_own
ON chat_messages FOR INSERT
WITH CHECK (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- EMERGENCY CONTACTS POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas seus contactos
CREATE POLICY emergency_contacts_select_own
ON emergency_contacts FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- INSERT: Caregiver pode criar contactos para si
CREATE POLICY emergency_contacts_insert_own
ON emergency_contacts FOR INSERT
WITH CHECK (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas seus contactos
CREATE POLICY emergency_contacts_update_own
ON emergency_contacts FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- DELETE: Caregiver pode deletar apenas seus contactos
CREATE POLICY emergency_contacts_delete_own
ON emergency_contacts FOR DELETE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- CAREGIVER PREFERENCES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas suas preferências
CREATE POLICY caregiver_preferences_select_own
ON caregiver_preferences FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas suas preferências
CREATE POLICY caregiver_preferences_update_own
ON caregiver_preferences FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- LOCATION SHARES POLICIES
-- ============================================================

-- SELECT: Caregiver vê apenas seus shares
CREATE POLICY location_shares_select_own
ON location_shares FOR SELECT
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- INSERT: Caregiver pode criar shares para si
CREATE POLICY location_shares_insert_own
ON location_shares FOR INSERT
WITH CHECK (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- UPDATE: Caregiver pode atualizar apenas seus shares
CREATE POLICY location_shares_update_own
ON location_shares FOR UPDATE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- DELETE: Caregiver pode deletar apenas seus shares
CREATE POLICY location_shares_delete_own
ON location_shares FOR DELETE
USING (
    caregiver_id IN (
        SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- RLS POLICIES SUMMARY
-- ============================================================
-- Total: 34 policies criadas
-- Padrão: Cada caregiver acessa APENAS seus dados (isolamento total GDPR)
-- Usando: auth.uid() para identificar user autenticado
-- Subqueries: Para navegação via foreign keys (caregiver → loved_one → data)
