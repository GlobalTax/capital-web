import { useOutboundPipelineStages } from '@/hooks/useOutboundPipelineStages';
import { useMemo } from 'react';

export interface SeguimientoOption {
  value: string;
  label: string;
  className: string;
}

// Color mapping from hex to Tailwind classes
const COLOR_CLASS_MAP: Record<string, string> = {
  '#6b7280': 'bg-muted text-muted-foreground border-border',
  '#2563eb': 'bg-blue-50 text-blue-700 border-blue-200',
  '#7c3aed': 'bg-violet-50 text-violet-700 border-violet-200',
  '#ef4444': 'bg-red-50 text-red-600 border-red-200',
  '#f59e0b': 'bg-amber-50 text-amber-700 border-amber-200',
  '#8b5cf6': 'bg-violet-50 text-violet-700 border-violet-200',
  '#10b981': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '#dc2626': 'bg-red-50 text-red-600 border-red-200',
};

const DEFAULT_CLASS = 'bg-muted text-muted-foreground border-border';

const FALLBACK_OPTIONS: SeguimientoOption[] = [
  { value: 'sin_respuesta', label: 'Sin respuesta', className: 'bg-muted text-muted-foreground border-border' },
  { value: 'interesado', label: 'Interesado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'no_interesado', label: 'No interesado', className: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'reunion_agendada', label: 'Reunión agendada', className: 'bg-violet-50 text-violet-700 border-violet-200' },
];

export function useSeguimientoOptions(): SeguimientoOption[] {
  const { activeStages, isLoading } = useOutboundPipelineStages();

  return useMemo(() => {
    if (isLoading || activeStages.length === 0) return FALLBACK_OPTIONS;
    return activeStages.map(s => ({
      value: s.stage_key,
      label: s.label,
      className: COLOR_CLASS_MAP[s.color] || DEFAULT_CLASS,
    }));
  }, [activeStages, isLoading]);
}

export function getSeguimientoOption(options: SeguimientoOption[], value: string | null): SeguimientoOption {
  return options.find(o => o.value === (value || 'sin_respuesta')) || options[0] || FALLBACK_OPTIONS[0];
}
