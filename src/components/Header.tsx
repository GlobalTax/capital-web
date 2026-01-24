import React, { useState } from 'react';
import { SimpleButton } from '@/components/ui/simple-button';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { getLocalizedUrl } from '@/shared/i18n/dictionaries';
import AdvancedDesktopNavigation from './header/AdvancedDesktopNavigation';
import AdvancedMobileNavigation from './header/AdvancedMobileNavigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, t } = useI18n();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 md:top-10 left-0 right-0 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={getLocalizedUrl('home', lang)} className="flex flex-col">
              <span className="text-2xl font-bold text-black">Capittal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <AdvancedDesktopNavigation />

          {/* CTA Buttons - Updated styling */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to={getLocalizedUrl('oficinas', lang)}>
              <SimpleButton 
                text="Nuestras Oficinas"
                variant="secondary"
                size="sm"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              />
            </Link>
            <Link to={getLocalizedUrl('contacto', lang)}>
              <SimpleButton 
                text={t('nav.contacto')}
                variant="primary"
                size="sm"
                className="bg-amber-500 text-slate-900 hover:bg-amber-400 border-amber-500"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-black hover:text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AdvancedMobileNavigation 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>
    </header>
  );
};

export default Header;
