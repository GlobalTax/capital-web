import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Admin Login - Página de autenticación simplificada
 * 
 * Características:
 * - Sin modo debug integrado
 * - Sin recovery automático
 * - Redirect simple y claro
 * - Estados de carga claros
 */

const AdminLoginNew = () => {
  const { user, isLoading, isAdmin, signIn, signOut } = useAdminAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect si ya está autenticado y es admin
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || 'Error al iniciar sesión');
      }
      // Si no hay error, el redirect automático se encarga
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Estado de carga inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado pero sin permisos admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-red-600">
              <AlertCircle className="h-6 w-6" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Tu cuenta no tiene permisos de administrador.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Ir al Inicio
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Limpiar sesión y recargar
                  signOut();
                }}
                className="w-full"
              >
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulario de login
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Panel de Administración
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Inicia sesión para acceder
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@capittal.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                autoComplete="email"
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
                disabled={submitting}
                autoComplete="current-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500"
            >
              Volver al inicio
            </Button>
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Solo usuarios autorizados pueden acceder al panel de administración.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginNew;
