import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Merge, ArrowRight, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';
import { useNavigate } from 'react-router-dom';

interface EmpresaMergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa; // The current empresa (will be the target)
}

export const EmpresaMergeDialog: React.FC<EmpresaMergeDialogProps> = ({
  open,
  onOpenChange,
  empresa,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<Empresa | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search empresas
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['empresas-merge-search', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre, cif, sector, ubicacion, facturacion, ebitda, empleados, origen, source, sitio_web, descripcion')
        .neq('id', empresa.id)
        .or(`nombre.ilike.%${search}%,cif.ilike.%${search}%`)
        .limit(10);
      if (error) throw error;
      return (data || []) as Empresa[];
    },
    enabled: open && search.length >= 2,
  });

  // Compute merged preview
  const mergedPreview = useMemo(() => {
    if (!selectedSource) return null;
    const fields: { label: string; target: string; source: string; merged: string; fromSource: boolean }[] = [];
    
    const addField = (label: string, targetVal: any, sourceVal: any, formatter?: (v: any) => string) => {
      const fmt = formatter || ((v: any) => v?.toString() || '—');
      const merged = targetVal ?? sourceVal;
      fields.push({
        label,
        target: fmt(targetVal),
        source: fmt(sourceVal),
        merged: fmt(merged),
        fromSource: targetVal == null && sourceVal != null,
      });
    };

    addField('CIF', empresa.cif, selectedSource.cif);
    addField('Sector', empresa.sector, selectedSource.sector);
    addField('Ubicación', empresa.ubicacion, selectedSource.ubicacion);
    addField('Facturación', empresa.facturacion, selectedSource.facturacion, (v) => v ? formatCompactCurrency(v) : '—');
    addField('EBITDA', empresa.ebitda, selectedSource.ebitda, (v) => v ? formatCompactCurrency(v) : '—');
    addField('Empleados', empresa.empleados, selectedSource.empleados);
    addField('Web', empresa.sitio_web, selectedSource.sitio_web);
    addField('Origen', empresa.origen, selectedSource.origen);
    addField('Descripción', empresa.descripcion, selectedSource.descripcion, (v) => v ? (v.length > 50 ? v.slice(0, 50) + '...' : v) : '—');

    return fields;
  }, [empresa, selectedSource]);

  const handleMerge = async () => {
    if (!selectedSource) return;
    setIsMerging(true);
    try {
      const { data, error } = await supabase.rpc('merge_empresas', {
        p_target_id: empresa.id,
        p_source_id: selectedSource.id,
      });

      if (error) throw error;

      const result = data as any;
      const reassigned = result?.reassigned_tables || [];

      toast({
        title: '✅ Empresas fusionadas',
        description: `"${selectedSource.nombre}" fusionada en "${empresa.nombre}". ${reassigned.length > 0 ? `Vínculos reasignados: ${reassigned.join(', ')}` : 'Sin vínculos adicionales.'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-detail', empresa.id] });
      onOpenChange(false);
      setStep('search');
      setSelectedSource(null);
      setSearch('');
    } catch (err: any) {
      console.error('Merge error:', err);
      toast({
        title: 'Error al fusionar',
        description: err.message || 'No se pudo completar la fusión',
        variant: 'destructive',
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('search');
    setSelectedSource(null);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Fusionar Empresas
          </DialogTitle>
          <DialogDescription>
            Fusiona otra empresa en <strong>{empresa.nombre}</strong>. Se conservará este registro con el máximo de información y todos los vínculos.
          </DialogDescription>
        </DialogHeader>

        {step === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa duplicada por nombre o CIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <ScrollArea className="max-h-[300px]">
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {search.length >= 2 && !isSearching && searchResults?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No se encontraron empresas
                </p>
              )}
              {searchResults?.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setSelectedSource(e);
                    setStep('confirm');
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border flex items-center justify-between group mb-1"
                >
                  <div>
                    <div className="font-medium text-sm">{e.nombre}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {e.cif && <span>CIF: {e.cif}</span>}
                      {e.sector && <span>• {e.sector}</span>}
                      {e.facturacion && <span>• {formatCompactCurrency(e.facturacion)}</span>}
                      {e.origen && <Badge variant="outline" className="text-[10px] h-4">{e.origen}</Badge>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </ScrollArea>
          </div>
        )}

        {step === 'confirm' && selectedSource && mergedPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>"{selectedSource.nombre}"</strong> se eliminará y sus datos y vínculos se fusionarán en <strong>"{empresa.nombre}"</strong>.
              </span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-0 text-xs font-medium bg-muted/50 border-b">
                <div className="p-2 pl-3">Campo</div>
                <div className="p-2 text-center">🎯 Destino</div>
                <div className="p-2 text-center">📥 Origen</div>
                <div className="p-2 text-center">✨ Resultado</div>
              </div>
              <ScrollArea className="max-h-[250px]">
                {mergedPreview.map((field) => (
                  <div key={field.label} className="grid grid-cols-4 gap-0 text-xs border-b last:border-b-0">
                    <div className="p-2 pl-3 font-medium text-muted-foreground">{field.label}</div>
                    <div className="p-2 text-center truncate">{field.target}</div>
                    <div className="p-2 text-center truncate">{field.source}</div>
                    <div className={`p-2 text-center truncate flex items-center justify-center gap-1 ${field.fromSource ? 'text-green-700 font-medium' : ''}`}>
                      {field.fromSource && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                      {field.merged}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground">
              Los campos marcados con <CheckCircle2 className="h-3 w-3 inline text-green-600" /> se rellenarán desde el registro origen.
              Todos los contactos, mandatos, valoraciones, interacciones y demás vínculos se reasignarán automáticamente.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'confirm' && (
            <Button variant="outline" onClick={() => { setStep('search'); setSelectedSource(null); }}>
              Volver
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {step === 'confirm' && (
            <Button
              variant="destructive"
              onClick={handleMerge}
              disabled={isMerging}
            >
              {isMerging ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Fusionando...</>
              ) : (
                <><Merge className="h-4 w-4 mr-2" /> Fusionar</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
