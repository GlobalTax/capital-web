import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AdminWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper mejorado para el admin con manejo robusto de errores y recuperación
 */
export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [authError, setAuthError] = React.useState<string | null>(null);
  let authContext;
  
  // Intentar usar el hook de autenticación de forma segura
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('AuthContext not available:', error);
    
    // Redirigir después de un momento si no se puede recuperar
    useEffect(() => {
      const timer = setTimeout(() => {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          window.location.reload();
        } else {
          window.location.href = '/';
        }
      }, 2000);
      return () => clearTimeout(timer);
    }, [retryCount]);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error de contexto de autenticación. Reintentando... ({retryCount + 1}/3)
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { user, session, isLoading, isAdmin, checkAdminStatus } = authContext;

  // Función de recuperación de sesión
  const handleSessionRecovery = React.useCallback(async () => {
    try {
      // Intentar refrescar la sesión
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setAuthError(`Error de sesión: ${error.message}`);
        return false;
      }
      
      if (data.session?.user) {
        // Verificar estado de admin después del refresh
        const adminStatus = await checkAdminStatus(data.session.user.id);
        if (adminStatus) {
          setAuthError(null);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      setAuthError(`Error de recuperación: ${error.message}`);
      return false;
    }
  }, [checkAdminStatus]);

  // Loading state mejorado
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">Reintento {retryCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  // Si hay error de autenticación, mostrar opciones de recuperación
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {authError}
            <div className="mt-2 space-x-2">
              <button 
                onClick={handleSessionRecovery}
                className="text-xs underline"
              >
                Intentar recuperar sesión
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs underline"
              >
                Ir al inicio
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si no es admin pero hay sesión, mostrar información de debug
  if (!isAdmin && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Usuario autenticado pero sin permisos de admin.
            <div className="mt-2 text-xs text-gray-600">
              Usuario: {user.email}<br/>
              ID: {user.id}
            </div>
            <div className="mt-2 space-x-2">
              <button 
                onClick={() => checkAdminStatus(user.id)}
                className="text-xs underline"
              >
                Verificar permisos
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs underline"
              >
                Ir al inicio
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};