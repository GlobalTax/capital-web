import React from 'react';
import { icons, LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSectionWithItems } from '@/types/sidebar-config';

interface SidebarPreviewProps {
  sections: SidebarSectionWithItems[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

const BadgePreview: React.FC<{ badge: string | null }> = ({ badge }) => {
  if (!badge) return null;

  const styles: Record<string, string> = {
    'URGENTE': 'bg-red-500/20 text-red-400 border-red-500/30',
    'AI': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'NEW': 'bg-green-500/20 text-green-400 border-green-500/30',
    'HOT': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <span className={cn(
      'text-[8px] px-1 py-0.5 rounded border font-medium',
      styles[badge] || 'bg-muted text-muted-foreground'
    )}>
      {badge}
    </span>
  );
};

export const SidebarPreview: React.FC<SidebarPreviewProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
}) => {
  return (
    <div className="w-56 bg-sidebar border rounded-lg overflow-hidden shadow-lg">
      <div className="p-2 border-b bg-sidebar-accent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">C</span>
          </div>
          <span className="text-xs font-medium text-sidebar-foreground">Capittal Admin</span>
        </div>
      </div>

      <div className="p-1 max-h-80 overflow-y-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              'rounded cursor-pointer mb-1',
              selectedSectionId === section.id && 'ring-2 ring-primary ring-offset-1'
            )}
            onClick={() => onSelectSection(section.id)}
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-2 py-1.5 hover:bg-sidebar-accent rounded">
              <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wide truncate">
                {section.emoji} {section.title.replace(/^[^\s]+\s/, '')}
              </span>
              <ChevronDown className="h-3 w-3 text-sidebar-foreground/50" />
            </div>

            {/* Section items */}
            <div className="pl-1">
              {section.items.slice(0, 4).map((item) => {
                const Icon = icons[item.icon as keyof typeof icons] as LucideIcon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-sidebar-foreground/80 hover:bg-sidebar-accent rounded"
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    <span className="truncate flex-1">{item.title}</span>
                    <BadgePreview badge={item.badge} />
                  </div>
                );
              })}
              {section.items.length > 4 && (
                <div className="px-2 py-1 text-[9px] text-sidebar-foreground/50">
                  +{section.items.length - 4} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t bg-sidebar-accent">
        <p className="text-[9px] text-sidebar-foreground/50 text-center">
          Vista previa • {sections.length} secciones
        </p>
      </div>
    </div>
  );
};
