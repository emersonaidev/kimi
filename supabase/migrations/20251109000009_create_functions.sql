-- Migration: Create Database Functions
-- Feature: 001-supabase-db-setup
-- User Story: US4 - Automated Logic via Triggers
-- Dependencies: 20251109000002-20251109000005 (tabelas)

-- ============================================================
-- FUNCTION: handle_new_user
-- Description: Auto-cria caregiver profile quando user é criado em auth.users
-- Trigger: AFTER INSERT ON auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_caregiver_id UUID;
BEGIN
    -- Criar perfil de caregiver
    INSERT INTO caregivers (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    )
    RETURNING id INTO new_caregiver_id;

    -- Criar preferências padrão
    INSERT INTO caregiver_preferences (caregiver_id)
    VALUES (new_caregiver_id);

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user() IS 'Auto-cria caregiver profile e preferências quando auth.user é criado';

-- ============================================================
-- FUNCTION: update_updated_at
-- Description: Auto-atualiza campo updated_at em qualquer tabela
-- Trigger: BEFORE UPDATE em tabelas com updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at() IS 'Auto-atualiza campo updated_at para NOW() em UPDATEs';

-- ============================================================
-- FUNCTION: check_safe_zone_breach
-- Description: Verifica se GPS location viola safe zone e cria alerta
-- Trigger: AFTER INSERT ON gps_locations
-- ============================================================
CREATE OR REPLACE FUNCTION check_safe_zone_breach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    zone RECORD;
    distance_meters DOUBLE PRECISION;
    caregiver_uuid UUID;
BEGIN
    -- Obter caregiver_id do loved_one
    SELECT caregiver_id INTO caregiver_uuid
    FROM loved_ones
    WHERE id = NEW.loved_one_id;

    -- Verificar cada safe zone ativa
    FOR zone IN
        SELECT id, name, latitude, longitude, radius
        FROM safe_zones
        WHERE loved_one_id = NEW.loved_one_id
          AND is_active = true
    LOOP
        -- Calcular distância usando PostGIS (geography para metros reais)
        SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(zone.longitude, zone.latitude), 4326)::geography
        ) INTO distance_meters;

        -- Se fora da safe zone, criar alerta
        IF distance_meters > zone.radius THEN
            INSERT INTO alerts (
                caregiver_id,
                loved_one_id,
                alert_type,
                severity,
                title,
                message,
                metadata
            ) VALUES (
                caregiver_uuid,
                NEW.loved_one_id,
                'safe_zone_breach',
                'high',
                'Zona Segura Violada',
                format('Ente querido saiu da zona segura "%s" (%.0fm de distância)', zone.name, distance_meters),
                jsonb_build_object(
                    'safe_zone_id', zone.id,
                    'safe_zone_name', zone.name,
                    'distance_meters', distance_meters,
                    'gps_location_id', NEW.id
                )
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION check_safe_zone_breach() IS 'Detecta violação de safe zones via PostGIS e gera alertas automáticos';

-- ============================================================
-- FUNCTION: log_activity
-- Description: Auto-loga mudanças de localização como activities
-- Trigger: AFTER INSERT ON gps_locations
-- ============================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Logar movimento como atividade
    INSERT INTO activities (
        loved_one_id,
        activity_type,
        description,
        metadata,
        occurred_at
    ) VALUES (
        NEW.loved_one_id,
        'location_change',
        format('Nova localização registada: (%.6f, %.6f)', NEW.latitude, NEW.longitude),
        jsonb_build_object(
            'gps_location_id', NEW.id,
            'latitude', NEW.latitude,
            'longitude', NEW.longitude,
            'accuracy', NEW.accuracy,
            'battery_level', NEW.battery_level
        ),
        NEW.recorded_at
    );

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION log_activity() IS 'Auto-cria activity log para mudanças de localização GPS';
