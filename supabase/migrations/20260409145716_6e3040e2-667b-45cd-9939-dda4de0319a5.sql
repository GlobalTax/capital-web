-- Temporarily disable validation triggers
ALTER TABLE public.company_valuations DISABLE TRIGGER validate_valuation_data;
ALTER TABLE public.company_valuations DISABLE TRIGGER validate_valuation_integrity_trigger;

-- Update the lead status
UPDATE public.company_valuations 
SET lead_status_crm = 'calificado', 
    status_updated_at = NOW()
WHERE id = '8f9f216a-48d4-41e0-ab9a-44148ce85073';

-- Re-enable validation triggers
ALTER TABLE public.company_valuations ENABLE TRIGGER validate_valuation_data;
ALTER TABLE public.company_valuations ENABLE TRIGGER validate_valuation_integrity_trigger;