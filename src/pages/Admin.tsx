
import React from 'react';
import AdminRouter from '@/components/admin/AdminRouter';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminWrapper } from '@/components/admin/AdminWrapper';

/**
 * Admin Page - Simplificado sin lógica auth duplicada
 */
const Admin = () => {
  return (
    <AdminWrapper>
      <AdminLayout onLogout={() => window.location.reload()}>
        <AdminRouter />
      </AdminLayout>
    </AdminWrapper>
  );
};

export default Admin;
