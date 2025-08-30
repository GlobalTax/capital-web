import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const StickyNavigationLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navItems = [
    { name: '¿Por Qué Elegir?', href: '#beneficios' },
    { name: 'Proceso Fácil', href: '#proceso' },
    { name: 'Valoración Gratis', href: '#valoracion' },
    { name: 'Preguntas', href: '#faq' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-foreground">
              Capittal
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href.substring(1))}
                className={`font-medium transition-colors duration-200 hover:text-blue-600 ${
                  activeSection === item.href.substring(1) 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CTA Button Desktop */}
          <div className="hidden md:block">
            <button
              onClick={scrollToContact}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
            >
              🚀 ¡VALORACIÓN GRATIS!
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href.substring(1))}
                  className={`block w-full text-left px-4 py-2 font-medium transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg ${
                    activeSection === item.href.substring(1) 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile CTA */}
              <div className="px-4 pt-4 border-t border-gray-200">
                <button
                  onClick={scrollToContact}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg animate-pulse"
                >
                  🚀 ¡VALORACIÓN GRATIS!
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default StickyNavigationLanding;