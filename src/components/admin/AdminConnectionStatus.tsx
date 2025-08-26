// ============= ADMIN CONNECTION STATUS COMPONENT =============
// Diagnostic component to show connection status and service health

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'slow' | 'checking';
  responseTime?: number;
  error?: string;
}

export const AdminConnectionStatus = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', status: 'checking' },
    { name: 'Authentication', status: 'checking' },
    { name: 'Edge Functions', status: 'checking' },
    { name: 'Admin Queries', status: 'checking' },
  ]);

  const checkDatabaseConnection = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const { error } = await supabase.from('admin_users').select('count').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return { name: 'Database', status: 'offline', error: error.message, responseTime };
      }
      
      return { 
        name: 'Database', 
        status: responseTime > 2000 ? 'slow' : 'online', 
        responseTime 
      };
    } catch (error: any) {
      return { 
        name: 'Database', 
        status: 'offline', 
        error: error.message, 
        responseTime: Date.now() - startTime 
      };
    }
  };

  const checkAuthStatus = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      const { data } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;
      
      return { 
        name: 'Authentication', 
        status: data.session ? 'online' : 'offline', 
        responseTime 
      };
    } catch (error: any) {
      return { 
        name: 'Authentication', 
        status: 'offline', 
        error: error.message, 
        responseTime: Date.now() - startTime 
      };
    }
  };

  const checkEdgeFunctions = async (): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      // Simple ping to secure-tracking function
      const { error } = await supabase.functions.invoke('secure-tracking', {
        body: { test: true }
      });
      const responseTime = Date.now() - startTime;
      
      return { 
        name: 'Edge Functions', 
        status: responseTime > 3000 ? 'slow' : 'online', 
        responseTime,
        error: error?.message 
      };
    } catch (error: any) {
      return { 
        name: 'Edge Functions', 
        status: 'offline', 
        error: error.message, 
        responseTime: Date.now() - startTime 
      };
    }
  };

  const checkAdminQueries = async (): Promise<ServiceStatus> => {
    if (!user?.id) {
      return { name: 'Admin Queries', status: 'offline', error: 'No user ID' };
    }

    const startTime = Date.now();
    try {
      const { error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const responseTime = Date.now() - startTime;
      
      return { 
        name: 'Admin Queries', 
        status: responseTime > 2000 ? 'slow' : 'online', 
        responseTime,
        error: error?.message 
      };
    } catch (error: any) {
      return { 
        name: 'Admin Queries', 
        status: 'offline', 
        error: error.message, 
        responseTime: Date.now() - startTime 
      };
    }
  };

  const runDiagnostics = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })));

    const checks = [
      checkDatabaseConnection(),
      checkAuthStatus(),
      checkEdgeFunctions(),
      checkAdminQueries(),
    ];

    const results = await Promise.allSettled(checks);
    
    setServices(results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: ['Database', 'Authentication', 'Edge Functions', 'Admin Queries'][index],
          status: 'offline' as const,
          error: result.reason?.message || 'Unknown error'
        };
      }
    }));
  };

  useEffect(() => {
    runDiagnostics();
  }, [user?.id]);

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      online: 'default',
      slow: 'secondary',
      offline: 'destructive',
      checking: 'outline'
    } as const;

    const labels = {
      online: 'Online',
      slow: 'Slow',
      offline: 'Offline',
      checking: 'Checking...'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const overallStatus = services.every(s => s.status === 'online') ? 'healthy' :
                      services.some(s => s.status === 'offline') ? 'degraded' : 'slow';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Connection Status
          <Badge variant={overallStatus === 'healthy' ? 'default' : 'destructive'}>
            {overallStatus === 'healthy' ? 'Healthy' : 'Issues Detected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{service.name}</h4>
              {service.responseTime && (
                <p className="text-sm text-muted-foreground">
                  Response time: {service.responseTime}ms
                </p>
              )}
              {service.error && (
                <p className="text-sm text-destructive">{service.error}</p>
              )}
            </div>
            {getStatusBadge(service.status)}
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            Run Diagnostics
          </Button>
          
          {overallStatus !== 'healthy' && (
            <div className="text-sm text-muted-foreground">
              Some services are experiencing issues. Try refreshing or check back later.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};