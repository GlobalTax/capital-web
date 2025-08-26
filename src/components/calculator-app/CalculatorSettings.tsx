import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';

export const CalculatorSettings: React.FC = () => {
  const { user, isApproved, registrationRequest } = useAuth();

  const getStatusInfo = () => {
    if (isApproved) {
      return {
        status: 'Aprobado',
        color: 'bg-green-100 text-green-800',
        description: 'Tu cuenta está aprobada y tienes acceso completo a todas las funcionalidades.'
      };
    } else if (registrationRequest?.status === 'pending') {
      return {
        status: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Tu solicitud está siendo revisada por nuestro equipo.'
      };
    } else if (registrationRequest?.status === 'rejected') {
      return {
        status: 'Rechazada',
        color: 'bg-red-100 text-red-800',
        description: 'Tu solicitud ha sido rechazada. Contacta con soporte para más información.'
      };
    }
    return {
      status: 'Desconocido',
      color: 'bg-gray-100 text-gray-800',
      description: 'Estado de la cuenta no determinado.'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias de calculadoras
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información de la Cuenta
            </CardTitle>
            <CardDescription>
              Tu información personal y estado de la cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                <p className="text-lg">{user?.user_metadata?.full_name || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado de la Cuenta</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={statusInfo.color}>
                    {statusInfo.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusInfo.description}
                </p>
              </div>

              {registrationRequest?.requested_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Solicitud</label>
                  <p className="text-sm">
                    {new Date(registrationRequest.requested_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              {registrationRequest?.status === 'rejected' && registrationRequest.rejection_reason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Motivo del Rechazo</label>
                  <p className="text-sm text-red-600">
                    {registrationRequest.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Enlaces útiles y configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://capittal.es/perfil/valoraciones', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Perfil Completo
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://capittal.es/contacto', '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://capittal.es', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ir a Capittal.es
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Configuración de notificaciones y preferencias de uso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Las opciones de configuración estarán disponibles próximamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Gestión de sesión y seguridad de la cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>Último acceso: {new Date().toLocaleDateString('es-ES')}</p>
              <p>Sesión actual: Activa</p>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitas ayuda con tu cuenta?
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://capittal.es/contacto', '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};