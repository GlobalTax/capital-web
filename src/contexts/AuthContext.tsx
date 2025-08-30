
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      console.log('🔐 Admin check: No user ID provided');
      setIsAdmin(false);
      return false;
    }
    
    if (isCheckingAdmin) {
      console.log('🔐 Admin check: Already checking, skipping to prevent loops');
      return isAdmin;
    }
    
    setIsCheckingAdmin(true);
    console.log('🔐 Starting admin status check for user:', targetUserId);
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role, is_active, needs_credentials')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('🔐 Admin check error:', error.message);
        logger.warn('Error checking admin status', { userId: targetUserId, error: error.message }, { context: 'auth', component: 'AuthContext' });
        setIsAdmin(false);
        return false;
      }

      console.log('🔐 Admin data retrieved:', data);
      
      const adminStatus = !!data?.is_active;
      console.log('🔐 Admin status determined:', adminStatus);
      
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('🔐 Admin check failed:', error);
      logger.error('Failed to check admin status', error as Error, { 
        context: 'auth', 
        component: 'AuthContext',
        userId: targetUserId 
      });
      setIsAdmin(false);
      return false;
    } finally {
      setIsCheckingAdmin(false);
    }
  }, [user?.id, isCheckingAdmin, isAdmin]);


  useEffect(() => {
    let mounted = true;
    
    // Function to handle auth state changes
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      console.log('🔐 Auth state change:', { event, hasUser: !!session?.user, userId: session?.user?.id });
      
      // Enhanced logging for debugging JWT issues
      logger.debug('Auth state changed', { 
        event, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        hasSession: !!session 
      }, { context: 'auth', component: 'AuthContext' });
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔐 User authenticated, checking admin status...');
          // Defer admin check to prevent blocking auth flow
          setTimeout(async () => {
            try {
              await checkAdminStatus(session.user.id);
            } catch (error) {
              console.error('🔐 Admin check failed:', error);
              logger.warn('Admin status check failed', { error: error.message }, { context: 'auth', component: 'AuthContext' });
              setIsAdmin(false);
            }
          }, 100);
        } else {
          console.log('🔐 No user, setting admin to false');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('🔐 Error in auth handler:', error);
        logger.error('Error in auth state change handler', error as Error, { context: 'auth', component: 'AuthContext' });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check with retry mechanism
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting initial session', error, { context: 'auth', component: 'AuthContext' });
          // Try to refresh session on error
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshData.session) {
            await handleAuthStateChange('INITIAL_SESSION_REFRESH', refreshData.session);
            return;
          }
        }
        
        await handleAuthStateChange('INITIAL_SESSION', session);
      } catch (error) {
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
    };
  }, []); // Remove checkAdminStatus dependency to prevent infinite re-renders

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

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAdminStatus,
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
