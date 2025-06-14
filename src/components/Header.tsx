
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import { menuData } from './header/menuData';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b-0.5 border-black z-50">
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
            porQueElegirnosItems={menuData.porQueElegirnosItems}
            serviciosItems={menuData.serviciosItems}
            sectoresItems={menuData.sectoresItems}
            recursosItems={menuData.recursosItems}
            empresaItems={menuData.empresaItems}
            navItems={menuData.navItems}
          />

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="capittal-button">
              Consulta Gratuita
            </Button>
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
          porQueElegirnosItems={menuData.porQueElegirnosItems}
          serviciosItems={menuData.serviciosItems}
          sectoresItems={menuData.sectoresItems}
          recursosItems={menuData.recursosItems}
          empresaItems={menuData.empresaItems}
          navItems={menuData.navItems}
        />
      </div>
    </header>
  );
};

export default Header;
