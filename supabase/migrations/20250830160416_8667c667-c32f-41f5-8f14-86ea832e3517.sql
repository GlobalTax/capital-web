-- Create webinars table
CREATE TABLE public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  speaker_name TEXT NOT NULL,
  speaker_title TEXT NOT NULL,
  speaker_company TEXT,
  speaker_avatar_url TEXT,
  webinar_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  category TEXT NOT NULL,
  sector TEXT,
  tags TEXT[] DEFAULT '{}',
  attendee_count INTEGER DEFAULT 0,
  max_capacity INTEGER,
  registration_url TEXT,
  recording_url TEXT,
  materials_url TEXT,
  key_takeaways TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webinar registrations table
CREATE TABLE public.webinar_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  sector TEXT,
  years_experience TEXT,
  specific_interests TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webinars
CREATE POLICY "Anyone can view active webinars" 
ON public.webinars 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage webinars" 
ON public.webinars 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- RLS Policies for webinar registrations
CREATE POLICY "Admins can view all registrations" 
ON public.webinar_registrations 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Admins can manage registrations" 
ON public.webinar_registrations 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure webinar registration insert" 
ON public.webinar_registrations 
FOR INSERT 
WITH CHECK (
  webinar_id IS NOT NULL AND
  full_name IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'webinar_registration', 
    3, 
    1440
  )
);

-- Create indexes for performance
CREATE INDEX idx_webinars_date ON public.webinars(webinar_date DESC);
CREATE INDEX idx_webinars_category ON public.webinars(category);
CREATE INDEX idx_webinars_status ON public.webinars(status);
CREATE INDEX idx_webinar_registrations_webinar_id ON public.webinar_registrations(webinar_id);
CREATE INDEX idx_webinar_registrations_email ON public.webinar_registrations(email);

-- Create trigger for updated_at
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webinar_registrations_updated_at
  BEFORE UPDATE ON public.webinar_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 12 historical webinars
INSERT INTO public.webinars (
  title, description, short_description, speaker_name, speaker_title, speaker_company, 
  webinar_date, duration_minutes, status, category, sector, tags, attendee_count, 
  key_takeaways, is_featured, is_active
) VALUES
(
  'Valoración de Empresas: Métodos y Múltiplos Sectoriales',
  'Webinar completo sobre los diferentes métodos de valoración empresarial, enfocándose en DCF (Discounted Cash Flow), múltiplos comparables y análisis de precedentes. Incluye casos prácticos y herramientas Excel para aplicar inmediatamente.',
  'Aprende los métodos fundamentales de valoración empresarial con casos prácticos',
  'María González',
  'Partner & Managing Director',
  'Capittal',
  '2024-03-15 16:00:00+01',
  75,
  'completed',
  'Fundamentos M&A',
  'General',
  ARRAY['valoracion', 'dcf', 'multiplos', 'fundamentals'],
  347,
  ARRAY[
    'Metodología DCF paso a paso con proyecciones financieras',
    'Cálculo de múltiplos sectoriales: P/E, EV/EBITDA, EV/Sales',
    'Análisis de transacciones comparables en el mercado español',
    'Herramientas Excel para valoración automatizada'
  ],
  true,
  true
),
(
  'Due Diligence: Checklist Completo para Compradores',
  'Guía exhaustiva del proceso de due diligence en operaciones M&A. Cubre aspectos legales, financieros, comerciales, operativos y tecnológicos. Incluye templates y checklists descargables.',
  'Domina el proceso de due diligence con checklists y templates profesionales',
  'Carlos Ruiz',
  'Senior Director M&A',
  'Capittal',
  '2024-02-20 17:00:00+01',
  90,
  'completed',
  'Fundamentos M&A',
  'General',
  ARRAY['due-diligence', 'legal', 'financial', 'commercial'],
  289,
  ARRAY[
    'Checklist completo de due diligence legal y financiera',
    'Red flags más comunes en auditorías comerciales',
    'Evaluación de riesgos tecnológicos y sistemas IT',
    'Negociación de garantías basada en hallazgos de DD'
  ],
  true,
  true
),
(
  'Estructuras de Deal: Equity vs Asset Deal',
  'Análisis detallado de las diferentes estructuras de transacción en M&A. Implicaciones fiscales, legales y financieras de cada opción. Casos de uso específicos para diferentes sectores.',
  'Elige la estructura óptima para tu transacción M&A',
  'Ana Martín',
  'Legal & Tax Expert',
  'Martín & Asociados',
  '2024-01-25 16:30:00+01',
  60,
  'completed',
  'Fundamentos M&A',
  'Legal',
  ARRAY['estructuras', 'fiscal', 'legal', 'equity', 'asset'],
  156,
  ARRAY[
    'Diferencias clave entre compra de acciones y activos',
    'Optimización fiscal según estructura elegida',
    'Gestión de pasivos contingentes en asset deals',
    'Casos prácticos por sectores: tech, retail, manufacturing'
  ],
  false,
  true
),
(
  'M&A en Tecnología: Valuations y Tendencias 2024',
  'Análisis específico del sector tecnológico en M&A. Métrica de valoración para SaaS, fintech, e-commerce. Tendencias de mercado y casos de éxito recientes en España y Europa.',
  'Descubre las claves de valoración en el sector tech',
  'David López',
  'Tech Investment Director',
  'Capittal',
  '2024-04-10 18:00:00+02',
  85,
  'completed',
  'Sectores Específicos',
  'Tecnología',
  ARRAY['technology', 'saas', 'fintech', 'ecommerce', 'startups'],
  421,
  ARRAY[
    'Métricas clave: ARR, LTV/CAC, churn rate, unit economics',
    'Múltiplos de valoración por subsector tech',
    'Due diligence técnica: código, escalabilidad, seguridad',
    'Tendencias de inversión en AI, blockchain y IoT'
  ],
  true,
  true
),
(
  'Retail y E-commerce: Consolidación del Mercado',
  'El sector retail está en plena transformación. Análisis de oportunidades M&A en retail tradicional, e-commerce puro y modelos omnicanal. Casos de consolidación exitosa.',
  'Oportunidades de consolidación en el retail moderno',
  'Laura Pérez',
  'Retail & Consumer Specialist',
  'Capittal',
  '2024-05-08 17:30:00+02',
  70,
  'completed',
  'Sectores Específicos',
  'Retail',
  ARRAY['retail', 'ecommerce', 'omnichannel', 'consumer'],
  198,
  ARRAY[
    'Valoración de empresas de e-commerce vs retail tradicional',
    'KPIs críticos: conversión, AOV, lifetime value',
    'Integración de canales online y offline',
    'Casos de éxito en consolidación retail España'
  ],
  false,
  true
),
(
  'Healthcare M&A: Regulación y Oportunidades',
  'Sector altamente regulado con grandes oportunidades. Análisis de subsectores: clínicas privadas, farmacias, tecnología médica, telemedicina. Marco regulatorio y compliance.',
  'Navega las complejidades del M&A en salud',
  'Dr. Roberto Silva',
  'Healthcare M&A Advisor',
  'Silva Healthcare Partners',
  '2024-06-12 16:00:00+02',
  80,
  'completed',
  'Sectores Específicos',
  'Healthcare',
  ARRAY['healthcare', 'medical', 'pharma', 'regulation', 'compliance'],
  134,
  ARRAY[
    'Marco regulatorio para adquisiciones sanitarias',
    'Valoración de clínicas: pacientes, equipos, licencias',
    'Due diligence específica: calidad, acreditaciones',
    'Tendencias en healthtech y telemedicina'
  ],
  false,
  true
),
(
  'Preparando tu Empresa para la Venta',
  'Masterclass sobre cómo optimizar una empresa para maximizar su valor de venta. Desde mejoras operativas hasta preparación financiera. Timeline típico y errores comunes.',
  'Maximiza el valor de tu empresa antes de venderla',
  'Elena García',
  'M&A Advisory Partner',
  'Capittal',
  '2024-07-17 18:00:00+02',
  95,
  'completed',
  'Estrategia y Preparación',
  'General',
  ARRAY['sell-side', 'preparation', 'optimization', 'value-creation'],
  523,
  ARRAY[
    'Auditoría interna: sistemas, procesos, contratos',
    'Optimización del EBITDA y working capital',
    'Preparación de data room y documentación',
    'Timeline óptimo: 12-18 meses antes de la venta'
  ],
  true,
  true
),
(
  'Negociación en M&A: Tácticas y Estratégicas',
  'Técnicas avanzadas de negociación específicas para transacciones M&A. Desde la carta de intenciones hasta el cierre. Gestión de earnouts, ajustes de precio y garantías.',
  'Domina el arte de la negociación en M&A',
  'Miguel Torres',
  'Senior Negotiation Expert',
  'Torres Negotiation Consulting',
  '2024-08-14 17:00:00+02',
  75,
  'completed',
  'Estrategia y Preparación',
  'General',
  ARRAY['negotiation', 'earnouts', 'price-adjustment', 'warranties'],
  267,
  ARRAY[
    'Estructura de earnouts y mecanismos de ajuste',
    'Negociación de garantías y limitación de responsabilidad',
    'Gestión de la fase entre firma y cierre',
    'Resolución de disputas post-cierre'
  ],
  false,
  true
),
(
  'Estado del Mercado M&A en España Q2 2024',
  'Análisis exhaustivo del mercado M&A español. Estadísticas de transacciones, sectores más activos, tendencias de valoración. Comparativa con mercados europeos.',
  'Informe completo del mercado M&A español',
  'Alejandro Vega',
  'Market Research Director',
  'Capittal',
  '2024-09-11 16:30:00+02',
  65,
  'completed',
  'Mercado y Tendencias',
  'General',
  ARRAY['market-data', 'statistics', 'trends', 'spain'],
  389,
  ARRAY[
    'Volumen de transacciones Q2 2024: €12.3B en 247 deals',
    'Sectores líderes: tecnología, salud, energías renovables',
    'Múltiplos promedio por sector y tamaño de empresa',
    'Predicciones para H2 2024 y tendencias 2025'
  ],
  true,
  true
),
(
  'Financiación de Adquisiciones: Debt vs Equity',
  'Opciones de financiación para operaciones M&A. LBO, mezzanine financing, venture debt. Criterios de elección y estructura óptima según el deal.',
  'Estructura la financiación perfecta para tu adquisición',
  'Patricia Moreno',
  'Finance & Structured Products Director',
  'Capittal',
  '2024-10-16 17:30:00+02',
  70,
  'completed',
  'Mercado y Tendencias',
  'Finance',
  ARRAY['financing', 'lbo', 'mezzanine', 'debt', 'equity'],
  234,
  ARRAY[
    'LBO: estructuración y criterios de elegibilidad',
    'Mezzanine financing: cuándo y cómo utilizarlo',
    'Covenant negotiations y gestión de deuda',
    'Casos prácticos de financiación creativa'
  ],
  false,
  true
),
(
  'M&A Internacional: Expanding Beyond Spain',
  'Guía para operaciones cross-border. Diferencias regulatorias, fiscales y culturales. Casos de empresas españolas expandiéndose internacionalmente.',
  'Expande tu negocio más allá de las fronteras españolas',
  'James Wilson',
  'International M&A Advisor',
  'Wilson Cross-Border Partners',
  '2024-11-13 16:00:00+01',
  80,
  'completed',
  'Mercado y Tendencias',
  'International',
  ARRAY['international', 'cross-border', 'regulation', 'expansion'],
  178,
  ARRAY[
    'Marcos regulatorios: UE, Reino Unido, Latinoamérica',
    'Estructuras fiscales eficientes para cross-border',
    'Due diligence cultural y gestión de equipos internacionales',
    'Casos de éxito: empresas españolas en Europa y LATAM'
  ],
  false,
  true
),
(
  'Family Business Succession through M&A',
  'Soluciones M&A para la sucesión en empresas familiares. Alternativas cuando no hay sucesor natural. Estructuras que preservan el legado familiar.',
  'Soluciones M&A para la continuidad de empresas familiares',
  'Carmen Ruiz',
  'Family Business & Succession Expert',
  'Ruiz Family Advisory',
  '2024-12-11 17:00:00+01',
  85,
  'completed',
  'Estrategia y Preparación',
  'Family Business',
  ARRAY['family-business', 'succession', 'legacy', 'transition'],
  145,
  ARRAY[
    'Opciones cuando no hay sucesor: venta, MBO, EBO',
    'Estructuras que mantienen control familiar parcial',
    'Valoración de empresas familiares: intangibles únicos',
    'Gestión emocional del proceso de transición'
  ],
  false,
  true
);