-- Eliminar trigger de sincronización CRM → Operaciones
DROP TRIGGER IF EXISTS trg_sync_mandato_to_operation ON mandatos;

-- Eliminar función asociada
DROP FUNCTION IF EXISTS sync_mandato_to_company_operation();