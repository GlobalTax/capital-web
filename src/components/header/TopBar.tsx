import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Search } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { useTopBarConfig } from '@/hooks/useTopBarConfig';
import { GroupCompaniesDropdown } from './GroupCompaniesDropdown';

const TopBar: React.FC = () => {
  const { lang } = useI18n();
  const { config, links, companies, isLoading } = useTopBarConfig();

  // Filter active links
  const activeLinks = links.filter(l => l.is_active);

  return (
    <div className="hidden md:block bg-slate-900 h-10 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Group companies dropdown + Secondary navigation links */}
          <nav className="flex items-center space-x-1">
            {/* Group Companies Dropdown */}
            {companies.length > 0 && (
              <>
                <div className="text-white">
                  <GroupCompaniesDropdown companies={companies} />
                </div>
                {activeLinks.length > 0 && (
                  <span className="text-white/30 mx-2">|</span>
                )}
              </>
            )}
            
            {/* Secondary Links - now from database */}
            {activeLinks.map((link, index) => (
              <React.Fragment key={link.id}>
                {link.is_external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white text-sm px-3 py-1 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white text-sm px-3 py-1 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                )}
                {index < activeLinks.length - 1 && (
                  <span className="text-white/30">|</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Right: Utilities */}
          <div className="flex items-center space-x-4">
            {config.show_language_selector && (
              <LanguageSelector className="text-white/70 hover:text-white" />
            )}
            
            <a 
              href={`tel:${config.phone_link}`}
              className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              <Phone size={14} />
              <span>{config.phone_number}</span>
            </a>

            {config.show_search && (
              <button 
                className="text-white/70 hover:text-white p-1.5 transition-colors duration-200"
                aria-label="Buscar"
              >
                <Search size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
