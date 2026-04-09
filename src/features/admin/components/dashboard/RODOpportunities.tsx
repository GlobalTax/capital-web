import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, ShoppingCart, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Opportunity {
  id: string;
  codigo: string;
  tipo: string;
  estado: string | null;
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
}

const ESTADO_LABELS: Record<string, string> = {
  'en_preparacion': 'En Preparación',
  'go_to_market': 'Go to Market',
  'negociacion_y_cierre': 'Negociación y Cierre',
};

const ESTADO_COLORS: Record<string, string> = {
  'en_preparacion': 'bg-blue-100 text-blue-800',
  'go_to_market': 'bg-green-100 text-green-800',
  'negociacion_y_cierre': 'bg-amber-100 text-amber-800',
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

export const RODOpportunities: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rod-opportunities'],
    queryFn: async () => {
      const { data: mandatos, error: mErr } = await supabase
        .from('mandatos')
        .select('id, codigo, tipo')
        .eq('visible_en_rod', true)
        .order('tipo');

      if (mErr) throw mErr;
      if (!mandatos?.length) return [];

      const ids = mandatos.map(m => m.id);
      const { data: datos, error: dErr } = await supabase
        .from('datos_proyecto')
        .select('mandato_id, project_number, project_name, sector, ubicacion, revenue_amount, ebitda_amount, ebitda_margin, rango_facturacion_min, rango_facturacion_max, rango_ebitda_min, rango_ebitda_max, sectores_target, short_description, short_description_en, estado')
        .in('mandato_id', ids);

      if (dErr) throw dErr;

      const datosMap = new Map((datos || []).map(d => [d.mandato_id, d]));
      return mandatos.map(m => ({ ...m, ...(datosMap.get(m.id) || {}) })) as Opportunity[];
    },
  });

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('rod-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'datos_proyecto' }, () => {
        queryClient.invalidateQueries({ queryKey: ['rod-opportunities'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mandatos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['rod-opportunities'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const sellSide = data?.filter(o => o.tipo === 'venta') || [];
  const buySide = data?.filter(o => o.tipo === 'compra') || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Relación de Oportunidades
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mandatos visibles en el ROD ({(sellSide.length + buySide.length)} activos) — tiempo real
        </p>
      </div>

      {/* Sell-Side */}
      <Card>
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sell-Side</Badge>
            <span className="text-muted-foreground text-sm font-normal">({sellSide.length})</span>
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
                    <TableHead className="text-xs max-w-[200px]">Descripción</TableHead>
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
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${ESTADO_COLORS[o.estado || ''] || 'bg-muted text-muted-foreground'}`}>
                          {ESTADO_LABELS[o.estado || ''] || o.estado || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={o.short_description || ''}>
                        {o.short_description || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buy-Side */}
      <Card>
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Buy-Side</Badge>
            <span className="text-muted-foreground text-sm font-normal">({buySide.length})</span>
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
                    <TableHead className="text-xs max-w-[200px]">Descripción</TableHead>
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
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${ESTADO_COLORS[o.estado || ''] || 'bg-muted text-muted-foreground'}`}>
                          {ESTADO_LABELS[o.estado || ''] || o.estado || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={o.short_description || ''}>
                        {o.short_description || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
