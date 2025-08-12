-- Secure company_valuations: restrict INSERT to authenticated users only

-- 1) Ensure RLS is enabled
ALTER TABLE public.company_valuations ENABLE ROW LEVEL SECURITY;

-- 2) Drop any public insert policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_valuations'
      AND policyname = 'Anyone can insert company valuations'
  ) THEN
    DROP POLICY "Anyone can insert company valuations" ON public.company_valuations;
  END IF;
END $$;

-- 3) Create authenticated-only insert policy if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_valuations'
      AND policyname = 'Authenticated can insert company valuations'
  ) THEN
    CREATE POLICY "Authenticated can insert company valuations"
      ON public.company_valuations
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 4) Keep admin read/update policies in place (idempotent safeguards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_valuations'
      AND policyname = 'Admins can view company valuations'
  ) THEN
    CREATE POLICY "Admins can view company valuations"
      ON public.company_valuations
      FOR SELECT
      USING (current_user_is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_valuations'
      AND policyname = 'Admins can update company valuations'
  ) THEN
    CREATE POLICY "Admins can update company valuations"
      ON public.company_valuations
      FOR UPDATE
      USING (current_user_is_admin())
      WITH CHECK (current_user_is_admin());
  END IF;
END $$;
