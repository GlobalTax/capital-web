-- 1. Cambiar el trigger de BEFORE a AFTER INSERT
DROP TRIGGER IF EXISTS trg_auto_link_valuation ON public.company_valuations;

CREATE TRIGGER trg_auto_link_valuation
AFTER INSERT ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_valuation_to_crm();

-- 2. Comentario para documentación
COMMENT ON TRIGGER trg_auto_link_valuation ON public.company_valuations IS 
'Links new valuations to CRM (empresas/contactos). AFTER INSERT to allow FK reference.';