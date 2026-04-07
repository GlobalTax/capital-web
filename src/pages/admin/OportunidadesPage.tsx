import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Loader2, Search, ChevronDown, ChevronRight, Star, FileText, Users, Send } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const LazyRODDocumentsManager = lazy(() => import('@/components/admin/RODDocumentsManager').then(m => ({ default: m.RODDocumentsManager })));
const LazyRODListsTab = lazy(() => import('@/components/admin/rod/RODListsTab').then(m => ({ default: m.RODListsTab })));
const LazyRODSendsTab = lazy(() => import('@/components/admin/rod/RODSendsTab').then(m => ({ default: m.RODSendsTab })));


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
  description: string | null;
  description_en: string | null;
  is_favorite: boolean;
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

/** Star toggle button */
const FavoriteToggle: React.FC<{ id: string; isFavorite: boolean; onToggle: (id: string, value: boolean) => void }> = ({ id, isFavorite, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(id, !isFavorite); }}
    className="p-0.5 rounded hover:bg-muted transition-colors"
    title={isFavorite ? 'Quitar de destacados' : 'Marcar como destacado'}
  >
    <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
  </button>
);

/** Row for Sell-Side with expandable descriptions */
const SellRow: React.FC<{ o: Opportunity; onToggleFav: (id: string, value: boolean) => void }> = ({ o, onToggleFav }) => {
  const [open, setOpen] = useState(false);
  const hasDesc = !!(o.short_description || o.description);
  const sellColCount = 9;

  return (
    <>
      <TableRow
        className={hasDesc ? 'cursor-pointer hover:bg-muted/50' : ''}
        onClick={() => hasDesc && setOpen(!open)}
      >
        <TableCell className="text-xs w-6 px-2">
          {hasDesc && (open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />)}
        </TableCell>
        <TableCell className="text-xs w-8 px-2">
          <FavoriteToggle id={o.id} isFavorite={o.is_favorite} onToggle={onToggleFav} />
        </TableCell>
        <TableCell className="text-xs font-medium">{o.project_number || o.codigo}</TableCell>
        <TableCell className="text-xs font-medium">{o.project_name || '—'}</TableCell>
        <TableCell className="text-xs">{o.sector || '—'}</TableCell>
        <TableCell className="text-xs">{o.ubicacion || '—'}</TableCell>
        <TableCell className="text-xs text-right">{formatCurrency(o.revenue_amount)}</TableCell>
        <TableCell className="text-xs text-right">{formatCurrency(o.ebitda_amount)}</TableCell>
        <TableCell className="text-xs text-right">{formatMargin(o.ebitda_margin)}</TableCell>
        <TableCell className="text-xs">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${ESTADO_COLORS[o.estado || ''] || 'bg-muted text-muted-foreground'}`}>
            {ESTADO_LABELS[o.estado || ''] || o.estado || '—'}
          </span>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={sellColCount + 1} className="py-3 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {o.short_description && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Descripción breve</p>
                  <p className="text-xs leading-relaxed">{o.short_description}</p>
                </div>
              )}
              {o.description && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Descripción extensa</p>
                  <p className="text-xs leading-relaxed whitespace-pre-line">{o.description}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default function OportunidadesPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rod-opportunities-full'],
    queryFn: async () => {
      const { data: mandatos, error: mErr } = await supabase
        .from('mandatos')
        .select('id, codigo, tipo, is_favorite')
        .eq('visible_en_rod', true)
        .order('tipo');

      if (mErr) throw mErr;
      if (!mandatos?.length) return [];

      const ids = mandatos.map(m => m.id);
      const { data: datos, error: dErr } = await supabase
        .from('datos_proyecto')
        .select('mandato_id, project_number, project_name, sector, ubicacion, revenue_amount, ebitda_amount, ebitda_margin, rango_facturacion_min, rango_facturacion_max, rango_ebitda_min, rango_ebitda_max, sectores_target, short_description, short_description_en, description, description_en, estado')
        .in('mandato_id', ids);

      if (dErr) throw dErr;

      const datosMap = new Map((datos || []).map(d => [d.mandato_id, d]));
      return mandatos.map(m => {
        const d = datosMap.get(m.id) || {};
        return { ...m, is_favorite: m.is_favorite ?? false, ...d } as Opportunity;
      });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from('mandatos')
        .update({ is_favorite: value })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { value }) => {
      queryClient.invalidateQueries({ queryKey: ['rod-opportunities-full'] });
      toast.success(value ? 'Marcado como destacado' : 'Destacado eliminado');
    },
    onError: () => {
      toast.error('Error al actualizar destacado');
    },
  });

  const handleToggleFav = (id: string, value: boolean) => {
    toggleFavorite.mutate({ id, value });
  };

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('rod-oportunidades-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'datos_proyecto' }, () => {
        queryClient.invalidateQueries({ queryKey: ['rod-opportunities-full'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mandatos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['rod-opportunities-full'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
            Mandatos visibles en el ROD ({(sellSide.length + buySide.length)} activos) — actualización en tiempo real
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyecto, sector..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="sell" className="w-full">
        <TabsList>
          <TabsTrigger value="sell" className="text-xs">
            Sell-Side ({sellSide.length})
          </TabsTrigger>
          <TabsTrigger value="buy" className="text-xs">
            Buy-Side ({buySide.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            <FileText className="h-3.5 w-3.5 mr-1" />
            Documentos ROD
          </TabsTrigger>
          <TabsTrigger value="lists" className="text-xs">
            <Users className="h-3.5 w-3.5 mr-1" />
            Listados ROD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sell">
          <Card>
            <CardContent className="p-0">
              {sellSide.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No hay operaciones sell-side visibles.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                       <TableRow>
                        <TableHead className="text-xs w-6 px-2" />
                        <TableHead className="text-xs w-8 px-2"><Star className="h-3.5 w-3.5 text-muted-foreground" /></TableHead>
                        <TableHead className="text-xs w-[80px]">Nº Proy.</TableHead>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Sector</TableHead>
                        <TableHead className="text-xs">Ubicación</TableHead>
                        <TableHead className="text-xs text-right">Facturación</TableHead>
                        <TableHead className="text-xs text-right">EBITDA</TableHead>
                        <TableHead className="text-xs text-right">Margen</TableHead>
                        <TableHead className="text-xs">Fase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellSide.map(o => <SellRow key={o.id} o={o} onToggleFav={handleToggleFav} />)}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy">
          <Card>
            <CardContent className="p-0">
              {buySide.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No hay operaciones buy-side visibles.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-8 px-2"><Star className="h-3.5 w-3.5 text-muted-foreground" /></TableHead>
                        <TableHead className="text-xs w-[80px]">Nº Proy.</TableHead>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Sector</TableHead>
                        <TableHead className="text-xs">Ubicación</TableHead>
                        <TableHead className="text-xs">Rango Fact.</TableHead>
                        <TableHead className="text-xs">Rango EBITDA</TableHead>
                        <TableHead className="text-xs">Sectores Target</TableHead>
                        <TableHead className="text-xs">Fase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buySide.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs w-8 px-2">
                            <FavoriteToggle id={o.id} isFavorite={o.is_favorite} onToggle={handleToggleFav} />
                          </TableCell>
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
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${ESTADO_COLORS[o.estado || ''] || 'bg-muted text-muted-foreground'}`}>
                              {ESTADO_LABELS[o.estado || ''] || o.estado || '—'}
                            </span>
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

        <TabsContent value="documents">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }>
            <LazyRODDocumentsManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="lists">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }>
            <LazyRODListsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
