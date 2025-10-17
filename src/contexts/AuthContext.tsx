
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { DatabaseError, AuthenticationError } from '@/types/errorTypes';

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
    
    if (isCheckingAdmin) {
      return isAdmin;
    }
    
    return checkAdminStatusFromDB(targetUserId);
  }, [user?.id, isCheckingAdmin, isAdmin]);

  const checkAdminStatusFromDB = async (userId: string): Promise<boolean> => {
    setIsCheckingAdmin(true);
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_active, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!(data && data.is_active === true);
      setIsAdmin(adminStatus);
      
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
      
      setIsAdmin(false);
      return false;
    } finally {
      setIsCheckingAdmin(false);
    }
  };


  useEffect(() => {
    let mounted = true;
    
    // ⚡ Timeout global reducido 6s → 5s
    const globalTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        setIsLoading(false);
      }
    }, 5000);
    
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
        // ⚡ Session init timeout reducido 8s → 6s
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timeout')), 6000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (error) {
          logger.error('Error getting initial session', error, { context: 'auth', component: 'AuthContext' });
          // ⚡ Refresh timeout reducido 5s → 3s
          const refreshPromise = supabase.auth.refreshSession();
          const { data: refreshData, error: refreshError } = await Promise.race([
            refreshPromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Refresh timeout')), 3000))
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
      
      // Clear auth-related localStorage and sessionStorage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || 
        key.includes('supabase') || 
        key.includes('session')
      );
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
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
