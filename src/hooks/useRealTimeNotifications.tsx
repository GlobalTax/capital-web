import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealTimeNotification {
  id: string;
  type: 'hot_lead' | 'new_valuation' | 'content_performance' | 'system_alert' | 'export_complete';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

interface UseRealTimeNotificationsReturn {
  notifications: RealTimeNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<RealTimeNotification, 'id' | 'timestamp'>) => void;
  isConnected: boolean;
}

export function useRealTimeNotifications(): UseRealTimeNotificationsReturn {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Generar ID único para notificaciones
  const generateId = useCallback(() => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Cargar notificaciones iniciales
  const loadInitialNotifications = useCallback(async () => {
    try {
      // Cargar alertas de leads recientes
      const { data: leadAlerts } = await supabase
        .from('lead_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Convertir alerts a notificaciones
      const alertNotifications: RealTimeNotification[] = (leadAlerts || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type as any,
        title: getAlertTitle(alert.alert_type),
        message: alert.message,
        priority: alert.priority as any,
        timestamp: new Date(alert.created_at),
        isRead: alert.is_read,
        data: alert
      }));

      // Agregar notificaciones mock para demo
      const mockNotifications: RealTimeNotification[] = [
        {
          id: generateId(),
          type: 'content_performance',
          title: 'Contenido Viral',
          message: 'Tu artículo "Tendencias M&A 2024" ha superado 1,000 visualizaciones',
          priority: 'medium',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isRead: false,
          actions: [
            {
              label: 'Ver Métricas',
              action: () => window.location.href = '/admin/content-performance',
              variant: 'default'
            }
          ]
        },
        {
          id: generateId(),
          type: 'system_alert',
          title: 'Backup Completado',
          message: 'El backup diario se ha completado exitosamente',
          priority: 'low',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true
        }
      ];

      const allNotifications = [...alertNotifications, ...mockNotifications];
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);

    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [generateId]);

  // Configurar subscripciones en tiempo real
  useEffect(() => {
    loadInitialNotifications();

    // Canal principal para notificaciones del dashboard
    const dashboardChannel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'lead_alerts' },
        (payload) => handleNewLeadAlert(payload.new)
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_valuations' },
        (payload) => handleNewValuation(payload.new)
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_leads' },
        (payload) => handleNewLead(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blog_post_metrics' },
        (payload) => handleContentUpdate(payload.new)
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado a notificaciones en tiempo real');
        }
      });

    // Canal para eventos personalizados
    const customChannel = supabase
      .channel('custom-notifications')
      .on('broadcast', { event: 'export_complete' }, (payload) => {
        handleExportComplete(payload);
      })
      .on('broadcast', { event: 'system_alert' }, (payload) => {
        handleSystemAlert(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardChannel);
      supabase.removeChannel(customChannel);
    };
  }, [loadInitialNotifications]);

  // Handlers para diferentes tipos de eventos
  const handleNewLeadAlert = useCallback((alertData: any) => {
    const notification: RealTimeNotification = {
      id: alertData.id,
      type: alertData.alert_type,
      title: getAlertTitle(alertData.alert_type),
      message: alertData.message,
      priority: alertData.priority,
      timestamp: new Date(alertData.created_at),
      isRead: false,
      data: alertData,
      actions: [
        {
          label: 'Ver Lead',
          action: () => window.location.href = `/admin/leads/${alertData.lead_score_id}`,
          variant: 'default'
        }
      ]
    };

    addNotificationToState(notification);
    showToastNotification(notification);
  }, []);

  const handleNewValuation = useCallback((valuationData: any) => {
    const notification: RealTimeNotification = {
      id: generateId(),
      type: 'new_valuation',
      title: 'Nueva Valoración Completada',
      message: `${valuationData.company_name} - Valoración de ${valuationData.industry}`,
      priority: 'medium',
      timestamp: new Date(valuationData.created_at),
      isRead: false,
      data: valuationData,
      actions: [
        {
          label: 'Ver Detalles',
          action: () => window.location.href = `/admin/valuations/${valuationData.id}`,
          variant: 'default'
        }
      ]
    };

    addNotificationToState(notification);
    showToastNotification(notification);
  }, [generateId]);

  const handleNewLead = useCallback((leadData: any) => {
    // Solo notificar leads de alta prioridad
    if (leadData.status === 'hot' || leadData.referral) {
      const notification: RealTimeNotification = {
        id: generateId(),
        type: 'hot_lead',
        title: 'Nuevo Lead Prioritario',
        message: `${leadData.full_name} de ${leadData.company} requiere atención`,
        priority: 'high',
        timestamp: new Date(leadData.created_at),
        isRead: false,
        data: leadData,
        actions: [
          {
            label: 'Contactar',
            action: () => window.location.href = `/admin/leads/${leadData.id}`,
            variant: 'default'
          }
        ]
      };

      addNotificationToState(notification);
      showToastNotification(notification);
    }
  }, [generateId]);

  const handleContentUpdate = useCallback((metricData: any) => {
    // Solo notificar cuando el contenido alcance hitos importantes
    if (metricData.total_views % 1000 === 0 && metricData.total_views > 0) {
      const notification: RealTimeNotification = {
        id: generateId(),
        type: 'content_performance',
        title: 'Hito de Contenido Alcanzado',
        message: `Un post ha alcanzado ${metricData.total_views.toLocaleString()} visualizaciones`,
        priority: 'low',
        timestamp: new Date(),
        isRead: false,
        data: metricData
      };

      addNotificationToState(notification);
    }
  }, [generateId]);

  const handleExportComplete = useCallback((payload: any) => {
    const notification: RealTimeNotification = {
      id: generateId(),
      type: 'export_complete',
      title: '📄 Exportación Completada',
      message: `Tu reporte ${payload.reportType} está listo para descargar`,
      priority: 'medium',
      timestamp: new Date(),
      isRead: false,
      data: payload,
      actions: [
        {
          label: 'Descargar',
          action: () => window.open(payload.downloadUrl, '_blank'),
          variant: 'default'
        }
      ]
    };

    addNotificationToState(notification);
    showToastNotification(notification);
  }, [generateId]);

  const handleSystemAlert = useCallback((payload: any) => {
    const notification: RealTimeNotification = {
      id: generateId(),
      type: 'system_alert',
      title: payload.title || 'Alerta del Sistema',
      message: payload.message,
      priority: payload.priority || 'medium',
      timestamp: new Date(),
      isRead: false,
      data: payload
    };

    addNotificationToState(notification);
    if (payload.priority === 'high') {
      showToastNotification(notification);
    }
  }, [generateId]);

  // Helpers
  const addNotificationToState = useCallback((notification: RealTimeNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener solo 50 notificaciones
    setUnreadCount(prev => prev + 1);
  }, []);

  const showToastNotification = useCallback((notification: RealTimeNotification) => {
    toast({
      title: notification.title,
      description: notification.message,
      duration: notification.priority === 'high' ? 10000 : 5000,
    });
  }, [toast]);

  const getAlertTitle = (alertType: string): string => {
    switch (alertType) {
      case 'hot_lead':
        return '🔥 Lead Caliente Detectado';
      case 'new_valuation':
        return '💼 Nueva Valoración';
      case 'content_performance':
        return '📈 Rendimiento de Contenido';
      case 'system_alert':
        return '⚠️ Alerta del Sistema';
      default:
        return '📢 Nueva Notificación';
    }
  };

  // API pública
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Actualizar en base de datos si es una alerta real
    const notification = notifications.find(n => n.id === id);
    if (notification?.type === 'hot_lead' && notification.data?.id) {
      supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .eq('id', notification.data.id)
        .then(({ error }) => {
          if (error) console.error('Error updating alert:', error);
        });
    }
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const addNotification = useCallback((notification: Omit<RealTimeNotification, 'id' | 'timestamp'>) => {
    const fullNotification: RealTimeNotification = {
      ...notification,
      id: generateId(),
      timestamp: new Date()
    };
    addNotificationToState(fullNotification);
  }, [generateId, addNotificationToState]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    addNotification,
    isConnected
  };
}