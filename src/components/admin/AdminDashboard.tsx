
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import TestimonialsManager from './TestimonialsManager';
import { ensureCurrentUserIsAdmin, debugAdminStatus } from '@/utils/adminSetup';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
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
      // Ejecutar debug primero
      await debugAdminStatus();
      
      const isAdmin = await ensureCurrentUserIsAdmin();
      setIsAdminSetup(isAdmin);
      
      if (!isAdmin) {
        setDebugInfo('Error: No se pudo configurar como administrador');
        toast({
          title: "Error de configuración",
          description: "No se pudo configurar el usuario como administrador. Revisa la consola para más detalles.",
          variant: "destructive",
        });
      } else {
        setDebugInfo('Éxito: Usuario configurado como administrador');
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido al panel de administración.",
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-0.5 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Configurando permisos...</p>
          <p className="text-xs text-gray-500">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (!isAdminSetup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-black mb-4">Error de Permisos</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron configurar los permisos de administrador.
          </p>
          <div className="bg-gray-50 border-0.5 border-black rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 font-mono">{debugInfo}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Revisa la consola del navegador (F12) para más información técnica.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={setupAdmin} 
              className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Reintentar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b-0.5 border-black shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">Panel de Administración - Capittal</h1>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="case-studies" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white border-0.5 border-black rounded-lg">
            <TabsTrigger value="case-studies" className="rounded-lg">Casos de Éxito</TabsTrigger>
            <TabsTrigger value="operations" className="rounded-lg">Operaciones</TabsTrigger>
            <TabsTrigger value="multiples" className="rounded-lg">Múltiplos</TabsTrigger>
            <TabsTrigger value="statistics" className="rounded-lg">Estadísticas</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-lg">Testimonios</TabsTrigger>
          </TabsList>

          <TabsContent value="case-studies" className="space-y-6">
            <CaseStudiesManager />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <OperationsManager />
          </TabsContent>

          <TabsContent value="multiples" className="space-y-6">
            <MultiplesManager />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <StatisticsManager />
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <TestimonialsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
