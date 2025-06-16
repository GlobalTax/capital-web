
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
import { ensureCurrentUserIsAdmin } from '@/utils/adminSetup';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [isAdminSetup, setIsAdminSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setupAdmin();
  }, []);

  const setupAdmin = async () => {
    setIsLoading(true);
    try {
      const isAdmin = await ensureCurrentUserIsAdmin();
      setIsAdminSetup(isAdmin);
      
      if (!isAdmin) {
        toast({
          title: "Error de configuración",
          description: "No se pudo configurar el usuario como administrador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Usuario configurado",
          description: "Acceso de administrador verificado correctamente.",
        });
      }
    } catch (error) {
      console.error('Error configurando admin:', error);
      toast({
        title: "Error",
        description: "Error configurando permisos de administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Configurando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdminSetup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-black mb-4">Error de Permisos</h2>
          <p className="text-gray-600 mb-6">
            No se pudieron configurar los permisos de administrador. 
            Por favor, contacta al administrador del sistema.
          </p>
          <Button onClick={setupAdmin} className="mr-4 bg-black text-white border border-black rounded-lg">
            Reintentar
          </Button>
          <Button variant="outline" onClick={handleLogout} className="border border-gray-300 rounded-lg">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">Panel de Administración - Capittal</h1>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border border-gray-300 rounded-lg"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="case-studies" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 rounded-lg">
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
