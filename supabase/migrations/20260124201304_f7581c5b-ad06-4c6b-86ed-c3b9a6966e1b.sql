-- Añadir columnas de valoración y fecha de registro a la configuración de tabla
INSERT INTO empresas_table_columns (column_key, label, icon, position, is_visible, width, is_sortable)
VALUES 
  ('valoracion', 'Valoración', 'Calculator', 7, true, 'w-[110px]', true),
  ('fecha_valoracion', 'Fecha Registro', 'Calendar', 8, true, 'w-[100px]', true)
ON CONFLICT (column_key) DO NOTHING;

-- Ajustar posiciones de columnas existentes que vienen después
UPDATE empresas_table_columns 
SET position = position + 2 
WHERE position >= 7 
  AND column_key NOT IN ('valoracion', 'fecha_valoracion');