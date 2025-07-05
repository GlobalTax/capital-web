import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string | null;
  downlink: number | null;
  effectiveType: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: null,
    downlink: null,
    effectiveType: null
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      setNetworkStatus(prev => ({
        ...prev,
        connectionType: connection?.type || null,
        downlink: connection?.downlink || null,
        effectiveType: connection?.effectiveType || null
      }));
    };

    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      updateConnectionInfo();
      
      toast({
        title: "Conexión restablecida",
        description: "Ya tienes conexión a internet nuevamente.",
        variant: "default"
      });
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }));
      
      toast({
        title: "Sin conexión",
        description: "Parece que no tienes conexión a internet.",
        variant: "destructive"
      });
    };

    const handleConnectionChange = () => {
      updateConnectionInfo();
    };

    // Establecer estado inicial
    updateConnectionInfo();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [toast]);

  return networkStatus;
};

export default useNetworkStatus;