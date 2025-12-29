import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Calculator, 
  Calendar, 
  MessageSquare, 
  UserPlus,
  FileText,
  Clock,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActivityItem {
  id: string;
  type: 'valuation' | 'contact' | 'booking' | 'blog' | 'collaborator';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityStreamWidgetProps {
  widget: {
    id: string;
    title: string;
    config: {
      limit?: number;
      types?: string[];
    };
  };
  isEditing?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  valuation: <Calculator className="h-4 w-4 text-blue-500" />,
  contact: <MessageSquare className="h-4 w-4 text-green-500" />,
  booking: <Calendar className="h-4 w-4 text-purple-500" />,
  blog: <FileText className="h-4 w-4 text-orange-500" />,
  collaborator: <UserPlus className="h-4 w-4 text-pink-500" />,
};

const activityLabels: Record<string, string> = {
  valuation: 'Valoración',
  contact: 'Contacto',
  booking: 'Reserva',
  blog: 'Blog',
  collaborator: 'Colaborador',
};

export function ActivityStreamWidget({ widget, isEditing }: ActivityStreamWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Set<string>>(new Set(['valuation', 'contact', 'booking']));
  const limit = widget.config?.limit || 10;

  useEffect(() => {
    fetchActivities();
    
    // Set up realtime subscriptions
    const channel = supabase
      .channel('activity-stream-widget')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_valuations' },
        (payload) => {
          if (filter.has('valuation')) {
            const activity: ActivityItem = {
              id: `val-${payload.new.id}`,
              type: 'valuation',
              title: 'Nueva valoración',
              description: `${payload.new.company_name} - ${payload.new.contact_name}`,
              timestamp: payload.new.created_at,
            };
            addActivity(activity);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_leads' },
        (payload) => {
          if (filter.has('contact')) {
            const activity: ActivityItem = {
              id: `contact-${payload.new.id}`,
              type: 'contact',
              title: 'Nuevo contacto',
              description: `${payload.new.full_name} de ${payload.new.company}`,
              timestamp: payload.new.created_at,
            };
            addActivity(activity);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calendar_bookings' },
        (payload) => {
          if (filter.has('booking')) {
            const activity: ActivityItem = {
              id: `booking-${payload.new.id}`,
              type: 'booking',
              title: 'Nueva reserva',
              description: `${payload.new.client_name} - ${payload.new.meeting_type}`,
              timestamp: payload.new.created_at,
            };
            addActivity(activity);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, limit]);

  const addActivity = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev.slice(0, limit - 1)]);
  };

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const allActivities: ActivityItem[] = [];

      if (filter.has('valuation')) {
        const { data: valuations } = await supabase
          .from('company_valuations')
          .select('id, company_name, contact_name, created_at')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (valuations) {
          allActivities.push(...valuations.map(v => ({
            id: `val-${v.id}`,
            type: 'valuation' as const,
            title: 'Nueva valoración',
            description: `${v.company_name} - ${v.contact_name}`,
            timestamp: v.created_at,
          })));
        }
      }

      if (filter.has('contact')) {
        const { data: contacts } = await supabase
          .from('contact_leads')
          .select('id, full_name, company, created_at')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (contacts) {
          allActivities.push(...contacts.map(c => ({
            id: `contact-${c.id}`,
            type: 'contact' as const,
            title: 'Nuevo contacto',
            description: `${c.full_name} de ${c.company}`,
            timestamp: c.created_at,
          })));
        }
      }

      if (filter.has('booking')) {
        const { data: bookings } = await supabase
          .from('calendar_bookings')
          .select('id, client_name, meeting_type, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (bookings) {
          allActivities.push(...bookings.map(b => ({
            id: `booking-${b.id}`,
            type: 'booking' as const,
            title: 'Nueva reserva',
            description: `${b.client_name} - ${b.meeting_type}`,
            timestamp: b.created_at,
          })));
        }
      }

      // Sort by timestamp and limit
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, limit));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (type: string) => {
    setFilter(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <Card className={cn("h-full", isEditing && "ring-2 ring-primary ring-offset-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            {widget.title || 'Actividad Reciente'}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Filter className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(activityLabels).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filter.has(key)}
                  onCheckedChange={() => toggleFilter(key)}
                >
                  <span className="flex items-center gap-2">
                    {activityIcons[key]}
                    {label}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No hay actividad reciente
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {activityLabels[activity.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
