
import React, { createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { AuthenticationError } from '@/types/errorTypes';
import { useAdminAuth as useRobustAdminAuth } from '@/hooks/useAdminAuth';

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
  const { toast } = useToast();
  
  // Usar el hook robusto como fuente de verdad única
  const robustAuth = useRobustAdminAuth();

  // Delegar checkAdminStatus al hook robusto
  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    await robustAuth.refreshAuth();
    return robustAuth.isAdmin;
  }, [robustAuth]);

  // signUp se mantiene porque useAdminAuth no lo implementa (es específico de registro)
  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
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

    return { error };
  };

  // Clear auth session and local storage
  const clearAuthSession = async (): Promise<void> => {
    try {
      logger.info('Clearing auth session', undefined, { context: 'auth', component: 'AuthContext' });
      
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
      
      // Sign out using robust auth
      await robustAuth.signOut();
      
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
      user: robustAuth.user ? {
        id: robustAuth.user.id,
        email: robustAuth.user.email,
        authenticated: !!robustAuth.user
      } : null,
      session: robustAuth.session ? {
        hasSession: !!robustAuth.session,
        accessToken: !!robustAuth.session.access_token,
        refreshToken: !!robustAuth.session.refresh_token,
        expiresAt: robustAuth.session.expires_at
      } : null,
      auth: {
        isLoading: robustAuth.isLoading,
        isAdmin: robustAuth.isAdmin,
        role: robustAuth.role
      },
      localStorage: Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('supabase')
      ),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }, [robustAuth]);

  const value = {
    user: robustAuth.user,
    session: robustAuth.session,
    isLoading: robustAuth.isLoading,
    isAdmin: robustAuth.isAdmin,
    signIn: robustAuth.signIn,
    signUp,
    signOut: robustAuth.signOut,
    checkAdminStatus,
    forceAdminReload: robustAuth.refreshAuth,
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
