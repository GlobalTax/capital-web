import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Download, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRODTimeline } from '@/hooks/useRODTimeline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RODTimeline = () => {
  const { data: timeline, isLoading } = useRODTimeline();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Versiones
          </CardTitle>
          <CardDescription>
            No hay versiones para mostrar en el timeline
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline de Versiones ROD
        </CardTitle>
        <CardDescription>
          Historial completo de activaciones y desactivaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline nodes */}
          <div className="space-y-8">
            {timeline.map((node, index) => {
              const isFirst = index === 0;
              const isLast = index === timeline.length - 1;
              
              return (
                <div key={node.id} className="relative pl-16">
                  {/* Node circle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute left-6 top-2 h-5 w-5 rounded-full border-2 ${
                            node.isActive
                              ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/50'
                              : node.activatedAt
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-gray-300 border-gray-300'
                          } flex items-center justify-center cursor-help`}
                        >
                          {node.isActive && (
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{node.title}</p>
                          <p className="text-xs">
                            {node.isActive 
                              ? '🟢 Actualmente activa' 
                              : node.activatedAt 
                              ? '🔵 Estuvo activa' 
                              : '⚪ Nunca activada'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Content */}
                  <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{node.version}</h4>
                          {node.isActive && <Badge variant="default">ACTIVA</Badge>}
                          {isLast && !node.isActive && <Badge variant="outline">ÚLTIMA</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{node.title}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {node.totalDownloads}
                        </div>
                        {node.daysActive > 0 && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {node.daysActive}d
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Creada:</span>{' '}
                        {format(node.createdAt, "d 'de' MMM yyyy", { locale: es })}
                      </div>
                      {node.activatedAt && (
                        <div>
                          <span className="font-medium">Activada:</span>{' '}
                          {format(node.activatedAt, "d 'de' MMM yyyy", { locale: es })}
                        </div>
                      )}
                      {node.deactivatedAt && (
                        <div>
                          <span className="font-medium">Desactivada:</span>{' '}
                          {format(node.deactivatedAt, "d 'de' MMM yyyy", { locale: es })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
