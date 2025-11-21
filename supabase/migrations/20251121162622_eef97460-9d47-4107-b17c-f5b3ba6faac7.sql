-- ============================================================
-- FUNCIÓN: get_sector_dossier_stats()
-- Descripción: Obtiene estadísticas agregadas de Sector Dossiers
-- Retorna: JSON con métricas de uso, sectores más consultados,
--          cache hit rate y costes
-- ============================================================

CREATE OR REPLACE FUNCTION get_sector_dossier_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_dossiers_count INT;
  unique_sectors_count INT;
  cache_hits INT;
  total_generations INT;
BEGIN
  -- Contar dossiers totales (solo sector_dossier:*)
  SELECT COUNT(*) INTO total_dossiers_count
  FROM lead_ai_reports
  WHERE lead_type LIKE 'sector_dossier:%'
    AND generation_status = 'completed';
  
  -- Contar sectores únicos (extraer de lead_type)
  SELECT COUNT(DISTINCT REPLACE(lead_type, 'sector_dossier:', ''))
  INTO unique_sectors_count
  FROM lead_ai_reports
  WHERE lead_type LIKE 'sector_dossier:%'
    AND generation_status = 'completed';
  
  -- Calcular cache hit rate
  -- Los reportes con mismo lead_type creados después del primero son cache hits
  SELECT 
    COUNT(CASE WHEN rn > 1 THEN 1 END) as hits,
    COUNT(*) as total
  INTO cache_hits, total_generations
  FROM (
    SELECT 
      lead_type,
      created_at,
      ROW_NUMBER() OVER (
        PARTITION BY lead_type 
        ORDER BY created_at
      ) as rn
    FROM lead_ai_reports
    WHERE lead_type LIKE 'sector_dossier:%'
      AND generation_status = 'completed'
  ) ranked;
  
  -- Construir JSON resultado
  SELECT json_build_object(
    'total_dossiers', total_dossiers_count,
    'unique_sectors', unique_sectors_count,
    'total_cost', COALESCE((
      SELECT SUM(cost_usd) 
      FROM lead_ai_reports 
      WHERE lead_type LIKE 'sector_dossier:%'
        AND generation_status = 'completed'
    ), 0),
    'total_tokens', COALESCE((
      SELECT SUM(tokens_used) 
      FROM lead_ai_reports 
      WHERE lead_type LIKE 'sector_dossier:%'
        AND generation_status = 'completed'
    ), 0),
    'cache_hit_rate', 
      CASE 
        WHEN total_generations > 0 
        THEN ROUND((cache_hits::NUMERIC / total_generations) * 100, 1)
        ELSE 0
      END,
    'avg_processing_time', COALESCE((
      SELECT ROUND(AVG(processing_time_seconds), 1)
      FROM lead_ai_reports
      WHERE lead_type LIKE 'sector_dossier:%'
        AND generation_status = 'completed'
        AND processing_time_seconds IS NOT NULL
    ), 0),
    'by_sector', (
      SELECT json_agg(
        json_build_object(
          'sector', REPLACE(lead_type, 'sector_dossier:', ''),
          'count', count,
          'avg_cost', avg_cost,
          'avg_tokens', avg_tokens,
          'useful_percentage', useful_pct,
          'last_generated', last_gen
        )
      )
      FROM (
        SELECT 
          r.lead_type,
          COUNT(*) as count,
          ROUND(AVG(r.cost_usd), 5) as avg_cost,
          ROUND(AVG(r.tokens_used), 0) as avg_tokens,
          MAX(r.created_at) as last_gen,
          CASE 
            WHEN COUNT(f.id) > 0 THEN
              ROUND(
                (COUNT(CASE WHEN f.is_useful = true THEN 1 END)::NUMERIC 
                / COUNT(f.id)) * 100, 
                1
              )
            ELSE 0
          END as useful_pct
        FROM lead_ai_reports r
        LEFT JOIN lead_ai_report_feedback f ON r.id = f.report_id
        WHERE r.lead_type LIKE 'sector_dossier:%'
          AND r.generation_status = 'completed'
        GROUP BY r.lead_type
        ORDER BY count DESC, last_gen DESC
        LIMIT 10
      ) sector_stats
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_sector_dossier_stats() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_sector_dossier_stats() IS 
'Returns aggregated statistics for Sector Dossiers including usage metrics, cache hit rate, top sectors, and costs';