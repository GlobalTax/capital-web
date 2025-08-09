
import React, { useState } from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Menu, X, Phone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdvancedDesktopNavigation from './header/AdvancedDesktopNavigation';
import AdvancedMobileNavigation from './header/AdvancedMobileNavigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">Capittal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <AdvancedDesktopNavigation />

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* DEV ONLY - Admin access button for development */}
            {import.meta.env.DEV && (
              <Link to="/admin">
                <InteractiveHoverButton 
                  text="🔧"
                  variant="secondary"
                  size="sm"
                  className="bg-muted text-muted-foreground hover:bg-accent border-border opacity-50 hover:opacity-100"
                />
              </Link>
            )}
            <Link to="/contacto">
              <InteractiveHoverButton 
                text="Contacto"
                variant="secondary"
                size="sm"
              />
            </Link>
            <a href="tel:+34912345678" className="p-2 text-foreground hover:text-muted-foreground transition-colors border-0.5 border-border rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <Phone size={18} />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground hover:text-muted-foreground"
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
