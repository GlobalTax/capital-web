
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Star, TrendingUp, UserPlus, Clock } from 'lucide-react';
import { useRealTimeLeads } from '@/hooks/useRealTimeLeads';

const LeadActivityFeed = () => {
  const { recentUpdates, clearUpdates, isConnected } = useRealTimeLeads();

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'new_lead':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'hot_lead':
        return <Star className="h-4 w-4 text-red-500" />;
      case 'score_update':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'new_lead':
        return 'bg-blue-50 border-blue-200';
      case 'hot_lead':
        return 'bg-red-50 border-red-200';
      case 'score_update':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getUpdateMessage = (update: any) => {
    const company = update.leadData.company_name || update.leadData.company_domain || 'Empresa Anónima';
    const score = update.leadData.total_score || 0;

    switch (update.type) {
      case 'new_lead':
        return `Nuevo lead detectado: ${company}`;
      case 'hot_lead':
        return `🔥 ${company} ahora es un lead caliente (Score: ${score})`;
      case 'score_update':
        return `${company} actualizó su score a ${score}`;
      default:
        return `Actividad en ${company}`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Feed de Actividad
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <Badge variant="outline">{recentUpdates.length}</Badge>
            {recentUpdates.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearUpdates}
                className="text-xs"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((update, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getUpdateColor(update.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {getUpdateMessage(update)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(update.timestamp)}
                        </span>
                        {update.leadData.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {update.leadData.industry}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {update.leadData.total_score && (
                      <Badge 
                        variant={update.leadData.total_score >= 80 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {update.leadData.total_score}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin actividad reciente</p>
                <p className="text-xs">Las nuevas actividades aparecerán aquí automáticamente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LeadActivityFeed;
