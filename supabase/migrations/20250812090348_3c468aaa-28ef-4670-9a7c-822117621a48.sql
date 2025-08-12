-- Secure company_valuations: enforce RLS and restrict read access

-- 1) Enable Row Level Security on the table (idempotent)
ALTER TABLE public.company_valuations ENABLE ROW LEVEL SECURITY;

-- 2) Ensure SELECT is restricted to admins only
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

-- 3) Ensure public INSERT remains allowed for the form
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_valuations'
      AND policyname = 'Anyone can insert company valuations'
  ) THEN
    CREATE POLICY "Anyone can insert company valuations"
      ON public.company_valuations
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 4) (Optional) Allow admins to update rows if needed by backoffice
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
