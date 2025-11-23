import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Exportación completada",
        description: "Los datos se han exportado correctamente a CSV",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los datos",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendRecoveryEmails = () => {
    toast({
      title: "Emails en cola",
      description: "Se enviarán emails de recuperación a 12 sesiones abandonadas",
    });
  };

  const handleCleanupOldSessions = () => {
    toast({
      title: "Limpieza programada",
      description: "Se eliminarán sesiones antiguas en segundo plano",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Gestión y mantenimiento del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleExportCSV} 
          disabled={isExporting}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar a CSV'}
        </Button>

        <Button 
          onClick={handleSendRecoveryEmails}
          className="w-full justify-start"
          variant="outline"
        >
          <Mail className="h-4 w-4 mr-2" />
          Enviar Emails de Recuperación
        </Button>

        <Button 
          onClick={handleCleanupOldSessions}
          className="w-full justify-start"
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar Sesiones Antiguas
        </Button>

        <Button 
          onClick={() => window.location.reload()}
          className="w-full justify-start"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refrescar Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};
