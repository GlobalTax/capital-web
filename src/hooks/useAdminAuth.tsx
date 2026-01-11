import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Sistema de Autenticación Robusto - Hook Principal
 * 
 * Características:
 * - Sin dependencias de React Query
 * - Sin timeouts complejos
 * - Cache simple en memoria con TTL reducido (1 min)
 * - Invalidación en tiempo real via Supabase Realtime
 * - No race conditions
 * - Fail fast
 */

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'none';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  role: AdminRole;
  error: string | null;
}

interface AdminAuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Cache simple en memoria (se resetea al recargar página)
// TTL reducido a 1 minuto para minimizar ventana de acceso post-revocación
const adminCache = new Map<string, { isAdmin: boolean; role: AdminRole; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minuto (antes era 5 minutos)

// === SINGLETON: Prevenir suscripciones múltiples al canal Realtime ===
let globalRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let globalRealtimeUserId: string | null = null;

// === Shared promise para evitar race conditions en checks concurrentes ===
let pendingCheckPromise: Promise<{ isAdmin: boolean; role: AdminRole }> | null = null;
let pendingCheckUserId: string | null = null;

export function useAdminAuth(): AdminAuthState & AdminAuthActions {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    role: 'none',
    error: null,
  });

  const { toast } = useToast();
  const mountedRef = useRef(true);

  /**
   * Verifica el estado de admin desde DB
   * - Usa cache para evitar consultas innecesarias
   * - Fail fast: 3s timeout máximo
   * - Shared promise para evitar race conditions
   */
  const checkAdminStatus = useCallback(async (userId: string): Promise<{ isAdmin: boolean; role: AdminRole }> => {
    // Revisar cache primero (incluso antes de checks concurrentes)
    const cached = adminCache.get(userId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return { isAdmin: cached.isAdmin, role: cached.role };
    }

    // Si hay un check en progreso para este usuario, esperar a que termine
    if (pendingCheckPromise && pendingCheckUserId === userId) {
      try {
        return await pendingCheckPromise;
      } catch {
        // Si falla el check pendiente, intentar de nuevo
      }
    }

    // Crear nueva promise compartida para este check
    pendingCheckUserId = userId;
    pendingCheckPromise = (async () => {
      try {
        // Consultar DB con timeout simple
        const checkPromise = supabase.rpc('get_user_role', { check_user_id: userId });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Admin check timeout')), 3000);
        });

        const { data, error } = await Promise.race([checkPromise, timeoutPromise]);

        if (error) {
          logger.error('Admin check failed', error, {
            context: 'auth',
            component: 'useAdminAuth',
            userId
          });
          // Si falla pero hay cache expirado, usarlo como fallback
          if (cached) {
            return { isAdmin: cached.isAdmin, role: cached.role };
          }
          return { isAdmin: false, role: 'none' };
        }

        const role = (data || 'none') as AdminRole;
        const isAdmin = role !== 'none';

        // Actualizar cache
        adminCache.set(userId, { isAdmin, role, timestamp: Date.now() });

        return { isAdmin, role };
      } catch (error) {
        logger.error('Exception in admin check', error as Error, {
          context: 'auth',
          component: 'useAdminAuth',
          userId
        });
        // Si falla pero hay cache expirado, usarlo como fallback
        if (cached) {
          return { isAdmin: cached.isAdmin, role: cached.role };
        }
        return { isAdmin: false, role: 'none' };
      } finally {
        // Limpiar promise compartida
        if (pendingCheckUserId === userId) {
          pendingCheckPromise = null;
          pendingCheckUserId = null;
        }
      }
    })();

    return pendingCheckPromise;
  }, []);

  /**
   * Maneja cambios en el estado de autenticación
   */
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    if (!mountedRef.current) return;

    try {
      const user = session?.user || null;

      if (user) {
        // Usuario autenticado - verificar admin
        const { isAdmin, role } = await checkAdminStatus(user.id);
        
        setState({
          user,
          session,
          isLoading: false,
          isAdmin,
          role,
          error: null,
        });

        logger.info('Auth state updated: isAdmin=' + isAdmin + ', role=' + role, undefined, {
          context: 'auth',
          component: 'useAdminAuth',
          userId: user.id
        });
      } else {
        // Usuario no autenticado
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
          role: 'none',
          error: null,
        });
      }
    } catch (error) {
      logger.error('Error in auth change handler', error as Error, {
        context: 'auth',
        component: 'useAdminAuth'
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al verificar autenticación',
      }));
    }
  }, [checkAdminStatus]);

  /**
   * Inicializar autenticación
   */
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      try {
        // Configurar listener de cambios de auth
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
        subscription = authSubscription;

        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting initial session', error, {
            context: 'auth',
            component: 'useAdminAuth'
          });
          setState(prev => ({ ...prev, isLoading: false, error: 'Error al cargar sesión' }));
          return;
        }

        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        logger.error('Error initializing auth', error as Error, {
          context: 'auth',
          component: 'useAdminAuth'
        });
        setState(prev => ({ ...prev, isLoading: false, error: 'Error al inicializar' }));
      }
    };

    initialize();

    // Cleanup
    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [handleAuthChange]);

  /**
   * Suscripción Realtime para invalidar cache cuando cambia admin_users
   * Esto asegura que si se revoca acceso, el usuario pierde permisos inmediatamente
   * === SINGLETON: Solo una suscripción global para evitar duplicados ===
   */
  useEffect(() => {
    if (!state.user?.id) {
      // Limpiar canal global si no hay usuario
      if (globalRealtimeChannel) {
        supabase.removeChannel(globalRealtimeChannel);
        globalRealtimeChannel = null;
        globalRealtimeUserId = null;
      }
      return;
    }

    const userId = state.user.id;

    // Si ya hay una suscripción activa para este usuario, no crear otra
    if (globalRealtimeUserId === userId && globalRealtimeChannel) {
      return;
    }

    // Limpiar suscripción anterior si existe (cambio de usuario)
    if (globalRealtimeChannel) {
      supabase.removeChannel(globalRealtimeChannel);
    }

    // Crear canal para escuchar cambios en admin_users del usuario actual
    globalRealtimeUserId = userId;
    globalRealtimeChannel = supabase
      .channel(`admin_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'admin_users',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          logger.info('Admin status changed via realtime', undefined, {
            context: 'auth',
            component: 'useAdminAuth',
            userId
          });

          // Invalidar cache inmediatamente
          adminCache.delete(userId);

          // Re-verificar estado de admin
          const { isAdmin, role } = await checkAdminStatus(userId);
          
          if (mountedRef.current) {
            setState(prev => {
              // Si perdió acceso admin, notificar
              if (!isAdmin && prev.isAdmin) {
                toast({
                  title: "Acceso actualizado",
                  description: "Tus permisos de administrador han sido modificados.",
                  variant: "default",
                });
              }
              
              return {
                ...prev,
                isAdmin,
                role,
              };
            });
          }
        }
      )
      .subscribe();

    // Nota: NO limpiamos en el cleanup porque es global
    // Se limpia solo cuando cambia el usuario o se hace logout
  }, [state.user?.id, checkAdminStatus, toast]);

  /**
   * Iniciar sesión
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
      logger.error('Sign in failed: ' + email, error, {
        context: 'auth',
        component: 'useAdminAuth'
      });

        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });

        return { error };
      }

      // El handleAuthChange se encargará de actualizar el estado
      logger.info('Sign in successful: ' + email, undefined, {
        context: 'auth',
        component: 'useAdminAuth'
      });

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });

      return { error: null };
    } catch (error) {
      const err = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: 'Error de conexión' }));
      logger.error('Exception in sign in', error as Error, {
        context: 'auth',
        component: 'useAdminAuth'
      });
      return { error: err };
    }
  }, [toast]);

  /**
   * Cerrar sesión
   */
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await supabase.auth.signOut();

      // Limpiar cache
      if (state.user?.id) {
        adminCache.delete(state.user.id);
      }

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
        role: 'none',
        error: null,
      });

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });

      logger.info('Sign out successful', undefined, {
        context: 'auth',
        component: 'useAdminAuth'
      });
    } catch (error) {
      logger.error('Error signing out', error as Error, {
        context: 'auth',
        component: 'useAdminAuth'
      });

      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión.",
        variant: "destructive",
      });
    }
  }, [state.user, toast]);

  /**
   * Refrescar estado de autenticación
   */
  const refreshAuth = useCallback(async () => {
    if (!state.user) return;

    try {
      // Limpiar cache para forzar nueva consulta
      adminCache.delete(state.user.id);

      const { isAdmin, role } = await checkAdminStatus(state.user.id);
      
      setState(prev => ({
        ...prev,
        isAdmin,
        role,
      }));

      logger.info('Auth refreshed: isAdmin=' + isAdmin + ', role=' + role, undefined, {
        context: 'auth',
        component: 'useAdminAuth',
        userId: state.user.id
      });
    } catch (error) {
      logger.error('Error refreshing auth', error as Error, {
        context: 'auth',
        component: 'useAdminAuth'
      });
    }
  }, [state.user, checkAdminStatus]);

  return {
    ...state,
    signIn,
    signOut,
    refreshAuth,
  };
}
