import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu-lazy";
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { serviciosData, sectoresData, recursosData, nosotrosData, colaboradoresData } from './menuDataIndex';
import LazyIcon from '@/components/ui/LazyIcon';

const ServiciosMenu = () => (
  <div className="grid gap-8 lg:grid-cols-4">
    <div className="lg:col-span-1">
      <Link 
        to="/venta-empresas"
        className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-black text-white p-6 hover:bg-gray-900 transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col text-left">
          <span className="mb-6 text-xs font-medium tracking-wider uppercase opacity-80">
            Servicio Principal
          </span>
          <div className="mt-auto flex items-center space-x-1 text-sm font-medium">
            Venta de Empresas
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-2 text-xs opacity-80">
            Maximiza el valor de tu empresa con nuestro proceso optimizado de venta.
          </p>
        </div>
      </Link>
    </div>

    <div className="lg:col-span-3 grid gap-6">
      {serviciosData.map((category) => (
        <div key={category.title} className="space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <strong className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {category.title}
            </strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item) => (
              <NavigationMenuLink key={item.id} asChild>
                <Link
                  to={item.href}
                  className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    {item.icon && <LazyIcon name={item.icon} className="size-6 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                      {item.label}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                </Link>
              </NavigationMenuLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SectoresMenu = () => (
  <div className="grid gap-6 md:grid-cols-3">
    {sectoresData[0].items.map((sector) => (
      <NavigationMenuLink key={sector.id} asChild>
        <Link
          to={sector.href}
          className="group flex flex-col space-y-4 p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              {sector.icon && <LazyIcon name={sector.icon} className="size-6 text-gray-700" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                {sector.label}
              </div>
            </div>
            <ArrowRight className="size-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
          {sector.description && (
            <p className="text-xs text-gray-500 group-hover:text-gray-600">
              {sector.description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    ))}
  </div>
);

const RecursosMenu = () => (
  <div className="grid gap-8 lg:grid-cols-3">
    <div className="lg:col-span-1">
      <Link
        to="/lp/calculadora"
        className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black text-white p-6 hover:from-gray-800 hover:to-gray-900 transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col text-left h-full">
          <span className="mb-4 text-xs font-medium tracking-wider uppercase opacity-80">
            Herramienta Gratuita
          </span>
          <div className="mt-auto">
            <div className="flex items-center space-x-1 text-sm font-medium mb-2">
              Calculadora de Valoración
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs opacity-80">
              Obtén una valoración inicial de tu empresa de forma gratuita.
            </p>
          </div>
        </div>
      </Link>
    </div>

    <div className="lg:col-span-2 grid gap-6">
      {recursosData.map((category) => (
        <div key={category.title} className="space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <strong className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {category.title}
            </strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item) => (
              <NavigationMenuLink key={item.id} asChild>
                <Link
                  to={item.href}
                  className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    {item.icon && <LazyIcon name={item.icon} className="size-5 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                      {item.label}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-gray-400 transition-transform group-hover:translate-x-1 md:hidden" />
                </Link>
              </NavigationMenuLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NosotrosMenu = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <div>
      <Link
        to="/por-que-elegirnos"
        className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-gray-50 p-6 hover:bg-gray-100 transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col text-left h-full">
          <span className="mb-4 text-xs font-medium tracking-wider uppercase text-gray-500">
            Nuestra Diferencia
          </span>
          <div className="mt-auto">
            <div className="flex items-center space-x-1 text-sm font-medium text-gray-900 mb-2">
              Por Qué Elegirnos
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-gray-600">
              Más de 25 años de experiencia en M&A con resultados excepcionales.
            </p>
          </div>
        </div>
      </Link>
    </div>

    <div className="space-y-4">
      {nosotrosData[0].items.slice(1).map((item) => (
        <NavigationMenuLink key={item.id} asChild>
          <Link
            to={item.href}
            className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex-shrink-0">
              {item.icon && <LazyIcon name={item.icon} className="size-5 text-gray-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                {item.label}
              </div>
              {item.description && (
                <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-600">
                  {item.description}
                </p>
              )}
            </div>
            <ArrowRight className="size-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </NavigationMenuLink>
      ))}
    </div>
  </div>
);

const AdvancedDesktopNavigation = () => {
  const { user } = useAuth();
  
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
              Servicios
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[800px] p-6">
                <ServiciosMenu />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {sectoresData?.[0]?.items?.length ? (
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
                Sectores
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[600px] p-6">
                  <SectoresMenu />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : null}

          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
              Nosotros
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[500px] p-6">
                <NosotrosMenu />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
              Recursos
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[700px] p-6">
                <RecursosMenu />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* User specific navigation */}
      {user && (
        <Link
          to="/admin"
          className="text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
        >
          Panel Admin
        </Link>
      )}

      {colaboradoresData.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          className="text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default AdvancedDesktopNavigation;
