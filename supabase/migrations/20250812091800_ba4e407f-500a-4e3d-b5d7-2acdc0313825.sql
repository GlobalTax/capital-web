-- Secure company_valuations with strict RLS while keeping public form via Edge Function (service role)

-- 1) Ensure RLS is enabled and enforced
ALTER TABLE public.company_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_valuations FORCE ROW LEVEL SECURITY;

-- 2) Clean up any permissive legacy policies if they exist (best-effort)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'company_valuations'
      AND policyname IN (
        'Public can insert company valuations',
        'Allow public insert',
        'Allow public select',
        'Public can read company valuations'
      )
  ) THEN
    BEGIN
      DROP POLICY IF EXISTS "Public can insert company valuations" ON public.company_valuations;
      DROP POLICY IF EXISTS "Allow public insert" ON public.company_valuations;
      DROP POLICY IF EXISTS "Allow public select" ON public.company_valuations;
      DROP POLICY IF EXISTS "Public can read company valuations" ON public.company_valuations;
    EXCEPTION WHEN others THEN
      -- ignore if names don't exist
      NULL;
    END;
  END IF;
END $$;

-- 3) Create admin-only policies (using existing helper function current_user_is_admin())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'company_valuations' 
      AND policyname = 'Admins can select company_valuations'
  ) THEN
    CREATE POLICY "Admins can select company_valuations"
    ON public.company_valuations
    FOR SELECT
    USING (public.current_user_is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'company_valuations' 
      AND policyname = 'Admins can update company_valuations'
  ) THEN
    CREATE POLICY "Admins can update company_valuations"
    ON public.company_valuations
    FOR UPDATE
    USING (public.current_user_is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'company_valuations' 
      AND policyname = 'Admins can delete company_valuations'
  ) THEN
    CREATE POLICY "Admins can delete company_valuations"
    ON public.company_valuations
    FOR DELETE
    USING (public.current_user_is_admin());
  END IF;
END $$;

-- Note: No INSERT policy on purpose. Inserts must go through the Edge Function
-- using the service role key, which bypasses RLS safely.
