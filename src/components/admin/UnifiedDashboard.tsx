import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Calendar, Download, Bell, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DashboardDateFilter from './dashboard/DashboardDateFilter';
import DashboardNotifications from './dashboard/DashboardNotifications';
import DashboardExportMenu from './dashboard/DashboardExportMenu';
import QuickInsights from './dashboard/QuickInsights';
import { PersonalizableDashboard } from './dashboard/PersonalizableDashboard';
import { PredictiveAnalytics } from './analytics/PredictiveAnalytics';
import { useMarketingHubEnhanced } from '@/hooks/useMarketingHubEnhanced';
import { usePrefetch } from '@/hooks/usePrefetch';
import { useRoleBasedLayouts } from '@/hooks/useRoleBasedLayouts';

interface DashboardStats {
  caseStudies: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  contactLeads: number;
  companyValuations: number;
}

interface Notification {
  id: string;
  type: 'hot_lead' | 'new_valuation' | 'content_performance';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
}

export function UnifiedDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [activeView, setActiveView] = useState<'overview' | 'personalized' | 'predictive'>('overview');
  const { marketingMetrics: marketingData, isLoading } = useMarketingHubEnhanced();
  const { activeLayout, userRole, hasPermission } = useRoleBasedLayouts();
  
  // Prefetch datos relacionados
  usePrefetch();

  useEffect(() => {
    // Auto-prefetch data when component mounts
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeView === 'personalized' ? 'Dashboard Personalizado' :
             activeView === 'predictive' ? 'Analytics Predictivos' :
             'Dashboard Unificado'}
          </h1>
          <p className="text-muted-foreground">
            {activeView === 'personalized' ? 'Configura tu vista personalizada' :
             activeView === 'predictive' ? 'Insights y predicciones basadas en IA' :
             'Vista completa de métricas y performance'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1">
            <Button
              variant={activeView === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('overview')}
            >
              Vista General
            </Button>
            {userRole === 'admin' || userRole === 'super_admin' ? (
              <Button
                variant={activeView === 'personalized' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('personalized')}
              >
                <Settings className="h-4 w-4 mr-1" />
                Personalizar
              </Button>
            ) : null}
            {userRole === 'admin' || userRole === 'super_admin' ? (
              <Button
                variant={activeView === 'predictive' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('predictive')}
              >
                IA
              </Button>
            ) : null}
          </div>
          
          {activeView === 'overview' && (
            <>
              <DashboardDateFilter 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <DashboardNotifications 
                notifications={[]}
                onMarkAsRead={() => {}}
              />
              <DashboardExportMenu />
            </>
          )}
        </div>
      </div>

      {/* Contenido dinámico basado en la vista activa */}
      {activeView === 'personalized' && <PersonalizableDashboard />}
      
      {activeView === 'predictive' && <PredictiveAnalytics />}
      
      {activeView === 'overview' && (
        <>
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketingData?.totalLeads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% respecto al mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Calificados</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketingData?.qualifiedLeads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {marketingData?.leadConversionRate.toFixed(1)}% tasa de conversión
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketingData?.totalVisitors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {marketingData?.companyVisitors || 0} empresas identificadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prospectos Calientes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketingData?.hotProspects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Score promedio: {marketingData?.averageLeadScore || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs con diferentes vistas */}
          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList>
              <TabsTrigger value="insights">Insights Rápidos</TabsTrigger>
              <TabsTrigger value="marketing">Marketing Hub</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              <QuickInsights 
                contentStats={{
                  totalBlogPosts: marketingData?.totalBlogPosts || 0,
                  publishedPosts: marketingData?.publishedPosts || 0,
                  averageReadingTime: marketingData?.averageReadingTime || 0,
                  totalViews: marketingData?.totalViews || 0
                }}
                businessStats={{
                  totalLeads: marketingData?.totalLeads || 0,
                  qualifiedLeads: marketingData?.qualifiedLeads || 0,
                  conversionRate: marketingData?.leadConversionRate || 0,
                  revenue: marketingData?.totalRevenue || 0
                }}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance de Email</CardTitle>
                    <CardDescription>Métricas de campañas de email marketing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasa de Apertura</span>
                        <span className="font-medium">{marketingData?.emailOpenRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasa de Click</span>
                        <span className="font-medium">{marketingData?.emailClickRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completitud de Secuencias</span>
                        <span className="font-medium">{marketingData?.sequenceCompletionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contenido Top</CardTitle>
                    <CardDescription>Mejor contenido por conversiones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketingData?.topPerformingContent.slice(0, 3).map((content, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="text-sm truncate">{content}</span>
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Contenido</CardTitle>
                  <CardDescription>Performance del contenido y engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Descargas</span>
                      <span className="font-medium">{marketingData?.downloadCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contenido → Lead Rate</span>
                      <span className="font-medium">{marketingData?.contentToLeadRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tendencias de Conversión</CardTitle>
                    <CardDescription>Análisis de tendencias en el tiempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Gráfico de tendencias (por implementar)
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Leads</CardTitle>
                    <CardDescription>Por fuente y calidad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Gráfico de distribución (por implementar)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

