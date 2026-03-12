ALTER TABLE outbound_lists
  ADD COLUMN IF NOT EXISTS descripcion_proposito text,
  ADD COLUMN IF NOT EXISTS cnaes_utilizados text[],
  ADD COLUMN IF NOT EXISTS facturacion_min numeric,
  ADD COLUMN IF NOT EXISTS facturacion_max numeric,
  ADD COLUMN IF NOT EXISTS criterios_construccion text,
  ADD COLUMN IF NOT EXISTS lista_madre_id uuid REFERENCES outbound_lists(id) ON DELETE SET NULL;