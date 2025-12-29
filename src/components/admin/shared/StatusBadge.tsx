import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Handshake, 
  Trophy, 
  XCircle, 
  Archive,
  AlertCircle,
  Mail,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeadStatus = 
  | 'new' 
  | 'pending' 
  | 'contacted' 
  | 'qualified' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost' 
  | 'archived'
  | 'scheduled'
  | 'email_sent'
  | 'no_response'
  | 'unknown';

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
}

const statusConfigs: Record<LeadStatus, StatusConfig> = {
  new: {
    label: 'Nuevo',
    icon: Sparkles,
    className: 'bg-[hsl(var(--status-new-bg))] text-[hsl(var(--status-new))] border-[hsl(var(--status-new)/0.3)]'
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending)/0.3)]'
  },
  contacted: {
    label: 'Contactado',
    icon: Phone,
    className: 'bg-[hsl(var(--status-contacted-bg))] text-[hsl(var(--status-contacted))] border-[hsl(var(--status-contacted)/0.3)]'
  },
  qualified: {
    label: 'Cualificado',
    icon: CheckCircle2,
    className: 'bg-[hsl(var(--status-qualified-bg))] text-[hsl(var(--status-qualified))] border-[hsl(var(--status-qualified)/0.3)]'
  },
  negotiation: {
    label: 'En Negociación',
    icon: Handshake,
    className: 'bg-[hsl(var(--status-negotiation-bg))] text-[hsl(var(--status-negotiation))] border-[hsl(var(--status-negotiation)/0.3)]'
  },
  closed_won: {
    label: 'Cerrado Ganado',
    icon: Trophy,
    className: 'bg-[hsl(var(--status-closed-won-bg))] text-[hsl(var(--status-closed-won))] border-[hsl(var(--status-closed-won)/0.3)]'
  },
  closed_lost: {
    label: 'Cerrado Perdido',
    icon: XCircle,
    className: 'bg-[hsl(var(--status-closed-lost-bg))] text-[hsl(var(--status-closed-lost))] border-[hsl(var(--status-closed-lost)/0.3)]'
  },
  archived: {
    label: 'Archivado',
    icon: Archive,
    className: 'bg-[hsl(var(--status-archived-bg))] text-[hsl(var(--status-archived))] border-[hsl(var(--status-archived)/0.3)]'
  },
  scheduled: {
    label: 'Programado',
    icon: Calendar,
    className: 'bg-[hsl(var(--status-contacted-bg))] text-[hsl(var(--status-contacted))] border-[hsl(var(--status-contacted)/0.3)]'
  },
  email_sent: {
    label: 'Email Enviado',
    icon: Mail,
    className: 'bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending)/0.3)]'
  },
  no_response: {
    label: 'Sin Respuesta',
    icon: AlertCircle,
    className: 'bg-[hsl(var(--status-closed-lost-bg))] text-[hsl(var(--status-closed-lost))] border-[hsl(var(--status-closed-lost)/0.3)]'
  },
  unknown: {
    label: 'Desconocido',
    icon: HelpCircle,
    className: 'bg-[hsl(var(--status-archived-bg))] text-[hsl(var(--status-archived))] border-[hsl(var(--status-archived)/0.3)]'
  }
};

interface StatusBadgeProps {
  status: LeadStatus | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const normalizedStatus = (status?.toLowerCase().replace(/[\s-]/g, '_') || 'unknown') as LeadStatus;
  const config = statusConfigs[normalizedStatus] || statusConfigs.unknown;
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
    </Badge>
  );
}
