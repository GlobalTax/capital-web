import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';
import AdminRouter from './AdminRouter';
import AuthPage from '@/pages/Auth';
import { AdminConnectionStatus } from './AdminConnectionStatus';

const AdminApp = () => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          {/* Connection Status Diagnostic */}
          <AdminConnectionStatus />
          
          {/* Access Restricted Card */}
          <div className="p-8 bg-card rounded-lg border shadow-lg">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V7m0 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Acceso Restringido
            </h2>
            <p className="text-muted-foreground mb-8">
              Necesitas permisos de administrador para acceder al panel administrativo.
              Si los servicios están degradados, intenta más tarde.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Reintentar
              </button>
              <a 
                href="https://capittal.es"
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Volver a Capittal.es
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    // Redirigir a capittal.es después del logout
    window.location.href = 'https://capittal.es';
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminRouter />
    </AdminLayout>
  );
};

export default AdminApp;