// ============= ENHANCED AUTH HOOK =============
// Hook mejorado para gestión de autenticación con funcionalidades avanzadas

import { useState, useEffect, useCallback } from 'react';
import { enhancedAuthService, AuthSession, AuthAttempt } from '@/services/enhanced-auth.service';
import { useToast } from '@/hooks/use-toast';
import { devLogger } from '@/utils/devLogger';

export interface UseEnhancedAuthReturn {
  // Estado de sesión
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Métodos de autenticación
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Gestión de sesión
  refreshSession: () => Promise<boolean>;
  checkSessionValidity: () => boolean;
  getTimeUntilExpiry: () => number | null;
  
  // Seguridad y monitoreo
  getRecentAttempts: () => AuthAttempt[];
  isRateLimited: (email: string) => boolean;
  getFailedAttempts: () => AuthAttempt[];
  
  // Estados adicionales
  sessionExpired: boolean;
  requiresRefresh: boolean;
}

export const useEnhancedAuth = (): UseEnhancedAuthReturn => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { toast } = useToast();

  // Inicializar sesión al montar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentSession = await enhancedAuthService.getCurrentSession();
        setSession(currentSession);
        setSessionExpired(!currentSession?.isValid);
      } catch (error) {
        devLogger.error('Failed to initialize auth', error as Error, 'auth');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios de sesión
    const unsubscribe = enhancedAuthService.onSessionChange((newSession) => {
      setSession(newSession);
      setSessionExpired(!newSession?.isValid);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Monitorear expiración de sesión
  useEffect(() => {
    if (!session?.isValid) return;

    const checkExpiry = () => {
      const timeUntilExpiry = getTimeUntilExpiry();
      if (timeUntilExpiry !== null && timeUntilExpiry <= 0) {
        setSessionExpired(true);
        toast({
          title: 'Sesión Expirada',
          description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          variant: 'destructive'
        });
      }
    };

    const interval = setInterval(checkExpiry, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [session, toast]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (enhancedAuthService.isRateLimited(email)) {
      toast({
        title: 'Demasiados Intentos',
        description: 'Has superado el límite de intentos de inicio de sesión. Espera 15 minutos.',
        variant: 'destructive'
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const result = await enhancedAuthService.signIn(email, password);
      
      if (result.success) {
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión correctamente.'
        });
        return true;
      } else {
        toast({
          title: 'Error de Autenticación',
          description: result.error || 'Credenciales incorrectas',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      devLogger.error('Sign in failed', error as Error, 'auth');
      toast({
        title: 'Error',
        description: 'Error inesperado durante el inicio de sesión',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await enhancedAuthService.signUp(email, password);
      
      if (result.success) {
        toast({
          title: '¡Registro Exitoso!',
          description: result.requiresConfirmation 
            ? 'Revisa tu email para confirmar tu cuenta.'
            : 'Tu cuenta ha sido creada correctamente.'
        });
        return true;
      } else {
        toast({
          title: 'Error de Registro',
          description: result.error || 'Error al crear la cuenta',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      devLogger.error('Sign up failed', error as Error, 'auth');
      toast({
        title: 'Error',
        description: 'Error inesperado durante el registro',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await enhancedAuthService.signOut();
      toast({
        title: 'Sesión Cerrada',
        description: 'Has cerrado sesión correctamente.'
      });
    } catch (error) {
      devLogger.error('Sign out failed', error as Error, 'auth');
      toast({
        title: 'Error',
        description: 'Error al cerrar sesión',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      // This would be implemented in the service
      const currentSession = await enhancedAuthService.getCurrentSession();
      if (currentSession) {
        setSession(currentSession);
        setSessionExpired(false);
        return true;
      }
      return false;
    } catch (error) {
      devLogger.error('Session refresh failed', error as Error, 'auth');
      return false;
    }
  }, []);

  const checkSessionValidity = useCallback((): boolean => {
    return session?.isValid || false;
  }, [session]);

  const getTimeUntilExpiry = useCallback((): number | null => {
    if (!session?.expiresAt) return null;
    return session.expiresAt.getTime() - Date.now();
  }, [session]);

  const getRecentAttempts = useCallback((): AuthAttempt[] => {
    return enhancedAuthService.getRecentAttempts();
  }, []);

  const isRateLimited = useCallback((email: string): boolean => {
    return enhancedAuthService.isRateLimited(email);
  }, []);

  const getFailedAttempts = useCallback((): AuthAttempt[] => {
    return enhancedAuthService.getFailedAttempts();
  }, []);

  const requiresRefresh = session ? getTimeUntilExpiry() !== null && getTimeUntilExpiry()! < 5 * 60 * 1000 : false;

  return {
    // Estado de sesión
    session,
    isLoading,
    isAuthenticated: !!session?.isValid,
    
    // Métodos de autenticación
    signIn,
    signUp,
    signOut,
    
    // Gestión de sesión
    refreshSession,
    checkSessionValidity,
    getTimeUntilExpiry,
    
    // Seguridad y monitoreo
    getRecentAttempts,
    isRateLimited,
    getFailedAttempts,
    
    // Estados adicionales
    sessionExpired,
    requiresRefresh
  };
};