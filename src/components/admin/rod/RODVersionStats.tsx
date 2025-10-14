import { Download, Users, Mail, TrendingUp, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRODVersionStats } from '@/hooks/useRODVersionStats';

interface RODVersionStatsProps {
  documentId: string;
}

export const RODVersionStats = ({ documentId }: RODVersionStatsProps) => {
  const { data: stats, isLoading } = useRODVersionStats(documentId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      icon: Download,
      label: 'Descargas totales',
      value: stats.totalDownloads,
      subtitle: `${stats.avgDownloadsPerDay.toFixed(1)}/día promedio`
    },
    {
      icon: Users,
      label: 'Leads generados',
      value: stats.totalLeads,
      subtitle: `${stats.highScoreLeads} con score > 70`
    },
    {
      icon: Mail,
      label: 'Tasa apertura',
      value: `${stats.emailOpenRate}%`,
      subtitle: `${stats.leadsWithEmailOpened} emails abiertos`
    },
    {
      icon: Target,
      label: 'Score promedio',
      value: stats.avgLeadScore,
      subtitle: stats.avgLeadScore > 70 ? 'Alto' : stats.avgLeadScore > 50 ? 'Medio' : 'Bajo'
    },
    {
      icon: Calendar,
      label: 'Días activa',
      value: stats.daysActive,
      subtitle: `de ${stats.totalDaysInCatalog} totales`
    },
    {
      icon: TrendingUp,
      label: 'Rendimiento',
      value: stats.totalLeads > 0 ? `${Math.round((stats.totalLeads / stats.totalDownloads) * 100)}%` : '0%',
      subtitle: 'Conversión descarga→lead'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Estadísticas de esta versión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
