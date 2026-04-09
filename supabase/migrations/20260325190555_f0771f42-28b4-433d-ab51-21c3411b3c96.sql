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
    UPDATE company_valuations
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSIF p_table = 'contact_leads' THEN
    UPDATE contact_leads
    SET assigned_to = p_user_id
    WHERE id = p_lead_id;
  ELSE
    RAISE EXCEPTION 'Invalid table';
  END IF;
END;
$$;