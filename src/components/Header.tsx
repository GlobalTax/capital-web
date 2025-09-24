
import React, { useState } from 'react';
import { SimpleButton } from '@/components/ui/simple-button';
import { Menu, X, Phone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdvancedDesktopNavigation from './header/AdvancedDesktopNavigation';
import AdvancedMobileNavigation from './header/AdvancedMobileNavigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-bold text-black">Capittal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <AdvancedDesktopNavigation />

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/contacto">
              <SimpleButton 
                text="Contacto"
                variant="secondary"
                size="sm"
              />
            </Link>
            <a href="tel:+34912345678" className="p-2 text-black hover:text-gray-600 transition-colors border border-gray-300 rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <Phone size={18} />
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
        <AdvancedMobileNavigation 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>
    </header>
  );
};

export default Header;
