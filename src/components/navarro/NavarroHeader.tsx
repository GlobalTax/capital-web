import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NavarroHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0" aria-label="Navarro & Asociados - Global Services">
            <Link to="/navarro" className="flex items-center space-x-3 text-black select-none hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">NAVARRO</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider">Global Services</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            <Link 
              to="/navarro/por-que-global" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Por Qué Global
            </Link>
            <Link 
              to="/navarro/servicios" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Servicios
            </Link>
            <Link 
              to="/navarro/solucion-para" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Solución Para
            </Link>
            <Link 
              to="/navarro/nosotros" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Nosotros
            </Link>
            <Link 
              to="/navarro/recursos" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Recursos
            </Link>
            <Link 
              to="/navarro/contacto" 
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              Contacto
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Capittal Link - Desktop */}
          <div className="hidden lg:flex items-center">
            <Link 
              to="/" 
              className="text-sm text-gray-600 hover:text-black transition-colors border border-gray-300 px-4 py-2 rounded-full hover:border-black"
            >
              Ir a Capittal →
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="px-4 py-6 space-y-4">
              <Link 
                to="/navarro/por-que-global" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Por Qué Global
              </Link>
              <Link 
                to="/navarro/servicios" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link 
                to="/navarro/solucion-para" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Solución Para
              </Link>
              <Link 
                to="/navarro/nosotros" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link 
                to="/navarro/recursos" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link 
                to="/navarro/contacto" 
                className="block text-gray-900 hover:text-gray-600 font-medium transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="pt-4 border-t border-gray-100">
                <Link 
                  to="/" 
                  className="block text-sm text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ir a Capittal →
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavarroHeader;