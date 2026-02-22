import React, { useMemo } from 'react';
import { SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';
import { BarChart3, Layers, AlertTriangle, CheckCircle2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const COMPLETABLE_FIELDS = [
  'vertical', 'pe_thesis', 'quantitative_data', 'active_pe_firms',
  'platforms_operations', 'multiples_valuations', 'consolidation_phase', 'geography',
] as const;

const FIELD_LABELS: Record<string, string> = {
  vertical: 'Vertical',
  pe_thesis: 'Tesis PE',
  quantitative_data: 'Datos cuant.',
  active_pe_firms: 'Firmas PE',
  platforms_operations: 'Plataformas',
  multiples_valuations: 'Múltiplos',
  consolidation_phase: 'Fase consol.',
  geography: 'Geografía',
};

function getCompleteness(row: SectorIntelligenceRow): number {
  const filled = COMPLETABLE_FIELDS.filter(f => row[f] && String(row[f]).trim().length > 0).length;
  return Math.round((filled / COMPLETABLE_FIELDS.length) * 100);
}

function getFilledCount(row: SectorIntelligenceRow): number {
  return COMPLETABLE_FIELDS.filter(f => row[f] && String(row[f]).trim().length > 0).length;
}

interface Props {
  rows: SectorIntelligenceRow[];
  grouped: Record<string, SectorIntelligenceRow[]>;
  sectors: string[];
  onEdit: (row: SectorIntelligenceRow) => void;
}

export const SectorCoverageDashboard: React.FC<Props> = ({ rows, grouped, sectors, onEdit }) => {
  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(r => r.is_active).length;
    const inactive = total - active;
    const avgCompleteness = total > 0
      ? Math.round(rows.reduce((sum, r) => sum + getCompleteness(r), 0) / total)
      : 0;
    return { total, active, inactive, sectorCount: sectors.length, avgCompleteness };
  }, [rows, sectors]);

  const topGaps = useMemo(() => {
    return [...rows]
      .map(r => ({ row: r, filled: getFilledCount(r), total: COMPLETABLE_FIELDS.length }))
      .sort((a, b) => a.filled - b.filled)
      .slice(0, 10);
  }, [rows]);

  // Heatmap: per sector, which fields are mostly filled
  const heatmapData = useMemo(() => {
    return sectors.map(sector => {
      const sectorRows = grouped[sector];
      const fieldStats = COMPLETABLE_FIELDS.map(field => {
        const filled = sectorRows.filter(r => r[field] && String(r[field]).trim().length > 0).length;
        const pct = Math.round((filled / sectorRows.length) * 100);
        return { field, filled, total: sectorRows.length, pct };
      });
      const avgPct = Math.round(fieldStats.reduce((s, f) => s + f.pct, 0) / fieldStats.length);
      return { sector, subsectorCount: sectorRows.length, fieldStats, avgPct };
    });
  }, [grouped, sectors]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon={<Layers className="h-4 w-4" />} label="Subsectores" value={stats.total} />
        <KpiCard icon={<BarChart3 className="h-4 w-4" />} label="Sectores" value={stats.sectorCount} />
        <KpiCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completitud media" value={`${stats.avgCompleteness}%`} />
        <KpiCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="Activos" value={stats.active} />
        <KpiCard icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label="Inactivos" value={stats.inactive} />
      </div>

      {/* Heatmap */}
      <div className="rounded-lg border border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg-secondary))] p-3">
        <h3 className="text-xs font-semibold text-[hsl(var(--linear-text-primary))] mb-2">
          Cobertura por Sector
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-left py-1 px-2 text-[hsl(var(--linear-text-tertiary))] font-medium">Sector</th>
                <th className="text-center py-1 px-1 text-[hsl(var(--linear-text-tertiary))] font-medium">#</th>
                {COMPLETABLE_FIELDS.map(f => (
                  <th key={f} className="text-center py-1 px-1 text-[hsl(var(--linear-text-tertiary))] font-medium">
                    {FIELD_LABELS[f]}
                  </th>
                ))}
                <th className="text-center py-1 px-1 text-[hsl(var(--linear-text-tertiary))] font-medium">Avg</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map(({ sector, subsectorCount, fieldStats, avgPct }) => (
                <tr key={sector} className="border-t border-[hsl(var(--linear-border))]">
                  <td className="py-1 px-2 text-[hsl(var(--linear-text-primary))] font-medium truncate max-w-[120px]">
                    {sector}
                  </td>
                  <td className="text-center py-1 px-1 text-[hsl(var(--linear-text-tertiary))]">
                    {subsectorCount}
                  </td>
                  {fieldStats.map(fs => (
                    <td key={fs.field} className="text-center py-1 px-1">
                      <HeatCell pct={fs.pct} label={`${fs.filled}/${fs.total}`} />
                    </td>
                  ))}
                  <td className="text-center py-1 px-1">
                    <HeatCell pct={avgPct} label={`${avgPct}%`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Gaps */}
      <div className="rounded-lg border border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg-secondary))] p-3">
        <h3 className="text-xs font-semibold text-[hsl(var(--linear-text-primary))] mb-2">
          Top 10 Subsectores con más campos vacíos
        </h3>
        <div className="space-y-1.5">
          {topGaps.map(({ row, filled, total }) => (
            <div key={row.id} className="flex items-center gap-2 text-[11px]">
              <div className="flex-1 min-w-0">
                <span className="text-[hsl(var(--linear-text-tertiary))]">{row.sector} → </span>
                <span className="text-[hsl(var(--linear-text-primary))] font-medium">{row.subsector}</span>
              </div>
              <div className="w-24">
                <Progress value={(filled / total) * 100} className="h-1.5" />
              </div>
              <span className="text-[hsl(var(--linear-text-tertiary))] w-10 text-right">{filled}/{total}</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => onEdit(row)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg-secondary))] p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-[hsl(var(--linear-text-tertiary))]">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <div className="text-lg font-semibold text-[hsl(var(--linear-text-primary))]">{value}</div>
    </div>
  );
}

function HeatCell({ pct, label }: { pct: number; label: string }) {
  const bg = pct >= 80 ? 'bg-green-500/20 text-green-700' 
    : pct >= 50 ? 'bg-amber-500/20 text-amber-700' 
    : pct > 0 ? 'bg-red-500/20 text-red-700'
    : 'bg-muted text-muted-foreground';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${bg}`}>
            {pct}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
