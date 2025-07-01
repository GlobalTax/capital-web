
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboardHome from './AdminDashboardHome';
import MarketingIntelligenceDashboard from './MarketingIntelligenceDashboard';
import LeadScoringIntelligenceDashboard from './LeadScoringIntelligenceDashboard';
import MarketingAutomationDashboard from './MarketingAutomationDashboard';
import MarketingHubDashboard from './MarketingHubDashboard';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import BlogPostsManagerV2 from './BlogPostsManagerV2';
import SectorReportsGenerator from './SectorReportsGenerator';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import ContactLeadsManager from './ContactLeadsManager';
import CollaboratorApplicationsManager from './CollaboratorApplicationsManager';
import TeamMembersManager from './TeamMembersManager';
import TestimonialsManager from './TestimonialsManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import CarouselLogosManager from './CarouselLogosManager';
import LeadMagnetsManager from './LeadMagnetsManager';
import IntegrationsManager from './IntegrationsManager';

// Nuevos dashboards por grupo
import CMSDashboard from './dashboards/CMSDashboard';
import LeadsWorkflowsDashboard from './dashboards/LeadsWorkflowsDashboard';
import AnalyticsDashboard from './dashboards/AnalyticsDashboard';

// Componentes placeholder para las rutas que faltan
const CRMDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">CRM Dashboard</h1>
    <p className="text-gray-600">Sistema de gestión de relaciones con clientes - Próximamente</p>
  </div>
);

const AlertsDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Centro de Alertas</h1>
    <p className="text-gray-600">Sistema de notificaciones y alertas - Próximamente</p>
  </div>
);

const SettingsDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Configuración</h1>
    <p className="text-gray-600">Configuración general del sistema - Próximamente</p>
  </div>
);

const AdminRouter = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="dashboard" element={<AdminDashboardHome />} />
      
      {/* Dashboards por Grupo */}
      <Route path="cms-dashboard" element={<CMSDashboard />} />
      <Route path="leads-dashboard" element={<LeadsWorkflowsDashboard />} />
      <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />
      
      {/* Marketing Intelligence & Analytics */}
      <Route path="marketing-intelligence" element={<MarketingIntelligenceDashboard />} />
      <Route path="marketing-hub" element={<MarketingHubDashboard />} />
      <Route path="integrations" element={<IntegrationsManager />} />
      
      {/* Leads & Workflows */}
      <Route path="lead-scoring" element={<LeadScoringIntelligenceDashboard />} />
      <Route path="marketing-automation" element={<MarketingAutomationDashboard />} />
      <Route path="contact-leads" element={<ContactLeadsManager />} />
      <Route path="collaborator-applications" element={<CollaboratorApplicationsManager />} />
      <Route path="crm" element={<CRMDashboard />} />
      <Route path="alerts" element={<AlertsDashboard />} />
      
      {/* CMS - Contenido Web */}
      <Route path="case-studies" element={<CaseStudiesManager />} />
      <Route path="operations" element={<OperationsManager />} />
      <Route path="blog-v2" element={<BlogPostsManagerV2 />} />
      <Route path="sector-reports" element={<SectorReportsGenerator />} />
      <Route path="multiples" element={<MultiplesManager />} />
      <Route path="statistics" element={<StatisticsManager />} />
      <Route path="team" element={<TeamMembersManager />} />
      <Route path="testimonials" element={<TestimonialsManager />} />
      <Route path="carousel-testimonials" element={<CarouselTestimonialsManager />} />
      <Route path="carousel-logos" element={<CarouselLogosManager />} />
      <Route path="lead-magnets" element={<LeadMagnetsManager />} />
      
      {/* Configuración & Sistema */}
      <Route path="settings" element={<SettingsDashboard />} />
    </Routes>
  );
};

export default AdminRouter;
