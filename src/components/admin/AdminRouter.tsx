
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

// Componentes placeholder para las rutas que faltan
const CRMDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">CRM Dashboard</h1>
    <p>Sistema de gestión de relaciones con clientes - Próximamente</p>
  </div>
);

const AlertsDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Centro de Alertas</h1>
    <p>Sistema de notificaciones y alertas - Próximamente</p>
  </div>
);

const SettingsDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Configuración</h1>
    <p>Configuración general del sistema - Próximamente</p>
  </div>
);

const AdminRouter = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="dashboard" element={<AdminDashboardHome />} />
      <Route path="marketing-intelligence" element={<MarketingIntelligenceDashboard />} />
      <Route path="lead-scoring" element={<LeadScoringIntelligenceDashboard />} />
      <Route path="marketing-automation" element={<MarketingAutomationDashboard />} />
      <Route path="marketing-hub" element={<MarketingHubDashboard />} />
      <Route path="crm" element={<CRMDashboard />} />
      <Route path="alerts" element={<AlertsDashboard />} />
      <Route path="case-studies" element={<CaseStudiesManager />} />
      <Route path="operations" element={<OperationsManager />} />
      <Route path="blog-v2" element={<BlogPostsManagerV2 />} />
      <Route path="sector-reports" element={<SectorReportsGenerator />} />
      <Route path="multiples" element={<MultiplesManager />} />
      <Route path="statistics" element={<StatisticsManager />} />
      <Route path="contact-leads" element={<ContactLeadsManager />} />
      <Route path="collaborator-applications" element={<CollaboratorApplicationsManager />} />
      <Route path="team" element={<TeamMembersManager />} />
      <Route path="testimonials" element={<TestimonialsManager />} />
      <Route path="carousel-testimonials" element={<CarouselTestimonialsManager />} />
      <Route path="carousel-logos" element={<CarouselLogosManager />} />
      <Route path="lead-magnets" element={<LeadMagnetsManager />} />
      <Route path="settings" element={<SettingsDashboard />} />
    </Routes>
  );
};

export default AdminRouter;
