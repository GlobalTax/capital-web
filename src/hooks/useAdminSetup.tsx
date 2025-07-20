
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ensureCurrentUserIsAdmin, debugAdminStatus } from '@/utils/adminSetup';
import { logger } from '@/utils/logger';

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
      logger.debug('Iniciando configuración de admin', undefined, { context: 'admin', component: 'useAdminSetup' });
      await debugAdminStatus();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isAdmin = await ensureCurrentUserIsAdmin();
      
      if (isAdmin) {
        setIsAdminSetup(true);
        setDebugInfo('Éxito: Usuario configurado como administrador');
        logger.info('Usuario configurado como administrador exitosamente', undefined, { context: 'admin', component: 'useAdminSetup' });
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido al panel de administración.",
        });
      } else {
        setIsAdminSetup(false);
        setDebugInfo('Error: No se pudo configurar como administrador');
        logger.warn('No se pudo configurar como administrador', undefined, { context: 'admin', component: 'useAdminSetup' });
        toast({
          title: "Error de configuración",
          description: "No se pudo configurar el usuario como administrador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Error configurando admin', error as Error, { context: 'admin', component: 'useAdminSetup' });
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
