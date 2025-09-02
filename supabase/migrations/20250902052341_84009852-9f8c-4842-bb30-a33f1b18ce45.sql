-- Agregar índices faltantes para contact_leads
CREATE INDEX IF NOT EXISTS idx_contact_leads_email ON public.contact_leads(email);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON public.contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_email_created_at ON public.contact_leads(email, created_at DESC);

-- Mejorar la política de form_submissions para validar is_active = true
DROP POLICY IF EXISTS "Secure form submission with rate limiting" ON public.form_submissions;

CREATE POLICY "Secure form submission with rate limiting and validation" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'form_submission', 
    3, 
    1440
  ) 
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND form_type IS NOT NULL
  AND length(TRIM(form_type)) >= 1
  AND is_active = true
);