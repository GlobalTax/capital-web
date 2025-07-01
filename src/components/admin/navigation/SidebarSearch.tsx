
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar';
import { VersionSwitcher } from '../VersionSwitcher';
import { SearchForm } from '../SearchForm';
import { NavigationItem, navigationGroups, quickAccessItems } from './navigationData';

interface SidebarSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SidebarSearch({ searchQuery, onSearchChange }: SidebarSearchProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  // Combinar todos los items para la búsqueda
  const allItems = useMemo(() => {
    const items: NavigationItem[] = [];
    navigationGroups.forEach(group => {
      items.push(...group.items);
    });
    items.push(...quickAccessItems);
    return items;
  }, []);

  // Filtrar items basado en la búsqueda
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery, allItems]);

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'URGENTE':
        return 'bg-red-500 text-white animate-pulse';
      case 'AI':
        return 'bg-blue-500 text-white';
      case 'NEW':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  const isActive = (path: string) => location.pathname === `/admin/${path}`;

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <VersionSwitcher />
        <div className="mt-4">
          <SearchForm onSearch={onSearchChange} value={searchQuery} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Resultados ({filteredItems.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.id)}
                    className="group"
                  >
                    <NavLink to={`/admin/${item.id}`}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className={getBadgeStyles(item.badge)}>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
