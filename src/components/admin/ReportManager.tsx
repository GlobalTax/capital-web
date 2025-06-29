
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { ReportConfig, REPORT_TEMPLATES, METRIC_TYPES } from '@/types/reports';
import { 
  FileText, 
  Calendar, 
  Users, 
  Play, 
  Settings, 
  Trash2, 
  Plus,
  Download,
  Mail,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportManager = () => {
  const {
    reportConfigs,
    generatedReports,
    isLoading,
    isGenerating,
    generateReport,
    createConfig,
    updateConfig,
    deleteConfig,
    isCreatingConfig
  } = useReportGeneration();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ReportConfig | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<ReportConfig>>({
    name: '',
    type: 'monthly',
    recipients: [],
    template: 'executive-summary',
    metrics: [],
    schedule: '0 9 1 * *', // 1st day of month at 9 AM
    is_active: true
  });

  const handleCreateConfig = () => {
    if (newConfig.name && newConfig.recipients?.length && newConfig.metrics?.length) {
      createConfig(newConfig as Omit<ReportConfig, 'id'>);
      setIsCreateDialogOpen(false);
      setNewConfig({
        name: '',
        type: 'monthly',
        recipients: [],
        template: 'executive-summary',
        metrics: [],
        schedule: '0 9 1 * *',
        is_active: true
      });
    }
  };

  const handleRecipientsChange = (value: string) => {
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    setNewConfig({ ...newConfig, recipients: emails });
  };

  const handleMetricsChange = (metricId: string, checked: boolean) => {
    const currentMetrics = newConfig.metrics || [];
    if (checked) {
      setNewConfig({ ...newConfig, metrics: [...currentMetrics, metricId] });
    } else {
      setNewConfig({ ...newConfig, metrics: currentMetrics.filter(m => m !== metricId) });
    }
  };

  const getScheduleDescription = (schedule: string) => {
    switch (schedule) {
      case '0 9 * * 1':
        return 'Lunes a las 9:00 AM';
      case '0 9 1 * *':
        return '1er día del mes a las 9:00 AM';
      case '0 9 1 */3 *':
        return '1er día del trimestre a las 9:00 AM';
      default:
        return schedule;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestión de Reportes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Reportes</h2>
          <p className="text-gray-600">Configura y gestiona reportes automatizados</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Reporte</DialogTitle>
              <DialogDescription>
                Configura un nuevo reporte automatizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Reporte</Label>
                <Input
                  id="name"
                  value={newConfig.name}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  placeholder="Ej: Reporte Mensual Ejecutivo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Frecuencia</Label>
                  <Select
                    value={newConfig.type}
                    onValueChange={(value: 'weekly' | 'monthly' | 'quarterly') => 
                      setNewConfig({ ...newConfig, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template">Plantilla</Label>
                  <Select
                    value={newConfig.template}
                    onValueChange={(value) => setNewConfig({ ...newConfig, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Métricas a Incluir</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {METRIC_TYPES.map(metric => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={newConfig.metrics?.includes(metric.id)}
                        onCheckedChange={(checked) => 
                          handleMetricsChange(metric.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={metric.id} className="text-sm">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">Destinatarios (separados por comas)</Label>
                <Textarea
                  id="recipients"
                  value={newConfig.recipients?.join(', ')}
                  onChange={(e) => handleRecipientsChange(e.target.value)}
                  placeholder="email1@ejemplo.com, email2@ejemplo.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newConfig.is_active}
                  onCheckedChange={(checked) => 
                    setNewConfig({ ...newConfig, is_active: checked })
                  }
                />
                <Label>Activar reporte automático</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateConfig} disabled={isCreatingConfig}>
                  {isCreatingConfig ? 'Creando...' : 'Crear Reporte'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configuraciones de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportConfigs?.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <CardDescription>
                    {REPORT_TEMPLATES.find(t => t.id === config.template)?.name}
                  </CardDescription>
                </div>
                <Badge variant={config.is_active ? 'default' : 'secondary'}>
                  {config.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {config.type === 'weekly' ? 'Semanal' : 
                   config.type === 'monthly' ? 'Mensual' : 'Trimestral'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {config.recipients.length} destinatarios
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {getScheduleDescription(config.schedule)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {config.metrics.map(metric => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {METRIC_TYPES.find(m => m.id === metric)?.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateReport(config)}
                    disabled={isGenerating}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Generar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => config.id && deleteConfig(config.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histórico de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <CardDescription>
            Histórico de reportes generados automática y manualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedReports?.slice(0, 10).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      Reporte #{report.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(report.generated_at), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      report.status === 'completed' ? 'default' :
                      report.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {report.status === 'completed' ? 'Completado' :
                     report.status === 'failed' ? 'Error' : 'Pendiente'}
                  </Badge>
                  {report.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportManager;
