import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import AdminAccessButton from '@/components/AdminAccessButton';

interface HomeLayoutProps {
  children: ReactNode;
  /** Custom className for the main element */
  mainClassName?: string;
  /** Whether to show accessibility tools (default: true) */
  showAccessibilityTools?: boolean;
  /** Whether to show notification center (default: true) */
  showNotificationCenter?: boolean;
  /** Whether to show admin access button (default: true) */
  showAdminButton?: boolean;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
  mainClassName = "",
  showAccessibilityTools = true,
  showNotificationCenter = true,
  showAdminButton = true,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main" className={`pt-16 ${mainClassName}`}>
        {children}
      </main>
      <Footer />
      <AccessibilityTools />
      <NotificationCenter className="mr-16" />
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default HomeLayout;