// ============= ADS COSTS IMPORT MODAL =============
// Modal para importar histórico de costes desde Excel
// Soporta detección automática de cabecera y filtra filas de resumen

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  Info,
  SkipForward,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdsCostsImport, AdsPlatform, ParsedExcelRow } from '@/hooks/useAdsCostsHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdsCostsImportModalProps {
  open: boolean;
  onClose: () => void;
  platform: AdsPlatform;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const AdsCostsImportModal: React.FC<AdsCostsImportModalProps> = ({
  open,
  onClose,
  platform,
}) => {
  const {
    parsedRows,
    duplicates,
    parseStats,
    isParsing,
    parseError,
    isImporting,
    parseExcel,
    importData,
    clearParsedData,
    validCount,
    invalidCount,
    skippedCount,
  } = useAdsCostsImport(platform);

  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      await parseExcel(file);
      setStep('preview');
    }
  }, [parseExcel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isParsing,
  });

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    clearParsedData();
    onClose();
  };

  const handleImport = async () => {
    await importData(parsedRows);
    handleClose();
  };

  const platformName = platform === 'meta_ads' ? 'Meta Ads' : 'Google Ads';

  // Separate valid, skipped, and error rows for display
  const validRows = parsedRows.filter(r => r.isValid);
  const skippedRows = parsedRows.filter(r => r.isSkipped);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar histórico - {platformName}
          </DialogTitle>
          <DialogDescription>
            Carga un archivo Excel con el histórico de gastos. Las filas de resumen (Media/Total) se ignorarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="py-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                isParsing && "opacity-50 cursor-wait"
              )}
            >
              <input {...getInputProps()} />
              {isParsing ? (
                <>
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Procesando archivo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-1">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo Excel o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Formatos soportados: .xlsx, .xls, .csv
                  </p>
                </>
              )}
            </div>

            {/* Expected format info */}
            <Alert className="mt-4" variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Formato esperado del Excel de {platformName}</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                <p className="mb-2">Columnas detectadas automáticamente:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Nombre de la campaña</strong> - Nombre exacto de la campaña</li>
                  <li><strong>Día</strong> - Fecha del registro</li>
                  <li><strong>Importe gastado (EUR)</strong> - Gasto del día</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Columnas opcionales: Tipo de resultado, Resultados, Coste por resultado, Impresiones, Alcance, Frecuencia, CPM, Clics en el enlace
                </p>
                <p className="mt-2 text-xs font-medium text-amber-600">
                  ⚠️ Las filas "Media" y "Total" se ignorarán automáticamente
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {skippedCount > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <SkipForward className="h-3 w-3 mr-1" />
                    {skippedCount} ignorados
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    {invalidCount} errores
                  </Badge>
                )}
              </div>
            </div>

            {/* Duplicates info (UPSERT) */}
            {duplicates.length > 0 && (
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertTitle>Registros existentes detectados</AlertTitle>
                <AlertDescription>
                  Se encontraron {duplicates.length} registros que ya existen (misma campaña + fecha).
                  <strong className="block mt-1">Se actualizarán con los nuevos valores del Excel (UPSERT).</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Skipped rows info */}
            {skippedRows.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50/50">
                <SkipForward className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Filas de resumen ignoradas</AlertTitle>
                <AlertDescription className="text-amber-700 text-sm">
                  {skippedRows.map((row, idx) => (
                    <span key={idx} className="inline-block mr-2">
                      • {row.skipReason}
                    </span>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Parse error */}
            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al procesar</AlertTitle>
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            {/* Preview table - only valid rows */}
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Resultados</TableHead>
                    <TableHead className="text-right">Impresiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validRows.slice(0, 100).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.date}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={row.campaign_name}>
                        {row.campaign_name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.spend)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row.results ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row.impressions?.toLocaleString('es-ES') ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {validRows.length > 100 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Mostrando 100 de {validRows.length} filas válidas
                </div>
              )}
            </ScrollArea>

            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
              <span className="text-muted-foreground">
                Total a importar: <strong className="text-foreground">{validCount} registros diarios</strong>
              </span>
              <span className="text-muted-foreground">
                Gasto total: <strong className="text-foreground">
                  {formatCurrency(validRows.reduce((sum, r) => sum + r.spend, 0))}
                </strong>
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}
          
          {step === 'preview' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('upload');
                  setSelectedFile(null);
                  clearParsedData();
                }}
              >
                Volver
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {validCount} registros
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdsCostsImportModal;
