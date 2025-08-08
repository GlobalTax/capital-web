// ============= ENHANCED NOTIFICATION SYSTEM =============
// Sistema de notificaciones mejorado con persistencia y categorización

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { devLogger } from '@/utils/devLogger';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationCategory = 'system' | 'security' | 'business' | 'social' | 'marketing';

export interface EnhancedNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  handler: () => void;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  priorities: Record<NotificationPriority, boolean>;
  sound: boolean;
  desktop: boolean;
  maxNotifications: number;
}

interface NotificationContextType {
  notifications: EnhancedNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  categories: {
    system: true,
    security: true,
    business: true,
    social: true,
    marketing: false
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    critical: true
  },
  sound: true,
  desktop: false,
  maxNotifications: 50
};

export const EnhancedNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // Cargar configuración y notificaciones persistentes del localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notification-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedNotifications = localStorage.getItem('persistent-notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        const restored = parsed
          .map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
          }))
          .filter((n: EnhancedNotification) => 
            !n.expiresAt || n.expiresAt > new Date()
          );
        setNotifications(restored);
      }
    } catch (error) {
      devLogger.error('Failed to load notification data', error as Error, 'notifications');
    }
  }, []);

  // Persistir notificaciones importantes
  const persistNotifications = useCallback((notifications: EnhancedNotification[]) => {
    try {
      const persistent = notifications.filter(n => n.persistent);
      localStorage.setItem('persistent-notifications', JSON.stringify(persistent));
    } catch (error) {
      devLogger.warn('Failed to persist notifications', { error }, 'notifications');
    }
  }, []);

  // Limpiar notificaciones expiradas
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const now = new Date();
        const active = prev.filter(n => !n.expiresAt || n.expiresAt > now);
        if (active.length !== prev.length) {
          persistNotifications(active);
        }
        return active;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [persistNotifications]);

  const addNotification = useCallback((notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!settings.enabled) return;
    if (!settings.categories[notification.category]) return;
    if (!settings.priorities[notification.priority]) return;

    const newNotification: EnhancedNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, settings.maxNotifications);
      persistNotifications(updated);
      return updated;
    });

    // Efectos sonoros y desktop
    if (settings.sound && notification.priority !== 'low') {
      playNotificationSound(notification.priority);
    }

    if (settings.desktop && notification.priority === 'critical') {
      requestDesktopNotification(newNotification);
    }

    devLogger.info('Notification added', { 
      category: notification.category, 
      priority: notification.priority 
    }, 'notifications');
  }, [settings, persistNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('persistent-notifications');
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notification-settings', JSON.stringify(updated));
  }, [settings]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useEnhancedNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotifications must be used within EnhancedNotificationProvider');
  }
  return context;
};

// Componente principal de notificaciones
export const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings
  } = useEnhancedNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'system': return Info;
      case 'security': return AlertTriangle;
      case 'business': return CheckCircle;
      case 'social': return Bell;
      case 'marketing': return Bell;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  if (showSettings) {
    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configuración de Notificaciones</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled">Habilitar notificaciones</Label>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Categorías</h4>
            {Object.entries(settings.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <Label className="text-sm capitalize">{category}</Label>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({
                      categories: { ...settings.categories, [category]: checked }
                    })
                  }
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sonido</Label>
            <Switch
              id="sound-enabled"
              checked={settings.sound}
              onCheckedChange={(sound) => updateSettings({ sound })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="desktop-enabled">Notificaciones de escritorio</Label>
            <Switch
              id="desktop-enabled"
              checked={settings.desktop}
              onCheckedChange={(desktop) => updateSettings({ desktop })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{unreadCount} sin leer</span>
                <Button variant="link" size="sm" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.category);
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        !notification.read 
                          ? 'bg-muted/50 border-primary/20' 
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read && "text-primary"
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.actions && (
                            <div className="flex gap-2 mt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={action.type === 'primary' ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.handler();
                                    removeNotification(notification.id);
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {notifications.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="w-full"
                    >
                      Limpiar todas
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Utilidades auxiliares
function playNotificationSound(priority: NotificationPriority) {
  // Implementar sonidos según prioridad
  if (typeof Audio !== 'undefined') {
    const audio = new Audio();
    audio.volume = 0.3;
    
    switch (priority) {
      case 'critical':
        // audio.src = '/sounds/critical.mp3';
        break;
      case 'high':
        // audio.src = '/sounds/high.mp3';
        break;
      default:
        // audio.src = '/sounds/default.mp3';
        break;
    }
    
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });
  }
}

function requestDesktopNotification(notification: EnhancedNotification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id
    });
  } else if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}