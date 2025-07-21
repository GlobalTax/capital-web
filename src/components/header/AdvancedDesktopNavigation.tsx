
import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { colaboradoresData } from './menuDataIndex';
import ServiciosMenu from './menu-sections/ServiciosMenu';
import SectoresMenu from './menu-sections/SectoresMenu';
import RecursosMenu from './menu-sections/RecursosMenu';
import NosotrosMenu from './menu-sections/NosotrosMenu';

const AdvancedDesktopNavigation = React.memo(() => {
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
});

AdvancedDesktopNavigation.displayName = 'AdvancedDesktopNavigation';

export default AdvancedDesktopNavigation;
