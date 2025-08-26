import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  HardDrive,
  FileText,
  BarChart
} from 'lucide-react';

export const AdminOfflineMode: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    // Try to reconnect
    if (navigator.onLine) {
      handleRefresh();
    } else {
      alert('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WifiOff className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">Modo Sin Conexión</h1>
                <p className="text-sm text-muted-foreground">
                  Funcionalidad limitada disponible
                </p>
              </div>
            </div>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La conexión al servidor está degradada o no está disponible. 
            Algunas funcionalidades pueden estar limitadas.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Base de Datos</span>
              </CardTitle>
              <CardDescription>Sin conexión</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                No se puede acceder a la base de datos en este momento.
              </p>
              <Button variant="outline" disabled className="w-full">
                No Disponible
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Gestión de Contenido</span>
              </CardTitle>
              <CardDescription>Servicio limitado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Solo funciones de lectura disponibles.
              </p>
              <Button variant="outline" disabled className="w-full">
                Acceso Limitado
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>Análisis</span>
              </CardTitle>
              <CardDescription>Datos en caché</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Mostrando información almacenada localmente.
              </p>
              <Button variant="outline" disabled className="w-full">
                Solo Caché
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Recuperación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={handleRefresh} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recargar Página
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                >
                  Ir al Inicio
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Si el problema persiste:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Verifica tu conexión a internet</li>
                  <li>Limpia la caché del navegador</li>
                  <li>Intenta acceder desde una pestaña de incógnito</li>
                  <li>Contacta al equipo técnico si es necesario</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};