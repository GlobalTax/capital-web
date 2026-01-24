-- Optimize default column visibility (hide duplicated/sparse columns)
UPDATE empresas_table_columns
SET is_visible = false, updated_at = now()
WHERE column_key = 'sector';

-- Also hide ubicacion by default (only 5.8% have data)
UPDATE empresas_table_columns
SET is_visible = false, updated_at = now()
WHERE column_key = 'ubicacion';

-- Ensure core columns are visible
UPDATE empresas_table_columns
SET is_visible = true, updated_at = now()
WHERE column_key IN ('favorito', 'nombre', 'empleados', 'facturacion', 'ebitda', 'margen', 'valoracion', 'estado', 'acciones');