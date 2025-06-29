
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import UserDropdown from './header/UserDropdown';
import NotificationCenter from './header/NotificationCenter';
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
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { breadcrumbs } = useAdminLayout();

  return (
    <ErrorBoundaryProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {breadcrumb.url && index < breadcrumbs.length - 1 ? (
                        <BreadcrumbLink href={breadcrumb.url}>
                          {breadcrumb.title}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto flex items-center gap-2">
              <NotificationCenter />
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="h-4 w-4" />
              </Button>
              <UserDropdown onLogout={onLogout} />
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <ErrorBoundaryProvider>
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
              </Routes>
            </ErrorBoundaryProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundaryProvider>
  );
};

export default AdminDashboard;
