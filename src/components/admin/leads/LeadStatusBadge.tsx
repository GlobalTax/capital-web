import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';

interface LeadStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

// Fallback config for when statuses haven't loaded yet
const FALLBACK_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  nuevo: { label: 'Nuevo', icon: '📥', color: 'blue' },
  contactando: { label: 'Contactando', icon: '📞', color: 'purple' },
  calificado: { label: 'Calificado', icon: '✅', color: 'cyan' },
  propuesta_enviada: { label: 'Propuesta Enviada', icon: '📄', color: 'indigo' },
  negociacion: { label: 'Negociación', icon: '🤝', color: 'orange' },
  en_espera: { label: 'En Espera', icon: '⏸️', color: 'yellow' },
  ganado: { label: 'Ganado', icon: '🏆', color: 'green' },
  perdido: { label: 'Perdido', icon: '❌', color: 'red' },
  archivado: { label: 'Archivado', icon: '📦', color: 'gray' },
  fase0_activo: { label: 'Fase 0 Activo', icon: '🚀', color: 'emerald' },
  fase0_bloqueado: { label: 'Fase 0 Bloqueado', icon: '🔒', color: 'slate' },
  mandato_propuesto: { label: 'Mandato Propuesto', icon: '📋', color: 'amber' },
  mandato_firmado: { label: 'Mandato Firmado', icon: '✍️', color: 'teal' },
};

export function LeadStatusBadge({ status, showIcon = true }: LeadStatusBadgeProps) {
  const { getStatusByKey, isLoading } = useContactStatuses();
  
  // Try to get dynamic config, fallback to static
  const dynamicStatus = getStatusByKey(status);
  const config = dynamicStatus 
    ? { label: dynamicStatus.label, icon: dynamicStatus.icon, color: dynamicStatus.color }
    : FALLBACK_CONFIG[status] || { label: status, icon: '📋', color: 'gray' };
  
  const colorClasses = STATUS_COLOR_MAP[config.color] || STATUS_COLOR_MAP.gray;

  return (
    <Badge 
      variant="secondary" 
      className={`${colorClasses.bg} ${colorClasses.text} hover:${colorClasses.bg}`}
    >
      
      {config.label}
    </Badge>
  );
}
