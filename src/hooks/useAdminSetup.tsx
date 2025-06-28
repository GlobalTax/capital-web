
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ensureCurrentUserIsAdmin, debugAdminStatus } from '@/utils/adminSetup';

export const useAdminSetup = () => {
  const [isAdminSetup, setIsAdminSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    setupAdmin();
  }, []);

  const setupAdmin = async () => {
    setIsLoading(true);
    setDebugInfo('Iniciando configuración de admin...');
    
    try {
      console.log('=== INICIANDO DEBUG DE ADMIN ===');
      await debugAdminStatus();
      console.log('=== FIN DEBUG ===');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isAdmin = await ensureCurrentUserIsAdmin();
      
      if (isAdmin) {
        setIsAdminSetup(true);
        setDebugInfo('Éxito: Usuario configurado como administrador');
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido al panel de administración.",
        });
      } else {
        setIsAdminSetup(false);
        setDebugInfo('Error: No se pudo configurar como administrador');
        toast({
          title: "Error de configuración",
          description: "No se pudo configurar el usuario como administrador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error configurando admin:', error);
      setDebugInfo(`Error: ${error}`);
      toast({
        title: "Error",
        description: "Error configurando permisos de administrador.",
        variant: "destructive",
      });
      setIsAdminSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAdminSetup,
    isLoading,
    debugInfo,
    retrySetup: setupAdmin
  };
};
