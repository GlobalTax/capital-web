import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Users } from 'lucide-react';
import { MarketingMetrics } from '@/types/marketingHub';

interface QuickInsightsProps {
  marketingMetrics?: MarketingMetrics;
  contentStats: any[];
  businessStats: any[];
  dateRange: { from: Date; to: Date };
}

const QuickInsights = ({ marketingMetrics, contentStats, businessStats, dateRange }: QuickInsightsProps) => {
  const insights = [
    {
      title: 'Conversión de Leads',
      type: 'positive',
      icon: TrendingUp,
      description: 'Las conversiones han aumentado un 22% esta semana',
      metric: marketingMetrics ? `${marketingMetrics.leadConversionRate.toFixed(1)}%` : 'N/A',
      progress: marketingMetrics ? marketingMetrics.leadConversionRate : 0
    },
    {
      title: 'Calidad de Leads',
      type: 'warning',
      icon: Target,
      description: 'Score promedio por debajo del objetivo',
      metric: marketingMetrics ? marketingMetrics.averageLeadScore.toString() : 'N/A',
      progress: marketingMetrics ? (marketingMetrics.averageLeadScore / 100) * 100 : 0
    },
    {
      title: 'Rendimiento de Contenido',
      type: 'positive',
      icon: Zap,
      description: 'El blog ha generado más engagement este mes',
      metric: '+18.5%',
      progress: 75
    },
    {
      title: 'Identificación de Empresas',
      type: 'neutral',
      icon: Users,
      description: 'Ratio estable de empresas identificadas',
      metric: marketingMetrics ? `${((marketingMetrics.identifiedCompanies / marketingMetrics.totalVisitors) * 100).toFixed(1)}%` : 'N/A',
      progress: marketingMetrics ? (marketingMetrics.identifiedCompanies / marketingMetrics.totalVisitors) * 100 : 0
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800',
          progress: 'bg-green-500'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800',
          progress: 'bg-yellow-500'
        };
      case 'negative':
        return {
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
          progress: 'bg-red-500'
        };
      default:
        return {
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
          progress: 'bg-blue-500'
        };
    }
  };

  const recommendations = [
    {
      priority: 'high',
      title: 'Optimizar formularios de contacto',
      description: 'Las conversiones pueden mejorarse reduciendo campos obligatorios',
      action: 'Revisar formularios'
    },
    {
      priority: 'medium',
      title: 'Amplificar contenido exitoso',
      description: 'Algunos posts tienen alto engagement, considera crear contenido similar',
      action: 'Analizar top posts'
    },
    {
      priority: 'low',
      title: 'Segmentar audiencia',
      description: 'Crear campañas personalizadas por industria puede mejorar ROI',
      action: 'Crear segmentos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          const colors = getInsightColor(insight.type);
          
          return (
            <Card key={index} className="bg-card border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                  <Badge className={colors.badge}>
                    {insight.type === 'positive' ? 'Mejorando' : insight.type === 'warning' ? 'Atención' : 'Estable'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {insight.metric}
                </div>
                <Progress 
                  value={insight.progress} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recomendaciones */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Recomendaciones Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{rec.title}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <button className="text-sm text-primary hover:underline">
                  {rec.action} →
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Próximas implementaciones */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Próximas Mejoras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Predicciones de IA basadas en tendencias históricas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Alertas automáticas por umbrales personalizables</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Dashboard personalizable por rol de usuario</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickInsights;