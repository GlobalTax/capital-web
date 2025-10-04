
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { DatabaseError, AuthenticationError } from '@/types/errorTypes';

// ============= ADMIN CACHE =============
/**
 * Admin Status Cache Configuration
 * 
 * TTL: 10 minutos (600,000ms) - Balance entre UX y seguridad
 * Storage: sessionStorage (se limpia al cerrar pestaña)
 * Key Format: "admin_status:{userId}"
 * Invalidación: 
 *   - Automática: Al superar TTL
 *   - Manual: clearAuthSession() limpia toda la caché
 * 
 * Flujo optimista:
 * 1. checkAdminStatus() consulta caché primero
 * 2. Cache hit → retorno inmediato + actualización background
 * 3. Cache miss → consulta DB + guardar resultado
 */
const ADMIN_CACHE_TTL = 10 * 60 * 1000; // 10 minutos
const ADMIN_CACHE_KEY_PREFIX = 'admin_status:';

const getCachedAdminStatus = (userId: string): boolean | null => {
  try {
    const cacheKey = `${ADMIN_CACHE_KEY_PREFIX}${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { status, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > ADMIN_CACHE_TTL) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return status;
  } catch {
    return null;
  }
};

const setCachedAdminStatus = (userId: string, status: boolean): void => {
  try {
    const cacheKey = `${ADMIN_CACHE_KEY_PREFIX}${userId}`;
    sessionStorage.setItem(cacheKey, JSON.stringify({
      status,
      timestamp: Date.now()
    }));
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  forceAdminReload: () => Promise<void>;
  getDebugInfo: () => any;
  clearAuthSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      setIsAdmin(false);
      return false;
    }

    // 🚀 OPTIMIZACIÓN: Verificar caché primero (resolución optimista)
    const cachedStatus = getCachedAdminStatus(targetUserId);
    if (cachedStatus !== null) {
      setIsAdmin(cachedStatus);
      // Actualizar en background para mantener caché fresca
      setTimeout(() => {
        checkAdminStatusFromDB(targetUserId);
      }, 100);
      return cachedStatus;
    }
    
    // Prevent concurrent admin checks
    if (isCheckingAdmin) {
      return isAdmin;
    }
    
    return checkAdminStatusFromDB(targetUserId);
  }, [user?.id, isCheckingAdmin, isAdmin]);

  // Función interna para consultar DB (reutilizable)
  const checkAdminStatusFromDB = async (userId: string): Promise<boolean> => {
    setIsCheckingAdmin(true);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 5000);
      });

      const checkPromise = supabase
        .from('admin_users')
        .select('is_active, role')
        .eq('user_id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]);

      if (error) {
        // If it's a network error, try one more time after a short delay
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryPromise = supabase
            .from('admin_users')
            .select('is_active, role')
            .eq('user_id', userId)
            .maybeSingle();
            
          const { data: retryData, error: retryError } = await Promise.race([
            retryPromise, 
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Retry timeout')), 3000))
          ]);
            
          if (!retryError && retryData) {
            const adminStatus = !!(retryData && retryData.is_active === true);
            setIsAdmin(adminStatus);
            setCachedAdminStatus(userId, adminStatus); // ✅ Guardar en caché
            return adminStatus;
          }
        }
        
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!(data && data.is_active === true);
      setIsAdmin(adminStatus);
      setCachedAdminStatus(userId, adminStatus); // ✅ Guardar en caché
      
      if (adminStatus) {
        logger.info('Admin access granted', {
          userId,
          role: data?.role
        }, { context: 'auth', component: 'AuthContext' });
      }
      
      return adminStatus;
    } catch (error) {
      logger.error('Failed to check admin status', error as Error, { 
        context: 'auth', 
        component: 'AuthContext',
        userId 
      });
      
      // Toast genérico para timeouts (no alarmante)
      if (error instanceof Error && error.message.includes('timeout')) {
        toast({
          title: "Verificación lenta",
          description: "La verificación de permisos está tardando. Intenta recargar si el problema persiste.",
          variant: "default",
        });
      }
      
      setIsAdmin(false);
      return false;
    } finally {
      setIsCheckingAdmin(false);
    }
  };


  useEffect(() => {
    let mounted = true;
    
    // ⚡ OPTIMIZACIÓN: Timeout reducido a 6s
    const globalTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        setIsLoading(false);
      }
    }, 6000);
    
    setAuthTimeout(globalTimeout);
    
    // Function to handle auth state changes
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      // Clear timeout on any auth state change
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isCheckingAdmin) {
          // Check admin status (con caché optimista)
          try {
            await checkAdminStatus(session.user.id);
          } catch (error) {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        logger.error('Error in auth state change handler', error as Error, { 
          context: 'auth', 
          component: 'AuthContext' 
        });
      } finally {
        if (mounted && event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check with retry mechanism and timeout
    const initializeSession = async () => {
      if (!mounted) return;
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timeout')), 8000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (error) {
          logger.error('Error getting initial session', error, { context: 'auth', component: 'AuthContext' });
          // Try to refresh session on error
          const refreshPromise = supabase.auth.refreshSession();
          const { data: refreshData, error: refreshError } = await Promise.race([
            refreshPromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Refresh timeout')), 5000))
          ]);
          
          if (!refreshError && refreshData.session) {
            await handleAuthStateChange('INITIAL_SESSION_REFRESH', refreshData.session);
            return;
          }
        }
        
        await handleAuthStateChange('INITIAL_SESSION', session);
      } catch (error) {
        logger.error('Failed to initialize session', error as Error, { context: 'auth', component: 'AuthContext' });
        
        // Toast solo si es timeout crítico (>8s)
        if (error instanceof Error && error.message.includes('timeout')) {
          toast({
            title: "Carga lenta",
            description: "La carga está tardando más de lo normal. Intenta recargar la página.",
            variant: "default",
          });
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, []); // Remove dependencies to prevent infinite re-renders

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const authError = new AuthenticationError('Sign in failed', { email, error: error.message });
      logger.error('Sign in failed', authError, { context: 'auth', component: 'AuthContext' });
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      logger.info('User signed in successfully', undefined, { context: 'auth', component: 'AuthContext' });
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
    }

    setIsLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      const authError = new AuthenticationError('Sign up failed', { email, error: error.message });
      logger.error('Sign up failed', authError, { context: 'auth', component: 'AuthContext' });
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      logger.info('User signed up successfully', undefined, { context: 'auth', component: 'AuthContext' });
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud está pendiente de aprobación. Te notificaremos por email.",
      });
    }

    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsLoading(false);
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  // Force admin reload for debugging
  const forceAdminReload = useCallback(async () => {
    setIsAdmin(false);
    setIsCheckingAdmin(false);
    
    if (user?.id) {
      await checkAdminStatus(user.id);
    }
  }, [user?.id, checkAdminStatus]);

  // Clear auth session and local storage
  const clearAuthSession = async (): Promise<void> => {
    try {
      logger.info('Clearing auth session', undefined, { context: 'auth', component: 'AuthContext' });
      
      // Clear timeout if exists
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      // Clear auth-related localStorage and sessionStorage (incluye caché admin)
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || 
        key.includes('supabase') || 
        key.includes('session') ||
        key.includes('admin')
      );
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Limpiar caché de admin en sessionStorage
      Object.keys(sessionStorage).filter(key => key.startsWith(ADMIN_CACHE_KEY_PREFIX)).forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Clear auth-related cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('auth') || name.includes('supabase') || name.includes('session')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset all state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsLoading(false);
      setIsCheckingAdmin(false);
      
      toast({
        title: "Sesión limpiada",
        description: "Se ha limpiado toda la información de autenticación.",
      });
      
    } catch (error: any) {
      logger.error('Error clearing auth session', error, { context: 'auth', component: 'AuthContext' });
      
      toast({
        title: "Error al limpiar",
        description: "Hubo un problema al limpiar la sesión. Intenta recargar la página.",
        variant: "destructive",
      });
    }
  };

  // Get debug information
  const getDebugInfo = useCallback(() => {
    return {
      user: user ? {
        id: user.id,
        email: user.email,
        authenticated: !!user
      } : null,
      session: session ? {
        hasSession: !!session,
        accessToken: !!session.access_token,
        refreshToken: !!session.refresh_token,
        expiresAt: session.expires_at
      } : null,
      auth: {
        isLoading,
        isAdmin,
        isCheckingAdmin,
        hasTimeout: !!authTimeout
      },
      localStorage: Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('supabase')
      ),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }, [user, session, isLoading, isAdmin, isCheckingAdmin, authTimeout]);

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAdminStatus,
    forceAdminReload,
    getDebugInfo,
    clearAuthSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
