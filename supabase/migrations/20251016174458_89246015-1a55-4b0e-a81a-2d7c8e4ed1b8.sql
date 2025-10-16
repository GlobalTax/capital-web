-- =============================================
-- Limpieza de valoraciones de prueba
-- Marca como eliminadas las valoraciones de prueba evidentes
-- =============================================

-- Paso 1: Marcar valoraciones de prueba existentes como eliminadas
UPDATE public.company_valuations 
SET 
  is_deleted = true,
  deleted_at = NOW(),
  deletion_reason = 'Prueba interna - sin valor comercial (abandono inmediato en Step 1 con 0s)'
WHERE 
  email = 's.navarro@obn.es' 
  AND valuation_status = 'in_progress'
  AND time_spent_seconds = 0
  AND current_step = 1
  AND (is_deleted IS NULL OR is_deleted = false);

-- Paso 2: Ver resultados de la limpieza
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deleted_count
  FROM public.company_valuations
  WHERE email = 's.navarro@obn.es' 
    AND is_deleted = true
    AND deletion_reason LIKE '%Prueba interna%';
    
  RAISE NOTICE '✅ Limpieza completada: % valoraciones de prueba marcadas como eliminadas', deleted_count;
END $$;

-- Paso 3: Verificación - Consulta para ver valoraciones que serían excluidas del reporte
COMMENT ON TABLE public.company_valuations IS 'Tabla de valoraciones con filtros de calidad implementados para reportes';

-- Log de auditoría
INSERT INTO public.audit_logs (
  user_id,
  action,
  table_name,
  record_id,
  old_values,
  new_values,
  changed_fields
)
SELECT 
  auth.uid(),
  'UPDATE',
  'company_valuations',
  id,
  jsonb_build_object('is_deleted', false),
  jsonb_build_object('is_deleted', true, 'deletion_reason', deletion_reason),
  ARRAY['is_deleted', 'deleted_at', 'deletion_reason']
FROM public.company_valuations
WHERE email = 's.navarro@obn.es' 
  AND is_deleted = true
  AND deletion_reason LIKE '%Prueba interna%';