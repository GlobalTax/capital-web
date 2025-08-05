// ============= QUERY KEYS CONSTANTS =============
// Claves centralizadas para React Query

export const QUERY_KEYS = {
  // Dashboard
  ADVANCED_DASHBOARD_STATS: 'advanced_dashboard_stats',
  MARKETING_METRICS: 'marketing_metrics',
  
  // Alertas y Leads
  LEAD_ALERTS: 'lead_alerts',
  HOT_LEADS: 'hotLeads',
  ALL_LEADS: 'allLeads',
  LEAD_SCORING_RULES: 'leadScoringRules',
  
  // Blog
  BLOG_POSTS: 'blog_posts',
  BLOG_POST_DETAIL: 'blog_post_detail',
  BLOG_ANALYTICS: 'blog_analytics',
  
  // Usuarios y Auth
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  
  // Sistema
  SYSTEM_METRICS: 'system_metrics',
  PERFORMANCE_METRICS: 'performance_metrics'
} as const;

export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];