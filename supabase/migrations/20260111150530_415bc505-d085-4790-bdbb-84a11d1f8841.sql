-- Create audit log table for Search Funds
CREATE TABLE public.sf_fund_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_fields TEXT[],
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_sf_fund_audit_log_fund_id ON public.sf_fund_audit_log(fund_id);
CREATE INDEX idx_sf_fund_audit_log_created_at ON public.sf_fund_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.sf_fund_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read sf_fund_audit_log"
ON public.sf_fund_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Policy: System can insert audit logs (via trigger)
CREATE POLICY "System can insert sf_fund_audit_log"
ON public.sf_fund_audit_log
FOR INSERT
WITH CHECK (true);

-- Create trigger function to log changes
CREATE OR REPLACE FUNCTION public.log_sf_fund_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_cols TEXT[];
  old_data JSONB;
  new_data JSONB;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.sf_fund_audit_log (
      fund_id, user_id, user_email, action, changed_fields, old_values, new_values
    ) VALUES (
      NEW.id,
      current_user_id,
      current_user_email,
      'INSERT',
      NULL,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Find which columns changed
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    SELECT array_agg(key) INTO changed_cols
    FROM jsonb_each(new_data) AS n(key, value)
    WHERE n.value IS DISTINCT FROM old_data->n.key
      AND n.key NOT IN ('updated_at');
    
    -- Only log if there are actual changes
    IF changed_cols IS NOT NULL AND array_length(changed_cols, 1) > 0 THEN
      INSERT INTO public.sf_fund_audit_log (
        fund_id, user_id, user_email, action, changed_fields, old_values, new_values
      ) VALUES (
        NEW.id,
        current_user_id,
        current_user_email,
        'UPDATE',
        changed_cols,
        old_data,
        new_data
      );
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.sf_fund_audit_log (
      fund_id, user_id, user_email, action, changed_fields, old_values, new_values
    ) VALUES (
      OLD.id,
      current_user_id,
      current_user_email,
      'DELETE',
      NULL,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on sf_funds table
CREATE TRIGGER trg_sf_fund_audit
AFTER INSERT OR UPDATE OR DELETE ON public.sf_funds
FOR EACH ROW
EXECUTE FUNCTION public.log_sf_fund_changes();