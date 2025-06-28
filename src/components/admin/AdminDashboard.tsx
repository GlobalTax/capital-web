import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import TestimonialsManager from './TestimonialsManager';
import TeamMembersManager from './TeamMembersManager';
import CarouselLogosManager from './CarouselLogosManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import BlogPostsManager from './BlogPostsManager';
import { ensureCurrentUserIsAdmin, debugAdminStatus } from '@/utils/adminSetup';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [isAdminSetup, setIsAdminSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { signOut } = useAuth();
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

  const handleLogout = async () => {
    try {
      await signOut();
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
        <div className="text-center max-w-md p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-0.5 border-black mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-black mb-2">Configurando permisos...</h2>
          <p className="text-sm text-gray-600 mb-4">{debugInfo}</p>
          <div className="bg-gray-50 border-0.5 border-black rounded-lg p-3">
            <p className="text-xs text-gray-500">Verificando acceso de administrador</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminSetup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Error de Permisos</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron configurar los permisos de administrador.
          </p>
          <div className="bg-gray-50 border-0.5 border-black rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-700 font-mono mb-2">{debugInfo}</p>
            <p className="text-xs text-gray-500">
              Revisa la consola del navegador (F12) para más información técnica.
            </p>
          </div>
          
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
          <TabsList className="grid w-full grid-cols-9 mb-8 h-12 bg-white border-0.5 border-black rounded-lg p-1">
            <TabsTrigger 
              value="case-studies" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Casos de Éxito
            </TabsTrigger>
            <TabsTrigger 
              value="operations" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Operaciones
            </TabsTrigger>
            <TabsTrigger 
              value="multiples" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Múltiplos
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Estadísticas
            </TabsTrigger>
            <TabsTrigger 
              value="testimonials" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Testimonios
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Equipo
            </TabsTrigger>
            <TabsTrigger 
              value="carousel-logos" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Logos Carrusel
            </TabsTrigger>
            <TabsTrigger 
              value="carousel-testimonials" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Test. Carrusel
            </TabsTrigger>
            <TabsTrigger 
              value="blog" 
              className="text-sm font-medium text-gray-600 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              Blog
            </TabsTrigger>
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

          <TabsContent value="team" className="space-y-6">
            <TeamMembersManager />
          </TabsContent>

          <TabsContent value="carousel-logos" className="space-y-6">
            <CarouselLogosManager />
          </TabsContent>

          <TabsContent value="carousel-testimonials" className="space-y-6">
            <CarouselTestimonialsManager />
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <BlogPostsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
