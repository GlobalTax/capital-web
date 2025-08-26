// ============= SHARED CONSTANTS =============
// Common constants used across the application

export const API_ENDPOINTS = {
  VALUATIONS: '/api/valuations',
  LEADS: '/api/leads',
  ADMIN: '/api/admin',
  AUTH: '/api/auth',
} as const;

export const QUERY_KEYS = {
  USERS: 'users',
  VALUATIONS: 'valuations',
  LEADS: 'leads',
  ADMIN_STATS: 'adminStats',
  MARKETING_METRICS: 'marketingMetrics',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  ADMIN: '/admin',
  CALCULATOR: '/lp/calculadora',
  CONTACT: '/contacto',
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email es obligatorio',
    INVALID: 'Email no válido',
    MAX_LENGTH: 254,
  },
  PASSWORD: {
    REQUIRED: 'Contraseña es obligatoria',
    MIN_LENGTH: 8,
    WEAK: 'La contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos',
  },
  NAME: {
    REQUIRED: 'Nombre es obligatorio',
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  COMPANY: {
    REQUIRED: 'Empresa es obligatoria',
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;