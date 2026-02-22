import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Record<string, any>[]) => void;
  isImporting?: boolean;
}

const COLUMN_MAP: Record<string, string> = {
  sector: 'sector',
  subsector: 'subsector',
  'sub-sector': 'subsector',
  'sub sector': 'subsector',
  vertical: 'vertical',
  'tesis pe': 'pe_thesis',
  'pe thesis': 'pe_thesis',
  tesis: 'pe_thesis',
  pe_thesis: 'pe_thesis',
  'datos cuantitativos': 'quantitative_data',
  'quantitative data': 'quantitative_data',
  quantitative_data: 'quantitative_data',
  'firmas pe': 'active_pe_firms',
  'active pe firms': 'active_pe_firms',
  'firmas activas': 'active_pe_firms',
  active_pe_firms: 'active_pe_firms',
  plataformas: 'platforms_operations',
  operaciones: 'platforms_operations',
  platforms: 'platforms_operations',
  platforms_operations: 'platforms_operations',
  'plataformas operaciones': 'platforms_operations',
  multiplos: 'multiples_valuations',
  valoraciones: 'multiples_valuations',
  multiples: 'multiples_valuations',
  multiples_valuations: 'multiples_valuations',
  fase: 'consolidation_phase',
  consolidacion: 'consolidation_phase',
  phase: 'consolidation_phase',
  consolidation_phase: 'consolidation_phase',
  geografia: 'geography',
  geography: 'geography',
  geo: 'geography',
};

const DB_FIELDS = ['sector', 'subsector', 'vertical', 'pe_thesis', 'quantitative_data', 'active_pe_firms', 'platforms_operations', 'multiples_valuations', 'consolidation_phase', 'geography'];

const FIELD_LABELS: Record<string, string> = {
  sector: 'Sector',
  subsector: 'Subsector',
  vertical: 'Vertical',
  pe_thesis: 'Tesis PE',
  quantitative_data: 'Datos Cuantitativos',
  active_pe_firms: 'Firmas PE',
  platforms_operations: 'Plataformas',
  multiples_valuations: 'Múltiplos',
  consolidation_phase: 'Fase',
  geography: 'Geografía',
};

function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9 _]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ParsedData {
  headers: string[];
  mapping: Record<string, string>; // original header -> db field
  unmapped: string[];
  rows: Record<string, any>[];
  validCount: number;
  invalidCount: number;
}

export const SectorImportDialog: React.FC<Props> = ({ open, onOpenChange, onImport, isImporting }) => {
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setParsed(null);
    setFileName('');
    setError('');
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const processFile = useCallback((file: File) => {
    setError('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (!json.length) {
          setError('El archivo no contiene filas de datos.');
          return;
        }

        const headers = Object.keys(json[0]);
        const mapping: Record<string, string> = {};
        const unmapped: string[] = [];

        headers.forEach(h => {
          const normalized = normalizeColumnName(h);
          const dbField = COLUMN_MAP[normalized];
          if (dbField) {
            mapping[h] = dbField;
          } else {
            unmapped.push(h);
          }
        });

        const mappedFields = new Set(Object.values(mapping));
        if (!mappedFields.has('sector') || !mappedFields.has('subsector')) {
          setError('El archivo debe contener al menos las columnas "Sector" y "Subsector".');
          return;
        }

        const rows = json.map(row => {
          const mapped: Record<string, any> = { is_active: true };
          for (const [origHeader, dbField] of Object.entries(mapping)) {
            const val = row[origHeader];
            mapped[dbField] = val != null && String(val).trim() !== '' ? String(val).trim() : null;
          }
          return mapped;
        });

        const validRows = rows.filter(r => r.sector && r.subsector);

        setParsed({
          headers,
          mapping,
          unmapped,
          rows,
          validCount: validRows.length,
          invalidCount: rows.length - validRows.length,
        });
      } catch {
        setError('Error al leer el archivo. Verifica que sea un CSV o Excel válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) processFile(accepted[0]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleImport = () => {
    if (!parsed) return;
    const validRows = parsed.rows.filter(r => r.sector && r.subsector);
    onImport(validRows);
  };

  const previewRows = parsed ? parsed.rows.slice(0, 5) : [];
  const mappedDbFields = parsed ? [...new Set(Object.values(parsed.mapping))] : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileSpreadsheet className="h-4 w-4" />
            Importar subsectores desde archivo
          </DialogTitle>
        </DialogHeader>

        {!parsed ? (
          <div className="space-y-3 py-2">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                'border-[hsl(var(--linear-border))] hover:border-primary/50',
                isDragActive && 'border-primary bg-primary/5'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-3 text-[hsl(var(--linear-text-tertiary))]" />
              <p className="text-sm text-[hsl(var(--linear-text-secondary))]">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo CSV o Excel, o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-[hsl(var(--linear-text-tertiary))] mt-1">
                Formatos: .csv, .xlsx, .xls
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-[hsl(var(--linear-text-tertiary))]" />
                <span className="text-[hsl(var(--linear-text-secondary))]">{fileName}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={reset}>
                <X className="h-3 w-3 mr-1" /> Cambiar archivo
              </Button>
            </div>

            {/* Mapping summary */}
            <div className="flex flex-wrap gap-1.5">
              {mappedDbFields.map(f => (
                <Badge key={f} variant="outline" className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {FIELD_LABELS[f] || f}
                </Badge>
              ))}
              {parsed.unmapped.map(h => (
                <Badge key={h} variant="outline" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {h} (ignorada)
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[hsl(var(--linear-text-secondary))]">
                <strong>{parsed.validCount}</strong> filas válidas
              </span>
              {parsed.invalidCount > 0 && (
                <span className="text-amber-500">
                  <strong>{parsed.invalidCount}</strong> sin sector/subsector (se omitirán)
                </span>
              )}
            </div>

            {/* Preview table */}
            <ScrollArea className="flex-1 border border-[hsl(var(--linear-border))] rounded-lg">
              <Table density="compact" variant="linear">
                <TableHeader>
                  <TableRow variant="linear">
                    <TableHead className="text-[10px] w-8">#</TableHead>
                    {mappedDbFields.map(f => (
                      <TableHead key={f} className="text-[10px] min-w-[100px]">
                        {FIELD_LABELS[f] || f}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => {
                    const isValid = row.sector && row.subsector;
                    return (
                      <TableRow key={i} variant="linear" className={cn(!isValid && 'opacity-40')}>
                        <TableCell className="text-[10px] text-[hsl(var(--linear-text-tertiary))]">{i + 1}</TableCell>
                        {mappedDbFields.map(f => (
                          <TableCell key={f} className="text-[11px] text-[hsl(var(--linear-text-secondary))] max-w-[200px] truncate">
                            {row[f] || '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {parsed.rows.length > 5 && (
                <p className="text-[10px] text-[hsl(var(--linear-text-tertiary))] text-center py-2">
                  … y {parsed.rows.length - 5} filas más
                </p>
              )}
            </ScrollArea>
          </div>
        )}

        {parsed && (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)} disabled={isImporting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleImport} disabled={parsed.validCount === 0 || isImporting}>
              {isImporting ? 'Importando...' : `Importar ${parsed.validCount} registros`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
