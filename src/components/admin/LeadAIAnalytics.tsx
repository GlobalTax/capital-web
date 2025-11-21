import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, Zap, MessageSquare, FolderOpen, FileText, Database, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface SectorDossierStats {
  total_dossiers: number;
  unique_sectors: number;
  total_cost: number;
  total_tokens: number;
  cache_hit_rate: number;
  avg_processing_time: number;
  by_sector: Array<{
    sector: string;
    count: number;
    avg_cost: number;
    avg_tokens: number;
    useful_percentage: number;
    last_generated: string;
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

  const { data: dossierStats, isLoading: isDossierLoading } = useQuery({
    queryKey: ['sector-dossier-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sector_dossier_stats' as any);
      
      if (error) throw error;
      return data as unknown as SectorDossierStats;
    },
    refetchInterval: 30000,
  });

  if (isLoading || isDossierLoading) {
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

      {/* Sector Dossiers Section */}
      {dossierStats && dossierStats.total_dossiers > 0 && (
        <>
          <div className="pt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Dossiers de Sector
            </h3>
          </div>

          {/* Dossier Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dossierStats.total_dossiers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En {dossierStats.unique_sectors} sectores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {dossierStats.cache_hit_rate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Reutilización de caché
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
                  ${dossierStats.total_cost.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inversión en dossiers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dossierStats.avg_processing_time}s
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por dossier generado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Sectors Table */}
          {dossierStats.by_sector && dossierStats.by_sector.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Sectores Más Consultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dossierStats.by_sector.map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium capitalize">{sector.sector}</div>
                          <div className="text-sm text-muted-foreground">
                            ({sector.count} dossiers)
                          </div>
                          {sector.useful_percentage > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              {sector.useful_percentage}% útiles
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Promedio: {sector.avg_tokens.toLocaleString()} tokens · 
                          ${sector.avg_cost.toFixed(5)} por dossier · 
                          Último: {formatDistance(new Date(sector.last_generated), new Date(), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${(sector.count * sector.avg_cost).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cache Efficiency Insight */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm">⚡ Eficiencia de Caché</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">
                Con un cache hit rate de <span className="font-bold text-foreground">
                {dossierStats.cache_hit_rate}%</span>, estás ahorrando aproximadamente{' '}
                <span className="font-bold text-foreground">
                  ${(dossierStats.total_cost * (dossierStats.cache_hit_rate / 100)).toFixed(4)}
                </span>{' '}
                en regeneraciones innecesarias gracias al sistema de caché de 7 días.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
