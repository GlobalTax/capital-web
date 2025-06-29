import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminDashboardHome from './AdminDashboardHome';
import BlogPostsManagerV2 from './BlogPostsManagerV2';
import CaseStudiesManager from './CaseStudiesManager';
import TestimonialsManager from './TestimonialsManager';
import OperationsManager from './OperationsManager';
import MultiplesManager from './MultiplesManager';
import StatisticsManager from './StatisticsManager';
import CarouselLogosManager from './CarouselLogosManager';
import CarouselTestimonialsManager from './CarouselTestimonialsManager';
import TeamMembersManager from './TeamMembersManager';
import ContactLeadsManager from './ContactLeadsManager';
import CollaboratorApplicationsManager from './CollaboratorApplicationsManager';
import AIContentStudioPro from './ai/AIContentStudioPro';
import SectorReportsGenerator from './ai/SectorReportsGenerator';
import { FileText } from 'lucide-react';
import ReportManager from './ReportManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardHome />;
      case 'blog':
        return <BlogPostsManagerV2 />;
      case 'case-studies':
        return <CaseStudiesManager />;
      case 'testimonials':
        return <TestimonialsManager />;
      case 'operations':
        return <OperationsManager />;
      case 'multiples':
        return <MultiplesManager />;
      case 'statistics':
        return <StatisticsManager />;
      case 'carousel-logos':
        return <CarouselLogosManager />;
      case 'carousel-testimonials':
        return <CarouselTestimonialsManager />;
      case 'team':
        return <TeamMembersManager />;
      case 'leads':
        return <ContactLeadsManager />;
      case 'collaborators':
        return <CollaboratorApplicationsManager />;
      case 'reports':
        return <ReportManager />;
      case 'ai-studio':
        return <AIContentStudioPro />;
      case 'sector-reports':
        return <SectorReportsGenerator />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración</h2>
            <p className="text-gray-600">Panel de configuración del sistema.</p>
          </div>
        );
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={onLogout} />
      
      <div className="flex">
        <div className="w-64 bg-white shadow-sm">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: () => React.createElement('svg') },
                { id: 'blog', label: 'Blog Posts', icon: () => React.createElement('svg') },
                { id: 'case-studies', label: 'Case Studies', icon: () => React.createElement('svg') },
                { id: 'testimonials', label: 'Testimonials', icon: () => React.createElement('svg') },
                { id: 'operations', label: 'Operaciones', icon: () => React.createElement('svg') },
                { id: 'multiples', label: 'Múltiplos', icon: () => React.createElement('svg') },
                { id: 'statistics', label: 'Estadísticas', icon: () => React.createElement('svg') },
                { id: 'carousel-logos', label: 'Logos Carousel', icon: () => React.createElement('svg') },
                { id: 'carousel-testimonials', label: 'Testimonials Carousel', icon: () => React.createElement('svg') },
                { id: 'team', label: 'Team Members', icon: () => React.createElement('svg') },
                { id: 'leads', label: 'Leads', icon: () => React.createElement('svg') },
                { id: 'collaborators', label: 'Collaborators', icon: () => React.createElement('svg') },
                { id: 'reports', label: 'Reportes Automatizados', icon: FileText },
                { id: 'ai-studio', label: 'AI Studio', icon: () => React.createElement('svg') },
                { id: 'sector-reports', label: 'Sector Reports', icon: () => React.createElement('svg') },
                { id: 'settings', label: 'Configuración', icon: () => React.createElement('svg') },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${
                    activeTab === item.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
