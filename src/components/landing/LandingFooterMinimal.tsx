import React from 'react';
import { Link } from 'react-router-dom';

const LandingFooterMinimal: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3">
          <p className="text-gray-600">© {year} Capittal. Todos los derechos reservados.</p>
          <nav className="flex items-center gap-4 text-gray-700">
            <Link to="/legal/privacidad" className="hover:underline">Política de Privacidad</Link>
            <Link to="/legal/terminos" className="hover:underline">Términos de Uso</Link>
            <Link to="/legal/cookies" className="hover:underline">Cookies</Link>
            <Link to="/lp/calculadora-fiscal" className="font-medium hover:underline">Calculadora Fiscal</Link>
            <Link to="/contacto" className="font-medium hover:underline">Contacto</Link>
          </nav>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>
            P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid · Tel: <a href="tel:+34912345678" className="underline">+34 912 345 678</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterMinimal;
