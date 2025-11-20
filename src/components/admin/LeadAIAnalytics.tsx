import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, Zap, MessageSquare } from 'lucide-react';

interface AIStats {
  total_reports: number;
  useful_percentage: number;
  total_cost: number;
  total_tokens: number;
  feedback_count: number;
  by_type: Array<{
    lead_type: string;
    count: number;
    avg_cost: number;
    avg_tokens: number;
  }>;
}

export const LeadAIAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['lead-ai-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_lead_ai_stats');
      
      if (error) throw error;
      return data as unknown as AIStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatLeadType = (type: string) => {
    const types: Record<string, string> = {
      valuation: 'Valoraciones',
      contact: 'Contactos',
      collaborator: 'Colaboradores',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_reports || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Análisis generados con IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">% Útiles</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats?.useful_percentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {stats?.feedback_count || 0} valoraciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coste Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(stats?.total_cost || 0).toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inversión en OpenAI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.total_tokens || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tokens procesados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Type Stats */}
      {stats?.by_type && stats.by_type.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reportes por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.by_type.map((typeStats) => (
                <div key={typeStats.lead_type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{formatLeadType(typeStats.lead_type)}</div>
                      <div className="text-sm text-muted-foreground">
                        ({typeStats.count} reportes)
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Promedio: {typeStats.avg_tokens.toLocaleString()} tokens · 
                      ${typeStats.avg_cost.toFixed(4)} por reporte
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${(typeStats.count * typeStats.avg_cost).toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Estimation */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">💡 Estimación de ROI</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            Con {stats?.total_reports || 0} reportes generados y un coste de 
            ${(stats?.total_cost || 0).toFixed(4)}, estás ahorrando aproximadamente{' '}
            <span className="font-bold text-foreground">
              {((stats?.total_reports || 0) * 15 / 60).toFixed(1)} horas
            </span>{' '}
            de trabajo de análisis manual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
