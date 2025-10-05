
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { serviciosData } from './data/serviciosData';
import { sectoresData } from './data/sectoresData';
import { nosotrosData } from './data/nosotrosData';
import { recursosData } from './data/recursosData';
import { colaboradoresData } from './data/colaboradoresData';

interface AdvancedMobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const AdvancedMobileNavigation = ({ isMenuOpen, setIsMenuOpen }: AdvancedMobileNavigationProps) => {
  const { user, isAdmin } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const closeMenu = () => setIsMenuOpen(false);

  if (!isMenuOpen) return null;

  const navSections = [
    { id: 'servicios', title: 'Servicios', items: serviciosData.flatMap(category => category.items) },
    { id: 'nosotros', title: 'Nosotros', items: nosotrosData.flatMap(category => category.items) },
    { id: 'recursos', title: 'Recursos', items: recursosData.flatMap(category => category.items) },
    { id: 'colaboradores', title: 'Colaboradores', items: colaboradoresData },
  ];

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-in max-h-[80vh] overflow-y-auto">
      <nav className="px-4 py-6 space-y-4">
        {/* Navegación por secciones */}
        {navSections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full text-left text-black text-sm font-medium py-2 hover:text-gray-600 transition-colors"
            >
              <span>{section.title}</span>
              {expandedSection === section.id ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </button>
            
            {expandedSection === section.id && (
              <div className="pl-4 space-y-2 mt-2 border-l-2 border-gray-100">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block text-gray-600 text-sm hover:text-gray-900 transition-colors duration-200 py-1"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}


        {/* Sectores */}
        {sectoresData?.[0]?.items?.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('sectores')}
              className="flex items-center justify-between w-full text-left text-black text-sm font-medium py-2 hover:text-gray-600 transition-colors"
            >
              <span>Sectores</span>
              {expandedSection === 'sectores' ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </button>
            
            {expandedSection === 'sectores' && (
              <div className="pl-4 space-y-2 mt-2 border-l-2 border-gray-100">
                {sectoresData[0].items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block text-gray-600 text-sm hover:text-gray-900 transition-colors duration-200 py-1"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          {/* DEV ONLY - Admin access for development */}
          {import.meta.env.DEV && user && (
            <Link to="/admin" onClick={closeMenu}>
              <Button variant="outline" className="w-full justify-start opacity-50 hover:opacity-100">
                <Shield className="h-4 w-4 mr-2" />
                🔧 Admin (Dev)
              </Button>
            </Link>
          )}
          
          <Link to="/contacto" onClick={closeMenu}>
            <Button className="capittal-button w-full">
              Contacto
            </Button>
          </Link>
          
          <a 
            href="tel:+34695717490" 
            className="flex items-center justify-center p-3 text-black hover:text-gray-600 transition-colors border border-black rounded-md w-full"
          >
            <Phone size={20} className="mr-2" />
            Llamar Ahora
          </a>
        </div>
      </nav>
    </div>
  );
};

export default AdvancedMobileNavigation;
