-- =====================================================
-- FASE 0 DOCUMENTS SYSTEM
-- NDA Advisor-Cliente + Propuestas de Mandato
-- =====================================================

-- Tabla de plantillas de documentos Fase 0
CREATE TABLE public.fase0_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('nda', 'mandato_venta', 'mandato_compra')),
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  -- Secciones del documento en JSON estructurado
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Variables disponibles: {{cliente_nombre}}, {{empresa}}, etc.
  available_variables JSONB DEFAULT '[]'::jsonb,
  -- Estructura de honorarios (solo para mandatos)
  fee_structure JSONB,
  -- Metadatos
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de documentos generados
CREATE TABLE public.fase0_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.fase0_document_templates(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('nda', 'mandato_venta', 'mandato_compra')),
  -- Referencia polimórfica al lead
  lead_id UUID NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'valuation', 'company_valuation')),
  -- Número de referencia único
  reference_number TEXT NOT NULL,
  -- Datos rellenados del documento
  filled_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Estado del documento
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'expired', 'cancelled')),
  -- URLs
  pdf_url TEXT,
  pdf_storage_path TEXT,
  -- Validez
  valid_until DATE,
  -- Trazabilidad envío
  sent_at TIMESTAMPTZ,
  sent_to_email TEXT,
  sent_by UUID,
  -- Trazabilidad visualización
  viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  -- Firma
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  signed_by_name TEXT,
  signed_by_ip INET,
  -- Metadatos
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_fase0_documents_lead ON public.fase0_documents(lead_id, lead_type);
CREATE INDEX idx_fase0_documents_status ON public.fase0_documents(status);
CREATE INDEX idx_fase0_documents_type ON public.fase0_documents(document_type);
CREATE INDEX idx_fase0_templates_type ON public.fase0_document_templates(document_type, is_active);

-- Función para generar número de referencia
CREATE OR REPLACE FUNCTION public.generate_fase0_reference_number(doc_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefix TEXT;
  current_year TEXT;
  sequence_num TEXT;
BEGIN
  -- Determinar prefijo según tipo
  prefix := CASE doc_type
    WHEN 'nda' THEN 'NDA'
    WHEN 'mandato_venta' THEN 'MV'
    WHEN 'mandato_compra' THEN 'MC'
    ELSE 'DOC'
  END;
  
  current_year := EXTRACT(year FROM now())::TEXT;
  
  -- Obtener siguiente número de secuencia
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM public.fase0_documents 
  WHERE document_type = doc_type
    AND EXTRACT(year FROM created_at) = EXTRACT(year FROM now());
  
  RETURN prefix || '-' || current_year || '-' || sequence_num;
END;
$$;

-- Trigger para generar número de referencia automáticamente
CREATE OR REPLACE FUNCTION public.set_fase0_reference_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := public.generate_fase0_reference_number(NEW.document_type);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_fase0_reference_number
  BEFORE INSERT ON public.fase0_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_fase0_reference_number();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_fase0_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_fase0_templates_updated_at
  BEFORE UPDATE ON public.fase0_document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fase0_updated_at();

CREATE TRIGGER trigger_update_fase0_documents_updated_at
  BEFORE UPDATE ON public.fase0_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fase0_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.fase0_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fase0_documents ENABLE ROW LEVEL SECURITY;

-- Templates: solo admins pueden gestionar
CREATE POLICY "Admins can manage fase0 templates"
  ON public.fase0_document_templates
  FOR ALL
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- Documents: admins pueden gestionar todos
CREATE POLICY "Admins can manage all fase0 documents"
  ON public.fase0_documents
  FOR ALL
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fase0-documents',
  'fase0-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can manage fase0 documents storage"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'fase0-documents' 
    AND public.is_user_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'fase0-documents' 
    AND public.is_user_admin(auth.uid())
  );

-- =====================================================
-- INSERTAR TEMPLATES BASE
-- =====================================================

INSERT INTO public.fase0_document_templates (document_type, name, version, description, sections, available_variables, fee_structure)
VALUES 
(
  'nda',
  'NDA Advisor-Cliente Estándar',
  '1.0',
  'Acuerdo de confidencialidad estándar entre Capittal y cliente potencial',
  '[
    {
      "id": "header",
      "title": "Encabezado",
      "content": "ACUERDO DE CONFIDENCIALIDAD\n\nEn {{ciudad}}, a {{fecha_documento}}"
    },
    {
      "id": "partes",
      "title": "Partes",
      "content": "REUNIDOS\n\nDe una parte, CAPITTAL CORPORATE FINANCE, S.L., con CIF B-67890123, domicilio social en Paseo de Gracia 99, 08008 Barcelona, representada por D. {{advisor_nombre}}, en calidad de {{advisor_cargo}} (en adelante, \"CAPITTAL\").\n\nY de otra parte, {{cliente_empresa}}, con CIF {{cliente_cif}}, domicilio social en {{cliente_direccion}}, representada por D./Dña. {{cliente_nombre}}, en calidad de {{cliente_cargo}} (en adelante, el \"CLIENTE\").\n\nAmbas partes se reconocen mutuamente capacidad legal suficiente para obligarse y"
    },
    {
      "id": "exponen",
      "title": "Exponen",
      "content": "EXPONEN\n\nI. Que CAPITTAL es una firma especializada en servicios de asesoramiento financiero y corporativo, incluyendo operaciones de fusiones y adquisiciones.\n\nII. Que el CLIENTE está interesado en explorar una potencial operación de {{tipo_operacion}} de su empresa.\n\nIII. Que para evaluar dicha operación, ambas partes necesitan intercambiar información de carácter confidencial.\n\nIV. Que las partes desean regular el tratamiento de dicha información mediante el presente Acuerdo."
    },
    {
      "id": "clausulas",
      "title": "Cláusulas",
      "content": "CLÁUSULAS\n\nPRIMERA.- DEFINICIONES\nA efectos del presente Acuerdo, se entenderá por \"Información Confidencial\" toda información, datos, documentos, análisis, estudios, proyecciones y cualquier otro material que una parte revele a la otra, ya sea de forma oral, escrita, electrónica o por cualquier otro medio.\n\nSEGUNDA.- OBLIGACIONES DE CONFIDENCIALIDAD\nLas partes se comprometen a:\na) Mantener en estricta confidencialidad toda la Información Confidencial recibida.\nb) No revelar dicha información a terceros sin consentimiento previo por escrito.\nc) Utilizar la información únicamente para el fin acordado.\nd) Limitar el acceso a empleados que necesiten conocerla.\n\nTERCERA.- EXCEPCIONES\nNo se considerará Información Confidencial aquella que:\na) Sea de dominio público.\nb) Estuviera en posesión de la parte receptora antes de su revelación.\nc) Deba ser revelada por imperativo legal.\n\nCUARTA.- DURACIÓN\nLas obligaciones de confidencialidad permanecerán en vigor durante {{duracion_años}} años desde la firma del presente Acuerdo.\n\nQUINTA.- JURISDICCIÓN\nPara cualquier controversia derivada del presente Acuerdo, las partes se someten a los Juzgados y Tribunales de Barcelona."
    },
    {
      "id": "firmas",
      "title": "Firmas",
      "content": "Y en prueba de conformidad, las partes firman el presente Acuerdo por duplicado y a un solo efecto, en el lugar y fecha indicados en el encabezamiento.\n\n\nPor CAPITTAL:\n\n\n_________________________\n{{advisor_nombre}}\n{{advisor_cargo}}\n\n\nPor el CLIENTE:\n\n\n_________________________\n{{cliente_nombre}}\n{{cliente_cargo}}"
    }
  ]'::jsonb,
  '["cliente_nombre", "cliente_empresa", "cliente_cif", "cliente_direccion", "cliente_cargo", "advisor_nombre", "advisor_cargo", "ciudad", "fecha_documento", "tipo_operacion", "duracion_años"]'::jsonb,
  NULL
),
(
  'mandato_venta',
  'Propuesta de Mandato - Venta',
  '1.0',
  'Propuesta comercial de servicios de asesoramiento para venta de empresa',
  '[
    {
      "id": "portada",
      "title": "Portada",
      "content": "PROPUESTA DE SERVICIOS\nASESORÍA EN VENTA DE EMPRESA\n\nPara: {{cliente_empresa}}\nFecha: {{fecha_documento}}\nRef: {{numero_referencia}}\n\nConfidencial"
    },
    {
      "id": "resumen",
      "title": "Resumen Ejecutivo",
      "content": "RESUMEN EJECUTIVO\n\nCapittal Corporate Finance se complace en presentar esta propuesta de servicios de asesoramiento financiero para la venta de {{cliente_empresa}}.\n\nBasándonos en la información preliminar facilitada, estimamos un valor indicativo de la compañía en el rango de {{valoracion_min}} - {{valoracion_max}} euros.\n\nNuestro equipo cuenta con amplia experiencia en el sector {{sector}}, habiendo asesorado operaciones similares con éxito."
    },
    {
      "id": "servicios",
      "title": "Alcance de Servicios",
      "content": "ALCANCE DE SERVICIOS\n\n1. FASE DE PREPARACIÓN\n- Valoración detallada de la empresa\n- Preparación del Cuaderno de Venta (CIM)\n- Elaboración del Teaser comercial\n- Identificación de puntos de mejora de valor\n\n2. FASE DE COMERCIALIZACIÓN\n- Identificación y cualificación de compradores potenciales\n- Contacto confidencial con targets\n- Gestión de NDAs y proceso competitivo\n- Data Room virtual\n\n3. FASE DE NEGOCIACIÓN\n- Análisis de ofertas recibidas\n- Negociación de términos y condiciones\n- Coordinación con asesores legales y fiscales\n- Apoyo en due diligence\n\n4. FASE DE CIERRE\n- Supervisión de documentación legal\n- Coordinación del cierre\n- Seguimiento post-cierre"
    },
    {
      "id": "honorarios",
      "title": "Honorarios",
      "content": "ESTRUCTURA DE HONORARIOS\n\n1. RETAINER (Honorario Inicial)\nImporte: {{retainer}} €\nConcepto: Cubre los costes de preparación y puesta en marcha del proceso.\nPago: A la firma del mandato.\n\n2. SUCCESS FEE (Honorario de Éxito)\nPorcentaje: {{success_fee_pct}}% sobre el valor de la transacción\nHonorario mínimo: {{honorario_minimo}} €\nPago: A la fecha de cierre de la operación.\n\n3. GASTOS\nLos gastos de viaje, documentación y otros gastos directos serán facturados por separado, previa aprobación.\n\nNota: El retainer se descontará del success fee en caso de éxito de la operación."
    },
    {
      "id": "timeline",
      "title": "Timeline",
      "content": "TIMELINE ESTIMADO\n\nMes 1-2: Preparación\n- Valoración y documentación\n- Aprobación de materiales\n\nMes 2-4: Comercialización\n- Contacto con compradores\n- Recepción de IOIs\n\nMes 4-6: Negociación\n- Due diligence\n- Negociación de SPA\n\nMes 6-8: Cierre\n- Firma y cierre\n- Transición\n\nDuración total estimada: 6-8 meses"
    },
    {
      "id": "equipo",
      "title": "Equipo",
      "content": "EQUIPO ASIGNADO\n\nDirector de la Operación: {{advisor_nombre}}\nExperiencia: {{advisor_experiencia}}\n\nEl equipo de Capittal cuenta con más de 50 operaciones cerradas en los últimos 5 años, con un valor agregado superior a 500 millones de euros."
    },
    {
      "id": "condiciones",
      "title": "Términos y Condiciones",
      "content": "TÉRMINOS Y CONDICIONES\n\n1. EXCLUSIVIDAD\nEl mandato se otorga en régimen de exclusividad por un período inicial de {{duracion_mandato}} meses.\n\n2. CONFIDENCIALIDAD\nAmbas partes se comprometen a mantener estricta confidencialidad según el NDA firmado.\n\n3. CONFLICTO DE INTERESES\nCapittal declara no tener conflicto de intereses conocido en relación con esta operación.\n\n4. VALIDEZ DE LA PROPUESTA\nLa presente propuesta es válida hasta el {{fecha_validez}}."
    },
    {
      "id": "aceptacion",
      "title": "Aceptación",
      "content": "ACEPTACIÓN\n\nPara formalizar el mandato, rogamos firmen el presente documento y nos lo remitan.\n\n\nAceptado y conforme,\n\n\nPor {{cliente_empresa}}:\n\n\n_________________________\nD./Dña. {{cliente_nombre}}\n{{cliente_cargo}}\n\nFecha: ___________________\n\n\n\nPor CAPITTAL CORPORATE FINANCE:\n\n\n_________________________\n{{advisor_nombre}}\n{{advisor_cargo}}"
    }
  ]'::jsonb,
  '["cliente_nombre", "cliente_empresa", "cliente_cif", "cliente_cargo", "sector", "valoracion_min", "valoracion_max", "retainer", "success_fee_pct", "honorario_minimo", "duracion_mandato", "fecha_validez", "advisor_nombre", "advisor_cargo", "advisor_experiencia", "fecha_documento", "numero_referencia"]'::jsonb,
  '{"retainer_default": 15000, "success_fee_default": 5, "min_fee_default": 75000}'::jsonb
),
(
  'mandato_compra',
  'Propuesta de Mandato - Compra',
  '1.0',
  'Propuesta comercial de servicios de asesoramiento para adquisición de empresa',
  '[
    {
      "id": "portada",
      "title": "Portada",
      "content": "PROPUESTA DE SERVICIOS\nASESORÍA EN ADQUISICIÓN DE EMPRESA\n\nPara: {{cliente_empresa}}\nFecha: {{fecha_documento}}\nRef: {{numero_referencia}}\n\nConfidencial"
    },
    {
      "id": "resumen",
      "title": "Resumen Ejecutivo",
      "content": "RESUMEN EJECUTIVO\n\nCapittal Corporate Finance se complace en presentar esta propuesta de servicios de asesoramiento para la búsqueda y adquisición de empresas target en el sector {{sector}}.\n\nRango de inversión objetivo: {{inversion_min}} - {{inversion_max}} euros.\n\nNuestro equipo cuenta con una base de datos propietaria de más de 5.000 empresas y relaciones establecidas con propietarios en toda España."
    },
    {
      "id": "servicios",
      "title": "Alcance de Servicios",
      "content": "ALCANCE DE SERVICIOS\n\n1. FASE DE ESTRATEGIA\n- Definición del perfil de target ideal\n- Criterios de inversión y parámetros financieros\n- Geografía y subsectores objetivo\n\n2. FASE DE BÚSQUEDA\n- Screening de base de datos propietaria\n- Identificación proactiva de targets\n- Aproximación confidencial a propietarios\n- Cualificación inicial de oportunidades\n\n3. FASE DE ANÁLISIS\n- Análisis financiero preliminar\n- Valoración indicativa\n- Identificación de sinergias\n- Coordinación de due diligence\n\n4. FASE DE NEGOCIACIÓN Y CIERRE\n- Estructuración de la oferta\n- Negociación de términos\n- Apoyo en documentación legal\n- Coordinación del cierre"
    },
    {
      "id": "honorarios",
      "title": "Honorarios",
      "content": "ESTRUCTURA DE HONORARIOS\n\n1. RETAINER (Honorario de Búsqueda)\nImporte: {{retainer}} €/mes\nConcepto: Cubre la búsqueda activa y cualificación de oportunidades.\nDuración: {{duracion_mandato}} meses.\nPago: Mensual por adelantado.\n\n2. SUCCESS FEE (Honorario de Éxito)\nPorcentaje: {{success_fee_pct}}% sobre el valor de empresa adquirido\nHonorario mínimo: {{honorario_minimo}} €\nPago: A la fecha de cierre de la adquisición.\n\n3. GASTOS\nViajes y gastos directos serán facturados por separado.\n\nNota: El 50% del retainer acumulado se descontará del success fee."
    },
    {
      "id": "timeline",
      "title": "Timeline",
      "content": "TIMELINE ESTIMADO\n\nMes 1: Estrategia\n- Definición de criterios\n- Plan de búsqueda\n\nMes 2-4: Búsqueda\n- Identificación de targets\n- Primeros contactos\n\nMes 4-6: Análisis\n- Shortlist de oportunidades\n- Due diligence comercial\n\nMes 6-9: Negociación\n- Ofertas y negociación\n- Due diligence completa\n\nMes 9-12: Cierre\n- Documentación legal\n- Cierre e integración"
    },
    {
      "id": "equipo",
      "title": "Equipo",
      "content": "EQUIPO ASIGNADO\n\nDirector de la Operación: {{advisor_nombre}}\nExperiencia: {{advisor_experiencia}}\n\nCapittal ha asesorado más de 20 operaciones de buy-side en los últimos 3 años, con acceso privilegiado a oportunidades off-market."
    },
    {
      "id": "condiciones",
      "title": "Términos y Condiciones",
      "content": "TÉRMINOS Y CONDICIONES\n\n1. EXCLUSIVIDAD\nEl mandato se otorga en régimen de exclusividad para la búsqueda en el sector {{sector}} por un período de {{duracion_mandato}} meses.\n\n2. RENOVACIÓN\nEl mandato se renovará automáticamente por períodos adicionales de 3 meses salvo notificación con 30 días de antelación.\n\n3. CONFIDENCIALIDAD\nCapittal tratará con máxima confidencialidad la identidad del comprador.\n\n4. VALIDEZ DE LA PROPUESTA\nLa presente propuesta es válida hasta el {{fecha_validez}}."
    },
    {
      "id": "aceptacion",
      "title": "Aceptación",
      "content": "ACEPTACIÓN\n\nPara formalizar el mandato, rogamos firmen el presente documento.\n\n\nAceptado y conforme,\n\n\nPor {{cliente_empresa}}:\n\n\n_________________________\nD./Dña. {{cliente_nombre}}\n{{cliente_cargo}}\n\nFecha: ___________________\n\n\n\nPor CAPITTAL CORPORATE FINANCE:\n\n\n_________________________\n{{advisor_nombre}}\n{{advisor_cargo}}"
    }
  ]'::jsonb,
  '["cliente_nombre", "cliente_empresa", "cliente_cif", "cliente_cargo", "sector", "inversion_min", "inversion_max", "retainer", "success_fee_pct", "honorario_minimo", "duracion_mandato", "fecha_validez", "advisor_nombre", "advisor_cargo", "advisor_experiencia", "fecha_documento", "numero_referencia"]'::jsonb,
  '{"retainer_default": 5000, "success_fee_default": 4, "min_fee_default": 50000}'::jsonb
);