-- Tabla para los pasos del proceso de venta
CREATE TABLE venta_empresas_process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Search',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para las comparaciones (Capittal vs Por Tu Cuenta)
CREATE TABLE venta_empresas_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspect TEXT NOT NULL,
  with_capittal TEXT NOT NULL,
  without_capittal TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para testimonios de venta de empresas
CREATE TABLE venta_empresas_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  sector TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  price_increase TEXT NOT NULL,
  time_to_sale TEXT NOT NULL,
  valuation TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE venta_empresas_process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_empresas_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_empresas_testimonials ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Public read access for process steps"
  ON venta_empresas_process_steps
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for comparisons"
  ON venta_empresas_comparisons
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for testimonials"
  ON venta_empresas_testimonials
  FOR SELECT
  USING (is_active = true);

-- Políticas de administración (requiere autenticación)
CREATE POLICY "Authenticated users can manage process steps"
  ON venta_empresas_process_steps
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage comparisons"
  ON venta_empresas_comparisons
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage testimonials"
  ON venta_empresas_testimonials
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_venta_empresas_process_steps_updated_at
  BEFORE UPDATE ON venta_empresas_process_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venta_empresas_comparisons_updated_at
  BEFORE UPDATE ON venta_empresas_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venta_empresas_testimonials_updated_at
  BEFORE UPDATE ON venta_empresas_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales para los pasos del proceso
INSERT INTO venta_empresas_process_steps (step_number, title, description, duration, icon_name, display_order) VALUES
(1, 'Valoración Inicial', 'Análisis completo de tu empresa para determinar su valor de mercado real y potencial de optimización.', '48-72 horas', 'Search', 1),
(2, 'Preparación y Optimización', 'Preparamos tu empresa para maximizar su atractivo y valor ante potenciales compradores.', '3-4 semanas', 'FileText', 2),
(3, 'Identificación de Compradores', 'Búsqueda y calificación de compradores estratégicos que valoren al máximo tu empresa.', '6-10 semanas', 'Users', 3),
(4, 'Negociación y Estructuración', 'Gestión profesional de ofertas y negociación de términos óptimos para la transacción.', '4-8 semanas', 'Handshake', 4),
(5, 'Cierre de Operación', 'Finalización de due diligence y firma de acuerdos definitivos para el cierre exitoso.', '6-12 semanas', 'CheckCircle', 5);

-- Insertar datos iniciales para las comparaciones
INSERT INTO venta_empresas_comparisons (aspect, with_capittal, without_capittal, is_critical, display_order) VALUES
('Precio de Venta', 'Precio optimizado hasta +40% sobre valor inicial', 'Precio basado en intuición o primera oferta', true, 1),
('Tiempo de Venta', '4-9 meses con proceso estructurado', '1-3 años o más con múltiples intentos fallidos', false, 2),
('Confidencialidad', 'NDA profesional con todos los compradores', 'Alto riesgo de filtración a empleados y competencia', false, 3),
('Due Diligence', 'Documentación preparada profesionalmente', 'Preparación deficiente que reduce el precio', false, 4),
('Negociación', 'Expertos negociadores con +200 operaciones', 'Negociación emocional sin experiencia', false, 5),
('Compradores', 'Acceso a red exclusiva de +5,000 inversores', 'Limitado a tu red personal o intermediarios generalistas', false, 6),
('Aspectos Fiscales', 'Optimización fiscal con equipo especializado', 'Posible pérdida de ahorros fiscales significativos', false, 7),
('Estrés y Tiempo', 'Nosotros gestionamos todo mientras tú diriges tu empresa', 'Dedicación de 20+ horas semanales durante meses', false, 8),
('Garantías', 'Garantía de mejora de precio o no cobras', 'Sin garantías ni protección profesional', false, 9),
('Soporte Legal', 'Equipo legal experto en M&A incluido', 'Necesitas contratar (y pagar) múltiples asesores', false, 10);

-- Insertar datos iniciales para testimonios
INSERT INTO venta_empresas_testimonials (name, position, company, sector, avatar_initials, rating, quote, price_increase, time_to_sale, valuation, display_order) VALUES
('Carlos M.', 'CEO', 'Empresa Tecnológica', 'SaaS', 'CM', 5, 'Capittal superó nuestras expectativas. No solo conseguimos un precio un 35% superior al que esperábamos, sino que el proceso fue completamente confidencial y profesional. Su equipo nos acompañó en cada paso.', '+35%', '6 meses', '€2.8M', 1),
('María L.', 'Fundadora', 'Distribuidora Regional', 'Distribución', 'ML', 5, 'Después de 25 años al frente de la empresa, Capittal me ayudó a conseguir la mejor operación posible. Su red de compradores cualificados y su experiencia en negociación fueron clave para cerrar la operación en tiempo récord.', '+28%', '4 meses', '€4.2M', 2),
('Javier R.', 'Socio Fundador', 'Consultoría Especializada', 'Servicios Profesionales', 'JR', 5, 'La valoración inicial fue precisa y realista. Durante todo el proceso, Capittal nos mantuvo informados y manejó las negociaciones de forma experta. El resultado final superó nuestras expectativas iniciales.', '+42%', '7 meses', '€1.5M', 3),
('Ana G.', 'Directora General', 'Empresa Industrial', 'Manufactura', 'AG', 5, 'Tenía dudas sobre el proceso de venta, pero Capittal hizo que todo fuera transparente y sencillo. Su equipo es muy profesional y me sentí acompañada en todo momento. Recomiendo 100% sus servicios.', '+31%', '8 meses', '€3.6M', 4),
('Roberto S.', 'Co-fundador', 'E-commerce Retail', 'Comercio Electrónico', 'RS', 5, 'La experiencia con Capittal fue excepcional. Desde el primer día demostraron un conocimiento profundo de nuestro sector. Consiguieron múltiples ofertas competitivas que elevaron el precio final significativamente.', '+48%', '5 meses', '€2.1M', 5),
('Laura P.', 'CEO', 'Empresa de Servicios', 'Consultoría', 'LP', 5, 'Capittal nos ayudó a estructurar la operación de forma óptima desde el punto de vista fiscal. Su red de contactos nos permitió acceder a compradores que no habríamos encontrado por nuestra cuenta.', '+39%', '6 meses', '€1.9M', 6);