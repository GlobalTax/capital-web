import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

/**
 * Componente para diagnosticar y monitorear el estado de los contextos en el admin
 */
export const AdminContextChecker: React.FC = () => {
  const [contextStatus, setContextStatus] = useState({
    authContext: false,
    supabaseClient: false,
    reactQuery: false,
    router: false,
  });

  useEffect(() => {
    const checkContexts = () => {
      try {
        // Check Auth Context
        const authAvailable = !!React.useContext;
        
        // Check Supabase Client
        const supabaseAvailable = typeof window !== 'undefined' && 
          !!(window as any).supabase || 
          !!document.querySelector('script[src*="supabase"]');
        
        // Check React Query
        const reactQueryAvailable = typeof window !== 'undefined' && 
          !!(window as any).ReactQuery;
        
        // Check Router
        const routerAvailable = !!window.location;

        setContextStatus({
          authContext: authAvailable,
          supabaseClient: supabaseAvailable,
          reactQuery: reactQueryAvailable,
          router: routerAvailable,
        });
      } catch (error) {
        console.error('Error checking contexts:', error);
      }
    };

    checkContexts();
    
    // Check every 5 seconds
    const interval = setInterval(checkContexts, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const StatusIcon = ({ status }: { status: boolean }) => 
    status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Estado de Contextos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Auth Context</span>
          <div className="flex items-center gap-2">
            <StatusIcon status={contextStatus.authContext} />
            <Badge variant={contextStatus.authContext ? "secondary" : "destructive"}>
              {contextStatus.authContext ? "OK" : "Error"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Supabase Client</span>
          <div className="flex items-center gap-2">
            <StatusIcon status={contextStatus.supabaseClient} />
            <Badge variant={contextStatus.supabaseClient ? "secondary" : "destructive"}>
              {contextStatus.supabaseClient ? "OK" : "Error"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">React Query</span>
          <div className="flex items-center gap-2">
            <StatusIcon status={contextStatus.reactQuery} />
            <Badge variant={contextStatus.reactQuery ? "secondary" : "destructive"}>
              {contextStatus.reactQuery ? "OK" : "Error"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Router</span>
          <div className="flex items-center gap-2">
            <StatusIcon status={contextStatus.router} />
            <Badge variant={contextStatus.router ? "secondary" : "destructive"}>
              {contextStatus.router ? "OK" : "Error"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};