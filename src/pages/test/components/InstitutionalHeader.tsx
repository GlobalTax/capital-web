import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const InstitutionalHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: 'SERVICIOS', href: '/servicios' },
    { label: 'EQUIPO', href: '/equipo' },
    { label: 'CASOS', href: '/casos-exito' },
    { label: 'RECURSOS', href: '/recursos' },
    { label: 'CONTACTO', href: '/contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar - Language selector only */}
      <div className="bg-[hsl(0,0%,10%)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-end items-center h-8">
          <div className="flex items-center gap-3 text-[11px] tracking-wide">
            <button className="text-white font-medium">ES</button>
            <span className="text-white/30">|</span>
            <button className="text-white/50 hover:text-white transition-colors">CA</button>
            <span className="text-white/30">|</span>
            <button className="text-white/50 hover:text-white transition-colors">EN</button>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-transparent backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/test/nuevo-diseno" 
            className="text-white text-2xl tracking-[0.1em] font-normal transition-opacity hover:opacity-80"
          >
            Capittal
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/80 text-[13px] tracking-[0.15em] font-normal transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(0,0%,7%)] border-t border-white/10">
          <nav className="flex flex-col py-6 px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/80 text-sm tracking-[0.15em] py-4 border-b border-white/10 last:border-b-0 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default InstitutionalHeader;
