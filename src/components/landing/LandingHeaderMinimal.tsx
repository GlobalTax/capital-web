// ============= Landing Header Minimal (sin enlaces) =============
import React from 'react';
import { CAPITTAL_LOGO_SVG, CAPITTAL_LOGO_ALT } from '@/config/brand';

const LandingHeaderMinimal: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo sin navegación */}
          <div className="flex-shrink-0" aria-label="Capittal - Logo">
            <img src={CAPITTAL_LOGO_SVG} alt={CAPITTAL_LOGO_ALT} className="h-6" width={90} height={24} />
          </div>
          {/* Elementos de acción eliminados para la landing */}
        </div>
      </div>
    </header>
  );
};

export default LandingHeaderMinimal;
