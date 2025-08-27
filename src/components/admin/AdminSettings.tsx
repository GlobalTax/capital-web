
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, User, Shield, LogOut } from 'lucide-react';

const AdminSettings = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu cuenta y configuraciones del sistema
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID de Usuario</label>
              <p className="text-gray-500 text-sm font-mono">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Última conexión</label>
              <p className="text-gray-900">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-600">✅ Permisos de Administrador Activos</p>
              <p className="text-sm text-gray-600">
                Tienes acceso completo al panel de administración
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acciones del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
