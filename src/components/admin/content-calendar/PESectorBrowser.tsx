import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Database, TrendingUp } from 'lucide-react';
import { usePESectorIntelligence, type PESectorIntelligence } from '@/hooks/useContentCalendar';
import { cn } from '@/lib/utils';

interface PESectorBrowserProps {
  onCreateIdea: (data: { title: string; pe_sector_id: string; category: string; notes: string }) => void;
}

const PHASE_COLORS: Record<string, string> = {
  'MUY TEMPRANO': 'bg-emerald-100 text-emerald-700',
  'TEMPRANO': 'bg-green-100 text-green-700',
  'TEMPRANO-MEDIO': 'bg-lime-100 text-lime-700',
  'MEDIO': 'bg-yellow-100 text-yellow-700',
  'MEDIO CICLO': 'bg-amber-100 text-amber-700',
  'MEDIO-AVANZADO': 'bg-orange-100 text-orange-700',
  'MADURO': 'bg-red-100 text-red-700',
  'BOOM': 'bg-purple-100 text-purple-700',
};

const getPhaseColor = (phase: string | null) => {
  if (!phase) return 'bg-slate-100 text-slate-600';
  const key = Object.keys(PHASE_COLORS).find(k => phase.toUpperCase().includes(k));
  return key ? PHASE_COLORS[key] : 'bg-slate-100 text-slate-600';
};

const PESectorBrowser: React.FC<PESectorBrowserProps> = ({ onCreateIdea }) => {
  const { sectors, isLoading } = usePESectorIntelligence();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const uniqueSectors = useMemo(() => [...new Set(sectors.map(s => s.sector))].sort(), [sectors]);

  const filtered = useMemo(() => {
    return sectors.filter(s => {
      if (sectorFilter !== 'all' && s.sector !== sectorFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [s.sector, s.subsector, s.vertical, s.pe_thesis, s.consolidation_phase]
          .some(f => f?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [sectors, search, sectorFilter]);

  const handleCreateIdea = (sector: PESectorIntelligence) => {
    const title = `${sector.subsector}${sector.vertical ? `: ${sector.vertical}` : ''} — Oportunidades PE`;
    const notes = [
      sector.pe_thesis && `**Tesis PE:** ${sector.pe_thesis}`,
      sector.quantitative_data && `**Datos:** ${sector.quantitative_data}`,
      sector.multiples_valuations && `**Múltiplos:** ${sector.multiples_valuations}`,
      sector.consolidation_phase && `**Fase:** ${sector.consolidation_phase}`,
      sector.active_pe_firms && `**Firmas activas:** ${sector.active_pe_firms}`,
    ].filter(Boolean).join('\n\n');

    onCreateIdea({
      title,
      pe_sector_id: sector.id,
      category: sector.sector,
      notes,
    });
  };

  if (isLoading) {
    return <div className="text-center p-8 text-muted-foreground">Cargando datos de sectores PE...</div>;
  }

  if (sectors.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay datos de sectores PE importados aún.</p>
          <p className="text-xs text-muted-foreground mt-1">Los datos se importarán desde el Excel de PE.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sector, subsector, vertical..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="h-9 w-[200px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores ({sectors.length})</SelectItem>
            {uniqueSectors.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} subsectores encontrados</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(sector => (
          <Card key={sector.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant="outline" className="text-[10px] shrink-0">{sector.sector}</Badge>
                    <Badge className={cn('text-[10px] shrink-0', getPhaseColor(sector.consolidation_phase))}>
                      {sector.consolidation_phase || 'N/A'}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium">{sector.subsector}</h3>
                  {sector.vertical && <p className="text-xs text-muted-foreground">{sector.vertical}</p>}
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleCreateIdea(sector)}>
                  <Plus className="h-3 w-3 mr-1" /> Crear idea
                </Button>
              </div>

              {sector.pe_thesis && (
                <p className="text-xs text-muted-foreground line-clamp-2">{sector.pe_thesis}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {sector.multiples_valuations && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> {sector.multiples_valuations.substring(0, 60)}
                  </span>
                )}
                {sector.geography && (
                  <Badge variant="secondary" className="text-[10px]">{sector.geography}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PESectorBrowser;
