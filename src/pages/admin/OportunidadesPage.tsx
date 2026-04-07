import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Opportunity {
  id: string;
  codigo: string;
  tipo: string;
  pipeline_stage: string;
  project_number: string | null;
  project_name: string | null;
  sector: string | null;
  ubicacion: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  ebitda_margin: number | null;
  rango_facturacion_min: number | null;
  rango_facturacion_max: number | null;
  rango_ebitda_min: number | null;
  rango_ebitda_max: number | null;
  sectores_target: string[] | null;
  short_description: string | null;
  short_description_en: string | null;
  description: string | null;
  description_en: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  '1. Preparación': 'Fase de Preparación',
  '2. Go To Market': 'Proceso de Venta Activo',
  '3. Negociación y Cierre': 'Negociación y Cierre',
  '1. Definición': 'Búsqueda de Oportunidades',
};

const STAGE_COLORS: Record<string, string> = {
  '1. Preparación': 'bg-blue-100 text-blue-800',
  '2. Go To Market': 'bg-green-100 text-green-800',
  '3. Negociación y Cierre': 'bg-amber-100 text-amber-800',
  '1. Definición': 'bg-slate-100 text-slate-800',
};

const formatCurrency = (value: number | null) => {
  if (value == null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M€`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K€`;
  return `${value.toLocaleString('es-ES')}€`;
};

const formatRange = (min: number | null, max: number | null) => {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  if (min != null) return `≥ ${formatCurrency(min)}`;
  return `≤ ${formatCurrency(max)}`;
};

const formatMargin = (v: number | null) => (v != null ? `${v.toFixed(1)}%` : '—');

const ExpandableDescription: React.FC<{ text: string | null }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-muted-foreground">—</span>;
  const isLong = text.length > 80;
  return (
    <div className="max-w-[300px]">
      <p className={`text-xs ${!expanded && isLong ? 'line-clamp-2' : ''}`}>{text}</p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary hover:underline mt-0.5 flex items-center gap-0.5">
          {expanded ? <><ChevronUp className="h-3 w-3" /> Menos</> : <><ChevronDown className="h-3 w-3" /> Más</>}
        </button>
      )}
    </div>
  );
};

export default function OportunidadesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rod-opportunities-full'],
    queryFn: async () => {
      const { data: mandatos, error: mErr } = await supabase
        .from('mandatos')
        .select('id, codigo, tipo, pipeline_stage')
        .eq('visible_en_rod', true)
        .order('tipo')
        .order('pipeline_stage');

      if (mErr) throw mErr;
      if (!mandatos?.length) return [];

      const ids = mandatos.map(m => m.id);
      const { data: datos, error: dErr } = await supabase
        .from('datos_proyecto')
        .select('mandato_id, project_number, project_name, sector, ubicacion, revenue_amount, ebitda_amount, ebitda_margin, rango_facturacion_min, rango_facturacion_max, rango_ebitda_min, rango_ebitda_max, sectores_target, short_description, short_description_en, description, description_en')
        .in('mandato_id', ids);

      if (dErr) throw dErr;

      const datosMap = new Map((datos || []).map(d => [d.mandato_id, d]));
      return mandatos.map(m => ({ ...m, ...(datosMap.get(m.id) || {}) })) as Opportunity[];
    },
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(o =>
      (o.project_name || '').toLowerCase().includes(q) ||
      (o.project_number || o.codigo || '').toLowerCase().includes(q) ||
      (o.sector || '').toLowerCase().includes(q) ||
      (o.ubicacion || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const sellSide = filtered.filter(o => o.tipo === 'venta');
  const buySide = filtered.filter(o => o.tipo === 'compra');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Relación de Oportunidades
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mandatos visibles en ROD · {filtered.length} operaciones activas
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, sector, ubicación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="sell" className="w-full">
        <TabsList>
          <TabsTrigger value="sell" className="text-sm">
            Sell-Side ({sellSide.length})
          </TabsTrigger>
          <TabsTrigger value="buy" className="text-sm">
            Buy-Side ({buySide.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="mt-4">
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sell-Side</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sellSide.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 pb-4">No hay operaciones sell-side visibles.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[80px]">Nº Proy.</TableHead>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Sector</TableHead>
                        <TableHead className="text-xs">Ubicación</TableHead>
                        <TableHead className="text-xs text-right">Facturación</TableHead>
                        <TableHead className="text-xs text-right">EBITDA</TableHead>
                        <TableHead className="text-xs text-right">Margen</TableHead>
                        <TableHead className="text-xs">Fase</TableHead>
                        <TableHead className="text-xs">Desc. Breve</TableHead>
                        <TableHead className="text-xs">Desc. Extensa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellSide.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-medium">{o.project_number || o.codigo}</TableCell>
                          <TableCell className="text-xs font-medium">{o.project_name || '—'}</TableCell>
                          <TableCell className="text-xs">{o.sector || '—'}</TableCell>
                          <TableCell className="text-xs">{o.ubicacion || '—'}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(o.revenue_amount)}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(o.ebitda_amount)}</TableCell>
                          <TableCell className="text-xs text-right">{formatMargin(o.ebitda_margin)}</TableCell>
                          <TableCell className="text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${STAGE_COLORS[o.pipeline_stage] || 'bg-muted text-muted-foreground'}`}>
                              {STAGE_LABELS[o.pipeline_stage] || o.pipeline_stage}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <ExpandableDescription text={o.short_description} />
                          </TableCell>
                          <TableCell className="text-xs">
                            <ExpandableDescription text={o.description} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy" className="mt-4">
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Buy-Side</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {buySide.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 pb-4">No hay operaciones buy-side visibles.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[80px]">Nº Proy.</TableHead>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Sector</TableHead>
                        <TableHead className="text-xs">Ubicación</TableHead>
                        <TableHead className="text-xs">Rango Fact.</TableHead>
                        <TableHead className="text-xs">Rango EBITDA</TableHead>
                        <TableHead className="text-xs">Sectores Target</TableHead>
                        <TableHead className="text-xs">Fase</TableHead>
                        <TableHead className="text-xs">Desc. Breve</TableHead>
                        <TableHead className="text-xs">Desc. Extensa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buySide.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-medium">{o.project_number || o.codigo}</TableCell>
                          <TableCell className="text-xs font-medium">{o.project_name || '—'}</TableCell>
                          <TableCell className="text-xs">{o.sector || '—'}</TableCell>
                          <TableCell className="text-xs">{o.ubicacion || '—'}</TableCell>
                          <TableCell className="text-xs">{formatRange(o.rango_facturacion_min, o.rango_facturacion_max)}</TableCell>
                          <TableCell className="text-xs">{formatRange(o.rango_ebitda_min, o.rango_ebitda_max)}</TableCell>
                          <TableCell className="text-xs max-w-[150px]">
                            {o.sectores_target?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {o.sectores_target.slice(0, 3).map((s, i) => (
                                  <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                                ))}
                                {o.sectores_target.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground">+{o.sectores_target.length - 3}</span>
                                )}
                              </div>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${STAGE_COLORS[o.pipeline_stage] || 'bg-muted text-muted-foreground'}`}>
                              {STAGE_LABELS[o.pipeline_stage] || o.pipeline_stage}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <ExpandableDescription text={o.short_description} />
                          </TableCell>
                          <TableCell className="text-xs">
                            <ExpandableDescription text={o.description} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
