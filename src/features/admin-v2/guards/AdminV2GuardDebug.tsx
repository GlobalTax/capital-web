import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminV2GuardDebugProps {
  children: React.ReactNode;
}

// Detectar si estamos en sandbox/desarrollo
const isSandboxEnvironment = (): boolean => {
  return window.location.hostname.includes('lovableproject.com') ||
         window.location.hostname.includes('localhost') ||
         window.location.hostname.includes('127.0.0.1');
};

export const AdminV2GuardDebug: React.FC<AdminV2GuardDebugProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isSandbox] = useState(isSandboxEnvironment());
  const SANDBOX_BYPASS_TIMEOUT_MS = 3000;
  const timeoutRef = useRef<number | null>(null);

  // Debug: log state transitions
  useEffect(() => {
    console.debug('[AdminV2GuardDebug] State', {
      isSandbox,
      authLoading,
      isChecking,
      hasAccess,
      isAdmin,
      user: { id: user?.id, email: user?.email }
    });
  }, [isSandbox, authLoading, isChecking, hasAccess, isAdmin, user]);

  // Background: direct admin_users verification (for logs only in sandbox)
  const verifyAdminDirect = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_active, role, user_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('[AdminV2GuardDebug] Direct admin_users check failed:', error.message);
        return;
      }
      console.log(
        `[AdminV2GuardDebug] admin_users check → is_active=${data?.is_active} role=${data?.role} matches_user=${data?.user_id === user.id}`
      );
    } catch (e) {
      console.error('[AdminV2GuardDebug] Direct admin_users check error:', e);
    }
  };

  // Sandbox safety timer: if authLoading stalls, bypass after timeout
  useEffect(() => {
    if (!isSandbox) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (authLoading && !hasAccess) {
      console.warn(
        `[AdminV2GuardDebug] Sandbox auth loading — setting ${SANDBOX_BYPASS_TIMEOUT_MS}ms bypass timer`
      );
      timeoutRef.current = window.setTimeout(() => {
        console.warn('[AdminV2GuardDebug] Sandbox bypass timer fired');
        if (!hasAccess && user) {
          setHasAccess(true);
          setIsChecking(false);
        }
      }, SANDBOX_BYPASS_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSandbox, authLoading, hasAccess, user]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      // 🏖️ Sandbox: immediate access for any authenticated user
      if (isSandbox) {
        console.log('🏖️ [AdminV2GuardDebug] Sandbox mode - Immediate access for authenticated users');
        console.log(`📧 [AdminV2GuardDebug] User: ${user.email}`);
        setHasAccess(true);
        setIsChecking(false);
        // Fire-and-forget verification to help debugging
        setTimeout(() => verifyAdminDirect(), 0);
        return;
      }

      // 🔒 Production: Full verification with RPC + context
      try {
        const { data, error } = await supabase.rpc('is_admin_user', {
          _user_id: user.id
        });

        if (error) {
          console.error('[AdminV2GuardDebug] RPC error:', error);

          // Fallback to AuthContext in case of transient errors
          if (isAdmin) {
            console.warn('⚠️ [AdminV2GuardDebug] RPC failed, using AuthContext fallback');
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }

          // Log security event
          try {
            await supabase.rpc('log_security_event', {
              _event_type: 'ADMIN_V2_ACCESS_CHECK_FAILED',
              _severity: 'high',
              _details: {
                user_id: user.id,
                user_email: user.email,
                reason: 'RPC verification failed',
                error: error.message,
                fallback_used: isAdmin
              }
            });
          } catch (logError) {
            console.error('[AdminV2GuardDebug] Error logging security event:', logError);
          }
        } else {
          setHasAccess(data === true && isAdmin === true);

          // Log access attempt
          try {
            await supabase.rpc('log_security_event', {
              _event_type: data === true ? 'ADMIN_V2_ACCESS_GRANTED' : 'ADMIN_V2_ACCESS_DENIED',
              _severity: data === true ? 'low' : 'medium',
              _details: {
                user_id: user.id,
                user_email: user.email,
                has_db_access: data,
                has_context_admin: isAdmin
              }
            });
          } catch (logError) {
            console.error('[AdminV2GuardDebug] Error logging access attempt:', logError);
          }
        }
      } catch (err) {
        console.error('[AdminV2GuardDebug] Unexpected error:', err);
        // Fallback to AuthContext
        setHasAccess(isAdmin);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, isAdmin, isSandbox]);

  // Mostrar loading mientras verifica
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="text-white text-lg">
          {isSandbox ? '🏖️ Verificando acceso (sandbox mode)...' : '🔒 Verificando acceso...'}
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirigir al admin normal si no tiene acceso a v2
  if (!hasAccess) {
    console.warn('[AdminV2GuardDebug] Acceso denegado a admin v2, redirigiendo a /admin');
    return <Navigate to="/admin" replace />;
  }

  // ✅ Renderizar children si tiene acceso
  return (
    <>
      {isSandbox && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-yellow-200 text-sm text-center backdrop-blur-sm">
          🏖️ Sandbox Mode - Using simplified admin verification for development
        </div>
      )}
      <div className={isSandbox ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
};
