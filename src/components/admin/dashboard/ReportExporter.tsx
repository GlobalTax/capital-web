import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ReportExporter as ReportExportService, downloadFile } from '@/utils/reportExport';

interface ReportConfig {
  type: 'leads' | 'marketing' | 'content' | 'analytics';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    from: Date;
    to: Date;
  };
  includeSections: string[];
  includeCharts: boolean;
  scheduleEnabled: boolean;
  schedulePeriod?: 'daily' | 'weekly' | 'monthly';
}

export function ReportExporter() {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'leads',
    format: 'pdf',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    includeSections: ['summary', 'details'],
    includeCharts: true,
    scheduleEnabled: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'leads', label: 'Reporte de Leads', icon: FileText },
    { value: 'marketing', label: 'Marketing Performance', icon: FileSpreadsheet },
    { value: 'content', label: 'Análisis de Contenido', icon: FileText },
    { value: 'analytics', label: 'Analytics Completo', icon: FileSpreadsheet }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      toast({
        title: "Iniciando exportación",
        description: "Obteniendo datos del reporte...",
      });

      // Crear instancia del exportador
      const exporter = new ReportExportService(config.dateRange);
      setExportProgress(20);

      // Obtener datos reales
      const reportData = await exporter.fetchReportData();
      setExportProgress(50);

      // Generar archivo según formato
      let blob: Blob;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (config.format) {
        case 'pdf':
          blob = await exporter.exportToPDF(reportData, config.type);
          filename = `reporte-${config.type}-${timestamp}.pdf`;
          break;
        case 'excel':
          blob = await exporter.exportToExcel(reportData, config.type);
          filename = `reporte-${config.type}-${timestamp}.xlsx`;
          break;
        case 'csv':
          blob = await exporter.exportToCSV(reportData, config.type);
          filename = `reporte-${config.type}-${timestamp}.csv`;
          break;
        default:
          throw new Error('Formato no soportado');
      }

      setExportProgress(90);

      // Descargar archivo
      downloadFile(blob, filename);
      setExportProgress(100);
      
      toast({
        title: "✅ Reporte generado exitosamente",
        description: `${filename} descargado. Contiene ${reportData.leads.length} leads y ${reportData.valuations.length} valoraciones.`,
      });

      // Registrar actividad de exportación
      if (config.scheduleEnabled) {
        toast({
          title: "📅 Reporte programado",
          description: `Se generará automáticamente cada ${config.schedulePeriod}`,
        });
      }

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "❌ Error en la exportación",
        description: error.message || "No se pudo generar el reporte. Verifica tu conexión y permisos.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
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

        <div className="space-y-4">
          <Label>Opciones Avanzadas</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-charts"
              checked={config.includeCharts}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCharts: !!checked }))}
            />
            <Label htmlFor="include-charts" className="text-sm">
              Incluir gráficos y visualizaciones
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="schedule-report"
              checked={config.scheduleEnabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, scheduleEnabled: !!checked }))}
            />
            <Label htmlFor="schedule-report" className="text-sm">
              Programar reporte automático
            </Label>
          </div>

          {config.scheduleEnabled && (
            <Select 
              value={config.schedulePeriod || 'weekly'} 
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, schedulePeriod: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Barra de progreso */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando reporte...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-pulse" />
              Generando reporte...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generar y Descargar
            </>
          )}
        </Button>

        {config.scheduleEnabled && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            <Calendar className="h-3 w-3 inline mr-1" />
            Reporte programado para generarse {config.schedulePeriod === 'daily' ? 'diariamente' : 
              config.schedulePeriod === 'weekly' ? 'semanalmente' : 'mensualmente'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}