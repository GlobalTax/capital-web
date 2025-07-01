
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calculator, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useFormAnalytics } from '@/hooks/useFormAnalytics';
import FormsOverviewTab from './FormsOverviewTab';
import FormAnalyticsTab from './FormAnalyticsTab';
import FormConfigurationTab from './FormConfigurationTab';

const FormsControlDashboard = () => {
  const { analytics, isLoading, refetch } = useFormAnalytics();

  const totalForms = analytics.length;
  const totalStarts = analytics.reduce((sum, form) => sum + form.total_starts, 0);
  const totalCompletions = analytics.reduce((sum, form) => sum + form.total_completions, 0);
  const avgConversionRate = analytics.length > 0 
    ? analytics.reduce((sum, form) => sum + form.conversion_rate, 0) / analytics.length 
    : 0;

  const getFormIcon = (formType: string) => {
    switch (formType.toLowerCase()) {
      case 'contact': return <Users className="h-5 w-5" />;
      case 'valuation': return <Calculator className="h-5 w-5" />;
      case 'lead_magnet': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Cargando analytics de formularios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 CONTROL DE FORMULARIOS</h1>
          <p className="text-gray-600 mt-1">Gestión centralizada y analytics de todos los formularios</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
          <Button>
            Configurar Formulario
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Formularios</p>
                <p className="text-3xl font-bold text-blue-600">{totalForms}</p>
                <p className="text-xs text-gray-500 mt-1">Tipos activos</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inicios Totales</p>
                <p className="text-3xl font-bold text-green-600">{totalStarts.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-3xl font-bold text-purple-600">{totalCompletions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Conversiones exitosas</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversión Promedio</p>
                <p className="text-3xl font-bold text-orange-600">{avgConversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Tasa general</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Rendimiento por Formulario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((form) => (
              <div 
                key={form.form_type} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getFormIcon(form.form_type)}
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {form.form_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {form.total_starts} inicios • {form.total_completions} completados
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={form.conversion_rate > 50 ? "default" : form.conversion_rate > 25 ? "secondary" : "destructive"}
                  >
                    {form.conversion_rate.toFixed(1)}% conversión
                  </Badge>
                  {form.abandonment_rate > 70 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Alto abandono</span>
                    </div>
                  )}
                  {form.most_abandoned_field && (
                    <div className="text-xs text-gray-500">
                      Abandono en: {form.most_abandoned_field}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Detalladas */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📋 Vista General</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics Detallado</TabsTrigger>
          <TabsTrigger value="config">⚙️ Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FormsOverviewTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FormAnalyticsTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <FormConfigurationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormsControlDashboard;
