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

export const AdminDashboard = () => {
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
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visión general de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-start">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="w-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sección superior - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContacts />
        <RecentBlogPosts />
      </div>

      {/* Sección media - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAcquisitions />
        <RecentCollaborations />
      </div>

      {/* Timeline de actividad - ancho completo */}
      <div className="mt-6">
        <ActivityTimeline />
      </div>
    </div>
  );
};
