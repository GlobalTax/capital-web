import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Link2, AlertTriangle, XCircle, Download, ChevronDown, GitBranch } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ErrorRow } from '@/hooks/useExcelImportValidation';

interface ImportResultModalProps {
  open: boolean;
  onClose: () => void;
  imported: number;
  linked: number;
  linkedRelated: number;
  skippedDuplicates: number;
  skippedErrors: number;
  errors: ErrorRow[];
}

export function ImportResultModal({ open, onClose, imported, linked, linkedRelated, skippedDuplicates, skippedErrors, errors }: ImportResultModalProps) {
  const [errorsOpen, setErrorsOpen] = useState(false);

  const handleDownloadErrors = () => {
    if (errors.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(errors.map(e => ({
      'Fila': e.rowNumber,
      'Empresa': e.empresa || '',
      'CIF': e.cif || '',
      'Motivo': e.motivo,
    })));
    ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 14 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errores');
    XLSX.writeFile(wb, 'errores_importacion.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resultado de la importación</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{imported} empresas nuevas importadas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-blue-600" />
            <span>{linked} empresas vinculadas desde directorio</span>
          </div>
          {linkedRelated > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-orange-500" />
              <span>{linkedRelated} importadas (ya en lista relacionada)</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{skippedDuplicates} omitidas por duplicación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-destructive" />
            <span>{skippedErrors} omitidas por error</span>
          </div>

          {errors.length > 0 && (
            <Collapsible open={errorsOpen} onOpenChange={setErrorsOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2">
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${errorsOpen ? 'rotate-180' : ''}`} />
                Ver detalle de errores
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 max-h-48 overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-12">Fila</TableHead>
                        <TableHead className="text-xs">Empresa</TableHead>
                        <TableHead className="text-xs">CIF</TableHead>
                        <TableHead className="text-xs">Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs tabular-nums">{e.rowNumber}</TableCell>
                          <TableCell className="text-xs truncate max-w-[120px]">{e.empresa || '—'}</TableCell>
                          <TableCell className="text-xs">{e.cif || '—'}</TableCell>
                          <TableCell className="text-xs text-destructive">{e.motivo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleDownloadErrors}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar errores (.xlsx)
                </Button>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
