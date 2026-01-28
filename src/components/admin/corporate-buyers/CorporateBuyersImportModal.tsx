// =============================================
// CORPORATE BUYERS IMPORT MODAL
// Excel file upload with preview and import
// =============================================

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BuyerRow {
  name: string;
  country_base?: string;
  sectors?: string;
  description?: string;
  investment_thesis?: string;
  keywords?: string;
  website?: string;
  geography_focus?: string;
  revenue_range?: string;
  ebitda_range?: string;
  source_url?: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  contact_linkedin?: string;
  contact_phone?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// Column mapping from Excel headers to data fields
const COLUMN_MAP: Record<string, keyof BuyerRow> = {
  'nombre': 'name',
  'name': 'name',
  'compañía': 'name',
  'empresa': 'name',
  'país': 'country_base',
  'pais': 'country_base',
  'country': 'country_base',
  'sectores': 'sectors',
  'sector': 'sectors',
  'sectors': 'sectors',
  'descripción': 'description',
  'descripcion': 'description',
  'description': 'description',
  'tesis': 'investment_thesis',
  'tesis de inversión': 'investment_thesis',
  'investment thesis': 'investment_thesis',
  'keywords': 'keywords',
  'palabras clave': 'keywords',
  'website': 'website',
  'web': 'website',
  'url': 'website',
  'geografía': 'geography_focus',
  'geografia': 'geography_focus',
  'geography': 'geography_focus',
  'facturación': 'revenue_range',
  'facturacion': 'revenue_range',
  'revenue': 'revenue_range',
  'rango facturación': 'revenue_range',
  'ebitda': 'ebitda_range',
  'rango ebitda': 'ebitda_range',
  'fuente': 'source_url',
  'source': 'source_url',
  'contacto nombre': 'contact_name',
  'contact name': 'contact_name',
  'contacto título': 'contact_title',
  'contact title': 'contact_title',
  'contacto email': 'contact_email',
  'contact email': 'contact_email',
  'contacto linkedin': 'contact_linkedin',
  'contact linkedin': 'contact_linkedin',
  'contacto teléfono': 'contact_phone',
  'contact phone': 'contact_phone',
};

export function CorporateBuyersImportModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BuyerRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    buyersCreated: number;
    buyersUpdated: number;
    contactsCreated: number;
    errors: string[];
  } | null>(null);

  const parseExcel = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (jsonData.length < 2) {
          toast({ title: 'Error', description: 'El archivo está vacío o no tiene datos', variant: 'destructive' });
          return;
        }

        const headers = (jsonData[0] as string[]).map(h => String(h || '').toLowerCase().trim());
        const columnMapping = headers.map(h => COLUMN_MAP[h] || null);

        // Check if we have a 'name' column
        if (!columnMapping.includes('name')) {
          toast({ 
            title: 'Error', 
            description: 'No se encontró la columna "Nombre" en el archivo', 
            variant: 'destructive' 
          });
          return;
        }

        const rows: BuyerRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          const buyerRow: Partial<BuyerRow> = {};
          
          columnMapping.forEach((field, idx) => {
            if (field && row[idx] !== undefined && row[idx] !== null && row[idx] !== '') {
              (buyerRow as Record<string, unknown>)[field] = String(row[idx]);
            }
          });

          // Only include rows that have a name
          if (buyerRow.name && buyerRow.name.trim()) {
            rows.push(buyerRow as BuyerRow);
          }
        }

        setParsedData(rows);
        toast({ title: 'Archivo cargado', description: `${rows.length} compradores detectados` });
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast({ title: 'Error', description: 'No se pudo leer el archivo Excel', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setResult(null);
      parseExcel(file);
    }
  }, [parseExcel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setProgress(10);

    try {
      // Transform data for edge function
      const buyers = parsedData.map(row => ({
        name: row.name,
        country_base: row.country_base || '',
        sectors: row.sectors ? row.sectors.split(/[,\n]/).map(s => s.trim()).filter(Boolean) : [],
        description: row.description || '',
        investment_thesis: row.investment_thesis || null,
        keywords: row.keywords ? row.keywords.split(/[,\n]/).map(k => k.trim()).filter(Boolean) : [],
        website: row.website || null,
        geography_focus: row.geography_focus ? row.geography_focus.split(/[,\n]/).map(g => g.trim()).filter(Boolean) : [],
        revenue_range: row.revenue_range || null,
        ebitda_range: row.ebitda_range || null,
        source_url: row.source_url || null,
        contact: row.contact_name ? {
          name: row.contact_name,
          title: row.contact_title || null,
          email: row.contact_email || null,
          linkedin_url: row.contact_linkedin || null,
          phone: row.contact_phone || null,
        } : null,
      }));

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('corporate-buyers-import', {
        body: { buyers, mode: importMode },
      });

      setProgress(90);

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);
      setProgress(100);

      toast({
        title: 'Importación completada',
        description: `${data.buyersCreated} creados, ${data.buyersUpdated} actualizados`,
      });

      // Refresh the buyers list
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Error de importación',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Compradores Corporativos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Result display */}
          {result && (
            <div className={`p-4 rounded-lg border ${result.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">
                  Importación {result.errors.length > 0 ? 'completada con advertencias' : 'exitosa'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ {result.buyersCreated} compradores creados</p>
                <p>✓ {result.buyersUpdated} compradores actualizados</p>
                <p>✓ {result.contactsCreated} contactos creados</p>
                {result.errors.length > 0 && (
                  <p className="text-amber-600">⚠ {result.errors.length} errores</p>
                )}
              </div>
            </div>
          )}

          {/* Dropzone */}
          {!result && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <p className="text-sm">{file.name}</p>
              ) : isDragActive ? (
                <p className="text-sm">Suelta el archivo aquí...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">Arrastra un archivo Excel aquí</p>
                  <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
                </div>
              )}
            </div>
          )}

          {/* Import mode */}
          {parsedData.length > 0 && !result && (
            <div className="space-y-2">
              <Label>Modo de importación</Label>
              <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as 'append' | 'replace')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="append" id="append" />
                  <Label htmlFor="append" className="font-normal">Añadir (mantiene existentes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="font-normal text-destructive">Reemplazar (borra todos primero)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Preview table */}
          {parsedData.length > 0 && !result && (
            <div className="flex-1 min-h-0">
              <Label className="mb-2 block">Vista previa ({parsedData.length} compradores)</Label>
              <ScrollArea className="h-[200px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Sectores</TableHead>
                      <TableHead>Website</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.country_base || '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{row.sectors || '—'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.website || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    ... y {parsedData.length - 50} más
                  </p>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Progress */}
          {isImporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importando compradores...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={parsedData.length === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                `Importar ${parsedData.length} compradores`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
