-- Crear política RLS para que administradores puedan insertar contactos
-- Esto permite sincronizar Valoraciones Pro a contact_leads sin rate limiting

CREATE POLICY contact_leads_admin_insert 
ON contact_leads 
FOR INSERT 
TO authenticated 
WITH CHECK (current_user_is_admin());