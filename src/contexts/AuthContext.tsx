
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { dataService } from '@/core/data/DataService';
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
    if (!targetUserId || isCheckingAdmin) {
      setIsAdmin(false);
      return false;
    }
    
    setIsCheckingAdmin(true);
    try {
      const adminStatus = await dataService.checkAdminStatus(targetUserId);
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
    } finally {
      setIsCheckingAdmin(false);
    }
  }, [user?.id, isCheckingAdmin]);



  useEffect(() => {
    let mounted = true;
    
    // Function to handle auth state changes
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
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
          // Check admin status when user signs in
          try {
            await checkAdminStatus(session.user.id);
          } catch (error) {
            logger.warn('Admin status check failed', { error }, { context: 'auth', component: 'AuthContext' });
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        logger.error('Error in auth state change handler', error as Error, { context: 'auth', component: 'AuthContext' });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = dataService.onAuthStateChange(handleAuthStateChange);

    // Initial session check
    const initializeSession = async () => {
      try {
        const session = await dataService.getSession();
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
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await dataService.signIn(email, password);

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
    
    const { error } = await dataService.signUp(email, password, fullName);

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
    await dataService.signOut();
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
