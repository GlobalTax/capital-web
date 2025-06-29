
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminAuth from '@/components/admin/AdminAuth';
import MinimalAdminDashboard from '@/components/admin/minimal/MinimalAdminDashboard';

const Admin = () => {
  const { user, isLoading } = useAuth();

  const handleAuthSuccess = () => {
    // El contexto maneja automáticamente los cambios de estado
    console.log('Auth success - context will handle state updates');
  };

  const handleLogout = () => {
    // El contexto maneja automáticamente el logout
    console.log('Logout handled by context');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return <MinimalAdminDashboard onLogout={handleLogout} />;
};

export default Admin;
