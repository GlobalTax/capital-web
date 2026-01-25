-- =============================================
-- Columna "Última Actividad" para Empresas
-- =============================================

-- 1. Crear vista que incluye última actividad calculada
CREATE OR REPLACE VIEW v_empresas_con_actividad AS
SELECT 
  e.*,
  GREATEST(
    -- Última interacción directa
    (SELECT MAX(i.fecha) FROM interacciones i WHERE i.empresa_id = e.id),
    -- Actividad desde valoraciones vinculadas
    cv.last_activity_at,
    -- Último contacto vinculado
    (SELECT MAX(cl.updated_at) FROM contact_leads cl WHERE cl.empresa_id = e.id),
    -- Updated_at de la propia empresa como fallback
    e.updated_at
  ) as ultima_actividad
FROM empresas e
LEFT JOIN company_valuations cv ON e.source_valuation_id = cv.id;

-- 2. Insertar la nueva columna en empresas_table_columns
INSERT INTO empresas_table_columns (column_key, label, icon, position, is_visible, width, is_sortable)
VALUES ('ultima_actividad', 'Últ. Actividad', 'Clock', 11, true, '100px', true)
ON CONFLICT (column_key) DO UPDATE SET
  label = EXCLUDED.label,
  icon = EXCLUDED.icon,
  is_visible = true;

-- 3. Añadir índices para mejorar rendimiento de las subconsultas
CREATE INDEX IF NOT EXISTS idx_interacciones_empresa_fecha 
  ON interacciones(empresa_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_contact_leads_empresa_updated 
  ON contact_leads(empresa_id, updated_at DESC);