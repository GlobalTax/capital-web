-- Añadir campos de perfil inversor a buyer_contacts
ALTER TABLE buyer_contacts
ADD COLUMN IF NOT EXISTS investor_type text,
ADD COLUMN IF NOT EXISTS investment_range text,
ADD COLUMN IF NOT EXISTS sectors_of_interest text,
ADD COLUMN IF NOT EXISTS preferred_location text,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'es',
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS first_seen_at timestamptz,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
ADD COLUMN IF NOT EXISTS rod_downloads_count integer DEFAULT 0;

-- Crear índice único en email para deduplicación (ignorar si ya existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'buyer_contacts_email_unique'
    ) THEN
        ALTER TABLE buyer_contacts ADD CONSTRAINT buyer_contacts_email_unique UNIQUE (email);
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Constraint may already exist or table has duplicates';
END $$;

-- Comentarios para documentación
COMMENT ON COLUMN buyer_contacts.investor_type IS 'Tipo de inversor: family_office, private_equity, etc.';
COMMENT ON COLUMN buyer_contacts.investment_range IS 'Rango de inversión preferido';
COMMENT ON COLUMN buyer_contacts.sectors_of_interest IS 'Sectores de interés';
COMMENT ON COLUMN buyer_contacts.preferred_location IS 'Ubicación geográfica preferida';
COMMENT ON COLUMN buyer_contacts.preferred_language IS 'Idioma preferido: es, en';
COMMENT ON COLUMN buyer_contacts.source IS 'Fuente de captación: ROD Download – LinkedIn, etc.';
COMMENT ON COLUMN buyer_contacts.first_seen_at IS 'Fecha de primer contacto';
COMMENT ON COLUMN buyer_contacts.last_activity_at IS 'Última actividad del contacto';
COMMENT ON COLUMN buyer_contacts.rod_downloads_count IS 'Número de descargas de ROD';