-- ============================================
-- Migración: Favoritos compartidos para equipo
-- ============================================

-- 1. Eliminar constraint único actual (basado en user_id)
ALTER TABLE cr_favorites DROP CONSTRAINT IF EXISTS cr_favorites_user_id_entity_type_entity_id_key;

-- 2. Añadir columna para registrar quién añadió el favorito (histórico)
ALTER TABLE cr_favorites ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- 3. Migrar datos: copiar user_id a added_by antes de eliminar
UPDATE cr_favorites SET added_by = user_id WHERE added_by IS NULL;

-- 4. Eliminar la columna user_id (ya no necesaria para favoritos globales)
ALTER TABLE cr_favorites DROP COLUMN IF EXISTS user_id;

-- 5. Crear nuevo constraint único por entidad (sin user_id)
ALTER TABLE cr_favorites ADD CONSTRAINT cr_favorites_entity_unique UNIQUE (entity_type, entity_id);

-- 6. Eliminar políticas RLS antiguas basadas en user_id
DROP POLICY IF EXISTS "Users can view own favorites" ON cr_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON cr_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON cr_favorites;

-- 7. Crear nuevas políticas: favoritos compartidos para todos los usuarios autenticados
CREATE POLICY "Authenticated users can view all favorites" 
ON cr_favorites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert favorites" 
ON cr_favorites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete favorites" 
ON cr_favorites FOR DELETE TO authenticated USING (true);