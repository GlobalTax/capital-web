// ============= GOOGLE ADS IMPORT HOOK =============
// Parser especializado para formato Google Ads (UTF-16, TAB, skiprows, números ES)
// Upsert en ads_costs_history con platform = 'google_ads'

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ParsedExcelRow, DuplicateInfo, ParseStats } from '@/hooks/useAdsCostsHistory';

// ============= SPANISH NUMBER PARSING =============

/**
 * Parse Spanish-formatted number string.
 * "1.487" -> 1487 (thousands separator)
 * "36,33" -> 36.33 (decimal comma)
 * "1.487,50" -> 1487.50 (both)
 */
export const parseSpanishNumber = (raw: any): number | undefined => {
  if (raw === null || raw === undefined || raw === '') return undefined;
  if (typeof raw === 'number') return raw;

  let str = String(raw).trim().replace(/\s/g, '').replace(/[€$]/g, '');
  if (!str) return undefined;

  const hasDot = str.includes('.');
  const hasComma = str.includes(',');

  if (hasDot && hasComma) {
    // "1.487,50" => dots are thousands, comma is decimal
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // "36,33" => comma is decimal
    str = str.replace(',', '.');
  } else if (hasDot) {
    // "1.487" => could be thousands OR decimal
    // Heuristic: if exactly 3 digits after dot and no more dots, it's thousands
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      // "1.487" -> 1487 (thousands)
      str = str.replace('.', '');
    }
    // else "1.5" stays as 1.5 (decimal)
  }

  const num = parseFloat(str);
  return isNaN(num) ? undefined : num;
};

/**
 * Parse Spanish percentage: "7,35%" -> 7.35
 */
export const parseSpanishPercent = (raw: any): number | undefined => {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const str = String(raw).trim().replace('%', '');
  return parseSpanishNumber(str);
};

// ============= UTF-16 DETECTION =============

const decodeFileContent = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check for UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  // Check for UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buffer);
  }
  // Check for UTF-8 BOM (EF BB BF) or plain UTF-8
  return new TextDecoder('utf-8').decode(buffer);
};

// ============= DATE PARSING =============

const parseGoogleAdsDate = (val: any): string => {
  if (!val) return '';
  const str = String(val).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try native Date parse
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {}

  return '';
};

// ============= COLUMN MATCHING =============

const COLUMN_ALIASES: Record<string, string[]> = {
  date: ['día', 'dia', 'day', 'date', 'fecha'],
  clicks: ['clics', 'clicks', 'click'],
  spend: ['coste', 'cost', 'gasto', 'importe gastado', 'spend'],
  conversions: ['conversiones', 'conversions', 'conv.'],
  ctr: ['ctr'],
  cpm: ['cpm medio', 'cpm', 'avg. cpm', 'cpm promedio'],
  campaign_status: ['estado de la campaña', 'estado de la campana', 'campaign state', 'campaign status', 'estado'],
  campaign_name: ['campaña', 'campana', 'campaign', 'nombre de la campaña', 'campaign name'],
  currency: ['código de moneda', 'codigo de moneda', 'currency code', 'currency'],
};

const findColumn = (headers: string[], key: string): number => {
  const aliases = COLUMN_ALIASES[key] || [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().trim();
    for (const alias of aliases) {
      if (h === alias || h.includes(alias)) return i;
    }
  }
  return -1;
};

// ============= MAIN HOOK =============

export const useGoogleAdsImport = () => {
  const queryClient = useQueryClient();
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [parseStats, setParseStats] = useState<ParseStats | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [needsCampaignName, setNeedsCampaignName] = useState(false);

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid && !r.isSkipped).length;
  const skippedCount = parsedRows.filter(r => r.isSkipped).length;

  const clearParsedData = useCallback(() => {
    setParsedRows([]);
    setDuplicates([]);
    setParseStats(null);
    setParseError(null);
    setNeedsCampaignName(false);
  }, []);

  const parseFile = useCallback(async (file: File, manualCampaignName?: string): Promise<void> => {
    setIsParsing(true);
    setParseError(null);
    setParsedRows([]);
    setDuplicates([]);
    setParseStats(null);
    setNeedsCampaignName(false);

    try {
      const text = await decodeFileContent(file);
      const allLines = text.split(/\r?\n/);

      // Skip first 2 metadata rows, then find header
      const lines = allLines.length > 2 ? allLines.slice(2) : allLines;

      // Find header row (first non-empty line with tabs)
      let headerIdx = -1;
      let headers: string[] = [];
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const cols = lines[i].split('\t').map(c => c.trim());
        if (cols.length >= 3) {
          const lower = cols.map(c => c.toLowerCase());
          const hasDate = lower.some(c => COLUMN_ALIASES.date.some(a => c.includes(a)));
          if (hasDate) {
            headerIdx = i;
            headers = cols;
            break;
          }
        }
      }

      if (headerIdx === -1) {
        throw new Error('No se encontró una fila de cabecera válida. Asegúrate de que el archivo tiene columnas como "Día", "Clics", "Coste".');
      }

      // Map columns
      const dateCol = findColumn(headers, 'date');
      const clicksCol = findColumn(headers, 'clicks');
      const spendCol = findColumn(headers, 'spend');
      const conversionsCol = findColumn(headers, 'conversions');
      const ctrCol = findColumn(headers, 'ctr');
      const cpmCol = findColumn(headers, 'cpm');
      const statusCol = findColumn(headers, 'campaign_status');
      const campaignCol = findColumn(headers, 'campaign_name');
      // currency column is found but intentionally ignored

      // Validate required columns
      if (dateCol === -1) throw new Error('Columna "Día" no encontrada. Cabecera: ' + headers.join(', '));
      if (spendCol === -1) throw new Error('Columna "Coste" no encontrada. Cabecera: ' + headers.join(', '));

      // Check if campaign name is available
      const hasCampaignCol = campaignCol !== -1;
      if (!hasCampaignCol && !manualCampaignName) {
        setNeedsCampaignName(true);
        setIsParsing(false);
        return;
      }

      // Parse data rows
      const dataLines = lines.slice(headerIdx + 1);
      const parsed: ParsedExcelRow[] = [];

      for (const line of dataLines) {
        if (!line.trim()) continue;
        const cols = line.split('\t').map(c => c.trim());
        if (cols.length < 2) continue;

        // Skip summary rows
        const firstCol = cols[0]?.toLowerCase().trim();
        if (firstCol === 'total' || firstCol === 'media' || firstCol === 'promedio') continue;

        const dateStr = parseGoogleAdsDate(cols[dateCol]);
        const clicks = parseSpanishNumber(cols[clicksCol]) ?? 0;
        const spend = parseSpanishNumber(cols[spendCol]) ?? 0;
        const conversions = parseSpanishNumber(cols[conversionsCol]) ?? 0;
        const ctr = ctrCol !== -1 ? parseSpanishPercent(cols[ctrCol]) : undefined;
        const cpm = cpmCol !== -1 ? parseSpanishNumber(cols[cpmCol]) : undefined;
        const campaignStatus = statusCol !== -1 ? cols[statusCol] : undefined;
        const campaignName = hasCampaignCol ? cols[campaignCol]?.trim() : manualCampaignName!;

        let isSkipped = false;
        let skipReason = '';

        if (!dateStr) {
          isSkipped = true;
          skipReason = 'Sin fecha válida';
        }
        if (!campaignName) {
          isSkipped = true;
          skipReason = 'Sin nombre de campaña';
        }

        // Build raw_row
        const raw_row: Record<string, any> = {};
        for (let i = 0; i < headers.length; i++) {
          if (headers[i] && cols[i] !== undefined) {
            raw_row[headers[i]] = cols[i];
          }
        }
        if (ctr !== undefined) raw_row._ctr_percent = ctr;
        if (campaignStatus) raw_row._campaign_status = campaignStatus;

        const cost_per_result = conversions > 0 ? spend / conversions : undefined;

        parsed.push({
          campaign_name: campaignName || '',
          date: dateStr,
          spend,
          currency: 'EUR',
          clicks,
          conversions,
          results: conversions > 0 ? conversions : undefined,
          cost_per_result,
          cpm,
          result_type: campaignStatus,
          raw_row,
          isValid: !isSkipped && !!campaignName && !!dateStr,
          errors: [],
          isSkipped,
          skipReason,
        });
      }

      setParsedRows(parsed);

      // Check for duplicates
      const validRows = parsed.filter(r => r.isValid);
      let duplicatesWillUpdate = 0;

      if (validRows.length > 0) {
        const { data: existing } = await supabase
          .from('ads_costs_history')
          .select('campaign_name, date, spend')
          .eq('platform', 'google_ads');

        if (existing) {
          const existingMap = new Map(existing.map(r => [`${r.campaign_name}|${r.date}`, r.spend]));
          const dupes: DuplicateInfo[] = validRows
            .filter(row => existingMap.has(`${row.campaign_name}|${row.date}`))
            .map(row => ({
              campaign_name: row.campaign_name,
              date: row.date,
              spend: row.spend,
              existsInDb: true,
              willUpdate: true,
            }));
          setDuplicates(dupes);
          duplicatesWillUpdate = dupes.length;
        }
      }

      setParseStats({
        totalRows: parsed.length,
        validRows: validRows.length,
        skippedRows: parsed.filter(r => r.isSkipped).length,
        errorRows: parsed.filter(r => !r.isValid && !r.isSkipped).length,
        duplicatesWillUpdate,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el archivo';
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const importData = useCallback(async (rows: ParsedExcelRow[]) => {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('No hay filas válidas para importar');
      return;
    }

    setIsImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Batch upsert in chunks of 100
      const BATCH_SIZE = 100;
      let totalUpserted = 0;

      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch = validRows.slice(i, i + BATCH_SIZE).map(row => ({
          platform: 'google_ads' as const,
          campaign_name: row.campaign_name,
          date: row.date,
          spend: row.spend,
          currency: 'EUR',
          clicks: row.clicks ?? 0,
          conversions: Math.round(row.conversions ?? 0),
          results: row.results,
          cost_per_result: row.cost_per_result,
          cpm: row.cpm,
          result_type: row.result_type,
          raw_row: row.raw_row as any,
          imported_by: user?.id || null,
        }));

        const { error } = await supabase
          .from('ads_costs_history')
          .upsert(batch, {
            onConflict: 'platform,campaign_name,date',
          });

        if (error) throw error;
        totalUpserted += batch.length;
      }

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['ads-costs-history'] });
      queryClient.invalidateQueries({ queryKey: ['google-ads-stats'] });
      queryClient.invalidateQueries({ queryKey: ['unified-costs'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-registry'] });
      queryClient.invalidateQueries({ queryKey: ['marketing_metrics_unified'] });

      toast.success(`${totalUpserted} registros de Google Ads importados correctamente`);
    } catch (err: any) {
      const detail = err?.message || err?.details || 'Error desconocido';
      const hint = err?.hint ? ` (${err.hint})` : '';
      console.error('Google Ads import error:', err);
      toast.error(`Error al importar: ${detail}${hint}`);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, [queryClient]);

  return {
    parsedRows,
    duplicates,
    parseStats,
    isParsing,
    parseError,
    isImporting,
    parseFile,
    importData,
    clearParsedData,
    needsCampaignName,
    validCount,
    invalidCount,
    skippedCount,
  };
};
