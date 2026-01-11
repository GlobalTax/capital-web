import { Card, CardContent } from '@/components/ui/card';
import { Building2, Globe, Newspaper, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface StatsProps {
  stats: {
    totalSFFunds: number;
    totalCRFunds: number;
    scrapedSF: number;
    scrapedCR: number;
    totalNews: number;
    materialChanges: number;
    unprocessedNews: number;
  };
}

export const FundIntelligenceStats = ({ stats }: StatsProps) => {
  const items = [
    {
      label: 'Search Funds',
      value: stats.totalSFFunds,
      subtext: `${stats.scrapedSF} escaneados`,
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      label: 'Capital Riesgo',
      value: stats.totalCRFunds,
      subtext: `${stats.scrapedCR} escaneados`,
      icon: Building2,
      color: 'text-purple-500',
    },
    {
      label: 'Noticias',
      value: stats.totalNews,
      subtext: 'total encontradas',
      icon: Newspaper,
      color: 'text-green-500',
    },
    {
      label: 'Cambios materiales',
      value: stats.materialChanges,
      subtext: 'operaciones detectadas',
      icon: AlertTriangle,
      color: 'text-orange-500',
    },
    {
      label: 'Sin procesar',
      value: stats.unprocessedNews,
      subtext: 'pendientes de revisar',
      icon: Clock,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.subtext}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
