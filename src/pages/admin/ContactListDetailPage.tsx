import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useListColumnPreferences } from '@/hooks/useListColumnPreferences';
import { ListColumnConfigurator } from '@/components/admin/contact-lists/ListColumnConfigurator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useExcelImportValidation, type ValidationResult, type ErrorRow } from '@/hooks/useExcelImportValidation';
import { ImportPreviewModal } from '@/components/admin/contact-lists/ImportPreviewModal';
import { ImportResultModal } from '@/components/admin/contact-lists/ImportResultModal';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft, Upload, Plus, Download, Building2, MoreHorizontal,
  Edit, Trash2, History, Link2, AlertTriangle, Filter, FileSpreadsheet, Linkedin, Copy,
  Search, ArrowUpDown, ArrowUp, ArrowDown, X, MoveRight, CopyPlus, Sparkles, Loader2, Pencil, Lock, ArrowRight, Layers, List, Megaphone, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SFFundTagEditor } from '@/components/admin/search-funds/SFFundTagEditor';
import { SendToCampaignDialog } from '@/components/admin/contact-lists/SendToCampaignDialog';
import {
  useContactListCompanies,
  useContactListCampaigns,
  useCompanyListHistory,
  ContactListCompany,
  ContactListTipo,
} from '@/hooks/useContactLists';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';

// ===== UTILS =====
const normalizeColumnName = (name: string): string =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').trim();

const COLUMN_SYNONYMS: Record<string, string[]> = {
  empresa: ['empresa', 'nombre_empresa', 'company', 'nombre', 'razon_social', 'compania'],
  contacto: ['contacto', 'nombre_cliente', 'nombre_contacto', 'contact', 'persona'],
  email: ['email', 'mail', 'correo', 'e_mail', 'correo_electronico'],
  telefono: ['telefono', 'phone', 'tel', 'movil', 'celular'],
  cif: ['cif', 'nif', 'tax_id', 'identificacion_fiscal'],
  web: ['web', 'website', 'url', 'sitio_web', 'pagina_web'],
  provincia: ['provincia', 'ubicacion', 'location', 'region', 'estado', 'ciudad'],
  facturacion: ['facturacion', 'ventas', 'revenue', 'ingresos', 'ventas_2024', 'ventas_2023', 'facturacion_2024'],
  ebitda: ['ebitda', 'ebitda_2024', 'ebitda_2023', 'resultado'],
  anios_datos: ['anio_datos', 'ano_datos', 'anio', 'ano', 'year', 'ano_datos', 'anios_datos', 'ano_data'],
  num_trabajadores: ['num_trabajadores', 'n__trabajadores', 'trabajadores', 'empleados', 'employees', 'numero_trabajadores', 'no_trabajadores', 'plantilla'],
  director_ejecutivo: ['director_ejecutivo', 'director', 'ceo', 'gerente', 'director_general', 'administrador'],
  linkedin: ['linkedin', 'perfil_linkedin', 'linkedin_url', 'url_linkedin'],
  comunidad_autonoma: ['comunidad_autonoma', 'comunidad', 'ccaa', 'autonomia', 'comunidad_autonomica', 'region_autonoma'],
  posicion_contacto: ['posicion_contacto', 'posicion', 'cargo', 'puesto', 'position', 'rol', 'job_title'],
  cnae: ['cnae', 'codigo_cnae', 'cnae_code', 'actividad_cnae'],
  descripcion_actividad: ['descripcion_actividad', 'actividad', 'descripcion', 'activity', 'objeto_social', 'actividad_empresa'],
};

function parseSpanishNumber(val: any): number | null {
  if (val == null || val === '') return null;
  if (typeof val === 'number') return val;

  // Strip currency symbols, comparison operators, whitespace
  let str = String(val).trim().replace(/[€$£¥%>\<~\s]/g, '');
  if (!str) return null;

  // Detect magnitude suffix (K, M, B) before cleaning
  let multiplier = 1;
  const upper = str.toUpperCase();
  if (upper.endsWith('B')) { multiplier = 1_000_000_000; str = str.slice(0, -1); }
  else if (upper.endsWith('M')) { multiplier = 1_000_000; str = str.slice(0, -1); }
  else if (upper.endsWith('K')) { multiplier = 1_000; str = str.slice(0, -1); }

  if (!str) return null;

  // Detect locale: if last separator is comma, treat comma as decimal
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma > lastDot) {
    // Spanish: 1.234,56 → remove dots, replace comma with dot
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Anglo: 1,234.56 → remove commas
    str = str.replace(/,/g, '');
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed * multiplier;
}

function mapColumn(normalized: string): string | null {
  for (const [field, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
    if (synonyms.includes(normalized)) return field;
  }
  return null;
}

// ===== TEMPLATE DOWNLOAD =====
function downloadTemplate() {
  const headers = [
    'Nombre empresa', 'CIF', 'CNAE', 'Descripción Actividad', 'Año datos', 'Facturación', 'EBITDA',
    'Nº Trabajadores', 'Director Ejecutivo', 'Nombre Contacto', 'Posición Contacto',
    'Email', 'LinkedIn', 'Teléfono', 'Web', 'Provincia', 'Comunidad Autónoma',
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  // Set column widths
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 16) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  XLSX.writeFile(wb, 'plantilla_lista_contactos.xlsx');
}

// ===== INLINE NOTE CELL =====
const InlineNoteCell = React.memo(({ companyId, initialValue, onSaved }: { companyId: string; initialValue: string | null; onSaved: (id: string, note: string) => void }) => {
  const [value, setValue] = useState(initialValue || '');
  const [isEditing, setIsEditing] = useState(false);
  const originalRef = React.useRef(initialValue || '');

  React.useEffect(() => {
    if (!isEditing) {
      setValue(initialValue || '');
      originalRef.current = initialValue || '';
    }
  }, [initialValue, isEditing]);

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed === originalRef.current) return;
    try {
      const { error } = await supabase
        .from('outbound_list_companies' as any)
        .update({ notas: trimmed || null } as any)
        .eq('id', companyId);
      if (error) throw error;
      onSaved(companyId, trimmed);
    } catch {
      toast.error('Error al guardar la nota');
      setValue(originalRef.current);
    }
  }, [companyId, value, onSaved]);

  if (!isEditing) {
    return (
      <div
        className="min-h-[28px] px-1 cursor-pointer hover:bg-muted/50 rounded text-sm flex items-center"
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      >
        {value ? (
          <span className="line-clamp-2">{value}</span>
        ) : (
          <span className="text-muted-foreground">Añadir nota...</span>
        )}
      </div>
    );
  }

  return (
    <textarea
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { setValue(originalRef.current); setIsEditing(false); }
      }}
      onClick={(e) => e.stopPropagation()}
      placeholder="Añadir nota..."
      className="w-full min-h-[56px] text-sm rounded-md border border-input bg-background px-2 py-1 ring-2 ring-primary/50 resize-none focus:outline-none"
      rows={2}
    />
  );
});
InlineNoteCell.displayName = 'InlineNoteCell';

// ===== INLINE TEXT CELL (single-line editable) =====
const InlineTextCell = React.memo(({ companyId, field, initialValue, placeholder = 'Añadir...', onSaved, linkType }: { companyId: string; field: string; initialValue: string | null; placeholder?: string; onSaved: (id: string, field: string, value: string) => void; linkType?: 'email' | 'url' }) => {
  const [value, setValue] = useState(initialValue || '');
  const [isEditing, setIsEditing] = useState(false);
  const originalRef = React.useRef(initialValue || '');

  React.useEffect(() => {
    if (!isEditing) {
      setValue(initialValue || '');
      originalRef.current = initialValue || '';
    }
  }, [initialValue, isEditing]);

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed === originalRef.current) return;
    try {
      const { error } = await supabase
        .from('outbound_list_companies' as any)
        .update({ [field]: trimmed || null } as any)
        .eq('id', companyId);
      if (error) throw error;
      onSaved(companyId, field, trimmed);
    } catch {
      toast.error('Error al guardar');
      setValue(originalRef.current);
    }
  }, [companyId, field, value, onSaved]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    if (linkType === 'email') {
      window.open(`mailto:${value}`, '_self');
    } else if (linkType === 'url') {
      const url = value.startsWith('http') ? value : `https://${value}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [value, linkType]);

  if (!isEditing) {
    return (
      <div className="min-h-[28px] px-1 rounded text-sm flex items-center gap-1">
        {value ? (
          <>
            {linkType ? (
              <span
                className="truncate cursor-pointer hover:text-primary hover:underline transition-colors"
                onClick={handleLinkClick}
                title={linkType === 'email' ? `Enviar email a ${value}` : `Abrir ${value}`}
              >
                {value}
              </span>
            ) : (
              <span
                className="truncate cursor-pointer hover:bg-muted/50"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              >
                {value}
              </span>
            )}
            {linkType && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 opacity-0 group-hover/row:opacity-100"
                title="Editar"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <span
            className="text-muted-foreground cursor-pointer hover:bg-muted/50 w-full"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            {placeholder}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      autoFocus
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
        if (e.key === 'Escape') { setValue(originalRef.current); setIsEditing(false); }
      }}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className="w-full h-7 text-sm rounded-md border border-input bg-background px-2 py-1 ring-2 ring-primary/50 focus:outline-none"
    />
  );
});
InlineTextCell.displayName = 'InlineTextCell';

// ===== ESTADO BADGES =====
const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground border-border' },
  activa: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archivada: { label: 'Archivada', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function ContactListDetailPage() {
  const { id: listId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: list, isLoading: isLoadingList } = useQuery({
    queryKey: ['contact-list-detail', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_lists' as any)
        .select('*')
        .eq('id', listId!)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  const { companies, isLoading: isLoadingCompanies, addCompany, addCompanies, updateCompany, deleteCompany, deleteCompanies } = useContactListCompanies(listId);
  const { campaigns, isLoading: isLoadingCampaigns, linkCampaign } = useContactListCampaigns(listId);

  // State
  const [activeTab, setActiveTab] = useState('empresas');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLinkCampaignOpen, setIsLinkCampaignOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isDedupModalOpen, setIsDedupModalOpen] = useState(false);
  const [isSendToCampaignOpen, setIsSendToCampaignOpen] = useState(false);
  const [dedupKeep, setDedupKeep] = useState<'newest' | 'oldest'>('newest');
  const [drawerCompany, setDrawerCompany] = useState<ContactListCompany | null>(null);
  const [editingCompany, setEditingCompany] = useState<ContactListCompany | null>(null);

  // Move/Copy state
  const [moveCopyCompany, setMoveCopyCompany] = useState<ContactListCompany | null>(null);
  const [moveCopyMode, setMoveCopyMode] = useState<'move' | 'copy'>('move');
  const [moveCopyTargetId, setMoveCopyTargetId] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isMoveCopyLoading, setIsMoveCopyLoading] = useState(false);
  const [sublistConflict, setSublistConflict] = useState<{ sublistName: string } | null>(null);
  const [moveCopyFromSublistId, setMoveCopyFromSublistId] = useState<string | null>(null);

  // Bulk Move/Copy state
  const [bulkMoveCopyOpen, setBulkMoveCopyOpen] = useState(false);
  const [bulkMoveCopyMode, setBulkMoveCopyMode] = useState<'move' | 'copy'>('copy');
  const [bulkMoveCopyTargetId, setBulkMoveCopyTargetId] = useState('');
  const [bulkIsCreatingNewList, setBulkIsCreatingNewList] = useState(false);
  const [bulkNewListName, setBulkNewListName] = useState('');
  const [bulkMoveCopyLoading, setBulkMoveCopyLoading] = useState(false);

  // Search, filter & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [sortField, setSortField] = useState<'empresa' | 'facturacion' | 'ebitda' | 'num_trabajadores' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterHasEmail, setFilterHasEmail] = useState(false);
  const [filterHasEbitda, setFilterHasEbitda] = useState(false);
  // Generic column filters: colKey → selected values
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [headerSearches, setHeaderSearches] = useState<Record<string, string>>({});
  const [customRanges, setCustomRanges] = useState<Record<string, { min: string; max: string }>>({});
  const [groupBlocked, setGroupBlocked] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  // AI generation state - stores the company ID currently being generated
  const [aiGenLoading, setAiGenLoading] = useState<string | null>(null);

  // Bulk AI generation state
  const [bulkAiRunning, setBulkAiRunning] = useState(false);
  const [bulkAiProgress, setBulkAiProgress] = useState({ done: 0, total: 0, errors: 0 });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      if (sortDir === 'desc') setSortDir('asc');
      else { setSortField(null); setSortDir('desc'); }
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'desc' ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />;
  };

  // Query: sublists + their companies (only for madre lists)
  const { data: sublistCompanyMap } = useQuery({
    queryKey: ['sublist-company-map', listId],
    enabled: !!listId,
    queryFn: async () => {
      // 1. Get sublists
      const { data: sublists, error: subErr } = await supabase
        .from('outbound_lists' as any)
        .select('id, name')
        .eq('lista_madre_id', listId!);
      if (subErr || !sublists || sublists.length === 0) return null;

      const sublistArr = (sublists as unknown) as { id: string; name: string }[];
      const sublistIds = sublistArr.map(s => s.id);
      const nameMap = Object.fromEntries(sublistArr.map(s => [s.id, s.name]));

      // 2. Get companies from those sublists
      const { data: subCompanies, error: compErr } = await supabase
        .from('outbound_list_companies' as any)
        .select('cif, list_id')
        .in('list_id', sublistIds)
        .not('cif', 'is', null);
      if (compErr || !subCompanies) return null;

      // 3. Build map: cif → sublist names[] and cifToListId: cif → list_id
      const map = new Map<string, Set<string>>();
      const cifToListId = new Map<string, string>();
      for (const row of (subCompanies as unknown) as { cif: string; list_id: string }[]) {
        if (!row.cif) continue;
        const cifKey = row.cif.toUpperCase().trim();
        if (!map.has(cifKey)) map.set(cifKey, new Set());
        map.get(cifKey)!.add(nameMap[row.list_id] || '');
        cifToListId.set(cifKey, row.list_id);
      }

      // Convert Sets to arrays
      const result = new Map<string, string[]>();
      for (const [cif, names] of map) {
        result.set(cif, Array.from(names));
      }
      return { map: result, cifToListId, sublists: sublistArr, sublistCount: sublistArr.length };
    },
  });

  const isMadreList = !!sublistCompanyMap;
  const { allColumns, visibleColumns: visibleCols, toggleColumn, moveColumn, resetToDefault } = useListColumnPreferences(listId, isMadreList);
  const companiesInSublists = useMemo(() => {
    if (!sublistCompanyMap) return 0;
    return companies.filter(c => c.cif && sublistCompanyMap.map.has(c.cif.toUpperCase().trim())).length;
  }, [companies, sublistCompanyMap]);




  // Text columns that support multi-select filtering
  const TEXT_FILTER_COLUMNS = ['provincia', 'comunidad_autonoma', 'cnae', 'descripcion_actividad', 'posicion_contacto', 'director_ejecutivo'] as const;

  // Numeric range definitions
  const NUMERIC_RANGES: Record<string, { label: string; min: number | null; max: number | null }[]> = {
    facturacion: [
      { label: 'Sin dato', min: null, max: null },
      { label: '0 - 1M€', min: 0, max: 1_000_000 },
      { label: '1M€ - 5M€', min: 1_000_000, max: 5_000_000 },
      { label: '5M€ - 20M€', min: 5_000_000, max: 20_000_000 },
      { label: '20M€ - 50M€', min: 20_000_000, max: 50_000_000 },
      { label: '> 50M€', min: 50_000_000, max: Infinity },
    ],
    ebitda: [
      { label: 'Sin dato', min: null, max: null },
      { label: '< 0 (negativo)', min: -Infinity, max: 0 },
      { label: '0 - 500K€', min: 0, max: 500_000 },
      { label: '500K€ - 2M€', min: 500_000, max: 2_000_000 },
      { label: '2M€ - 5M€', min: 2_000_000, max: 5_000_000 },
      { label: '> 5M€', min: 5_000_000, max: Infinity },
    ],
    num_trabajadores: [
      { label: 'Sin dato', min: null, max: null },
      { label: '1 - 10', min: 1, max: 11 },
      { label: '11 - 50', min: 11, max: 51 },
      { label: '51 - 200', min: 51, max: 201 },
      { label: '201 - 500', min: 201, max: 501 },
      { label: '> 500', min: 501, max: Infinity },
    ],
  };

  // Compute unique values for all text filter columns
  const uniqueColumnValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const col of TEXT_FILTER_COLUMNS) {
      const set = new Set<string>();
      companies.forEach(c => {
        const val = (c as any)[col];
        if (val) set.add(val);
      });
      result[col] = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    }
    return result;
  }, [companies]);

  // Helpers for column filters
  const toggleColumnFilter = useCallback((colKey: string, value: string) => {
    setColumnFilters(prev => {
      const current = prev[colKey] || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      if (next.length === 0) {
        const { [colKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [colKey]: next };
    });
  }, []);

  const clearColumnFilter = useCallback((colKey: string) => {
    setColumnFilters(prev => {
      const { [colKey]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllColumnFilters = useCallback(() => {
    setColumnFilters({});
  }, []);

  const hasAnyColumnFilter = useMemo(() => Object.keys(columnFilters).length > 0, [columnFilters]);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.empresa || '').toLowerCase().includes(q) ||
        (c.contacto || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.cif || '').toLowerCase().includes(q) ||
        (c.director_ejecutivo || '').toLowerCase().includes(q)
      );
    }
    // Activity search
    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase();
      result = result.filter(c =>
        (c.descripcion_actividad || '').toLowerCase().includes(q)
      );
    }
    // Filters
    if (filterHasEmail) result = result.filter(c => c.email);
    if (filterHasEbitda) result = result.filter(c => c.ebitda != null && Number(c.ebitda) > 0);
    // Generic column filters (text + numeric)
    for (const [colKey, selectedValues] of Object.entries(columnFilters)) {
      if (selectedValues.length === 0) continue;
      const numRanges = NUMERIC_RANGES[colKey];
      if (numRanges) {
        // Numeric range filter (predefined + custom)
        result = result.filter(c => {
          const val = Number((c as any)[colKey]) || 0;
          const hasData = (c as any)[colKey] != null && (c as any)[colKey] !== '';
          return selectedValues.some(rangeLabel => {
            // Custom range: "custom:min-max"
            if (rangeLabel.startsWith('custom:')) {
              const parts = rangeLabel.slice(7).split('-');
              const cMin = parts[0] ? Number(parts[0]) : -Infinity;
              const cMax = parts[1] ? Number(parts[1]) : Infinity;
              return hasData && val >= cMin && val <= cMax;
            }
            const range = numRanges.find(r => r.label === rangeLabel);
            if (!range) return false;
            if (range.min === null) return !hasData; // "Sin dato"
            return hasData && val >= range.min && val < (range.max ?? Infinity);
          });
        });
      } else {
        // Text filter
        result = result.filter(c => {
          const val = (c as any)[colKey];
          return val && selectedValues.includes(val);
        });
      }
    }
    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let va: any = a[sortField];
        let vb: any = b[sortField];
        if (sortField === 'empresa') {
          va = (va || '').toLowerCase();
          vb = (vb || '').toLowerCase();
          return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        va = Number(va) || 0;
        vb = Number(vb) || 0;
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
    // For madre lists: sort unassigned first, then assigned (only in grouped mode without column sort)
    if (isMadreList && sublistCompanyMap && groupBlocked && !sortField) {
      result.sort((a, b) => {
        const aAssigned = a.cif && sublistCompanyMap.map.has(a.cif.toUpperCase().trim()) ? 1 : 0;
        const bAssigned = b.cif && sublistCompanyMap.map.has(b.cif.toUpperCase().trim()) ? 1 : 0;
        return aAssigned - bAssigned;
      });
    }
    return result;
  }, [companies, searchQuery, activitySearchQuery, filterHasEmail, filterHasEbitda, columnFilters, sortField, sortDir, isMadreList, sublistCompanyMap, groupBlocked]);

  // Reset page when filters/sort change
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, activitySearchQuery, filterHasEmail, filterHasEbitda, columnFilters, sortField, sortDir, groupBlocked]);

  // Pagination derived values
  const totalPages = Math.ceil(filteredCompanies.length / pageSize);
  const paginatedCompanies = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  // Config tab state
  const [configName, setConfigName] = useState('');
  const [configDesc, setConfigDesc] = useState('');
  const [configSector, setConfigSector] = useState('');
  const [configEstado, setConfigEstado] = useState('borrador');
  const [configTipo, setConfigTipo] = useState<ContactListTipo>('outbound');
  const [configDescProposito, setConfigDescProposito] = useState('');
  const [configCnaes, setConfigCnaes] = useState<string[]>([]);
  const [configFactMin, setConfigFactMin] = useState('');
  const [configFactMax, setConfigFactMax] = useState('');
  const [configCriteriosConstruccion, setConfigCriteriosConstruccion] = useState('');
  const [configListaMadreId, setConfigListaMadreId] = useState('');

  React.useEffect(() => {
    if (list) {
      setConfigName(list.name || '');
      setConfigDesc(list.description || '');
      setConfigSector(list.sector || '');
      setConfigEstado(list.estado || 'borrador');
      setConfigTipo(list.tipo || 'outbound');
      setConfigDescProposito(list.descripcion_proposito || '');
      setConfigCnaes(list.cnaes_utilizados || []);
      setConfigFactMin(list.facturacion_min != null ? String(list.facturacion_min) : '');
      setConfigFactMax(list.facturacion_max != null ? String(list.facturacion_max) : '');
      setConfigCriteriosConstruccion(list.criterios_construccion || '');
      setConfigListaMadreId(list.lista_madre_id || '');
    }
  }, [list]);

  // Query: all lists for "Lista madre" selector
  const { data: allLists = [] } = useQuery({
    queryKey: ['outbound-lists-for-parent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_lists' as any)
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data as any[]).filter((l: any) => l.id !== listId);
    },
  });

  // Query: parent list name for breadcrumb
  const { data: parentList } = useQuery({
    queryKey: ['parent-list-name', list?.lista_madre_id],
    enabled: !!list?.lista_madre_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_lists' as any)
        .select('id, name')
        .eq('id', list!.lista_madre_id)
        .single();
      if (error) throw error;
      return data as unknown as { id: string; name: string };
    },
  });

  // Add manual form state
  const [addForm, setAddForm] = useState({
    empresa: '', contacto: '', email: '', telefono: '', cif: '', web: '',
    provincia: '', facturacion: '', ebitda: '', notas: '',
    num_trabajadores: '', director_ejecutivo: '', linkedin: '', comunidad_autonoma: '',
    posicion_contacto: '', cnae: '', descripcion_actividad: '',
  });

  // Import state
  const [importData, setImportData] = useState<any[]>([]);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'result'>('upload');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const { validate, isValidating, validationResult, reset: resetValidation } = useExcelImportValidation();
  const [importResultData, setImportResultData] = useState<{
    imported: number; linked: number; linkedRelated: number; skippedDuplicates: number; skippedErrors: number; errors: ErrorRow[];
  } | null>(null);

  // Link campaign state
  const [linkCampaignId, setLinkCampaignId] = useState('');
  const [linkCampaignNotes, setLinkCampaignNotes] = useState('');

  // Available campaigns
  const { data: availableCampaigns = [] } = useQuery({
    queryKey: ['valuation-campaigns-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuation_campaigns')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  // ===== HANDLERS =====
  const handleSelectAll = () => {
    const pageIds = paginatedCompanies.map(c => c.id);
    const allPageSelected = pageIds.every(id => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredCompanies.map(c => c.id));
  };

  const allPageSelected = paginatedCompanies.length > 0 && paginatedCompanies.every(c => selectedIds.includes(c.id));
  const allFilteredSelected = filteredCompanies.length > 0 && selectedIds.length === filteredCompanies.length && filteredCompanies.every(c => selectedIds.includes(c.id));
  const showSelectAllBanner = allPageSelected && filteredCompanies.length > paginatedCompanies.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (isMadreList) {
      toast.warning('No se pueden eliminar empresas de una lista madre. Puedes copiarlas a un sublistado.');
      return;
    }
    if (!confirm(`¿Eliminar ${selectedIds.length} empresas de esta lista?`)) return;
    await deleteCompanies.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleAddManual = async () => {
    if (!addForm.empresa.trim() || !listId) return;

    // Validate sibling sublist conflict by CIF
    const cifToCheck = addForm.cif.trim().toUpperCase();
    if (cifToCheck && list?.lista_madre_id) {
      try {
        // Get sibling sublists
        const { data: siblingLists } = await supabase
          .from('outbound_lists' as any)
          .select('id, name')
          .eq('lista_madre_id', list.lista_madre_id)
          .neq('id', listId);

        if (siblingLists && siblingLists.length > 0) {
          const siblingIds = (siblingLists as any[]).map(s => s.id);
          const nameMap = Object.fromEntries((siblingLists as any[]).map(s => [s.id, s.name]));

          const { data: existing } = await supabase
            .from('outbound_list_companies' as any)
            .select('list_id')
            .in('list_id', siblingIds)
            .eq('cif', cifToCheck)
            .limit(1);

          if (existing && existing.length > 0) {
            const conflictName = nameMap[(existing as any)[0].list_id] || 'otra sublista';
            toast.error(`Esta empresa (CIF: ${cifToCheck}) ya está en el sublistado "${conflictName}" derivado de la misma Lista Madre.`);
            return;
          }
        }
      } catch (err) {
        console.error('[AddManual] Error checking sibling conflict:', err);
      }
    }

    await addCompany.mutateAsync({
      list_id: listId,
      empresa: addForm.empresa.trim(),
      contacto: addForm.contacto.trim() || null,
      email: addForm.email.trim() || null,
      telefono: addForm.telefono.trim() || null,
      cif: addForm.cif.trim() || null,
      web: addForm.web.trim() || null,
      provincia: addForm.provincia.trim() || null,
      comunidad_autonoma: addForm.comunidad_autonoma.trim() || null,
      posicion_contacto: addForm.posicion_contacto.trim() || null,
      cnae: addForm.cnae.trim() || null,
      descripcion_actividad: addForm.descripcion_actividad.trim() || null,
      facturacion: parseSpanishNumber(addForm.facturacion),
      ebitda: parseSpanishNumber(addForm.ebitda),
      anios_datos: 1,
      notas: addForm.notas.trim() || null,
      num_trabajadores: addForm.num_trabajadores ? parseInt(addForm.num_trabajadores) || null : null,
      director_ejecutivo: addForm.director_ejecutivo.trim() || null,
      linkedin: addForm.linkedin.trim() || null,
      consolidador: false,
    });
    setAddForm({ empresa: '', contacto: '', email: '', telefono: '', cif: '', web: '', provincia: '', facturacion: '', ebitda: '', notas: '', num_trabajadores: '', director_ejecutivo: '', linkedin: '', comunidad_autonoma: '', posicion_contacto: '', cnae: '', descripcion_actividad: '' });
    setIsAddModalOpen(false);
    toast.success('Empresa añadida');
  };

  // ===== EXCEL IMPORT =====
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsReadingFile(true);
    toast.info(`Procesando "${file.name}"...`, { duration: 3000 });
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setIsReadingFile(false);
      if (json.length === 0) {
        toast.error('El archivo está vacío');
        return;
      }
      const headers = Object.keys(json[0] as any);
      const mapping: Record<string, string> = {};
      headers.forEach(h => {
        const norm = normalizeColumnName(h);
        const field = mapColumn(norm);
        if (field) mapping[h] = field;
      });
      setImportMapping(mapping);
      setImportData(json);
      toast.success(`${json.length} filas encontradas · ${Object.keys(mapping).length} columnas mapeadas`);
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      toast.error('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
  });

  // Step 1: Map rows from Excel data
  const getMappedRows = useCallback(() => {
    return importData.map((row: any) => {
      const mapped: any = { list_id: listId, anios_datos: 1 };
      for (const [header, field] of Object.entries(importMapping)) {
        const val = row[header];
        if (field === 'facturacion' || field === 'ebitda') {
          mapped[field] = parseSpanishNumber(val);
        } else if (field === 'num_trabajadores' || field === 'anios_datos') {
          mapped[field] = val ? parseInt(String(val)) || null : null;
        } else {
          mapped[field] = val ? String(val).trim() : null;
        }
      }
      if (!mapped.empresa) mapped.empresa = mapped.cif || mapped.contacto || mapped.email || 'Sin nombre';
      return mapped;
    });
  }, [importData, importMapping, listId]);

  // Step 2: Validate (called when user clicks "Importar" in mapping step)
  const handleStartValidation = async () => {
    if (!listId || importData.length === 0) return;
    const rows = getMappedRows();
    setImportStep('preview');
    await validate(rows, listId, list?.lista_madre_id || null);
  };

  // Step 3: Confirm import (nuevas + vinculadas + enOtraLista, excludes conflictoSublistado)
  const handleConfirmImport = async () => {
    if (!listId || !validationResult) return;
    setImportStep('importing');
    const rowsToInsert = [
      ...validationResult.nuevas.map(r => r.data),
      ...validationResult.vinculadas.map(r => r.data),
      ...validationResult.enOtraLista.map(r => r.data),
      // conflictoSublistado is intentionally EXCLUDED
    ] as any[];

    setImportProgress(rowsToInsert.length > 0 ? { done: 0, total: rowsToInsert.length } : null);

    let importedCount = 0;
    let failedCount = 0;

    try {
      if (rowsToInsert.length > 0) {
        const result = await addCompanies.mutateAsync({
          rows: rowsToInsert as any,
          onProgress: (done, total) => setImportProgress({ done, total }),
        });
        importedCount = result.inserted;
        failedCount = result.failed;

        if (importedCount > 0) {
          await supabase.from('outbound_lists' as any).update({ origen: 'excel', updated_at: new Date().toISOString() }).eq('id', listId);
          queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
        }
      }
    } catch (err: any) {
      console.error('[Import] Unexpected error:', err);
      toast.error('Error inesperado durante la importación');
    } finally {
      setImportProgress(null);
      setImportResultData({
        imported: importedCount || validationResult.nuevas.length,
        linked: validationResult.vinculadas.length,
        linkedRelated: validationResult.enOtraLista.length,
        skippedDuplicates: validationResult.duplicadas.length,
        skippedErrors: validationResult.errores.length + validationResult.conflictoSublistado.length + failedCount,
        errors: validationResult.errores,
      });
      setImportStep('result');
    }
  };

  const handleCloseImport = () => {
    setImportData([]);
    setImportMapping({});
    setImportStep('upload');
    setImportResultData(null);
    resetValidation();
    setIsImportModalOpen(false);
  };

  // ===== EXPORT EXCEL =====
  const handleExport = () => {
    if (companies.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(companies.map(c => ({
      'Nombre empresa': c.empresa,
      'CIF': c.cif || '',
      'CNAE': c.cnae || '',
      'Descripción Actividad': c.descripcion_actividad || '',
      'Año datos': c.anios_datos || '',
      'Facturación': c.facturacion || '',
      'EBITDA': c.ebitda || '',
      'Nº Trabajadores': c.num_trabajadores || '',
      'Director Ejecutivo': c.director_ejecutivo || '',
      'Nombre Contacto': c.contacto || '',
      'Posición Contacto': c.posicion_contacto || '',
      'Email': c.email || '',
      'LinkedIn': c.linkedin || '',
      'Teléfono': c.telefono || '',
      'Web': c.web || '',
      'Provincia': c.provincia || '',
      'Comunidad Autónoma': c.comunidad_autonoma || '',
      'Notas': c.notas || '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
    XLSX.writeFile(wb, `${list?.name || 'lista'}.xlsx`);
  };

  // ===== LINK CAMPAIGN =====
  const handleLinkCampaign = async () => {
    if (!linkCampaignId || !listId) return;
    const campaign = availableCampaigns.find(c => c.id === linkCampaignId);
    await linkCampaign.mutateAsync({
      list_id: listId,
      campaign_id: linkCampaignId,
      campaign_nombre: campaign?.name || '',
      notas: linkCampaignNotes.trim() || undefined,
      empresas_enviadas: companies.length,
    });
    setIsLinkCampaignOpen(false);
    setLinkCampaignId('');
    setLinkCampaignNotes('');
  };

  // ===== SAVE CONFIG =====
  const handleSaveConfig = async () => {
    if (!listId) return;
    const { error } = await supabase.from('outbound_lists' as any).update({
      name: configName,
      description: configDesc || null,
      sector: configSector || null,
      tipo: configTipo,
      estado: configEstado,
      descripcion_proposito: configDescProposito || null,
      cnaes_utilizados: configCnaes.length > 0 ? configCnaes : null,
      facturacion_min: configFactMin ? parseFloat(configFactMin) : null,
      facturacion_max: configFactMax ? parseFloat(configFactMax) : null,
      criterios_construccion: configCriteriosConstruccion || null,
      lista_madre_id: configListaMadreId || null,
      updated_at: new Date().toISOString(),
    } as any).eq('id', listId);
    if (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar: ' + error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    toast.success('Configuración guardada');
  };

  // ===== MOVE / COPY COMPANY =====
  const executeMoveCopy = async (targetId: string) => {
    if (!moveCopyCompany || !listId) return;
    try {
      if (moveCopyMode === 'copy') {
        // Check if CIF already exists in target list
        if (moveCopyCompany.cif) {
          const { data: existing } = await supabase
            .from('outbound_list_companies' as any)
            .select('id')
            .eq('list_id', targetId)
            .eq('cif', moveCopyCompany.cif)
            .limit(1);
          if (existing && existing.length > 0) {
            toast.error('Esta empresa ya existe en la lista seleccionada');
            setIsMoveCopyLoading(false);
            return;
          }
        }
        // Insert copy without notas and id
        const { id, notas, created_at, ...rest } = moveCopyCompany as any;
        await supabase.from('outbound_list_companies' as any).insert({
          ...rest,
          list_id: targetId,
          notas: null,
        } as any);
        toast.success('Empresa copiada a la otra lista');
      } else if (moveCopyFromSublistId) {
        // Move from sublist: update the record in the source sublist
        await supabase.from('outbound_list_companies' as any)
          .update({ list_id: targetId } as any)
          .eq('list_id', moveCopyFromSublistId)
          .eq('cif', moveCopyCompany.cif);
        toast.success('Empresa reasignada a otra sublista');
      } else {
        // Move: update list_id, clear notas
        await supabase.from('outbound_list_companies' as any)
          .update({ list_id: targetId, notas: null } as any)
          .eq('id', moveCopyCompany.id);
        toast.success('Empresa movida a la otra lista');
      }
      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', targetId] });
      if (moveCopyFromSublistId) {
        queryClient.invalidateQueries({ queryKey: ['contact-list-companies', moveCopyFromSublistId] });
      }
      queryClient.invalidateQueries({ queryKey: ['contact-list-detail'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      queryClient.invalidateQueries({ queryKey: ['sublist-company-map', listId] });
      setMoveCopyCompany(null);
      setMoveCopyTargetId('');
      setIsCreatingNewList(false);
      setNewListName('');
      setMoveCopyFromSublistId(null);
    } catch (err) {
      toast.error('Error al procesar la operación');
    } finally {
      setIsMoveCopyLoading(false);
    }
  };

  const [pendingMoveCopyTargetId, setPendingMoveCopyTargetId] = useState('');

  const handleMoveCopy = async () => {
    if (!moveCopyCompany || !listId) return;
    // Determine target list id
    let targetId = moveCopyTargetId;
    if (isCreatingNewList) {
      if (!newListName.trim()) { toast.error('Introduce un nombre para la nueva lista'); return; }
      setIsMoveCopyLoading(true);
      try {
        const insertData: any = { name: newListName.trim() };
        if (isMadreList) insertData.lista_madre_id = listId;
        const { data: newList, error: createErr } = await supabase
          .from('outbound_lists' as any)
          .insert(insertData)
          .select('id')
          .single();
        if (createErr || !newList) { console.error('Error creating list:', createErr); toast.error('Error al crear la lista: ' + (createErr?.message || 'desconocido')); setIsMoveCopyLoading(false); return; }
        targetId = (newList as any).id;
      } catch { toast.error('Error al crear la lista'); setIsMoveCopyLoading(false); return; }
    } else {
      if (!targetId) return;
      setIsMoveCopyLoading(true);
    }

    // Check sublist conflict: if target is a sublista, check if CIF exists in sister sublists
    if (moveCopyCompany.cif) {
      try {
        // Get target list details to check if it's a sublista
        const { data: targetList } = await supabase
          .from('outbound_lists' as any)
          .select('id, lista_madre_id')
          .eq('id', targetId)
          .single();

        const targetMadreId = (targetList as any)?.lista_madre_id;
        if (targetMadreId) {
          // It's a sublista — check sister sublists for same CIF
          const { data: sisterSublists } = await supabase
            .from('outbound_lists' as any)
            .select('id, name')
            .eq('lista_madre_id', targetMadreId)
            .neq('id', targetId);

          if (sisterSublists && sisterSublists.length > 0) {
            const sisterIds = (sisterSublists as any[]).map((s: any) => s.id);
            const sisterNameMap = Object.fromEntries((sisterSublists as any[]).map((s: any) => [s.id, s.name]));

            const { data: existingInSisters } = await supabase
              .from('outbound_list_companies' as any)
              .select('list_id')
              .in('list_id', sisterIds)
              .eq('cif', moveCopyCompany.cif)
              .limit(1);

            if (existingInSisters && existingInSisters.length > 0) {
              const conflictListId = (existingInSisters as any[])[0].list_id;
              const conflictName = sisterNameMap[conflictListId] || 'otra sublista';
              setPendingMoveCopyTargetId(targetId);
              setSublistConflict({ sublistName: conflictName });
              setIsMoveCopyLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error checking sublist conflict:', err);
        // Continue with operation on error
      }
    }

    await executeMoveCopy(targetId);
  };

  // ===== BULK MOVE / COPY =====
  const handleBulkMoveCopy = async () => {
    if (!listId || selectedIds.length === 0) return;
    let targetId = bulkMoveCopyTargetId;
    
    if (bulkIsCreatingNewList) {
      if (!bulkNewListName.trim()) { toast.error('Introduce un nombre para la nueva lista'); return; }
      setBulkMoveCopyLoading(true);
      try {
        const insertData: any = { name: bulkNewListName.trim() };
        if (isMadreList) insertData.lista_madre_id = listId;
        const { data: newList, error: createErr } = await supabase
          .from('outbound_lists' as any)
          .insert(insertData)
          .select('id')
          .single();
        if (createErr || !newList) { console.error('Error creating list:', createErr); toast.error('Error al crear la lista: ' + (createErr?.message || 'desconocido')); setBulkMoveCopyLoading(false); return; }
        targetId = (newList as any).id;
      } catch { toast.error('Error al crear la lista'); setBulkMoveCopyLoading(false); return; }
    } else {
      if (!targetId) return;
      setBulkMoveCopyLoading(true);
    }

    const selectedCompanies = companies.filter(c => selectedIds.includes(c.id));

    try {
      if (bulkMoveCopyMode === 'copy') {
        // Get existing CIFs in target to deduplicate
        const selectedCifs = selectedCompanies.map(c => (c as any).cif).filter(Boolean);
        let existingCifs = new Set<string>();
        if (selectedCifs.length > 0) {
          // Query in batches of 50
          for (let i = 0; i < selectedCifs.length; i += 50) {
            const batch = selectedCifs.slice(i, i + 50);
            const { data: existing } = await supabase
              .from('outbound_list_companies' as any)
              .select('cif')
              .eq('list_id', targetId)
              .in('cif', batch);
            if (existing) {
              (existing as any[]).forEach((e: any) => existingCifs.add(e.cif));
            }
          }
        }

        // Filter out duplicates
        const toInsert = selectedCompanies.filter(c => {
          const cif = (c as any).cif;
          return !cif || !existingCifs.has(cif);
        });
        const skipped = selectedCompanies.length - toInsert.length;

        // Insert in batches of 50
        for (let i = 0; i < toInsert.length; i += 50) {
          const batch = toInsert.slice(i, i + 50).map(c => {
            const { id, notas, created_at, ...rest } = c as any;
            return { ...rest, list_id: targetId, notas: null };
          });
          await supabase.from('outbound_list_companies' as any).insert(batch as any);
        }

        const msg = `${toInsert.length} empresas copiadas` + (skipped > 0 ? `, ${skipped} duplicadas omitidas` : '');
        toast.success(msg);
      } else {
        // Move: update list_id in batches
        for (let i = 0; i < selectedIds.length; i += 50) {
          const batch = selectedIds.slice(i, i + 50);
          await supabase.from('outbound_list_companies' as any)
            .update({ list_id: targetId, notas: null } as any)
            .in('id', batch);
        }
        toast.success(`${selectedIds.length} empresas movidas`);
      }

      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', targetId] });
      queryClient.invalidateQueries({ queryKey: ['contact-list-detail'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      queryClient.invalidateQueries({ queryKey: ['sublist-company-map', listId] });
      setSelectedIds([]);
      setBulkMoveCopyOpen(false);
      setBulkMoveCopyTargetId('');
      setBulkIsCreatingNewList(false);
      setBulkNewListName('');
    } catch (err) {
      toast.error('Error al procesar la operación masiva');
    } finally {
      setBulkMoveCopyLoading(false);
    }
  };

  const handleNoteSaved = useCallback((companyId: string, note: string) => {
    queryClient.setQueryData(['contact-list-companies', listId], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((c: any) => c.id === companyId ? { ...c, notas: note || null } : c);
    });
  }, [queryClient, listId]);

  const handleFieldSaved = useCallback((companyId: string, field: string, value: string) => {
    queryClient.setQueryData(['contact-list-companies', listId], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((c: any) => c.id === companyId ? { ...c, [field]: value || null } : c);
    });
  }, [queryClient, listId]);

  // Dynamic column cell renderer
  const renderColumnCell = useCallback((colKey: string, company: ContactListCompany, isAssignedToSublist: boolean) => {
    switch (colKey) {
      case 'empresa':
        return (
          <button className="text-sm font-medium hover:underline text-left flex items-center gap-1.5" onClick={() => setDrawerCompany(company)}>
            {isAssignedToSublist && <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />}
            {company.empresa}
          </button>
        );
      case 'sublistas':
        return company.cif && sublistCompanyMap?.map.has(company.cif.toUpperCase().trim()) ? (
          <div className="flex flex-wrap gap-1">
            {sublistCompanyMap.map.get(company.cif.toUpperCase().trim())!.map(name => (
              <Badge key={name} variant="outline" size="sm" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[11px] gap-1">
                <ArrowRight className="h-3 w-3" />
                {name}
              </Badge>
            ))}
          </div>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      case 'cif':
        return <span className="text-sm text-muted-foreground">{company.cif || '—'}</span>;
      case 'contacto':
        return <InlineTextCell companyId={company.id} field="contacto" initialValue={company.contacto} placeholder="Añadir contacto..." onSaved={handleFieldSaved} />;
      case 'email':
        return <InlineTextCell companyId={company.id} field="email" initialValue={company.email} placeholder="Añadir email..." onSaved={handleFieldSaved} linkType="email" />;
      case 'linkedin':
        return <InlineTextCell companyId={company.id} field="linkedin" initialValue={company.linkedin} placeholder="Añadir LinkedIn..." onSaved={handleFieldSaved} linkType="url" />;
      case 'director_ejecutivo':
        return <span className="text-sm text-muted-foreground">{company.director_ejecutivo || '—'}</span>;
      case 'web':
        return company.web ? (
          <a href={company.web.startsWith('http') ? company.web : `https://${company.web}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-primary flex items-center gap-1 transition-colors text-sm text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{company.web.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </a>
        ) : <span className="text-sm text-muted-foreground">—</span>;
      case 'provincia':
      case 'comunidad_autonoma':
      case 'cnae':
      case 'descripcion_actividad':
      case 'posicion_contacto':
      case 'director_ejecutivo': {
        const cellVal = (company as any)[colKey];
        if (!cellVal) return <span className="text-sm text-muted-foreground">—</span>;
        const isActive = (columnFilters[colKey] || []).includes(cellVal);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleColumnFilter(colKey, cellVal);
            }}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cellVal}
          </button>
        );
      }
      case 'facturacion':
        return <span className="text-right text-sm tabular-nums">{company.facturacion ? `€${Number(company.facturacion).toLocaleString('es-ES')}` : '—'}</span>;
      case 'ebitda':
        return <span className="text-right text-sm tabular-nums">{company.ebitda ? `€${Number(company.ebitda).toLocaleString('es-ES')}` : '—'}</span>;
      case 'num_trabajadores':
        return <span className="text-right text-sm tabular-nums">{company.num_trabajadores ?? '—'}</span>;
      case 'consolidador':
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={!!(company as any).consolidador}
              onCheckedChange={async (checked) => {
                try {
                  const updateData: any = { consolidador: !!checked };
                  if (!checked) updateData.consolidador_nombre = null;
                  await supabase
                    .from('outbound_list_companies' as any)
                    .update(updateData)
                    .eq('id', company.id);
                  queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
                } catch {
                  toast.error('Error al actualizar consolidador');
                }
              }}
            />
            {!!(company as any).consolidador && (
              <InlineTextCell
                companyId={company.id}
                field="consolidador_nombre"
                initialValue={(company as any).consolidador_nombre}
                placeholder="Nombre..."
                onSaved={handleFieldSaved}
              />
            )}
          </div>
        );
      case 'notas':
        return <InlineNoteCell companyId={company.id} initialValue={company.notas} onSaved={handleNoteSaved} />;
      default:
        return null;
    }
  }, [sublistCompanyMap, handleFieldSaved, handleNoteSaved, columnFilters, toggleColumnFilter, queryClient, listId]);

  // Column label map for filter badges
  const COLUMN_LABELS: Record<string, string> = {
    provincia: 'Provincia', comunidad_autonoma: 'C.A.', cnae: 'CNAE',
    descripcion_actividad: 'Actividad', posicion_contacto: 'Posición', director_ejecutivo: 'Director',
    facturacion: 'Facturación', ebitda: 'EBITDA', num_trabajadores: 'Empleados',
  };

  // Dynamic column header renderer
  const renderColumnHeader = useCallback((colKey: string) => {
    const sortableMap: Record<string, 'empresa' | 'facturacion' | 'ebitda' | 'num_trabajadores'> = {
      empresa: 'empresa',
      facturacion: 'facturacion',
      ebitda: 'ebitda',
      num_trabajadores: 'num_trabajadores',
    };
    const sortKey = sortableMap[colKey];
    const col = allColumns.find(c => c.key === colKey);
    const label = col?.label || colKey;
    const isRight = col?.align === 'right';

    const isTextFilterCol = (TEXT_FILTER_COLUMNS as readonly string[]).includes(colKey);
    const isNumericFilterCol = !!NUMERIC_RANGES[colKey];
    const activeFilters = columnFilters[colKey] || [];
    const searchVal = headerSearches[colKey] || '';

    if (isTextFilterCol) {
      const values = uniqueColumnValues[colKey] || [];
      const filtered = values.filter(v => v.toLowerCase().includes(searchVal.toLowerCase()));
      return (
        <Popover onOpenChange={(open) => { if (!open) setHeaderSearches(prev => ({ ...prev, [colKey]: '' })); }}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 hover:text-foreground">
              {label}
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
              <Filter className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                  value={searchVal}
                  onChange={(e) => setHeaderSearches(prev => ({ ...prev, [colKey]: e.target.value }))}
                  className="h-8 pl-7 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="h-[220px]">
              <div className="p-1">
                {filtered.map((val) => (
                  <label key={val} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                    <Checkbox
                      checked={activeFilters.includes(val)}
                      onCheckedChange={() => toggleColumnFilter(colKey, val)}
                    />
                    <span className="truncate">{val}</span>
                  </label>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">Sin resultados</p>
                )}
              </div>
            </ScrollArea>
            {activeFilters.length > 0 && (
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => clearColumnFilter(colKey)}>
                  <X className="h-3 w-3 mr-1" /> Limpiar ({activeFilters.length})
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      );
    }

    if (isNumericFilterCol) {
      const ranges = NUMERIC_RANGES[colKey];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn("flex items-center gap-1 hover:text-foreground", isRight && "ml-auto")}>
              {label}
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
              <Filter className="h-3 w-3 text-muted-foreground" />
              {sortKey && <SortIcon field={sortKey} />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            {sortKey && (
              <div className="p-2 border-b flex gap-1">
                <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={() => { setSortField(sortKey); setSortDir('asc'); }}>
                  <ArrowUp className="h-3 w-3 mr-1" /> Asc
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={() => { setSortField(sortKey); setSortDir('desc'); }}>
                  <ArrowDown className="h-3 w-3 mr-1" /> Desc
                </Button>
              </div>
            )}
            <div className="p-1">
              {ranges.map((range) => (
                <label key={range.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                  <Checkbox
                    checked={activeFilters.includes(range.label)}
                    onCheckedChange={() => toggleColumnFilter(colKey, range.label)}
                  />
                  {range.label}
                </label>
              ))}
            </div>
            {/* Custom range inputs */}
            <div className="px-3 py-2 border-t">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Rango personalizado</p>
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Mín"
                  value={customRanges[colKey]?.min || ''}
                  onChange={e => setCustomRanges(prev => ({ ...prev, [colKey]: { ...prev[colKey], min: e.target.value.replace(/[^\d.-]/g, ''), max: prev[colKey]?.max || '' } }))}
                  className="h-7 text-xs flex-1"
                />
                <span className="text-muted-foreground text-xs">—</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Máx"
                  value={customRanges[colKey]?.max || ''}
                  onChange={e => setCustomRanges(prev => ({ ...prev, [colKey]: { min: prev[colKey]?.min || '', max: e.target.value.replace(/[^\d.-]/g, '') } }))}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => {
                    const min = customRanges[colKey]?.min || '';
                    const max = customRanges[colKey]?.max || '';
                    if (!min && !max) return;
                    const customLabel = `custom:${min || ''}-${max || ''}`;
                    // Remove any existing custom range for this column
                    setColumnFilters(prev => {
                      const current = (prev[colKey] || []).filter(v => !v.startsWith('custom:'));
                      return { ...prev, [colKey]: [...current, customLabel] };
                    });
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
            {activeFilters.length > 0 && (
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => { clearColumnFilter(colKey); setCustomRanges(prev => { const { [colKey]: _, ...rest } = prev; return rest; }); }}>
                  <X className="h-3 w-3 mr-1" /> Limpiar ({activeFilters.length})
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      );
    }

    if (sortKey) {
      return (
        <button className={cn("flex items-center hover:text-foreground", isRight && "ml-auto")} onClick={() => toggleSort(sortKey)}>
          {label} <SortIcon field={sortKey} />
        </button>
      );
    }
    return label;
  }, [allColumns, toggleSort, uniqueColumnValues, columnFilters, headerSearches, toggleColumnFilter, clearColumnFilter]);

  // ===== AI GENERATE DESCRIPTION =====
  const handleAiGenerate = async (company: ContactListCompany) => {
    const webUrl = (company as any).web;
    if (!webUrl || !webUrl.trim()) {
      toast.warning('Esta empresa no tiene web registrada. Añade una URL en el campo Web para generar la descripción automáticamente.');
      return;
    }
    setAiGenLoading(company.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-company-description', {
        body: { url: webUrl.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.description) throw new Error('No se recibió descripción');
      // Update in DB
      const { error: updateErr } = await supabase
        .from('outbound_list_companies' as any)
        .update({ descripcion_actividad: data.description } as any)
        .eq('id', company.id);
      if (updateErr) throw updateErr;
      queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
      toast.success('Descripción de actividad generada y guardada');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('No se ha podido acceder')) {
        toast.error('No se ha podido acceder a la web de la empresa. Puedes añadir la descripción manualmente.');
      } else {
        toast.error('Error al generar la descripción. Inténtalo de nuevo.');
      }
    } finally {
      setAiGenLoading(null);
    }
  };

  // ===== BULK AI GENERATE =====
  const handleBulkAiGenerate = async () => {
    const candidates = companies.filter(
      (c: any) => c.web && c.web.trim() && (!c.descripcion_actividad || !c.descripcion_actividad.trim())
    );
    if (candidates.length === 0) {
      toast.info('Todas las empresas ya tienen descripción o no tienen web registrada.');
      return;
    }
    if (!confirm(`Se generará la descripción para ${candidates.length} empresa${candidates.length > 1 ? 's' : ''}. ¿Continuar?`)) return;

    setBulkAiRunning(true);
    setBulkAiProgress({ done: 0, total: candidates.length, errors: 0 });
    let successCount = 0;
    let errorCount = 0;

    for (const company of candidates) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-company-description', {
          body: { url: (company as any).web.trim() },
        });
        if (error || data?.error || !data?.description) throw new Error(data?.error || 'Sin descripción');
        const { error: updateErr } = await supabase
          .from('outbound_list_companies' as any)
          .update({ descripcion_actividad: data.description } as any)
          .eq('id', company.id);
        if (updateErr) throw updateErr;
        successCount++;
      } catch {
        errorCount++;
      }
      setBulkAiProgress({ done: successCount + errorCount, total: candidates.length, errors: errorCount });
    }

    queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
    setBulkAiRunning(false);
    toast.success(`Generadas ${successCount} descripciones.${errorCount > 0 ? ` ${errorCount} errores.` : ''}`);
  };

  const handleDeleteList = async () => {
    if (!confirm('¿Eliminar esta lista y todas sus empresas? Esta acción no se puede deshacer.')) return;
    await supabase.from('outbound_lists' as any).delete().eq('id', listId!);
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    navigate('/admin/listas-contacto');
    toast.success('Lista eliminada');
  };

  // ===== DEDUP =====
  const duplicateGroups = useMemo(() => {
    const groups: Record<string, ContactListCompany[]> = {};
    companies.forEach(c => {
      const key = (c.empresa || '').trim().toLowerCase();
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return Object.entries(groups).filter(([, g]) => g.length > 1);
  }, [companies]);

  const handleDedup = async () => {
    if (duplicateGroups.length === 0) return;
    const idsToDelete: string[] = [];
    for (const [, group] of duplicateGroups) {
      const sorted = [...group].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const toRemove = dedupKeep === 'newest' ? sorted.slice(0, -1) : sorted.slice(1);
      toRemove.forEach(c => idsToDelete.push(c.id));
    }
    if (idsToDelete.length === 0) return;
    await deleteCompanies.mutateAsync(idsToDelete);
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    setIsDedupModalOpen(false);
    toast.success(`${idsToDelete.length} duplicados eliminados`);
  };

  const handleEstadoChange = async (newEstado: string) => {
    if (!listId) return;
    await supabase.from('outbound_lists' as any).update({ estado: newEstado, updated_at: new Date().toISOString() }).eq('id', listId);
    queryClient.invalidateQueries({ queryKey: ['contact-list-detail', listId] });
    queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
  };

  if (isLoadingList) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!list) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Lista no encontrada</p></div>;
  }

  const estadoConfig = ESTADO_CONFIG[list.estado] || ESTADO_CONFIG.borrador;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/listas-contacto')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            {parentList && (
              <div className="mb-1 flex items-center gap-2">
                <Link to={`/admin/listas-contacto/${parentList.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Sublista de: {parentList.name}
                </Link>
                <Badge variant="accent" size="sm" className="text-[10px]">
                  <Layers className="h-3 w-3 mr-0.5" />
                  Lista Madre: {parentList.name}
                </Badge>
              </div>
            )}
            <h1 className="text-2xl font-semibold">{list.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <Badge variant="outline" className={cn('text-xs cursor-pointer', estadoConfig.className)}>
                      {estadoConfig.label}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background">
                  <DropdownMenuItem onClick={() => handleEstadoChange('borrador')}>Borrador</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEstadoChange('activa')}>Activa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEstadoChange('archivada')}>Archivada</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {list.sector && <span>· {list.sector}</span>}
              <span>· {list.contact_count} empresas</span>
              {isMadreList && (
                <span>· {companiesInSublists}/{companies.length} en sublistas</span>
              )}
              <span>· {new Date(list.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context summary - visible info strip */}
      {(list.descripcion_proposito || (list.cnaes_utilizados && list.cnaes_utilizados.length > 0) || list.facturacion_min != null || list.facturacion_max != null || list.criterios_construccion) && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-1.5 text-sm">
          {list.descripcion_proposito && (
            <p className="text-foreground">{list.descripcion_proposito}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            {list.cnaes_utilizados && list.cnaes_utilizados.length > 0 && (
              <span>
                <strong className="text-foreground/80">CNAEs:</strong>{' '}
                {list.cnaes_utilizados.join(', ')}
              </span>
            )}
            {(list.facturacion_min != null || list.facturacion_max != null) && (
              <span>
                <strong className="text-foreground/80">Facturación:</strong>{' '}
                {list.facturacion_min != null ? `${Number(list.facturacion_min).toLocaleString('es-ES')}€` : '—'}
                {' → '}
                {list.facturacion_max != null ? `${Number(list.facturacion_max).toLocaleString('es-ES')}€` : '—'}
              </span>
            )}
          </div>
          {list.criterios_construccion && (
            <p className="text-xs text-muted-foreground italic">{list.criterios_construccion}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="empresas">Empresas ({companies.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial de Campañas</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        {/* TAB 1: Empresas */}
        <TabsContent value="empresas" className="mt-4 space-y-4">
          {/* Actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Descargar plantilla
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Importar Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Añadir manualmente
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPoolModalOpen(true)}>
              <Filter className="h-4 w-4 mr-2" /> Filtrar del pool
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={companies.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Exportar Excel
            </Button>
            {duplicateGroups.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIsDedupModalOpen(true)} className="text-amber-600 border-amber-300 hover:bg-amber-50">
                <Copy className="h-4 w-4 mr-2" /> {duplicateGroups.length} duplicados
              </Button>
            )}
            <Button variant="accent" size="sm" onClick={() => setIsSendToCampaignOpen(true)} disabled={companies.length === 0}>
              <Megaphone className="h-4 w-4 mr-2" /> Enviar a campaña
            </Button>
          </div>

           {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="space-y-2">
              {showSelectAllBanner && (
                <div className="text-center py-2.5 px-4 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-900">
                  {allFilteredSelected ? (
                    <>
                      ✅ Las <strong>{filteredCompanies.length.toLocaleString('es-ES')}</strong> empresas del filtro actual están seleccionadas.{' '}
                      <button className="text-blue-700 underline underline-offset-2 font-semibold hover:text-blue-900" onClick={() => setSelectedIds([])}>
                        Borrar selección
                      </button>
                    </>
                  ) : (
                    <>
                      Has seleccionado <strong>{selectedIds.length}</strong> de <strong>{filteredCompanies.length.toLocaleString('es-ES')}</strong> empresas filtradas.{' '}
                      <button className="text-blue-700 underline underline-offset-2 font-semibold hover:text-blue-900" onClick={handleSelectAllFiltered}>
                        Seleccionar las {filteredCompanies.length.toLocaleString('es-ES')} empresas
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-wrap">
                <span className="text-sm font-medium">{selectedIds.length.toLocaleString('es-ES')} seleccionadas</span>
                <Button variant="outline" size="sm" onClick={() => { setBulkMoveCopyMode('copy'); setBulkMoveCopyOpen(true); setBulkMoveCopyTargetId(''); setBulkIsCreatingNewList(false); setBulkNewListName(''); }}>
                  <CopyPlus className="h-4 w-4 mr-1" /> Copiar a lista
                </Button>
                {!isMadreList && (
                  <Button variant="outline" size="sm" onClick={() => { setBulkMoveCopyMode('move'); setBulkMoveCopyOpen(true); setBulkMoveCopyTargetId(''); setBulkIsCreatingNewList(false); setBulkNewListName(''); }}>
                    <MoveRight className="h-4 w-4 mr-1" /> Mover a lista
                  </Button>
                )}
                {!isMadreList && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar seleccionadas
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
              </div>
            </div>
          )}

          {/* Search & Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa, contacto, email, CIF..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por actividad..."
                value={activitySearchQuery}
                onChange={e => setActivitySearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {activitySearchQuery && (
                <button onClick={() => setActivitySearchQuery('')} className="absolute right-2.5 top-2.5">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              variant={filterHasEmail ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterHasEmail(!filterHasEmail)}
            >
              Con email
            </Button>
            <Button
              variant={filterHasEbitda ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterHasEbitda(!filterHasEbitda)}
            >
              Con EBITDA
            </Button>
            {hasAnyColumnFilter && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(columnFilters).map(([colKey, values]) =>
                  values.map(val => {
                    let displayVal = val;
                    if (val.startsWith('custom:')) {
                      const parts = val.slice(7).split('-');
                      const fmtNum = (n: string) => {
                        if (!n) return '';
                        const num = Number(n);
                        if (isNaN(num)) return n;
                        if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
                        if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
                        return n;
                      };
                      const suffix = colKey === 'num_trabajadores' ? '' : '€';
                      const minStr = parts[0] ? `${fmtNum(parts[0])}${suffix}` : '';
                      const maxStr = parts[1] ? `${fmtNum(parts[1])}${suffix}` : '';
                      if (minStr && maxStr) displayVal = `${minStr} - ${maxStr}`;
                      else if (minStr) displayVal = `≥ ${minStr}`;
                      else if (maxStr) displayVal = `≤ ${maxStr}`;
                    }
                    return (
                      <Badge key={`${colKey}-${val}`} variant="secondary" className="gap-1 text-xs">
                        <span className="font-medium">{COLUMN_LABELS[colKey] || colKey}:</span> {displayVal}
                        <button
                          onClick={() => {
                            toggleColumnFilter(colKey, val);
                            if (val.startsWith('custom:')) {
                              setCustomRanges(prev => { const { [colKey]: _, ...rest } = prev; return rest; });
                            }
                          }}
                          className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearAllColumnFilters}
                >
                  Limpiar todo
                </Button>
              </div>
            )}
            {isMadreList && (
              <Button
                variant={groupBlocked ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBlocked(!groupBlocked)}
                title={groupBlocked ? 'Vista agrupada: bloqueadas al final' : 'Vista unificada: todas mezcladas'}
              >
                {groupBlocked ? <Layers className="h-4 w-4 mr-1.5" /> : <List className="h-4 w-4 mr-1.5" />}
                {groupBlocked ? 'Agrupada' : 'Unificada'}
              </Button>
            )}
            {(searchQuery || activitySearchQuery || filterHasEmail || filterHasEbitda || hasAnyColumnFilter) && (
              <span className="text-sm text-muted-foreground">
                {filteredCompanies.length} de {companies.length}
              </span>
            )}
            {companies.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAiGenerate}
                disabled={bulkAiRunning || !!aiGenLoading}
              >
                {bulkAiRunning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando {bulkAiProgress.done}/{bulkAiProgress.total}...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generar descripciones IA</>
                )}
              </Button>
            )}
            <ListColumnConfigurator
              columns={allColumns}
              onToggle={toggleColumn}
              onMove={moveColumn}
              onReset={resetToDefault}
              isMadreList={isMadreList}
            />
          </div>
          {/* Companies table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingCompanies ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay empresas en esta lista</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Descarga la plantilla, rellénala e impórtala</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No se encontraron resultados</p>
                </div>
              ) : (
                <>
                <div className="overflow-x-auto">
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead className="w-10">
                           <Checkbox checked={paginatedCompanies.length > 0 && paginatedCompanies.every(c => selectedIds.includes(c.id))} onCheckedChange={handleSelectAll} />
                         </TableHead>
                         {visibleCols.map(col => (
                           <TableHead
                             key={col.key}
                             className={cn(
                               col.align === 'right' && 'text-right',
                               col.minWidth && `min-w-[${col.minWidth}]`
                             )}
                           >
                             {renderColumnHeader(col.key)}
                           </TableHead>
                         ))}
                         <TableHead className="w-12" />
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {(() => {
                         let separatorRendered = false;
                         return paginatedCompanies.map(company => {
                           const isAssignedToSublist = isMadreList && !!company.cif && sublistCompanyMap?.map.has(company.cif.toUpperCase().trim());
                           let separatorRow = null;
                           if (isMadreList && isAssignedToSublist && !separatorRendered && groupBlocked && !sortField) {
                             separatorRendered = true;
                             const assignedCount = filteredCompanies.filter(c => c.cif && sublistCompanyMap?.map.has(c.cif.toUpperCase().trim())).length;
                             separatorRow = (
                               <TableRow key="__separator__" className="hover:bg-transparent border-b-0">
                                 <TableCell colSpan={100} className="py-2 px-3">
                                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                     <Lock className="h-3 w-3" />
                                     <span className="font-medium">Asignadas a sublistas ({assignedCount})</span>
                                     <div className="flex-1 h-px bg-border" />
                                   </div>
                                 </TableCell>
                               </TableRow>
                             );
                           }
                           const needsStopPropagation = new Set(['contacto', 'email', 'linkedin', 'notas', 'consolidador']);
                           return (
                             <React.Fragment key={company.id}>
                               {separatorRow}
                                <TableRow className={cn(
                                  "group/row",
                                  (company as any).consolidador
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500"
                                    : isAssignedToSublist && "bg-muted/30 border-l-2 border-l-amber-400"
                                )}>
                           <TableCell onClick={e => e.stopPropagation()}>
                             <Checkbox checked={selectedIds.includes(company.id)} onCheckedChange={() => handleToggleSelect(company.id)} />
                           </TableCell>
                           {visibleCols.map(col => (
                             <TableCell
                               key={col.key}
                               className={cn(col.align === 'right' && 'text-right')}
                               onClick={needsStopPropagation.has(col.key) ? (e) => e.stopPropagation() : undefined}
                             >
                               {renderColumnCell(col.key, company, !!isAssignedToSublist)}
                             </TableCell>
                           ))}
                          <TableCell onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background">
                                {isAssignedToSublist ? (
                                  <>
                                    {(() => {
                                      const sublistNames = sublistCompanyMap?.map.get(company.cif!.toUpperCase().trim());
                                      const targetSublist = allLists.find((l: any) => sublistNames?.includes(l.name));
                                      const currentSublistId = sublistCompanyMap?.cifToListId?.get(company.cif!.toUpperCase().trim());
                                      return (
                                        <>
                                          <DropdownMenuItem onClick={() => {
                                            if (targetSublist) navigate(`/admin/listas-contacto/${(targetSublist as any).id}`);
                                          }}>
                                            <MoveRight className="h-4 w-4 mr-2" /> Ver en sublista
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => {
                                            setMoveCopyCompany(company);
                                            setMoveCopyMode('move');
                                            setMoveCopyTargetId('');
                                            setMoveCopyFromSublistId(currentSublistId || null);
                                          }}>
                                            <ArrowUpDown className="h-4 w-4 mr-2" /> Cambiar de sublista
                                          </DropdownMenuItem>
                                        </>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => setEditingCompany(company)}>
                                      <Edit className="h-4 w-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    {!isMadreList && (
                                      <DropdownMenuItem onClick={() => { setMoveCopyCompany(company); setMoveCopyMode('move'); setMoveCopyTargetId(''); }}>
                                        <MoveRight className="h-4 w-4 mr-2" /> Mover a otra lista
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => { setMoveCopyCompany(company); setMoveCopyMode('copy'); setMoveCopyTargetId(''); }}>
                                      <CopyPlus className="h-4 w-4 mr-2" /> Copiar a otra lista
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAiGenerate(company)} disabled={aiGenLoading === company.id}>
                                      {aiGenLoading === company.id ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando...</>
                                      ) : (
                                        <><Sparkles className="h-4 w-4 mr-2" /> Generar descripción IA</>
                                      )}
                                    </DropdownMenuItem>
                                    {!isMadreList && (
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => deleteCompany.mutate(company.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>
                {filteredCompanies.length > pageSize && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Mostrando {(currentPage * pageSize + 1).toLocaleString('es-ES')}–{Math.min((currentPage + 1) * pageSize, filteredCompanies.length).toLocaleString('es-ES')} de {filteredCompanies.length.toLocaleString('es-ES')}</span>
                      <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(0); }}>
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="250">250</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>por página</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {currentPage + 1} de {totalPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Historial de Campañas */}
        <TabsContent value="historial" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsLinkCampaignOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" /> Vincular a campaña existente
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Esta lista aún no ha sido vinculada a ninguna campaña.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaña</TableHead>
                      <TableHead>Fecha de vinculación</TableHead>
                      <TableHead className="text-right">Nº empresas enviadas</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.campaign_nombre || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.fecha_vinculacion).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.empresas_enviadas}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.notas || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Configuración */}
        <TabsContent value="config" className="mt-4 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input value={configName} onChange={e => setConfigName(e.target.value)} />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={configDesc} onChange={e => setConfigDesc(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Tipo de lista</Label>
                <Select value={configTipo} onValueChange={(v) => setConfigTipo(v as ContactListTipo)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="madre">Listado Madre</SelectItem>
                    <SelectItem value="compradores">Potenciales compradores</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sector</Label>
                <Input value={configSector} onChange={e => setConfigSector(e.target.value)} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={configEstado} onValueChange={setConfigEstado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="archivada">Archivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveConfig}>Guardar cambios</Button>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-medium text-base">Configuración avanzada</h3>
              <div>
                <Label>Descripción / Propósito</Label>
                <Textarea
                  value={configDescProposito}
                  onChange={e => setConfigDescProposito(e.target.value)}
                  rows={3}
                  placeholder="Ej: Sublista de instaladores eléctricos puros para mandato Cosamo."
                />
              </div>
              <div>
                <Label>CNAEs utilizados</Label>
                <SFFundTagEditor
                  value={configCnaes}
                  onChange={setConfigCnaes}
                  placeholder="Añadir código CNAE..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facturación mínima (€)</Label>
                  <Input
                    type="number"
                    value={configFactMin}
                    onChange={e => setConfigFactMin(e.target.value)}
                    placeholder="Ej: 1500000"
                  />
                </div>
                <div>
                  <Label>Facturación máxima (€)</Label>
                  <Input
                    type="number"
                    value={configFactMax}
                    onChange={e => setConfigFactMax(e.target.value)}
                    placeholder="Ej: 10000000"
                  />
                </div>
              </div>
              <div>
                <Label>Criterios de construcción</Label>
                <Textarea
                  value={configCriteriosConstruccion}
                  onChange={e => setConfigCriteriosConstruccion(e.target.value)}
                  rows={3}
                  placeholder="Ej: Export Sabi con CNAEs 8020 y 4321. Activas, con cuentas presentadas, facturación mínima 1.5M€."
                />
              </div>
              <div>
                <Label>Lista madre</Label>
                <Select value={configListaMadreId || '__none__'} onValueChange={(v) => setConfigListaMadreId(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Sin lista madre" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="__none__">Ninguna</SelectItem>
                    {allLists.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveConfig}>Guardar cambios</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium text-destructive">Zona peligrosa</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Eliminar esta lista y todas las empresas asociadas. Esta acción no se puede deshacer.</p>
              <Button variant="destructive" onClick={handleDeleteList}>
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar lista
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== MODALS ===== */}

      {/* Add Manual Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Añadir empresa manualmente</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="col-span-2"><Label>Empresa *</Label><Input value={addForm.empresa} onChange={e => setAddForm(p => ({ ...p, empresa: e.target.value }))} /></div>
            <div><Label>CIF</Label><Input value={addForm.cif} onChange={e => setAddForm(p => ({ ...p, cif: e.target.value }))} /></div>
            <div><Label>Facturación (€)</Label><Input value={addForm.facturacion} onChange={e => setAddForm(p => ({ ...p, facturacion: e.target.value }))} /></div>
            <div><Label>EBITDA (€)</Label><Input value={addForm.ebitda} onChange={e => setAddForm(p => ({ ...p, ebitda: e.target.value }))} /></div>
            <div><Label>Nº Trabajadores</Label><Input type="number" value={addForm.num_trabajadores} onChange={e => setAddForm(p => ({ ...p, num_trabajadores: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Director Ejecutivo</Label><Input value={addForm.director_ejecutivo} onChange={e => setAddForm(p => ({ ...p, director_ejecutivo: e.target.value }))} /></div>
            <div><Label>Nombre Contacto</Label><Input value={addForm.contacto} onChange={e => setAddForm(p => ({ ...p, contacto: e.target.value }))} /></div>
            <div><Label>Posición Contacto</Label><Input value={addForm.posicion_contacto} onChange={e => setAddForm(p => ({ ...p, posicion_contacto: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>LinkedIn</Label><Input value={addForm.linkedin} onChange={e => setAddForm(p => ({ ...p, linkedin: e.target.value }))} /></div>
            <div><Label>Teléfono</Label><Input value={addForm.telefono} onChange={e => setAddForm(p => ({ ...p, telefono: e.target.value }))} /></div>
            <div><Label>Web</Label><Input value={addForm.web} onChange={e => setAddForm(p => ({ ...p, web: e.target.value }))} /></div>
            <div><Label>CNAE</Label><Input value={addForm.cnae} onChange={e => setAddForm(p => ({ ...p, cnae: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Descripción Actividad</Label><Textarea value={addForm.descripcion_actividad} onChange={e => setAddForm(p => ({ ...p, descripcion_actividad: e.target.value }))} rows={2} /></div>
            <div><Label>Provincia</Label><Input value={addForm.provincia} onChange={e => setAddForm(p => ({ ...p, provincia: e.target.value }))} /></div>
            <div><Label>C. Autónoma</Label><Input value={addForm.comunidad_autonoma} onChange={e => setAddForm(p => ({ ...p, comunidad_autonoma: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notas</Label><Textarea value={addForm.notas} onChange={e => setAddForm(p => ({ ...p, notas: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddManual} disabled={!addForm.empresa.trim()}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel Modal */}
      <Dialog open={isImportModalOpen && importStep !== 'preview' && importStep !== 'result'} onOpenChange={(open) => { if (!open) handleCloseImport(); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Importar desde Excel</DialogTitle></DialogHeader>
          {importData.length === 0 ? (
            <div className="space-y-3">
              {isReadingFile ? (
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center bg-primary/5">
                  <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-foreground font-medium">Leyendo archivo Excel...</p>
                  <p className="text-muted-foreground text-sm mt-1">Esto puede tardar unos segundos</p>
                </div>
              ) : (
                <div {...getRootProps()} className={cn(
                  'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}>
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">Arrastra un archivo .xlsx aquí o haz clic para seleccionar</p>
                </div>
              )}
              <Button variant="link" size="sm" className="text-xs" onClick={downloadTemplate}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Descargar plantilla con las cabeceras correctas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {importData.length} filas encontradas · {Object.keys(importMapping).length} columnas mapeadas
              </div>
              <div className="max-h-[300px] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.entries(importMapping).map(([header, field]) => (
                        <TableHead key={header} className="text-xs">{field} <span className="text-muted-foreground/50">({header})</span></TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {Object.keys(importMapping).map(header => (
                          <TableCell key={header} className="text-xs">{String(row[header] ?? '—')}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {importData.length > 5 && <p className="text-xs text-muted-foreground">...y {importData.length - 5} filas más</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImport}>Cancelar</Button>
            {importData.length > 0 && (
              <Button onClick={handleStartValidation} disabled={isValidating}>
                {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isValidating ? 'Validando empresas...' : `Validar ${importData.length} empresas`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Modal */}
      {validationResult && (importStep === 'preview' || importStep === 'importing') && (
        <ImportPreviewModal
          open
          onClose={handleCloseImport}
          onConfirm={handleConfirmImport}
          result={validationResult}
          isImporting={importStep === 'importing' || addCompanies.isPending}
          importProgress={importProgress}
        />
      )}

      {/* Import Result Modal */}
      {importResultData && importStep === 'result' && (
        <ImportResultModal
          open
          onClose={handleCloseImport}
          imported={importResultData.imported}
          linked={importResultData.linked}
          linkedRelated={importResultData.linkedRelated}
          skippedDuplicates={importResultData.skippedDuplicates}
          skippedErrors={importResultData.skippedErrors}
          errors={importResultData.errors}
        />
      )}
      <PoolFilterModal listId={listId!} open={isPoolModalOpen} onOpenChange={setIsPoolModalOpen} onAdd={async (rows) => {
        await addCompanies.mutateAsync({ rows });
        setIsPoolModalOpen(false);
      }} isAdding={addCompanies.isPending} />

      {/* Link Campaign Modal */}
      <Dialog open={isLinkCampaignOpen} onOpenChange={setIsLinkCampaignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Vincular a campaña</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaña</Label>
              <Select value={linkCampaignId} onValueChange={setLinkCampaignId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar campaña..." /></SelectTrigger>
                <SelectContent className="bg-background">
                  {availableCampaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={linkCampaignNotes} onChange={e => setLinkCampaignNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkCampaignOpen(false)}>Cancelar</Button>
            <Button onClick={handleLinkCampaign} disabled={!linkCampaignId || linkCampaign.isPending}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSave={async (updates) => {
            await updateCompany.mutateAsync({ id: editingCompany.id, ...updates });
            setEditingCompany(null);
          }}
          isSaving={updateCompany.isPending}
        />
      )}

      {/* Company Drawer */}
      <CompanyDrawer company={drawerCompany} onClose={() => setDrawerCompany(null)} onEdit={() => { setEditingCompany(drawerCompany); setDrawerCompany(null); }} />

      {/* Dedup Modal */}
      <Dialog open={isDedupModalOpen} onOpenChange={setIsDedupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar duplicados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se han encontrado <strong>{duplicateGroups.length}</strong> empresas duplicadas (por nombre).
              Se eliminarán <strong>{duplicateGroups.reduce((acc, [, g]) => acc + g.length - 1, 0)}</strong> registros.
            </p>
            <div>
              <Label className="mb-2 block">¿Qué registro conservar?</Label>
              <Select value={dedupKeep} onValueChange={(v) => setDedupKeep(v as 'newest' | 'oldest')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más reciente</SelectItem>
                  <SelectItem value="oldest">Más antiguo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
              {duplicateGroups.map(([name, group]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="truncate font-medium">{group[0].empresa}</span>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">{group.length}x</Badge>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDedupModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDedup}>
              Eliminar duplicados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move/Copy Modal */}
      <Dialog open={!!moveCopyCompany} onOpenChange={(open) => { if (!open) { setMoveCopyCompany(null); setIsCreatingNewList(false); setNewListName(''); setMoveCopyFromSublistId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moveCopyFromSublistId ? 'Cambiar empresa de sublista' : moveCopyMode === 'move' ? 'Mover empresa' : 'Copiar empresa'}{!moveCopyFromSublistId && ' a otra lista'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {moveCopyFromSublistId ? 'Reasignar' : moveCopyMode === 'move' ? 'Mover' : 'Copiar'} <strong>{moveCopyCompany?.empresa}</strong> a:
            </p>
            {!isCreatingNewList ? (
              <>
                <Select value={moveCopyTargetId} onValueChange={setMoveCopyTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder={moveCopyFromSublistId ? "Seleccionar sublista destino..." : "Seleccionar lista destino..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {moveCopyFromSublistId && sublistCompanyMap?.sublists
                      ? sublistCompanyMap.sublists
                          .filter(s => s.id !== moveCopyFromSublistId)
                          .map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))
                      : allLists.map((l: any) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
                {!moveCopyFromSublistId && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => { setIsCreatingNewList(true); setMoveCopyTargetId(''); }}
                  >
                    + Crear nueva lista
                  </button>
                )}
              </>
            ) : (
              <>
                <Input
                  placeholder="Nombre de la nueva lista..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => { setIsCreatingNewList(false); setNewListName(''); }}
                >
                  ← Seleccionar lista existente
                </button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setMoveCopyCompany(null); setIsCreatingNewList(false); setNewListName(''); setMoveCopyFromSublistId(null); }}>Cancelar</Button>
            <Button onClick={handleMoveCopy} disabled={(!isCreatingNewList && !moveCopyTargetId) || (isCreatingNewList && !newListName.trim()) || isMoveCopyLoading}>
              {isMoveCopyLoading ? 'Procesando...' : moveCopyFromSublistId ? 'Reasignar' : moveCopyMode === 'move' ? 'Mover' : 'Copiar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Move/Copy Modal */}
      <Dialog open={bulkMoveCopyOpen} onOpenChange={(open) => { if (!open) { setBulkMoveCopyOpen(false); setBulkIsCreatingNewList(false); setBulkNewListName(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkMoveCopyMode === 'move' ? 'Mover' : 'Copiar'} {selectedIds.length.toLocaleString('es-ES')} empresas a otra lista
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {bulkMoveCopyMode === 'move' ? 'Mover' : 'Copiar'} <strong>{selectedIds.length.toLocaleString('es-ES')}</strong> empresas seleccionadas a:
            </p>
            {!bulkIsCreatingNewList ? (
              <>
                <Select value={bulkMoveCopyTargetId} onValueChange={setBulkMoveCopyTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lista destino..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allLists.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => { setBulkIsCreatingNewList(true); setBulkMoveCopyTargetId(''); }}
                >
                  + Crear nueva lista
                </button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Nombre de la nueva lista..."
                  value={bulkNewListName}
                  onChange={(e) => setBulkNewListName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => { setBulkIsCreatingNewList(false); setBulkNewListName(''); }}
                >
                  ← Seleccionar lista existente
                </button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setBulkMoveCopyOpen(false); setBulkIsCreatingNewList(false); setBulkNewListName(''); }}>Cancelar</Button>
            <Button onClick={handleBulkMoveCopy} disabled={(!bulkIsCreatingNewList && !bulkMoveCopyTargetId) || (bulkIsCreatingNewList && !bulkNewListName.trim()) || bulkMoveCopyLoading}>
              {bulkMoveCopyLoading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Procesando...</> : bulkMoveCopyMode === 'move' ? 'Mover' : 'Copiar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!sublistConflict} onOpenChange={(open) => { if (!open) { setSublistConflict(null); setPendingMoveCopyTargetId(''); setIsMoveCopyLoading(false); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empresa ya asignada a otra sublista</AlertDialogTitle>
            <AlertDialogDescription>
              Esta empresa ya está asignada a la sublista <strong>"{sublistConflict?.sublistName}"</strong>. Asignarla aquí la mantendrá en ambas sublistas. ¿Quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSublistConflict(null); setPendingMoveCopyTargetId(''); setIsMoveCopyLoading(false); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { setSublistConflict(null); setIsMoveCopyLoading(true); await executeMoveCopy(pendingMoveCopyTargetId); setPendingMoveCopyTargetId(''); }}>
              Continuar de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send to Campaign Dialog */}
      <SendToCampaignDialog
        open={isSendToCampaignOpen}
        onOpenChange={setIsSendToCampaignOpen}
        companies={selectedIds.length > 0 ? companies.filter(c => selectedIds.includes(c.id)) : companies}
        listId={listId!}
        listName={list?.name || ''}
      />
    </div>
  );
}

// ===== POOL FILTER MODAL =====
function PoolFilterModal({ listId, open, onOpenChange, onAdd, isAdding }: {
  listId: string; open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (rows: any[]) => Promise<void>; isAdding: boolean;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { data: poolCompanies = [], isLoading } = useQuery({
    queryKey: ['pool-companies-for-list', search],
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from('valuation_campaign_companies')
        .select('id, client_company, client_cif, client_sector, client_provincia, client_email, client_contact_name, client_revenue, client_ebitda, client_website')
        .order('client_company')
        .limit(100);
      if (search) query = query.ilike('client_company', `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const handleAdd = async () => {
    const rows = poolCompanies.filter(c => selected.includes(c.id)).map(c => ({
      list_id: listId,
      empresa: c.client_company || 'Sin nombre',
      contacto: c.client_contact_name || null,
      email: c.client_email || null,
      cif: c.client_cif || null,
      web: c.client_website || null,
      provincia: c.client_provincia || null,
      facturacion: c.client_revenue || null,
      ebitda: c.client_ebitda || null,
      anios_datos: 1,
      telefono: null,
      notas: null,
      num_trabajadores: null,
      director_ejecutivo: null,
      linkedin: null,
      comunidad_autonoma: null,
    }));
    await onAdd(rows);
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Filtrar del pool de empresas</DialogTitle></DialogHeader>
        <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="max-h-[350px] overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.length === poolCompanies.length && poolCompanies.length > 0} onCheckedChange={() => setSelected(selected.length === poolCompanies.length ? [] : poolCompanies.map(c => c.id))} /></TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Provincia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolCompanies.map(c => (
                  <TableRow key={c.id}>
                    <TableCell><Checkbox checked={selected.includes(c.id)} onCheckedChange={() => setSelected(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])} /></TableCell>
                    <TableCell className="text-sm">{c.client_company}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.client_sector || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.client_provincia || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={selected.length === 0 || isAdding}>
            {isAdding ? 'Añadiendo...' : `Añadir ${selected.length} seleccionadas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== EDIT COMPANY DIALOG =====
function EditCompanyDialog({ company, onClose, onSave, isSaving }: {
  company: ContactListCompany; onClose: () => void;
  onSave: (updates: Partial<ContactListCompany>) => Promise<void>; isSaving: boolean;
}) {
  const [form, setForm] = useState({
    empresa: company.empresa,
    contacto: company.contacto || '',
    email: company.email || '',
    telefono: company.telefono || '',
    cif: company.cif || '',
    web: company.web || '',
    provincia: company.provincia || '',
    facturacion: company.facturacion ? String(company.facturacion) : '',
    ebitda: company.ebitda ? String(company.ebitda) : '',
    notas: company.notas || '',
    num_trabajadores: company.num_trabajadores ? String(company.num_trabajadores) : '',
    director_ejecutivo: company.director_ejecutivo || '',
    linkedin: company.linkedin || '',
    comunidad_autonoma: company.comunidad_autonoma || '',
    posicion_contacto: company.posicion_contacto || '',
    cnae: company.cnae || '',
    descripcion_actividad: company.descripcion_actividad || '',
  });

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="col-span-2"><Label>Empresa</Label><Input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} /></div>
          <div><Label>CIF</Label><Input value={form.cif} onChange={e => setForm(p => ({ ...p, cif: e.target.value }))} /></div>
          <div><Label>Facturación</Label><Input value={form.facturacion} onChange={e => setForm(p => ({ ...p, facturacion: e.target.value }))} /></div>
          <div><Label>EBITDA</Label><Input value={form.ebitda} onChange={e => setForm(p => ({ ...p, ebitda: e.target.value }))} /></div>
          <div><Label>Nº Trabajadores</Label><Input type="number" value={form.num_trabajadores} onChange={e => setForm(p => ({ ...p, num_trabajadores: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Director Ejecutivo</Label><Input value={form.director_ejecutivo} onChange={e => setForm(p => ({ ...p, director_ejecutivo: e.target.value }))} /></div>
            <div><Label>Contacto</Label><Input value={form.contacto} onChange={e => setForm(p => ({ ...p, contacto: e.target.value }))} /></div>
            <div><Label>Posición Contacto</Label><Input value={form.posicion_contacto} onChange={e => setForm(p => ({ ...p, posicion_contacto: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} /></div>
            <div><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} /></div>
            <div><Label>Web</Label><Input value={form.web} onChange={e => setForm(p => ({ ...p, web: e.target.value }))} /></div>
            <div><Label>CNAE</Label><Input value={form.cnae} onChange={e => setForm(p => ({ ...p, cnae: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Descripción Actividad</Label><Textarea value={form.descripcion_actividad} onChange={e => setForm(p => ({ ...p, descripcion_actividad: e.target.value }))} rows={2} /></div>
            <div><Label>Provincia</Label><Input value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))} /></div>
            <div><Label>C. Autónoma</Label><Input value={form.comunidad_autonoma} onChange={e => setForm(p => ({ ...p, comunidad_autonoma: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notas</Label><Textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={isSaving} onClick={() => onSave({
            empresa: form.empresa,
            contacto: form.contacto || null,
            email: form.email || null,
            telefono: form.telefono || null,
            cif: form.cif || null,
            web: form.web || null,
            provincia: form.provincia || null,
            facturacion: parseSpanishNumber(form.facturacion),
            ebitda: parseSpanishNumber(form.ebitda),
            notas: form.notas || null,
            num_trabajadores: form.num_trabajadores ? parseInt(form.num_trabajadores) || null : null,
            director_ejecutivo: form.director_ejecutivo || null,
            linkedin: form.linkedin || null,
            comunidad_autonoma: form.comunidad_autonoma || null,
            posicion_contacto: form.posicion_contacto || null,
            cnae: form.cnae || null,
            descripcion_actividad: form.descripcion_actividad || null,
          })}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== COMPANY DRAWER =====
function CompanyDrawer({ company, onClose, onEdit }: {
  company: ContactListCompany | null; onClose: () => void; onEdit: () => void;
}) {
  const { data: history = [], isLoading } = useCompanyListHistory(company?.empresa);

  return (
    <Sheet open={!!company} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        {company && (
          <>
            <SheetHeader>
              <SheetTitle>{company.empresa}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">CIF:</span> <span className="ml-1">{company.cif || '—'}</span></div>
                <div><span className="text-muted-foreground">Año datos:</span> <span className="ml-1">{company.anios_datos || '—'}</span></div>
                <div><span className="text-muted-foreground">Facturación:</span> <span className="ml-1">{company.facturacion ? `€${Number(company.facturacion).toLocaleString('es-ES')}` : '—'}</span></div>
                <div><span className="text-muted-foreground">EBITDA:</span> <span className="ml-1">{company.ebitda ? `€${Number(company.ebitda).toLocaleString('es-ES')}` : '—'}</span></div>
                <div><span className="text-muted-foreground">Empleados:</span> <span className="ml-1">{company.num_trabajadores ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Director Ejecutivo:</span> <span className="ml-1">{company.director_ejecutivo || '—'}</span></div>
                <div><span className="text-muted-foreground">Contacto:</span> <span className="ml-1">{company.contacto || '—'}</span></div>
                <div><span className="text-muted-foreground">Posición:</span> <span className="ml-1">{company.posicion_contacto || '—'}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-1">{company.email || '—'}</span></div>
                <div><span className="text-muted-foreground">LinkedIn:</span> <span className="ml-1">{company.linkedin || '—'}</span></div>
                <div><span className="text-muted-foreground">Teléfono:</span> <span className="ml-1">{company.telefono || '—'}</span></div>
                <div><span className="text-muted-foreground">Web:</span> <span className="ml-1">{company.web || '—'}</span></div>
                <div><span className="text-muted-foreground">CNAE:</span> <span className="ml-1">{company.cnae || '—'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Desc. Actividad:</span> <span className="ml-1">{company.descripcion_actividad || '—'}</span></div>
                <div><span className="text-muted-foreground">Provincia:</span> <span className="ml-1">{company.provincia || '—'}</span></div>
                <div><span className="text-muted-foreground">C. Autónoma:</span> <span className="ml-1">{company.comunidad_autonoma || '—'}</span></div>
              </div>
              {company.notas && (
                <div className="text-sm"><span className="text-muted-foreground">Notas:</span> <p className="mt-1">{company.notas}</p></div>
              )}

              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" /> Editar empresa
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" /> Historial de aparición en listas
                </h4>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Solo aparece en esta lista</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{h.lista}</span>
                        <span className="text-muted-foreground">{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
