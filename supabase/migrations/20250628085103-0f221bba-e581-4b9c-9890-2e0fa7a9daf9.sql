
-- Habilitar Row Level Security en las tablas del carrusel
ALTER TABLE public.carousel_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_testimonials ENABLE ROW LEVEL SECURITY;

-- Políticas para carousel_logos
-- Permitir lectura pública para logos activos
CREATE POLICY "Anyone can view active carousel logos" 
  ON public.carousel_logos 
  FOR SELECT 
  USING (is_active = true);

-- Solo administradores pueden insertar logos
CREATE POLICY "Only admins can insert carousel logos" 
  ON public.carousel_logos 
  FOR INSERT 
  WITH CHECK (public.current_user_is_admin());

-- Solo administradores pueden actualizar logos
CREATE POLICY "Only admins can update carousel logos" 
  ON public.carousel_logos 
  FOR UPDATE 
  USING (public.current_user_is_admin());

-- Solo administradores pueden eliminar logos
CREATE POLICY "Only admins can delete carousel logos" 
  ON public.carousel_logos 
  FOR DELETE 
  USING (public.current_user_is_admin());

-- Políticas para carousel_testimonials
-- Permitir lectura pública para testimoniales activos
CREATE POLICY "Anyone can view active carousel testimonials" 
  ON public.carousel_testimonials 
  FOR SELECT 
  USING (is_active = true);

-- Solo administradores pueden insertar testimoniales
CREATE POLICY "Only admins can insert carousel testimonials" 
  ON public.carousel_testimonials 
  FOR INSERT 
  WITH CHECK (public.current_user_is_admin());

-- Solo administradores pueden actualizar testimoniales
CREATE POLICY "Only admins can update carousel testimonials" 
  ON public.carousel_testimonials 
  FOR UPDATE 
  USING (public.current_user_is_admin());

-- Solo administradores pueden eliminar testimoniales
CREATE POLICY "Only admins can delete carousel testimonials" 
  ON public.carousel_testimonials 
  FOR DELETE 
  USING (public.current_user_is_admin());
