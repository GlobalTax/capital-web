import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  Building2, 
  Users, 
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  caseStudies: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
}

const MinimalistAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    caseStudies: 0,
    blogPosts: 0,
    testimonials: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [caseStudiesRes, blogPostsRes, testimonialsRes, teamRes] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        caseStudies: caseStudiesRes.count || 0,
        blogPosts: blogPostsRes.count || 0,
        testimonials: testimonialsRes.count || 0,
        teamMembers: teamRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo éxito',
      link: '/admin/case-studies',
      icon: Award
    },
    {
      title: 'Nuevo Lead Magnet',
      description: 'Crea un lead magnet',
      link: '/admin/lead-magnets',
      icon: TrendingUp
    },
    {
      title: 'Generar Contenido',
      description: 'IA Content Studio',
      link: '/admin/blog-v2',
      icon: FileText
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añade un testimonio',
      link: '/admin/testimonials',
      icon: MessageSquare
    }
  ];

  const statCards = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: Award,
      link: '/admin/case-studies'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: FileText,
      link: '/admin/blog-v2'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      link: '/admin/testimonials'
    },
    {
      title: 'Equipo',
      value: stats.teamMembers,
      icon: Users,
      link: '/admin/team'
    }
  ];

  if (isLoading) {
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
              {Array.from({ length: 4 }).map((_, i) => (
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
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-light text-foreground tracking-tight">Dashboard</h1>
              <p className="text-lg text-muted-foreground font-light mt-2">
                Panel de administración Capittal
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
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
                          <div className="text-sm text-muted-foreground font-light mt-1">
                            {stat.title}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight">Acciones Rápidas</h2>
              <p className="text-muted-foreground font-light mt-1">
                Comienza rápidamente con las tareas más comunes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link key={action.title} to={action.link} className="group">
                    <Card className="bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <IconComponent className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                              {action.title}
                            </h3>
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

          {/* Recent Activity */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight">Actividad Reciente</h2>
              <p className="text-muted-foreground font-light mt-1">
                Últimas acciones en el sistema
              </p>
            </div>
            
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Sistema inicializado correctamente</p>
                      <p className="text-xs text-muted-foreground mt-1">Panel de administración configurado y listo para usar</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Hace 2 min</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Dashboard rediseñado</p>
                      <p className="text-xs text-muted-foreground mt-1">Interfaz minimalista implementada</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Hace 1 hora</span>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                      Ver toda la actividad
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalistAdminDashboard;