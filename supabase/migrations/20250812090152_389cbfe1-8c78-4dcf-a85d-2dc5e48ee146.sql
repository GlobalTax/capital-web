-- Secure collaborator_applications: ensure RLS is enabled and policies restrict SELECT to admins only, while allowing public INSERTs

-- 1) Enable Row Level Security on the table
ALTER TABLE public.collaborator_applications ENABLE ROW LEVEL SECURITY;

-- 2) Ensure SELECT policy exists and restricts to admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaborator_applications'
      AND policyname = 'Admins can view collaborator applications'
  ) THEN
    CREATE POLICY "Admins can view collaborator applications"
      ON public.collaborator_applications
      FOR SELECT
      USING (current_user_is_admin());
  END IF;
END $$;

-- 3) Ensure UPDATE policy for admins exists (optional management operations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaborator_applications'
      AND policyname = 'Admins can manage collaborator applications'
  ) THEN
    CREATE POLICY "Admins can manage collaborator applications"
      ON public.collaborator_applications
      FOR UPDATE
      USING (current_user_is_admin())
      WITH CHECK (current_user_is_admin());
  END IF;
END $$;

-- 4) Ensure INSERT policy for public form submissions exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'collaborator_applications'
      AND policyname = 'Anyone can insert collaborator applications'
  ) THEN
    CREATE POLICY "Anyone can insert collaborator applications"
      ON public.collaborator_applications
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
