
/**
 * Configuración centralizada de Supabase para Capittal
 * 
 * NOTA IMPORTANTE SOBRE SEGURIDAD:
 * - La SUPABASE_ANON_KEY es una clave pública por diseño y es segura para exposición
 * - Esta clave solo permite operaciones autorizadas por las políticas RLS (Row Level Security)
 * - NO permite acceso administrativo a la base de datos
 * - Es diferente de la SERVICE_ROLE_KEY que sí es privada y no debe exponerse
 */

// Configuración de Supabase
export const SUPABASE_CONFIG = {
  url: "https://fwhqtzkkvnjkazhaficj.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"
} as const;

// Validación de configuración
export const validateSupabaseConfig = () => {
  const { url, anonKey } = SUPABASE_CONFIG;
  
  if (!url || !url.includes('supabase.co')) {
    throw new Error('SUPABASE_URL no está configurada correctamente');
  }
  
  if (!anonKey || !anonKey.startsWith('eyJ')) {
    throw new Error('SUPABASE_ANON_KEY no está configurada correctamente');
  }
  
  return true;
};

// Información del proyecto
export const PROJECT_INFO = {
  projectId: "fwhqtzkkvnjkazhaficj",
  region: "eu-west-1",
  environment: "production"
} as const;
