-- Fix security for the new view
CREATE OR REPLACE VIEW v_cr_portfolio_con_actividad 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.fund_id,
  p.company_name,
  p.website,
  p.country,
  p.sector,
  p.sector_pe,
  p.investment_year,
  p.investment_type,
  p.ownership_type,
  p.status,
  p.exit_year,
  p.exit_type,
  p.description,
  p.source_url,
  p.notes,
  p.is_deleted,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  p.last_news_scan_at,
  p.news_alert_count,
  p.last_web_check_at,
  p.scan_priority,
  p.skip_news_scan,
  p.enriched_data,
  p.enriched_at,
  p.employee_count_estimate,
  p.revenue_estimate,
  p.technologies,
  p.key_people,
  p.social_links,
  p.enrichment_source,
  COALESCE(p.fund_name, f.name) as fund_display_name,
  f.fund_type,
  (SELECT MAX(i.sent_at) FROM cr_portfolio_interactions i WHERE i.portfolio_id = p.id) as ultima_interaccion,
  (SELECT COUNT(*) FROM cr_portfolio_interactions i WHERE i.portfolio_id = p.id) as total_interacciones
FROM cr_portfolio p
LEFT JOIN cr_funds f ON p.fund_id = f.id
WHERE p.is_deleted = false;