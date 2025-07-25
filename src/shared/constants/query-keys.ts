// ============= QUERY KEYS CONSTANTS =============
// Claves centralizadas para React Query

export const QUERY_KEYS = {
  // Marketing metrics
  MARKETING_METRICS: 'marketing_metrics_unified',
  MARKETING_HUB: 'marketing_hub_unified',
  
  // Blog analytics
  BLOG_ANALYTICS: 'blog_analytics',
  BLOG_POST_METRICS: 'blog_post_metrics',
  
  // Lead management
  LEAD_SCORES: 'lead_scores',
  LEAD_BEHAVIOR: 'lead_behavior_events',
  LEAD_ALERTS: 'lead_alerts',
  
  // Contact management
  CONTACT_LEADS: 'contact_leads',
  COMPANY_VALUATIONS: 'company_valuations',
  
  // Content management
  BLOG_POSTS: 'blog_posts',
  CASE_STUDIES: 'case_studies',
  LANDING_PAGES: 'landing_pages',
  
  // Admin
  ADMIN_USERS: 'admin_users',
  ADMIN_AUDIT_LOG: 'admin_audit_log',
  
  // Performance
  CONTENT_PERFORMANCE: 'content_performance',
  BUSINESS_METRICS: 'business_metrics',
} as const;

export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];