import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { BaseWidget } from './WidgetFactory';

interface AlertWidgetProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function AlertWidget({ widget, isEditing, onEdit, onDelete, isDragging }: AlertWidgetProps) {
  // Mock data - en producción vendría de una API o sistema de alertas
  const mockAlerts = {
    system_status: [
      { id: 1, type: 'success', message: 'Todos los servicios funcionando correctamente', timestamp: new Date() },
      { id: 2, type: 'warning', message: 'Alto uso de CPU en servidor de base de datos', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 3, type: 'info', message: 'Mantenimiento programado para el domingo', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }
    ],
    lead_alerts: [
      { id: 1, type: 'success', message: 'Nuevo lead de alta calidad: TechCorp S.L.', timestamp: new Date() },
      { id: 2, type: 'warning', message: '5 leads sin seguimiento en 48h', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 3, type: 'info', message: 'Campaña LinkedIn supera objetivo del 20%', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) }
    ],
    content_alerts: [
      { id: 1, type: 'success', message: 'Post "Tendencias M&A 2024" viral en LinkedIn', timestamp: new Date() },
      { id: 2, type: 'error', message: 'Error 404 detectado en página de casos de éxito', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { id: 3, type: 'info', message: '3 nuevos comentarios pendientes de moderación', timestamp: new Date(Date.now() - 1000 * 60 * 45) }
    ]
  };

  const alerts = mockAlerts[widget.config?.alertType as keyof typeof mockAlerts] || mockAlerts.system_status;
  const limit = widget.config?.limit || 3;
  const displayAlerts = alerts.slice(0, limit);

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string): 'default' | 'destructive' => {
    switch (type) {
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `hace ${minutes}m`;
    } else if (hours < 24) {
      return `hace ${hours}h`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <Card className={`${isDragging ? 'opacity-50' : ''} ${getSizeClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {isEditing && (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(widget)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete?.(widget.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAlerts.map((alert: any) => (
            <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}