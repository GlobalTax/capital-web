-- Ampliar constraint interacciones_check para incluir mandato_id
ALTER TABLE interacciones
DROP CONSTRAINT IF EXISTS interacciones_check;

ALTER TABLE interacciones
ADD CONSTRAINT interacciones_check
CHECK (
  contacto_id IS NOT NULL 
  OR empresa_id IS NOT NULL 
  OR mandato_id IS NOT NULL
);