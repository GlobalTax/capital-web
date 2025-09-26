
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
    
    console.log('🔍 checkAdminStatus called', { targetUserId, isCheckingAdmin });
    
    if (!targetUserId) {
      console.log('❌ No target user ID, setting admin to false');
      setIsAdmin(false);
      return false;
    }
    
    // Prevent concurrent admin checks
    if (isCheckingAdmin) {
      console.log('⚠️ Admin check already in progress, returning current status');
      return isAdmin;
    }
    
    setIsCheckingAdmin(true);
    console.log('🚀 Starting admin status check for user:', targetUserId);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 5000);
      });

      const checkPromise = supabase
        .from('admin_users')
        .select('is_active, role')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]);
      
      console.log('📊 Admin check result:', { data, error });

      if (error) {
        console.log('❌ Admin check error:', error.message);
        
        // If it's a network error, try one more time after a short delay
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          console.log('🔄 Network error detected, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryPromise = supabase
            .from('admin_users')
            .select('is_active, role')
            .eq('user_id', targetUserId)
            .maybeSingle();
            
          const { data: retryData, error: retryError } = await Promise.race([
            retryPromise, 
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Retry timeout')), 3000))
          ]);
            
          if (!retryError && retryData) {
            console.log('🎯 Retry successful:', retryData);
            const adminStatus = !!(retryData && retryData.is_active === true);
            setIsAdmin(adminStatus);
            return adminStatus;
          }
        }
        
        logger.warn('Error checking admin status', { 
          userId: targetUserId, 
          error: error.message 
        }, { context: 'auth', component: 'AuthContext' });
        
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!(data && data.is_active === true);
      console.log('✅ Admin status determined:', adminStatus);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        console.log('🎉 Admin access granted');
        logger.info('Admin access granted', {
          userId: targetUserId,
          role: data?.role
        }, { context: 'auth', component: 'AuthContext' });
      }
      
      return adminStatus;
    } catch (error) {
      console.log('💥 Admin check failed:', error);
      logger.error('Failed to check admin status', error as Error, { 
        context: 'auth', 
        component: 'AuthContext',
        userId: targetUserId 
      });
      setIsAdmin(false);
      return false;
    } finally {
      console.log('🏁 Admin check completed, setting isCheckingAdmin to false');
      setIsCheckingAdmin(false);
    }
  }, [user?.id, isCheckingAdmin, isAdmin]);


  useEffect(() => {
    let mounted = true;
    
    // Security timeout - force loading to false after 10 seconds
    const globalTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('⚠️ Auth initialization timeout, forcing completion');
        logger.warn('Auth initialization timeout exceeded', undefined, { 
          context: 'auth', 
          component: 'AuthContext' 
        });
        setIsLoading(false);
      }
    }, 10000);
    
    setAuthTimeout(globalTimeout);
    
    // Function to handle auth state changes
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', { event, hasUser: !!session?.user, userId: session?.user?.id });
      
      // Clear timeout on any auth state change
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      logger.debug('Auth state changed', { 
        event, 
        hasUser: !!session?.user,
        userId: session?.user?.id
      }, { context: 'auth', component: 'AuthContext' });
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isCheckingAdmin) {
          console.log('👤 User found, checking admin status...');
          // Check admin status with circuit breaker logic
          try {
            const adminResult = await checkAdminStatus(session.user.id);
            console.log('🔐 Admin check result:', adminResult);
          } catch (error) {
            console.log('💥 Admin status check failed:', error);
            logger.warn('Admin status check failed', { 
              error: error.message 
            }, { context: 'auth', component: 'AuthContext' });
            setIsAdmin(false);
          }
        } else {
          console.log('🚫 No user, setting admin to false');
          setIsAdmin(false);
        }
      } catch (error) {
        console.log('💥 Error in auth state change handler:', error);
        logger.error('Error in auth state change handler', error as Error, { 
          context: 'auth', 
          component: 'AuthContext' 
        });
      } finally {
        if (mounted && event !== 'INITIAL_SESSION') {
          console.log('✅ Setting isLoading to false');
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
        console.log('💥 Session initialization failed:', error);
        logger.error('Failed to initialize session', error as Error, { context: 'auth', component: 'AuthContext' });
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
      console.log('🧹 Clearing auth session and local storage...');
      logger.info('Clearing auth session', undefined, { context: 'auth', component: 'AuthContext' });
      
      // Clear timeout if exists
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      // Clear auth-related localStorage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || 
        key.includes('supabase') || 
        key.includes('session') ||
        key.includes('admin')
      );
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed localStorage key:', key);
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
      
      console.log('✅ Auth session cleared successfully');
      
      toast({
        title: "Sesión limpiada",
        description: "Se ha limpiado toda la información de autenticación.",
      });
      
    } catch (error: any) {
      console.log('💥 Error clearing auth session:', error);
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
