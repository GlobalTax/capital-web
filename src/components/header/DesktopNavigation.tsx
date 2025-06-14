
import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

interface NavItem {
  label: string;
  href: string;
}

interface DesktopNavigationProps {
  porQueElegirnosItems: NavItem[];
  serviciosItems: NavItem[];
  sectoresItems: NavItem[];
  recursosItems: NavItem[];
  empresaItems: NavItem[];
  navItems: NavItem[];
}

const DesktopNavigation = ({ 
  porQueElegirnosItems, 
  serviciosItems, 
  sectoresItems, 
  recursosItems, 
  empresaItems,
  navItems 
}: DesktopNavigationProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
              Empresa
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[250px] gap-3 p-4 bg-white">
                {empresaItems.map((item) => (
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
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
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
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
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
            <NavigationMenuTrigger className="text-black text-sm font-medium hover:text-gray-600 bg-transparent hover:bg-transparent">
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
        <Link
          key={item.label}
          to={item.href}
          className="text-black text-sm font-medium hover:text-gray-600 transition-colors duration-200"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default DesktopNavigation;
