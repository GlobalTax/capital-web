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
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-end items-center h-8">
          <div className="flex items-center gap-3 text-[11px] tracking-wide">
            <button className="text-slate-900 font-medium">ES</button>
            <span className="text-slate-300">|</span>
            <button className="text-slate-500 hover:text-slate-900 transition-colors">CA</button>
            <span className="text-slate-300">|</span>
            <button className="text-slate-500 hover:text-slate-900 transition-colors">EN</button>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/test/nuevo-diseno" 
            className="text-slate-900 text-2xl tracking-[0.1em] font-normal transition-opacity hover:opacity-70"
          >
            Capittal
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-600 text-[13px] tracking-[0.15em] font-normal transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-slate-900 p-2"
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
        <div className="lg:hidden bg-white border-t border-slate-200">
          <nav className="flex flex-col py-6 px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-600 text-sm tracking-[0.15em] py-4 border-b border-slate-100 last:border-b-0 transition-colors hover:text-slate-900"
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
