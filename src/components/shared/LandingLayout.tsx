import React, { ReactNode } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';

interface LandingLayoutProps {
  children: ReactNode;
  /** Custom className for the main element */
  mainClassName?: string;
  /** Whether to show accessibility tools (default: true) */
  showAccessibilityTools?: boolean;
  /** Whether to show notification center (default: true) */
  showNotificationCenter?: boolean;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({
  children,
  mainClassName = "",
  showAccessibilityTools = true,
  showNotificationCenter = true,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeaderMinimal />
      <main role="main" className={`pt-16 ${mainClassName}`}>
        {children}
      </main>
      <Footer />
      {showAccessibilityTools && <AccessibilityTools />}
      {showNotificationCenter && <NotificationCenter className="mr-16" />}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default LandingLayout;