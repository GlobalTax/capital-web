-- 1. Añadir los valores faltantes al enum lead_status
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'lead_perdido_curiosidad';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'ya_advisor';

-- 2. Crear policy de UPDATE explícita para admins en company_valuations
-- (resuelve conflicto con policy restrictiva existente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_valuations' 
    AND policyname = 'Admins can update company valuations status'
  ) THEN
    CREATE POLICY "Admins can update company valuations status"
    ON public.company_valuations 
    FOR UPDATE
    TO authenticated
    USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());
  END IF;
END $$;

-- 3. Crear policy de UPDATE para collaborator_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'collaborator_applications' 
    AND policyname = 'Admins can update collaborator applications'
  ) THEN
    CREATE POLICY "Admins can update collaborator applications"
    ON public.collaborator_applications 
    FOR UPDATE
    TO authenticated
    USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());
  END IF;
END $$;

-- 4. Crear policy de UPDATE para acquisition_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'acquisition_leads' 
    AND policyname = 'Admins can update acquisition leads'
  ) THEN
    CREATE POLICY "Admins can update acquisition leads"
    ON public.acquisition_leads 
    FOR UPDATE
    TO authenticated
    USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());
  END IF;
END $$;

-- 5. Crear policy de UPDATE para contact_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_leads' 
    AND policyname = 'Admins can update contact leads'
  ) THEN
    CREATE POLICY "Admins can update contact leads"
    ON public.contact_leads 
    FOR UPDATE
    TO authenticated
    USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());
  END IF;
END $$;

-- 6. Crear policy de UPDATE para general_contact_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'general_contact_leads' 
    AND policyname = 'Admins can update general contact leads'
  ) THEN
    CREATE POLICY "Admins can update general contact leads"
    ON public.general_contact_leads 
    FOR UPDATE
    TO authenticated
    USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());
  END IF;
END $$;