import React from 'react';
import { useAdminAuth } from '@/features/admin/providers/AdminAuthProvider';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper simplificado para el admin - usa AdminAuthProvider
 */
export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAdminAuth();

  // Loading state
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

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};