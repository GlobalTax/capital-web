import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Search } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { getLocalizedUrl } from '@/shared/i18n/dictionaries';
import LanguageSelector from '@/components/i18n/LanguageSelector';

const TopBar: React.FC = () => {
  const { lang, t } = useI18n();

  const secondaryLinks = [
    { label: 'Calculadora', href: getLocalizedUrl('calculadora', lang) },
    { label: 'Blog', href: getLocalizedUrl('blog', lang) },
    { label: 'Casos de Éxito', href: getLocalizedUrl('casos-exito', lang) },
    { label: 'Partners', href: getLocalizedUrl('colaboradores', lang) },
  ];

  return (
    <div className="hidden md:block bg-slate-900 h-10 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Secondary navigation links */}
          <nav className="flex items-center space-x-1">
            {secondaryLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                <Link
                  to={link.href}
                  className="text-white/70 hover:text-white text-sm px-3 py-1 transition-colors duration-200"
                >
                  {link.label}
                </Link>
                {index < secondaryLinks.length - 1 && (
                  <span className="text-white/30">|</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Right: Utilities */}
          <div className="flex items-center space-x-4">
            <LanguageSelector className="text-white/70 hover:text-white" />
            
            <a 
              href="tel:+34695717490" 
              className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              <Phone size={14} />
              <span>695 717 490</span>
            </a>

            <button 
              className="text-white/70 hover:text-white p-1.5 transition-colors duration-200"
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
