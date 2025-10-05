// ============= Landing Footer Minimal personalizado para LP =============
import React from 'react';

const LandingFooterMinimal: React.FC = () => {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-gray-700 font-medium">© 2025 Capittal. Todos los derechos reservados.</p>
          <p className="text-gray-600">
            <span className="font-medium">Sede Central:</span> Carrer Ausias March número 36, 08010 Barcelona
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Otras oficinas:</span> Madrid · Girona · Lleida · Tarragona · Palma de Mallorca · Zaragoza · Valencia
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Tel:</span> <a href="tel:+34695717490" className="underline hover:text-gray-900 transition-colors" aria-label="Llamar al +34 695 717 490">+34 695 717 490</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterMinimal;
