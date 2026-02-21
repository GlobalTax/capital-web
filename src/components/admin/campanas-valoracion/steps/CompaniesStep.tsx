import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Upload, Trash2, FileSpreadsheet, AlertTriangle, Download, Calendar, Sparkles, Loader2, Pencil, Check, X } from 'lucide-react';
import { useCampaignCompanies, CampaignCompanyInsert, CampaignCompany, FinancialYearData } from '@/hooks/useCampaignCompanies';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { CurrencyInput } from '@/components/ui/currency-input';
import { cn } from '@/lib/utils';

const DEFAULT_YEARS = [new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3];

/**
 * Normalize a column name: lowercase, remove accents, collapse spaces, strip special chars.
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (á→a, ñ→n, etc.)
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .replace(/[^a-z0-9 ]/g, '');    // strip special chars except alphanumeric and spaces
}

/**
 * Parse a number value handling Spanish format (dots as thousands, comma as decimal).
 * Heuristic: if there's a dot followed by exactly 3 digits (and no comma), treat dots as thousands separators.
 */
function parseSpanishNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  const str = String(value).trim();
  if (!str) return 0;

  // Detect Spanish format: dots as thousands separators
  // Pattern: digits with dots every 3 digits, optional comma decimal
  // e.g. "1.500.000" or "500.000" or "1.234,56"
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  let cleaned: string;

  if (hasDot && hasComma) {
    // Both present: dots are thousands, comma is decimal (European format)
    // e.g. "1.500.000,50" → "1500000.50"
    cleaned = str.replace(/\./g, '').replace(',', '.');
  } else if (hasDot && !hasComma) {
    // Only dots: check if they look like thousands separators
    // Heuristic: dot followed by exactly 3 digits (possibly repeated) = thousands
    const isThousandsSep = /^\d{1,3}(\.\d{3})+$/.test(str.replace(/[^\d.]/g, ''));
    if (isThousandsSep) {
      // Spanish thousands: "500.000" → "500000"
      cleaned = str.replace(/\./g, '');
    } else {
      // Decimal dot: "500.5" → "500.5"
      cleaned = str;
    }
  } else if (hasComma && !hasDot) {
    // Only comma: treat as decimal separator
    // e.g. "500,50" → "500.50"
    cleaned = str.replace(',', '.');
  } else {
    cleaned = str;
  }

  // Remove any remaining non-numeric chars except dot and minus
  cleaned = cleaned.replace(/[^\d.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Build dynamic column map with year-specific headers
function buildColumnMap(years: number[]): Record<string, string> {
  const base: Record<string, string> = {};

  // Helper to add all normalized synonyms for a field
  const addSynonyms = (field: string, synonyms: string[]) => {
    for (const syn of synonyms) {
      base[normalizeColumnName(syn)] = field;
    }
  };

  // Empresa
  addSynonyms('client_company', [
    'empresa', 'company', 'compañía', 'compañia', 'compania',
    'sociedad', 'denominación', 'denominacion', 'nombre empresa',
    'nombre de empresa', 'razón social', 'razon social',
    'denominación social', 'denominacion social',
  ]);

  // Contacto
  addSynonyms('client_name', [
    'contacto', 'contact', 'nombre', 'nombre contacto', 'nombre de contacto',
    'persona contacto', 'persona de contacto', 'responsable',
    'contact name', 'name', 'interlocutor',
  ]);

  // Email
  addSynonyms('client_email', [
    'email', 'e-mail', 'correo', 'correo electrónico', 'correo electronico',
    'mail', 'dirección email', 'direccion email', 'email address',
  ]);

  // Teléfono
  addSynonyms('client_phone', [
    'teléfono', 'telefono', 'phone', 'tel', 'telf', 'tlf',
    'móvil', 'movil', 'celular', 'telephone', 'mobile',
    'número teléfono', 'numero telefono',
  ]);

  // CIF
  addSynonyms('client_cif', [
    'cif', 'nif', 'tax id', 'vat', 'número fiscal', 'numero fiscal',
    'identificación fiscal', 'identificacion fiscal', 'nif/cif',
    'cif/nif', 'tax number', 'vat number',
  ]);

  // Legacy single-year (fallback)
  addSynonyms('revenue', [
    'facturación', 'facturacion', 'revenue', 'ventas', 'ingresos',
    'sales', 'turnover', 'cifra de negocio', 'cifra negocio',
    'volumen de negocio', 'volumen negocio',
  ]);
  addSynonyms('ebitda', ['ebitda', 'e.b.i.t.d.a', 'e-b-i-t-d-a']);
  addSynonyms('financial_year', ['año', 'ano', 'year', 'ejercicio']);

  // Year-specific mappings
  const suffixes = ['', '_year_2', '_year_3'];
  years.forEach((yr, i) => {
    const suffix = suffixes[i] || `_year_${i + 1}`;
    const revenueField = `revenue${suffix}`;
    const ebitdaField = `ebitda${suffix}`;

    addSynonyms(revenueField, [
      `facturación ${yr}`, `facturacion ${yr}`, `facturacion${yr}`,
      `revenue ${yr}`, `ventas ${yr}`, `ingresos ${yr}`,
      `sales ${yr}`, `turnover ${yr}`,
      `cifra de negocio ${yr}`, `cifra negocio ${yr}`,
    ]);

    addSynonyms(ebitdaField, [
      `ebitda ${yr}`, `ebitda${yr}`, `ebitda_${yr}`,
      `ebitda-${yr}`, `e.b.i.t.d.a ${yr}`,
    ]);
  });

  return base;
}

interface Props {
  campaignId: string;
  financialYears?: number[];
  yearsMode?: string;
}

// Build MAPPABLE_FIELDS dynamically based on years
function buildMappableFields(years: number[], is1Year: boolean): { value: string; label: string }[] {
  const fields = [
    { value: 'client_company', label: 'Empresa' },
    { value: 'client_name', label: 'Contacto' },
    { value: 'client_email', label: 'Email' },
    { value: 'client_phone', label: 'Teléfono' },
    { value: 'client_cif', label: 'CIF' },
    { value: 'revenue', label: `Facturación ${years[0] || ''}` },
    { value: 'ebitda', label: `EBITDA ${years[0] || ''}` },
  ];

  if (!is1Year && years.length >= 2) {
    fields.push(
      { value: 'revenue_year_2', label: `Facturación ${years[1]}` },
      { value: 'ebitda_year_2', label: `EBITDA ${years[1]}` },
    );
  }
  if (!is1Year && years.length >= 3) {
    fields.push(
      { value: 'revenue_year_3', label: `Facturación ${years[2]}` },
      { value: 'ebitda_year_3', label: `EBITDA ${years[2]}` },
    );
  }

  fields.push(
    { value: 'financial_year', label: 'Año' },
    { value: '__ignore__', label: '— Ignorar —' },
  );

  return fields;
}

interface PreviewRow {
  _raw: Record<string, any>;
  _mapped: Record<string, any>;
  _valid: boolean;
  _hasEmail: boolean;
  _duplicate: boolean;
}

const emptyYearRow = (year: number) => ({ year, revenue: '', ebitda: '' });

export function CompaniesStep({ campaignId, financialYears, yearsMode = '3_years' }: Props) {
  const is1Year = yearsMode === '1_year';
  const years = is1Year
    ? (financialYears && financialYears.length >= 1 ? financialYears.slice(0, 1) : [DEFAULT_YEARS[0]])
    : (financialYears && financialYears.length === 3 ? financialYears : DEFAULT_YEARS);
  const [YEAR_1, YEAR_2, YEAR_3] = [...years, years[0] - 1, years[0] - 2];
  const COLUMN_MAP = buildColumnMap(is1Year ? [YEAR_1] : years);
  const MAPPABLE_FIELDS = useMemo(() => buildMappableFields(years, is1Year), [years, is1Year]);

  const { companies, stats, addCompany, bulkAddCompanies, updateCompany, deleteCompany, bulkDeleteCompanies, isAdding, isBulkAdding, isUpdating, isDeleting, isBulkDeleting } = useCampaignCompanies(campaignId);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSelection = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(prev => prev.length === companies.length ? [] : companies.map(c => c.id));

  const isAllSelected = companies.length > 0 && selectedIds.length === companies.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < companies.length;

  const handleBulkDelete = async () => {
    await bulkDeleteCompanies(selectedIds);
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  // Edit dialog state
  const [editingCompany, setEditingCompany] = useState<CampaignCompany | null>(null);
  const [editForm, setEditForm] = useState({
    client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '',
    revenue: 0, ebitda: 0, financial_year: YEAR_1,
  });

  const openEditDialog = (c: CampaignCompany) => {
    setEditForm({
      client_company: c.client_company,
      client_name: c.client_name || '',
      client_email: c.client_email || '',
      client_phone: c.client_phone || '',
      client_cif: c.client_cif || '',
      revenue: c.revenue || 0,
      ebitda: c.ebitda,
      financial_year: c.financial_year,
    });
    setEditingCompany(c);
  };

  const handleSaveEdit = async () => {
    if (!editingCompany) return;
    await updateCompany({
      id: editingCompany.id,
      data: {
        client_company: editForm.client_company,
        client_name: editForm.client_name || null,
        client_email: editForm.client_email || null,
        client_phone: editForm.client_phone || null,
        client_cif: editForm.client_cif || null,
        revenue: editForm.revenue,
        ebitda: editForm.ebitda,
        financial_year: editForm.financial_year,
      },
    });
    setEditingCompany(null);
    toast.success('Empresa actualizada');
  };

  // AI Enrichment state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ current: 0, total: 0 });

  const companiesNeedingEnrich = companies.filter(
    c => !c.client_email || !c.client_name || !c.client_phone || !c.client_cif
  );

  const handleEnrichWithAI = async () => {
    if (companiesNeedingEnrich.length === 0) return;
    setIsEnriching(true);
    const total = companiesNeedingEnrich.length;
    setEnrichProgress({ current: 0, total });
    let enrichedCount = 0;

    // Process in batches of 3
    const BATCH_SIZE = 3;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = companiesNeedingEnrich.slice(i, i + BATCH_SIZE);

      try {
        const { data, error } = await (supabase.functions as any).invoke('enrich-campaign-companies-data', {
          body: {
            companies: batch.map(c => ({
              id: c.id,
              client_company: c.client_company,
              client_cif: c.client_cif,
              client_name: c.client_name,
              client_email: c.client_email,
              client_phone: c.client_phone,
            })),
          },
        });

        if (error) {
          console.error('Enrich error:', error);
          toast.error('Error en enriquecimiento: ' + error.message);
          break;
        }

        if (data?.results) {
          for (const result of data.results) {
            if (result.found && Object.keys(result.data).length > 0) {
              await updateCompany({ id: result.id, data: result.data });
              enrichedCount++;
            }
          }
        }
      } catch (e: any) {
        console.error('Enrich exception:', e);
        toast.error('Error inesperado en enriquecimiento');
        break;
      }

      setEnrichProgress({ current: Math.min(i + BATCH_SIZE, total), total });
    }

    setIsEnriching(false);
    toast.success(`Enriquecimiento completado: ${enrichedCount} de ${total} empresas actualizadas`);
  };

  // Manual form state
  const [manual, setManual] = useState({
    client_company: '', client_name: '', client_email: '', client_phone: '', client_cif: '',
  });
  const [manualYears, setManualYears] = useState(
    is1Year
      ? [{ year: YEAR_1, revenue: 0, ebitda: 0 }]
      : [
          { year: YEAR_1, revenue: 0, ebitda: 0 },
          { year: YEAR_2, revenue: 0, ebitda: 0 },
          { year: YEAR_3, revenue: 0, ebitda: 0 },
        ]
  );

  const updateManualYear = (idx: number, field: 'revenue' | 'ebitda', value: number) => {
    setManualYears(prev => prev.map((y, i) => i === idx ? { ...y, [field]: value } : y));
  };

  const handleAddManual = async () => {
    if (!manual.client_company) {
      toast.error('Empresa es obligatorio');
      return;
    }
    const hasEbitda = manualYears.some(y => y.ebitda !== 0);
    if (!hasEbitda) {
      toast.error('Al menos un año debe tener EBITDA');
      return;
    }

    const financialYearsData: FinancialYearData[] = manualYears
      .filter(y => y.ebitda !== 0)
      .map(y => ({
        year: y.year,
        revenue: y.revenue || 0,
        ebitda: y.ebitda,
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
    setManualYears(
      is1Year
        ? [{ year: YEAR_1, revenue: 0, ebitda: 0 }]
        : [{ year: YEAR_1, revenue: 0, ebitda: 0 }, { year: YEAR_2, revenue: 0, ebitda: 0 }, { year: YEAR_3, revenue: 0, ebitda: 0 }]
    );
  };

  // Excel preview state
  const [previewRows, setPreviewRows] = useState<Record<string, any>[] | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [rawPreviewRows, setRawPreviewRows] = useState<Record<string, any>[]>([]);

  // Excel upload — Phase 1: Preview with robust normalization
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      console.group('[EXCEL_PARSE] Processing file:', file.name);
      console.log('File size:', file.size, 'bytes');

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      console.log('Sheet:', sheetName, '| Total sheets:', workbook.SheetNames.length);

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);

      if (rows.length === 0) {
        toast.error('El archivo no contiene datos');
        console.groupEnd();
        return;
      }

      // Extract headers and auto-map using normalized matching
      const headers = Object.keys(rows[0]);
      console.log('Headers found:', headers);

      const autoMapping: Record<string, string> = {};
      const unmappedHeaders: string[] = [];

      for (const h of headers) {
        const normalized = normalizeColumnName(h);
        const mapped = COLUMN_MAP[normalized];
        if (mapped) {
          autoMapping[h] = mapped;
          console.log(`[COLUMN_MATCH] "${h}" (normalized: "${normalized}") → ${mapped}`);
        } else {
          unmappedHeaders.push(h);
        }
      }

      if (unmappedHeaders.length > 0) {
        console.warn('[UNMAPPED_COLUMNS]', unmappedHeaders);
      }
      console.log('[AUTO_MAPPING] Result:', autoMapping);

      setPreviewHeaders(headers);
      setHeaderMapping(autoMapping);
      setRawPreviewRows(rows);
      setPreviewRows(rows);
      console.log(`[EXCEL_PARSE] ${rows.length} rows found, ${Object.keys(autoMapping).length}/${headers.length} columns auto-mapped`);
      console.groupEnd();

      toast.info(`${rows.length} filas encontradas. Revisa el mapeo antes de importar.`);
    } catch (e: any) {
      console.error('[EXCEL_PARSE] Error:', e);
      console.groupEnd();
      toast.error('Error al procesar el archivo: ' + e.message);
    }
  }, []);

  const updateHeaderMap = (header: string, field: string) => {
    setHeaderMapping(prev => ({ ...prev, [header]: field === '__ignore__' ? '' : field }));
  };

  // Preview stats — now uses parseSpanishNumber
  const previewStats = useMemo(() => {
    if (!previewRows) return null;
    const existingNames = new Set(companies.map(c => c.client_company.toLowerCase()));
    const existingCifs = new Set(companies.filter(c => c.client_cif).map(c => c.client_cif!.toLowerCase()));

    let valid = 0, invalid = 0, noEmail = 0, duplicates = 0;
    for (const row of previewRows) {
      const companyHeader = previewHeaders.find(h => headerMapping[h] === 'client_company');
      const ebitdaHeader = previewHeaders.find(h => headerMapping[h] === 'ebitda');
      const emailHeader = previewHeaders.find(h => headerMapping[h] === 'client_email');
      const cifHeader = previewHeaders.find(h => headerMapping[h] === 'client_cif');

      const company = companyHeader ? String(row[companyHeader] || '').trim() : '';
      const ebitda = ebitdaHeader ? parseSpanishNumber(row[ebitdaHeader]) : 0;
      const email = emailHeader ? String(row[emailHeader] || '').trim() : '';
      const cif = cifHeader ? String(row[cifHeader] || '').trim() : '';

      const isDuplicate = (company && existingNames.has(company.toLowerCase())) || (cif && existingCifs.has(cif.toLowerCase()));
      if (isDuplicate) duplicates++;

      if (!company || !ebitda) { invalid++; }
      else { valid++; }
      if (!email) noEmail++;
    }
    return { total: previewRows.length, valid, invalid, noEmail, duplicates };
  }, [previewRows, headerMapping, previewHeaders, companies]);

  // Import from preview — uses parseSpanishNumber + debug logs
  const handleImportPreview = async () => {
    if (!previewRows) return;

    console.group('[EXCEL_IMPORT] Processing', previewRows.length, 'rows');

    const mapped = previewRows.map((row, idx) => {
      const result: Record<string, any> = { source: 'excel', excel_row_number: idx + 1 };
      for (const header of previewHeaders) {
        const field = headerMapping[header];
        if (!field) continue;
        const value = row[header];
        if (field.startsWith('revenue') || field.startsWith('ebitda')) {
          const parsed = parseSpanishNumber(value);
          result[field] = parsed;
          if (idx < 3) console.log(`[ROW ${idx + 1}] ${field}: raw="${value}" → parsed=${parsed}`);
        } else if (field === 'financial_year') {
          result[field] = parseInt(String(value)) || YEAR_1;
        } else {
          result[field] = String(value || '').trim();
        }
      }

      // Build financial_years_data
      const yearsData: FinancialYearData[] = [];
      const rev1 = result.revenue || 0;
      const ebitda1 = result.ebitda || 0;
      if (ebitda1) yearsData.push({ year: result.financial_year || YEAR_1, revenue: rev1, ebitda: ebitda1 });

      const rev2 = result.revenue_year_2 || 0;
      const ebitda2 = result.ebitda_year_2 || 0;
      if (ebitda2) yearsData.push({ year: YEAR_2, revenue: rev2, ebitda: ebitda2 });

      const rev3 = result.revenue_year_3 || 0;
      const ebitda3 = result.ebitda_year_3 || 0;
      if (ebitda3) yearsData.push({ year: YEAR_3, revenue: rev3, ebitda: ebitda3 });

      if (yearsData.length > 0) {
        result.financial_years_data = yearsData;
        if (!result.revenue && yearsData[0].revenue) result.revenue = yearsData[0].revenue;
        if (!result.ebitda && yearsData[0].ebitda) result.ebitda = yearsData[0].ebitda;
        if (!result.financial_year) result.financial_year = yearsData[0].year;
      }

      delete result.revenue_year_2;
      delete result.ebitda_year_2;
      delete result.revenue_year_3;
      delete result.ebitda_year_3;

      return result;
    });

    const valid = mapped.filter(r => r.client_company && r.ebitda);
    console.log(`[EXCEL_IMPORT] ${valid.length} valid rows out of ${mapped.length} total`);
    console.groupEnd();

    if (valid.length === 0) {
      toast.error('No se encontraron filas válidas');
      return;
    }

    await bulkAddCompanies(valid as Partial<CampaignCompanyInsert>[]);
    setPreviewRows(null);
    setPreviewHeaders([]);
    setHeaderMapping({});
    setRawPreviewRows([]);
  };

  const cancelPreview = () => {
    setPreviewRows(null);
    setPreviewHeaders([]);
    setHeaderMapping({});
    setRawPreviewRows([]);
  };

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
    const baseRow1: Record<string, any> = {
      Empresa: 'Empresa Ejemplo S.L.', Contacto: 'Juan Garcia', Email: 'juan@ejemplo.com',
      Telefono: '+34 612 345 678', CIF: 'B12345678',
      [`Facturacion ${YEAR_1}`]: 5000000, [`EBITDA ${YEAR_1}`]: 800000,
    };
    const baseRow2: Record<string, any> = {
      Empresa: 'Industrias Demo S.A.', Contacto: 'Ana Lopez', Email: 'ana@demo.com',
      Telefono: '+34 698 765 432', CIF: 'A87654321',
      [`Facturacion ${YEAR_1}`]: 12000000, [`EBITDA ${YEAR_1}`]: 2500000,
    };

    if (!is1Year) {
      baseRow1[`Facturacion ${YEAR_2}`] = 4500000; baseRow1[`EBITDA ${YEAR_2}`] = 720000;
      baseRow1[`Facturacion ${YEAR_3}`] = 4000000; baseRow1[`EBITDA ${YEAR_3}`] = 650000;
      baseRow2[`Facturacion ${YEAR_2}`] = 11000000; baseRow2[`EBITDA ${YEAR_2}`] = 2200000;
      baseRow2[`Facturacion ${YEAR_3}`] = 10000000; baseRow2[`EBITDA ${YEAR_3}`] = 2000000;
    }

    const data = [baseRow1, baseRow2];
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [{ wch: 25 }, { wch: 18 }, { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 14 }];
    if (!is1Year) {
      colWidths.push({ wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 });
    }
    ws['!cols'] = colWidths;
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
                <p className="text-xs text-muted-foreground mt-1">
                  Columnas: Empresa, Contacto, Email, CIF, Facturación {YEAR_1}{!is1Year ? `/${YEAR_2}/${YEAR_3}` : ''}, EBITDA {YEAR_1}{!is1Year ? `/${YEAR_2}/${YEAR_3}` : ''}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Excel Preview */}
      {previewRows && previewStats && (
        <Card>
          <CardHeader><CardTitle className="text-base">Preview de importación ({previewStats.total} filas)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="rounded-lg border p-2 text-center"><p className="text-lg font-bold">{previewStats.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-lg font-bold text-green-700">{previewStats.valid}</p><p className="text-xs text-muted-foreground">Válidas</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-lg font-bold text-yellow-700">{previewStats.noEmail}</p><p className="text-xs text-muted-foreground">Sin email</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-lg font-bold text-destructive">{previewStats.invalid}</p><p className="text-xs text-muted-foreground">Inválidas</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-lg font-bold text-orange-700">{previewStats.duplicates}</p><p className="text-xs text-muted-foreground">Duplicadas</p></div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewHeaders.map(h => (
                      <TableHead key={h} className="min-w-[140px]">
                        <div className="space-y-1">
                          <span className="text-xs font-normal text-muted-foreground">{h}</span>
                          <Select value={headerMapping[h] || '__ignore__'} onValueChange={v => updateHeaderMap(h, v)}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MAPPABLE_FIELDS.map(f => (<SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          {headerMapping[h] ? <Badge variant="default" className="text-[10px]"><Check className="h-2 w-2 mr-0.5" />{MAPPABLE_FIELDS.find(f => f.value === headerMapping[h])?.label}</Badge> : <Badge variant="secondary" className="text-[10px]">Sin mapear</Badge>}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 10).map((row, idx) => {
                    const companyH = previewHeaders.find(h => headerMapping[h] === 'client_company');
                    const ebitdaH = previewHeaders.find(h => headerMapping[h] === 'ebitda');
                    const emailH = previewHeaders.find(h => headerMapping[h] === 'client_email');
                    const isInvalid = !(companyH && row[companyH]) || !(ebitdaH && row[ebitdaH]);
                    const noEmail = !(emailH && row[emailH]);
                    return (
                      <TableRow key={idx} className={isInvalid ? 'bg-destructive/10' : noEmail ? 'bg-yellow-50/50' : ''}>
                        {previewHeaders.map(h => (<TableCell key={h} className="text-xs">{String(row[h] ?? '')}</TableCell>))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {previewRows.length > 10 && <p className="text-xs text-muted-foreground text-center">...y {previewRows.length - 10} filas más</p>}
            <div className="flex gap-2">
              <Button onClick={handleImportPreview} disabled={isBulkAdding || previewStats.valid === 0}><Check className="h-4 w-4 mr-1" />Importar {previewStats.valid} filas válidas</Button>
              <Button variant="outline" onClick={cancelPreview}><X className="h-4 w-4 mr-1" />Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

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

          {/* Financial Years */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Datos financieros ({is1Year ? '1 año' : '3 años'})</Label>
            <div className={cn("grid gap-3", is1Year ? "grid-cols-1 max-w-xs" : "grid-cols-1 md:grid-cols-3")}>
              {manualYears.map((yr, idx) => (
                <div key={yr.year} className="border rounded-lg p-3 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">{yr.year}</span>
                  <div className="space-y-1">
                    <Label className="text-xs">Facturación (€)</Label>
                    <CurrencyInput placeholder="0" value={yr.revenue} onChange={v => updateManualYear(idx, 'revenue', v)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">EBITDA (€) {idx === 0 ? '*' : ''}</Label>
                    <CurrencyInput placeholder="0" value={yr.ebitda} onChange={v => updateManualYear(idx, 'ebitda', v)} />
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
            <div className="flex gap-2 items-center text-xs font-normal">
              <Badge variant="outline">{stats.withEmail} con email</Badge>
              {stats.withoutEbitda > 0 && <Badge variant="destructive">{stats.withoutEbitda} sin EBITDA</Badge>}
              {companiesNeedingEnrich.length > 0 && companies.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnrichWithAI}
                  disabled={isEnriching}
                  className="ml-2"
                >
                  {isEnriching ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  {isEnriching ? `Enriqueciendo ${enrichProgress.current}/${enrichProgress.total}` : `Enriquecer con IA (${companiesNeedingEnrich.length})`}
                </Button>
              )}
            </div>
          </CardTitle>
          {isEnriching && (
            <Progress value={(enrichProgress.current / enrichProgress.total) * 100} className="h-2 mt-2" />
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Bulk selection bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b">
              <span className="text-sm font-medium">{selectedIds.length} seleccionada{selectedIds.length !== 1 ? 's' : ''}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Eliminar seleccionadas
              </Button>
            </div>
          )}
          {companies.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No hay empresas. Importa un Excel o añade manualmente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={() => toggleSelection(c.id)}
                        />
                      </TableCell>
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
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(c)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Empresa *</Label>
              <Input value={editForm.client_company} onChange={e => setEditForm(p => ({ ...p, client_company: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Contacto</Label>
                <Input value={editForm.client_name} onChange={e => setEditForm(p => ({ ...p, client_name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={editForm.client_email} onChange={e => setEditForm(p => ({ ...p, client_email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input value={editForm.client_phone} onChange={e => setEditForm(p => ({ ...p, client_phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CIF</Label>
                <Input value={editForm.client_cif} onChange={e => setEditForm(p => ({ ...p, client_cif: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Facturación (€)</Label>
                <CurrencyInput value={editForm.revenue} onChange={v => setEditForm(p => ({ ...p, revenue: v }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">EBITDA (€)</Label>
                <CurrencyInput value={editForm.ebitda} onChange={v => setEditForm(p => ({ ...p, ebitda: v }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Año</Label>
                <Input type="number" value={editForm.financial_year} onChange={e => setEditForm(p => ({ ...p, financial_year: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCompany(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating || !editForm.client_company}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedIds.length} empresa{selectedIds.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente las empresas seleccionadas de la campaña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isBulkDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
