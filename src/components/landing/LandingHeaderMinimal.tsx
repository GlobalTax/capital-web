// ============= Landing Header Minimal (sin enlaces) =============
import React from 'react';

const LandingHeaderMinimal: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo sin navegación */}
          <div className="flex-shrink-0" aria-label="Capittal - Logo">
            <span className="text-2xl font-normal text-black select-none">Capittal</span>
          </div>
          {/* Elementos de acción eliminados para la landing */}
        </div>
      </div>
    </header>
  );
};

export default LandingHeaderMinimal;
