-- Tabla de feedback para reportes de IA
CREATE TABLE IF NOT EXISTS lead_ai_report_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES lead_ai_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_useful BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_report_feedback_report ON lead_ai_report_feedback(report_id);
CREATE INDEX IF NOT EXISTS idx_report_feedback_user ON lead_ai_report_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_report_feedback_created ON lead_ai_report_feedback(created_at DESC);

-- RLS Policies
ALTER TABLE lead_ai_report_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own feedback" ON lead_ai_report_feedback;
CREATE POLICY "Users can view their own feedback"
  ON lead_ai_report_feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON lead_ai_report_feedback;
CREATE POLICY "Users can create feedback"
  ON lead_ai_report_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own feedback" ON lead_ai_report_feedback;
CREATE POLICY "Users can update their own feedback"
  ON lead_ai_report_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para obtener estadísticas de reportes IA
CREATE OR REPLACE FUNCTION get_lead_ai_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_reports_count INT;
  useful_count INT;
  feedback_count INT;
BEGIN
  -- Contar reportes totales completados
  SELECT COUNT(*) INTO total_reports_count
  FROM lead_ai_reports
  WHERE generation_status = 'completed';
  
  -- Contar feedback útil
  SELECT COUNT(*) INTO useful_count
  FROM lead_ai_report_feedback
  WHERE is_useful = true;
  
  -- Contar total de feedback
  SELECT COUNT(*) INTO feedback_count
  FROM lead_ai_report_feedback
  WHERE is_useful IS NOT NULL;
  
  -- Construir JSON de resultado
  SELECT json_build_object(
    'total_reports', total_reports_count,
    'useful_percentage', 
      CASE 
        WHEN feedback_count > 0 THEN ROUND((useful_count::NUMERIC / feedback_count) * 100, 1)
        ELSE 0
      END,
    'total_cost', COALESCE((
      SELECT SUM(cost_usd) 
      FROM lead_ai_reports 
      WHERE generation_status = 'completed'
    ), 0),
    'total_tokens', COALESCE((
      SELECT SUM(tokens_used) 
      FROM lead_ai_reports 
      WHERE generation_status = 'completed'
    ), 0),
    'feedback_count', feedback_count,
    'by_type', (
      SELECT json_agg(type_stats)
      FROM (
        SELECT 
          COALESCE(lead_type, 'valuation') as lead_type,
          COUNT(*) as count,
          ROUND(AVG(cost_usd), 5) as avg_cost,
          ROUND(AVG(tokens_used), 0) as avg_tokens
        FROM lead_ai_reports
        WHERE generation_status = 'completed'
        GROUP BY lead_type
      ) type_stats
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;