-- Asegurar privilegios mínimos compatibles con RLS para evitar 401 en inserts anónimos y permitir lectura autenticada para admins

-- 1) Habilitar RLS por si alguna tabla no lo tuviera (idempotente)
ALTER TABLE IF EXISTS public.lead_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_valuations ENABLE ROW LEVEL SECURITY;

-- 2) Conceder privilegios necesarios
-- Schema usage (por si se requiere en algunos entornos)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- lead_behavior_events: permitir INSERT a anon y authenticated (RLS decide filas) y SELECT a authenticated (admins pasan por política)
GRANT INSERT ON public.lead_behavior_events TO anon, authenticated;
GRANT SELECT ON public.lead_behavior_events TO authenticated;

-- company_valuations: permitir INSERT a anon y authenticated (RLS decide filas) y SELECT a authenticated (admins pasan por política)
GRANT INSERT ON public.company_valuations TO anon, authenticated;
GRANT SELECT ON public.company_valuations TO authenticated;
