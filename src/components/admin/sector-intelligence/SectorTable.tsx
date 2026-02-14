import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';
import { cn } from '@/lib/utils';

interface Props {
  grouped: Record<string, SectorIntelligenceRow[]>;
  sectors: string[];
  onEdit: (row: SectorIntelligenceRow) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
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

export const SectorTable: React.FC<Props> = ({ grouped, sectors, onEdit, onDelete, onCreate }) => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [collapsedSectors, setCollapsedSectors] = useState<Set<string>>(new Set());

  const filteredGrouped = useMemo(() => {
    const result: Record<string, SectorIntelligenceRow[]> = {};
    const q = search.toLowerCase();
    
    for (const sector of sectors) {
      if (sectorFilter !== 'all' && sector !== sectorFilter) continue;
      const filtered = grouped[sector].filter(r => {
        if (!q) return true;
        return [r.subsector, r.vertical, r.pe_thesis, r.quantitative_data, r.active_pe_firms, r.platforms_operations, r.consolidation_phase, r.geography]
          .some(f => f?.toLowerCase().includes(q));
      });
      if (filtered.length > 0) result[sector] = filtered;
    }
    return result;
  }, [grouped, sectors, search, sectorFilter]);

  const filteredSectors = Object.keys(filteredGrouped).sort();
  const totalCount = Object.values(filteredGrouped).reduce((a, b) => a + b.length, 0);

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

  return (
    <div className="space-y-3">
      {/* Toolbar */}
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
          <SelectTrigger className="w-[200px] h-8 text-sm bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))]">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {sectors.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-[hsl(var(--linear-text-tertiary))]">{totalCount} subsectores</span>
        <div className="ml-auto">
          <Button size="sm" onClick={onCreate} className="h-8 text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Nuevo
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto">
          <Table density="compact" variant="linear">
            <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--linear-bg-secondary))]">
              <TableRow variant="linear">
                <TableHead className="w-8"></TableHead>
                <TableHead className="min-w-[160px]">Subsector</TableHead>
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
                  {!collapsedSectors.has(sector) && filteredGrouped[sector].map(row => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        variant="linear"
                        className="cursor-pointer"
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
                          <span className="text-[13px] font-medium text-[hsl(var(--linear-text-primary))]">
                            {row.subsector}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))]">
                          {row.vertical || '—'}
                        </TableCell>
                        <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))] max-w-[250px] truncate">
                          {row.pe_thesis || '—'}
                        </TableCell>
                        <TableCell className="py-1.5 text-[12px] text-[hsl(var(--linear-text-secondary))] max-w-[150px] truncate">
                          {row.multiples_valuations || '—'}
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

                      {/* Expanded detail */}
                      {expandedRows.has(row.id) && (
                        <TableRow variant="linear" className="bg-[hsl(var(--linear-bg-secondary))]">
                          <TableCell></TableCell>
                          <TableCell colSpan={7} className="py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                              {[
                                { label: 'Datos cuantitativos', value: row.quantitative_data },
                                { label: 'Firmas PE activas', value: row.active_pe_firms },
                                { label: 'Plataformas / Operaciones', value: row.platforms_operations },
                                { label: 'Tesis PE completa', value: row.pe_thesis },
                                { label: 'Múltiplos / Valoraciones', value: row.multiples_valuations },
                              ].filter(f => f.value).map(f => (
                                <div key={f.label} className="space-y-1">
                                  <p className="text-[10px] font-medium text-[hsl(var(--linear-text-tertiary))] uppercase tracking-wider">
                                    {f.label}
                                  </p>
                                  <p className="text-[hsl(var(--linear-text-secondary))] whitespace-pre-line leading-relaxed">
                                    {f.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
