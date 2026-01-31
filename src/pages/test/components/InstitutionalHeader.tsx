import React from 'react';
import { Link } from 'react-router-dom';

const InstitutionalHeader: React.FC = () => {
  const navItems = [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Casos de éxito', href: '#casos' },
    { label: 'Equipo', href: '#equipo' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/test/nuevo-diseno" 
            className="text-white text-2xl tracking-wide font-normal transition-opacity hover:opacity-80"
          >
            Capittal
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/70 text-sm tracking-wide font-normal transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <Link
            to="/lp/calculadora"
            className="hidden md:inline-flex px-5 py-2.5 border border-white/30 text-white text-sm tracking-wide font-normal transition-all hover:bg-white hover:text-[hsl(var(--dark-bg))]"
          >
            Valorar empresa
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default InstitutionalHeader;
