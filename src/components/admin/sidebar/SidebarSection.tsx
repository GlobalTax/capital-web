import React, { useState } from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarSection as SidebarSectionType } from './SidebarConfig';
import { SidebarMenuItem } from './SidebarMenuItem';

interface SidebarSectionProps {
  section: SidebarSectionType;
  visibleItems: SidebarSectionType['items'];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ 
  section, 
  visibleItems, 
  isExpanded = false, 
  onToggle 
}) => {
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup className="px-3">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2 cursor-pointer hover:text-sidebar-foreground transition-colors flex items-center justify-between group">
            <span>{section.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 transition-transform group-hover:text-sidebar-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 transition-transform group-hover:text-sidebar-foreground" />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};