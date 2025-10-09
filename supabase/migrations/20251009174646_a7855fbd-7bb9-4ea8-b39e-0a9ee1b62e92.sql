-- ============================================
-- JOB POSTS SYSTEM - COMPLETE DATABASE SETUP
-- ============================================

-- 1. CREATE TABLES
-- ============================================

-- 1.1 Job Categories
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Job Posts
CREATE TABLE public.job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL DEFAULT 'Capittal',
  category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
  
  -- Description
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  
  -- Location
  location TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT false,
  is_hybrid BOOLEAN DEFAULT false,
  
  -- Contract and compensation
  contract_type TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT '€',
  salary_period TEXT DEFAULT 'annual',
  is_salary_visible BOOLEAN DEFAULT false,
  
  -- Experience and sector
  experience_level TEXT,
  sector TEXT,
  required_languages TEXT[],
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  
  -- Dates
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Management
  created_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  
  -- Application
  application_method TEXT NOT NULL DEFAULT 'internal',
  application_email TEXT,
  application_url TEXT,
  
  -- Display
  featured_image_url TEXT,
  display_locations TEXT[] DEFAULT ARRAY['careers']
);

-- 1.3 Job Applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Candidate info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Location
  current_location TEXT,
  willing_to_relocate BOOLEAN DEFAULT false,
  
  -- Experience
  years_of_experience INTEGER,
  current_position TEXT,
  current_company TEXT,
  education_level TEXT,
  
  -- Application
  cover_letter TEXT,
  cv_url TEXT,
  additional_documents_urls TEXT[],
  
  -- Availability
  availability TEXT,
  expected_salary_min NUMERIC,
  expected_salary_max NUMERIC,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  
  -- Tracking
  reviewed_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  interview_scheduled_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  deletion_reason TEXT
);

-- 1.4 Job Application Activities
CREATE TABLE public.job_application_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX idx_job_posts_status ON public.job_posts(status);
CREATE INDEX idx_job_posts_category ON public.job_posts(category_id);
CREATE INDEX idx_job_posts_published_at ON public.job_posts(published_at);
CREATE INDEX idx_job_posts_featured ON public.job_posts(is_featured);
CREATE INDEX idx_job_posts_slug ON public.job_posts(slug);

CREATE INDEX idx_job_applications_job_post ON public.job_applications(job_post_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_created_at ON public.job_applications(created_at);
CREATE INDEX idx_job_applications_email ON public.job_applications(email);

CREATE INDEX idx_job_activities_application ON public.job_application_activities(application_id);

-- 3. CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- 3.1 Update updated_at triggers
CREATE TRIGGER update_job_posts_updated_at
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_categories_updated_at
  BEFORE UPDATE ON public.job_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3.2 Increment application count
CREATE OR REPLACE FUNCTION public.increment_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.job_posts 
  SET application_count = application_count + 1 
  WHERE id = NEW.job_post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER increment_application_count_trigger
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_job_application_count();

-- 3.3 Log status changes
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.job_application_activities (
      application_id,
      activity_type,
      description,
      performed_by,
      metadata
    ) VALUES (
      NEW.id,
      'status_change',
      'Estado cambiado de ' || OLD.status || ' a ' || NEW.status,
      NEW.reviewed_by,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_status_change_trigger
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_status_change();

-- 4. ENABLE RLS
-- ============================================

ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_application_activities ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- ============================================

-- 5.1 job_categories policies
CREATE POLICY "Anyone can view active categories"
  ON public.job_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.job_categories FOR ALL
  USING (current_user_is_admin());

-- 5.2 job_posts policies
CREATE POLICY "Anyone can view published jobs"
  ON public.job_posts FOR SELECT
  USING (
    status = 'published' 
    AND published_at <= now()
    AND (closes_at IS NULL OR closes_at >= now())
  );

CREATE POLICY "Admins can manage all job posts"
  ON public.job_posts FOR ALL
  USING (current_user_is_admin());

-- 5.3 job_applications policies
CREATE POLICY "Secure job application submission"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    check_rate_limit_enhanced_safe(
      COALESCE(inet_client_addr()::text, 'unknown'),
      'job_application',
      3,
      1440
    )
    AND full_name IS NOT NULL
    AND length(TRIM(full_name)) >= 2
    AND length(TRIM(full_name)) <= 100
    AND email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND job_post_id IS NOT NULL
  );

CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (current_user_is_admin());

CREATE POLICY "Admins can update applications"
  ON public.job_applications FOR UPDATE
  USING (current_user_is_admin());

CREATE POLICY "Admins can delete applications"
  ON public.job_applications FOR DELETE
  USING (current_user_is_admin());

-- 5.4 job_application_activities policies
CREATE POLICY "Admins can view activities"
  ON public.job_application_activities FOR SELECT
  USING (current_user_is_admin());

CREATE POLICY "System can insert activities"
  ON public.job_application_activities FOR INSERT
  WITH CHECK (true);

-- 6. CREATE STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('job-applications', 'job-applications', false)
ON CONFLICT (id) DO NOTHING;

-- 6.1 Storage RLS policies
CREATE POLICY "Admins can view all job application files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'job-applications' 
    AND current_user_is_admin()
  );

CREATE POLICY "Anyone can upload files during application"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'job-applications'
    AND (storage.foldername(name))[1] = 'cvs'
  );

CREATE POLICY "Admins can delete job application files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'job-applications' 
    AND current_user_is_admin()
  );

-- 7. INSERT INITIAL DATA
-- ============================================

INSERT INTO public.job_categories (name, slug, description, icon, display_order, is_active) VALUES
('M&A y Valoraciones', 'ma-valoraciones', 'Fusiones, adquisiciones y valoración de empresas', 'TrendingUp', 1, true),
('Consultoría Financiera', 'consultoria-financiera', 'Asesoramiento financiero estratégico', 'Calculator', 2, true),
('Due Diligence', 'due-diligence', 'Análisis y auditoría empresarial', 'Search', 3, true),
('Reestructuraciones', 'reestructuraciones', 'Reestructuración empresarial y financiera', 'GitBranch', 4, true),
('Desarrollo de Negocio', 'desarrollo-negocio', 'Business development y ventas', 'Target', 5, true),
('Tecnología y Datos', 'tecnologia-datos', 'IT, análisis de datos y tecnología', 'Code', 6, true),
('Administración', 'administracion', 'Roles administrativos y soporte', 'FileText', 7, true),
('Prácticas', 'practicas', 'Programas de prácticas profesionales', 'GraduationCap', 8, true)
ON CONFLICT (slug) DO NOTHING;