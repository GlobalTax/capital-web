
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboardHome from './AdminDashboardHome';
import MarketingIntelligenceDashboard from './MarketingIntelligenceDashboard';
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

const AdminRouter = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="marketing-intelligence" element={<MarketingIntelligenceDashboard />} />
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
    </Routes>
  );
};

export default AdminRouter;
