-- Index for trigger lookup: empresas by CIF
CREATE INDEX IF NOT EXISTS idx_empresas_lower_cif
ON public.empresas (lower(trim(cif)));

-- Index for trigger lookup: empresas by normalized name
CREATE INDEX IF NOT EXISTS idx_empresas_normalized_name
ON public.empresas (normalize_company_name(nombre));

-- Index for trigger lookup: contactos by email
CREATE INDEX IF NOT EXISTS idx_contactos_lower_email
ON public.contactos (lower(email));

-- Index for trigger lookup: contactos by empresa + name (director dedup)
CREATE INDEX IF NOT EXISTS idx_contactos_empresa_lower_name
ON public.contactos (empresa_principal_id, lower(trim(nombre)));