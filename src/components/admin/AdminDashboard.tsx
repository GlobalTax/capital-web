
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-0.5 border-black mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-black mb-2">Configurando permisos...</h2>
          <p className="text-sm text-gray-600 mb-4">{debugInfo}</p>
          <div className="bg-gray-100 border-0.5 border-black rounded-lg p-3">
            <p className="text-xs text-gray-500">Verificando acceso de administrador</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
          <div className="bg-gray-100 border-0.5 border-black rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-700 font-mono mb-2">{debugInfo}</p>
            <p className="text-xs text-gray-500">
              Revisa la consola del navegador (F12) para más información técnica.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={setupAdmin} 
              className="px-4 py-2 bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Reintentar
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/case-studies" element={<CaseStudiesManager />} />
        <Route path="/operations" element={<OperationsManager />} />
        <Route path="/multiples" element={<MultiplesManager />} />
        <Route path="/statistics" element={<StatisticsManager />} />
        <Route path="/testimonials" element={<TestimonialsManager />} />
        <Route path="/team" element={<TeamMembersManager />} />
        <Route path="/carousel-logos" element={<CarouselLogosManager />} />
        <Route path="/carousel-testimonials" element={<CarouselTestimonialsManager />} />
        <Route path="/blog" element={<BlogPostsManager />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
