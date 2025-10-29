// ============= LAZY ADMIN COMPONENTS =============
// Lazy loading optimizado para componentes del panel admin

import { lazy } from 'react';

// === DASHBOARD ===
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// === SETTINGS ===
export const LazyAdminSettings = lazy(() => import('@/components/admin/AdminSettings'));

// === BLOG ===
export const LazyModernBlogManager = lazy(() => import('@/components/admin/ModernBlogManager'));
export const LazyBlogEditorPage = lazy(() => import('@/pages/admin/BlogEditorPage'));

// === CONTENT MANAGEMENT ===
export const LazyCaseStudiesManager = lazy(() => import('@/components/admin/CaseStudiesManager'));
export const LazyTestimonialsManager = lazy(() => import('@/components/admin/TestimonialsManager'));
export const LazyCarouselTestimonialsManager = lazy(() => import('@/components/admin/CarouselTestimonialsManager'));
export const LazyCarouselLogosManager = lazy(() => import('@/components/admin/CarouselLogosManager'));
export const LazyTeamMembersManagerAdvanced = lazy(() => import('@/components/admin/TeamMembersManagerAdvanced'));
export const LazySectorReportsGenerator = lazy(() => import('@/components/admin/SectorReportsGenerator'));

// === DATA MANAGEMENT ===
export const LazyMultiplesManager = lazy(() => import('@/components/admin/MultiplesManager'));
export const LazyAdvisorMultiplesManager = lazy(() => import('@/components/admin/AdvisorMultiplesManager'));
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
export const LazyLeadMagnetsPage = lazy(() => import('@/pages/admin/LeadMagnetsPage'));
export const LazyValuationDetailPage = lazy(() => import('@/pages/admin/ValuationDetailPage'));
export const LazyLeadDetailPage = lazy(() => import('@/pages/admin/LeadDetailPage'));
export const LazyAdminOperations = lazy(() => import('@/pages/admin/AdminOperations'));
export const LazyOperationDetails = lazy(() => import('@/pages/admin/OperationDetails'));

// === JOBS ===
export const LazyJobPostsManager = lazy(() => import('@/pages/admin/JobPostsManager').then(m => ({ default: m.JobPostsManager })));
export const LazyJobPostEditor = lazy(() => import('@/pages/admin/JobPostEditor').then(m => ({ default: m.JobPostEditor })));
export const LazyJobApplicationsManager = lazy(() => import('@/pages/admin/JobApplicationsManager').then(m => ({ default: m.JobApplicationsManager })));
export const LazyJobCategoriesManager = lazy(() => import('@/pages/admin/JobCategoriesManager').then(m => ({ default: m.JobCategoriesManager })));
export const LazyJobTemplatesManager = lazy(() => import('@/pages/admin/JobTemplatesManager').then(m => ({ default: m.JobTemplatesManager })));
export const LazyCollaboratorApplicationsManagerPage = lazy(() => import('@/pages/admin/CollaboratorApplicationsManagerPage'));
