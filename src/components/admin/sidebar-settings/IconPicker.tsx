import React, { useState, useMemo } from 'react';
import { icons, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

// Common icons shown first
const COMMON_ICONS = [
  'LayoutDashboard', 'Target', 'Users', 'Building2', 'FileText', 
  'Settings', 'TrendingUp', 'Mail', 'Briefcase', 'Calculator',
  'Eye', 'Shield', 'Tags', 'FolderOpen', 'Award', 'Zap',
  'Globe', 'Megaphone', 'Image', 'MessageSquare', 'Bell',
  'Workflow', 'Search', 'Newspaper', 'CalendarDays', 'UserPlus',
  'ShoppingCart', 'ClipboardList', 'Menu', 'Kanban', 'Circle'
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const allIconNames = useMemo(() => Object.keys(icons), []);

  const filteredIcons = useMemo(() => {
    if (!search.trim()) {
      // Show common icons first, then rest alphabetically
      const commonSet = new Set(COMMON_ICONS);
      const rest = allIconNames.filter(name => !commonSet.has(name)).sort();
      return [...COMMON_ICONS.filter(name => allIconNames.includes(name)), ...rest];
    }
    return allIconNames.filter(name => 
      name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100); // Limit to 100 for performance
  }, [search, allIconNames]);

  const CurrentIcon = icons[value as keyof typeof icons] as LucideIcon | undefined;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          {CurrentIcon ? (
            <CurrentIcon className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4 bg-muted rounded" />
          )}
          <span className="truncate">{value || 'Seleccionar icono'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background border" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Buscar icono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.slice(0, 150).map((iconName) => {
              const Icon = icons[iconName as keyof typeof icons] as LucideIcon;
              if (!Icon) return null;
              
              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handleSelect(iconName)}
                  title={iconName}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        {filteredIcons.length > 150 && (
          <div className="p-2 text-xs text-muted-foreground text-center border-t">
            Mostrando 150 de {filteredIcons.length} iconos
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
