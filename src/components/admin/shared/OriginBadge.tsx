import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calculator, 
  Handshake, 
  Building2, 
  Briefcase,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeadOrigin = 
  | 'contact' 
  | 'valuation' 
  | 'collaborator' 
  | 'acquisition' 
  | 'advisor'
  | 'investor'
  | 'unknown';

interface OriginConfig {
  label: string;
  icon: React.ElementType;
  className: string;
}

const originConfigs: Record<LeadOrigin, OriginConfig> = {
  contact: {
    label: 'Contacto',
    icon: Users,
    className: 'bg-[hsl(var(--origin-contact-bg))] text-[hsl(var(--origin-contact))] border-[hsl(var(--origin-contact)/0.3)]'
  },
  valuation: {
    label: 'Valoración',
    icon: Calculator,
    className: 'bg-[hsl(var(--origin-valuation-bg))] text-[hsl(var(--origin-valuation))] border-[hsl(var(--origin-valuation)/0.3)]'
  },
  collaborator: {
    label: 'Colaborador',
    icon: Handshake,
    className: 'bg-[hsl(var(--origin-collaborator-bg))] text-[hsl(var(--origin-collaborator))] border-[hsl(var(--origin-collaborator)/0.3)]'
  },
  acquisition: {
    label: 'Adquisición',
    icon: Building2,
    className: 'bg-[hsl(var(--origin-acquisition-bg))] text-[hsl(var(--origin-acquisition))] border-[hsl(var(--origin-acquisition)/0.3)]'
  },
  advisor: {
    label: 'Asesor',
    icon: Briefcase,
    className: 'bg-[hsl(var(--origin-advisor-bg))] text-[hsl(var(--origin-advisor))] border-[hsl(var(--origin-advisor)/0.3)]'
  },
  investor: {
    label: 'Inversor',
    icon: TrendingUp,
    className: 'bg-[hsl(var(--origin-investor-bg))] text-[hsl(var(--origin-investor))] border-[hsl(var(--origin-investor)/0.3)]'
  },
  unknown: {
    label: 'Desconocido',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground border-border'
  }
};

interface OriginBadgeProps {
  origin: LeadOrigin | string;
  sourceProject?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OriginBadge({ 
  origin, 
  sourceProject,
  showIcon = true, 
  size = 'md',
  className 
}: OriginBadgeProps) {
  const normalizedOrigin = (origin?.toLowerCase().replace(/[\s-]/g, '_') || 'unknown') as LeadOrigin;
  const config = originConfigs[normalizedOrigin] || originConfigs.unknown;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-2.5 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
      {sourceProject && (
        <span className="opacity-60 text-[0.65em]">({sourceProject})</span>
      )}
    </Badge>
  );
}
