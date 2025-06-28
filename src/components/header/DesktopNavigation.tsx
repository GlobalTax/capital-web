
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from 'lucide-react';

import { serviciosData } from './data/serviciosData';
import { sectoresData } from './data/sectoresData';
import { nosotrosData } from './data/nosotrosData';
import { recursosData } from './data/recursosData';
import { colaboradoresData } from './data/colaboradoresData';

const DesktopNavigation = () => {
  const renderMenuItems = (items: any[]) => {
    return items.map((item, index) => (
      <li key={index}>
        <NavigationMenuLink asChild>
          <Link
            className="nav-item block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            to={item.href}
          >
            <div className="card-subtitle leading-none">{item.title}</div>
            <p className="help-text line-clamp-2 leading-snug text-muted-foreground">
              {item.description}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    ));
  };

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {/* Servicios */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-item bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50">
            Servicios
            <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {renderMenuItems(serviciosData)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Sectores */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-item bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50">
            Sectores
            <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {renderMenuItems(sectoresData)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Nosotros */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-item bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50">
            Nosotros
            <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[500px]">
              {renderMenuItems(nosotrosData)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Recursos */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-item bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50">
            Recursos
            <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {renderMenuItems(recursosData)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Colaboradores */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-item bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50">
            Colaboradores
            <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[500px]">
              {renderMenuItems(colaboradoresData)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Contacto */}
        <NavigationMenuItem>
          <Link to="/contacto">
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "nav-item bg-transparent hover:bg-gray-50")}>
              Contacto
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default DesktopNavigation;
