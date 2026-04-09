ALTER TABLE public.acquisition_leads
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.company_acquisition_inquiries
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_acquisition_leads_assigned_to ON public.acquisition_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_company_acquisition_inquiries_assigned_to ON public.company_acquisition_inquiries(assigned_to);

CREATE OR REPLACE FUNCTION public.assign_lead(
  p_table TEXT,
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_table = 'company_valuations' THEN
    UPDATE public.company_valuations
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSIF p_table = 'contact_leads' THEN
    UPDATE public.contact_leads
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSIF p_table = 'acquisition_leads' THEN
    UPDATE public.acquisition_leads
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSIF p_table = 'company_acquisition_inquiries' THEN
    UPDATE public.company_acquisition_inquiries
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSE
    RAISE EXCEPTION 'Invalid table';
  END IF;
END;
$$;

COMMENT ON COLUMN public.acquisition_leads.assigned_to IS 'Admin user responsible for this lead';
COMMENT ON COLUMN public.acquisition_leads.assigned_at IS 'Timestamp when the lead was assigned';
COMMENT ON COLUMN public.company_acquisition_inquiries.assigned_to IS 'Admin user responsible for this lead';
COMMENT ON COLUMN public.company_acquisition_inquiries.assigned_at IS 'Timestamp when the lead was assigned';