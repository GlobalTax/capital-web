
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
import CaseStudiesManager from './CaseStudiesManager';
import OperationsManager from './OperationsManager';
import BlogPostsManager from './BlogPostsManager';
import BlogPostsManagerV2 from './BlogPostsManagerV2';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import TeamMembersManager from './TeamMembersManager';
import TestimonialsManager from './TestimonialsManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import CarouselLogosManager from './CarouselLogosManager';
import ContactLeadsManager from './ContactLeadsManager';
import CollaboratorApplicationsManager from './CollaboratorApplicationsManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  return (
    <AdminLayout onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/case-studies" element={<CaseStudiesManager />} />
        <Route path="/operations" element={<OperationsManager />} />
        <Route path="/blog" element={<BlogPostsManager />} />
        <Route path="/blog-v2" element={<BlogPostsManagerV2 />} />
        <Route path="/multiples" element={<MultiplesManager />} />
        <Route path="/statistics" element={<StatisticsManager />} />
        <Route path="/team" element={<TeamMembersManager />} />
        <Route path="/testimonials" element={<TestimonialsManager />} />
        <Route path="/carousel-testimonials" element={<CarouselTestimonialsManager />} />
        <Route path="/carousel-logos" element={<CarouselLogosManager />} />
        <Route path="/contact-leads" element={<ContactLeadsManager />} />
        <Route path="/collaborator-applications" element={<CollaboratorApplicationsManager />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
