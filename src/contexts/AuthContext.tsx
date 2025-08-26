
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { DatabaseError, AuthenticationError } from '@/types/errorTypes';
import { useAdminStatusQuery, useRegistrationStatusQuery } from '@/services/auth-queries.service';

interface RegistrationRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  rejection_reason?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  registrationRequest: RegistrationRequest | null;
  isApproved: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const registrationRequestAttempted = React.useRef(false);
  const { toast } = useToast();

  // FIXED: Remove circular dependency - both queries run independently
  const { data: adminStatusData, isLoading: isLoadingAdmin, error: adminError } = useAdminStatusQuery(
    user?.id && authInitialized ? user.id : null
  );
  const { data: registrationStatusData, isLoading: isLoadingRegistration, error: registrationError } = useRegistrationStatusQuery(
    user?.id && authInitialized ? user.id : null
  );

  // Derived state from queries with fallbacks and circuit breaker
  const isAdmin = adminStatusData?.isAdmin ?? false;
  const registrationRequest = (registrationStatusData?.request as RegistrationRequest) ?? null;
  // Only check registration status if NOT admin
  const isApproved = isAdmin || (registrationStatusData?.isApproved ?? false);

  // Debug logging for infinite loop detection
  React.useEffect(() => {
    if (user?.id && authInitialized) {
      console.log('AuthContext Debug:', {
        userId: user.id,
        isAdmin,
        isLoadingAdmin,
        isLoadingRegistration,
        hasRegistrationRequest: !!registrationRequest,
        adminError: !!adminError,
        registrationError: !!registrationError,
        registrationRequestAttempted: registrationRequestAttempted.current
      });
    }
  }, [user?.id, isAdmin, isLoadingAdmin, isLoadingRegistration, registrationRequest, adminError, registrationError]);

  // FIXED: Simplified registration request creation with circuit breaker
  useEffect(() => {
    if (
      user?.id && 
      authInitialized && 
      !isLoadingAdmin && 
      !isAdmin && 
      !registrationRequest && 
      !registrationRequestAttempted.current &&
      !adminError && // Don't create if admin query failed
      !registrationError // Don't create if registration query failed
    ) {
      registrationRequestAttempted.current = true;
      
      const createRegistrationRequest = async () => {
        try {
          await supabase
            .from('user_registration_requests')
            .insert({
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email || '',
              user_agent: navigator.userAgent,
              ip_address: null
            });
          console.log('Registration request created for user:', user.id);
        } catch (error: any) {
          // Ignore duplicate key errors
          if (error?.code !== '23505') {
            console.error('Error creating registration request:', error);
          }
        }
      };

      createRegistrationRequest();
    }
  }, [user?.id, authInitialized, isLoadingAdmin, isAdmin, registrationRequest, adminError, registrationError]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('Auth state changed', { event, hasUser: !!session?.user }, { context: 'auth', component: 'AuthContext' });
        setSession(session);
        setUser(session?.user ?? null);
        setAuthInitialized(true);
        setIsLoading(false); // Always stop loading after auth state change
      }
    );

    // Check for existing session with timeout
    const sessionTimeout = setTimeout(() => {
      logger.warn('Session check timeout, proceeding without session', undefined, { context: 'auth', component: 'AuthContext' });
      setIsLoading(false);
      setAuthInitialized(true);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(sessionTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      setAuthInitialized(true);
      setIsLoading(false);
    }).catch((error) => {
      clearTimeout(sessionTimeout);
      logger.error('Failed to get session', error, { context: 'auth', component: 'AuthContext' });
      setIsLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(sessionTimeout);
    };
  }, []);

  // Initialize loading timeout fallback
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        logger.warn('Auth loading timeout reached, forcing completion', undefined, { context: 'auth', component: 'AuthContext' });
        setIsLoading(false);
        setAuthInitialized(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

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
    registrationRequest,
    isApproved,
    signIn,
    signUp,
    signOut,
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
