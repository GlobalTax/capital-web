import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Check, List, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';

interface ImportFromListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  existingCompanies: CampaignCompany[];
  onImported: () => void;
}

export function ImportFromListDialog({ open, onOpenChange, campaignId, existingCompanies, onImported }: ImportFromListDialogProps) {
  const [selectedListId, setSelectedListId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeContacted, setExcludeContacted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'choose' | 'dedup'>('choose');
  const [dedupResult, setDedupResult] = useState<{\
    newCompanies: any[];
    existingInTarget: any[];
    contactedInOther: { company: any; campaigns: string[] }[];
  } | null>(null);

  // Fetch lists
  const { data: lists = [] } = useQuery({
    queryKey: ['outbound-lists-for-campaign-import'],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('outbound_lists')
        .select('id, name, sector, contact_count')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as { id: string; name: string; sector: string | null; contact_count: number }[];
    },
  });

  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return lists;
    const q = searchQuery.toLowerCase();
    return lists.filter(l => l.name.toLowerCase().includes(q) || (l.sector || '').toLowerCase().includes(q));
  }, [lists, searchQuery]);

  const handleCheckDedup = async () => {
    if (!selectedListId) return;
    setIsLoading(true);
    try {
      // Fetch all companies from the selected list (paginated)
      const PAGE = 1000;
      let allListCompanies: any[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await (supabase as any)
          .from('outbound_list_companies')
          .select('*')
          .eq('list_id', selectedListId)
          .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allListCompanies.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
      }

      // Existing CIFs in this campaign
      const existingCifs = new Set(
        existingCompanies.filter(c => c.client_cif).map(c => c.client_cif!.toUpperCase().trim())
      );

      // Check cross-campaign
      const listCifs = allListCompanies.map(c => c.cif).filter(Boolean);
      const crossCampaignMap = new Map<string, Set<string>>();

      if (listCifs.length > 0) {
        const BATCH = 500;
        for (let i = 0; i < listCifs.length; i += BATCH) {
          const batch = listCifs.slice(i, i + BATCH);
          const { data } = await (supabase as any)
            .from('valuation_campaign_companies')
            .select('client_cif, campaign_id, valuation_campaigns!inner(name)')
            .in('client_cif', batch);
          if (data) {
            for (const row of data) {
              const cif = (row.client_cif || '').toUpperCase().trim();
              if (!cif || row.campaign_id === campaignId) continue;
              if (!crossCampaignMap.has(cif)) crossCampaignMap.set(cif, new Set());
              crossCampaignMap.get(cif)!.add(row.valuation_campaigns?.name || '');
            }
          }
        }
      }

      const newCompanies: any[] = [];
      const existingInTarget: any[] = [];
      const contactedInOther: { company: any; campaigns: string[] }[] = [];

      for (const c of allListCompanies) {
        const cifKey = (c.cif || '').toUpperCase().trim();
        if (cifKey && existingCifs.has(cifKey)) {
          existingInTarget.push(c);
        } else {
          if (cifKey && crossCampaignMap.has(cifKey)) {
            contactedInOther.push({ company: c, campaigns: Array.from(crossCampaignMap.get(cifKey)!) });
          }
          newCompanies.push(c);
        }
      }

      setDedupResult({ newCompanies, existingInTarget, contactedInOther });
      setStep('dedup');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!dedupResult) return;
    setIsLoading(true);
    try {
      let toInsert = dedupResult.newCompanies;
      if (excludeContacted) {
        const contactedCifs = new Set(dedupResult.contactedInOther.map(c => (c.company.cif || '').toUpperCase().trim()));
        toInsert = toInsert.filter(c => !contactedCifs.has((c.cif || '').toUpperCase().trim()));
      }

      const BATCH = 100;
      let inserted = 0;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH).map(c => ({
          campaign_id: campaignId,
          client_company: c.empresa,
          client_name: c.contacto || null,
          client_email: c.email || null,
          client_phone: c.telefono || null,
          client_cif: c.cif || null,
          client_website: c.web || null,
          client_provincia: c.provincia || null,
          revenue: c.facturacion || 0,
          ebitda: c.ebitda || 0,
          source: 'list_import',
        }));
        const { error } = await (supabase as any)
          .from('valuation_campaign_companies')
          .insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }

      // Update source_list_id
      await (supabase as any)
        .from('valuation_campaigns')
        .update({ source_list_id: selectedListId })
        .eq('id', campaignId)
        .is('source_list_id', null);

      toast.success(`${inserted} empresas importadas desde la lista`);
      onImported();
      handleClose();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('choose');
    setDedupResult(null);
    setSelectedListId('');
    setExcludeContacted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Importar desde lista de contacto
          </DialogTitle>
        </DialogHeader>

        {step === 'choose' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lista..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="max-h-[250px] overflow-y-auto border rounded-md">
              {filteredLists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay listas</p>
              ) : (
                filteredLists.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedListId(l.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between ${selectedListId === l.id ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                  >
                    <div>
                      <span className="font-medium">{l.name}</span>
                      {l.sector && <span className="text-muted-foreground ml-2">· {l.sector}</span>}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {l.contact_count} emp.
                    </Badge>
                  </button>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleCheckDedup} disabled={!selectedListId || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Verificar duplicados
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'dedup' && dedupResult && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{dedupResult.newCompanies.length - (excludeContacted ? dedupResult.contactedInOther.length : 0)} nuevas — se añadirán</span>
              </div>
              {dedupResult.existingInTarget.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-700">{dedupResult.existingInTarget.length} ya en esta campaña — se omitirán</span>
                </div>
              )}
              {dedupResult.contactedInOther.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-700">{dedupResult.contactedInOther.length} contactadas en otras campañas</span>
                  </div>
                  <div className="ml-6 text-xs text-muted-foreground max-h-[80px] overflow-y-auto space-y-0.5">
                    {dedupResult.contactedInOther.slice(0, 5).map((item, i) => (
                      <p key={i}><span className="font-medium">{item.company.empresa}</span> → {item.campaigns.join(', ')}</p>
                    ))}
                    {dedupResult.contactedInOther.length > 5 && <p className="italic">...y {dedupResult.contactedInOther.length - 5} más</p>}
                  </div>
                  <label className="flex items-center gap-2 ml-6">
                    <Checkbox checked={excludeContacted} onCheckedChange={(v) => setExcludeContacted(!!v)} />
                    <span className="text-sm">Excluir contactadas previamente</span>
                  </label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setStep('choose'); setDedupResult(null); }}>Volver</Button>
              <Button onClick={handleConfirm} disabled={isLoading || dedupResult.newCompanies.length === 0}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Importar {dedupResult.newCompanies.length - (excludeContacted ? dedupResult.contactedInOther.length : 0)} empresas
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
