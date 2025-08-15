-- Priority 1: Fix Ad Conversions Table Security
-- Enable RLS on ad_conversions table
ALTER TABLE public.ad_conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all ad conversions
CREATE POLICY "Admins can view ad conversions" 
ON public.ad_conversions 
FOR SELECT 
USING (current_user_is_admin());

-- Policy: System/edge functions can insert conversion data
CREATE POLICY "System can insert ad conversions" 
ON public.ad_conversions 
FOR INSERT 
WITH CHECK (true);

-- Policy: Prevent unauthorized updates and deletes
CREATE POLICY "Admins can update ad conversions" 
ON public.ad_conversions 
FOR UPDATE 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Admins can delete ad conversions" 
ON public.ad_conversions 
FOR DELETE 
USING (current_user_is_admin());