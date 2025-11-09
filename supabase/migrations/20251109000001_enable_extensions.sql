-- Migration: Enable Required PostgreSQL Extensions
-- Feature: 001-supabase-db-setup
-- Description: Ativa uuid-ossp para UUID generation e PostGIS para geospatial queries
-- Dependencies: None (fundacional)

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Enable PostGIS for geospatial queries
-- Usado para safe zones (ST_Distance, ST_DWithin, geography type)
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;

-- Verificar extensões ativas
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys';
COMMENT ON EXTENSION "postgis" IS 'PostGIS geometry and geography spatial types and functions';
