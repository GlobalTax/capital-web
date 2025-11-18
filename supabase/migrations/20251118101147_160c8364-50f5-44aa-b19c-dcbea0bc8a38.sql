-- =====================================================
-- Sprint 4: Document Management System
-- Unique table names to avoid conflicts
-- =====================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('operation-documents', 'operation-documents', false, 52428800, ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv'
  ]),
  ('note-attachments', 'note-attachments', false, 10485760, ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ])
ON CONFLICT (id) DO NOTHING;

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'nda',
    'financial_statements',
    'due_diligence',
    'legal',
    'contracts',
    'presentations',
    'reports',
    'correspondence',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'rejected',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE access_level AS ENUM (
    'internal',
    'client',
    'public'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create operation_documents table
CREATE TABLE IF NOT EXISTS public.operation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES public.company_operations(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  
  -- Document metadata
  title TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL DEFAULT 'other',
  status document_status NOT NULL DEFAULT 'draft',
  access_level access_level NOT NULL DEFAULT 'internal',
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  parent_document_id UUID REFERENCES public.operation_documents(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN NOT NULL DEFAULT true,
  
  -- Tags and search
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Audit fields
  uploaded_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0,
  
  -- Soft delete
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800),
  CONSTRAINT valid_version CHECK (version > 0)
);

-- Create operation_document_downloads table (unique name to avoid conflicts)
CREATE TABLE IF NOT EXISTS public.operation_document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.operation_documents(id) ON DELETE CASCADE,
  downloaded_by UUID,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_operation_documents_operation_id ON public.operation_documents(operation_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_operation_documents_category ON public.operation_documents(category) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_operation_documents_status ON public.operation_documents(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_operation_documents_uploaded_by ON public.operation_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_operation_documents_parent_id ON public.operation_documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_operation_documents_latest ON public.operation_documents(operation_id, is_latest_version) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_operation_documents_tags ON public.operation_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_operation_document_downloads_doc_id ON public.operation_document_downloads(document_id);
CREATE INDEX IF NOT EXISTS idx_operation_document_downloads_user ON public.operation_document_downloads(downloaded_by);
CREATE INDEX IF NOT EXISTS idx_operation_document_downloads_date ON public.operation_document_downloads(downloaded_at);

-- Triggers
CREATE OR REPLACE FUNCTION update_operation_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_operation_documents_updated_at ON public.operation_documents;
CREATE TRIGGER trigger_update_operation_documents_updated_at
  BEFORE UPDATE ON public.operation_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_operation_documents_updated_at();

CREATE OR REPLACE FUNCTION manage_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_document_id IS NOT NULL THEN
    UPDATE public.operation_documents
    SET is_latest_version = false
    WHERE operation_id = NEW.operation_id
      AND (id = NEW.parent_document_id OR parent_document_id = NEW.parent_document_id)
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_manage_document_version ON public.operation_documents;
CREATE TRIGGER trigger_manage_document_version
  AFTER INSERT ON public.operation_documents
  FOR EACH ROW
  EXECUTE FUNCTION manage_document_version();

CREATE OR REPLACE FUNCTION set_document_deleted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    NEW.deleted_at = now();
    NEW.deleted_by = auth.uid();
  END IF;
  IF NEW.is_deleted = false AND OLD.is_deleted = true THEN
    NEW.deleted_at = NULL;
    NEW.deleted_by = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_document_deleted_at ON public.operation_documents;
CREATE TRIGGER trigger_set_document_deleted_at
  BEFORE UPDATE ON public.operation_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_document_deleted_at();

-- RLS Policies for operation_documents
ALTER TABLE public.operation_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access to operation docs" ON public.operation_documents;
CREATE POLICY "Admins full access to operation docs"
  ON public.operation_documents FOR ALL TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view accessible operation docs" ON public.operation_documents;
CREATE POLICY "Users view accessible operation docs"
  ON public.operation_documents FOR SELECT TO authenticated
  USING (
    is_deleted = false AND (
      uploaded_by = auth.uid() OR
      access_level IN ('public', 'client') OR
      is_user_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users upload operation docs" ON public.operation_documents;
CREATE POLICY "Users upload operation docs"
  ON public.operation_documents FOR INSERT TO authenticated
  WITH CHECK (is_user_admin(auth.uid()) AND uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users update own operation docs" ON public.operation_documents;
CREATE POLICY "Users update own operation docs"
  ON public.operation_documents FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR is_user_admin(auth.uid()))
  WITH CHECK (uploaded_by = auth.uid() OR is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete operation docs" ON public.operation_documents;
CREATE POLICY "Admins delete operation docs"
  ON public.operation_documents FOR DELETE TO authenticated
  USING (is_user_admin(auth.uid()));

-- RLS Policies for operation_document_downloads
ALTER TABLE public.operation_document_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all operation downloads" ON public.operation_document_downloads;
CREATE POLICY "Admins view all operation downloads"
  ON public.operation_document_downloads FOR SELECT TO authenticated
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view their operation downloads" ON public.operation_document_downloads;
CREATE POLICY "Users view their operation downloads"
  ON public.operation_document_downloads FOR SELECT TO authenticated
  USING (downloaded_by = auth.uid());

DROP POLICY IF EXISTS "Log operation downloads" ON public.operation_document_downloads;
CREATE POLICY "Log operation downloads"
  ON public.operation_document_downloads FOR INSERT TO authenticated
  WITH CHECK (true);

-- Storage Policies
DROP POLICY IF EXISTS "Admins upload operation documents" ON storage.objects;
CREATE POLICY "Admins upload operation documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'operation-documents' AND is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins view operation documents" ON storage.objects;
CREATE POLICY "Admins view operation documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'operation-documents' AND is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update operation documents" ON storage.objects;
CREATE POLICY "Admins update operation documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'operation-documents' AND is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete operation documents" ON storage.objects;
CREATE POLICY "Admins delete operation documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'operation-documents' AND is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Users upload note attachments" ON storage.objects;
CREATE POLICY "Users upload note attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'note-attachments' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users view note attachments" ON storage.objects;
CREATE POLICY "Users view note attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'note-attachments' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users delete note attachments" ON storage.objects;
CREATE POLICY "Users delete note attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'note-attachments' AND auth.uid() IS NOT NULL);

-- Permissions
GRANT ALL ON public.operation_documents TO authenticated;
GRANT ALL ON public.operation_document_downloads TO authenticated;

COMMENT ON TABLE public.operation_documents IS 'Documents for M&A operations';
COMMENT ON TABLE public.operation_document_downloads IS 'Audit trail for operation document downloads';