import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Eye, 
  Target,
  Mail,
  Globe,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackingMetrics {
  totalVisitors: number;
  totalPageViews: number;
  totalEvents: number;
  totalLeads: number;
  conversionRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; }>;
  topEvents: Array<{ event: string; count: number; }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    value?: number;
  }>;
  companyInsights: Array<{
    domain: string;
    visits: number;
    leads: number;
    score: number;
  }>;
}

const UnifiedTrackingDashboard = () => {
  const [metrics, setMetrics] = useState<TrackingMetrics>({
    totalVisitors: 0,
    totalPageViews: 0,
    totalEvents: 0,
    totalLeads: 0,
    conversionRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    topEvents: [],
    recentActivity: [],
    companyInsights: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Calcular fecha de inicio basada en el rango
      const now = new Date();
      const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Obtener métricas de eventos de comportamiento
      const { data: behaviorEvents, error: behaviorError } = await supabase
        .from('lead_behavior_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (behaviorError) throw behaviorError;

      // Obtener scores de leads
      const { data: leadScores, error: scoresError } = await supabase
        .from('lead_scores')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (scoresError) throw scoresError;

      // Procesar métricas
      const uniqueVisitors = new Set(behaviorEvents?.map(e => e.visitor_id) || []).size;
      const pageViews = behaviorEvents?.filter(e => e.event_type === 'page_view').length || 0;
      const totalEvents = behaviorEvents?.length || 0;
      const totalLeads = leadScores?.length || 0;
      const conversionRate = uniqueVisitors > 0 ? (totalLeads / uniqueVisitors) * 100 : 0;

      // Top páginas
      const pageStats = (behaviorEvents || [])
        .filter(e => e.event_type === 'page_view' && e.page_path)
        .reduce((acc: Record<string, number>, event) => {
          const page = event.page_path || 'Unknown';
          acc[page] = (acc[page] || 0) + 1;
          return acc;
        }, {});

      const topPages = Object.entries(pageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }));

      // Top eventos
      const eventStats = (behaviorEvents || [])
        .filter(e => e.event_type !== 'page_view')
        .reduce((acc: Record<string, number>, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {});

      const topEvents = Object.entries(eventStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([event, count]) => ({ event, count }));

      // Actividad reciente
      const recentActivity = (behaviorEvents || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
        .map(event => ({
          id: event.id,
          type: event.event_type,
          description: getEventDescription(event),
          timestamp: event.created_at,
          value: event.points_awarded
        }));

      // Company insights
      const companyStats = (leadScores || [])
        .filter(score => score.company_domain)
        .reduce((acc: Record<string, any>, score) => {
          const domain = score.company_domain!;
          if (!acc[domain]) {
            acc[domain] = { visits: 0, leads: 0, totalScore: 0, count: 0 };
          }
          acc[domain].visits += score.visit_count || 0;
          acc[domain].leads += 1;
          acc[domain].totalScore += score.total_score || 0;
          acc[domain].count += 1;
          return acc;
        }, {});

      const companyInsights = Object.entries(companyStats)
        .map(([domain, stats]: [string, any]) => ({
          domain,
          visits: stats.visits,
          leads: stats.leads,
          score: Math.round(stats.totalScore / stats.count)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setMetrics({
        totalVisitors: uniqueVisitors,
        totalPageViews: pageViews,
        totalEvents: totalEvents,
        totalLeads: totalLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgSessionDuration: 0, // TODO: Calcular duración promedio
        topPages,
        topEvents,
        recentActivity,
        companyInsights
      });

    } catch (error) {
      console.error('Error loading tracking metrics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas de seguimiento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.event_type) {
      case 'page_view':
        return `Visitó ${event.page_path}`;
      case 'calculator_usage':
        return 'Usó la calculadora de valoración';
      case 'contact_interest':
        return 'Mostró interés en contacto';
      case 'time_on_page':
        return `Pasó tiempo en página (${event.event_data?.seconds}s)`;
      default:
        return `Evento: ${event.event_type}`;
    }
  };

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
          <h1 className="text-3xl font-light text-foreground tracking-tight">
            Dashboard de Seguimiento
          </h1>
          <p className="text-muted-foreground font-light mt-1">
            Métricas unificadas de tracking y comportamiento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visitantes Únicos</p>
                <p className="text-3xl font-light">{metrics.totalVisitors.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5%</span>
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
                <p className="text-sm text-muted-foreground">Páginas Vistas</p>
                <p className="text-3xl font-light">{metrics.totalPageViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8.3%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Eventos</p>
                <p className="text-3xl font-light">{metrics.totalEvents.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+15.7%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                <p className="text-3xl font-light">{metrics.conversionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">-2.1%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Páginas Más Visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium truncate">{page.page}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{page.views}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos Más Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topEvents.map((event, index) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{event.event}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{event.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Empresas con Mayor Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.companyInsights.map((company, index) => (
                  <div key={company.domain} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{company.domain}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.visits} visitas • {company.leads} leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Score: {company.score}</p>
                      <Progress value={Math.min(company.score, 100)} className="w-16 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.value !== undefined && (
                      <Badge variant="secondary">+{activity.value} pts</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedTrackingDashboard;