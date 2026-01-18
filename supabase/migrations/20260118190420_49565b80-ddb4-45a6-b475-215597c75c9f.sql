-- Crear tabla de favoritos de empresas (mismo patrón que cr_favorites/sf_favorites)
CREATE TABLE public.empresa_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (empresa_id)
);

-- Habilitar RLS
ALTER TABLE public.empresa_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos los usuarios autenticados pueden ver/gestionar favoritos (compartido en equipo)
CREATE POLICY "Authenticated users can view all empresa favorites" 
  ON public.empresa_favorites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert empresa favorites" 
  ON public.empresa_favorites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete empresa favorites" 
  ON public.empresa_favorites FOR DELETE TO authenticated USING (true);

-- Índice para búsquedas rápidas
CREATE INDEX idx_empresa_favorites_empresa_id ON public.empresa_favorites(empresa_id);
CREATE INDEX idx_empresa_favorites_added_by ON public.empresa_favorites(added_by);