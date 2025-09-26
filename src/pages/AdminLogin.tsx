import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, RefreshCw, Bug, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

import { AdminDebugPanel } from '@/components/admin/AdminDebugPanel';

const AdminLogin = () => {
  const { user, isLoading, signIn, signUp, isAdmin, checkAdminStatus, forceAdminReload, getDebugInfo, clearAuthSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'debug'>('login');
  const [email, setEmail] = useState('s.navarro@obn.es'); // Pre-fill for debugging
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [showStuckHelp, setShowStuckHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Si ya está autenticado y es admin, redirigir al panel
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }

    // Show stuck help if loading takes too long
    const stuckTimer = setTimeout(() => {
      if (isLoading) {
        setShowStuckHelp(true);
      }
    }, 8000);

    return () => clearTimeout(stuckTimer);
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

  const handleClearSession = async () => {
    try {
      setError('');
      setAuthLoading(true);
      console.log('🧹 Clearing auth session from AdminLogin...');
      await clearAuthSession();
      setShowStuckHelp(false);
      
      // Reload page after clearing to start fresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('💥 Clear session failed:', err);
      setError('Error al limpiar sesión: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso de administrador...</p>
          
          {showStuckHelp && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm mb-3">
                ¿La verificación está tardando mucho?
              </p>
              <button
                onClick={handleClearSession}
                disabled={authLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
              >
                {authLoading ? 'Limpiando...' : 'Limpiar Sesión y Reiniciar'}
              </button>
            </div>
          )}
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Panel de Administración
          </CardTitle>
          <p className="text-gray-600">
            {mode === 'login' ? 'Inicia sesión para acceder' : 'Panel de Debug'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Mode */}
          {mode === 'debug' && (
            <div className="space-y-4">
              <AdminDebugPanel />
              
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40">
                  {JSON.stringify(getDebugInfo(), null, 2)}
                </pre>
              </div>
              
              <button
                onClick={() => setDebugInfo(getDebugInfo())}
                className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
              >
                Actualizar Debug Info
              </button>
              
              <button
                onClick={handleClearSession}
                disabled={authLoading}
                className="w-full px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 disabled:opacity-50"
              >
                {authLoading ? 'Limpiando...' : 'Limpiar Sesión Completa'}
              </button>
            </div>
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

          {/* Force Admin Reload Button */}
          {mode === 'login' && user && !isAdmin && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                ¿Usuario autenticado pero sin acceso admin?
                <Button 
                  variant="link" 
                  onClick={forceAdminReload}
                  disabled={authLoading}
                  className="p-0 h-auto text-sm underline ml-1"
                >
                  Forzar recarga admin
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {mode === 'login' && (
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
                {authLoading ? "Procesando..." : "Iniciar Sesión"}
              </Button>
            </form>
          )}

          <div className="text-center space-y-2">
            {mode === 'login' && (
              <Button
                variant="link"
                onClick={() => setMode('debug')}
                className="text-sm text-blue-600"
              >
                Panel de Debug
              </Button>
            )}
            
            {mode === 'debug' && (
              <Button
                variant="link"
                onClick={() => setMode('login')}
                className="text-sm"
              >
                Volver al login
              </Button>
            )}
            
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
              Solo usuarios autorizados con cuentas existentes pueden acceder al panel de administración.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;