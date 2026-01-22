-- Políticas RLS para permitir operaciones desde service_role (Edge Functions)
-- Esto es necesario porque las Edge Functions usan la service_role key

-- Política para INSERT desde service_role
CREATE POLICY "Service role can insert buyer_contacts" 
ON buyer_contacts 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Política para UPDATE desde service_role
CREATE POLICY "Service role can update buyer_contacts" 
ON buyer_contacts 
FOR UPDATE 
TO service_role 
USING (true);

-- Política para SELECT desde service_role
CREATE POLICY "Service role can select buyer_contacts" 
ON buyer_contacts 
FOR SELECT 
TO service_role 
USING (true);