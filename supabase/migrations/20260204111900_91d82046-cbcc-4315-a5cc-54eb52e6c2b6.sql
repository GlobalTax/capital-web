-- Índice único para prevenir duplicados en campaigns
-- Excluye campañas archivadas para permitir reutilizar nombres
CREATE UNIQUE INDEX idx_campaigns_name_channel_unique 
ON campaigns (LOWER(name), channel) 
WHERE delivery_status != 'archived';