
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSettings from '@/components/admin/AdminSettings';
import ModernBlogManager from '@/components/admin/ModernBlogManager';
import BlogEditorPage from '@/pages/admin/BlogEditorPage';
import CaseStudiesManager from '@/components/admin/CaseStudiesManager';
import CollaboratorApplicationsManager from '@/components/admin/CollaboratorApplicationsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import CarouselTestimonialsManager from '@/components/admin/CarouselTestimonialsManager';
import CarouselLogosManager from '@/components/admin/CarouselLogosManager';
import TeamMembersManager from '@/components/admin/TeamMembersManager';
import AdminOperations from '@/pages/admin/AdminOperations';
import OperationDetails from '@/pages/admin/OperationDetails';

import MultiplesManager from '@/components/admin/MultiplesManager';
import StatisticsManager from '@/components/admin/StatisticsManager';
import SectorReportsGenerator from '@/components/admin/SectorReportsGenerator';
import AdminUsersManager from '@/components/admin/AdminUsersManager';
import ProposalsManager from '@/components/admin/ProposalsManager';
import ExternalLeadsDashboard from '@/components/admin/leads/ExternalLeadsDashboard';
import FormSubmissionsManager from '@/components/admin/FormSubmissionsManager';
import ContentPerformancePage from '@/pages/admin/ContentPerformancePage';
import ContentStudioPage from '@/pages/admin/ContentStudioPage';
import DesignResourcesPage from '@/pages/admin/DesignResourcesPage';
// import VideoManager from './VideoManager';
import SectorsPage from '@/pages/admin/SectorsPage';
// import PageManager from './pages/PageManager';
// import ContentEditor from './content/ContentEditor';
import MarketReports from '@/pages/admin/MarketReports';
import SectorCalculators from '@/pages/admin/SectorCalculators';

import LandingPagesPage from '@/pages/admin/LandingPagesPage';
import AdminBanners from '@/pages/AdminBanners';
import ContactsPage from '@/pages/admin/ContactsPage';
import LeadMagnetsPage from '@/pages/admin/LeadMagnetsPage';
import IntegrationsPage from '@/pages/admin/IntegrationsPage';
import ValuationDetailPage from '@/pages/admin/ValuationDetailPage';
import ContactLeadsAdminPage from '@/pages/admin/ContactLeadsAdminPage';

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
      <Route index element={<Navigate to="/admin/blog-v2" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admin/blog-v2" replace />} />
      
      {/* Lead Management */}
      <Route path="/external-leads" element={<ExternalLeadsDashboard />} />
      <Route path="/proposals" element={<ProposalsManager />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/contact-leads" element={<ContactLeadsAdminPage />} />
      <Route path="/form-submissions" element={<FormSubmissionsManager />} />
      
      {/* Calculators & Reports - NEW ROUTES */}
      <Route path="/market-reports" element={<MarketReports />} />
      <Route path="/sector-calculators" element={<SectorCalculators />} />
      
      {/* Content Management */}
      <Route path="/content-performance" element={<ContentPerformancePage />} />
      <Route path="/content-studio" element={<ContentStudioPage />} />
      {/* <Route path="/video-manager" element={<VideoManager />} /> */}
      <Route path="/design-resources" element={<DesignResourcesPage />} />
      <Route path="/lead-magnets" element={<LeadMagnetsPage />} />
      <Route path="/blog-v2" element={<ModernBlogManager />} />
      <Route path="/blog/new" element={<BlogEditorPage />} />
      <Route path="/blog/edit/:id" element={<BlogEditorPage />} />
      <Route path="/sector-reports" element={<SectorReportsGenerator />} />
      <Route path="/sectors" element={<SectorsPage />} />
      <Route path="/case-studies" element={<CaseStudiesManager />} />
      <Route path="/landing-pages" element={<LandingPagesPage />} />
      <Route path="/banners" element={<AdminBanners />} />
      
      {/* Company Data */}
      <Route path="/operations" element={<AdminOperations />} />
      <Route path="/operations/:id" element={<OperationDetails />} />
      <Route path="/multiples" element={<MultiplesManager />} />
      <Route path="/statistics" element={<StatisticsManager />} />
      
      {/* Team & Testimonials */}
      <Route path="/team" element={<TeamMembersManager />} />
      <Route path="/testimonials" element={<TestimonialsManager />} />
      <Route path="/carousel-testimonials" element={<CarouselTestimonialsManager />} />
      <Route path="/carousel-logos" element={<CarouselLogosManager />} />
      
      {/* Integrations */}
      <Route path="/integrations" element={<IntegrationsPage />} />
      
      {/* Valuations */}
      <Route path="/valuations/:id" element={<ValuationDetailPage />} />
      
      {/* Page Management - Commented out for now */}
      {/* <Route path="/pages" element={<PageManager />} /> */}
      {/* <Route path="/content-editor" element={<ContentEditor />} /> */}
      
      {/* Settings */}
      <Route path="/admin-users" element={<AdminUsersManager />} />
      <Route path="/settings" element={<AdminSettings />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRouter;
