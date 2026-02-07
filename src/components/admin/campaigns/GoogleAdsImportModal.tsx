// ============= GOOGLE ADS IMPORT MODAL =============
// Modal de importación especializado para Google Ads (UTF-16, TAB, números ES)

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2,
  AlertCircle, Info, SkipForward, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoogleAdsImport } from '@/hooks/useGoogleAdsImport';

interface GoogleAdsImportModalProps {
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const GoogleAdsImportModal: React.FC<GoogleAdsImportModalProps> = ({ open, onClose }) => {
  const {
    parsedRows, duplicates, isParsing, parseError, isImporting,
    parseFile, importData, clearParsedData, needsCampaignName,
    validCount, invalidCount, skippedCount,
  } = useGoogleAdsImport();

  const [step, setStep] = useState<'upload' | 'campaign_name' | 'preview'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      await parseFile(file);
    }
  }, [parseFile]);

  // After parseFile, check if we need campaign name
  React.useEffect(() => {
    if (needsCampaignName && selectedFile) {
      setStep('campaign_name');
    } else if (parsedRows.length > 0) {
      setStep('preview');
    }
  }, [needsCampaignName, parsedRows.length, selectedFile]);

  const handleCampaignNameSubmit = async () => {
    if (!campaignName.trim() || !selectedFile) return;
    await parseFile(selectedFile, campaignName.trim());
    setStep('preview');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isParsing,
  });

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setCampaignName('');
    clearParsedData();
    onClose();
  };

  const handleImport = async () => {
    await importData(parsedRows);
    handleClose();
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const skippedRows = parsedRows.filter(r => r.isSkipped);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[#4285F4] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">G</span>
            </div>
            Importar datos - Google Ads
          </DialogTitle>
          <DialogDescription>
            Carga un archivo CSV/Excel exportado desde Google Ads. Se detecta automáticamente el formato UTF-16 con tabuladores.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="py-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
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
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo CSV/Excel de Google Ads'}
                  </p>
                  <p className="text-sm text-muted-foreground">Formatos: .csv, .xlsx, .xls</p>
                </>
              )}
            </div>

            {parseError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al procesar</AlertTitle>
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Formato esperado de Google Ads</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                <p className="mb-2">Columnas detectadas automáticamente:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Día</strong> - Fecha del registro</li>
                  <li><strong>Clics</strong> - Clics totales</li>
                  <li><strong>Coste</strong> - Gasto del día en EUR</li>
                  <li><strong>Conversiones</strong> - Conversiones del día</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Opcionales: CTR, CPM medio, Estado de la campaña
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Se ignora automáticamente: Código de moneda
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 2: Campaign Name (if not in file) */}
        {step === 'campaign_name' && (
          <div className="py-6 space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nombre de campaña requerido</AlertTitle>
              <AlertDescription>
                El archivo no contiene una columna de campaña. Introduce el nombre manualmente para asociar todos los datos.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nombre de la campaña *</Label>
              <Input
                id="campaign-name"
                placeholder="Ej: Campaña Valoración Q1 2025"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
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

            {duplicates.length > 0 && (
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertTitle>Registros existentes detectados</AlertTitle>
                <AlertDescription>
                  {duplicates.length} registros ya existen (misma campaña + fecha).
                  <strong className="block mt-1">Se actualizarán con los nuevos valores (UPSERT).</strong>
                </AlertDescription>
              </Alert>
            )}

            {skippedRows.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50/50">
                <SkipForward className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Filas ignoradas</AlertTitle>
                <AlertDescription className="text-amber-700 text-sm">
                  {skippedRows.slice(0, 5).map((row, idx) => (
                    <span key={idx} className="inline-block mr-2">• {row.skipReason}</span>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                    <TableHead className="text-right">Coste</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="text-right">CPM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validRows.slice(0, 100).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell><CheckCircle2 className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell className="font-mono text-xs">{row.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={row.campaign_name}>{row.campaign_name}</TableCell>
                      <TableCell className="text-right">{row.clicks?.toLocaleString('es-ES') ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(row.spend)}</TableCell>
                      <TableCell className="text-right">{row.conversions ?? '—'}</TableCell>
                      <TableCell className="text-right">{row.cpm ? formatCurrency(row.cpm) : '—'}</TableCell>
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

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
              <span className="text-muted-foreground">
                Total: <strong className="text-foreground">{validCount} registros</strong>
              </span>
              <span className="text-muted-foreground">
                Gasto total: <strong className="text-foreground">{formatCurrency(validRows.reduce((s, r) => s + r.spend, 0))}</strong>
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          )}
          {step === 'campaign_name' && (
            <>
              <Button variant="outline" onClick={() => { setStep('upload'); clearParsedData(); }}>Volver</Button>
              <Button onClick={handleCampaignNameSubmit} disabled={!campaignName.trim() || isParsing}>
                {isParsing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando...</> : 'Continuar'}
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => { setStep('upload'); setSelectedFile(null); clearParsedData(); }}>Volver</Button>
              <Button onClick={handleImport} disabled={validCount === 0 || isImporting}>
                {isImporting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Importar {validCount} registros</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
