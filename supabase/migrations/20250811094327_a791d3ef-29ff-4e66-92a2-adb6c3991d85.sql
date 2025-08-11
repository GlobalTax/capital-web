-- Secure lead_scores: restrict SELECT to admins, keep writes for system triggers
BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to remove permissive access
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lead_scores'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lead_scores', pol.polname);
  END LOOP;
END
$$;

-- Admins can read everything
CREATE POLICY "Admins can select lead_scores"
ON public.lead_scores
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

-- Allow inserts from both anon and authenticated (used by triggers/processes)
CREATE POLICY "System can insert lead_scores"
ON public.lead_scores
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow updates from both anon and authenticated (used by triggers/processes)
CREATE POLICY "System can update lead_scores"
ON public.lead_scores
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

COMMIT;