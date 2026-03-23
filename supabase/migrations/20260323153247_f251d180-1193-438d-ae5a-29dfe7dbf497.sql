
-- Restaurar registros soft-deleted durante deduplicación del 23/03/2026
UPDATE company_valuations 
SET is_deleted = false, deleted_at = NULL 
WHERE is_deleted = true 
  AND deleted_at >= '2026-03-23 15:22:00' 
  AND deleted_at <= '2026-03-23 15:24:00';

UPDATE contact_leads 
SET is_deleted = false, deleted_at = NULL 
WHERE is_deleted = true 
  AND deleted_at >= '2026-03-23 15:22:00' 
  AND deleted_at <= '2026-03-23 15:24:00';
