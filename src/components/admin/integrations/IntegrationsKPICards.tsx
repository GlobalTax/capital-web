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
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-md)] animate-fade-in">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card 
            key={index} 
            className="border border-border rounded-lg transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-1"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="p-2 rounded-md bg-accent/50 transition-colors duration-200">
                  <IconComponent className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground transition-colors duration-200">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`border ${getStatusColor(card.status)} transition-all duration-200 hover:shadow-sm`}
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