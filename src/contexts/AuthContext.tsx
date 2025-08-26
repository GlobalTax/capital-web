
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { DatabaseError, AuthenticationError } from '@/types/errorTypes';

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
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  checkRegistrationStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrationRequest, setRegistrationRequest] = useState<RegistrationRequest | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const { toast } = useToast();

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      // Only check for existing admin status - NO auto-creation
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        logger.warn('Error checking admin status', { userId: targetUserId, error: error.message }, { context: 'auth', component: 'AuthContext' });
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!data?.is_active;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      logger.error('Failed to check admin status', error as Error, { 
        context: 'auth', 
        component: 'AuthContext',
        userId: targetUserId 
      });
      setIsAdmin(false);
      return false;
    }
  }, [user?.id]);

  // Check registration status for non-admin users with debouncing
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  
  const checkRegistrationStatus = useCallback(async (): Promise<void> => {
    if (!user?.id || isCheckingRegistration) {
      if (!user?.id) {
        setRegistrationRequest(null);
        setIsApproved(false);
      }
      return;
    }

    try {
      setIsCheckingRegistration(true);
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('id, status, requested_at, rejection_reason')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Si no hay solicitud de registro, crear una nueva (solo una vez)
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_registration_requests')
            .insert({
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email || '',
              user_agent: navigator.userAgent,
              ip_address: null
            });

          if (insertError && insertError.code !== '23505') { // Ignorar duplicate key error
            console.error('Error creating registration request:', insertError);
          }

          setRegistrationRequest({
            id: '',
            status: 'pending',
            requested_at: new Date().toISOString()
          });
          setIsApproved(false);
        }
        return;
      }

      setRegistrationRequest(data as RegistrationRequest);
      setIsApproved(data.status === 'approved');
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setIsCheckingRegistration(false);
    }
  }, [user?.id, user?.email, user?.user_metadata, isCheckingRegistration]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, hasUser: !!session?.user }, { context: 'auth', component: 'AuthContext' });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin status directly with user ID
          const adminStatus = await checkAdminStatus(session.user.id);
          
          // Solo verificar estado de registro si no es admin (con debounce)
          if (!adminStatus) {
            setTimeout(() => {
              checkRegistrationStatus();
            }, 1000); // 1 second debounce
          } else {
            setIsApproved(true);
          }
        } else {
          setIsAdmin(false);
          setIsApproved(false);
          setRegistrationRequest(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        
        // Solo verificar estado de registro si no es admin (con debounce)
        if (!adminStatus) {
          setTimeout(() => {
            checkRegistrationStatus();
          }, 1000); // 1 second debounce
        } else {
          setIsApproved(true);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove dependencies to prevent infinite loops

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
    setRegistrationRequest(null);
    setIsApproved(false);
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
    checkAdminStatus,
    checkRegistrationStatus,
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
