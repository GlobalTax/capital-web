// ============= EXCEL IMPORTER =============
// Componente para importar contactos desde Excel

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useBuyerContactImport } from '@/hooks/useBuyerContactImport';
import { ExcelRow, ImportValidationResult } from '@/types/buyer-contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelImporterProps {
  onImportComplete: () => void;
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'validating' | 'confirm' | 'importing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    parseExcelFile,
    validateData,
    executeImport,
    reset,
    isProcessing,
    validationResult,
    parsedRows,
    importResult,
  } = useBuyerContactImport();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      try {
        await parseExcelFile(file);
        setStep('preview');
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  }, [parseExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleValidate = async () => {
    setStep('validating');
    await validateData(parsedRows);
    setStep('confirm');
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult) return;
    
    setStep('importing');
    await executeImport(validationResult.valid, selectedFile.name);
    setStep('complete');
    onImportComplete();
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('upload');
    setSelectedFile(null);
    reset();
  };

  const renderStats = (result: ImportValidationResult) => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Válidos</p>
              <p className="text-2xl font-bold text-green-600">{result.valid.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Duplicados Excel</p>
              <p className="text-2xl font-bold text-yellow-600">{result.duplicatesInExcel.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Ya en sistema</p>
              <p className="text-2xl font-bold text-orange-600">{result.duplicatesInDB.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Inválidos</p>
              <p className="text-2xl font-bold text-red-600">
                {result.invalidEmails.length + result.missingRequired.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Importar Excel
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'upload' && 'Importar contactos desde Excel'}
              {step === 'preview' && 'Vista previa del archivo'}
              {step === 'validating' && 'Validando datos...'}
              {step === 'confirm' && 'Confirmar importación'}
              {step === 'importing' && 'Importando contactos...'}
              {step === 'complete' && 'Importación completada'}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' && 'Sube un archivo Excel con los contactos a importar'}
              {step === 'preview' && 'Revisa los datos antes de validar'}
              {step === 'confirm' && 'Revisa el resumen y confirma la importación'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo Excel'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                o haz clic para seleccionar (.xlsx, .xls, .csv)
              </p>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  <FileSpreadsheet className="mr-1 h-3 w-3" />
                  {selectedFile?.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {parsedRows.length} filas encontradas
                </span>
              </div>

              <div className="border rounded-lg max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(parsedRows[0]).slice(0, 6).map((key) => (
                        <TableHead key={key} className="whitespace-nowrap">
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).slice(0, 6).map((val, j) => (
                          <TableCell key={j} className="truncate max-w-[150px]">
                            {String(val || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... y {parsedRows.length - 5} filas más
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                <strong>Columnas esperadas:</strong> first_name (o Nombre), last_name (o Apellidos), 
                email (o Correo/Email), phone (o Teléfono), company (o Empresa), position (o Cargo)
              </p>
            </div>
          )}

          {/* Step 3: Validating */}
          {step === 'validating' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Validando {parsedRows.length} contactos...</p>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && validationResult && (
            <div className="space-y-6">
              {renderStats(validationResult)}

              {validationResult.valid.length === 0 ? (
                <Card className="border-destructive">
                  <CardContent className="p-4 text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="font-medium">No hay contactos válidos para importar</p>
                    <p className="text-sm text-muted-foreground">
                      Revisa el archivo y asegúrate de que los campos requeridos (nombre, email) estén completos
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Se importarán {validationResult.valid.length} contactos
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Importando contactos...</p>
              <Progress value={50} className="w-full mt-4" />
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 'complete' && importResult && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold">¡Importación completada!</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{importResult.successful_imports}</p>
                  <p className="text-sm text-muted-foreground">Creados</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{importResult.failed_imports}</p>
                  <p className="text-sm text-muted-foreground">Fallidos</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'upload' && (
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}
            
            {step === 'preview' && (
              <>
                <Button variant="outline" onClick={() => { setStep('upload'); setSelectedFile(null); }}>
                  Cambiar archivo
                </Button>
                <Button onClick={handleValidate} disabled={isProcessing}>
                  Validar datos
                </Button>
              </>
            )}
            
            {step === 'confirm' && validationResult && (
              <>
                <Button variant="outline" onClick={() => setStep('preview')}>
                  Volver
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={validationResult.valid.length === 0 || isProcessing}
                >
                  Confirmar importación
                </Button>
              </>
            )}
            
            {step === 'complete' && (
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
