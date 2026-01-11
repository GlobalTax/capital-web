import React from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SFAcquisition } from '@/types/searchFunds';

interface SFFundAcquisitionsPanelProps {
  acquisitions: SFAcquisition[];
  onAdd: () => void;
  onEdit: (acquisition: SFAcquisition) => void;
  onDelete: (acquisition: SFAcquisition) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  owned: { label: 'En cartera', color: 'bg-green-500/10 text-green-700 border-green-200' },
  exited: { label: 'Exit', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  unknown: { label: 'Desconocido', color: 'bg-muted text-muted-foreground' },
};

const dealTypeLabels: Record<string, string> = {
  majority: 'Mayoría',
  minority: 'Minoría',
  merger: 'Fusión',
  asset: 'Activos',
  unknown: '-',
};

export function SFFundAcquisitionsPanel({ acquisitions, onAdd, onEdit, onDelete }: SFFundAcquisitionsPanelProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Adquisiciones</h3>
          <Badge variant="secondary" className="text-xs">
            {acquisitions.length}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3 mr-1" />
          Añadir
        </Button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
        <div>EMPRESA</div>
        <div>SECTOR</div>
        <div>AÑO</div>
        <div>TIPO</div>
        <div>ESTADO</div>
        <div className="text-right">ACCIONES</div>
      </div>

      {/* Acquisitions list */}
      {acquisitions.length > 0 ? (
        <div className="divide-y">
          {acquisitions.map((acq) => {
            const statusConfig = statusLabels[acq.status] || statusLabels.unknown;
            
            return (
              <div
                key={acq.id}
                className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-2 items-center px-3 py-2 hover:bg-muted/50 group transition-colors"
              >
                {/* Empresa */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{acq.company_name}</span>
                        {acq.source_url && (
                          <a
                            href={acq.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {acq.country && (
                        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{acq.country}</span>
                          {acq.region && <span>• {acq.region}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sector */}
                <div>
                  {acq.sector ? (
                    <span className="text-xs text-muted-foreground truncate block">
                      {acq.sector}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Año */}
                <div>
                  {acq.deal_year ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{acq.deal_year}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <span className="text-xs text-muted-foreground">
                    {dealTypeLabels[acq.deal_type] || acq.deal_type}
                  </span>
                </div>

                {/* Estado */}
                <div>
                  <Badge className={`${statusConfig.color} text-[10px] font-normal border`}>
                    {statusConfig.label}
                    {acq.status === 'exited' && acq.exit_year && (
                      <span className="ml-1">{acq.exit_year}</span>
                    )}
                  </Badge>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEdit(acq)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDelete(acq)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay adquisiciones registradas</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir primera adquisición
          </Button>
        </div>
      )}
    </div>
  );
}
