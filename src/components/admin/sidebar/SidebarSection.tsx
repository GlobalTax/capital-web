import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarSeparator } from '@/components/ui/sidebar';
import { SidebarSection as SidebarSectionType } from '@/features/admin/config/sidebar-config';
import { SidebarMenuItem } from './SidebarMenuItem';

interface SidebarSectionProps {
  section: SidebarSectionType;
  visibleItems: SidebarSectionType['items'];
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ 
  section, 
  visibleItems
}) => {
  if (visibleItems.length === 0) return null;

  return (
    <>
      <SidebarGroup className="px-2 py-2">
        <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
          {section.title}
        </SidebarGroupLabel>
        
        <SidebarGroupContent>
          <SidebarMenu className="space-y-0.5">
            {visibleItems.map((item) => (
              <SidebarMenuItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="my-2" />
    </>
  );
};