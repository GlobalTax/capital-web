import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Mail, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visión general de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>
              Secciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a 
              href="/admin/blog-v2" 
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="font-medium">Gestión de Blog</div>
              <div className="text-sm text-muted-foreground">
                Crear y editar artículos
              </div>
            </a>
            <a 
              href="/admin/contacts" 
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="font-medium">Contactos</div>
              <div className="text-sm text-muted-foreground">
                Gestión de contactos
              </div>
            </a>
            <a 
              href="/admin/contact-leads" 
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="font-medium">Contact Leads</div>
              <div className="text-sm text-muted-foreground">
                Leads de contacto
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos eventos en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Los eventos de actividad se mostrarán aquí
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
