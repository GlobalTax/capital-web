import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, AlertCircle, Monitor } from 'lucide-react';

interface IframeSandboxGuardProps {
  children: React.ReactNode;
}

const IframeSandboxGuard: React.FC<IframeSandboxGuardProps> = ({ children }) => {
  // Detectar si estamos en un entorno sandbox
  const isSandbox = window.top !== window.self || location.hostname.includes('sandbox.lovable.dev');

  const handleOpenInNewWindow = () => {
    window.open(location.href, '_blank', 'noopener,noreferrer');
  };

  // Si no estamos en sandbox, renderizar children normalmente
  if (!isSandbox) {
    return <>{children}</>;
  }

  // Si estamos en sandbox, mostrar pantalla de advertencia
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Monitor className="h-6 w-6 text-primary" />
            Entorno de Vista Previa
          </CardTitle>
          <p className="text-muted-foreground">
            Panel de Administración - Capittal
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El entorno de vista previa bloquea almacenamiento local y conexiones WebSocket/HMR necesarias para el panel administrativo.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para acceder al panel completo, ábrelo en una nueva ventana donde funcionará sin limitaciones.
            </p>
            
            <Button 
              onClick={handleOpenInNewWindow}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en Nueva Ventana
            </Button>
          </div>

          <Alert>
            <Monitor className="h-4 w-4" />
            <AlertDescription className="text-xs">
              En la nueva ventana tendrás acceso completo a todas las funcionalidades del panel administrativo sin restricciones del iframe.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default IframeSandboxGuard;