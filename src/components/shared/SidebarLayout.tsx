import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import AdminAccessButton from '@/components/AdminAccessButton';
import DocumentacionMASidebar from '@/components/documentacion-ma/DocumentacionMASidebar';

interface SidebarLayoutProps {
  children: ReactNode;
  /** Custom className for the content wrapper */
  contentClassName?: string;
  /** Whether to show accessibility tools (default: true) */
  showAccessibilityTools?: boolean;
  /** Whether to show notification center (default: true) */
  showNotificationCenter?: boolean;
  /** Whether to show admin access button (default: true) */
  showAdminButton?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  contentClassName = "flex-1 max-w-4xl mx-auto px-8 py-16",
  showAccessibilityTools = true,
  showNotificationCenter = true,
  showAdminButton = true,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <div className="flex min-h-screen">
          <DocumentacionMASidebar />
          <div className={contentClassName}>
            {children}
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Herramientas de accesibilidad flotantes */}
      {showAccessibilityTools && <AccessibilityTools />}
      {showNotificationCenter && <NotificationCenter className="mr-16" />}
      {showAdminButton && <AdminAccessButton />}
      
      {/* Live region para anuncios de accesibilidad */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default SidebarLayout;