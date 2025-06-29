
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminRouter from '@/components/admin/AdminRouter';
import AdminLayout from '@/components/admin/AdminLayout';

const Admin = () => {
  const { user, isLoading } = useAuth();

  const handleAuthSuccess = () => {
    console.log('Auth success - context will handle state updates');
  };

  const handleLogout = () => {
    console.log('Logout handled by context');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminRouter />
    </AdminLayout>
  );
};

export default Admin;
