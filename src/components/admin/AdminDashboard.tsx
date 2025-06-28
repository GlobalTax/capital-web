
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSetup } from '@/hooks/useAdminSetup';
import AdminLayout from './AdminLayout';
import AdminLoadingState from './states/AdminLoadingState';
import AdminErrorState from './states/AdminErrorState';
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

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { signOut } = useAuth();
  const { isAdminSetup, isLoading, debugInfo, retrySetup } = useAdminSetup();

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (isLoading) {
    return <AdminLoadingState debugInfo={debugInfo} />;
  }

  if (!isAdminSetup) {
    return (
      <AdminErrorState 
        debugInfo={debugInfo}
        onRetry={retrySetup}
        onLogout={handleLogout}
      />
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
