-- Crear tabla de plantillas de ofertas de trabajo
CREATE TABLE IF NOT EXISTS public.job_post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'tecnologia', 'finanzas', 'marketing', 'ventas', etc.
  
  -- Campos pre-rellenados
  title_template TEXT,
  short_description_template TEXT,
  description_template TEXT,
  requirements_template TEXT[], -- Array de strings
  responsibilities_template TEXT[],
  benefits_template TEXT[],
  
  -- Configuración por defecto
  default_location TEXT,
  default_contract_type TEXT DEFAULT 'indefinido',
  default_employment_type TEXT DEFAULT 'full_time',
  default_is_remote BOOLEAN DEFAULT false,
  default_is_hybrid BOOLEAN DEFAULT false,
  default_experience_level TEXT,
  default_sector TEXT,
  
  -- Meta
  is_active BOOLEAN DEFAULT true,
  times_used INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.admin_users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_job_templates_category ON public.job_post_templates(category);
CREATE INDEX IF NOT EXISTS idx_job_templates_active ON public.job_post_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_job_templates_created_by ON public.job_post_templates(created_by);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_job_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_templates_updated_at
  BEFORE UPDATE ON public.job_post_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_job_templates_updated_at();

-- Habilitar RLS
ALTER TABLE public.job_post_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden gestionar plantillas
CREATE POLICY "Admins can manage job templates"
  ON public.job_post_templates FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Admins can view active templates"
  ON public.job_post_templates FOR SELECT
  USING (current_user_is_admin() AND is_active = true);

-- Insertar plantillas iniciales de ejemplo
INSERT INTO public.job_post_templates (name, description, category, title_template, short_description_template, description_template, requirements_template, responsibilities_template, benefits_template, default_location, default_experience_level, default_sector) VALUES
(
  'Desarrollador Full Stack Senior',
  'Plantilla para posiciones de desarrollo Full Stack nivel senior',
  'tecnologia',
  'Desarrollador/a Full Stack Senior',
  'Únete a nuestro equipo de tecnología como Desarrollador Full Stack Senior. Trabajarás en proyectos innovadores con tecnologías modernas.',
  'Buscamos un/a Desarrollador/a Full Stack Senior apasionado/a por la tecnología para unirse a nuestro equipo de desarrollo. Trabajarás en el diseño, desarrollo e implementación de soluciones web escalables y de alto rendimiento.

En este rol, colaborarás estrechamente con equipos multidisciplinares para crear productos digitales que impacten positivamente en nuestros usuarios. Tendrás la oportunidad de trabajar con las últimas tecnologías y contribuir a la arquitectura de nuestras aplicaciones.',
  ARRAY[
    '5+ años de experiencia en desarrollo Full Stack',
    'Dominio de JavaScript/TypeScript y frameworks modernos (React, Vue, Angular)',
    'Experiencia con Node.js y frameworks backend (Express, NestJS)',
    'Conocimientos sólidos de bases de datos SQL y NoSQL',
    'Experiencia con Git y metodologías ágiles (Scrum/Kanban)',
    'Capacidad de trabajo en equipo y excelente comunicación',
    'Nivel de inglés intermedio-avanzado'
  ],
  ARRAY[
    'Desarrollar y mantener aplicaciones web completas (frontend y backend)',
    'Participar en el diseño de arquitectura de software',
    'Realizar code reviews y mentorizar a desarrolladores junior',
    'Optimizar el rendimiento de aplicaciones existentes',
    'Colaborar con el equipo de producto en la definición de requisitos',
    'Implementar buenas prácticas de desarrollo y testing',
    'Participar en la mejora continua de procesos de desarrollo'
  ],
  ARRAY[
    'Salario competitivo acorde a experiencia',
    'Modalidad híbrida/remoto',
    'Horario flexible',
    'Formación continua y presupuesto para cursos',
    'Ambiente de trabajo colaborativo e innovador',
    'Oportunidades de crecimiento profesional'
  ],
  'Madrid',
  'senior',
  'Tecnología'
),
(
  'Analista Financiero',
  'Plantilla para posiciones de análisis financiero',
  'finanzas',
  'Analista Financiero/a',
  'Buscamos un/a Analista Financiero/a para unirse a nuestro equipo de finanzas corporativas. Serás clave en el análisis y reporting financiero.',
  'Estamos en búsqueda de un/a Analista Financiero/a para incorporarse a nuestro departamento de finanzas. El candidato ideal tendrá experiencia en análisis financiero, elaboración de informes y apoyo en la toma de decisiones estratégicas.

Trabajarás directamente con el CFO y el equipo directivo, proporcionando análisis detallados que impulsarán el crecimiento y la rentabilidad de la empresa.',
  ARRAY[
    'Grado en Finanzas, Economía, ADE o similar',
    '3+ años de experiencia en análisis financiero',
    'Dominio avanzado de Excel y herramientas de análisis',
    'Conocimientos de contabilidad y estados financieros',
    'Experiencia con software financiero (SAP, Oracle, etc.)',
    'Capacidad analítica y atención al detalle',
    'Excelentes habilidades de comunicación'
  ],
  ARRAY[
    'Elaborar informes financieros periódicos y ad-hoc',
    'Realizar análisis de rentabilidad y proyecciones',
    'Apoyar en el proceso de presupuestación',
    'Analizar variaciones entre presupuesto y real',
    'Participar en procesos de due diligence',
    'Colaborar en la presentación de resultados a dirección',
    'Proponer mejoras en procesos financieros'
  ],
  ARRAY[
    'Salario competitivo según experiencia',
    'Plan de formación continua',
    'Seguro médico privado',
    'Ticket restaurante',
    'Buen ambiente laboral',
    'Oportunidades de desarrollo profesional'
  ],
  'Barcelona',
  'mid',
  'Finanzas'
),
(
  'Responsable de Marketing Digital',
  'Plantilla para posiciones de marketing digital y performance',
  'marketing',
  'Responsable de Marketing Digital',
  'Únete a nuestro equipo de marketing como Responsable de Marketing Digital. Liderarás estrategias digitales y campañas de crecimiento.',
  'Buscamos un/a Responsable de Marketing Digital experimentado/a para liderar nuestras estrategias de marketing online. Serás responsable de planificar, ejecutar y optimizar campañas digitales multicanal para impulsar el crecimiento de la empresa.

Trabajarás con un equipo dinámico y tendrás autonomía para proponer e implementar nuevas iniciativas que maximicen el ROI de nuestras acciones de marketing.',
  ARRAY[
    'Grado en Marketing, Publicidad o similar',
    '4+ años de experiencia en marketing digital',
    'Experiencia demostrable en gestión de campañas SEM/SEO',
    'Conocimientos de Google Ads, Facebook Ads, LinkedIn Ads',
    'Dominio de Google Analytics y herramientas de analítica web',
    'Experiencia en email marketing y marketing automation',
    'Creatividad y orientación a resultados'
  ],
  ARRAY[
    'Desarrollar y ejecutar la estrategia de marketing digital',
    'Gestionar presupuestos de campañas online',
    'Optimizar campañas de performance marketing',
    'Analizar métricas y KPIs de marketing',
    'Coordinar con agencias y proveedores externos',
    'Liderar proyectos de growth hacking',
    'Reportar resultados a dirección'
  ],
  ARRAY[
    'Salario competitivo más variable por objetivos',
    'Flexibilidad horaria',
    'Modalidad híbrida',
    'Presupuesto para formación',
    'Ambiente creativo e innovador',
    'Proyectos desafiantes'
  ],
  'Madrid',
  'senior',
  'Marketing'
),
(
  'Comercial B2B',
  'Plantilla para posiciones de venta consultiva B2B',
  'ventas',
  'Comercial B2B',
  'Buscamos un/a Comercial B2B con experiencia en venta consultiva para ampliar nuestra cartera de clientes empresariales.',
  'Estamos en búsqueda de un/a Comercial B2B dinámico/a y orientado/a a resultados para unirse a nuestro equipo de ventas. Serás responsable de identificar oportunidades de negocio, gestionar el ciclo de venta completo y desarrollar relaciones a largo plazo con clientes corporativos.

Ofrecemos un entorno retador con excelentes oportunidades de crecimiento y un paquete de compensación atractivo.',
  ARRAY[
    'Experiencia mínima de 3 años en ventas B2B',
    'Capacidad demostrada de cierre de ventas',
    'Excelentes habilidades de negociación',
    'Orientación a objetivos y resultados',
    'Habilidades de comunicación verbal y escrita',
    'Manejo de CRM (Salesforce, HubSpot, etc.)',
    'Carnet de conducir (B)'
  ],
  ARRAY[
    'Prospección y captación de nuevos clientes B2B',
    'Gestionar el ciclo de venta completo',
    'Realizar presentaciones y demostraciones de producto',
    'Negociar condiciones comerciales',
    'Mantener y desarrollar cartera de clientes',
    'Alcanzar objetivos de venta mensuales/trimestrales',
    'Colaborar con el equipo de marketing'
  ],
  ARRAY[
    'Salario fijo + comisiones atractivas sin techo',
    'Coche de empresa',
    'Formación inicial y continua',
    'Plan de carrera definido',
    'Herramientas y recursos de venta',
    'Ambiente dinámico y motivador'
  ],
  'Varias provincias',
  'mid',
  'Ventas'
),
(
  'Project Manager',
  'Plantilla para posiciones de gestión de proyectos',
  'gestion',
  'Project Manager',
  'Buscamos un/a Project Manager experimentado/a para liderar proyectos estratégicos y coordinar equipos multidisciplinares.',
  'Estamos en búsqueda de un/a Project Manager con experiencia demostrable en la gestión de proyectos complejos. Serás responsable de planificar, ejecutar y cerrar proyectos, asegurando que se cumplan los plazos, presupuestos y objetivos establecidos.

Trabajarás con equipos diversos y tendrás un rol clave en el éxito de los proyectos estratégicos de la compañía.',
  ARRAY[
    '5+ años de experiencia como Project Manager',
    'Certificación PMP o similar (valorable)',
    'Experiencia con metodologías ágiles y waterfall',
    'Conocimiento de herramientas de gestión (Jira, MS Project, Asana)',
    'Excelentes habilidades de liderazgo y comunicación',
    'Capacidad de gestión de stakeholders',
    'Inglés avanzado'
  ],
  ARRAY[
    'Planificar y gestionar proyectos de principio a fin',
    'Definir alcance, objetivos y entregables',
    'Coordinar equipos multidisciplinares',
    'Gestionar riesgos y resolver impedimentos',
    'Realizar seguimiento de presupuestos y timelines',
    'Reportar progreso a stakeholders',
    'Asegurar la calidad de los entregables'
  ],
  ARRAY[
    'Salario competitivo según experiencia',
    'Modalidad híbrida/flexible',
    'Certificaciones y formación continua',
    'Proyectos internacionales',
    'Ambiente colaborativo',
    'Plan de desarrollo profesional'
  ],
  'Madrid',
  'senior',
  'Gestión de Proyectos'
);

-- Comentario sobre las plantillas
COMMENT ON TABLE public.job_post_templates IS 'Plantillas reutilizables para ofertas de trabajo con campos predefinidos y configuraciones por defecto';