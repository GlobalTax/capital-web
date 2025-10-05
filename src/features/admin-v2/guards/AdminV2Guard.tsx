import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminV2GuardProps {
  children: React.ReactNode;
}

export const AdminV2Guard: React.FC<AdminV2GuardProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verificar acceso de admin usando función de base de datos
        const { data, error } = await supabase.rpc('is_admin_user', {
          _user_id: user.id
        });

        if (error) {
          console.error('[AdminV2Guard] Error verificando acceso admin:', error);
          
          // Log security event
          try {
            await supabase.rpc('log_security_event', {
              _event_type: 'ADMIN_V2_ACCESS_DENIED',
              _severity: 'high',
              _details: {
                user_id: user.id,
                user_email: user.email,
                reason: 'Database verification failed',
                error: error.message
              }
            });
          } catch (logError) {
            console.error('[AdminV2Guard] Error logging security event:', logError);
          }
          
          setHasAccess(false);
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
            console.error('[AdminV2Guard] Error logging access attempt:', logError);
          }
        }
      } catch (err) {
        console.error('[AdminV2Guard] Error inesperado:', err);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, isAdmin]);

  // Mostrar loading mientras verifica
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="text-white text-lg">Verificando acceso...</div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir al admin normal si no tiene acceso a v2
  if (!hasAccess) {
    console.warn('[AdminV2Guard] Acceso denegado a admin v2, redirigiendo a /admin');
    return <Navigate to="/admin" replace />;
  }

  // Renderizar children si tiene acceso
  return <>{children}</>;
};
