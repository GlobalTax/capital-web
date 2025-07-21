
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ArrowRight } from 'lucide-react';
import { sectoresData } from '../data/sectoresData';

const SectoresMenu = React.memo(() => (
  <div className="grid gap-6 md:grid-cols-3">
    {sectoresData[0].items.map((sector) => (
      <NavigationMenuLink key={sector.id} asChild>
        <Link
          to={sector.href}
          className="group flex flex-col space-y-4 p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              <sector.icon className="size-6 text-gray-700" />
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
));

SectoresMenu.displayName = 'SectoresMenu';

export default SectoresMenu;
