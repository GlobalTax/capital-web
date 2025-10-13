-- ============================================================
-- FASE 1: Sistema de Gestión de Documentos
-- Base de Datos y Storage
-- ============================================================

-- 1. TABLA DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('lead_magnet', 'sector_report', 'case_study', 'client_report', 'internal')),
  category TEXT NOT NULL CHECK (category IN ('report', 'whitepaper', 'checklist', 'template', 'guide', 'presentation')),
  sector TEXT,
  
  -- Storage
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type TEXT,
  thumbnail_url TEXT,
  
  -- Access Control
  access_level TEXT NOT NULL DEFAULT 'gated' CHECK (access_level IN ('public', 'gated', 'authenticated', 'admin')),
  requires_form BOOLEAN DEFAULT true,
  
  -- Metadata
  author_name TEXT DEFAULT 'Equipo Capittal',
  tags TEXT[],
  target_audience TEXT[],
  reading_time_minutes INTEGER,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  lead_conversion_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.documents(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(user_id),
  
  -- Landing Page Integration
  landing_page_id UUID,
  cta_text TEXT DEFAULT 'Descargar ahora',
  
  CONSTRAINT valid_published_at CHECK (status = 'published' OR published_at IS NULL)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_slug ON public.documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_sector ON public.documents(sector);
CREATE INDEX IF NOT EXISTS idx_documents_published_at ON public.documents(published_at DESC) WHERE status = 'published';

-- 2. TABLA DOCUMENT_DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  -- User Info (capturado del formulario o auth)
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_company TEXT,
  user_phone TEXT,
  user_position TEXT,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Download Details
  download_method TEXT CHECK (download_method IN ('direct', 'email', 'link')),
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Analytics
  page_url TEXT,
  session_id TEXT,
  visitor_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_document_downloads_document_id ON public.document_downloads(document_id);
CREATE INDEX IF NOT EXISTS idx_document_downloads_email ON public.document_downloads(user_email);
CREATE INDEX IF NOT EXISTS idx_document_downloads_created_at ON public.document_downloads(created_at DESC);

-- 3. SUPABASE STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS POLICIES PARA STORAGE
-- ============================================================

-- Admins can upload documents
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  current_user_is_admin()
);

-- Admins can update documents
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  current_user_is_admin()
);

-- Admins can delete documents
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  current_user_is_admin()
);

-- Anyone can download public documents
DROP POLICY IF EXISTS "Anyone can download public documents" ON storage.objects;
CREATE POLICY "Anyone can download public documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.documents
    WHERE file_url LIKE '%' || name
    AND access_level = 'public' 
    AND status = 'published'
  )
);

-- Authenticated users can download gated documents after form submission
DROP POLICY IF EXISTS "Authenticated users can download after form" ON storage.objects;
CREATE POLICY "Authenticated users can download after form"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (
    -- Public documents
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE file_url LIKE '%' || name
      AND access_level = 'public'
      AND status = 'published'
    )
    OR
    -- Gated documents after download
    EXISTS (
      SELECT 1 FROM public.document_downloads dd
      JOIN public.documents d ON dd.document_id = d.id
      WHERE d.file_url LIKE '%' || name
      AND (
        dd.user_id = auth.uid()
        OR dd.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
    OR
    -- Admins can access everything
    current_user_is_admin()
  )
);

-- 5. RLS POLICIES PARA DOCUMENTS
-- ============================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Admins pueden gestionar todos los documentos
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;
CREATE POLICY "Admins can manage all documents"
ON public.documents FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Cualquiera puede ver documentos públicos publicados
DROP POLICY IF EXISTS "Anyone can view published documents" ON public.documents;
CREATE POLICY "Anyone can view published documents"
ON public.documents FOR SELECT
USING (status = 'published');

-- Usuarios autenticados pueden ver sus documentos descargados
DROP POLICY IF EXISTS "Users can view their downloaded documents" ON public.documents;
CREATE POLICY "Users can view their downloaded documents"
ON public.documents FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  id IN (
    SELECT document_id FROM public.document_downloads
    WHERE user_id = auth.uid()
  )
);

-- 6. RLS POLICIES PARA DOCUMENT_DOWNLOADS
-- ============================================================
ALTER TABLE public.document_downloads ENABLE ROW LEVEL SECURITY;

-- Sistema puede insertar descargas con rate limiting
DROP POLICY IF EXISTS "System can insert downloads" ON public.document_downloads;
CREATE POLICY "System can insert downloads"
ON public.document_downloads FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced_safe(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'document_download',
    5,
    60
  ) AND
  user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(user_email) <= 254
);

-- Admins pueden ver todas las descargas
DROP POLICY IF EXISTS "Admins can view all downloads" ON public.document_downloads;
CREATE POLICY "Admins can view all downloads"
ON public.document_downloads FOR SELECT
USING (current_user_is_admin());

-- Usuarios pueden ver sus propias descargas
DROP POLICY IF EXISTS "Users can view their own downloads" ON public.document_downloads;
CREATE POLICY "Users can view their own downloads"
ON public.document_downloads FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
);

-- 7. TRIGGERS PARA ACTUALIZAR CONTADORES
-- ============================================================

-- Función para incrementar download_count
CREATE OR REPLACE FUNCTION public.increment_document_download_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.documents
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar download_count
DROP TRIGGER IF EXISTS trigger_increment_download_count ON public.document_downloads;
CREATE TRIGGER trigger_increment_download_count
AFTER INSERT ON public.document_downloads
FOR EACH ROW
EXECUTE FUNCTION public.increment_document_download_count();

-- Trigger para actualizar updated_at en documents
DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================
COMMENT ON TABLE public.documents IS 'Sistema de gestión de documentos descargables (lead magnets, reportes, etc.)';
COMMENT ON TABLE public.document_downloads IS 'Registro de descargas de documentos con tracking completo';
COMMENT ON COLUMN public.documents.access_level IS 'public: libre acceso, gated: requiere formulario, authenticated: requiere login, admin: solo admins';
COMMENT ON COLUMN public.documents.requires_form IS 'Si es true, requiere completar formulario antes de descargar';
COMMENT ON COLUMN public.document_downloads.download_method IS 'direct: descarga directa, email: enviado por email, link: link temporal';