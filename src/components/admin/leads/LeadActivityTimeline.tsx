import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  MousePointer, 
  Calculator, 
  Mail, 
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { LeadActivityEvent } from '@/hooks/useLeadActivity';

interface LeadActivityTimelineProps {
  activities: LeadActivityEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  showVisitorInfo?: boolean;
}

const LeadActivityTimeline: React.FC<LeadActivityTimelineProps> = ({
  activities,
  isLoading,
  onRefresh,
  showVisitorInfo = false
}) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return <Eye className="h-4 w-4" />;
      case 'calculator_usage':
        return <Calculator className="h-4 w-4" />;
      case 'contact_interest':
        return <Mail className="h-4 w-4" />;
      case 'time_on_page':
        return <Clock className="h-4 w-4" />;
      default:
        return <MousePointer className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string, points: number) => {
    if (points >= 25) return 'border-red-500 bg-red-50';
    if (points >= 15) return 'border-orange-500 bg-orange-50';
    if (points >= 10) return 'border-blue-500 bg-blue-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      page_view: 'Página visitada',
      calculator_usage: 'Calculadora utilizada',
      contact_interest: 'Interés en contacto',
      time_on_page: 'Tiempo en página'
    };
    return labels[eventType] || eventType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatPagePath = (path: string) => {
    const pathNames: Record<string, string> = {
      '/': 'Página principal',
      '/lp/calculadora': 'Calculadora de valoración',
      '/calculadora-valoracion': 'Calculadora de valoración',
      '/contacto': 'Página de contacto',
      '/venta-empresas': 'Venta de empresas',
      '/servicios/valoraciones': 'Servicios de valoración',
      '/servicios/due-diligence': 'Due Diligence'
    };
    return pathNames[path] || path;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Actividad ({activities.length})
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad registrada</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Línea de tiempo */}
                {index < activities.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-8 bg-border" />
                )}
                
                {/* Evento */}
                <div className={`flex gap-4 p-4 rounded-lg border ${getEventColor(activity.event_type, activity.points_awarded)}`}>
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full bg-white border-2 ${
                      activity.points_awarded >= 25 ? 'border-red-500 text-red-600' :
                      activity.points_awarded >= 15 ? 'border-orange-500 text-orange-600' :
                      activity.points_awarded >= 10 ? 'border-blue-500 text-blue-600' :
                      'border-gray-400 text-gray-600'
                    }`}>
                      {getEventIcon(activity.event_type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {getEventLabel(activity.event_type)}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          +{activity.points_awarded} pts
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>

                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatPagePath(activity.page_path)}
                      </p>
                      
                      {/* Información adicional del evento */}
                      {activity.event_data && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {activity.event_data.time_on_page && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Tiempo: {Math.round(activity.event_data.time_on_page)}s
                            </div>
                          )}
                          {activity.event_data.action && (
                            <div>Acción: {activity.event_data.action}</div>
                          )}
                        </div>
                      )}

                      {/* Información de campaña */}
                      {(activity.utm_source || activity.utm_campaign) && (
                        <div className="flex items-center gap-2 text-xs">
                          {activity.utm_source && (
                            <Badge variant="outline" className="text-xs">
                              {activity.utm_source}
                            </Badge>
                          )}
                          {activity.utm_campaign && (
                            <Badge variant="outline" className="text-xs">
                              {activity.utm_campaign}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Info del visitante (si se solicita) */}
                      {showVisitorInfo && activity.company_domain && (
                        <div className="text-xs text-muted-foreground">
                          Empresa: {activity.company_domain}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadActivityTimeline;