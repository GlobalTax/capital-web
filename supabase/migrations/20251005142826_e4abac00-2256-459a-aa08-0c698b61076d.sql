-- Optimización: Crear índice para acelerar consultas de admin_users
-- Este índice mejora significativamente el rendimiento de checkAdminStatus()
-- Reducirá el tiempo de query de ~5s a <500ms

CREATE INDEX IF NOT EXISTS idx_admin_users_lookup 
ON public.admin_users(user_id, is_active) 
WHERE is_active = true;

-- Añadir comentario para documentar el propósito del índice
COMMENT ON INDEX idx_admin_users_lookup IS 
'Índice parcial para optimizar verificación de estado admin activo. Mejora rendimiento de checkAdminStatus() de ~5s a <500ms.';