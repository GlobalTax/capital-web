
CREATE TABLE public.dealsuite_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (deal_id)
);

ALTER TABLE public.dealsuite_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all dealsuite favorites"
ON public.dealsuite_favorites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert dealsuite favorites"
ON public.dealsuite_favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Authenticated users can delete dealsuite favorites"
ON public.dealsuite_favorites FOR DELETE
TO authenticated
USING (true);
