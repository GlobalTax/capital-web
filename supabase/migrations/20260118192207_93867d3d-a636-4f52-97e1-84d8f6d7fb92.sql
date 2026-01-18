-- Create favorites table for M&A Boutiques
CREATE TABLE public.mna_boutique_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID REFERENCES public.mna_boutiques(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (boutique_id)
);

-- Enable Row Level Security
ALTER TABLE public.mna_boutique_favorites ENABLE ROW LEVEL SECURITY;

-- Shared team policies (same pattern as empresa_favorites)
CREATE POLICY "Authenticated users can view all mna boutique favorites" 
  ON public.mna_boutique_favorites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert mna boutique favorites" 
  ON public.mna_boutique_favorites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mna boutique favorites" 
  ON public.mna_boutique_favorites FOR DELETE TO authenticated USING (true);