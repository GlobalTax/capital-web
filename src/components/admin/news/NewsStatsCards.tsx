// ============= NEWS STATS CARDS =============
// Tarjetas de estadísticas para noticias M&A

import { FileText, Clock, CheckCircle, Sparkles, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NewsStats {
  total: number;
  pending: number;
  published: number;
  processed: number;
  todayCount: number;
}

interface NewsStatsCardsProps {
  stats: NewsStats | undefined;
}

export const NewsStatsCards = ({ stats }: NewsStatsCardsProps) => {
  const cards = [
    {
      label: 'Total',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pendientes',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Publicadas',
      value: stats?.published || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Procesadas IA',
      value: stats?.processed || 0,
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Hoy',
      value: stats?.todayCount || 0,
      icon: Calendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
