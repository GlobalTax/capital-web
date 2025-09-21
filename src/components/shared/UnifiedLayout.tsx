import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import NavarroHeader from '@/components/navarro/NavarroHeader';
import Footer from '@/components/Footer';
import NavarroFooter from '@/components/navarro/NavarroFooter';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import AdminAccessButton from '@/components/AdminAccessButton';

interface UnifiedLayoutProps {
  children: ReactNode;
  /** Layout variant - affects header and footer type */
  variant?: 'home' | 'landing' | 'navarro';
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
  
  // Select header and footer based on variant
  const HeaderComponent = variant === 'landing' 
    ? LandingHeaderMinimal 
    : variant === 'navarro' 
    ? NavarroHeader 
    : Header;
    
  const FooterComponent = variant === 'navarro' ? NavarroFooter : Footer;

  return (
    <div className="min-h-screen bg-white">
      <HeaderComponent />
      <main role="main" className={`pt-16 ${mainClassName}`}>
        {children}
      </main>
      <FooterComponent />
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