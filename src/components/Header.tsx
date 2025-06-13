
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const serviciosItems = [
    { label: 'Fusiones y Adquisiciones', href: '/servicios/fusiones-adquisiciones' },
    { label: 'Due Diligence', href: '/servicios/due-diligence' },
    { label: 'Valoraciones', href: '/servicios/valoraciones' },
    { label: 'Corporate Finance', href: '/servicios/corporate-finance' },
    { label: 'Reestructuraciones', href: '/servicios/reestructuraciones' },
  ];

  const sectoresItems = [
    { label: 'Tecnología', href: '/sectores/tecnologia' },
    { label: 'Healthcare', href: '/sectores/healthcare' },
    { label: 'Industrial', href: '/sectores/industrial' },
    { label: 'Retail & Consumer', href: '/sectores/retail-consumer' },
    { label: 'Financial Services', href: '/sectores/financial-services' },
  ];

  const recursosItems = [
    { label: 'Market Reports', href: '/recursos/market-reports' },
    { label: 'Webinars', href: '/recursos/webinars' },
    { label: 'Case Studies', href: '/recursos/case-studies' },
    { label: 'Newsletter', href: '/recursos/newsletter' },
    { label: 'Blog', href: '/recursos/blog' },
  ];

  const navItems = [
    { label: 'Nosotros', href: '#nosotros' },
    { label: 'Casos de Éxito', href: '#casos' },
    { label: 'Equipo', href: '#equipo' },
    { label: 'Contacto', href: '#contacto' },
  ];

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
          <nav className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-black font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
                    Servicios
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 bg-white">
                      {serviciosItems.map((item) => (
                        <NavigationMenuLink key={item.label} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                          >
                            <div className="text-sm font-medium leading-none">{item.label}</div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-black font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
                    Sectores
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 bg-white">
                      {sectoresItems.map((item) => (
                        <NavigationMenuLink key={item.label} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                          >
                            <div className="text-sm font-medium leading-none">{item.label}</div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-black font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
                    Recursos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 bg-white">
                      {recursosItems.map((item) => (
                        <NavigationMenuLink key={item.label} asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                          >
                            <div className="text-sm font-medium leading-none">{item.label}</div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-black font-medium hover:text-gray-600 transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

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
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b-0.5 border-black animate-slide-in">
            <nav className="px-4 py-6 space-y-4">
              {/* Mobile Servicios */}
              <div>
                <div className="text-black font-medium mb-2">Servicios</div>
                <div className="pl-4 space-y-2">
                  {serviciosItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Sectores */}
              <div>
                <div className="text-black font-medium mb-2">Sectores</div>
                <div className="pl-4 space-y-2">
                  {sectoresItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Recursos */}
              <div>
                <div className="text-black font-medium mb-2">Recursos</div>
                <div className="pl-4 space-y-2">
                  {recursosItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-black font-medium hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button className="capittal-button w-full mt-4">
                Consulta Gratuita
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
