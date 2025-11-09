-- Migration: Insert Seed Data (Development Only)
-- Feature: 001-supabase-db-setup
-- User Story: US5 - Seed Data for Testing
-- Dependencies: Todas as tabelas, RLS, triggers

-- ============================================================
-- IMPORTANTE: Este seed data é APENAS para KIMI-DEV
-- NUNCA executar em KIMI-PROD
-- ============================================================

-- ============================================================
-- SEED DATA: Caregiver de Teste
-- ============================================================
-- NOTA: User deve ser criado manualmente via Supabase Dashboard Authentication
-- Email: emersonaidev@gmail.com
-- Password: [definir manualmente]
-- O trigger on_auth_user_created criará automaticamente:
-- - Registo em caregivers
-- - Registo em caregiver_preferences

-- ============================================================
-- SEED DATA: Loved One de Teste
-- ============================================================
INSERT INTO loved_ones (
    id,
    caregiver_id,
    device_id,
    full_name,
    date_of_birth,
    medical_conditions,
    emergency_notes
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'KIMI-8472',
    'Avó Maria',
    '1945-03-15',
    'Diabetes Tipo 2, Hipertensão',
    'Medicação diária às 8h e 20h. Não pode ficar sem água.'
)
ON CONFLICT (device_id) DO NOTHING;

-- ============================================================
-- SEED DATA: Safe Zones
-- ============================================================
-- Zona 1: Casa (Lisboa)
INSERT INTO safe_zones (
    id,
    loved_one_id,
    caregiver_id,
    name,
    latitude,
    longitude,
    radius,
    is_active
) VALUES (
    'f1e2d3c4-b5a6-4978-8c9d-0e1f2a3b4c5d'::uuid,
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'Casa',
    38.7223,
    -9.1393,
    200,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Zona 2: Centro de Dia
INSERT INTO safe_zones (
    id,
    loved_one_id,
    caregiver_id,
    name,
    latitude,
    longitude,
    radius,
    is_active
) VALUES (
    'f2e3d4c5-b6a7-4089-8d9e-0f1e2a3b4c5d'::uuid,
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'Centro de Dia',
    38.7380,
    -9.1424,
    150,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Zona 3: Hospital
INSERT INTO safe_zones (
    id,
    loved_one_id,
    caregiver_id,
    name,
    latitude,
    longitude,
    radius,
    is_active
) VALUES (
    'f3e4d5c6-b7a8-4190-8e9f-0f1e2a3b4c5d'::uuid,
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'Hospital Santa Maria',
    38.7508,
    -9.1597,
    300,
    false
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA: GPS Locations (últimas 24h simuladas)
-- ============================================================
-- Localização mais recente (dentro de Casa)
INSERT INTO gps_locations (
    loved_one_id,
    latitude,
    longitude,
    accuracy,
    battery_level,
    recorded_at
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    38.7223,
    -9.1393,
    10.5,
    85,
    NOW() - INTERVAL '5 minutes'
)
ON CONFLICT DO NOTHING;

-- Localização há 1h (em trânsito para Centro de Dia)
INSERT INTO gps_locations (
    loved_one_id,
    latitude,
    longitude,
    accuracy,
    battery_level,
    recorded_at
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    38.7300,
    -9.1400,
    12.0,
    87,
    NOW() - INTERVAL '1 hour'
)
ON CONFLICT DO NOTHING;

-- Localização há 2h (Centro de Dia)
INSERT INTO gps_locations (
    loved_one_id,
    latitude,
    longitude,
    accuracy,
    battery_level,
    recorded_at
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    38.7380,
    -9.1424,
    8.0,
    90,
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT DO NOTHING;

-- Mais 17 localizações espaçadas (simular um dia)
INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
SELECT
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    38.7223 + (random() * 0.01 - 0.005),
    -9.1393 + (random() * 0.01 - 0.005),
    5 + random() * 15,
    95 - (n * 3),
    NOW() - (n || ' hours')::INTERVAL
FROM generate_series(3, 19) AS n
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Health Metrics (últimas 24h)
-- ============================================================
INSERT INTO health_metrics (
    loved_one_id,
    heart_rate,
    steps,
    calories_burned,
    sleep_hours,
    recorded_at
)
SELECT
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
    65 + (random() * 30)::INTEGER,
    (random() * 5000)::INTEGER,
    (random() * 300)::INTEGER,
    CASE WHEN n BETWEEN 22 AND 6 THEN 7 + random() * 2 ELSE NULL END,
    NOW() - (n || ' hours')::INTERVAL
FROM generate_series(0, 23) AS n
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Emergency Contacts
-- ============================================================
INSERT INTO emergency_contacts (
    caregiver_id,
    contact_name,
    phone_number,
    relationship,
    priority
) VALUES
(
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'Dr. João Silva',
    '+351912345678',
    'Médico de Família',
    1
),
(
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'INEM',
    '112',
    'Emergência',
    2
),
(
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com' LIMIT 1),
    'Filha Ana',
    '+351923456789',
    'Familiar',
    3
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA SUMMARY
-- ============================================================
-- Inserido:
-- - 1 loved_one (KIMI-8472, Avó Maria)
-- - 3 safe_zones (Casa, Centro de Dia, Hospital)
-- - ~20 gps_locations (últimas 24h simuladas)
-- - 24 health_metrics (últimas 24h, hourly)
-- - 3 emergency_contacts
--
-- NOTA: Caregiver e preferences criados automaticamente via trigger on_auth_user_created
-- quando user emersonaidev@gmail.com é criado no Supabase Auth
