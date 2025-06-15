
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import { menuData } from './header/menuData';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50">
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
              <Button className="capittal-button">
                Contacto
              </Button>
            </Link>
            <a href="tel:+34912345678" className="p-2 text-black hover:text-gray-600 transition-colors border-0.5 border-black rounded-md">
              <Phone size={20} />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
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
