import React from 'react';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminUsersPermissionsGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminUsersPermissionsGuard: React.FC<AdminUsersPermissionsGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { hasPermission, userRole, isLoading } = useRoleBasedPermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission('canManageUsers')) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para gestionar usuarios.</p>
          <div className="mt-4">
            <Badge variant="outline" className="mb-4">{userRole}</Badge>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Solo los usuarios con rol <strong>Super Admin</strong> pueden gestionar otros usuarios del sistema.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminUsersPermissionsGuard;