
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  serviciosItems: NavItem[];
  sectoresItems: NavItem[];
  recursosItems: NavItem[];
  empresaItems: NavItem[];
  navItems: NavItem[];
}

const MobileNavigation = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  serviciosItems, 
  sectoresItems, 
  recursosItems, 
  empresaItems,
  navItems 
}: MobileNavigationProps) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b-0.5 border-black animate-slide-in">
      <nav className="px-4 py-6 space-y-4">
        {/* Mobile Empresa */}
        <div>
          <div className="text-black text-sm font-medium mb-2">Empresa</div>
          <div className="pl-4 space-y-2">
            {empresaItems.map((item) => (
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
        
        <div className="flex space-x-2 mt-4">
          <Link to="/contacto" className="flex-1" onClick={() => setIsMenuOpen(false)}>
            <Button className="capittal-button w-full">
              Contacto
            </Button>
          </Link>
          <a href="tel:+34912345678" className="p-2 text-black hover:text-gray-600 transition-colors border-0.5 border-black rounded-md">
            <Phone size={20} />
          </a>
        </div>
      </nav>
    </div>
  );
};

export default MobileNavigation;
