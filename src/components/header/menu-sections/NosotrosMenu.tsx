
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ArrowRight } from 'lucide-react';
import { nosotrosData } from '../data/nosotrosData';

const NosotrosMenu = React.memo(() => (
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
              <item.icon className="size-5 text-gray-600" />
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
));

NosotrosMenu.displayName = 'NosotrosMenu';

export default NosotrosMenu;
