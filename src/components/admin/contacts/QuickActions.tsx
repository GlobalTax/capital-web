import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  UserPlus, 
  Download, 
  Filter,
  Keyboard,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onSearch: () => void;
  onNewContact: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  showShortcuts?: boolean;
  onToggleShortcuts: () => void;
  hasFilters: boolean;
  isLoading?: boolean;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSearch,
  onNewContact,
  onExport,
  onRefresh,
  onClearFilters,
  onToggleFilters,
  showShortcuts = false,
  onToggleShortcuts,
  hasFilters,
  isLoading = false,
  className
}) => {
  const actions = [
    {
      key: 'search',
      icon: Search,
      label: 'Búsqueda rápida',
      shortcut: 'Ctrl+K',
      onClick: onSearch,
      variant: 'outline' as const
    },
    {
      key: 'new',
      icon: UserPlus,
      label: 'Nuevo contacto',
      shortcut: 'Ctrl+N',
      onClick: onNewContact,
      variant: 'default' as const
    },
    {
      key: 'export',
      icon: Download,
      label: 'Exportar',
      shortcut: 'Ctrl+E',
      onClick: onExport,
      variant: 'outline' as const
    },
    {
      key: 'refresh',
      icon: RefreshCw,
      label: 'Actualizar',
      shortcut: 'F5',
      onClick: onRefresh,
      variant: 'ghost' as const,
      disabled: isLoading
    },
    {
      key: 'filters',
      icon: Filter,
      label: 'Filtros',
      shortcut: 'F',
      onClick: onToggleFilters,
      variant: 'outline' as const
    }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Tooltip key={action.key}>
              <TooltipTrigger asChild>
                <Button
                  variant={action.variant}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    action.key === 'refresh' && isLoading && "animate-spin"
                  )}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="flex items-center gap-2">
                  <span>{action.label}</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Clear Filters Button (conditional) */}
      {hasFilters && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="flex items-center gap-2">
              <span>Limpiar filtros</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                Esc
              </kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Keyboard Shortcuts Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              showShortcuts && "bg-accent text-accent-foreground"
            )}
            onClick={onToggleShortcuts}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <span>{showShortcuts ? 'Ocultar' : 'Mostrar'} atajos de teclado</span>
        </TooltipContent>
      </Tooltip>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <Card className="absolute top-12 right-0 z-50 w-64 shadow-lg">
          <CardContent className="p-3">
            <h4 className="text-sm font-medium mb-2">Atajos de Teclado</h4>
            <div className="space-y-1 text-xs">
              {actions.map((action) => (
                <div key={action.key} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{action.label}</span>
                  <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Limpiar filtros</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navegar tabla</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                  ↑↓
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ver detalles</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                  Enter
                </kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};