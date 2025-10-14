import { TrendingUp, Zap, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRODVersionStats } from '@/hooks/useRODVersionStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface RODImpactAnalysisProps {
  documentId: string;
}

export const RODImpactAnalysis = ({ documentId }: RODImpactAnalysisProps) => {
  const { data: stats, isLoading } = useRODVersionStats(documentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Calculate impact metrics
  const downloadToLeadRate = stats.totalDownloads > 0 
    ? Math.round((stats.totalLeads / stats.totalDownloads) * 100) 
    : 0;

  const leadQuality = stats.avgLeadScore > 70 ? 'Alta' : stats.avgLeadScore > 50 ? 'Media' : 'Baja';
  const leadQualityColor = stats.avgLeadScore > 70 ? 'text-green-600' : stats.avgLeadScore > 50 ? 'text-yellow-600' : 'text-red-600';

  const engagementRate = stats.emailOpenRate;
  const engagementQuality = engagementRate > 70 ? 'Excelente' : engagementRate > 50 ? 'Buena' : engagementRate > 30 ? 'Regular' : 'Baja';

  const performanceScore = Math.round(
    (downloadToLeadRate * 0.3) + 
    (engagementRate * 0.3) + 
    (stats.avgLeadScore * 0.4)
  );

  const performanceLevel = performanceScore > 70 ? 'Alto rendimiento' : performanceScore > 50 ? 'Rendimiento medio' : 'Bajo rendimiento';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análisis de Impacto
        </CardTitle>
        <CardDescription>
          Métricas de efectividad y calidad de esta versión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score de Rendimiento</span>
            <Badge variant={performanceScore > 70 ? 'default' : 'secondary'}>
              {performanceLevel}
            </Badge>
          </div>
          <Progress value={performanceScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {performanceScore}/100 puntos
          </p>
        </div>

        {/* Conversion Funnel */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Embudo de Conversión
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Descargas</span>
                <span className="font-medium">{stats.totalDownloads}</span>
              </div>
              <Progress value={100} className="h-1" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Leads generados</span>
                <span className="font-medium">{stats.totalLeads} ({downloadToLeadRate}%)</span>
              </div>
              <Progress value={downloadToLeadRate} className="h-1" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Emails abiertos</span>
                <span className="font-medium">{stats.leadsWithEmailOpened} ({engagementRate}%)</span>
              </div>
              <Progress value={engagementRate} className="h-1" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Leads alta calidad</span>
                <span className="font-medium">{stats.highScoreLeads}</span>
              </div>
              <Progress 
                value={stats.totalLeads > 0 ? (stats.highScoreLeads / stats.totalLeads) * 100 : 0} 
                className="h-1" 
              />
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Calidad de Leads</span>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.avgLeadScore}</div>
              <p className={`text-xs font-medium ${leadQualityColor}`}>{leadQuality}</p>
            </div>
          </div>

          <div className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
            <div>
              <div className="text-2xl font-bold">{engagementRate}%</div>
              <p className="text-xs font-medium text-muted-foreground">{engagementQuality}</p>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Eficiencia</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Conversión descarga→lead:</span>
              <p className="font-medium">{downloadToLeadRate}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Días de vida útil:</span>
              <p className="font-medium">{stats.daysActive} días</p>
            </div>
            <div>
              <span className="text-muted-foreground">Descargas/día:</span>
              <p className="font-medium">{stats.avgDownloadsPerDay.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Leads/día:</span>
              <p className="font-medium">
                {stats.daysActive > 0 ? (stats.totalLeads / stats.daysActive).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
