import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'lead' | 'booking' | 'valuation' | 'system' | 'alert';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Mock notifications for now until table is created
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'demo',
    type: 'lead',
    title: 'Nuevo lead recibido',
    message: 'Juan García de Tecnología ABC ha solicitado una valoración',
    link: '/admin/leads-pipeline',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo',
    type: 'booking',
    title: 'Nueva reserva de llamada',
    message: 'María López ha reservado una llamada para mañana a las 10:00',
    link: '/admin/bookings',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    user_id: 'demo',
    type: 'valuation',
    title: 'Valoración completada',
    message: 'Se ha completado la valoración de Distribuidora Norte SL',
    link: '/admin/valuation-analytics',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export function useRealtimeNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(mockNotifications.filter(n => !n.is_read).length);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const refetch = useCallback(() => {
    // Will be implemented when table exists
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  };
}
