import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';

const HubVentaStickyMobile: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { trackCTAClick, trackPhoneClick } = useHubVentaTracking();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (approximately 600px)
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    trackCTAClick('sticky_mobile_form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhoneClick = () => {
    trackPhoneClick();
    trackCTAClick('sticky_mobile_phone');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-lg p-3 safe-area-inset-bottom">
      <div className="flex gap-3 max-w-lg mx-auto">
        <Button 
          onClick={scrollToTop}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3"
        >
          Valoración Gratuita
        </Button>
        
        <a 
          href="tel:+34695717490"
          onClick={handlePhoneClick}
          className="flex items-center justify-center w-14 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Phone className="h-5 w-5 text-slate-700" />
        </a>
      </div>
    </div>
  );
};

export default HubVentaStickyMobile;
