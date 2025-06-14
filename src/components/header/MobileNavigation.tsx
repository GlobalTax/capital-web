
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  porQueElegirnosItems: NavItem[];
  serviciosItems: NavItem[];
  sectoresItems: NavItem[];
  recursosItems: NavItem[];
  navItems: NavItem[];
}

const MobileNavigation = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  porQueElegirnosItems, 
  serviciosItems, 
  sectoresItems, 
  recursosItems, 
  navItems 
}: MobileNavigationProps) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b-0.5 border-black animate-slide-in">
      <nav className="px-4 py-6 space-y-4">
        {/* Mobile Servicios */}
        <div>
          <div className="text-black text-sm font-medium mb-2">Servicios</div>
          <div className="pl-4 space-y-2">
            {serviciosItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block text-gray-600 text-sm hover:text-gray-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Sectores */}
        <div>
          <div className="text-black text-sm font-medium mb-2">Sectores</div>
          <div className="pl-4 space-y-2">
            {sectoresItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block text-gray-600 text-sm hover:text-gray-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Recursos */}
        <div>
          <div className="text-black text-sm font-medium mb-2">Recursos</div>
          <div className="pl-4 space-y-2">
            {recursosItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block text-gray-600 text-sm hover:text-gray-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Links directos */}
        <Link
          to="/por-que-elegirnos"
          className="block text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          Por Qué Elegirnos
        </Link>

        <Link
          to="/casos-exito"
          className="block text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          Casos de Éxito
        </Link>

        <Link
          to="/equipo"
          className="block text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          Equipo
        </Link>

        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="block text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        
        <Button className="capittal-button w-full mt-4">
          Consulta Gratuita
        </Button>
      </nav>
    </div>
  );
};

export default MobileNavigation;
