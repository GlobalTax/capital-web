import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { SidebarSection as SidebarSectionType } from './SidebarConfig';
import { SidebarMenuItem } from './SidebarMenuItem';

interface SidebarSectionProps {
  section: SidebarSectionType;
  visibleItems: SidebarSectionType['items'];
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ section, visibleItems }) => {
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup className="px-3">
      <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2">
        {section.title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};