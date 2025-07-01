
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { VersionSwitcher } from './VersionSwitcher';
import { SearchForm } from './SearchForm';
import { SidebarSearch } from './navigation/SidebarSearch';
import { QuickAccessSection } from './navigation/QuickAccessSection';
import { NavigationGroup } from './navigation/NavigationGroup';
import { navigationGroups } from './navigation/navigationData';

export function ModernAppSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useSidebar();

  // Mostrar resultados de búsqueda si hay query
  if (searchQuery.trim()) {
    return (
      <SidebarSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
    );
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <VersionSwitcher />
        <div className="mt-4">
          <SearchForm onSearch={setSearchQuery} value={searchQuery} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Acceso Rápido */}
        <QuickAccessSection />

        {/* Grupos principales */}
        {navigationGroups.map((group, groupIndex) => (
          <NavigationGroup key={groupIndex} group={group} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
