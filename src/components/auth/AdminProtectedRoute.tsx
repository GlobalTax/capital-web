import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route para rutas de administrador
 * 
 * Características:
 * - Verificación simple y rápida
 * - Estados de carga claros
 * - Sin race conditions
 */

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAdminAuth();

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/admin/login-new" replace />;
  }

  // Redirigir si no es admin
  if (!isAdmin) {
    return <Navigate to="/admin/login-new" replace />;
  }

  // Usuario válido y con permisos - renderizar children
  return <>{children}</>;
};

export default AdminProtectedRoute;
