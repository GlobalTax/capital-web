import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

// Lazy imports optimizados
import {
  LazyAdminDashboard,
  LazyAdminSettings,
  LazyModernBlogManager,
  LazyBlogEditorPage,
  LazyCaseStudiesManager,
  LazyTestimonialsManager,
  LazyCarouselTestimonialsManager,
  LazyCarouselLogosManager,
  LazyTeamMembersManagerAdvanced,
  LazySectorReportsGenerator,
  LazyMultiplesManager,
  LazyStatisticsManager,
  LazyAdminUsersManager,
  LazyProposalsManager,
  LazyContentPerformancePage,
  LazyContentStudioPage,
  LazySectorsPage,
  LazyLandingPagesPage,
  LazyAdminBanners,
  LazyContactsPage,
  LazyLeadMagnetsPage,
  LazyValuationDetailPage,
  LazyLeadDetailPage,
  LazyAdminOperations,
  LazyOperationDetails,
  LazyJobPostsManager,
  LazyJobPostEditor,
  LazyJobApplicationsManager,
  LazyJobCategoriesManager,
  LazyJobTemplatesManager,
  LazyCollaboratorApplicationsManagerPage
} from './LazyAdminComponents';

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
    <AdminErrorBoundary>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          {/* Dashboard */}
          <Route index element={<LazyAdminDashboard />} />
          <Route path="/dashboard" element={<LazyAdminDashboard />} />
          
          {/* Lead Management */}
          <Route path="/proposals" element={<LazyProposalsManager />} />
          <Route path="/contacts" element={<LazyContactsPage />} />
          <Route path="/contacts/:id" element={<LazyLeadDetailPage />} />
          <Route path="/contact-leads" element={<Navigate to="/admin/contacts" replace />} />
          
          
          {/* Content Management */}
          <Route path="/content-performance" element={<LazyContentPerformancePage />} />
          <Route path="/content-studio" element={<LazyContentStudioPage />} />
          <Route path="/lead-magnets" element={<LazyLeadMagnetsPage />} />
          <Route path="/blog-v2" element={<LazyModernBlogManager />} />
          <Route path="/blog/new" element={<LazyBlogEditorPage />} />
          <Route path="/blog/edit/:id" element={<LazyBlogEditorPage />} />
          <Route path="/sector-reports" element={<LazySectorReportsGenerator />} />
          <Route path="/sectors" element={<LazySectorsPage />} />
          <Route path="/case-studies" element={<LazyCaseStudiesManager />} />
          <Route path="/landing-pages" element={<LazyLandingPagesPage />} />
          <Route path="/banners" element={<LazyAdminBanners />} />
          
          {/* Job Posts Management - Complete */}
          <Route path="/jobs" element={<LazyJobPostsManager />} />
          <Route path="/jobs/new" element={<LazyJobPostEditor />} />
          <Route path="/jobs/edit/:id" element={<LazyJobPostEditor />} />
          <Route path="/job-applications" element={<LazyJobApplicationsManager />} />
          <Route path="/job-categories" element={<LazyJobCategoriesManager />} />
          <Route path="/job-templates" element={<LazyJobTemplatesManager />} />
          <Route path="/collaborator-applications" element={<LazyCollaboratorApplicationsManagerPage />} />
          
          {/* Company Data */}
          <Route path="/operations" element={<LazyAdminOperations />} />
          <Route path="/operations/:id" element={<LazyOperationDetails />} />
          <Route path="/multiples" element={<LazyMultiplesManager />} />
          <Route path="/statistics" element={<LazyStatisticsManager />} />
          
          {/* Team & Testimonials */}
          <Route path="/team" element={<LazyTeamMembersManagerAdvanced />} />
          <Route path="/testimonials" element={<LazyTestimonialsManager />} />
          <Route path="/carousel-testimonials" element={<LazyCarouselTestimonialsManager />} />
          <Route path="/carousel-logos" element={<LazyCarouselLogosManager />} />
          
          {/* Valuations */}
          <Route path="/valuations/:id" element={<LazyValuationDetailPage />} />
          
          {/* Settings */}
          <Route path="/admin-users" element={<LazyAdminUsersManager />} />
          <Route path="/settings" element={<LazyAdminSettings />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminErrorBoundary>
  );
};

export default AdminRouter;
