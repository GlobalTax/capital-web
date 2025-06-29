
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboardHome from './AdminDashboardHome';
import BlogPostsManagerV2 from './BlogPostsManagerV2';
import SectorReportsGenerator from './SectorReportsGenerator';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import TeamMembersManager from './TeamMembersManager';
import TestimonialsManager from './TestimonialsManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import CarouselLogosManager from './CarouselLogosManager';
import ContactLeadsManager from './ContactLeadsManager';
import CollaboratorApplicationsManager from './CollaboratorApplicationsManager';
import ValuationLeadsManager from './ValuationLeadsManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader onLogout={onLogout} />
          <main className="flex-1 overflow-auto bg-gray-50">
            <Routes>
              <Route index element={<AdminDashboardHome />} />
              <Route path="blog-v2" element={<BlogPostsManagerV2 />} />
              <Route path="sector-reports" element={<SectorReportsGenerator />} />
              <Route path="case-studies" element={<CaseStudiesManager />} />
              <Route path="operations" element={<OperationsManager />} />
              <Route path="multiples" element={<MultiplesManager />} />
              <Route path="statistics" element={<StatisticsManager />} />
              <Route path="team" element={<TeamMembersManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="carousel-testimonials" element={<CarouselTestimonialsManager />} />
              <Route path="carousel-logos" element={<CarouselLogosManager />} />
              <Route path="contact-leads" element={<ContactLeadsManager />} />
              <Route path="collaborator-applications" element={<CollaboratorApplicationsManager />} />
              <Route path="valuation-leads" element={<ValuationLeadsManager />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
