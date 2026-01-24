-- Create table for empresas table column configuration
CREATE TABLE public.empresas_table_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  column_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT NULL,
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  width TEXT DEFAULT 'auto',
  is_sortable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.empresas_table_columns ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read columns
CREATE POLICY "Authenticated users can read empresas columns"
ON public.empresas_table_columns
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update columns (for reordering, visibility)
CREATE POLICY "Authenticated users can update empresas columns"
ON public.empresas_table_columns
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_empresas_table_columns_updated_at
BEFORE UPDATE ON public.empresas_table_columns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default columns
INSERT INTO public.empresas_table_columns (column_key, label, icon, position, is_visible, is_sortable) VALUES
  ('favorito', '⭐', 'Star', 1, true, false),
  ('nombre', 'Empresa', 'Building2', 2, true, true),
  ('sector', 'Sector', 'Briefcase', 3, true, true),
  ('ubicacion', 'Ubicación', 'MapPin', 4, true, true),
  ('empleados', 'Empleados', 'Users', 5, false, true),
  ('facturacion', 'Facturación', 'TrendingUp', 6, true, true),
  ('ebitda', 'EBITDA', 'BarChart3', 7, true, true),
  ('margen', 'Margen %', 'Percent', 8, true, true),
  ('deuda', 'Deuda', 'Landmark', 9, false, true),
  ('founded_year', 'Año Fund.', 'Calendar', 10, false, true),
  ('cnae_codigo', 'CNAE', 'Hash', 11, false, true),
  ('apollo_intent', 'Intent', 'Target', 12, false, true),
  ('apollo_score', 'Score', 'Star', 13, false, true),
  ('estado', 'Estado', 'Tag', 14, true, false),
  ('acciones', '', 'MoreHorizontal', 15, true, false);