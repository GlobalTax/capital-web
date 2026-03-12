import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValidatedRow {
  rowNumber: number;
  data: Record<string, any>;
  empresa: string;
  cif: string | null;
}

export interface ErrorRow extends ValidatedRow {
  motivo: string;
}

export interface ValidationResult {
  nuevas: ValidatedRow[];
  vinculadas: ValidatedRow[];
  duplicadas: ValidatedRow[];
  errores: ErrorRow[];
}

const CIF_REGEX = /^[A-Za-z0-9]{9}$/;

function normalizeCif(cif: string | null | undefined): string | null {
  if (!cif) return null;
  const trimmed = cif.toString().trim().toUpperCase();
  return trimmed || null;
}

export function useExcelImportValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validate = useCallback(async (
    rows: Record<string, any>[],
    listId: string
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      // Fetch existing CIFs in this list
      const { data: listCifs } = await supabase
        .from('outbound_list_companies' as any)
        .select('cif')
        .eq('list_id', listId)
        .not('cif', 'is', null);

      const existingInListSet = new Set(
        (listCifs || []).map((r: any) => normalizeCif(r.cif)).filter(Boolean) as string[]
      );

      // Fetch existing CIFs in empresas directory
      const { data: empresaCifs } = await supabase
        .from('empresas' as any)
        .select('cif')
        .not('cif', 'is', null);

      const existingInEmpresasSet = new Set(
        (empresaCifs || []).map((r: any) => normalizeCif(r.cif)).filter(Boolean) as string[]
      );

      const nuevas: ValidatedRow[] = [];
      const vinculadas: ValidatedRow[] = [];
      const duplicadas: ValidatedRow[] = [];
      const errores: ErrorRow[] = [];
      const seenCifsInExcel = new Set<string>();

      rows.forEach((data, index) => {
        const rowNumber = index + 2; // +2 for header row + 0-index
        const empresa = (data.empresa || '').toString().trim();
        const rawCif = data.cif ? data.cif.toString().trim() : null;
        const cif = normalizeCif(rawCif);
        const row: ValidatedRow = { rowNumber, data, empresa, cif };

        // Rule: no empresa AND no CIF → error
        if (!empresa && !cif) {
          errores.push({ ...row, motivo: 'Falta nombre de empresa y CIF' });
          return;
        }

        // Rule: CIF present but invalid format
        if (cif && !CIF_REGEX.test(cif)) {
          errores.push({ ...row, motivo: `CIF inválido: "${rawCif}" (debe ser alfanumérico de 9 caracteres)` });
          return;
        }

        // No CIF → import as nueva (can't dedup without CIF)
        if (!cif) {
          nuevas.push(row);
          return;
        }

        // Intra-Excel dedup
        if (seenCifsInExcel.has(cif)) {
          duplicadas.push(row);
          return;
        }
        seenCifsInExcel.add(cif);

        // Already in this list
        if (existingInListSet.has(cif)) {
          duplicadas.push(row);
          return;
        }

        // Exists in empresas directory but not in this list
        if (existingInEmpresasSet.has(cif)) {
          vinculadas.push(row);
          return;
        }

        nuevas.push(row);
      });

      const result: ValidationResult = { nuevas, vinculadas, duplicadas, errores };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setValidationResult(null);
  }, []);

  return { validate, isValidating, validationResult, reset };
}
