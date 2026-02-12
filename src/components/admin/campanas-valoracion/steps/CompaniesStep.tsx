import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Trash2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useCampaignCompanies, CampaignCompanyInsert } from '@/hooks/useCampaignCompanies';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

const COLUMN_MAP: Record<string, string> = {
  'empresa': 'client_company', 'company': 'client_company', 'razón social': 'client_company',
  'razon social': 'client_company', 'nombre empresa': 'client_company',
  'contacto': 'client_name', 'nombre': 'client_name', 'nombre contacto': 'client_name', 'name': 'client_name',
  'email': 'client_email', 'correo': 'client_email', 'e-mail': 'client_email',
  'teléfono': 'client_phone', 'telefono': 'client_phone', 'phone': 'client_phone',
  'cif': 'client_cif', 'nif': 'client_cif',
  'facturación': 'revenue', 'facturacion': 'revenue', 'revenue': 'revenue', 'ventas': 'revenue', 'ingresos': 'revenue',
  'ebitda': 'ebitda',
  'año': 'financial_year', 'year': 'financial_year',
};

interface Props {
  campaignId: string;
}

export function CompaniesStep({ campaignId }: Props) {
  const { companies, stats, addCompany, bulkAddCompanies, deleteCompany, isAdding, isBulkAdding, isDeleting } = useCampaignCompanies(campaignId);

  // Manual form state
  const [manual, setManual] = useState({ client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '', revenue: '', ebitda: '', financial_year: new Date().getFullYear().toString() });

  const handleAddManual = async () => {
    if (!manual.client_company || !manual.ebitda) {
      toast.error('Empresa y EBITDA son obligatorios');
      return;
    }
    await addCompany({
      client_company: manual.client_company,
      client_name: manual.client_name || null,
      client_email: manual.client_email || null,
      client_phone: manual.client_phone || null,
      client_cif: manual.client_cif || null,
      revenue: manual.revenue ? parseFloat(manual.revenue) : null,
      ebitda: parseFloat(manual.ebitda),
      financial_year: parseInt(manual.financial_year) || new Date().getFullYear(),
      source: 'manual',
    } as Partial<CampaignCompanyInsert>);
    setManual({ client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '', revenue: '', ebitda: '', financial_year: new Date().getFullYear().toString() });
  };

  // Excel upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);

      if (rows.length === 0) {
        toast.error('El archivo no contiene datos');
        return;
      }

      const mapped = rows.map((row, idx) => {
        const result: Record<string, any> = { source: 'excel', excel_row_number: idx + 1 };
        for (const [header, value] of Object.entries(row)) {
          const key = COLUMN_MAP[header.toLowerCase().trim()];
          if (key) {
            if (key === 'revenue' || key === 'ebitda') {
              result[key] = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
            } else if (key === 'financial_year') {
              result[key] = parseInt(String(value)) || new Date().getFullYear();
            } else {
              result[key] = String(value).trim();
            }
          }
        }
        return result;
      });

      const valid = mapped.filter(r => r.client_company && r.ebitda);
      if (valid.length === 0) {
        toast.error('No se encontraron filas válidas (se requiere Empresa y EBITDA)');
        return;
      }

      await bulkAddCompanies(valid as Partial<CampaignCompanyInsert>[]);
    } catch (e: any) {
      toast.error('Error al procesar el archivo: ' + e.message);
    }
  }, [bulkAddCompanies]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      {/* Excel Upload */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Importar Excel</CardTitle></CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            {isBulkAdding ? (
              <p className="text-sm text-muted-foreground">Importando...</p>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Arrastra un archivo Excel o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground mt-1">Columnas: Empresa, Contacto, Email, CIF, Facturación, EBITDA, Año</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card>
        <CardHeader><CardTitle className="text-base">Añadir empresa manualmente</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Empresa *</Label>
              <Input placeholder="Empresa S.L." value={manual.client_company} onChange={e => setManual(p => ({ ...p, client_company: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contacto</Label>
              <Input placeholder="Nombre" value={manual.client_name} onChange={e => setManual(p => ({ ...p, client_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input type="email" placeholder="email@empresa.com" value={manual.client_email} onChange={e => setManual(p => ({ ...p, client_email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CIF</Label>
              <Input placeholder="B12345678" value={manual.client_cif} onChange={e => setManual(p => ({ ...p, client_cif: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Facturación (€)</Label>
              <Input type="number" placeholder="0" value={manual.revenue} onChange={e => setManual(p => ({ ...p, revenue: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">EBITDA (€) *</Label>
              <Input type="number" placeholder="0" value={manual.ebitda} onChange={e => setManual(p => ({ ...p, ebitda: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Año</Label>
              <Input type="number" value={manual.financial_year} onChange={e => setManual(p => ({ ...p, financial_year: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddManual} disabled={isAdding || !manual.client_company || !manual.ebitda} className="w-full">
                <Plus className="h-4 w-4 mr-1" />Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Empresas ({stats.total})</span>
            <div className="flex gap-2 text-xs font-normal">
              <Badge variant="outline">{stats.withEmail} con email</Badge>
              {stats.withoutEbitda > 0 && <Badge variant="destructive">{stats.withoutEbitda} sin EBITDA</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {companies.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No hay empresas. Importa un Excel o añade manualmente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CIF</TableHead>
                  <TableHead className="text-right">Facturación</TableHead>
                  <TableHead className="text-right">EBITDA</TableHead>
                  <TableHead className="text-center">Origen</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(c => (
                  <TableRow key={c.id} className={!c.client_email ? 'bg-yellow-50/50' : ''}>
                    <TableCell className="font-medium">{c.client_company}</TableCell>
                    <TableCell>{c.client_name || '—'}</TableCell>
                    <TableCell>
                      {c.client_email || <span className="flex items-center gap-1 text-yellow-600 text-xs"><AlertTriangle className="h-3 w-3" />Sin email</span>}
                    </TableCell>
                    <TableCell>{c.client_cif || '—'}</TableCell>
                    <TableCell className="text-right">{c.revenue ? formatCurrencyEUR(c.revenue) : '—'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyEUR(c.ebitda)}</TableCell>
                    <TableCell className="text-center"><Badge variant={c.source === 'excel' ? 'default' : 'secondary'} className="text-xs">{c.source === 'excel' ? 'Excel' : 'Manual'}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled={isDeleting} onClick={() => deleteCompany(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
