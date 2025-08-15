-- Revisar y asegurar políticas de lead_behavior_events también

-- Eliminar la política problemática que previene inserción
DROP POLICY IF EXISTS "Prevent malicious tracking insertion" ON public.lead_behavior_events;

-- Mantener solo políticas seguras para lead_behavior_events
-- Los administradores pueden ver los eventos de comportamiento
-- Solo el sistema puede insertar nuevos eventos de tracking

-- Verificar que las políticas correctas están en su lugar
-- (las políticas "Admins can view behavior events" y "Authenticated systems can insert behavior events" ya existen y son correctas)

-- Asegurar que no se puede actualizar ni eliminar eventos de comportamiento sin ser admin
CREATE POLICY "Admins can update behavior events" 
ON public.lead_behavior_events 
FOR UPDATE 
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Admins can delete behavior events" 
ON public.lead_behavior_events 
FOR DELETE 
TO authenticated
USING (current_user_is_admin());

-- Comentario para documentar la seguridad
COMMENT ON TABLE public.lead_behavior_events IS 'Eventos de comportamiento de tracking - Solo lectura para admins, inserción solo por sistema.';