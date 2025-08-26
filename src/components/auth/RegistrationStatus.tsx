import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, XCircle, Mail, User, Calendar } from 'lucide-react';
import { useAuth } from '@/shared/hooks';
import { useAdminAuth } from '@/features/admin/providers/AdminAuthProvider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const RegistrationStatus: React.FC = () => {
  const { user, signOut } = useAuth();
  const { registrationRequest } = useAdminAuth();

  if (!user || !registrationRequest) {
    return null;
  }

  const getStatusIcon = () => {
    switch (registrationRequest.status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (registrationRequest.status) {
      case 'pending':
        return 'Solicitud Pendiente de Aprobación';
      case 'approved':
        return 'Solicitud Aprobada';
      case 'rejected':
        return 'Solicitud Rechazada';
      default:
        return 'Estado de Solicitud';
    }
  };

  const getStatusDescription = () => {
    switch (registrationRequest.status) {
      case 'pending':
        return 'Tu solicitud de registro está siendo revisada por nuestro equipo. Te notificaremos por email cuando sea aprobada.';
      case 'approved':
        return 'Tu solicitud ha sido aprobada. Ya puedes acceder a todas las funcionalidades del sistema.';
      case 'rejected':
        return 'Tu solicitud ha sido rechazada. Si crees que esto es un error, ponte en contacto con nosotros.';
      default:
        return 'Estado desconocido de la solicitud.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
            <CardDescription>
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Solicitado el {format(new Date(registrationRequest.requested_at), 'PPP', { locale: es })}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Te notificaremos por email cualquier cambio</span>
              </div>
            </div>

            {registrationRequest.status === 'rejected' && registrationRequest.rejection_reason && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm">
                  <strong>Motivo del rechazo:</strong> {registrationRequest.rejection_reason}
                </AlertDescription>
              </Alert>
            )}

            {registrationRequest.status === 'pending' && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-sm">
                  Este proceso puede tomar hasta 24 horas. Recibirás una notificación por email.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 space-y-2">
              <Button 
                onClick={signOut} 
                variant="outline" 
                className="w-full"
              >
                Cerrar Sesión
              </Button>
              
              <div className="text-center">
                <a 
                  href="mailto:contacto@capittal.com" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ¿Necesitas ayuda? Contáctanos
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};