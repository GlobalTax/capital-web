// ============= CR FUND HISTORY =============
// Historial de cambios de un fund de Capital Riesgo

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, Plus, Pencil, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRFundAuditLog } from '@/hooks/useCRFundAuditLog';
import type { CRFundAuditLog } from '@/types/capitalRiesgo';
import { Skeleton } from '@/components/ui/skeleton';

interface CRFundHistoryProps {
  fundId: string;
}

const fieldLabels: Record<string, string> = {
  name: 'Nombre',
  status: 'Estado',
  fund_type: 'Tipo de fund',
  website: 'Website',
  country_base: 'País base',
  cities: 'Ciudades',
  geography_focus: 'Foco geográfico',
  sector_focus: 'Sectores objetivo',
  sector_exclusions: 'Sectores excluidos',
  investment_stage: 'Etapas de inversión',
  deal_types: 'Tipos de deal',
  ticket_min: 'Ticket mín.',
  ticket_max: 'Ticket máx.',
  ebitda_min: 'EBITDA mín.',
  ebitda_max: 'EBITDA máx.',
  revenue_min: 'Revenue mín.',
  revenue_max: 'Revenue máx.',
  aum: 'AUM',
  current_fund_size: 'Tamaño fund actual',
  current_fund_number: 'Número fund actual',
  founded_year: 'Año fundación',
  description: 'Descripción',
  notes_internal: 'Notas internas',
  source_url: 'URL fuente',
};

const actionConfig: Record<string, { label: string; icon: typeof Plus; variant: 'default' | 'secondary' | 'destructive' }> = {
  INSERT: { label: 'Creado', icon: Plus, variant: 'default' },
  UPDATE: { label: 'Modificado', icon: Pencil, variant: 'secondary' },
  DELETE: { label: 'Eliminado', icon: Trash2, variant: 'destructive' },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(vacío)';
  if (Array.isArray(value)) return value.join(', ') || '(vacío)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function AuditLogEntry({ entry }: { entry: CRFundAuditLog }) {
  const config = actionConfig[entry.action] || actionConfig.UPDATE;
  const Icon = config.icon;

  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.changed_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="text-sm">
              <span className="font-medium">{fieldLabels[entry.field_name] || entry.field_name}:</span>{' '}
              <span className="text-muted-foreground line-through">
                {formatValue(entry.old_value)}
              </span>{' '}
              <span className="text-foreground">→ {formatValue(entry.new_value)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CRFundHistory({ fundId }: CRFundHistoryProps) {
  const { data: auditLog, isLoading } = useCRFundAuditLog(fundId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Historial de Cambios
          {auditLog && auditLog.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {auditLog.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auditLog && auditLog.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            {auditLog.map((entry) => (
              <AuditLogEntry key={entry.id} entry={entry} />
            ))}
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay cambios registrados para este fund.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
