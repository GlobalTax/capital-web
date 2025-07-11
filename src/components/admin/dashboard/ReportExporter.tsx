import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  type: 'leads' | 'marketing' | 'content' | 'analytics';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    from: Date;
    to: Date;
  };
  includeSections: string[];
}

export function ReportExporter() {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'leads',
    format: 'pdf',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    includeSections: []
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'leads', label: 'Reporte de Leads', icon: FileText },
    { value: 'marketing', label: 'Marketing Performance', icon: FileSpreadsheet },
    { value: 'content', label: 'Análisis de Contenido', icon: FileText },
    { value: 'analytics', label: 'Analytics Completo', icon: FileSpreadsheet }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulación de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Reporte generado",
        description: `Tu reporte ${config.type} en formato ${config.format.toUpperCase()} está listo para descargar.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Reportes
        </CardTitle>
        <CardDescription>
          Genera reportes personalizados con los datos más recientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Tipo de Reporte</Label>
            <Select 
              value={config.type} 
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Formato</Label>
            <Select 
              value={config.format} 
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rango de Fechas</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={config.dateRange.from.toISOString().split('T')[0]}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: new Date(e.target.value) }
              }))}
            />
            <span className="text-muted-foreground">hasta</span>
            <Input 
              type="date" 
              value={config.dateRange.to.toISOString().split('T')[0]}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, to: new Date(e.target.value) }
              }))}
            />
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              Generando reporte...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generar y Descargar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}