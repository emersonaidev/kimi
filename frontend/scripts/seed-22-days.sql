-- ============================================================================
-- KIMI - Script de População de Dados (22 dias)
-- ============================================================================
-- Este script cria dados realistas para os últimos 22 dias, incluindo:
-- - GPS locations (múltiplas por dia simulando movimento)
-- - Health metrics (heart rate, steps, sleep)
-- - Activities (eventos automáticos via triggers)
-- - Safe zones (casa e escola)
-- ============================================================================

-- Limpar dados existentes (cuidado em produção!)
DELETE FROM activities;
DELETE FROM alerts;
DELETE FROM health_metrics;
DELETE FROM gps_locations;
DELETE FROM safe_zones;
DELETE FROM loved_ones;
DELETE FROM caregivers;

-- ============================================================================
-- 1. CRIAR CAREGIVER
-- ============================================================================
INSERT INTO caregivers (id, user_id, full_name, email, phone_number)
VALUES (
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  '7cdeb370-83b1-4479-9cb2-b269185e4484', -- user_id do Supabase Auth
  'Emerson Ferreira',
  'emerson@oiemerson.com',
  '+351912345678'
);

-- ============================================================================
-- 2. CRIAR LOVED ONE (Ester - criança que usa o Apple Watch)
-- ============================================================================
INSERT INTO loved_ones (id, caregiver_id, full_name, device_id, date_of_birth, relationship, emergency_contact)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  'Ester Ferreira',
  'KIMI-0001',
  '2015-03-15', -- 9 anos
  'daughter',
  '+351912345679'
);

-- ============================================================================
-- 3. CRIAR SAFE ZONES
-- ============================================================================
-- Safe Zone: Casa (Lisbon - Belém area)
INSERT INTO safe_zones (id, loved_one_id, caregiver_id, name, latitude, longitude, radius, is_active)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '550e8400-e29b-41d4-a716-446655440000',
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  'Casa',
  38.6976, -- Belém, Lisboa
  -9.2073,
  150, -- 150 metros de raio
  true
);

-- Safe Zone: Escola (Oak Elementary - próximo ao Jardim Botânico)
INSERT INTO safe_zones (id, loved_one_id, caregiver_id, name, latitude, longitude, radius, is_active)
VALUES (
  'b1ffcd88-8b1c-5fg9-cc7e-7cc0ce491b22',
  '550e8400-e29b-41d4-a716-446655440000',
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  'Oak Elementary School',
  38.7250, -- Próximo ao Jardim Botânico, Lisboa
  -9.1420,
  200, -- 200 metros de raio
  true
);

-- ============================================================================
-- 4. FUNÇÃO AUXILIAR: Gerar dados para 22 dias
-- ============================================================================

DO $$
DECLARE
  day_offset INT;
  base_date TIMESTAMP;
  loved_one_uuid UUID := '550e8400-e29b-41d4-a716-446655440000';

  -- Coordenadas
  home_lat NUMERIC := 38.6976;
  home_lng NUMERIC := -9.2073;
  school_lat NUMERIC := 38.7250;
  school_lng NUMERIC := -9.1420;

  -- Variáveis para cada dia
  current_date TIMESTAMP;
  is_weekend BOOLEAN;
  heart_rate INT;
  steps INT;
  sleep_quality NUMERIC;
BEGIN

  -- Loop para os últimos 22 dias
  FOR day_offset IN 0..21 LOOP
    current_date := NOW() - (day_offset || ' days')::INTERVAL;
    is_weekend := EXTRACT(DOW FROM current_date) IN (0, 6); -- 0=Sunday, 6=Saturday

    -- ========================================================================
    -- DIAS DE SEMANA (Segunda a Sexta)
    -- ========================================================================
    IF NOT is_weekend THEN

      -- 07:15 - Acordar (casa)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + (RANDOM() * 0.0005 - 0.00025), -- pequena variação
        home_lng + (RANDOM() * 0.0005 - 0.00025),
        8.5,
        95 + FLOOR(RANDOM() * 5), -- 95-99%
        current_date + INTERVAL '7 hours 15 minutes'
      );

      -- 08:10 - Saiu de casa (em movimento para escola)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + 0.003,
        home_lng + 0.002,
        12.0,
        92 + FLOOR(RANDOM() * 3),
        current_date + INTERVAL '8 hours 10 minutes'
      );

      -- 08:30 - Chegou à escola
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        school_lat + (RANDOM() * 0.0003 - 0.00015),
        school_lng + (RANDOM() * 0.0003 - 0.00015),
        6.2,
        88 + FLOOR(RANDOM() * 4),
        current_date + INTERVAL '8 hours 30 minutes'
      );

      -- 12:45 - Almoço (escola)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        school_lat + (RANDOM() * 0.0004 - 0.0002),
        school_lng + (RANDOM() * 0.0004 - 0.0002),
        7.8,
        75 + FLOOR(RANDOM() * 8),
        current_date + INTERVAL '12 hours 45 minutes'
      );

      -- 15:10 - Saiu da escola
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        school_lat + 0.002,
        school_lng - 0.001,
        10.5,
        65 + FLOOR(RANDOM() * 10),
        current_date + INTERVAL '15 hours 10 minutes'
      );

      -- 15:30 - Chegou em casa
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + (RANDOM() * 0.0005 - 0.00025),
        home_lng + (RANDOM() * 0.0005 - 0.00025),
        9.2,
        60 + FLOOR(RANDOM() * 10),
        current_date + INTERVAL '15 hours 30 minutes'
      );

      -- 19:00 - Jantar (casa)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + (RANDOM() * 0.0003 - 0.00015),
        home_lng + (RANDOM() * 0.0003 - 0.00015),
        7.5,
        45 + FLOOR(RANDOM() * 15),
        current_date + INTERVAL '19 hours'
      );

      -- Health Metrics - Dia de semana (mais ativo)
      INSERT INTO health_metrics (loved_one_id, heart_rate, steps, sleep_hours, stress_level, recorded_at)
      VALUES (
        loved_one_uuid,
        75 + FLOOR(RANDOM() * 25), -- 75-100 BPM
        6000 + FLOOR(RANDOM() * 4000), -- 6000-10000 passos
        8.0 + (RANDOM() * 2), -- 8-10h sono
        30 + FLOOR(RANDOM() * 30), -- stress 30-60
        current_date + INTERVAL '20 hours'
      );

    -- ========================================================================
    -- FIM DE SEMANA (Sábado e Domingo)
    -- ========================================================================
    ELSE

      -- 09:30 - Acordar mais tarde (casa)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + (RANDOM() * 0.0005 - 0.00025),
        home_lng + (RANDOM() * 0.0005 - 0.00025),
        8.0,
        98 + FLOOR(RANDOM() * 2),
        current_date + INTERVAL '9 hours 30 minutes'
      );

      -- 14:00 - Passeio (perto de casa)
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + 0.005,
        home_lng + 0.003,
        11.0,
        75 + FLOOR(RANDOM() * 15),
        current_date + INTERVAL '14 hours'
      );

      -- 17:00 - Voltou para casa
      INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, battery_level, recorded_at)
      VALUES (
        loved_one_uuid,
        home_lat + (RANDOM() * 0.0004 - 0.0002),
        home_lng + (RANDOM() * 0.0004 - 0.0002),
        8.5,
        60 + FLOOR(RANDOM() * 20),
        current_date + INTERVAL '17 hours'
      );

      -- Health Metrics - Fim de semana (menos ativo)
      INSERT INTO health_metrics (loved_one_id, heart_rate, steps, sleep_hours, stress_level, recorded_at)
      VALUES (
        loved_one_uuid,
        70 + FLOOR(RANDOM() * 20), -- 70-90 BPM (mais relaxado)
        3000 + FLOOR(RANDOM() * 3000), -- 3000-6000 passos
        9.0 + (RANDOM() * 2), -- 9-11h sono
        15 + FLOOR(RANDOM() * 25), -- stress 15-40 (mais baixo)
        current_date + INTERVAL '20 hours'
      );

    END IF;

  END LOOP;

  RAISE NOTICE '✅ Dados de 22 dias criados com sucesso!';
  RAISE NOTICE '📍 GPS Locations: ~7/dia semana, ~3/dia weekend = ~132 registos';
  RAISE NOTICE '❤️ Health Metrics: 1/dia = 22 registos';
  RAISE NOTICE '📋 Activities: Geradas automaticamente via triggers';

END $$;

-- ============================================================================
-- 5. CRIAR ALGUNS EVENTOS ESPECIAIS (Alertas)
-- ============================================================================

-- Alerta de bateria baixa (3 dias atrás)
INSERT INTO alerts (loved_one_id, caregiver_id, alert_type, severity, message, metadata, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  'low_battery',
  'medium',
  'Bateria baixa: 15%',
  '{"battery_level": 15}'::jsonb,
  NOW() - INTERVAL '3 days'
);

-- Alerta de stress elevado (1 dia atrás)
INSERT INTO alerts (loved_one_id, caregiver_id, alert_type, severity, message, metadata, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '0ed4b450-6c79-44b4-8fd3-bd5f912d9397',
  'high_stress',
  'high',
  'Nível de stress elevado detectado: 85',
  '{"stress_level": 85, "duration_minutes": 45}'::jsonb,
  NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================================================

SELECT
  'GPS Locations' as tabela,
  COUNT(*) as total
FROM gps_locations
UNION ALL
SELECT
  'Health Metrics',
  COUNT(*)
FROM health_metrics
UNION ALL
SELECT
  'Activities',
  COUNT(*)
FROM activities
UNION ALL
SELECT
  'Safe Zones',
  COUNT(*)
FROM safe_zones
UNION ALL
SELECT
  'Alerts',
  COUNT(*)
FROM alerts;
