import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Trash2, FileSpreadsheet, AlertTriangle, Download, Calendar } from 'lucide-react';
import { useCampaignCompanies, CampaignCompanyInsert, FinancialYearData } from '@/hooks/useCampaignCompanies';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

const currentYear = new Date().getFullYear();
const YEAR_1 = currentYear - 1; // 2025
const YEAR_2 = currentYear - 2; // 2024
const YEAR_3 = currentYear - 3; // 2023

// Build dynamic column map with year-specific headers
function buildColumnMap(): Record<string, string> {
  const base: Record<string, string> = {
    'empresa': 'client_company', 'company': 'client_company', 'razón social': 'client_company',
    'razon social': 'client_company', 'nombre empresa': 'client_company',
    'contacto': 'client_name', 'nombre': 'client_name', 'nombre contacto': 'client_name', 'name': 'client_name',
    'email': 'client_email', 'correo': 'client_email', 'e-mail': 'client_email',
    'teléfono': 'client_phone', 'telefono': 'client_phone', 'phone': 'client_phone',
    'cif': 'client_cif', 'nif': 'client_cif',
    // Legacy single-year columns (fallback)
    'facturación': 'revenue', 'facturacion': 'revenue', 'revenue': 'revenue', 'ventas': 'revenue', 'ingresos': 'revenue',
    'ebitda': 'ebitda',
    'año': 'financial_year', 'year': 'financial_year',
  };

  // Year-specific mappings
  for (const [yr, suffix] of [[YEAR_1, ''], [YEAR_2, '_year_2'], [YEAR_3, '_year_3']] as [number, string][]) {
    base[`facturacion ${yr}`] = `revenue${suffix}`;
    base[`facturación ${yr}`] = `revenue${suffix}`;
    base[`revenue ${yr}`] = `revenue${suffix}`;
    base[`ventas ${yr}`] = `revenue${suffix}`;
    base[`ingresos ${yr}`] = `revenue${suffix}`;
    base[`ebitda ${yr}`] = `ebitda${suffix}`;
  }

  return base;
}

const COLUMN_MAP = buildColumnMap();

interface Props {
  campaignId: string;
}

const emptyYearRow = (year: number) => ({ year, revenue: '', ebitda: '' });

export function CompaniesStep({ campaignId }: Props) {
  const { companies, stats, addCompany, bulkAddCompanies, deleteCompany, isAdding, isBulkAdding, isDeleting } = useCampaignCompanies(campaignId);

  // Manual form state
  const [manual, setManual] = useState({
    client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '',
  });
  const [manualYears, setManualYears] = useState([
    emptyYearRow(YEAR_1), emptyYearRow(YEAR_2), emptyYearRow(YEAR_3),
  ]);

  const updateManualYear = (idx: number, field: 'revenue' | 'ebitda', value: string) => {
    setManualYears(prev => prev.map((y, i) => i === idx ? { ...y, [field]: value } : y));
  };

  const handleAddManual = async () => {
    if (!manual.client_company) {
      toast.error('Empresa es obligatorio');
      return;
    }
    const hasEbitda = manualYears.some(y => y.ebitda && parseFloat(y.ebitda) !== 0);
    if (!hasEbitda) {
      toast.error('Al menos un año debe tener EBITDA');
      return;
    }

    const financialYearsData: FinancialYearData[] = manualYears
      .filter(y => y.ebitda && parseFloat(y.ebitda) !== 0)
      .map(y => ({
        year: y.year,
        revenue: y.revenue ? parseFloat(y.revenue) : 0,
        ebitda: parseFloat(y.ebitda),
      }));

    const primaryYear = financialYearsData[0];

    await addCompany({
      client_company: manual.client_company,
      client_name: manual.client_name || null,
      client_email: manual.client_email || null,
      client_phone: manual.client_phone || null,
      client_cif: manual.client_cif || null,
      revenue: primaryYear.revenue,
      ebitda: primaryYear.ebitda,
      financial_year: primaryYear.year,
      financial_years_data: financialYearsData as any,
      source: 'manual',
    } as Partial<CampaignCompanyInsert>);

    setManual({ client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '' });
    setManualYears([emptyYearRow(YEAR_1), emptyYearRow(YEAR_2), emptyYearRow(YEAR_3)]);
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
            if (key.startsWith('revenue') || key.startsWith('ebitda')) {
              result[key] = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
            } else if (key === 'financial_year') {
              result[key] = parseInt(String(value)) || YEAR_1;
            } else {
              result[key] = String(value).trim();
            }
          }
        }

        // Build financial_years_data from mapped year columns
        const years: FinancialYearData[] = [];

        // Year 1 (most recent)
        const rev1 = result.revenue || 0;
        const ebitda1 = result.ebitda || 0;
        if (ebitda1) years.push({ year: result.financial_year || YEAR_1, revenue: rev1, ebitda: ebitda1 });

        // Year 2
        const rev2 = result.revenue_year_2 || 0;
        const ebitda2 = result.ebitda_year_2 || 0;
        if (ebitda2) years.push({ year: YEAR_2, revenue: rev2, ebitda: ebitda2 });

        // Year 3
        const rev3 = result.revenue_year_3 || 0;
        const ebitda3 = result.ebitda_year_3 || 0;
        if (ebitda3) years.push({ year: YEAR_3, revenue: rev3, ebitda: ebitda3 });

        if (years.length > 0) {
          result.financial_years_data = years;
          // Ensure primary fields are set from first year
          if (!result.revenue && years[0].revenue) result.revenue = years[0].revenue;
          if (!result.ebitda && years[0].ebitda) result.ebitda = years[0].ebitda;
          if (!result.financial_year) result.financial_year = years[0].year;
        }

        // Clean up intermediate keys
        delete result.revenue_year_2;
        delete result.ebitda_year_2;
        delete result.revenue_year_3;
        delete result.ebitda_year_3;

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

  const downloadTemplate = () => {
    const data = [
      {
        Empresa: 'Empresa Ejemplo S.L.', Contacto: 'Juan Garcia', Email: 'juan@ejemplo.com',
        Telefono: '+34 612 345 678', CIF: 'B12345678',
        [`Facturacion ${YEAR_1}`]: 5000000, [`EBITDA ${YEAR_1}`]: 800000,
        [`Facturacion ${YEAR_2}`]: 4500000, [`EBITDA ${YEAR_2}`]: 720000,
        [`Facturacion ${YEAR_3}`]: 4000000, [`EBITDA ${YEAR_3}`]: 650000,
      },
      {
        Empresa: 'Industrias Demo S.A.', Contacto: 'Ana Lopez', Email: 'ana@demo.com',
        Telefono: '+34 698 765 432', CIF: 'A87654321',
        [`Facturacion ${YEAR_1}`]: 12000000, [`EBITDA ${YEAR_1}`]: 2500000,
        [`Facturacion ${YEAR_2}`]: 11000000, [`EBITDA ${YEAR_2}`]: 2200000,
        [`Facturacion ${YEAR_3}`]: 10000000, [`EBITDA ${YEAR_3}`]: 2000000,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 25 }, { wch: 18 }, { wch: 25 }, { wch: 18 }, { wch: 12 },
      { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
    XLSX.writeFile(wb, 'plantilla_campana_valoracion.xlsx');
  };

  const getYearsCount = (c: typeof companies[0]) => {
    if (c.financial_years_data && Array.isArray(c.financial_years_data) && c.financial_years_data.length > 0) {
      return c.financial_years_data.length;
    }
    return 1;
  };

  return (
    <div className="space-y-6">
      {/* Excel Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Importar Excel</CardTitle>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}>
              <Download className="h-4 w-4 mr-1" />Descargar plantilla
            </Button>
          </div>
        </CardHeader>
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
                <p className="text-xs text-muted-foreground mt-1">Columnas: Empresa, Contacto, Email, CIF, Facturación {YEAR_1}/{YEAR_2}/{YEAR_3}, EBITDA {YEAR_1}/{YEAR_2}/{YEAR_3}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card>
        <CardHeader><CardTitle className="text-base">Añadir empresa manualmente</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              <Label className="text-xs">Teléfono</Label>
              <Input placeholder="+34 612 345 678" value={manual.client_phone} onChange={e => setManual(p => ({ ...p, client_phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CIF</Label>
              <Input placeholder="B12345678" value={manual.client_cif} onChange={e => setManual(p => ({ ...p, client_cif: e.target.value }))} />
            </div>
          </div>

          {/* 3 Financial Years */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Datos financieros (3 años)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {manualYears.map((yr, idx) => (
                <div key={yr.year} className="border rounded-lg p-3 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">{yr.year}</span>
                  <div className="space-y-1">
                    <Label className="text-xs">Facturación (€)</Label>
                    <Input type="number" placeholder="0" value={yr.revenue} onChange={e => updateManualYear(idx, 'revenue', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">EBITDA (€) {idx === 0 ? '*' : ''}</Label>
                    <Input type="number" placeholder="0" value={yr.ebitda} onChange={e => updateManualYear(idx, 'ebitda', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleAddManual} disabled={isAdding || !manual.client_company} className="w-full">
            <Plus className="h-4 w-4 mr-1" />Añadir empresa
          </Button>
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
                  <TableHead className="text-center">Años</TableHead>
                  <TableHead className="text-center">Origen</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(c => {
                  const yearsCount = getYearsCount(c);
                  return (
                    <TableRow key={c.id} className={!c.client_email ? 'bg-yellow-50/50' : ''}>
                      <TableCell className="font-medium">{c.client_company}</TableCell>
                      <TableCell>{c.client_name || '—'}</TableCell>
                      <TableCell>
                        {c.client_email || <span className="flex items-center gap-1 text-yellow-600 text-xs"><AlertTriangle className="h-3 w-3" />Sin email</span>}
                      </TableCell>
                      <TableCell>{c.client_cif || '—'}</TableCell>
                      <TableCell className="text-right">{c.revenue ? formatCurrencyEUR(c.revenue) : '—'}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrencyEUR(c.ebitda)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={yearsCount >= 3 ? 'default' : 'secondary'} className="text-xs">
                          {yearsCount} {yearsCount === 1 ? 'año' : 'años'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center"><Badge variant={c.source === 'excel' ? 'default' : 'secondary'} className="text-xs">{c.source === 'excel' ? 'Excel' : 'Manual'}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" disabled={isDeleting} onClick={() => deleteCompany(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}