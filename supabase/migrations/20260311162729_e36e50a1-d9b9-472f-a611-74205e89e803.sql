
ALTER TABLE outbound_lists ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE outbound_lists ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'borrador';
ALTER TABLE outbound_lists ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'manual';

UPDATE outbound_lists SET estado = CASE WHEN is_active = true THEN 'activa' ELSE 'archivada' END WHERE estado = 'borrador' AND is_active IS NOT NULL;
