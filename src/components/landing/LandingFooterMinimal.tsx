// ============= Landing Footer Minimal personalizado para LP =============
import React from 'react';

const LandingFooterMinimal: React.FC = () => {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-gray-700">© 2025 Capittal. Todos los derechos reservados.</p>
          <p className="text-gray-600">Sede Central: Carrer Ausias March número 36, 08010. Barcelona.</p>
          <p className="text-gray-600">Otras oficinas: Madrid - Girona - Lleida - Tarragona - Palma de Mallorca - Zaragoza - Valencia</p>
          <p className="text-gray-600">Tel: <a href="tel:+34620273552" className="underline" aria-label="Llamar al +34 620 27 35 52">+34 620 27 35 52</a> -  <a href="tel:+34658799614" className="underline" aria-label="Llamar al +34 658 799 614">+34 658 799 614</a></p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterMinimal;
