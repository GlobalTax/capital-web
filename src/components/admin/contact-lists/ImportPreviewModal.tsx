import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, Link2, AlertTriangle, XCircle } from 'lucide-react';
import type { ValidationResult } from '@/hooks/useExcelImportValidation';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  result: ValidationResult;
  isImporting: boolean;
}

export function ImportPreviewModal({ open, onClose, onConfirm, result, isImporting }: ImportPreviewModalProps) {
  const canImport = result.nuevas.length + result.vinculadas.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Previsualización de importación</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <SummarySection
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            label="Empresas nuevas"
            count={result.nuevas.length}
            rows={result.nuevas.map(r => ({ name: r.empresa || r.cif || '—', cif: r.cif }))}
          />
          <SummarySection
            icon={<Link2 className="h-4 w-4 text-blue-600" />}
            label="Ya existen en directorio (se vincularán)"
            count={result.vinculadas.length}
            rows={result.vinculadas.map(r => ({ name: r.empresa || r.cif || '—', cif: r.cif }))}
          />
          <SummarySection
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            label="Duplicadas en esta lista (se omitirán)"
            count={result.duplicadas.length}
            rows={result.duplicadas.map(r => ({ name: r.empresa || r.cif || '—', cif: r.cif }))}
          />
          <SummarySection
            icon={<XCircle className="h-4 w-4 text-destructive" />}
            label="Filas con error (se omitirán)"
            count={result.errores.length}
            rows={result.errores.map(r => ({ name: r.empresa || '—', cif: r.cif, motivo: r.motivo }))}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={!canImport || isImporting}>
            {isImporting ? 'Importando...' : `Importar ${result.nuevas.length + result.vinculadas.length} empresas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummarySection({ icon, label, count, rows }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  rows: { name: string; cif: string | null; motivo?: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">{count}</span>
          {count > 0 && <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
        </div>
      </CollapsibleTrigger>
      {count > 0 && (
        <CollapsibleContent>
          <div className="ml-6 mt-1 mb-2 max-h-32 overflow-y-auto space-y-0.5">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate max-w-[200px]">{r.name}</span>
                {r.cif && <span className="text-muted-foreground/60">{r.cif}</span>}
                {r.motivo && <span className="text-destructive/80 italic truncate">— {r.motivo}</span>}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
