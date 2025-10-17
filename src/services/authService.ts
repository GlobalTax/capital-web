import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Servicio de autenticación
 * Maneja toda la lógica relacionada con la autenticación de usuarios
 */

export interface AuthSession {
  accessToken: string;
  userId: string;
  userEmail?: string;
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('Failed to get current session', error, {
        context: 'auth',
        component: 'authService'
      });
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    return {
      accessToken: session.access_token,
      userId: session.user.id,
      userEmail: session.user.email,
    };
  } catch (error) {
    logger.error('Exception getting current session', error as Error, {
      context: 'auth',
      component: 'authService'
    });
    return null;
  }
}

/**
 * Verifica si hay una sesión válida
 */
export async function hasValidSession(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

/**
 * Refresca el token de sesión
 */
export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logger.error('Failed to refresh session', error, {
        context: 'auth',
        component: 'authService'
      });
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    return {
      accessToken: session.access_token,
      userId: session.user.id,
      userEmail: session.user.email,
    };
  } catch (error) {
    logger.error('Exception refreshing session', error as Error, {
      context: 'auth',
      component: 'authService'
    });
    return null;
  }
}

/**
 * Valida que el usuario actual tenga permisos de admin
 */
export async function validateAdminAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_user_admin_role', { check_user_id: userId });
    
    if (error) {
      logger.error('Failed to validate admin access', error, {
        context: 'auth',
        component: 'authService',
        userId
      });
      return false;
    }
    
    return data === 'admin' || data === 'super_admin';
  } catch (error) {
    logger.error('Exception validating admin access', error as Error, {
      context: 'auth',
      component: 'authService',
      userId
    });
    return false;
  }
}

/**
 * Valida que el usuario actual tenga permisos de super_admin
 */
export async function validateSuperAdminAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_user_super_admin', { check_user_id: userId });
    
    if (error) {
      logger.error('Failed to validate super admin access', error, {
        context: 'auth',
        component: 'authService',
        userId
      });
      return false;
    }
    
    return data === true;
  } catch (error) {
    logger.error('Exception validating super admin access', error as Error, {
      context: 'auth',
      component: 'authService',
      userId
    });
    return false;
  }
}
