
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRouter from '@/components/admin/AdminRouter';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminSetup from '@/components/admin/AdminSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, isLoading, signIn, signUp, isAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso administrativo...</p>
        </div>
      </div>
    );
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
      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password, 'Admin User');

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
          <p className="text-muted-foreground">
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
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                mode === 'login' ? "Iniciar Sesión" : "Registrarse"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Button
              variant="link"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm"
            >
              {mode === 'login' ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
            <div>
              <Button
                variant="link"
                onClick={() => window.location.href = '/admin/recovery'}
                className="text-sm text-destructive"
              >
                ¿Problemas de acceso? Recuperar cuenta de admin
              </Button>
            </div>
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
