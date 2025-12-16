-- Actualizar duraciones del proceso a tiempos realistas (1 año total)
UPDATE venta_empresas_process_steps 
SET duration = CASE step_number
  WHEN 1 THEN '1-2 semanas'
  WHEN 2 THEN '6-8 semanas'
  WHEN 3 THEN '3-4 meses'
  WHEN 4 THEN '2-3 meses'
  WHEN 5 THEN '2-3 meses'
END
WHERE step_number IN (1, 2, 3, 4, 5);

-- Desactivar filas de Garantías y Soporte Legal de la tabla de comparación
UPDATE venta_empresas_comparisons 
SET is_active = false 
WHERE id IN (
  '7d34705b-4f79-43d2-9405-a0bced9c4328',  -- Garantías
  '443f6720-f662-402c-b76f-eee639e05108'   -- Soporte Legal
);