// ============= APPLICATION CONFIGURATION =============
// Configuración centralizada de la aplicación

export const APP_CONFIG = {
  // Performance settings
  PERFORMANCE: {
    QUERY_STALE_TIME: 2 * 60 * 1000, // 2 minutos
    QUERY_GC_TIME: 10 * 60 * 1000, // 10 minutos
    QUERY_RETRY_COUNT: 2,
    DEBOUNCE_DELAY: 300,
  },

  // API limits
  API_LIMITS: {
    CONTACT_LEADS: 1000,
    LEAD_SCORES: 500,
    COMPANY_VALUATIONS: 500,
    BLOG_ANALYTICS: 2000,
    BLOG_POST_METRICS: 100,
    LEAD_BEHAVIOR_EVENTS: 1000,
  },

  // Lead scoring thresholds
  LEAD_SCORING: {
    HOT_LEAD_THRESHOLD: 80,
    MEDIUM_LEAD_THRESHOLD: 50,
    QUALIFIED_LEAD_THRESHOLD: 70,
  },

  // Dashboard refresh intervals
  REFRESH_INTERVALS: {
    DASHBOARD_AUTO_REFRESH: 5 * 60 * 1000, // 5 minutos
    METRICS_REFRESH: 2 * 60 * 1000, // 2 minutos
    ALERTS_REFRESH: 30 * 1000, // 30 segundos
  },

  // Environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;