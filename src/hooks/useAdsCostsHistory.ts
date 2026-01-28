// ============= ADS COSTS HISTORY HOOK =============
// Hook para gestionar histórico de costes de Meta Ads y Google Ads

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
  raw_row: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export interface DuplicateInfo {
  campaign_name: string;
  date: string;
  spend: number;
  existsInDb: boolean;
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
        .order('date', { ascending: false });

      if (error) throw error;
      return data as AdsCostRecord[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ============= IMPORT HOOK =============

export const useAdsCostsImport = (platform: AdsPlatform) => {
  const queryClient = useQueryClient();
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse Excel file
  const parseExcel = useCallback(async (file: File): Promise<void> => {
    setIsParsing(true);
    setParseError(null);
    setParsedRows([]);
    setDuplicates([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
        raw: false,
        dateNF: 'yyyy-mm-dd'
      });

      if (jsonData.length === 0) {
        throw new Error('El archivo está vacío o no tiene datos válidos');
      }

      // Detect column mappings (flexible column names)
      const firstRow = jsonData[0];
      const columns = Object.keys(firstRow);
      
      const findColumn = (patterns: string[]): string | null => {
        for (const col of columns) {
          const lowerCol = col.toLowerCase().trim();
          for (const pattern of patterns) {
            if (lowerCol.includes(pattern.toLowerCase())) {
              return col;
            }
          }
        }
        return null;
      };

      const campaignCol = findColumn(['campaign', 'campaña', 'nombre campaña', 'campaign name', 'nombre de campaña']);
      const campaignIdCol = findColumn(['campaign id', 'id campaña', 'id de campaña', 'id']);
      const dateCol = findColumn(['date', 'fecha', 'día', 'day', 'reporting starts']);
      const spendCol = findColumn(['spend', 'gasto', 'cost', 'coste', 'amount', 'importe', 'amount spent', 'amount spent (eur)']);
      const currencyCol = findColumn(['currency', 'moneda', 'divisa']);
      const impressionsCol = findColumn(['impressions', 'impresiones', 'impr']);
      const clicksCol = findColumn(['clicks', 'clics']);
      const conversionsCol = findColumn(['conversions', 'conversiones', 'results', 'resultados']);

      if (!campaignCol) {
        throw new Error('No se encontró columna de "Campaña" o "Campaign". Columnas disponibles: ' + columns.join(', '));
      }
      if (!dateCol) {
        throw new Error('No se encontró columna de "Fecha" o "Date". Columnas disponibles: ' + columns.join(', '));
      }
      if (!spendCol) {
        throw new Error('No se encontró columna de "Gasto" o "Spend". Columnas disponibles: ' + columns.join(', '));
      }

      // Parse rows
      const parsed: ParsedExcelRow[] = jsonData.map((row, index) => {
        const errors: string[] = [];
        
        // Campaign name
        const campaign_name = String(row[campaignCol] || '').trim();
        if (!campaign_name) {
          errors.push('Campaña vacía');
        }

        // Campaign ID (optional)
        const campaign_id = campaignIdCol ? String(row[campaignIdCol] || '').trim() || undefined : undefined;

        // Date
        let dateValue = row[dateCol];
        let dateStr = '';
        
        if (dateValue instanceof Date) {
          dateStr = format(dateValue, 'yyyy-MM-dd');
        } else if (typeof dateValue === 'string') {
          // Try to parse various date formats
          const cleaned = dateValue.trim();
          // Check if it's already in ISO format
          if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
            dateStr = cleaned;
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) {
            // DD/MM/YYYY
            const [d, m, y] = cleaned.split('/');
            dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else if (/^\d{2}\/\d{2}\/\d{2}$/.test(cleaned)) {
            // DD/MM/YY
            const [d, m, y] = cleaned.split('/');
            const fullYear = parseInt(y) < 50 ? `20${y}` : `19${y}`;
            dateStr = `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            try {
              const parsed = new Date(cleaned);
              if (!isNaN(parsed.getTime())) {
                dateStr = format(parsed, 'yyyy-MM-dd');
              }
            } catch {
              // Keep empty
            }
          }
        } else if (typeof dateValue === 'number') {
          // Excel serial date
          const excelEpoch = new Date(1899, 11, 30);
          const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
          dateStr = format(date, 'yyyy-MM-dd');
        }

        if (!dateStr) {
          errors.push(`Fecha inválida: "${dateValue}"`);
        }

        // Spend
        let spendValue = row[spendCol];
        let spend = 0;
        
        if (typeof spendValue === 'number') {
          spend = spendValue;
        } else if (typeof spendValue === 'string') {
          // Clean currency symbols and parse
          const cleaned = spendValue
            .replace(/[€$£]/g, '')
            .replace(/\s/g, '')
            .replace(',', '.')
            .trim();
          spend = parseFloat(cleaned);
          if (isNaN(spend)) {
            errors.push(`Gasto inválido: "${spendValue}"`);
            spend = 0;
          }
        }

        // Currency (default EUR)
        const currency = currencyCol ? String(row[currencyCol] || 'EUR').toUpperCase() : 'EUR';

        // Optional numeric fields
        const parseOptionalNumber = (val: any): number | undefined => {
          if (val === null || val === undefined || val === '') return undefined;
          const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
          return isNaN(num) ? undefined : num;
        };

        const impressions = impressionsCol ? parseOptionalNumber(row[impressionsCol]) : undefined;
        const clicks = clicksCol ? parseOptionalNumber(row[clicksCol]) : undefined;
        const conversions = conversionsCol ? parseOptionalNumber(row[conversionsCol]) : undefined;

        return {
          campaign_name,
          campaign_id,
          date: dateStr,
          spend,
          currency,
          impressions,
          clicks,
          conversions,
          raw_row: row,
          isValid: errors.length === 0 && campaign_name && dateStr && spend >= 0,
          errors,
        };
      });

      setParsedRows(parsed);

      // Check for duplicates in database
      const validRows = parsed.filter(r => r.isValid);
      if (validRows.length > 0) {
        const { data: existingRecords, error: checkError } = await supabase
          .from('ads_costs_history')
          .select('campaign_name, date, spend')
          .eq('platform', platform);

        if (!checkError && existingRecords) {
          const existingSet = new Set(
            existingRecords.map(r => `${r.campaign_name}|${r.date}|${r.spend}`)
          );

          const duplicateRows: DuplicateInfo[] = validRows
            .filter(row => existingSet.has(`${row.campaign_name}|${row.date}|${row.spend}`))
            .map(row => ({
              campaign_name: row.campaign_name,
              date: row.date,
              spend: row.spend,
              existsInDb: true,
            }));

          setDuplicates(duplicateRows);
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el archivo';
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, [platform]);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (rows: ParsedExcelRow[]) => {
      const validRows = rows.filter(r => r.isValid);
      
      if (validRows.length === 0) {
        throw new Error('No hay filas válidas para importar');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const records = validRows.map(row => ({
        platform,
        campaign_name: row.campaign_name,
        campaign_id: row.campaign_id,
        date: row.date,
        spend: row.spend,
        currency: row.currency,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        raw_row: row.raw_row,
        imported_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('ads_costs_history')
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads-costs-history', platform] });
      toast.success(`${data.length} registros importados correctamente`);
      setParsedRows([]);
      setDuplicates([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al importar');
    },
  });

  const clearParsedData = useCallback(() => {
    setParsedRows([]);
    setDuplicates([]);
    setParseError(null);
  }, []);

  return {
    parsedRows,
    duplicates,
    isParsing,
    parseError,
    isImporting: importMutation.isPending,
    parseExcel,
    importData: importMutation.mutate,
    clearParsedData,
    validCount: parsedRows.filter(r => r.isValid).length,
    invalidCount: parsedRows.filter(r => !r.isValid).length,
  };
};

// ============= EXPORT HOOK =============

export const useExportAdsCosts = () => {
  const exportToExcel = useCallback((records: AdsCostRecord[], filename: string) => {
    const exportData = records.map(r => ({
      'Fecha': r.date,
      'Campaña': r.campaign_name,
      'ID Campaña': r.campaign_id || '',
      'Gasto': r.spend,
      'Moneda': r.currency,
      'Impresiones': r.impressions || '',
      'Clics': r.clicks || '',
      'Conversiones': r.conversions || '',
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
