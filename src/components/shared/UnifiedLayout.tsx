import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import AdminAccessButton from '@/components/AdminAccessButton';

interface UnifiedLayoutProps {
  children: ReactNode;
  /** Layout variant - affects header type */
  variant?: 'home' | 'landing';
  /** Custom className for the main element */
  mainClassName?: string;
  /** Whether to show accessibility tools (default: true) */
  showAccessibilityTools?: boolean;
  /** Whether to show notification center (default: true) */
  showNotificationCenter?: boolean;
  /** Whether to show admin access button (default: true for home variant) */
  showAdminButton?: boolean;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  variant = 'home',
  mainClassName = "",
  showAccessibilityTools = true,
  showNotificationCenter = true,
  showAdminButton,
}) => {
  const shouldShowAdminButton = showAdminButton ?? variant === 'home';
  const HeaderComponent = variant === 'landing' ? LandingHeaderMinimal : Header;

  return (
    <div className="min-h-screen bg-white">
      <HeaderComponent />
      <main role="main" className={`pt-16 ${mainClassName}`}>
        {children}
      </main>
      <Footer />
      {showAccessibilityTools && <AccessibilityTools />}
      {showNotificationCenter && <NotificationCenter className="mr-16" />}
      {shouldShowAdminButton && <AdminAccessButton />}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default UnifiedLayout;