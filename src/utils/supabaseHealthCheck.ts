
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG, PROJECT_INFO } from '@/config/supabase';

export interface SupabaseHealthStatus {
  isHealthy: boolean;
  config: {
    url: string;
    projectId: string;
    region: string;
    environment: string;
  };
  connection: {
    connected: boolean;
    latency?: number;
    error?: string;
  };
  auth: {
    available: boolean;
    error?: string;
  };
}

/**
 * Verifica el estado de salud de la conexión con Supabase
 */
export const checkSupabaseHealth = async (): Promise<SupabaseHealthStatus> => {
  const startTime = Date.now();
  
  const status: SupabaseHealthStatus = {
    isHealthy: false,
    config: {
      url: SUPABASE_CONFIG.url,
      projectId: PROJECT_INFO.projectId,
      region: PROJECT_INFO.region,
      environment: PROJECT_INFO.environment
    },
    connection: {
      connected: false
    },
    auth: {
      available: false
    }
  };

  try {
    // Test de conexión básica
    const { error: connectionError } = await supabase
      .from('key_statistics')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      status.connection.error = connectionError.message;
    } else {
      status.connection.connected = true;
      status.connection.latency = Date.now() - startTime;
    }

    // Test de autenticación
    try {
      const { error: authError } = await supabase.auth.getSession();
      if (!authError) {
        status.auth.available = true;
      } else {
        status.auth.error = authError.message;
      }
    } catch (authErr) {
      status.auth.error = authErr instanceof Error ? authErr.message : 'Error de autenticación';
    }

    // Estado general
    status.isHealthy = status.connection.connected && status.auth.available;

  } catch (error) {
    status.connection.error = error instanceof Error ? error.message : 'Error desconocido';
  }

  return status;
};

/**
 * Utilidad simple para verificar si Supabase está disponible
 */
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    const health = await checkSupabaseHealth();
    return health.isHealthy;
  } catch {
    return false;
  }
};

/**
 * Log de información de configuración para debugging
 */
export const logSupabaseConfig = () => {
  console.group('🔧 Configuración de Supabase');
  console.log('URL:', SUPABASE_CONFIG.url);
  console.log('Project ID:', PROJECT_INFO.projectId);
  console.log('Región:', PROJECT_INFO.region);
  console.log('Entorno:', PROJECT_INFO.environment);
  console.log('Anon Key (primeros 20 chars):', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
  console.groupEnd();
};
