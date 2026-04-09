import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarItem } from '@/features/admin/config/sidebar-config';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarSubGroupProps {
  parentItem: SidebarItem;
}

export const SidebarSubGroup: React.FC<SidebarSubGroupProps> = ({ parentItem }) => {
  const location = useLocation();
  const subItems = parentItem.subItems || [];
  
  const isParentActive = location.pathname === parentItem.url || location.pathname.startsWith(parentItem.url + '/');
  const hasActiveChild = subItems.some(sub => 
    location.pathname === sub.url || location.pathname.startsWith(sub.url + '/')
  );
  
  const [isOpen, setIsOpen] = useState(isParentActive || hasActiveChild);

  return (
    <li className="space-y-0.5">
      {/* Parent item as clickable header */}
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 p-1 rounded hover:bg-[hsl(var(--linear-bg-hover))] transition-colors"
        >
          <ChevronRight className={cn(
            "h-3 w-3 text-[hsl(var(--linear-text-tertiary))] transition-transform duration-150",
            isOpen && "rotate-90"
          )} />
        </button>
        <div className="flex-1 min-w-0">
          <SidebarMenuItem item={parentItem} />
        </div>
      </div>
      
      {/* Sub-items indented */}
      <div className={cn(
        "overflow-hidden transition-all duration-150 ml-3 pl-3 border-l border-[hsl(var(--linear-border))]",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <ul className="space-y-0.5">
          {subItems.map(sub => (
            <SidebarMenuItem key={sub.url} item={sub} />
          ))}
        </ul>
      </div>
    </li>
  );
};
