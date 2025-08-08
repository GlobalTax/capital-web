import React, { useState, useEffect } from 'react';
import { Activity, Users, Target, TrendingUp, Eye, Clock, MousePointer, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrackingStats {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  hotLeads: number;
}

const TrackingDashboard = () => {
  const [stats, setStats] = useState<TrackingStats>({
    totalViews: 0,
    uniqueVisitors: 0,
    avgTimeOnSite: 0,
    bounceRate: 0,
    conversionRate: 0,
    hotLeads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      // Fetch blog analytics
      const { data: blogData } = await supabase
        .from('blog_analytics')
        .select('*');

      // Fetch lead scores
      const { data: leadData } = await supabase
        .from('lead_scores')
        .select('*');

      // Fetch lead behavior events
      const { data: behaviorData } = await supabase
        .from('lead_behavior_events')
        .select('*');

      // Calculate stats
      const totalViews = blogData?.length || 0;
      const uniqueVisitors = new Set(blogData?.map(item => item.visitor_id)).size;
      const avgTimeOnSite = blogData?.reduce((sum, item) => sum + (item.reading_time || 0), 0) / (blogData?.length || 1);
      const hotLeads = leadData?.filter(lead => lead.is_hot_lead).length || 0;
      const totalLeads = leadData?.length || 0;
      const conversionRate = totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0;

      setStats({
        totalViews,
        uniqueVisitors,
        avgTimeOnSite: Math.round(avgTimeOnSite),
        bounceRate: 45, // Placeholder
        conversionRate: Math.round(conversionRate),
        hotLeads
      });
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas de seguimiento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Tracking</h1>
          <p className="text-muted-foreground">
            Métricas unificadas de seguimiento y comportamiento
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="h-4 w-4 mr-1" />
          En tiempo real
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizaciones Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">páginas vistas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">usuarios únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTimeOnSite}s</div>
            <p className="text-xs text-muted-foreground">tiempo en sitio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">abandono inmediato</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Tracking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">leads calificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">leads to hot leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Comportamiento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">interacciones registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Herramientas de seguimiento y análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-medium mb-1">Configurar Google Analytics</h3>
              <p className="text-sm text-muted-foreground">Integrar GA4 para tracking avanzado</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-medium mb-1">Configurar Facebook Pixel</h3>
              <p className="text-sm text-muted-foreground">Tracking para ads de Facebook</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-medium mb-1">Exportar Datos</h3>
              <p className="text-sm text-muted-foreground">Descargar reportes de tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingDashboard;