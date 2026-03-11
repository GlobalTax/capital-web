-- TABLA PRINCIPAL: listas
CREATE TABLE IF NOT EXISTS contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  sector TEXT,
  origen TEXT CHECK (origen IN ('excel', 'manual', 'filtro', 'campana')) NOT NULL DEFAULT 'manual',
  estado TEXT CHECK (estado IN ('borrador', 'activa', 'archivada')) NOT NULL DEFAULT 'borrador',
  total_empresas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA RELACION: empresas dentro de cada lista
CREATE TABLE IF NOT EXISTS contact_list_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES contact_lists(id) ON DELETE CASCADE,
  empresa TEXT NOT NULL,
  contacto TEXT,
  email TEXT,
  telefono TEXT,
  cif TEXT,
  web TEXT,
  provincia TEXT,
  facturacion NUMERIC,
  ebitda NUMERIC,
  anios_datos INTEGER DEFAULT 1,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA HISTORIAL: vinculacion lista → campaña
CREATE TABLE IF NOT EXISTS contact_list_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES contact_lists(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES valuation_campaigns(id) ON DELETE SET NULL,
  campaign_nombre TEXT,
  fecha_vinculacion TIMESTAMPTZ DEFAULT now(),
  empresas_enviadas INTEGER DEFAULT 0,
  notas TEXT
);

-- RLS: mismo patron que valuation_campaigns
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact_lists"
ON contact_lists FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

CREATE POLICY "Admins can manage contact_list_companies"
ON contact_list_companies FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

CREATE POLICY "Admins can manage contact_list_campaigns"
ON contact_list_campaigns FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

-- Trigger para mantener total_empresas actualizado
CREATE OR REPLACE FUNCTION update_list_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contact_lists
  SET total_empresas = (
    SELECT COUNT(*) FROM contact_list_companies WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_list_total ON contact_list_companies;
CREATE TRIGGER trg_update_list_total
AFTER INSERT OR DELETE ON contact_list_companies
FOR EACH ROW EXECUTE FUNCTION update_list_total();