-- Añadir campo project_status para estado del proyecto
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS project_status text DEFAULT 'in_market';

-- Añadir constraint para validar valores permitidos
ALTER TABLE company_operations 
ADD CONSTRAINT check_project_status 
CHECK (project_status IS NULL OR project_status IN ('negotiating', 'in_market', 'in_progress'));

-- Añadir campo expected_market_text (texto libre para "In progress")
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS expected_market_text text;

-- Comentarios para documentación
COMMENT ON COLUMN company_operations.project_status IS 'Estado del proyecto: negotiating (En negociaciones), in_market (En el mercado), in_progress (In progress)';
COMMENT ON COLUMN company_operations.expected_market_text IS 'Texto libre indicando fecha esperada de entrada a mercado (solo para in_progress)';