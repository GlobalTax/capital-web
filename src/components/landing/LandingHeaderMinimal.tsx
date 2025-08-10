import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const LandingHeaderMinimal: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col" aria-label="Capittal - Inicio">
              <span className="text-2xl font-bold text-black">Capittal</span>
            </Link>
          </div>

          {/* CTAs mínimos */}
          <div className="flex items-center space-x-3">
            <Link to="/contacto">
              <InteractiveHoverButton
                text="Contacto"
                variant="secondary"
                size="sm"
              />
            </Link>
            <a
              href="tel:+34912345678"
              aria-label="Llamar ahora"
              className="p-2 text-black hover:text-gray-600 transition-colors border-0.5 border-black rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 ease-out"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeaderMinimal;
