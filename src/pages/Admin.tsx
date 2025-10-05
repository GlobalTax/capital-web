
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRouter from '@/features/admin/components/AdminRouter';
import AdminLayout from '@/features/admin/components/AdminLayout';
import AdminSetup from '@/components/admin/AdminSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AdminLoadingState from '@/components/admin/states/AdminLoadingState';

const Admin = () => {
  const { user, isLoading, signIn, signUp, isAdmin, getDebugInfo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetailedLoading, setShowDetailedLoading] = useState(false);

  // ⚡ Loading progresivo: spinner simple inicial → mensaje detallado solo si tarda
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowDetailedLoading(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowDetailedLoading(false);
    }
  }, [isLoading]);

  // Loading state - Spinner simple inicial (primeros 1.5s)
  if (isLoading && !showDetailedLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Loading state - Mensaje completo solo si tarda más de 1.5s
  if (isLoading && showDetailedLoading) {
    return <AdminLoadingState debugInfo={JSON.stringify(getDebugInfo(), null, 2)} />;
  }

  // Authenticated and admin - show admin panel
  if (user && isAdmin) {
    return (
      <AdminLayout onLogout={() => window.location.reload()}>
        <AdminRouter />
      </AdminLayout>
    );
  }

  // Authenticated but not admin - show setup
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AdminSetup />
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setAuthLoading(false);
  };

  // Not authenticated - show login form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Admin Panel - Capittal
          </CardTitle>
          <p className="text-muted-foreground">Inicia sesión para acceder</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@capittal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Aplicación interna - Solo usuarios autorizados pueden acceder.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
