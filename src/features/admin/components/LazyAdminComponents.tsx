// ============= LAZY ADMIN COMPONENTS =============
// Lazy loading optimizado para componentes del panel admin

import { lazy } from 'react';

// === DASHBOARD ===
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// === SETTINGS ===
export const LazyAdminSettings = lazy(() => import('@/components/admin/AdminSettings'));
export const LazyTopBarSettings = lazy(() => import('@/pages/admin/TopBarSettings'));

// === BLOG ===
export const LazyModernBlogManager = lazy(() => import('@/components/admin/ModernBlogManager'));
export const LazyBlogEditorPage = lazy(() => import('@/pages/admin/BlogEditorPage'));

// === CONTENT MANAGEMENT ===
export const LazyCaseStudiesManager = lazy(() => import('@/components/admin/CaseStudiesManager'));
export const LazyTestimonialsManager = lazy(() => import('@/components/admin/TestimonialsManager'));
export const LazyCarouselTestimonialsManager = lazy(() => import('@/components/admin/CarouselTestimonialsManager'));
export const LazyVentaEmpresasContentManager = lazy(() => import('@/components/admin/venta-empresas/VentaEmpresasContentManager'));
export const LazyCarouselLogosManager = lazy(() => import('@/components/admin/CarouselLogosManager'));
export const LazyTeamMembersManagerAdvanced = lazy(() => import('@/components/admin/TeamMembersManagerAdvanced'));
export const LazySectorReportsGenerator = lazy(() => import('@/components/admin/SectorReportsGenerator'));

// === DATA MANAGEMENT ===
export const LazyMultiplesManager = lazy(() => import('@/components/admin/MultiplesManager'));
export const LazyAdvisorMultiplesManager = lazy(() => import('@/components/admin/AdvisorMultiplesManager'));
export const LazyAdvisorMultiplesByRangeManager = lazy(() => import('@/components/admin/AdvisorMultiplesByRangeManager'));
export const LazyStatisticsManager = lazy(() => import('@/components/admin/StatisticsManager'));
export const LazyAdminUsersManager = lazy(() => import('@/components/admin/AdminUsersManager'));
export const LazyProposalsManager = lazy(() => import('@/components/admin/ProposalsManager'));
export const LazyInvestorLeadsManager = lazy(() => import('@/components/admin/InvestorLeadsManager').then(m => ({ default: m.InvestorLeadsManager })));
export const LazyRODDocumentsManager = lazy(() => import('@/components/admin/RODDocumentsManager').then(m => ({ default: m.RODDocumentsManager })));

// === PAGES ===
export const LazyContentPerformancePage = lazy(() => import('@/pages/admin/ContentPerformancePage'));
export const LazyContentStudioPage = lazy(() => import('@/pages/admin/ContentStudioPage'));
export const LazySectorsPage = lazy(() => import('@/pages/admin/SectorsPage'));
export const LazyLandingPagesPage = lazy(() => import('@/pages/admin/LandingPagesPage'));
export const LazyUnifiedLandingPagesPage = lazy(() => import('@/pages/admin/UnifiedLandingPagesPage'));
export const LazyAdminBanners = lazy(() => import('@/pages/AdminBanners'));
export const LazyContactsPage = lazy(() => import('@/pages/admin/ContactsPage'));
export const LazyBuyerContactsManager = lazy(() => import('@/pages/admin/BuyerContactsManager'));
export const LazyLeadMagnetsPage = lazy(() => import('@/pages/admin/LeadMagnetsPage'));
export const LazyValuationDetailPage = lazy(() => import('@/pages/admin/ValuationDetailPage'));
export const LazyLeadDetailPage = lazy(() => import('@/pages/admin/LeadDetailPage'));
export const LazyAdminOperations = lazy(() => import('@/pages/admin/AdminOperations'));
export const LazyOperationDetails = lazy(() => import('@/pages/admin/OperationDetails'));
export const LazyOperationsDashboard = lazy(() => import('@/features/operations-management/components/dashboard').then(m => ({ default: m.OperationsDashboard })));
export const LazyOperationsKanban = lazy(() => import('@/pages/admin/OperationsKanban'));

// === JOBS ===
export const LazyJobPostsManager = lazy(() => import('@/pages/admin/JobPostsManager').then(m => ({ default: m.JobPostsManager })));
export const LazyJobPostEditor = lazy(() => import('@/pages/admin/JobPostEditor').then(m => ({ default: m.JobPostEditor })));
export const LazyJobApplicationsManager = lazy(() => import('@/pages/admin/JobApplicationsManager').then(m => ({ default: m.JobApplicationsManager })));
export const LazyJobCategoriesManager = lazy(() => import('@/pages/admin/JobCategoriesManager').then(m => ({ default: m.JobCategoriesManager })));
export const LazyJobTemplatesManager = lazy(() => import('@/pages/admin/JobTemplatesManager').then(m => ({ default: m.JobTemplatesManager })));
export const LazyCollaboratorApplicationsManagerPage = lazy(() => import('@/pages/admin/CollaboratorApplicationsManagerPage'));

// === SECTOR DOSSIER ===
export const LazySectorDossierStudio = lazy(() => import('@/pages/admin/SectorDossierStudio'));

// === INCOMPLETE VALUATIONS ===
export const LazyIncompleteValuationsManager = lazy(() => import('@/components/admin/IncompleteValuationsManager'));

// === CORPORATE BUYERS ===
export const LazyCorporateBuyersPage = lazy(() => import('@/pages/admin/CorporateBuyersPage'));
export const LazyCorporateBuyerDetailPage = lazy(() => import('@/pages/admin/CorporateBuyerDetailPage'));

// === VALUATION ANALYTICS ===
export const LazyValuationAnalyticsDashboard = lazy(() => import('./valuation-analytics/ValuationAnalyticsDashboard').then(m => ({ default: m.ValuationAnalyticsDashboard })));

// === SEARCH ANALYTICS ===
export const LazySearchAnalyticsPage = lazy(() => import('@/pages/admin/SearchAnalyticsPage'));

// === PROFESSIONAL VALUATIONS ===
export const LazyValoracionesPro = lazy(() => import('@/pages/admin/ValoracionesPro'));
export const LazyValoracionProForm = lazy(() => import('@/pages/admin/ValoracionProForm'));

// === CONFIGURATION ===
export const LazyEmailRecipientsConfig = lazy(() => import('@/pages/admin/EmailRecipientsConfig'));
export const LazyPdfSignatureConfig = lazy(() => import('@/pages/admin/PdfSignatureConfigPage'));
export const LazyAcquisitionChannelsSettings = lazy(() => import('@/pages/admin/AcquisitionChannelsSettings'));
export const LazyEmailOutboxPanel = lazy(() => import('@/components/admin/EmailOutboxPanel'));

// === MARKETPLACE ANALYTICS ===
export const LazyMarketplaceAnalytics = lazy(() => import('@/pages/admin/MarketplaceAnalytics'));

// === NEWSLETTER ===
export const LazyNewsletterPage = lazy(() => import('@/pages/admin/NewsletterPage'));

// === BUY-SIDE MANDATES ===
export const LazyBuySideMandatesPage = lazy(() => import('@/pages/admin/BuySideMandatesPage'));
export const LazyBuySideMandateDetailPage = lazy(() => import('@/pages/admin/BuySideMandateDetailPage'));

// === LEADS PIPELINE ===
export const LazyLeadsPipelinePage = lazy(() => import('@/pages/admin/LeadsPipelinePage'));

// === BOOKINGS ===
export const LazyBookingsPage = lazy(() => import('@/components/admin/bookings').then(m => ({ default: m.BookingsManager })));

// === WORKFLOW TEMPLATES ===
export const LazyWorkflowTemplatesPage = lazy(() => import('@/pages/admin/WorkflowTemplatesPage'));

// === NOTIFICATIONS ===
export const LazyNotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'));

// === BREVO SYNC ===
export const LazyBrevoSyncDashboard = lazy(() => import('@/pages/admin/BrevoSyncDashboard'));
export const LazyBrevoContactsImport = lazy(() => import('@/pages/admin/BrevoContactsImport'));

// === SEARCH FUNDS INTELLIGENCE ===
export const LazySFRadarPage = lazy(() => import('@/pages/admin/SFRadarPage'));
export const LazySFDirectoryPage = lazy(() => import('@/pages/admin/SFDirectoryPage'));
export const LazySFBackersPage = lazy(() => import('@/pages/admin/SFBackersPage'));
export const LazySFMatchingInbox = lazy(() => import('@/pages/admin/SFMatchingInbox'));
export const LazySFApolloImportPage = lazy(() => import('@/pages/admin/SFApolloImportPage'));
export const LazySFFundDetailPage = lazy(() => import('@/pages/admin/SFFundDetailPage'));
export const LazySFAcquisitionDetailPage = lazy(() => import('@/pages/admin/SFAcquisitionDetailPage'));
export const LazySFAcquisitionsPage = lazy(() => import('@/pages/admin/SFAcquisitionsPage'));

// === CAPITAL RIESGO INTELLIGENCE ===
export const LazyCRDirectoryPage = lazy(() => import('@/pages/admin/CRDirectoryPage'));
export const LazyCRFundDetailPage = lazy(() => import('@/pages/admin/CRFundDetailPage'));
export const LazyCRApolloImportPage = lazy(() => import('@/pages/admin/CRApolloImportPage'));
export const LazyCRPortfolioScraperPage = lazy(() => import('@/pages/admin/CRPortfolioScraperPage'));
export const LazyCRPortfolioDetailPage = lazy(() => import('@/pages/admin/CRPortfolioDetailPage'));
export const LazyCRPortfolioListPage = lazy(() => import('@/pages/admin/CRPortfolioListPage'));


// === FUND INTELLIGENCE (FIRECRAWL) ===
export const LazyFundIntelligencePage = lazy(() => import('@/pages/admin/FundIntelligencePage'));

// === API USAGE DASHBOARD ===
export const LazyApiUsageDashboard = lazy(() => import('@/components/admin/ApiUsageDashboard').then(m => ({ default: m.ApiUsageDashboard })));

// === DATA ENRICHMENT ===
export const LazyDataEnrichmentPanel = lazy(() => import('@/components/admin/DataEnrichmentPanel').then(m => ({ default: m.DataEnrichmentPanel })));

// === CALCULATOR ERRORS ===
export const LazyCalculatorErrorsPage = lazy(() => import('@/pages/admin/CalculatorErrorsPage'));

// === DEALSUITE SYNC ===
export const LazyDealsuitePage = lazy(() => import('@/pages/admin/DealsuitePage'));
