import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Zap,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { IntegrationsMetrics } from '@/types/integrations';

interface IntegrationsKPICardsProps {
  metrics: IntegrationsMetrics | null;
  isLoading: boolean;
}

export const IntegrationsKPICards = ({ metrics, isLoading }: IntegrationsKPICardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Apollo Enrichments',
      value: metrics?.apolloEnrichments || 0,
      icon: Users,
      description: 'Empresas enriquecidas',
      status: 'active',
      trend: '+12%'
    },
    {
      title: 'Contactos Apollo',
      value: metrics?.apolloContacts || 0,
      icon: Activity,
      description: 'Contactos procesados',
      status: 'active',
      trend: '+8%'
    },
    {
      title: 'Conversiones Ads',
      value: metrics?.adConversions || 0,
      icon: TrendingUp,
      description: 'Google Ads attribution',
      status: 'active',
      trend: '+15%'
    },
    {
      title: 'Tasa de Éxito',
      value: `${metrics?.successRate || 0}%`,
      icon: CheckCircle,
      description: 'APIs funcionando',
      status: metrics?.successRate && metrics.successRate > 90 ? 'success' : 'warning',
      trend: 'Estable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <IconComponent className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(card.status)}
                  >
                    {card.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IntegrationsKPICards;