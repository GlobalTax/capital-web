import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface CalculatorAuthGuardProps {
  children: React.ReactNode;
}

export const CalculatorAuthGuard: React.FC<CalculatorAuthGuardProps> = ({ children }) => {
  const { user, isApproved, isLoading, registrationRequest } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Redirect to main domain for login
    window.location.href = `https://capittal.es/auth?redirect=${encodeURIComponent(window.location.href)}`;
    return null;
  }

  // Show pending approval message if not approved
  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {registrationRequest?.status === 'pending' && (
                <Clock className="h-12 w-12 text-yellow-500" />
              )}
              {registrationRequest?.status === 'rejected' && (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <CardTitle>
              {registrationRequest?.status === 'pending' && "Solicitud Pendiente"}
              {registrationRequest?.status === 'rejected' && "Solicitud Rechazada"}
            </CardTitle>
            <CardDescription>
              {registrationRequest?.status === 'pending' && 
                "Tu solicitud está siendo revisada por nuestro equipo."
              }
              {registrationRequest?.status === 'rejected' && 
                "Tu solicitud de acceso ha sido rechazada."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {registrationRequest?.status === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Te notificaremos por email cuando sea aprobada. Mientras tanto, 
                puedes usar nuestra calculadora básica.
              </p>
            )}
            {registrationRequest?.status === 'rejected' && registrationRequest.rejection_reason && (
              <p className="text-sm text-red-600">
                Motivo: {registrationRequest.rejection_reason}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.href = 'https://capittal.es/lp/calculadora'}
              >
                Calculadora Básica
              </Button>
              <Button
                onClick={() => window.location.href = 'https://capittal.es/contacto'}
              >
                Contactar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};