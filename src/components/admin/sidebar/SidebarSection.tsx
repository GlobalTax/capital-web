import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { SidebarSection as SidebarSectionType } from '@/features/admin/config/sidebar-config';
import { SidebarMenuItem } from './SidebarMenuItem';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  section: SidebarSectionType;
  visibleItems: SidebarSectionType['items'];
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ 
  section, 
  visibleItems
}) => {
  const location = useLocation();
  
  // Check if any item in this section is active
  const hasActiveItem = visibleItems.some(item => 
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );
  
  // Start expanded if has active item, otherwise collapsed
  const [isExpanded, setIsExpanded] = useState(hasActiveItem);

  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup className="px-2 py-0.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[hsl(var(--linear-bg-hover))] rounded-md transition-colors group"
      >
        <SidebarGroupLabel className="text-[10px] font-medium text-[hsl(var(--linear-text-tertiary))] uppercase tracking-wider pointer-events-none m-0 p-0">
          {section.title}
        </SidebarGroupLabel>
        <ChevronDown 
          className={cn(
            "h-3 w-3 text-[hsl(var(--linear-text-tertiary))] transition-transform duration-200",
            !isExpanded && "-rotate-90"
          )} 
        />
      </button>
      
      <SidebarGroupContent className={cn(
        "overflow-hidden transition-all duration-200",
        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <SidebarMenu className="space-y-0.5 mt-0.5">
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
