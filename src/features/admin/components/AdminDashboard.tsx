import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Mail, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecentContacts } from './dashboard/RecentContacts';
import { RecentBlogPosts } from './dashboard/RecentBlogPosts';
import { RecentAcquisitions } from './dashboard/RecentAcquisitions';
import { RecentCollaborations } from './dashboard/RecentCollaborations';
import { ActivityTimeline } from './dashboard/ActivityTimeline';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HighlightsSidebar } from './dashboard/DashboardHighlights';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Queries simples para métricas básicas
  const { data: leadsCount } = useQuery({
    queryKey: ['admin-leads-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('acquisition_leads')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: blogPostsCount } = useQuery({
    queryKey: ['admin-blog-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: contactsCount } = useQuery({
    queryKey: ['admin-contacts-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: valuationsCount } = useQuery({
    queryKey: ['admin-valuations-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('company_valuations')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const stats = [
    {
      title: 'Total Leads',
      value: leadsCount || 0,
      icon: Users,
      description: 'Leads capturados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Posts de Blog',
      value: blogPostsCount || 0,
      icon: FileText,
      description: 'Artículos publicados',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Contact Leads',
      value: contactsCount || 0,
      icon: Mail,
      description: 'Leads de contacto',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Valoraciones',
      value: valuationsCount || 0,
      icon: BarChart3,
      description: 'Valoraciones completadas',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
      {/* Contenido principal */}
      <div className="flex-1 space-y-4 md:space-y-6 lg:space-y-8 min-w-0">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-normal">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Visión general de la plataforma
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="w-full shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-1 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-normal truncate pr-2">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-1.5 md:p-2 rounded-lg shrink-0`}>
                    <Icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-normal">{stat.value}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sección superior - 2 columnas en desktop, 1 en mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RecentContacts />
          <RecentBlogPosts />
        </div>

        {/* Centro de Ayuda - Marketplace */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Centro de Ayuda - Marketplace
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Aprende a publicar y gestionar operaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <Button 
              onClick={() => navigate('/admin/operations')}
              className="bg-primary hover:bg-primary/90 text-sm"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Guía
            </Button>
          </CardContent>
        </Card>

        {/* Sección media - 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RecentAcquisitions />
          <RecentCollaborations />
        </div>

        {/* Timeline de actividad - ancho completo */}
        <div className="mt-4 md:mt-6">
          <ActivityTimeline />
        </div>
      </div>

      {/* Barra lateral de destacados - hidden on mobile, sticky on desktop */}
      <div className="hidden xl:block">
        <HighlightsSidebar />
      </div>
    </div>
  );
};
