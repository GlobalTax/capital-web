-- Arreglar políticas RLS para que los admins puedan gestionar datos críticos

-- 1. Contact Leads - Los admins deben poder ver y gestionar leads
DROP POLICY IF EXISTS "Admins can view contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can manage contact leads" ON public.contact_leads;

CREATE POLICY "Admins can view contact leads" 
  ON public.contact_leads 
  FOR SELECT 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage contact leads" 
  ON public.contact_leads 
  FOR UPDATE 
  USING (public.current_user_is_admin());

-- 2. Collaborator Applications - Los admins deben poder ver y gestionar solicitudes
DROP POLICY IF EXISTS "Admins can view collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Admins can manage collaborator applications" ON public.collaborator_applications;

CREATE POLICY "Admins can view collaborator applications" 
  ON public.collaborator_applications 
  FOR SELECT 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage collaborator applications" 
  ON public.collaborator_applications 
  FOR UPDATE 
  USING (public.current_user_is_admin());

-- 3. Blog Posts - Los admins deben poder gestionar posts
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 4. Case Studies - Los admins deben poder gestionar casos
DROP POLICY IF EXISTS "Admins can manage case studies" ON public.case_studies;

CREATE POLICY "Admins can manage case studies" 
  ON public.case_studies 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 5. Company Operations - Los admins deben poder gestionar operaciones  
DROP POLICY IF EXISTS "Admins can manage operations" ON public.company_operations;

CREATE POLICY "Admins can manage operations" 
  ON public.company_operations 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 6. Key Statistics - Los admins deben poder gestionar estadísticas
DROP POLICY IF EXISTS "Admins can manage statistics" ON public.key_statistics;

CREATE POLICY "Admins can manage statistics" 
  ON public.key_statistics 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 7. Sector Valuation Multiples - Los admins deben poder gestionar múltiplos
DROP POLICY IF EXISTS "Admins can manage multiples" ON public.sector_valuation_multiples;

CREATE POLICY "Admins can manage multiples" 
  ON public.sector_valuation_multiples 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 8. Testimonials - Los admins deben poder gestionar testimonios
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

CREATE POLICY "Admins can manage testimonials" 
  ON public.testimonials 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 9. Carousel Logos - Los admins deben poder gestionar logos
DROP POLICY IF EXISTS "Admins can manage carousel logos" ON public.carousel_logos;

CREATE POLICY "Admins can manage carousel logos" 
  ON public.carousel_logos 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 10. Carousel Testimonials - Los admins deben poder gestionar testimonios del carrusel
DROP POLICY IF EXISTS "Admins can manage carousel testimonials" ON public.carousel_testimonials;

CREATE POLICY "Admins can manage carousel testimonials" 
  ON public.carousel_testimonials 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 11. Team Members - Los admins deben poder gestionar equipo
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

CREATE POLICY "Admins can manage team members" 
  ON public.team_members 
  FOR ALL 
  USING (public.current_user_is_admin());

-- Comentarios para documentar los cambios
COMMENT ON TABLE public.contact_leads IS 'RLS: Los admins pueden ver y gestionar leads de contacto para seguimiento comercial';
COMMENT ON TABLE public.collaborator_applications IS 'RLS: Los admins pueden ver y gestionar solicitudes de colaboradores';
COMMENT ON TABLE public.blog_posts IS 'RLS: Los admins pueden gestionar completamente los posts del blog';
COMMENT ON TABLE public.case_studies IS 'RLS: Los admins pueden gestionar completamente los casos de éxito';
COMMENT ON TABLE public.company_operations IS 'RLS: Los admins pueden gestionar completamente las operaciones de la empresa';
COMMENT ON TABLE public.key_statistics IS 'RLS: Los admins pueden gestionar completamente las estadísticas clave';
COMMENT ON TABLE public.testimonials IS 'RLS: Los admins pueden gestionar completamente los testimonios';
COMMENT ON TABLE public.carousel_logos IS 'RLS: Los admins pueden gestionar completamente los logos del carrusel';
COMMENT ON TABLE public.carousel_testimonials IS 'RLS: Los admins pueden gestionar completamente los testimonios del carrusel';