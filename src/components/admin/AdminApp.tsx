import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AdminConnectionStatus } from './AdminConnectionStatus';
import { AdminOfflineMode } from './AdminOfflineMode';

export const AdminApp: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline' | 'degraded'>('checking');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        setConnectionStatus(response.ok ? 'online' : 'degraded');
      } catch {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 animate-spin" />
          <span>Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Acceso Requerido</span>
            </CardTitle>
            <CardDescription>
              Debes iniciar sesión para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <span>Acceso Denegado</span>
            </CardTitle>
            <CardDescription>
              No tienes permisos de administrador para acceder a esta sección.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show offline mode when connection is poor
  if (!isOnline || connectionStatus === 'offline') {
    return <AdminOfflineMode />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenido, {user.email}
                </p>
              </div>
            </div>
            <AdminConnectionStatus />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Sistema Operativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                El panel de administración está funcionando correctamente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Leads</CardTitle>
              <CardDescription>
                Administrar leads y conversiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Leads
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis</CardTitle>
              <CardDescription>
                Estadísticas y métricas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Análisis
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminApp;