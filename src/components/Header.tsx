
import React, { useState } from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Menu, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import { menuData } from './header/menuData';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-black">
              Capittal
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation 
            serviciosItems={menuData.serviciosItems}
            sectoresItems={menuData.sectoresItems}
            recursosItems={menuData.recursosItems}
            nosotrosItems={menuData.nosotrosItems}
            navItems={menuData.navItems}
          />

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/contacto">
              <InteractiveHoverButton 
                text="Contacto"
                variant="default"
                size="default"
              />
            </Link>
            <a href="tel:+34912345678" className="p-2 text-black hover:text-gray-600 transition-colors border border-gray-300 rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <Phone size={20} />
            </a>
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
        <MobileNavigation 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          serviciosItems={menuData.serviciosItems}
          sectoresItems={menuData.sectoresItems}
          recursosItems={menuData.recursosItems}
          nosotrosItems={menuData.nosotrosItems}
          navItems={menuData.navItems}
        />
      </div>
    </header>
  );
};

export default Header;
