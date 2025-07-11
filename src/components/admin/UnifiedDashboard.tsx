import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  Building2, 
  Users, 
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Target,
  Download,
  Star,
  Mail,
  BarChart3,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMarketingHub } from '@/hooks/useMarketingHub';
import MarketingHubKPIs from './hub/MarketingHubKPIs';
import DashboardDateFilter from './dashboard/DashboardDateFilter';
import DashboardNotifications from './dashboard/DashboardNotifications';
import DashboardExportMenu from './dashboard/DashboardExportMenu';
import QuickInsights from './dashboard/QuickInsights';

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

const UnifiedDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    caseStudies: 0,
    blogPosts: 0,
    testimonials: 0,
    teamMembers: 0,
    contactLeads: 0,
    companyValuations: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
    to: new Date()
  });

  const {
    marketingMetrics,
    isLoadingMetrics
  } = useMarketingHub();

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const [caseStudiesRes, blogPostsRes, testimonialsRes, teamRes, leadsRes, valuationsRes] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase
          .from('contact_leads')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString()),
        supabase
          .from('company_valuations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
      ]);

      setStats({
        caseStudies: caseStudiesRes.count || 0,
        blogPosts: blogPostsRes.count || 0,
        testimonials: testimonialsRes.count || 0,
        teamMembers: teamRes.count || 0,
        contactLeads: leadsRes.count || 0,
        companyValuations: valuationsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Simular notificaciones por ahora - esto se conectaría a lead_alerts
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'hot_lead',
          title: 'Nuevo Lead Caliente',
          message: 'Empresa con score 85+ requiere atención inmediata',
          priority: 'high',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false
        },
        {
          id: '2',
          type: 'new_valuation',
          title: 'Nueva Valoración',
          message: 'Valoración completada para TechCorp SL',
          priority: 'medium',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isRead: false
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo éxito',
      link: '/admin/case-studies',
      icon: Award,
      badge: 'Contenido'
    },
    {
      title: 'Marketing Hub',
      description: 'Dashboard avanzado',
      link: '/admin/marketing-hub',
      icon: BarChart3,
      badge: 'Analytics'
    },
    {
      title: 'Generar Contenido',
      description: 'IA Content Studio',
      link: '/admin/blog-v2',
      icon: FileText,
      badge: 'AI'
    },
    {
      title: 'Leads & CRM',
      description: 'Gestión de leads',
      link: '/admin/leads',
      icon: Target,
      badge: 'CRM'
    }
  ];

  const contentStats = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: Award,
      link: '/admin/case-studies',
      change: '+5.2%'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: FileText,
      link: '/admin/blog-v2',
      change: '+12.3%'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      link: '/admin/testimonials',
      change: '+8.1%'
    },
    {
      title: 'Equipo',
      value: stats.teamMembers,
      icon: Users,
      link: '/admin/team',
      change: '0%'
    }
  ];

  const businessStats = [
    {
      title: 'Nuevos Leads',
      value: stats.contactLeads,
      icon: Target,
      link: '/admin/leads',
      change: '+18.5%'
    },
    {
      title: 'Valoraciones',
      value: stats.companyValuations,
      icon: Building2,
      link: '/admin/company-valuations',
      change: '+25.3%'
    }
  ];

  if (isLoading || isLoadingMetrics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-3">
              <div className="h-10 bg-muted animate-pulse rounded w-96"></div>
              <div className="h-5 bg-muted animate-pulse rounded w-[500px]"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="space-y-3">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded w-12"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="space-y-8">
          {/* Header con controles */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-light text-foreground tracking-tight">Dashboard Unificado</h1>
              <p className="text-lg text-muted-foreground font-light">
                Visión completa de marketing, contenido y negocio
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <DashboardDateFilter 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
              <DashboardNotifications 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
              />
              <DashboardExportMenu />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Vista Rápida de KPIs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">Vista Rápida</h2>
              <Link to="/admin/marketing-hub">
                <Button variant="ghost" size="sm">
                  Ver dashboard completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            {marketingMetrics && (
              <MarketingHubKPIs metrics={marketingMetrics} />
            )}
          </div>

          {/* Tabs para organizar contenido */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="business">Negocio</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-xl font-light text-foreground">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <Link key={action.title} to={action.link} className="group">
                        <Card className="bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <IconComponent className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Badge variant="secondary" className="text-xs">
                                  {action.badge}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                  {action.title}
                                </h4>
                                <p className="text-sm text-muted-foreground font-light">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contentStats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <Link key={stat.title} to={stat.link} className="group">
                      <Card className="bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                            <div>
                              <div className="text-3xl font-light text-foreground">
                                {stat.value}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground font-light mt-1">
                                  {stat.title}
                                </div>
                                <span className="text-xs text-green-600 font-medium">
                                  {stat.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businessStats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <Link key={stat.title} to={stat.link} className="group">
                      <Card className="bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                            <div>
                              <div className="text-4xl font-light text-foreground">
                                {stat.value}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground font-light mt-1">
                                  {stat.title}
                                </div>
                                <span className="text-xs text-green-600 font-medium">
                                  {stat.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <QuickInsights 
                marketingMetrics={marketingMetrics}
                contentStats={contentStats}
                businessStats={businessStats}
                dateRange={dateRange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;