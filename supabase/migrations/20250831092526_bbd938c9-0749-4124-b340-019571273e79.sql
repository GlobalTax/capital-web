-- Actualizar display_locations para incluir 'compra-empresas' donde sea necesario
UPDATE company_operations 
SET display_locations = ARRAY['home', 'operaciones', 'destacadas', 'compra-empresas']
WHERE is_active = true 
AND display_locations @> ARRAY['operaciones'];

-- También agregar 'marketplace' como alias para 'operaciones'
UPDATE company_operations 
SET display_locations = array_append(display_locations, 'marketplace')
WHERE is_active = true 
AND display_locations @> ARRAY['operaciones']
AND NOT display_locations @> ARRAY['marketplace'];