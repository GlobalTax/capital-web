import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Users, Briefcase, HandshakeIcon } from 'lucide-react';

type Activity = {
  id: string;
  type: 'contact' | 'blog' | 'acquisition' | 'collaboration';
  title: string;
  description: string;
  created_at: string;
};

export const ActivityTimeline = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-timeline'],
    queryFn: async () => {
      // Fetch from multiple tables and combine
      const [contacts, blogs, acquisitions, collaborations] = await Promise.all([
        supabase
          .from('company_valuations')
          .select('id, contact_name, company_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('blog_posts')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('acquisition_leads')
          .select('id, full_name, company, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('collaborator_applications')
          .select('id, full_name, profession, created_at')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const allActivities: Activity[] = [];

      // Process contacts
      contacts.data?.forEach(contact => {
        allActivities.push({
          id: contact.id,
          type: 'contact',
          title: 'Nueva valoración',
          description: `${contact.contact_name} de ${contact.company_name}`,
          created_at: contact.created_at
        });
      });

      // Process blogs
      blogs.data?.forEach(blog => {
        allActivities.push({
          id: blog.id,
          type: 'blog',
          title: 'Nuevo post de blog',
          description: blog.title,
          created_at: blog.created_at
        });
      });

      // Process acquisitions
      acquisitions.data?.forEach(acq => {
        allActivities.push({
          id: acq.id,
          type: 'acquisition',
          title: 'Nueva solicitud de adquisición',
          description: `${acq.full_name} - ${acq.company}`,
          created_at: acq.created_at
        });
      });

      // Process collaborations
      collaborations.data?.forEach(collab => {
        allActivities.push({
          id: collab.id,
          type: 'collaboration',
          title: 'Nueva aplicación de colaborador',
          description: `${collab.full_name} - ${collab.profession}`,
          created_at: collab.created_at
        });
      });

      // Sort by date and limit to 10
      return allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    }
  });

  const getIcon = (type: Activity['type']) => {
    const icons = {
      contact: Users,
      blog: FileText,
      acquisition: Briefcase,
      collaboration: HandshakeIcon
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getIconColor = (type: Activity['type']) => {
    const colors = {
      contact: 'bg-blue-500',
      blog: 'bg-green-500',
      acquisition: 'bg-purple-500',
      collaboration: 'bg-orange-500'
    };
    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        <CardDescription>Últimos eventos en la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`${getIconColor(activity.type)} p-2 rounded-lg text-white flex-shrink-0`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay actividad reciente
          </p>
        )}
      </CardContent>
    </Card>
  );
};
