-- ============================================
-- SOFT DELETE SYSTEM FOR CONTACTS
-- Add soft delete columns to 6 contact tables
-- ============================================

-- 1. contact_leads
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 2. company_valuations
ALTER TABLE public.company_valuations
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
-- Note: is_deleted and deleted_at already exist

-- 3. collaborator_applications
ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 4. acquisition_leads
ALTER TABLE public.acquisition_leads
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 5. company_acquisition_inquiries
ALTER TABLE public.company_acquisition_inquiries
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 6. general_contact_leads (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'general_contact_leads') THEN
        ALTER TABLE public.general_contact_leads
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
    END IF;
END $$;

-- ============================================
-- TRIGGER FUNCTION FOR AUTOMATIC TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION public.set_deleted_at_contacts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_deleted is being set to true, set deleted_at timestamp
  IF NEW.is_deleted = TRUE AND (OLD.is_deleted IS NULL OR OLD.is_deleted = FALSE) THEN
    NEW.deleted_at = now();
  END IF;
  
  -- If is_deleted is being set to false (restoration), clear deleted_at
  IF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
    NEW.deleted_at = NULL;
    NEW.deletion_reason = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- APPLY TRIGGERS TO ALL CONTACT TABLES
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.contact_leads;
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.company_valuations;
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.collaborator_applications;
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.acquisition_leads;
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.company_acquisition_inquiries;
DROP TRIGGER IF EXISTS set_deleted_at_trigger ON public.general_contact_leads;

-- Create triggers for each table
CREATE TRIGGER set_deleted_at_trigger
BEFORE UPDATE ON public.contact_leads
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at_contacts();

CREATE TRIGGER set_deleted_at_trigger
BEFORE UPDATE ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at_contacts();

CREATE TRIGGER set_deleted_at_trigger
BEFORE UPDATE ON public.collaborator_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at_contacts();

CREATE TRIGGER set_deleted_at_trigger
BEFORE UPDATE ON public.acquisition_leads
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at_contacts();

CREATE TRIGGER set_deleted_at_trigger
BEFORE UPDATE ON public.company_acquisition_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at_contacts();

-- Create trigger for general_contact_leads if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'general_contact_leads') THEN
        CREATE TRIGGER set_deleted_at_trigger
        BEFORE UPDATE ON public.general_contact_leads
        FOR EACH ROW
        EXECUTE FUNCTION public.set_deleted_at_contacts();
    END IF;
END $$;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contact_leads_is_deleted ON public.contact_leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_company_valuations_is_deleted ON public.company_valuations(is_deleted);
CREATE INDEX IF NOT EXISTS idx_collaborator_applications_is_deleted ON public.collaborator_applications(is_deleted);
CREATE INDEX IF NOT EXISTS idx_acquisition_leads_is_deleted ON public.acquisition_leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_company_acquisition_inquiries_is_deleted ON public.company_acquisition_inquiries(is_deleted);

-- Create index for general_contact_leads if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'general_contact_leads') THEN
        CREATE INDEX IF NOT EXISTS idx_general_contact_leads_is_deleted ON public.general_contact_leads(is_deleted);
    END IF;
END $$;