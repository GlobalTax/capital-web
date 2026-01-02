-- =====================================================
-- EXIT READINESS QUESTIONS - Configurable questions table
-- =====================================================

CREATE TABLE public.exit_readiness_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_key TEXT NOT NULL UNIQUE,
  options JSONB NOT NULL,
  recommendation_if_low TEXT,
  max_points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exit_readiness_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active questions" ON public.exit_readiness_questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage questions" ON public.exit_readiness_questions
  FOR ALL USING (current_user_is_admin());

-- Insert the 10 Marktlink-style questions
INSERT INTO public.exit_readiness_questions (question_order, question_text, question_key, options, recommendation_if_low, max_points) VALUES
(1, '¿Cuál es tu horizonte temporal para una posible venta?', 'timeline', 
  '[{"label":"Quiero vender lo antes posible","value":"asap","points":10},{"label":"Estoy considerando vender en los próximos 5 años","value":"5years","points":7},{"label":"No tengo planes concretos pero estoy abierto","value":"open","points":4}]'::jsonb,
  'Define un horizonte temporal claro para poder planificar adecuadamente la preparación de tu empresa.', 10),

(2, '¿Cuántos empleados tiene tu empresa?', 'employees', 
  '[{"label":"Más de 50 empleados","value":"50plus","points":10},{"label":"Entre 10 y 50 empleados","value":"10to50","points":7},{"label":"Menos de 10 empleados","value":"less10","points":4}]'::jsonb,
  'Las empresas más grandes suelen ser más atractivas. Considera estrategias de crecimiento antes de la venta.', 10),

(3, '¿Cuánto depende el negocio de ti como propietario?', 'owner_dependency', 
  '[{"label":"El negocio funciona de forma independiente","value":"independent","points":10},{"label":"Tengo un rol importante pero el equipo puede asumir mucho","value":"partial","points":6},{"label":"Soy esencial en las operaciones diarias","value":"essential","points":2}]'::jsonb,
  'Reduce tu dependencia delegando funciones clave y documentando procesos. Esto aumentará significativamente el valor de tu empresa.', 10),

(4, '¿Tienes un plan de sucesión o de salida definido?', 'succession_plan', 
  '[{"label":"Sí, está completamente desarrollado","value":"complete","points":10},{"label":"Lo he pensado pero no está definido","value":"partial","points":5},{"label":"No, no tengo ningún plan","value":"none","points":1}]'::jsonb,
  'Desarrolla un plan de sucesión claro. Los compradores valoran empresas con transiciones planificadas.', 10),

(5, '¿Has buscado asesoramiento legal o fiscal para la venta?', 'legal_advice', 
  '[{"label":"Sí, tengo asesores legales y fiscales","value":"both","points":10},{"label":"Sí, pero solo uno de los dos","value":"partial","points":6},{"label":"No, aún no he buscado asesoramiento","value":"none","points":2}]'::jsonb,
  'Busca asesoramiento especializado en M&A. Una buena estructuración puede optimizar significativamente el resultado fiscal.', 10),

(6, '¿Cuál es tu posición competitiva en el mercado?', 'market_position', 
  '[{"label":"Posición única con poca competencia directa","value":"unique","points":10},{"label":"Buena posición pero con competencia significativa","value":"good","points":6},{"label":"Posición desafiante por alta competencia","value":"challenging","points":3}]'::jsonb,
  'Trabaja en diferenciarte de la competencia. Una posición de mercado sólida aumenta el atractivo para compradores.', 10),

(7, '¿Tienes un plan de negocio actualizado para los próximos 3 años?', 'business_plan', 
  '[{"label":"Sí, tengo un plan detallado y actualizado","value":"yes","points":10},{"label":"Tengo ideas pero no están documentadas","value":"partial","points":5},{"label":"No tengo un plan formal","value":"no","points":2}]'::jsonb,
  'Elabora un plan de negocio con proyecciones a 3-5 años. Los compradores quieren ver potencial de crecimiento.', 10),

(8, '¿Cómo han evolucionado los resultados (beneficio neto) de tu empresa en los últimos 3 años?', 'results_evolution', 
  '[{"label":"Mejora cada año de forma constante","value":"improving","points":10},{"label":"Mayormente estable","value":"stable","points":7},{"label":"Variación significativa cada año","value":"variable","points":4},{"label":"En declive","value":"decline","points":1}]'::jsonb,
  'Trabaja en estabilizar y mejorar tus resultados antes de la venta. La tendencia es clave para los compradores.', 10),

(9, '¿Cómo ha evolucionado la facturación en los últimos 3 años?', 'revenue_evolution', 
  '[{"label":"Mejora cada año de forma constante","value":"improving","points":10},{"label":"Mayormente estable","value":"stable","points":7},{"label":"Variación significativa cada año","value":"variable","points":4},{"label":"En declive","value":"decline","points":1}]'::jsonb,
  'Desarrolla estrategias para aumentar y diversificar ingresos. El crecimiento sostenido es muy valorado.', 10),

(10, '¿Cuál es tu EBITDA medio anual aproximado?', 'ebitda_range', 
  '[{"label":"Más de 1M EUR","value":"1m_plus","points":10},{"label":"Entre 500K y 1M EUR","value":"500k_1m","points":8},{"label":"Entre 200K y 500K EUR","value":"200k_500k","points":5},{"label":"Menos de 200K EUR","value":"less_200k","points":3},{"label":"No lo sé / Prefiero no decir","value":"unknown","points":1}]'::jsonb,
  'Conoce y optimiza tu EBITDA. Es la métrica más importante para valorar tu empresa.', 10);

-- Add columns to exit_readiness_tests for AI reports
ALTER TABLE public.exit_readiness_tests 
ADD COLUMN IF NOT EXISTS ai_report_content TEXT,
ADD COLUMN IF NOT EXISTS ai_report_status TEXT DEFAULT 'pending' CHECK (ai_report_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_report_error TEXT,
ADD COLUMN IF NOT EXISTS questions_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create updated_at trigger for questions
CREATE TRIGGER update_exit_readiness_questions_updated_at
  BEFORE UPDATE ON public.exit_readiness_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();