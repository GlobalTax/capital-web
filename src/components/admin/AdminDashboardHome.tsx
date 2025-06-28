
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Building2, 
  PenTool, 
  Users, 
  TrendingUp, 
  Plus,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
}

const AdminDashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    caseStudies: 0,
    operations: 0,
    blogPosts: 0,
    testimonials: 0,
    teamMembers: 0,
    statistics: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [
        caseStudiesResult,
        operationsResult,
        blogPostsResult,
        testimonialsResult,
        teamMembersResult,
        statisticsResult
      ] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact' }),
        supabase.from('company_operations').select('id', { count: 'exact' }),
        (supabase as any).from('blog_posts').select('id', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact' }),
        supabase.from('key_statistics').select('id', { count: 'exact' })
      ]);

      setStats({
        caseStudies: caseStudiesResult.count || 0,
        operations: operationsResult.count || 0,
        blogPosts: blogPostsResult.count || 0,
        testimonials: testimonialsResult.count || 0,
        teamMembers: teamMembersResult.count || 0,
        statistics: statisticsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
      link: '/admin/case-studies'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      color: 'text-green-600 bg-green-100',
      link: '/admin/operations'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: PenTool,
      color: 'text-purple-600 bg-purple-100',
      link: '/admin/blog'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100',
      link: '/admin/testimonials'
    },
    {
      title: 'Miembros del Equipo',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-100',
      link: '/admin/team'
    },
    {
      title: 'Estadísticas Clave',
      value: stats.statistics,
      icon: BarChart3,
      color: 'text-red-600 bg-red-100',
      link: '/admin/statistics'
    }
  ];

  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Agregar un nuevo caso de éxito',
      icon: FileText,
      link: '/admin/case-studies',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nueva Operación',
      description: 'Registrar una nueva operación',
      icon: Building2,
      link: '/admin/operations',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Nuevo Post del Blog',
      description: 'Crear un nuevo artículo',
      icon: PenTool,
      link: '/admin/blog',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añadir un testimonio de cliente',
      icon: MessageSquare,
      link: '/admin/testimonials',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general del panel de administración</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del panel de administración</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white mb-4 ${action.color} transition-colors`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema inicializado correctamente</p>
                <p className="text-xs text-gray-500">Panel de administración configurado</p>
              </div>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">La actividad reciente aparecerá aquí</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
