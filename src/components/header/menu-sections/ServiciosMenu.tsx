
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ArrowRight } from 'lucide-react';
import { serviciosData } from '../data/serviciosData';

const ServiciosMenu = React.memo(() => (
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
                    <item.icon className="size-6 text-gray-600" />
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
));

ServiciosMenu.displayName = 'ServiciosMenu';

export default ServiciosMenu;
