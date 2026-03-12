ALTER TABLE outbound_list_companies ADD COLUMN IF NOT EXISTS posicion_contacto TEXT;
ALTER TABLE outbound_list_companies ADD COLUMN IF NOT EXISTS cnae TEXT;
ALTER TABLE outbound_list_companies ADD COLUMN IF NOT EXISTS descripcion_actividad TEXT;