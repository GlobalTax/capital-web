import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DashboardExportMenu = () => {
  const { toast } = useToast();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv', type: string) => {
    toast({
      title: "Generando reporte...",
      description: `Preparando ${type} en formato ${format.toUpperCase()}`,
    });

    // Simular exportación - aquí iría la lógica real
    setTimeout(() => {
      toast({
        title: "Reporte generado",
        description: `${type} exportado exitosamente`,
      });
    }, 2000);
  };

  const scheduleReport = () => {
    toast({
      title: "Próximamente",
      description: "La programación de reportes estará disponible pronto",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport('pdf', 'Dashboard completo')}>
          <FileText className="h-4 w-4 mr-2" />
          Dashboard PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel', 'Métricas de marketing')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Métricas Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv', 'Datos de leads')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Leads CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={scheduleReport}>
          <Calendar className="h-4 w-4 mr-2" />
          Programar reporte
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Configuración de reportes", description: "Próximamente disponible" })}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar plantillas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardExportMenu;