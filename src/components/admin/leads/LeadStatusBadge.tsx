import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CircleDot, 
  Phone, 
  CheckCircle, 
  FileText, 
  Handshake, 
  Clock, 
  Trophy, 
  XCircle, 
  Archive 
} from 'lucide-react';

interface LeadStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

const STATUS_CONFIG = {
  nuevo: {
    label: 'Nuevo',
    variant: 'default' as const,
    icon: CircleDot,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  contactando: {
    label: 'Contactando',
    variant: 'secondary' as const,
    icon: Phone,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  calificado: {
    label: 'Calificado',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
  },
  propuesta_enviada: {
    label: 'Propuesta Enviada',
    variant: 'secondary' as const,
    icon: FileText,
    className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
  },
  negociacion: {
    label: 'Negociación',
    variant: 'default' as const,
    icon: Handshake,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  en_espera: {
    label: 'En Espera',
    variant: 'outline' as const,
    icon: Clock,
    className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50',
  },
  ganado: {
    label: 'Ganado',
    variant: 'default' as const,
    icon: Trophy,
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  perdido: {
    label: 'Perdido',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  archivado: {
    label: 'Archivado',
    variant: 'outline' as const,
    icon: Archive,
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  },
};

export function LeadStatusBadge({ status, showIcon = true }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.nuevo;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
