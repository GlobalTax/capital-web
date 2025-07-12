import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, Table, Type, AlertCircle, TrendingUp } from 'lucide-react';
import { BaseWidget } from './widgets/WidgetFactory';

interface WidgetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWidget: (widget: BaseWidget) => void;
  customWidgets?: BaseWidget[];
}

const WIDGET_TEMPLATES: BaseWidget[] = [
  // KPI Widgets
  {
    id: 'template-leads-total',
    type: 'kpi',
    title: 'Total Leads',
    size: 'small',
    config: { metric: 'total_leads', format: 'number' },
    permissions: ['marketing.leads.read']
  },
  {
    id: 'template-conversion-rate',
    type: 'kpi',
    title: 'Tasa de Conversión',
    size: 'small',
    config: { metric: 'conversion_rate', format: 'percentage' },
    permissions: ['marketing.analytics.read']
  },
  {
    id: 'template-revenue',
    type: 'kpi',
    title: 'Ingresos Totales',
    size: 'small',
    config: { metric: 'total_revenue', format: 'currency' },
    permissions: ['finance.revenue.read']
  },
  {
    id: 'template-active-users',
    type: 'kpi',
    title: 'Usuarios Activos',
    size: 'small',
    config: { metric: 'active_users', format: 'number' },
    permissions: ['admin.users.read']
  },

  // Chart Widgets
  {
    id: 'template-leads-funnel',
    type: 'chart',
    title: 'Embudo de Conversión',
    size: 'large',
    config: { chartType: 'line', metric: 'conversion_funnel' },
    permissions: ['marketing.leads.read']
  },
  {
    id: 'template-content-performance',
    type: 'chart',
    title: 'Rendimiento de Contenido',
    size: 'medium',
    config: { chartType: 'bar', metric: 'content_metrics' },
    permissions: ['content.analytics.read']
  },
  {
    id: 'template-seo-trends',
    type: 'chart',
    title: 'Tendencias SEO',
    size: 'medium',
    config: { chartType: 'area', metric: 'seo_performance' },
    permissions: ['content.seo.read']
  },

  // Table Widgets
  {
    id: 'template-lead-pipeline',
    type: 'table',
    title: 'Pipeline de Leads',
    size: 'large',
    config: { tableType: 'lead_pipeline', limit: 10 },
    permissions: ['marketing.leads.read']
  },
  {
    id: 'template-recent-posts',
    type: 'table',
    title: 'Posts Recientes',
    size: 'medium',
    config: { tableType: 'recent_posts', limit: 5 },
    permissions: ['content.posts.read']
  },

  // Text Widgets
  {
    id: 'template-welcome-note',
    type: 'text',
    title: 'Nota de Bienvenida',
    size: 'medium',
    config: { 
      content: '**¡Bienvenido a tu Dashboard!**\n\nPersonaliza este espacio con la información más relevante para tu trabajo diario.' 
    },
    permissions: []
  },

  // Alert Widgets
  {
    id: 'template-system-alerts',
    type: 'alert',
    title: 'Alertas del Sistema',
    size: 'medium',
    config: { alertType: 'system_status', limit: 3 },
    permissions: ['system.health.read']
  },
  {
    id: 'template-lead-alerts',
    type: 'alert',
    title: 'Alertas de Leads',
    size: 'medium',
    config: { alertType: 'lead_alerts', limit: 5 },
    permissions: ['marketing.leads.read']
  }
];

export function WidgetSelector({ open, onOpenChange, onSelectWidget, customWidgets = [] }: WidgetSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'kpi': return <TrendingUp className="h-5 w-5" />;
      case 'chart': return <BarChart3 className="h-5 w-5" />;
      case 'table': return <Table className="h-5 w-5" />;
      case 'text': return <Type className="h-5 w-5" />;
      case 'alert': return <AlertCircle className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectWidget = (template: BaseWidget) => {
    const widget = {
      ...template,
      size: selectedSize,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    onSelectWidget(widget);
  };

  const kpiWidgets = WIDGET_TEMPLATES.filter(w => w.type === 'kpi');
  const chartWidgets = WIDGET_TEMPLATES.filter(w => w.type === 'chart');
  const tableWidgets = WIDGET_TEMPLATES.filter(w => w.type === 'table');
  const otherWidgets = WIDGET_TEMPLATES.filter(w => !['kpi', 'chart', 'table'].includes(w.type));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Widget</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de tamaño */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tamaño:</span>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                >
                  {size === 'small' && 'Pequeño'}
                  {size === 'medium' && 'Mediano'}
                  {size === 'large' && 'Grande'}
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="kpi" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="kpi">KPIs</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="tables">Tablas</TabsTrigger>
              <TabsTrigger value="others">Otros</TabsTrigger>
              <TabsTrigger value="custom">Personalizados</TabsTrigger>
            </TabsList>

            <TabsContent value="kpi" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {kpiWidgets.map(widget => (
                  <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectWidget(widget)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWidgetIcon(widget.type)}
                          <CardTitle className="text-sm">{widget.title}</CardTitle>
                        </div>
                        <Badge className={`text-xs ${getSizeColor(widget.size)}`}>
                          {widget.size}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Métrica: {widget.config.metric}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {chartWidgets.map(widget => (
                  <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectWidget(widget)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWidgetIcon(widget.type)}
                          <CardTitle className="text-sm">{widget.title}</CardTitle>
                        </div>
                        <Badge className={`text-xs ${getSizeColor(widget.size)}`}>
                          {widget.size}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Tipo: {widget.config.chartType} | Métrica: {widget.config.metric}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tables" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {tableWidgets.map(widget => (
                  <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectWidget(widget)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWidgetIcon(widget.type)}
                          <CardTitle className="text-sm">{widget.title}</CardTitle>
                        </div>
                        <Badge className={`text-xs ${getSizeColor(widget.size)}`}>
                          {widget.size}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Tipo: {widget.config.tableType} | Límite: {widget.config.limit}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="others" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {otherWidgets.map(widget => (
                  <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectWidget(widget)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWidgetIcon(widget.type)}
                          <CardTitle className="text-sm">{widget.title}</CardTitle>
                        </div>
                        <Badge className={`text-xs ${getSizeColor(widget.size)}`}>
                          {widget.size}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Tipo: {widget.type}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              {customWidgets.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {customWidgets.map(widget => (
                    <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectWidget(widget)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getWidgetIcon(widget.type)}
                            <CardTitle className="text-sm">{widget.title}</CardTitle>
                          </div>
                          <Badge className={`text-xs ${getSizeColor(widget.size)}`}>
                            {widget.size}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          Widget personalizado
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Type className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-4">No hay widgets personalizados</h3>
                  <p className="text-muted-foreground">Crea widgets personalizados para tus necesidades específicas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}