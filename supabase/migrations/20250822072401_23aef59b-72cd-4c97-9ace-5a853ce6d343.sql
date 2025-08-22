-- Phase 2: Add RLS policies for remaining public tables

-- 1. newsletter_subscribers RLS policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure newsletter subscription" ON public.newsletter_subscribers
FOR INSERT 
WITH CHECK (
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  length(email) >= 5
);

-- 2. tool_ratings RLS policies  
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tool ratings" ON public.tool_ratings
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Anyone can view tool ratings" ON public.tool_ratings
FOR SELECT 
USING (true);

CREATE POLICY "Secure tool rating creation" ON public.tool_ratings
FOR INSERT 
WITH CHECK (
  ease_of_use >= 1 AND ease_of_use <= 5 AND
  result_accuracy >= 1 AND result_accuracy <= 5 AND
  recommendation >= 1 AND recommendation <= 5
);