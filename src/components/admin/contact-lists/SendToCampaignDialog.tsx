import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Check, Loader2, Megaphone, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContactListCompany } from '@/hooks/useContactLists';

interface SendToCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: ContactListCompany[];
  listId: string;
  listName: string;
}

interface DeduplicationResult {
  newCompanies: ContactListCompany[];
  existingInTarget: ContactListCompany[];
  contactedInOther: { company: ContactListCompany; campaigns: string[] }[];
}

/**
 * Maps outbound_list_companies fields → valuation_campaign_companies fields
 */
function mapListCompanyToCampaign(c: ContactListCompany, campaignId: string) {
  return {
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
  };
}

export function SendToCampaignDialog({ open, onOpenChange, companies, listId, listName }: SendToCampaignDialogProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeContacted, setExcludeContacted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dedupResult, setDedupResult] = useState<DeduplicationResult | null>(null);
  const [step, setStep] = useState<'choose' | 'dedup'>('choose');

  // Fetch campaigns list
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-for-list-send'],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name, campaign_type, total_companies')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as { id: string; name: string; campaign_type: string; total_companies: number }[];
    },
  });

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(c => c.name.toLowerCase().includes(q));
  }, [campaigns, searchQuery]);

  const targetCampaignId = mode === 'select' ? selectedCampaignId : null;

  // Run deduplication check
  const handleCheckDedup = async () => {
    setIsLoading(true);
    try {
      const cifs = companies.map(c => c.cif).filter(Boolean) as string[];
      const emails = companies.map(c => c.email).filter(Boolean) as string[];

      // 1. Check target campaign (if existing)
      let existingCifs = new Set<string>();
      if (targetCampaignId) {
        const { data } = await (supabase as any)
          .from('valuation_campaign_companies')
          .select('client_cif')
          .eq('campaign_id', targetCampaignId)
          .in('client_cif', cifs.length > 0 ? cifs : ['__none__']);
        if (data) {
          existingCifs = new Set(data.map((r: any) => (r.client_cif || '').toUpperCase().trim()));
        }
      }

      // 2. Check ALL campaigns for cross-campaign duplicates (by CIF and email)
      let crossCampaignMap = new Map<string, Set<string>>(); // cif → campaign names
      if (cifs.length > 0) {
        // Paginate to handle large sets
        const PAGE = 500;
        for (let i = 0; i < cifs.length; i += PAGE) {
          const batch = cifs.slice(i, i + PAGE);
          const { data } = await (supabase as any)
            .from('valuation_campaign_companies')
            .select('client_cif, campaign_id, valuation_campaigns!inner(name)')
            .in('client_cif', batch);
          if (data) {
            for (const row of data) {
              const cif = (row.client_cif || '').toUpperCase().trim();
              if (!cif) continue;
              // Skip if it's the target campaign
              if (row.campaign_id === targetCampaignId) continue;
              if (!crossCampaignMap.has(cif)) crossCampaignMap.set(cif, new Set());
              crossCampaignMap.get(cif)!.add(row.valuation_campaigns?.name || 'Campaña desconocida');
            }
          }
        }
      }

      // 3. Categorize companies
      const newCompanies: ContactListCompany[] = [];
      const existingInTarget: ContactListCompany[] = [];
      const contactedInOther: { company: ContactListCompany; campaigns: string[] }[] = [];

      for (const c of companies) {
        const cifKey = (c.cif || '').toUpperCase().trim();
        if (cifKey && existingCifs.has(cifKey)) {
          existingInTarget.push(c);
        } else if (cifKey && crossCampaignMap.has(cifKey)) {
          contactedInOther.push({ company: c, campaigns: Array.from(crossCampaignMap.get(cifKey)!) });
          // Also add as "new" since they're not in the target
          newCompanies.push(c);
        } else {
          newCompanies.push(c);
        }
      }

      setDedupResult({ newCompanies, existingInTarget, contactedInOther });
      setStep('dedup');
    } catch (err: any) {
      toast.error('Error al verificar duplicados: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute the import
  const handleConfirm = async () => {
    if (!dedupResult) return;
    setIsLoading(true);

    try {
      let campaignId = targetCampaignId;

      // Create new campaign if needed
      if (mode === 'new') {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await (supabase as any)
          .from('valuation_campaigns')
          .insert([{
            name: newCampaignName.trim(),
            sector: '',
            status: 'draft',
            source_list_id: listId,
            created_by: user?.id,
            lead_source: 'list_import',
            service_type: 'valuation',
            campaign_type: 'valuation',
          }])
          .select('id')
          .single();
        if (error) throw error;
        campaignId = data.id;
      } else if (campaignId) {
        // Update source_list_id on existing campaign if not set
        await (supabase as any)
          .from('valuation_campaigns')
          .update({ source_list_id: listId })
          .eq('id', campaignId)
          .is('source_list_id', null);
      }

      if (!campaignId) throw new Error('No se pudo obtener el ID de campaña');

      // Filter companies to insert
      let toInsert = dedupResult.newCompanies;
      if (excludeContacted) {
        const contactedCifs = new Set(dedupResult.contactedInOther.map(c => (c.company.cif || '').toUpperCase().trim()));
        toInsert = toInsert.filter(c => !contactedCifs.has((c.cif || '').toUpperCase().trim()));
      }

      // Insert in batches of 100
      const BATCH = 100;
      let inserted = 0;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH).map(c => mapListCompanyToCampaign(c, campaignId!));
        const { error } = await (supabase as any)
          .from('valuation_campaign_companies')
          .insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }

      // Register link in outbound_list_campaigns
      await (supabase as any)
        .from('outbound_list_campaigns')
        .insert([{
          list_id: listId,
          campaign_id: campaignId,
          campaign_nombre: mode === 'new' ? newCampaignName.trim() : campaigns.find(c => c.id === campaignId)?.name,
          empresas_enviadas: inserted,
          notas: `Importación automática desde lista "${listName}"`,
        }]);

      toast.success(`${inserted} empresas añadidas a la campaña`);
      onOpenChange(false);

      // Navigate to the campaign
      if (mode === 'new') {
        navigate(`/admin/campanas-valoracion/${campaignId}`);
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('choose');
    setDedupResult(null);
    setMode('select');
    setSelectedCampaignId('');
    setNewCampaignName('');
    setExcludeContacted(false);
    onOpenChange(false);
  };

  const canProceed = mode === 'new' ? newCampaignName.trim().length > 0 : !!selectedCampaignId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Enviar a campaña Outbound
          </DialogTitle>
        </DialogHeader>

        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {companies.length} empresa{companies.length !== 1 ? 's' : ''} seleccionada{companies.length !== 1 ? 's' : ''}
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('select')}
              >
                Campaña existente
              </Button>
              <Button
                variant={mode === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('new')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva campaña
              </Button>
            </div>

            {mode === 'select' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar campaña..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                  {filteredCampaigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay campañas</p>
                  ) : (
                    filteredCampaigns.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCampaignId(c.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between ${selectedCampaignId === c.id ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                      >
                        <span className="truncate">{c.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                          {c.total_companies} emp.
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm">Nombre de la nueva campaña</Label>
                <Input
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  placeholder="Ej: Sector Industrial Q1 2026"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleCheckDedup} disabled={!canProceed || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Verificar duplicados
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'dedup' && dedupResult && (
          <div className="space-y-4">
            {/* Dedup summary */}
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">{companies.length} empresas seleccionadas</p>

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
                  <div className="ml-6 text-xs text-muted-foreground max-h-[100px] overflow-y-auto space-y-0.5">
                    {dedupResult.contactedInOther.slice(0, 10).map((item, i) => (
                      <p key={i}>
                        <span className="font-medium">{item.company.empresa}</span>
                        {' → '}
                        {item.campaigns.join(', ')}
                      </p>
                    ))}
                    {dedupResult.contactedInOther.length > 10 && (
                      <p className="italic">...y {dedupResult.contactedInOther.length - 10} más</p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 ml-6">
                    <Checkbox
                      checked={excludeContacted}
                      onCheckedChange={(v) => setExcludeContacted(!!v)}
                    />
                    <span className="text-sm">Excluir contactadas previamente</span>
                  </label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setStep('choose'); setDedupResult(null); }}>
                Volver
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading || (dedupResult.newCompanies.length === 0 && dedupResult.contactedInOther.length === 0)}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Megaphone className="h-4 w-4 mr-1" />}
                Confirmar envío
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
