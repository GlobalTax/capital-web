-- Create buyer_testimonials table
CREATE TABLE IF NOT EXISTS buyer_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  buyer_position TEXT NOT NULL,
  buyer_company TEXT NOT NULL,
  buyer_sector TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  operation_type TEXT,
  investment_range TEXT,
  time_to_close TEXT,
  satisfaction_score TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_buyer_testimonials_active ON buyer_testimonials(is_active) WHERE is_active = true;
CREATE INDEX idx_buyer_testimonials_display_order ON buyer_testimonials(display_order);

-- RLS Policies (public read access)
ALTER TABLE buyer_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON buyer_testimonials FOR SELECT
  USING (is_active = true);

-- Admin policies (authenticated users with admin role can modify)
CREATE POLICY "Admins can insert testimonials"
  ON buyer_testimonials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update testimonials"
  ON buyer_testimonials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete testimonials"
  ON buyer_testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_buyer_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_buyer_testimonials_updated_at
  BEFORE UPDATE ON buyer_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_buyer_testimonials_updated_at();

-- Insert sample testimonials
INSERT INTO buyer_testimonials (buyer_name, buyer_position, buyer_company, buyer_sector, avatar_initials, rating, testimonial_text, operation_type, investment_range, time_to_close, satisfaction_score, display_order) VALUES
('Carlos Méndez', 'CEO', 'Inversiones Mediterráneo', 'Inversión y Capital Privado', 'CM', 5, 'Gracias a Capittal encontramos exactamente el tipo de empresa que buscábamos. El proceso fue transparente, profesional y nos ahorramos meses de búsqueda. Altamente recomendable.', 'Adquisición Completa', '2-5M€', '4 meses', '9.5/10', 1),
('Laura Fernández', 'Directora de M&A', 'Grupo Industrial del Norte', 'Manufactura e Industria', 'LF', 5, 'La plataforma de Capittal nos dio acceso a operaciones exclusivas que no encontramos en ningún otro lugar. El equipo nos acompañó en todo el proceso hasta el cierre exitoso.', 'Mayoría', '5-10M€', '6 meses', '9.8/10', 2),
('Javier Ortiz', 'Socio Fundador', 'Tech Ventures Spain', 'Tecnología y Digital', 'JO', 5, 'Perfecta para inversores que buscan oportunidades serias. El nivel de información y la calidad de las operaciones es excepcional. Ya hemos cerrado dos adquisiciones con ellos.', 'Participación Minoritaria', '1-2M€', '3 meses', '9.7/10', 3),
('Ana Martínez', 'Managing Partner', 'Capital Growth Partners', 'Private Equity', 'AM', 4, 'Excelente servicio de intermediación. Nos ayudaron a identificar targets estratégicos y facilitaron todo el proceso de due diligence. Una experiencia muy profesional.', 'Adquisición Completa', '10M€+', '8 meses', '9.2/10', 4),
('Miguel Ruiz', 'Director de Inversiones', 'Family Office Iberia', 'Inversión Familiar', 'MR', 5, 'La mejor decisión fue trabajar con Capittal. Accedimos a operaciones confidenciales de alta calidad y el equipo nos asesoró de manera impecable en todo momento.', 'Mayoría', '3-5M€', '5 meses', '9.6/10', 5),
('Patricia Sánchez', 'CFO', 'Retail Investments Group', 'Retail y Consumo', 'PS', 5, 'Plataforma muy intuitiva y profesional. Encontramos nuestra empresa objetivo en tiempo récord. El soporte del equipo de Capittal fue fundamental para el éxito de la operación.', 'Adquisición Completa', '2-5M€', '4 meses', '9.4/10', 6);