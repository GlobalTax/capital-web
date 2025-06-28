
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { serviciosData, sectoresData, recursosData, nosotrosData, colaboradoresData } from './menuData';

interface AdvancedMobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const AdvancedMobileNavigation = ({ isMenuOpen, setIsMenuOpen }: AdvancedMobileNavigationProps) => {
  const [submenu, setSubmenu] = useState<'servicios' | 'sectores' | 'nosotros' | 'recursos' | null>(null);

  if (!isMenuOpen) return null;

  const handleNavClick = () => {
    setIsMenuOpen(false);
    setSubmenu(null);
  };

  return (
    <div className="md:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto">
      <div className="px-4 py-6">
        {submenu && (
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSubmenu(null)}
              className="flex items-center space-x-2 p-0 h-auto text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm">Volver</span>
            </Button>
          </div>
        )}

        {submenu === null && (
          <div className="space-y-1">
            <button
              onClick={() => setSubmenu('servicios')}
              className="flex w-full items-center justify-between px-4 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Servicios</span>
              <ArrowRight className="size-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => setSubmenu('sectores')}
              className="flex w-full items-center justify-between px-4 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Sectores</span>
              <ArrowRight className="size-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => setSubmenu('nosotros')}
              className="flex w-full items-center justify-between px-4 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Nosotros</span>
              <ArrowRight className="size-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => setSubmenu('recursos')}
              className="flex w-full items-center justify-between px-4 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">Recursos</span>
              <ArrowRight className="size-4 text-gray-400" />
            </button>

            {colaboradoresData.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={handleNavClick}
                className="flex w-full items-center justify-between px-4 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <ArrowRight className="size-4 text-gray-400" />
              </Link>
            ))}

            <div className="pt-6 space-y-4">
              <Link to="/contacto" onClick={handleNavClick} className="block w-full">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Contacto
                </Button>
              </Link>
              <a 
                href="tel:+34912345678" 
                className="flex items-center justify-center w-full p-3 border border-black rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Phone size={20} className="text-black" />
              </a>
            </div>
          </div>
        )}

        {submenu === 'servicios' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Servicios</h2>
            {serviciosData.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={handleNavClick}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="size-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {submenu === 'sectores' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sectores</h2>
            <div className="space-y-2">
              {sectoresData[0].items.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={handleNavClick}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="size-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {submenu === 'nosotros' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Nosotros</h2>
            <div className="space-y-2">
              {nosotrosData[0].items.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={handleNavClick}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="size-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {submenu === 'recursos' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recursos</h2>
            {recursosData.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={handleNavClick}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="size-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedMobileNavigation;
