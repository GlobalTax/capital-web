
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAdminPermissionsReturn {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  isLoading: boolean;
  checkPermission: (action: 'read' | 'write' | 'delete') => boolean;
}

export const useAdminPermissions = (): UseAdminPermissionsReturn => {
  const { isAdmin, isLoading: authLoading } = useAuth();

  const checkPermission = (action: 'read' | 'write' | 'delete'): boolean => {
    // Para el carrusel, los permisos son:
    // - read: público (cualquiera puede leer logos activos)
    // - write/delete: solo administradores
    
    if (action === 'read') {
      return true; // Lectura pública para contenido activo
    }
    
    return isAdmin; // Escritura/eliminación solo para admins
  };

  return {
    canRead: checkPermission('read'),
    canWrite: isAdmin,
    canDelete: isAdmin,
    isLoading: authLoading,
    checkPermission
  };
};
