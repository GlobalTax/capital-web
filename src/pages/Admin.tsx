
import React from 'react';
import AdminRouter from '@/features/admin/components/AdminRouter';
import AdminLayout from '@/features/admin/components/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

/**
 * Admin page - Simplificado
 * La verificación de autenticación ya se hace en AdminProtectedRoute
 */
const Admin = () => {
  const { signOut } = useAdminAuth();

  return (
    <AdminLayout onLogout={signOut}>
      <AdminRouter />
    </AdminLayout>
  );
};

export default Admin;
