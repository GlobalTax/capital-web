
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedLeadScoring } from './useAdvancedLeadScoring';
import { logger } from '@/utils/logger';
import { NetworkError, DatabaseError } from '@/types/errorTypes';

interface RealTimeLeadUpdate {
  type: 'new_lead' | 'hot_lead' | 'score_update' | 'conversion';
  leadData: any;
  timestamp: string;
}

export const useRealTimeLeads = () => {
  const [recentUpdates, setRecentUpdates] = useState<RealTimeLeadUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { hotLeads, allLeads } = useAdvancedLeadScoring();

  // Función para mostrar notificaciones push
  const showLeadNotification = useCallback((update: RealTimeLeadUpdate) => {
    if (update.type === 'hot_lead') {
      toast({
        title: "🔥 ¡LEAD CALIENTE DETECTADO!",
        description: `${update.leadData.company_name || update.leadData.company_domain} - Score: ${update.leadData.total_score}`,
        duration: 10000,
      });
      
      // Sonido de notificación (opcional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Lead Caliente - Capittal', {
          body: `${update.leadData.company_name || update.leadData.company_domain} requiere atención inmediata`,
          icon: '/favicon.ico',
          tag: 'hot-lead'
        });
      }
    }
  }, [toast]);

  // Flag para deshabilitar real-time temporalmente
  const REALTIME_ENABLED = false;

  // Configurar realtime subscription (temporalmente deshabilitado)
  useEffect(() => {
    if (!REALTIME_ENABLED) {
      logger.info('Real-time connections disabled for stability', {}, { 
        context: 'system', 
        component: 'useRealTimeLeads' 
      });
      setIsConnected(false);
      return;
    }

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_scores'
        },
        (payload) => {
          logger.info('New lead detected via realtime', {
            leadId: payload.new?.id,
            companyDomain: payload.new?.company_domain,
            score: payload.new?.total_score
          }, { context: 'marketing', component: 'useRealTimeLeads' });
          
          const newUpdate: RealTimeLeadUpdate = {
            type: 'new_lead',
            leadData: payload.new,
            timestamp: new Date().toISOString()
          };
          
          setRecentUpdates(prev => [newUpdate, ...prev.slice(0, 19)]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lead_scores'
        },
        (payload) => {
          const isNowHot = payload.new.is_hot_lead && !payload.old.is_hot_lead;
          
          logger.info('Lead score updated via realtime', {
            leadId: payload.new?.id,
            companyDomain: payload.new?.company_domain,
            oldScore: payload.old?.total_score,
            newScore: payload.new?.total_score,
            becameHot: isNowHot
          }, { context: 'marketing', component: 'useRealTimeLeads' });
          
          const updateType = isNowHot ? 'hot_lead' : 'score_update';
          const newUpdate: RealTimeLeadUpdate = {
            type: updateType,
            leadData: payload.new,
            timestamp: new Date().toISOString()
          };
          
          setRecentUpdates(prev => [newUpdate, ...prev.slice(0, 19)]);
          
          if (isNowHot) {
            showLeadNotification(newUpdate);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_alerts'
        },
        (payload) => {
          logger.info('New lead alert created', {
            alertId: payload.new?.id,
            priority: payload.new?.priority,
            alertType: payload.new?.alert_type
          }, { context: 'marketing', component: 'useRealTimeLeads' });
          
          if (payload.new.priority === 'high' || payload.new.priority === 'critical') {
            toast({
              title: "🚨 ALERTA DE LEAD",
              description: payload.new.message,
              duration: 8000,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe((status) => {
        logger.debug('Realtime connection status changed', { status }, { 
          context: 'system', 
          component: 'useRealTimeLeads' 
        });
        
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          logger.error('Realtime channel error detected', new NetworkError('Realtime connection failed'), {
            context: 'system',
            component: 'useRealTimeLeads'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showLeadNotification, toast]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const clearUpdates = useCallback(() => {
    setRecentUpdates([]);
  }, []);

  const getLeadsPriority = useCallback(() => {
    if (!hotLeads) return [];
    
    return hotLeads
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 10)
      .map(lead => ({
        ...lead,
        priority: lead.total_score >= 90 ? 'critical' : 'high',
        timeAgo: Math.floor((Date.now() - new Date(lead.last_activity).getTime()) / (1000 * 60))
      }));
  }, [hotLeads]);

  return {
    recentUpdates,
    isConnected,
    clearUpdates,
    getLeadsPriority,
    totalHotLeads: hotLeads?.length || 0,
    totalLeads: allLeads?.length || 0,
  };
};
