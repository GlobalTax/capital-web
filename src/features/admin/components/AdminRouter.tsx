import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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
  LazyVentaEmpresasContentManager,
  LazyTeamMembersManagerAdvanced,
  LazySectorReportsGenerator,
  LazyMultiplesManager,
  LazyAdvisorMultiplesManager,
  LazyStatisticsManager,
  LazyAdminUsersManager,
  LazyProposalsManager,
  LazyContentPerformancePage,
  LazyContentStudioPage,
  LazySectorsPage,
  LazyLandingPagesPage,
  LazyUnifiedLandingPagesPage,
  LazyAdminBanners,
  LazyContactsPage,
  LazyLeadMagnetsPage,
  LazyValuationDetailPage,
  LazyLeadDetailPage,
  LazyAdminOperations,
  LazyOperationDetails,
  LazyOperationsDashboard,
  LazyOperationsKanban,
  LazyJobPostsManager,
  LazyJobPostEditor,
  LazyJobApplicationsManager,
  LazyJobCategoriesManager,
  LazyJobTemplatesManager,
  LazyCollaboratorApplicationsManagerPage,
  LazyInvestorLeadsManager,
  LazyRODDocumentsManager,
  LazySectorDossierStudio,
  LazyIncompleteValuationsManager,
  LazyValuationAnalyticsDashboard,
  LazySearchAnalyticsPage,
  LazyValoracionesPro,
  LazyValoracionProForm,
  LazyEmailRecipientsConfig,
  LazyPdfSignatureConfig,
  LazyMarketplaceAnalytics,
  LazyNewsletterPage,
  LazyBuySideMandatesPage,
  LazyLeadsPipelinePage,
  LazyWorkflowTemplatesPage,
  LazyBookingsPage,
  LazyNotificationsPage,
  LazyAcquisitionChannelsSettings,
  LazyBrevoSyncDashboard,
  LazyBrevoContactsImport,
  LazySFRadarPage,
  LazySFDirectoryPage,
  LazySFBackersPage,
  LazySFMatchingInbox,
  LazySFApolloImportPage,
  LazySFFundDetailPage,
  LazySFAcquisitionDetailPage,
  LazySFPortfolioListPage,
  LazyCRDirectoryPage,
  LazyCRFundDetailPage,
  LazyCRApolloImportPage,
  LazyCRPortfolioScraperPage,
  LazyCRPortfolioDetailPage,
  LazyCRPortfolioListPage,
  LazyFundIntelligencePage
} from './LazyAdminComponents';

const LazyAdvisorMultiplesRangesTabs = React.lazy(() => import('@/components/admin/AdvisorMultiplesRangesTabs'));
const LazyManualLeadEntryPage = React.lazy(() => import('@/pages/admin/ManualLeadEntryPage'));
const LazyFase0TemplatesPage = React.lazy(() => import('@/pages/admin/Fase0TemplatesPage'));
const LazyNewsArticlesManager = React.lazy(() => import('@/components/admin/news/NewsArticlesManager').then(m => ({ default: m.NewsArticlesManager })));
const LazyMNADirectoryPage = React.lazy(() => import('@/pages/admin/MNADirectoryPage'));
const LazyMNABoutiqueDetailPage = React.lazy(() => import('@/pages/admin/MNABoutiqueDetailPage'));
const LazyMNAApolloImportPage = React.lazy(() => import('@/pages/admin/MNAApolloImportPage'));
const LazyCampaignCostsPage = React.lazy(() => import('@/pages/admin/CampaignCostsPage'));
const LazyEmpresasPage = React.lazy(() => import('@/pages/admin/EmpresasPage'));
const LazyEmpresaDetailPage = React.lazy(() => import('@/pages/admin/EmpresaDetailPage'));
const LazyApolloVisitorsPage = React.lazy(() => import('@/pages/admin/ApolloVisitorsPage'));

const AdminRouter = () => {
  const { isLoading } = useAdminAuth();

  // Solo mostrar skeleton durante carga inicial
  // La verificación de isAdmin se hace en AdminProtectedRoute (evita verificación redundante)
  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <AdminErrorBoundary>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          {/* Dashboard */}
          <Route index element={<LazyAdminDashboard />} />
          <Route path="/dashboard" element={<LazyAdminDashboard />} />
          <Route path="/valuation-analytics" element={<LazyValuationAnalyticsDashboard />} />
          <Route path="/search-analytics" element={<LazySearchAnalyticsPage />} />
          <Route path="/marketplace-analytics" element={<LazyMarketplaceAnalytics />} />
          
          {/* Lead Management */}
          <Route path="/leads-pipeline" element={<LazyLeadsPipelinePage />} />
          <Route path="/bookings" element={<LazyBookingsPage />} />
          <Route path="/proposals" element={<LazyProposalsManager />} />
          <Route path="/documentos-fase0" element={<LazyFase0TemplatesPage />} />
          <Route path="/contacts" element={<LazyContactsPage />} />
          <Route path="/contacts/:id" element={<LazyLeadDetailPage />} />
          <Route path="/contact-leads" element={<Navigate to="/admin/contacts" replace />} />
          <Route path="/empresas" element={<LazyEmpresasPage />} />
          <Route path="/empresas/:id" element={<LazyEmpresaDetailPage />} />
          <Route path="/investor-leads" element={<LazyInvestorLeadsManager />} />
          <Route path="/calculadora-manual" element={<LazyManualLeadEntryPage />} />
          
          
          {/* Content Management */}
          <Route path="/content-performance" element={<LazyContentPerformancePage />} />
          <Route path="/content-studio" element={<LazyContentStudioPage />} />
          <Route path="/lead-magnets" element={<LazyLeadMagnetsPage />} />
          <Route path="/blog-v2" element={<LazyModernBlogManager />} />
          <Route path="/blog/new" element={<LazyBlogEditorPage />} />
          <Route path="/blog/edit/:id" element={<LazyBlogEditorPage />} />
          <Route path="/sector-reports" element={<LazySectorReportsGenerator />} />
          <Route path="/sector-dossiers" element={<LazySectorDossierStudio />} />
          <Route path="/sectors" element={<LazySectorsPage />} />
          <Route path="/case-studies" element={<LazyCaseStudiesManager />} />
          <Route path="/landing-pages" element={<LazyLandingPagesPage />} />
          <Route path="/landing-pages-unified" element={<LazyUnifiedLandingPagesPage />} />
          <Route path="/banners" element={<LazyAdminBanners />} />
          <Route path="/noticias" element={<LazyNewsArticlesManager />} />
          
          {/* Job Posts Management - Complete */}
          <Route path="/jobs" element={<LazyJobPostsManager />} />
          <Route path="/jobs/new" element={<LazyJobPostEditor />} />
          <Route path="/jobs/edit/:id" element={<LazyJobPostEditor />} />
          <Route path="/job-applications" element={<LazyJobApplicationsManager />} />
          <Route path="/job-categories" element={<LazyJobCategoriesManager />} />
          <Route path="/job-templates" element={<LazyJobTemplatesManager />} />
          <Route path="/collaborator-applications" element={<LazyCollaboratorApplicationsManagerPage />} />
          
          {/* Company Data */}
          <Route path="/valoraciones-pro" element={<LazyValoracionesPro />} />
          <Route path="/valoraciones-pro/nueva" element={<LazyValoracionProForm />} />
          <Route path="/valoraciones-pro/:id" element={<LazyValoracionProForm />} />
          <Route path="/operations/dashboard" element={<LazyOperationsDashboard />} />
          <Route path="/operations/kanban" element={<LazyOperationsKanban />} />
          <Route path="/operations" element={<LazyAdminOperations />} />
          <Route path="/operations/:id" element={<LazyOperationDetails />} />
          <Route path="/multiples" element={<LazyMultiplesManager />} />
          <Route path="/advisor-multiples" element={<LazyAdvisorMultiplesManager />} />
          <Route path="/advisor-multiples-ranges" element={<LazyAdvisorMultiplesRangesTabs />} />
          <Route path="/statistics" element={<LazyStatisticsManager />} />
          <Route path="/rod-documents" element={<LazyRODDocumentsManager />} />
          
          {/* Team & Testimonials */}
          <Route path="/team" element={<LazyTeamMembersManagerAdvanced />} />
          <Route path="/testimonials" element={<LazyTestimonialsManager />} />
          <Route path="/carousel-testimonials" element={<LazyCarouselTestimonialsManager />} />
          <Route path="/carousel-logos" element={<LazyCarouselLogosManager />} />
          <Route path="/venta-empresas-content" element={<LazyVentaEmpresasContentManager />} />
          
          {/* Valuations */}
          <Route path="/company-valuations" element={<Navigate to="/admin/contacts" replace />} />
          <Route path="/valuations/:id" element={<LazyValuationDetailPage />} />
          <Route path="/incomplete-valuations" element={<LazyIncompleteValuationsManager />} />
          
          {/* Settings */}
          <Route path="/admin-users" element={<LazyAdminUsersManager />} />
          <Route path="/settings" element={<LazyAdminSettings />} />
          <Route path="/settings/canales" element={<LazyAcquisitionChannelsSettings />} />
          <Route path="/configuracion/destinatarios-email" element={<LazyEmailRecipientsConfig />} />
          <Route path="/configuracion/firma-pdf" element={<LazyPdfSignatureConfig />} />
          <Route path="/configuracion/workflow-templates" element={<LazyWorkflowTemplatesPage />} />
          <Route path="/newsletter" element={<LazyNewsletterPage />} />
          <Route path="/campaign-costs" element={<LazyCampaignCostsPage />} />
          <Route path="/mandatos-compra" element={<LazyBuySideMandatesPage />} />
          <Route path="/notifications" element={<LazyNotificationsPage />} />
          <Route path="/brevo-sync" element={<LazyBrevoSyncDashboard />} />
          <Route path="/brevo-import" element={<LazyBrevoContactsImport />} />
          
          {/* Search Funds Intelligence */}
          <Route path="/sf-apollo-import" element={<LazySFApolloImportPage />} />
          <Route path="/sf-radar" element={<LazySFRadarPage />} />
          <Route path="/sf-directory" element={<LazySFDirectoryPage />} />
          <Route path="/sf-directory/new" element={<LazySFFundDetailPage />} />
          <Route path="/sf-directory/:id" element={<LazySFFundDetailPage />} />
          <Route path="/sf-acquisitions/:id" element={<LazySFAcquisitionDetailPage />} />
          <Route path="/sf-backers" element={<LazySFBackersPage />} />
          <Route path="/sf-matches" element={<LazySFMatchingInbox />} />
          
          {/* Capital Riesgo Intelligence */}
          <Route path="/cr-apollo-import" element={<LazyCRApolloImportPage />} />
          <Route path="/cr-directory" element={<LazyCRDirectoryPage />} />
          <Route path="/cr-directory/new" element={<LazyCRFundDetailPage />} />
          <Route path="/cr-directory/:id" element={<LazyCRFundDetailPage />} />
          <Route path="/cr-portfolio/:id" element={<LazyCRPortfolioDetailPage />} />
          <Route path="/cr-portfolio-list" element={<LazyCRPortfolioListPage />} />
          <Route path="/cr-portfolio-scraper" element={<LazyCRPortfolioScraperPage />} />
          
          {/* Search Funds Portfolio */}
          <Route path="/sf-portfolio-list" element={<LazySFPortfolioListPage />} />
          
          {/* Fund Intelligence (Firecrawl) */}
          <Route path="/fund-intelligence" element={<LazyFundIntelligencePage />} />
          
          {/* MNA Boutiques */}
          <Route path="/mna-apollo-import" element={<LazyMNAApolloImportPage />} />
          <Route path="/mna-directory" element={<LazyMNADirectoryPage />} />
          <Route path="/mna-directory/:id" element={<LazyMNABoutiqueDetailPage />} />
          
          {/* Apollo Website Visitors */}
          <Route path="/apollo-visitors" element={<LazyApolloVisitorsPage />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminErrorBoundary>
  );
};

export default AdminRouter;
