import React from 'react';
import { Link } from 'react-router-dom';

const NavarroHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Navarro */}
          <div className="flex-shrink-0" aria-label="Navarro - Asesoría Legal y Fiscal">
            <Link to="/navarro" className="text-2xl font-bold text-black select-none hover:text-gray-700 transition-colors">
              Navarro
            </Link>
          </div>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/navarro/legal" 
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Legal
            </Link>
            <Link 
              to="/navarro/fiscal" 
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Fiscal
            </Link>
            <Link 
              to="/navarro/laboral" 
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Laboral
            </Link>
            <Link 
              to="/navarro/contacto" 
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Link a Capittal */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Ir a Capittal →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavarroHeader;