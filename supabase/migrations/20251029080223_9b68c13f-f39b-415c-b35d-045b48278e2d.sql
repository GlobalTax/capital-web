-- FASE 8 - MIGRACIÓN 4: Mover extensión pg_trgm a schema extensions
-- Mejora organizativa según best practices de Supabase

-- Crear schema extensions si no existe
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover pg_trgm a schema extensions
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Asegurar que el search_path incluye extensions para funciones que lo necesitan
-- Esto se hace automáticamente en Supabase, pero lo documentamos
COMMENT ON SCHEMA extensions IS 
'Schema para extensiones de PostgreSQL. Recomendación de seguridad de Supabase (Phase 8).';