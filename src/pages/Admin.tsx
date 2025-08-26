
import React from 'react';
import { AdminAuthProvider } from '@/features/admin/providers/AdminAuthProvider';
import AdminRouter from '@/components/admin/AdminRouter';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminWrapper } from '@/components/admin/AdminWrapper';

/**
 * Admin Page - Simplified with separated auth providers
 */
const Admin = () => {
  return (
    <AdminAuthProvider>
      <AdminWrapper>
        <AdminLayout onLogout={() => window.location.reload()}>
          <AdminRouter />
        </AdminLayout>
      </AdminWrapper>
    </AdminAuthProvider>
  );
};

export default Admin;
