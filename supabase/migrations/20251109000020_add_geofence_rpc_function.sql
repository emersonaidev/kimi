-- Migration: Add geofencing RPC function
-- Feature: 002-caregiver-monitoring-app
-- Created: 2025-11-09
-- Description: Adiciona função PostgreSQL para verificar violações de safe zones usando PostGIS

-- Criar função RPC para geofencing
CREATE OR REPLACE FUNCTION check_geofence_breach(
  p_loved_one_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE(
  breached_zone_id UUID,
  breached_zone_name TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sz.id AS breached_zone_id,
    sz.name AS breached_zone_name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography
    ) AS distance_meters
  FROM safe_zones sz
  WHERE sz.loved_one_id = p_loved_one_id
    AND sz.is_active = true
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography,
      sz.radius
    ) = false; -- Retorna zonas onde o ponto está FORA
END;
$$;

COMMENT ON FUNCTION check_geofence_breach IS 'Verifica se coordenadas violam safe zones ativas usando PostGIS';

-- Note: GiST indexes for PostGIS optimization can be created manually if needed
-- They require specific PostGIS syntax that may vary by Supabase version
