// ============= ADS COSTS HISTORY HOOK =============
// Hook para gestionar histórico de costes de Meta Ads y Google Ads
// Soporta importación de Excel con detección automática de cabecera
// Filtra filas de resumen (Media/Total) y usa UPSERT para evitar duplicados

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export type AdsPlatform = 'meta_ads' | 'google_ads';

export interface AdsCostRecord {
  id: string;
  platform: AdsPlatform;
  campaign_name: string;
  campaign_id?: string;
  date: string;
  spend: number;
  currency: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  result_type?: string;
  results?: number;
  cost_per_result?: number;
  reach?: number;
  frequency?: number;
  cpm?: number;
  link_clicks?: number;
  raw_row: Record<string, any>;
  imported_at: string;
  imported_by?: string;
}

export interface ParsedExcelRow {
  campaign_name: string;
  campaign_id?: string;
  date: string;
  spend: number;
  currency: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  result_type?: string;
  results?: number;
  cost_per_result?: number;
  reach?: number;
  frequency?: number;
  cpm?: number;
  link_clicks?: number;
  raw_row: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isSkipped: boolean; // Para filas de Media/Total
  skipReason?: string;
}

export interface DuplicateInfo {
  campaign_name: string;
  date: string;
  spend: number;
  existsInDb: boolean;
  willUpdate: boolean; // Se actualizará con UPSERT
}

export interface ParseStats {
  totalRows: number;
  validRows: number;
  skippedRows: number; // Media/Total
  errorRows: number;
  duplicatesWillUpdate: number;
}

// ============= FETCH HOOK =============

export const useAdsCostsHistory = (platform: AdsPlatform) => {
  return useQuery({
    queryKey: ['ads-costs-history', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_costs_history')
        .select('*')
        .eq('platform', platform)
        .order('date', { ascending: false })
        .limit(2000); // Limit to prevent timeout

      if (error) {
        console.warn('[useAdsCostsHistory] Error fetching:', error.message);
        throw error;
      }
      return (data ?? []) as AdsCostRecord[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Only retry once to avoid long waits
  });
};

// ============= CALCULATED STATS =============

export interface CalculatedStats {
  // Totals
  totalSpend: number;
  totalResults: number;
  totalImpressions: number;
  totalClicks: number;
  totalLinkClicks: number;
  totalReach: number;
  
  // Averages
  avgCostPerResult: number;
  avgCpm: number;
  avgFrequency: number;
  avgSpendPerDay: number;
  
  // Counts
  recordCount: number;
  campaignCount: number;
  uniqueDays: number;
}

export const calculateStats = (records: AdsCostRecord[] | null | undefined): CalculatedStats => {
  // Safe check for empty or invalid data
  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      totalSpend: 0,
      totalResults: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalLinkClicks: 0,
      totalReach: 0,
      avgCostPerResult: 0,
      avgCpm: 0,
      avgFrequency: 0,
      avgSpendPerDay: 0,
      recordCount: 0,
      campaignCount: 0,
      uniqueDays: 0,
    };
  }

  const totalSpend = records.reduce((sum, r) => sum + (r.spend || 0), 0);
  const totalResults = records.reduce((sum, r) => sum + (r.results || r.conversions || 0), 0);
  const totalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const totalClicks = records.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalLinkClicks = records.reduce((sum, r) => sum + (r.link_clicks || 0), 0);
  const totalReach = records.reduce((sum, r) => sum + (r.reach || 0), 0);
  
  const uniqueCampaigns = new Set(records.map(r => r.campaign_name));
  const uniqueDates = new Set(records.map(r => r.date));
  
  // Calculate averages from valid values (not null/undefined)
  const cpmValues = records.filter(r => r.cpm != null).map(r => r.cpm!);
  const frequencyValues = records.filter(r => r.frequency != null).map(r => r.frequency!);
  
  const avgCpm = cpmValues.length > 0 
    ? cpmValues.reduce((a, b) => a + b, 0) / cpmValues.length 
    : totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  
  const avgFrequency = frequencyValues.length > 0 
    ? frequencyValues.reduce((a, b) => a + b, 0) / frequencyValues.length 
    : 0;
  
  const avgCostPerResult = totalResults > 0 ? totalSpend / totalResults : 0;
  const avgSpendPerDay = uniqueDates.size > 0 ? totalSpend / uniqueDates.size : 0;

  return {
    totalSpend,
    totalResults,
    totalImpressions,
    totalClicks,
    totalLinkClicks,
    totalReach,
    avgCostPerResult,
    avgCpm,
    avgFrequency,
    avgSpendPerDay,
    recordCount: records.length,
    campaignCount: uniqueCampaigns.size,
    uniqueDays: uniqueDates.size,
  };
};

// ============= IMPORT HOOK =============

export const useAdsCostsImport = (platform: AdsPlatform) => {
  const queryClient = useQueryClient();
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [parseStats, setParseStats] = useState<ParseStats | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse Excel file with auto-header detection
  const parseExcel = useCallback(async (file: File): Promise<void> => {
    setIsParsing(true);
    setParseError(null);
    setParsedRows([]);
    setDuplicates([]);
    setParseStats(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get raw data as array of arrays to find header row
      const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd',
        defval: ''
      });

      if (rawData.length === 0) {
        throw new Error('El archivo está vacío');
      }

      // Find header row by looking for "Día" and "Nombre de la campaña"
      let headerRowIndex = -1;
      let headerRow: string[] = [];
      
      for (let i = 0; i < Math.min(rawData.length, 20); i++) {
        const row = rawData[i] as any[];
        if (!row || row.length === 0) continue;
        
        const rowStr = row.map(c => String(c || '').toLowerCase().trim());
        
        // Look for both "día" and "nombre de la campaña" in the same row
        const hasDia = rowStr.some(c => c.includes('día') || c.includes('dia') || c === 'day' || c === 'date');
        const hasCampaign = rowStr.some(c => 
          c.includes('nombre de la campaña') || 
          c.includes('campaign name') || 
          c.includes('campaña') ||
          c === 'campaign'
        );
        
        if (hasDia && hasCampaign) {
          headerRowIndex = i;
          headerRow = row.map(c => String(c || '').trim());
          break;
        }
      }

      if (headerRowIndex === -1) {
        // Fallback: try first row with data
        for (let i = 0; i < Math.min(rawData.length, 10); i++) {
          const row = rawData[i] as any[];
          if (row && row.filter(c => c).length >= 3) {
            headerRowIndex = i;
            headerRow = row.map(c => String(c || '').trim());
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        throw new Error('No se encontró una fila de cabecera válida con "Día" y "Nombre de la campaña"');
      }

      // Build column mapping
      const findColumnIndex = (patterns: string[]): number => {
        for (let i = 0; i < headerRow.length; i++) {
          const col = headerRow[i].toLowerCase().trim();
          for (const pattern of patterns) {
            if (col.includes(pattern.toLowerCase())) {
              return i;
            }
          }
        }
        return -1;
      };

      const campaignIdx = findColumnIndex(['nombre de la campaña', 'campaign name', 'campaña', 'campaign']);
      const dateIdx = findColumnIndex(['día', 'dia', 'day', 'date', 'fecha']);
      // IMPORTANT: 'importe gastado' must be specific to avoid matching 'Coste por resultado'
      // Do NOT use generic patterns like 'coste' or 'gasto' which could match wrong columns
      const spendIdx = findColumnIndex(['importe gastado', 'amount spent', 'spend']);
      const resultTypeIdx = findColumnIndex(['tipo de resultado', 'result type']);
      const resultsIdx = findColumnIndex(['resultados', 'results']);
      const costPerResultIdx = findColumnIndex(['coste por resultado', 'cost per result']);
      const impressionsIdx = findColumnIndex(['impresiones', 'impressions']);
      const reachIdx = findColumnIndex(['alcance', 'reach']);
      const frequencyIdx = findColumnIndex(['frecuencia', 'frequency']);
      const cpmIdx = findColumnIndex(['cpm', 'coste por 1.000', 'coste por 1000']);
      const linkClicksIdx = findColumnIndex(['clics en el enlace', 'link clicks', 'clics']);

      if (campaignIdx === -1) {
        throw new Error('No se encontró columna "Nombre de la campaña". Cabecera: ' + headerRow.join(', '));
      }
      if (dateIdx === -1) {
        throw new Error('No se encontró columna "Día". Cabecera: ' + headerRow.join(', '));
      }
      if (spendIdx === -1) {
        throw new Error('No se encontró columna "Importe gastado". Cabecera: ' + headerRow.join(', '));
      }

      // Parse data rows (skip header and empty rows)
      const dataRows = rawData.slice(headerRowIndex + 1);
      
      const parseNumber = (val: any): number | undefined => {
        if (val === null || val === undefined || val === '') return undefined;
        if (typeof val === 'number') return val;
        const cleaned = String(val)
          .replace(/[€$£%]/g, '')
          .replace(/\s/g, '')
          .replace(',', '.')
          .trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? undefined : num;
      };

      const parseDate = (val: any): string => {
        if (!val) return '';
        if (val instanceof Date) {
          return format(val, 'yyyy-MM-dd');
        }
        if (typeof val === 'number') {
          // Excel serial date
          const excelEpoch = new Date(1899, 11, 30);
          const date = new Date(excelEpoch.getTime() + val * 86400000);
          return format(date, 'yyyy-MM-dd');
        }
        const str = String(val).trim();
        // Try various formats
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
          const [d, m, y] = str.split('/');
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (/^\d{2}\/\d{2}\/\d{2}$/.test(str)) {
          const [d, m, y] = str.split('/');
          const fullYear = parseInt(y) < 50 ? `20${y}` : `19${y}`;
          return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        try {
          const parsed = new Date(str);
          if (!isNaN(parsed.getTime())) {
            return format(parsed, 'yyyy-MM-dd');
          }
        } catch {}
        return '';
      };

      // Summary row detection patterns
      const isSummaryRow = (campaignName: string): boolean => {
        const lower = campaignName.toLowerCase().trim();
        return lower === 'media' || 
               lower === 'total' || 
               lower === 'average' || 
               lower === 'sum' ||
               lower === 'promedio' ||
               lower === 'suma';
      };

      const parsed: ParsedExcelRow[] = [];

      for (const row of dataRows) {
        if (!row || !Array.isArray(row)) continue;
        
        const campaignName = String(row[campaignIdx] || '').trim();
        const dateValue = row[dateIdx];
        const spendValue = row[spendIdx];
        
        // Skip completely empty rows
        if (!campaignName && !dateValue && !spendValue) continue;
        
        const errors: string[] = [];
        let isSkipped = false;
        let skipReason = '';

        // Check if this is a summary row (Media/Total)
        if (isSummaryRow(campaignName)) {
          isSkipped = true;
          skipReason = `Fila de resumen "${campaignName}" ignorada`;
        }

        // Parse date
        const dateStr = parseDate(dateValue);
        if (!dateStr && !isSkipped) {
          isSkipped = true;
          skipReason = 'Sin fecha válida';
        }

        // Skip if campaign name is empty
        if (!campaignName && !isSkipped) {
          isSkipped = true;
          skipReason = 'Sin nombre de campaña';
        }

        // Parse spend
        const spend = parseNumber(spendValue) ?? 0;

        // Parse optional Meta Ads fields
        const result_type = resultTypeIdx >= 0 ? String(row[resultTypeIdx] || '').trim() || undefined : undefined;
        const results = resultsIdx >= 0 ? parseNumber(row[resultsIdx]) : undefined;
        const cost_per_result = costPerResultIdx >= 0 ? parseNumber(row[costPerResultIdx]) : undefined;
        const impressions = impressionsIdx >= 0 ? parseNumber(row[impressionsIdx]) : undefined;
        const reach = reachIdx >= 0 ? parseNumber(row[reachIdx]) : undefined;
        const frequency = frequencyIdx >= 0 ? parseNumber(row[frequencyIdx]) : undefined;
        const cpm = cpmIdx >= 0 ? parseNumber(row[cpmIdx]) : undefined;
        const link_clicks = linkClicksIdx >= 0 ? parseNumber(row[linkClicksIdx]) : undefined;

        // Build raw_row object from header
        const raw_row: Record<string, any> = {};
        for (let i = 0; i < headerRow.length; i++) {
          if (headerRow[i] && row[i] !== undefined) {
            raw_row[headerRow[i]] = row[i];
          }
        }

        parsed.push({
          campaign_name: campaignName,
          date: dateStr,
          spend,
          currency: 'EUR',
          impressions,
          clicks: link_clicks, // Use link_clicks as primary clicks
          conversions: results,
          result_type,
          results,
          cost_per_result,
          reach,
          frequency,
          cpm,
          link_clicks,
          raw_row,
          isValid: !isSkipped && errors.length === 0 && !!campaignName && !!dateStr,
          errors,
          isSkipped,
          skipReason,
        });
      }

      setParsedRows(parsed);

      // Calculate parse stats
      const stats: ParseStats = {
        totalRows: parsed.length,
        validRows: parsed.filter(r => r.isValid).length,
        skippedRows: parsed.filter(r => r.isSkipped).length,
        errorRows: parsed.filter(r => !r.isValid && !r.isSkipped).length,
        duplicatesWillUpdate: 0,
      };

      // Check for existing records (will be updated via UPSERT)
      const validRows = parsed.filter(r => r.isValid);
      if (validRows.length > 0) {
        const { data: existingRecords, error: checkError } = await supabase
          .from('ads_costs_history')
          .select('campaign_name, date, spend')
          .eq('platform', platform);

        if (!checkError && existingRecords) {
          const existingMap = new Map(
            existingRecords.map(r => [`${r.campaign_name}|${r.date}`, r.spend])
          );

          const duplicateRows: DuplicateInfo[] = validRows
            .filter(row => existingMap.has(`${row.campaign_name}|${row.date}`))
            .map(row => ({
              campaign_name: row.campaign_name,
              date: row.date,
              spend: row.spend,
              existsInDb: true,
              willUpdate: true,
            }));

          setDuplicates(duplicateRows);
          stats.duplicatesWillUpdate = duplicateRows.length;
        }
      }

      setParseStats(stats);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el archivo';
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, [platform]);

  // Import mutation with UPSERT
  const importMutation = useMutation({
    mutationFn: async (rows: ParsedExcelRow[]) => {
      const validRows = rows.filter(r => r.isValid);
      
      if (validRows.length === 0) {
        throw new Error('No hay filas válidas para importar');
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Debes estar autenticado para importar datos');
      }

      // Prepare records with proper data types
      const records = validRows.map(row => ({
        platform,
        campaign_name: row.campaign_name.substring(0, 500), // Truncate if too long
        date: row.date,
        spend: typeof row.spend === 'number' ? row.spend : 0,
        currency: row.currency || 'EUR',
        impressions: row.impressions != null ? Math.round(row.impressions) : null,
        clicks: row.clicks != null ? Math.round(row.clicks) : null,
        conversions: row.conversions != null ? Math.round(row.conversions) : null,
        result_type: row.result_type || null,
        results: row.results != null ? row.results : null,
        cost_per_result: row.cost_per_result != null ? row.cost_per_result : null,
        reach: row.reach != null ? Math.round(row.reach) : null,
        frequency: row.frequency != null ? row.frequency : null,
        cpm: row.cpm != null ? row.cpm : null,
        link_clicks: row.link_clicks != null ? Math.round(row.link_clicks) : null,
        raw_row: row.raw_row || {},
        imported_by: user.id,
      }));

      // Use UPSERT with ON CONFLICT on the unique index
      // The unique index is: (platform, campaign_name, date)
      const { data, error } = await supabase
        .from('ads_costs_history')
        .upsert(records, { 
          onConflict: 'platform,campaign_name,date',
          ignoreDuplicates: false // Update existing records
        })
        .select('id');

      if (error) {
        // Provide specific error messages
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          throw new Error('No tienes permisos para importar datos. Contacta al administrador.');
        }
        if (error.code === '23505') {
          throw new Error('Error de datos duplicados. Intenta de nuevo.');
        }
        if (error.code === '23503') {
          throw new Error('Error de referencia en base de datos.');
        }
        if (error.code === '22P02') {
          throw new Error('Error de formato de datos. Revisa el archivo Excel.');
        }
        throw new Error(error.message || 'Error desconocido al importar');
      }

      return data || [];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads-costs-history', platform] });
      const count = Array.isArray(data) ? data.length : 0;
      toast.success(`${count} registros importados/actualizados correctamente`);
      setParsedRows([]);
      setDuplicates([]);
      setParseStats(null);
    },
    onError: (error: Error) => {
      console.error('Import error:', error);
      toast.error(error.message || 'Error al importar');
    },
  });

  const clearParsedData = useCallback(() => {
    setParsedRows([]);
    setDuplicates([]);
    setParseStats(null);
    setParseError(null);
  }, []);

  return {
    parsedRows,
    duplicates,
    parseStats,
    isParsing,
    parseError,
    isImporting: importMutation.isPending,
    parseExcel,
    importData: importMutation.mutate,
    clearParsedData,
    validCount: parsedRows.filter(r => r.isValid).length,
    invalidCount: parsedRows.filter(r => !r.isValid && !r.isSkipped).length,
    skippedCount: parsedRows.filter(r => r.isSkipped).length,
  };
};

// ============= EXPORT HOOK =============

export const useExportAdsCosts = () => {
  const exportToExcel = useCallback((records: AdsCostRecord[], filename: string) => {
    const exportData = records.map(r => ({
      'Fecha': r.date,
      'Campaña': r.campaign_name,
      'Gasto (EUR)': r.spend,
      'Tipo de Resultado': r.result_type || '',
      'Resultados': r.results || r.conversions || '',
      'Coste por Resultado': r.cost_per_result || '',
      'Impresiones': r.impressions || '',
      'Alcance': r.reach || '',
      'Frecuencia': r.frequency || '',
      'CPM': r.cpm || '',
      'Clics en Enlace': r.link_clicks || r.clicks || '',
      'Importado': r.imported_at,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Costes');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success('Exportado correctamente');
  }, []);

  return { exportToExcel };
};
