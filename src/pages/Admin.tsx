
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRouter from '@/components/admin/AdminRouter';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminSetup from '@/components/admin/AdminSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';

const Admin = () => {
  const { user, isLoading, signIn, signUp, isAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  // Si ya está autenticado y es admin, mostrar el panel
  if (!isLoading && user && isAdmin) {
    return (
      <AdminLayout onLogout={() => window.location.reload()}>
        <AdminRouter />
      </AdminLayout>
    );
  }

  // Si está autenticado pero no es admin, mostrar setup
  if (!isLoading && user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setAuthLoading(false);
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // Pantalla de autenticación
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Admin Panel - Capittal
          </CardTitle>
          <p className="text-gray-600">
            {mode === 'login' ? 'Inicia sesión para acceder' : 'Regístrate como administrador'}
          </p>
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
              {authLoading ? "Procesando..." : mode === 'login' ? "Iniciar Sesión" : "Registrarse"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm"
            >
              {mode === 'login' ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Una vez autenticado, podrás configurar permisos de administrador automáticamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
