-- Ensure Row Level Security is enabled and strict policies applied
ALTER TABLE public.collaborator_applications ENABLE ROW LEVEL SECURITY;

-- Admins can view collaborator applications
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

-- Admins can update collaborator applications
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
    USING (current_user_is_admin());
  END IF;
END $$;

-- Anyone can insert collaborator applications (for public form submissions)
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