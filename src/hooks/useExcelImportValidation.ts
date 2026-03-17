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
      const relatedCifMap = new Map<string, string>();
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
          if (c) relatedCifMap.set(c, parentName);
        });

        // Get sibling lists
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
            if (c && !relatedCifMap.has(c)) relatedCifMap.set(c, sibling.name);
          });
        }
      } else {
        // This list might be a parent — check its sublists
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
            if (c && !relatedCifMap.has(c)) relatedCifMap.set(c, child.name);
          });
        }
      }

      const nuevas: ValidatedRow[] = [];
      const vinculadas: ValidatedRow[] = [];
      const duplicadas: ValidatedRow[] = [];
      const enOtraLista: RelatedListRow[] = [];
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

        const relatedListName = relatedCifMap.get(cif);

        if (existingInEmpresasSet.has(cif)) {
          if (relatedListName) {
            enOtraLista.push({ ...row, listaRelacionada: relatedListName });
          } else {
            vinculadas.push(row);
          }
          return;
        }

        if (relatedListName) {
          enOtraLista.push({ ...row, listaRelacionada: relatedListName });
          return;
        }

        nuevas.push(row);
      });

      const result: ValidationResult = { nuevas, vinculadas, duplicadas, enOtraLista, errores };
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
