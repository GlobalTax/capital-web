
-- Habilitar RLS en la tabla case_studies si no está habilitado
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir a los administradores acceso completo a case_studies
CREATE POLICY "Admins can view all case studies" ON case_studies
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert case studies" ON case_studies
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update case studies" ON case_studies
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete case studies" ON case_studies
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Permitir acceso público de lectura para casos activos (para mostrar en la web pública)
CREATE POLICY "Public can view active case studies" ON case_studies
  FOR SELECT 
  USING (is_active = true);

-- Aplicar las mismas políticas para todas las otras tablas de administración
-- Políticas para company_operations
ALTER TABLE company_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all operations" ON company_operations
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert operations" ON company_operations
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update operations" ON company_operations
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete operations" ON company_operations
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view active operations" ON company_operations
  FOR SELECT 
  USING (is_active = true);

-- Políticas para sector_valuation_multiples
ALTER TABLE sector_valuation_multiples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all multiples" ON sector_valuation_multiples
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert multiples" ON sector_valuation_multiples
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update multiples" ON sector_valuation_multiples
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete multiples" ON sector_valuation_multiples
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view active multiples" ON sector_valuation_multiples
  FOR SELECT 
  USING (is_active = true);

-- Políticas para testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all testimonials" ON testimonials
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert testimonials" ON testimonials
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update testimonials" ON testimonials
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete testimonials" ON testimonials
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT 
  USING (is_active = true);

-- Políticas para key_statistics
ALTER TABLE key_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all statistics" ON key_statistics
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert statistics" ON key_statistics
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update statistics" ON key_statistics
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete statistics" ON key_statistics
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view active statistics" ON key_statistics
  FOR SELECT 
  USING (is_active = true);
