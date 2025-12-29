import React from 'react';
import { LucideIcon, Inbox, Search, FileX, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStatePreset = 'no-data' | 'no-results' | 'no-items' | 'no-users' | 'error';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

const presetConfigs: Record<EmptyStatePreset, { icon: LucideIcon; title: string; description: string }> = {
  'no-data': {
    icon: Inbox,
    title: 'No hay datos',
    description: 'No se encontraron registros para mostrar.'
  },
  'no-results': {
    icon: Search,
    title: 'Sin resultados',
    description: 'No se encontraron coincidencias para tu búsqueda.'
  },
  'no-items': {
    icon: FileX,
    title: 'Sin elementos',
    description: 'Aún no hay elementos creados.'
  },
  'no-users': {
    icon: Users,
    title: 'Sin usuarios',
    description: 'No hay usuarios que coincidan con los criterios.'
  },
  'error': {
    icon: AlertCircle,
    title: 'Error al cargar',
    description: 'Hubo un problema al cargar los datos. Intenta de nuevo.'
  }
};

export function EmptyState({ 
  preset = 'no-data',
  icon,
  title,
  description,
  actions,
  className 
}: EmptyStateProps) {
  const config = presetConfigs[preset];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {displayTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === 0 ? 'default' : 'outline')}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
