
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import LeadScoringManager from './dashboard/LeadScoringManager';
import LeadScoringRulesManager from './dashboard/LeadScoringRulesManager';
import AdminSettings from './AdminSettings';
import AlertsManager from './leads/AlertsManager';
import ModernBlogManager from './ModernBlogManager';
import BlogEditorPage from '@/pages/admin/BlogEditorPage';
import CaseStudiesManager from './CaseStudiesManager';
import CollaboratorApplicationsManager from './CollaboratorApplicationsManager';
import TestimonialsManager from './TestimonialsManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import CarouselLogosManager from './CarouselLogosManager';
import TeamMembersManager from './TeamMembersManager';
import OperationsManager from './OperationsManager';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import SectorReportsGenerator from './SectorReportsGenerator';
import AdminUsersManager from './AdminUsersManager';
import ProposalsManager from './ProposalsManager';
import EnhancedLeadsDashboard from './leads/EnhancedLeadsDashboard';
import ContentPerformancePage from '@/pages/admin/ContentPerformancePage';
import ContentStudioPage from '@/pages/admin/ContentStudioPage';
import DesignResourcesPage from '@/pages/admin/DesignResourcesPage';
import UnifiedTrackingPage from '@/pages/admin/UnifiedTrackingPage';
import LandingPagesPage from '@/pages/admin/LandingPagesPage';

const AdminRouter = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600">
            Necesitas permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      
      {/* Lead Management */}
      <Route path="/leads-dashboard" element={<EnhancedLeadsDashboard />} />
      <Route path="/lead-scoring" element={<LeadScoringManager />} />
      <Route path="/lead-scoring-rules" element={<LeadScoringRulesManager />} />
      <Route path="/alerts" element={<AlertsManager />} />
      <Route path="/proposals" element={<ProposalsManager />} />
      
      {/* Content Management */}
      <Route path="/content-performance" element={<ContentPerformancePage />} />
      <Route path="/content-studio" element={<ContentStudioPage />} />
      <Route path="/design-resources" element={<DesignResourcesPage />} />
      <Route path="/blog-v2" element={<ModernBlogManager />} />
      <Route path="/blog/new" element={<BlogEditorPage />} />
      <Route path="/blog/edit/:id" element={<BlogEditorPage />} />
      <Route path="/sector-reports" element={<SectorReportsGenerator />} />
      <Route path="/case-studies" element={<CaseStudiesManager />} />
      <Route path="/landing-pages" element={<LandingPagesPage />} />
      
      {/* Company Data */}
      <Route path="/operations" element={<OperationsManager />} />
      <Route path="/multiples" element={<MultiplesManager />} />
      <Route path="/statistics" element={<StatisticsManager />} />
      
      {/* Team & Testimonials */}
      <Route path="/team" element={<TeamMembersManager />} />
      <Route path="/testimonials" element={<TestimonialsManager />} />
      <Route path="/carousel-testimonials" element={<CarouselTestimonialsManager />} />
      <Route path="/carousel-logos" element={<CarouselLogosManager />} />
      
      {/* Settings */}
      <Route path="/admin-users" element={<AdminUsersManager />} />
      <Route path="/settings" element={<AdminSettings />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRouter;
