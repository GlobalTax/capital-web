import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Lead {
  id: string;
  company_name?: string;
  contact_name?: string;
  full_name?: string;
  email: string;
  created_at: string;
  source: 'valuation' | 'contact' | 'acquisition';
}

interface RealtimeLeadsWidgetProps {
  widget: {
    id: string;
    title: string;
    config: {
      limit?: number;
      showSource?: boolean;
    };
  };
  isEditing?: boolean;
}

export function RealtimeLeadsWidget({ widget, isEditing }: RealtimeLeadsWidgetProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLeadIds, setNewLeadIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const limit = widget.config?.limit || 5;

  useEffect(() => {
    fetchLeads();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime-leads-widget')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_valuations' },
        (payload) => {
          const newLead: Lead = {
            id: payload.new.id,
            company_name: payload.new.company_name,
            contact_name: payload.new.contact_name,
            email: payload.new.email,
            created_at: payload.new.created_at,
            source: 'valuation'
          };
          handleNewLead(newLead);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_leads' },
        (payload) => {
          const newLead: Lead = {
            id: payload.new.id,
            company_name: payload.new.company,
            full_name: payload.new.full_name,
            email: payload.new.email,
            created_at: payload.new.created_at,
            source: 'contact'
          };
          handleNewLead(newLead);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const handleNewLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev.slice(0, limit - 1)]);
    setNewLeadIds(prev => new Set([...prev, newLead.id]));
    
    // Remove highlight after 5 seconds
    setTimeout(() => {
      setNewLeadIds(prev => {
        const next = new Set(prev);
        next.delete(newLead.id);
        return next;
      });
    }, 5000);
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch from company_valuations
      const { data: valuations } = await supabase
        .from('company_valuations')
        .select('id, company_name, contact_name, email, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch from contact_leads
      const { data: contacts } = await supabase
        .from('contact_leads')
        .select('id, company, full_name, email, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and sort
      const allLeads: Lead[] = [
        ...(valuations || []).map(v => ({
          id: v.id,
          company_name: v.company_name,
          contact_name: v.contact_name,
          email: v.email,
          created_at: v.created_at,
          source: 'valuation' as const
        })),
        ...(contacts || []).map(c => ({
          id: c.id,
          company_name: c.company,
          full_name: c.full_name,
          email: c.email,
          created_at: c.created_at,
          source: 'contact' as const
        }))
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      setLeads(allLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceBadge = (source: Lead['source']) => {
    switch (source) {
      case 'valuation':
        return <Badge variant="secondary" className="bg-origin-valuation-bg text-origin-valuation text-xs">Valoración</Badge>;
      case 'contact':
        return <Badge variant="secondary" className="bg-origin-contact-bg text-origin-contact text-xs">Contacto</Badge>;
      case 'acquisition':
        return <Badge variant="secondary" className="bg-origin-acquisition-bg text-origin-acquisition text-xs">Compra</Badge>;
    }
  };

  const handleLeadClick = (lead: Lead) => {
    if (lead.source === 'valuation') {
      navigate(`/admin/valoraciones/${lead.id}`);
    } else if (lead.source === 'contact') {
      navigate(`/admin/leads/contacto/${lead.id}`);
    }
  };

  return (
    <Card className={cn("h-full", isEditing && "ring-2 ring-primary ring-offset-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {widget.title || 'Leads Recientes'}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>En vivo</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No hay leads recientes
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleLeadClick(lead)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                    "hover:bg-muted/50",
                    newLeadIds.has(lead.id) && "bg-green-50 dark:bg-green-950/20 animate-pulse"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {lead.company_name || 'Sin empresa'}
                      </p>
                      {widget.config?.showSource !== false && getSourceBadge(lead.source)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{lead.contact_name || lead.full_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs"
          onClick={() => navigate('/admin/valoraciones')}
        >
          Ver todos los leads
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
