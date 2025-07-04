import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Download, 
  Eye, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';

const ContentPerformanceDashboard = () => {
  const { leadMagnets, isLoading } = useLeadMagnets();

  // Calcular métricas de rendimiento
  const totalDownloads = leadMagnets?.reduce((sum, magnet) => sum + magnet.download_count, 0) || 0;
  const totalLeads = leadMagnets?.reduce((sum, magnet) => sum + magnet.lead_conversion_count, 0) || 0;
  const activeContent = leadMagnets?.filter(m => m.status === 'active').length || 0;
  const conversionRate = totalDownloads > 0 ? (totalLeads / totalDownloads) * 100 : 0;

  // Top performers
  const topPerformers = leadMagnets
    ?.sort((a, b) => b.download_count - a.download_count)
    .slice(0, 5) || [];

  // Performance por sector
  const sectorPerformance = leadMagnets?.reduce((acc, magnet) => {
    const sector = magnet.sector;
    if (!acc[sector]) {
      acc[sector] = { downloads: 0, leads: 0, count: 0 };
    }
    acc[sector].downloads += magnet.download_count;
    acc[sector].leads += magnet.lead_conversion_count;
    acc[sector].count += 1;
    return acc;
  }, {} as Record<string, { downloads: number; leads: number; count: number }>) || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground font-light mt-1">
            Análisis del rendimiento de contenido
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Últimos 30 días
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Descargas</p>
                <p className="text-3xl font-light">{totalDownloads.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5%</span>
                </div>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Generados</p>
                <p className="text-3xl font-light">{totalLeads.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8.3%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                <p className="text-3xl font-light">{conversionRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">-2.1%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contenido Activo</p>
                <p className="text-3xl font-light">{activeContent}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+2</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((magnet, index) => (
                <div key={magnet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{magnet.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{magnet.sector}</Badge>
                        <Badge variant="outline" className="text-xs">{magnet.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{magnet.download_count}</p>
                    <p className="text-xs text-muted-foreground">{magnet.lead_conversion_count} leads</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Sector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance por Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(sectorPerformance)
                .sort(([,a], [,b]) => b.downloads - a.downloads)
                .slice(0, 6)
                .map(([sector, data]) => {
                  const conversionRate = data.downloads > 0 ? (data.leads / data.downloads) * 100 : 0;
                  const maxDownloads = Math.max(...Object.values(sectorPerformance).map(d => d.downloads));
                  const progressValue = (data.downloads / maxDownloads) * 100;
                  
                  return (
                    <div key={sector} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{sector}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{data.downloads}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({conversionRate.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{data.count} recursos</span>
                        <span>{data.leads} leads</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Potenciar Éxitos</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Crea más contenido para los sectores de mejor rendimiento
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Ver Sectores Top
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Mejorar Conversión</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Optimizar contenido con baja tasa de conversión
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Analizar Contenido
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">Expandir Alcance</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Crear contenido para sectores poco cubiertos
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Identificar Gaps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPerformanceDashboard;