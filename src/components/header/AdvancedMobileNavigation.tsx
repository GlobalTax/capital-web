
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { getLocalizedUrl } from '@/shared/i18n/dictionaries';
import { serviciosData } from './data/serviciosData';
import { sectoresData } from './data/sectoresData';
import { nosotrosData } from './data/nosotrosData';
import { recursosData } from './data/recursosData';
import { searchFundsData } from './data/searchFundsData';

interface AdvancedMobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const AdvancedMobileNavigation = ({ isMenuOpen, setIsMenuOpen }: AdvancedMobileNavigationProps) => {
  const { user, isAdmin } = useAuth();
  const { lang, t } = useI18n();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const closeMenu = () => setIsMenuOpen(false);

  if (!isMenuOpen) return null;

  const navSections = [
    { id: 'servicios', title: t('nav.servicios'), items: serviciosData.flatMap(category => category.items) },
    { id: 'nosotros', title: t('nav.nosotros'), items: nosotrosData.flatMap(category => category.items) },
    { id: 'recursos', title: t('nav.recursos'), items: recursosData.flatMap(category => category.items) },
  ];

  // Flatten Search Funds items for mobile
  const searchFundsItems = searchFundsData.categories.flatMap(category => category.items);

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

        {/* Search Funds - Sección expandible */}
        <div>
          <button
            onClick={() => toggleSection('search-funds')}
            className="flex items-center justify-between w-full text-left text-black text-sm font-medium py-2 hover:text-gray-600 transition-colors"
          >
            <span>Search Funds</span>
            {expandedSection === 'search-funds' ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
          
          {expandedSection === 'search-funds' && (
            <div className="pl-4 space-y-2 mt-2 border-l-2 border-gray-100">
              {searchFundsItems.map((item) => (
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

        {/* Sectores */}
        {sectoresData?.[0]?.items?.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('sectores')}
              className="flex items-center justify-between w-full text-left text-black text-sm font-medium py-2 hover:text-gray-600 transition-colors"
            >
              <span>{t('nav.sectores')}</span>
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

        {/* Colaboradores - Link directo */}
        <Link
          to={getLocalizedUrl('programaColaboradores', lang)}
          className="block text-black text-sm font-medium py-2 hover:text-gray-600 transition-colors"
          onClick={closeMenu}
        >
          {t('nav.colaboradores')}
        </Link>

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
          
          <Link to="/lp/calculadora" onClick={closeMenu}>
            <Button variant="outline" className="w-full">
              Valora tu empresa
            </Button>
          </Link>

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
