CREATE TABLE IF NOT EXISTS public.rod_template_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rod_template_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rod template documents" ON public.rod_template_documents;
DROP POLICY IF EXISTS "Admins can insert rod template documents" ON public.rod_template_documents;
DROP POLICY IF EXISTS "Admins can update rod template documents" ON public.rod_template_documents;
DROP POLICY IF EXISTS "Admins can delete rod template documents" ON public.rod_template_documents;

CREATE POLICY "Admins can view rod template documents"
ON public.rod_template_documents
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

CREATE POLICY "Admins can insert rod template documents"
ON public.rod_template_documents
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can update rod template documents"
ON public.rod_template_documents
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can delete rod template documents"
ON public.rod_template_documents
FOR DELETE
TO authenticated
USING (public.current_user_is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS rod_template_documents_single_active_idx
ON public.rod_template_documents ((is_active))
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS rod_template_documents_created_at_idx
ON public.rod_template_documents (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_rod_template_documents_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_rod_template_documents_updated_at ON public.rod_template_documents;
CREATE TRIGGER set_rod_template_documents_updated_at
BEFORE UPDATE ON public.rod_template_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_rod_template_documents_updated_at();