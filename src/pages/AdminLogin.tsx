import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import IframeSandboxGuard from '@/components/admin/IframeSandboxGuard';

const AdminLogin = () => {
  const { user, isLoading, signIn, signUp, isAdmin, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  // Si ya está autenticado y es admin, redirigir al panel
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Función de recuperación de sesión para admins existentes
  const handleSessionRecovery = async () => {
    setAuthLoading(true);
    setError('');
    
    try {
      logger.info('Attempting session recovery for admin access', undefined, { context: 'admin', component: 'AdminLogin' });
      
      // Intentar refrescar la sesión actual
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        logger.warn('Session refresh failed', { error: refreshError.message }, { context: 'admin', component: 'AdminLogin' });
        throw new Error(`Error de sesión: ${refreshError.message}`);
      }

      if (refreshData.session?.user) {
        // Verificar si el usuario tiene permisos de admin
        const adminStatus = await checkAdminStatus(refreshData.session.user.id);
        
        if (adminStatus) {
          logger.info('Admin access recovered successfully', undefined, { context: 'admin', component: 'AdminLogin' });
          navigate('/admin/dashboard', { replace: true });
          return;
        } else {
          throw new Error('Usuario sin permisos de administrador');
        }
      }
      
      throw new Error('No se pudo recuperar la sesión');
    } catch (err: any) {
      const errorMessage = err?.message || 'Error de recuperación de sesión';
      setError(errorMessage);
      logger.error('Session recovery failed', err, { context: 'admin', component: 'AdminLogin' });
    } finally {
      setAuthLoading(false);
      setRecoveryAttempted(true);
    }
  };

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
      } else if (mode === 'login') {
        // Después del login exitoso, verificar si es admin
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id);
          if (adminStatus) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            setError('Usuario sin permisos de administrador');
          }
        }
      }
    } catch (err: any) {
      setError('Error de conexión');
      logger.error('Authentication error in admin login', err, { context: 'admin', component: 'AdminLogin' });
    }
    
    setAuthLoading(false);
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado pero no es admin
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
                onClick={() => supabase.auth.signOut()}
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

  return (
    <IframeSandboxGuard>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Shield className="h-6 w-6" />
              Panel de Administración
            </CardTitle>
            <p className="text-gray-600">
              {mode === 'login' ? 'Inicia sesión para acceder' : 
               mode === 'register' ? 'Regístrate como administrador' :
               'Recuperar acceso de administrador'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Opción de recuperación para admins existentes */}
            {!recoveryAttempted && mode === 'login' && (
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  ¿Problemas para acceder después de un reinicio?
                  <Button 
                    variant="link" 
                    onClick={handleSessionRecovery}
                    disabled={authLoading}
                    className="p-0 h-auto text-sm underline ml-1"
                  >
                    Intentar recuperar acceso
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {mode !== 'recovery' && (
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
            )}

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
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-500"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Una vez autenticado, podrás acceder al panel de administración completo.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </IframeSandboxGuard>
  );
};

export default AdminLogin;