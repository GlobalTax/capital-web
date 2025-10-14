-- ===== TABLA PRINCIPAL: rod_documents =====
CREATE TABLE IF NOT EXISTS public.rod_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel')),
  file_size_bytes BIGINT,
  description TEXT,
  
  -- Control de versiones
  is_active BOOLEAN DEFAULT false,
  is_latest BOOLEAN DEFAULT false,
  
  -- Estadísticas
  total_downloads INTEGER DEFAULT 0,
  
  -- Metadatos
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ===== ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_rod_documents_active 
  ON public.rod_documents(is_active) 
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_rod_documents_latest 
  ON public.rod_documents(is_latest) 
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_rod_documents_created_at 
  ON public.rod_documents(created_at DESC);

-- ===== TRIGGER: Solo una ROD activa =====
CREATE OR REPLACE FUNCTION public.ensure_single_active_rod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.rod_documents 
    SET 
      is_active = false, 
      deactivated_at = now(),
      updated_at = now()
    WHERE is_active = true 
      AND id != NEW.id
      AND is_deleted = false;
    
    NEW.activated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_single_active_rod
  BEFORE INSERT OR UPDATE ON public.rod_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_active_rod();

-- ===== TRIGGER: Updated_at automático =====
CREATE OR REPLACE FUNCTION public.update_rod_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_rod_documents_updated_at
  BEFORE UPDATE ON public.rod_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rod_documents_updated_at();

-- ===== RLS POLICIES =====
ALTER TABLE public.rod_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ROD documents"
  ON public.rod_documents FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Public can view active ROD metadata"
  ON public.rod_documents FOR SELECT
  USING (is_active = true AND is_deleted = false);

-- ===== MODIFICAR investor_leads para referenciar ROD =====
ALTER TABLE public.investor_leads 
ADD COLUMN IF NOT EXISTS rod_document_id UUID REFERENCES public.rod_documents(id);

CREATE INDEX IF NOT EXISTS idx_investor_leads_rod_document 
  ON public.investor_leads(rod_document_id);

-- ===== COMENTARIOS =====
COMMENT ON TABLE public.rod_documents IS 'Gestión de versiones de documentos ROD (Relación de Open Deals)';
COMMENT ON COLUMN public.rod_documents.is_active IS 'Solo una ROD puede estar activa (trigger enforce)';
COMMENT ON COLUMN public.rod_documents.total_downloads IS 'Contador incrementado por edge function al crear investor_lead';