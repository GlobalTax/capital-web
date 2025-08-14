-- Arreglar problema de privacidad en lead_behavior_events
-- Remover política demasiado permisiva que permite inserción pública sin restricciones

DROP POLICY IF EXISTS "Anyone can insert behavior events" ON public.lead_behavior_events;

-- Crear política más restrictiva que solo permite inserción desde sistemas autenticados
-- o a través de service role (edge functions)
CREATE POLICY "Authenticated systems can insert behavior events"
ON public.lead_behavior_events
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Agregar política adicional para prevenir inserción maliciosa
-- Solo permitir inserción si viene de service role o usuario autenticado con validación
CREATE POLICY "Prevent malicious tracking insertion"
ON public.lead_behavior_events
FOR INSERT
TO anon
WITH CHECK (false);  -- Bloquear inserción anónima directa

-- Crear edge function para manejar tracking de forma segura
-- Esto se manejará en el código de la edge function