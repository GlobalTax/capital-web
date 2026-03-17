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

export interface RelatedListRow extends ValidatedRow {
  listaRelacionada: string;
}

export interface ConflictRow extends ValidatedRow {
  sublistaConflicto: string;
}

export interface ValidationResult {
  nuevas: ValidatedRow[];
  vinculadas: ValidatedRow[];
  duplicadas: ValidatedRow[];
  enOtraLista: RelatedListRow[];
  conflictoSublistado: ConflictRow[];
  errores: ErrorRow[];
}

const CIF_REGEX = /^[A-Za-z0-9]{9}$/;

function normalizeCif(cif: string | null | undefined): string | null {
  if (!cif) return null;
  const trimmed = cif.toString().trim().toUpperCase();
  return trimmed || null;
}

/** Paginate a Supabase query to fetch ALL rows (beyond the 1000-row default limit). */
async function fetchAllPaginated<T = any>(
  buildQuery: (from: number, to: number) => any,
  pageSize = 1000
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export function useExcelImportValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validate = useCallback(async (
    rows: Record<string, any>[],
    listId: string,
    listaMadreId?: string | null
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      // Fetch ALL existing CIFs in this list (paginated)
      const listCifs = await fetchAllPaginated<{ cif: string }>((from, to) =>
        supabase
          .from('outbound_list_companies' as any)
          .select('cif')
          .eq('list_id', listId)
          .not('cif', 'is', null)
          .range(from, to)
      );

      const existingInListSet = new Set(
        listCifs.map((r: any) => normalizeCif(r.cif)).filter(Boolean) as string[]
      );

      // Fetch ALL existing CIFs in empresas directory (paginated)
      const empresaCifs = await fetchAllPaginated<{ cif: string }>((from, to) =>
        supabase
          .from('empresas' as any)
          .select('cif')
          .not('cif', 'is', null)
          .range(from, to)
      );

      const existingInEmpresasSet = new Set(
        empresaCifs.map((r: any) => normalizeCif(r.cif)).filter(Boolean) as string[]
      );

      // Fetch CIFs from related lists (parent + siblings)
      // relatedCifMap: cif → { name, isConflict }
      // isConflict=true means sibling sublist (should block), false means parent (informational)
      const relatedCifMap = new Map<string, { name: string; isConflict: boolean }>();
      if (listaMadreId) {
        const parentCompanies = await fetchAllPaginated((from, to) =>
          supabase
            .from('outbound_list_companies' as any)
            .select('cif')
            .eq('list_id', listaMadreId)
            .not('cif', 'is', null)
            .range(from, to)
        );

        const { data: parentListData } = await supabase
          .from('outbound_lists' as any)
          .select('name')
          .eq('id', listaMadreId)
          .single();

        const parentName = (parentListData as any)?.name || 'Lista madre';
        parentCompanies.forEach((r: any) => {
          const c = normalizeCif(r.cif);
          if (c) relatedCifMap.set(c, { name: parentName, isConflict: false });
        });

        // Get sibling lists — these are CONFLICTS
        const { data: siblingLists } = await supabase
          .from('outbound_lists' as any)
          .select('id, name')
          .eq('lista_madre_id', listaMadreId)
          .neq('id', listId);

        for (const sibling of (siblingLists || []) as any[]) {
          const sibCifs = await fetchAllPaginated((from, to) =>
            supabase
              .from('outbound_list_companies' as any)
              .select('cif')
              .eq('list_id', sibling.id)
              .not('cif', 'is', null)
              .range(from, to)
          );

          sibCifs.forEach((r: any) => {
            const c = normalizeCif(r.cif);
            // Sibling conflicts override parent entries
            if (c) relatedCifMap.set(c, { name: sibling.name, isConflict: true });
          });
        }
      } else {
        // This list might be a parent — check its sublists (informational only)
        const { data: childLists } = await supabase
          .from('outbound_lists' as any)
          .select('id, name')
          .eq('lista_madre_id', listId);

        for (const child of (childLists || []) as any[]) {
          const childCifs = await fetchAllPaginated((from, to) =>
            supabase
              .from('outbound_list_companies' as any)
              .select('cif')
              .eq('list_id', child.id)
              .not('cif', 'is', null)
              .range(from, to)
          );

          childCifs.forEach((r: any) => {
            const c = normalizeCif(r.cif);
            if (c && !relatedCifMap.has(c)) relatedCifMap.set(c, { name: child.name, isConflict: false });
          });
        }
      }

      const nuevas: ValidatedRow[] = [];
      const vinculadas: ValidatedRow[] = [];
      const duplicadas: ValidatedRow[] = [];
      const enOtraLista: RelatedListRow[] = [];
      const conflictoSublistado: ConflictRow[] = [];
      const errores: ErrorRow[] = [];
      const seenCifsInExcel = new Set<string>();

      rows.forEach((data, index) => {
        const rowNumber = index + 2;
        const empresa = (data.empresa || '').toString().trim();
        const rawCif = data.cif ? data.cif.toString().trim() : null;
        const cif = normalizeCif(rawCif);
        const row: ValidatedRow = { rowNumber, data, empresa, cif };

        if (!empresa && !cif) {
          errores.push({ ...row, motivo: 'Falta nombre de empresa y CIF' });
          return;
        }

        if (cif && !CIF_REGEX.test(cif)) {
          errores.push({ ...row, motivo: `CIF inválido: "${rawCif}" (debe ser alfanumérico de 9 caracteres)` });
          return;
        }

        if (!cif) {
          nuevas.push(row);
          return;
        }

        if (seenCifsInExcel.has(cif)) {
          duplicadas.push(row);
          return;
        }
        seenCifsInExcel.add(cif);

        if (existingInListSet.has(cif)) {
          duplicadas.push(row);
          return;
        }

        const relatedEntry = relatedCifMap.get(cif);

        if (relatedEntry?.isConflict) {
          // CIF exists in a sibling sublist → BLOCK
          conflictoSublistado.push({ ...row, sublistaConflicto: relatedEntry.name });
          return;
        }

        if (existingInEmpresasSet.has(cif)) {
          if (relatedEntry) {
            enOtraLista.push({ ...row, listaRelacionada: relatedEntry.name });
          } else {
            vinculadas.push(row);
          }
          return;
        }

        if (relatedEntry) {
          enOtraLista.push({ ...row, listaRelacionada: relatedEntry.name });
          return;
        }

        nuevas.push(row);
      });

      const result: ValidationResult = { nuevas, vinculadas, duplicadas, enOtraLista, conflictoSublistado, errores };
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
