import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, Search, Upload, Download, TrendingUp, Users, Building2, Globe, BarChart3, Layers, Target, MapPin, ChevronsUpDown, ChevronsDownUp, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';
import { cn } from '@/lib/utils';
import { highlightSearchTerm } from '@/utils/highlightText';

interface Props {
  grouped: Record<string, SectorIntelligenceRow[]>;
  sectors: string[];
  onEdit: (row: SectorIntelligenceRow) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onImport?: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  'TEMPRANO': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'MUY TEMPRANO': 'bg-green-500/20 text-green-400 border-green-500/30',
  'TEMPRANO-MEDIO': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'MEDIO': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'MEDIO CICLO': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'MEDIO-AVANZADO': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'MADURO': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'BOOM': 'bg-red-500/20 text-red-400 border-red-500/30',
  'EN AUGE': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const getPhaseColor = (phase: string | null) => {
  if (!phase) return 'bg-muted text-muted-foreground';
  const upper = phase.toUpperCase();
  for (const [key, cls] of Object.entries(PHASE_COLORS)) {
    if (upper.includes(key)) return cls;
  }
  return 'bg-muted text-muted-foreground';
};

const SECTOR_COLORS: Record<string, string> = {
  'SALUD': 'bg-rose-500/10 border-l-rose-500',
  'CONSTRUCCIÓN': 'bg-amber-500/10 border-l-amber-500',
  'TECNOLOGÍA': 'bg-violet-500/10 border-l-violet-500',
  'SERVICIOS PROFESIONALES': 'bg-blue-500/10 border-l-blue-500',
  'INDUSTRIALES': 'bg-slate-500/10 border-l-slate-500',
  'CONSUMO': 'bg-emerald-500/10 border-l-emerald-500',
  'ENERGÍA': 'bg-yellow-500/10 border-l-yellow-500',
};

const COMPLETENESS_FIELDS: (keyof SectorIntelligenceRow)[] = [
  'vertical', 'pe_thesis', 'quantitative_data', 'active_pe_firms',
  'platforms_operations', 'multiples_valuations', 'consolidation_phase', 'geography'
];

const getCompleteness = (row: SectorIntelligenceRow) => {
  const filled = COMPLETENESS_FIELDS.filter(f => row[f]).length;
  return { filled, total: COMPLETENESS_FIELDS.length };
};

const DETAIL_SECTIONS: { key: string; label: string; icon: React.FC<any>; asBadges?: boolean }[] = [
  { key: 'pe_thesis', label: 'Tesis PE', icon: Target },
  { key: 'quantitative_data', label: 'Datos cuantitativos', icon: BarChart3 },
  { key: 'active_pe_firms', label: 'Firmas PE activas', icon: Users, asBadges: true },
  { key: 'platforms_operations', label: 'Plataformas / Operaciones', icon: Building2 },
  { key: 'multiples_valuations', label: 'Múltiplos / Valoraciones', icon: TrendingUp },
  { key: 'consolidation_phase', label: 'Fase de consolidación', icon: Layers },
  { key: 'geography', label: 'Geografía', icon: MapPin },
  { key: 'vertical', label: 'Vertical', icon: Globe },
];

export const SectorTable: React.FC<Props> = ({ grouped, sectors, onEdit, onDelete, onCreate, onImport }) => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [geoFilter, setGeoFilter] = useState('all');
  const [showInactive, setShowInactive] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [collapsedSectors, setCollapsedSectors] = useState<Set<string>>(new Set());

  // Extract unique phases and geographies from all data
  const allRows = useMemo(() => sectors.flatMap(s => grouped[s] || []), [grouped, sectors]);

  const phases = useMemo(() =>
    [...new Set(allRows.flatMap(r => r.consolidation_phase ? [r.consolidation_phase.split('.')[0].trim()] : []))].sort()
  , [allRows]);

  const geographies = useMemo(() =>
    [...new Set(allRows.flatMap(r => r.geography ? [r.geography.trim()] : []))].sort()
  , [allRows]);

  const filteredGrouped = useMemo(() => {
    const result: Record<string, SectorIntelligenceRow[]> = {};
    const q = search.toLowerCase();
    
    for (const sector of sectors) {
      if (sectorFilter !== 'all' && sector !== sectorFilter) continue;
      const filtered = grouped[sector].filter(r => {
        // Active filter
        if (!showInactive && !r.is_active) return false;
        // Phase filter
        if (phaseFilter !== 'all' && (!r.consolidation_phase || !r.consolidation_phase.toUpperCase().includes(phaseFilter.toUpperCase()))) return false;
        // Geo filter
        if (geoFilter !== 'all' && r.geography?.trim() !== geoFilter) return false;
        // Search
        if (!q) return true;
        return [r.subsector, r.vertical, r.pe_thesis, r.quantitative_data, r.active_pe_firms, r.platforms_operations, r.consolidation_phase, r.geography]
          .some(f => f?.toLowerCase().includes(q));
      });
      if (filtered.length > 0) result[sector] = filtered;
    }
    return result;
  }, [grouped, sectors, search, sectorFilter, phaseFilter, geoFilter, showInactive]);

  const filteredSectors = Object.keys(filteredGrouped).sort();
  const totalCount = Object.values(filteredGrouped).reduce((a, b) => a + b.length, 0);

  const activeFilterCount = [
    sectorFilter !== 'all',
    phaseFilter !== 'all',
    geoFilter !== 'all',
    !showInactive,
    search.length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setSectorFilter('all');
    setPhaseFilter('all');
    setGeoFilter('all');
    setShowInactive(true);
  };

  const handleExport = () => {
    const allExportRows = filteredSectors.flatMap(s => filteredGrouped[s]);
    const exportData = allExportRows.map(r => ({
      'Sector': r.sector,
      'Subsector': r.subsector,
      'Vertical': r.vertical || '',
      'Tesis PE': r.pe_thesis || '',
      'Datos Cuantitativos': r.quantitative_data || '',
      'Firmas PE Activas': r.active_pe_firms || '',
      'Plataformas / Operaciones': r.platforms_operations || '',
      'Múltiplos / Valoraciones': r.multiples_valuations || '',
      'Fase Consolidación': r.consolidation_phase || '',
      'Geografía': r.geography || '',
      'Activo': r.is_active ? 'Sí' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inteligencia Sectorial');
    XLSX.writeFile(wb, `inteligencia_sectorial_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success(`${exportData.length} registros exportados`);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSector = (sector: string) => {
    setCollapsedSectors(prev => {
      const next = new Set(prev);
      next.has(sector) ? next.delete(sector) : next.add(sector);
      return next;
    });
  };

  const expandAll = () => setCollapsedSectors(new Set());
  const collapseAll = () => setCollapsedSectors(new Set(filteredSectors));

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Toolbar row 1: Search + sector + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--linear-text-tertiary))]" />
            <Input
              placeholder="Buscar subsector, firma, plataforma..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))]"
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px] h-8 text-sm bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))]">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sectores</SelectItem>
              {sectors.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-[160px] h-8 text-sm bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))]">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fases</SelectItem>
              {phases.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={geoFilter} onValueChange={setGeoFilter}>
            <SelectTrigger className="w-[160px] h-8 text-sm bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))]">
              <SelectValue placeholder="Geografía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las geo.</SelectItem>
              {geographies.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
              className="scale-75"
            />
            <label htmlFor="show-inactive" className="text-[11px] text-[hsl(var(--linear-text-tertiary))] cursor-pointer select-none">
              Inactivos
            </label>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-[11px] gap-1 text-[hsl(var(--linear-text-tertiary))] hover:text-[hsl(var(--linear-text-primary))]">
              <X className="h-3 w-3" />
              Limpiar ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* Toolbar row 2: Stats + expand/collapse + export/import/new */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--linear-text-tertiary))]">
            {totalCount} subsectores en {filteredSectors.length} sectores
          </span>
          <div className="flex items-center gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={expandAll}>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Expandir todo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={collapseAll}>
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Colapsar todo</TooltipContent>
            </Tooltip>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={totalCount === 0} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
            {onImport && (
              <Button size="sm" variant="outline" onClick={onImport} className="h-8 text-xs gap-1">
                <Upload className="h-3.5 w-3.5" /> Importar
              </Button>
            )}
            <Button size="sm" onClick={onCreate} className="h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Nuevo
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto">
            <Table density="compact" variant="linear">
              <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--linear-bg-secondary))]">
                <TableRow variant="linear">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="min-w-[180px]">Subsector</TableHead>
                  <TableHead className="min-w-[120px]">Vertical</TableHead>
                  <TableHead className="min-w-[200px]">Tesis PE</TableHead>
                  <TableHead className="min-w-[140px]">Múltiplos</TableHead>
                  <TableHead className="min-w-[120px]">Fase</TableHead>
                  <TableHead className="min-w-[100px]">Geografía</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSectors.map(sector => (
                  <React.Fragment key={sector}>
                    {/* Sector header row */}
                    <TableRow
                      variant="linear"
                      className={cn(
                        'cursor-pointer border-l-3',
                        SECTOR_COLORS[sector] || 'bg-muted/30 border-l-muted'
                      )}
                      onClick={() => toggleSector(sector)}
                    >
                      <TableCell colSpan={8} className="py-1.5">
                        <div className="flex items-center gap-2">
                          {collapsedSectors.has(sector) ? (
                            <ChevronRight className="h-4 w-4 text-[hsl(var(--linear-text-tertiary))]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[hsl(var(--linear-text-tertiary))]" />
                          )}
                          <span className="font-semibold text-xs text-[hsl(var(--linear-text-primary))] tracking-wide">
                            {sector}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {filteredGrouped[sector].length}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Data rows */}
                    {!collapsedSectors.has(sector) && filteredGrouped[sector].map(row => {
                      const comp = getCompleteness(row);
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow
                            variant="linear"
                            className={cn("cursor-pointer", !row.is_active && 'opacity-50')}
                            onClick={() => toggleRow(row.id)}
                          >
                            <TableCell className="py-1.5">
                              {expandedRows.has(row.id) ? (
                                <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--linear-text-tertiary))]" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--linear-text-tertiary))]" />
                              )}
                            </TableCell>
                            <TableCell className="py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-[hsl(var(--linear-text-primary))]">
                                  {search.length >= 2 ? highlightSearchTerm(row.subsector, search) : row.subsector}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className={cn(
                                      "text-[10px] font-medium px-1 py-0.5 rounded",
                                      comp.filled === comp.total
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : comp.filled >= comp.total * 0.6
                                          ? "bg-amber-500/20 text-amber-400"
                                          : "bg-red-500/20 text-red-400"
                                    )}>
                                      {comp.filled}/{comp.total}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {comp.filled === comp.total ? 'Registro completo' : `${comp.total - comp.filled} campos por rellenar`}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))]">
                              {row.vertical ? (search.length >= 2 ? highlightSearchTerm(row.vertical, search) : row.vertical) : '—'}
                            </TableCell>
                            <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))] max-w-[250px]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block truncate">
                                    {row.pe_thesis ? (search.length >= 2 ? highlightSearchTerm(row.pe_thesis, search) : row.pe_thesis) : '—'}
                                  </span>
                                </TooltipTrigger>
                                {row.pe_thesis && row.pe_thesis.length > 40 && (
                                  <TooltipContent className="max-w-sm whitespace-pre-line text-xs">
                                    {row.pe_thesis}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TableCell>
                            <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))] max-w-[150px]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block truncate">
                                    {row.multiples_valuations || '—'}
                                  </span>
                                </TooltipTrigger>
                                {row.multiples_valuations && row.multiples_valuations.length > 20 && (
                                  <TooltipContent className="max-w-sm whitespace-pre-line text-xs">
                                    {row.multiples_valuations}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TableCell>
                            <TableCell className="py-1.5">
                              <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 border', getPhaseColor(row.consolidation_phase))}>
                                {row.consolidation_phase?.split('.')[0] || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))]">
                              {row.geography || '—'}
                            </TableCell>
                            <TableCell className="py-1.5" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(row)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar {row.subsector}?</AlertDialogTitle>
                                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDelete(row.id)}>Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded detail card */}
                          {expandedRows.has(row.id) && (
                            <TableRow variant="linear" className="bg-[hsl(var(--linear-bg-secondary))]">
                              <TableCell></TableCell>
                              <TableCell colSpan={7} className="py-3">
                                {/* Completeness bar */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex-1 max-w-[200px]">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-[hsl(var(--linear-text-tertiary))] uppercase tracking-wider">Completitud</span>
                                      <span className="text-[10px] font-medium text-[hsl(var(--linear-text-secondary))]">{comp.filled}/{comp.total}</span>
                                    </div>
                                    <Progress value={(comp.filled / comp.total) * 100} className="h-1.5" />
                                  </div>
                                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-auto" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
                                    <Pencil className="h-3 w-3" /> Editar registro
                                  </Button>
                                </div>

                                {/* Detail grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[12px]">
                                  {DETAIL_SECTIONS.filter(s => row[s.key as keyof SectorIntelligenceRow]).map(section => {
                                    const Icon = section.icon;
                                    const value = row[section.key as keyof SectorIntelligenceRow] as string;
                                    return (
                                      <div key={section.key} className="space-y-1.5 p-2.5 rounded-md bg-[hsl(var(--linear-bg-primary))] border border-[hsl(var(--linear-border))]">
                                        <div className="flex items-center gap-1.5">
                                          <Icon className="h-3 w-3 text-[hsl(var(--linear-text-tertiary))]" />
                                          <p className="text-[10px] font-medium text-[hsl(var(--linear-text-tertiary))] uppercase tracking-wider">
                                            {section.label}
                                          </p>
                                        </div>
                                        {section.asBadges ? (
                                          <div className="flex flex-wrap gap-1">
                                            {value.split(/[,;]/).map((firm, i) => {
                                              const trimmed = firm.trim();
                                              return trimmed ? (
                                                <Badge key={i} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                  {trimmed}
                                                </Badge>
                                              ) : null;
                                            })}
                                          </div>
                                        ) : (
                                          <p className="text-[hsl(var(--linear-text-secondary))] whitespace-pre-line leading-relaxed">
                                            {value}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
