import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, Link2, AlertTriangle, XCircle, GitBranch, ShieldAlert } from 'lucide-react';
import type { ValidationResult } from '@/hooks/useExcelImportValidation';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  result: ValidationResult;
  isImporting: boolean;
  importProgress?: { done: number; total: number } | null;
}

export function ImportPreviewModal({ open, onClose, onConfirm, result, isImporting, importProgress }: ImportPreviewModalProps) {
  const importable = result.nuevas.length + result.vinculadas.length + result.enOtraLista.length;
  const canImport = importable > 0;

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
            icon={<GitBranch className="h-4 w-4 text-orange-500" />}
            label="Ya en lista relacionada (se importarán con aviso)"
            count={result.enOtraLista.length}
            rows={result.enOtraLista.map(r => ({ name: r.empresa || r.cif || '—', cif: r.cif, motivo: r.listaRelacionada }))}
          />
          <SummarySection
            icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
            label="Conflicto de sublistado (se excluirán)"
            count={result.conflictoSublistado.length}
            rows={result.conflictoSublistado.map(r => ({ name: r.empresa || r.cif || '—', cif: r.cif, motivo: `Ya en: ${r.sublistaConflicto}` }))}
            variant="destructive"
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
            {isImporting && importProgress
              ? `Importando ${importProgress.done}/${importProgress.total}...`
              : isImporting
                ? 'Importando...'
                : `Importar ${importable} empresas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummarySection({ icon, label, count, rows, variant }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  rows: { name: string; cif: string | null; motivo?: string }[];
  variant?: 'destructive';
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors ${variant === 'destructive' && count > 0 ? 'bg-destructive/5' : ''}`}>
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span className={variant === 'destructive' && count > 0 ? 'font-medium text-destructive' : ''}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium tabular-nums ${variant === 'destructive' && count > 0 ? 'text-destructive' : ''}`}>{count}</span>
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
                {r.motivo && <span className={`italic truncate ${variant === 'destructive' ? 'text-destructive/80' : 'text-orange-600/80'}`}>— {r.motivo}</span>}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
