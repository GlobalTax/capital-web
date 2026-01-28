// ============= ADS COSTS IMPORT MODAL =============
// Modal para importar histórico de costes desde Excel

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
  Info
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
    isParsing,
    parseError,
    isImporting,
    parseExcel,
    importData,
    clearParsedData,
    validCount,
    invalidCount,
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar histórico - {platformName}
          </DialogTitle>
          <DialogDescription>
            Carga un archivo Excel con el histórico de gastos. Los datos se guardarán exactamente como vienen.
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
              <AlertTitle>Formato esperado del Excel</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                <p className="mb-2">Columnas requeridas:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Campaña</strong> (Campaign Name) - Nombre de la campaña</li>
                  <li><strong>Fecha</strong> (Date) - Fecha del registro</li>
                  <li><strong>Gasto</strong> (Spend, Amount Spent) - Importe gastado</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Columnas opcionales: ID Campaña, Impresiones, Clics, Conversiones, Moneda
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && parsedRows.length > 0 && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile?.name}</span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    {invalidCount} errores
                  </Badge>
                )}
              </div>
            </div>

            {/* Duplicates warning */}
            {duplicates.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Posibles duplicados detectados</AlertTitle>
                <AlertDescription>
                  Se encontraron {duplicates.length} registros que ya podrían existir en la base de datos.
                  Puedes continuar si deseas importarlos de todas formas.
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

            {/* Preview table */}
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Errores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 100).map((row, idx) => (
                    <TableRow 
                      key={idx}
                      className={cn(!row.isValid && "bg-red-50/50")}
                    >
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.date || '—'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={row.campaign_name}>
                        {row.campaign_name || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.spend)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.currency}
                      </TableCell>
                      <TableCell className="text-xs text-red-600">
                        {row.errors.join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedRows.length > 100 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Mostrando 100 de {parsedRows.length} filas
                </div>
              )}
            </ScrollArea>

            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
              <span className="text-muted-foreground">
                Total a importar: <strong className="text-foreground">{validCount} registros</strong>
              </span>
              <span className="text-muted-foreground">
                Gasto total: <strong className="text-foreground">
                  {formatCurrency(parsedRows.filter(r => r.isValid).reduce((sum, r) => sum + r.spend, 0))}
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
