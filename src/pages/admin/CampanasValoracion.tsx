import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Plus, Megaphone, Building2, Mail, TrendingUp, Trash2, Edit, Copy, Search, AlertTriangle, Pencil, Check, X, FileText, ArrowRightLeft, List, FolderOpen, FolderClosed, ChevronRight, LayoutList, FolderTree } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  processing: { label: 'Procesando', variant: 'default' },
  completed: { label: 'Completada', variant: 'outline' },
  paused: { label: 'Pausada', variant: 'destructive' },
};

export default function CampanasValoracion() {
  const navigate = useNavigate();
  const { campaigns, isLoading, deleteCampaign, isDeleting, duplicateCampaign, isDuplicating, updateCampaign } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'valuation' | 'document'>('valuation');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>(() => {
    return (localStorage.getItem('campanas-view-mode') as 'flat' | 'grouped') || 'grouped';
  });
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [foldersInitialized, setFoldersInitialized] = useState(false);

  useEffect(() => {
    if (editingNameId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingNameId]);

  const handleRenameSubmit = async (id: string) => {
    const trimmed = editingNameValue.trim();
    if (trimmed && trimmed !== campaigns.find(c => c.id === id)?.name) {
      await updateCampaign({ id, data: { name: trimmed } });
    }
    setEditingNameId(null);
  };

  // Fetch operational stage per campaign
  const campaignIds = campaigns.map(c => c.id);
  const { data: stageData } = useQuery({
    queryKey: ['campaign-stages', campaignIds.join(',')],
    queryFn: async () => {
      if (campaignIds.length === 0) return {};

      // Get emails sent per campaign
      const { data: emailCounts } = await (supabase as any)
        .from('campaign_emails')
        .select('campaign_id, status')
        .in('campaign_id', campaignIds)
        .eq('status', 'sent');

      // Get followup sends with sequence numbers
      const { data: followupData } = await (supabase as any)
        .from('campaign_followup_sends')
        .select('company_id, status, sequence_id, campaign_followup_sequences!inner(campaign_id, sequence_number)')
        .in('campaign_followup_sequences.campaign_id', campaignIds)
        .eq('status', 'sent');

      const stages: Record<string, { emailsSent: number; maxFollowup: number }> = {};
      for (const id of campaignIds) {
        stages[id] = { emailsSent: 0, maxFollowup: 0 };
      }

      for (const e of (emailCounts || [])) {
        if (stages[e.campaign_id]) stages[e.campaign_id].emailsSent++;
      }

      for (const f of (followupData || [])) {
        const campId = f.campaign_followup_sequences?.campaign_id;
        const seqNum = f.campaign_followup_sequences?.sequence_number || 0;
        if (campId && stages[campId]) {
          stages[campId].maxFollowup = Math.max(stages[campId].maxFollowup, seqNum);
        }
      }

      return stages;
    },
    enabled: campaignIds.length > 0,
  });

  // Fetch source list names
  const sourceListIds = campaigns.filter(c => (c as any).source_list_id).map(c => (c as any).source_list_id as string);
  const { data: sourceListNames } = useQuery({
    queryKey: ['source-list-names', sourceListIds.join(',')],
    queryFn: async () => {
      if (sourceListIds.length === 0) return {} as Record<string, string>;
      const unique = [...new Set(sourceListIds)];
      const { data, error } = await (supabase as any)
        .from('outbound_lists')
        .select('id, name')
        .in('id', unique);
      if (error) return {} as Record<string, string>;
      const map: Record<string, string> = {};
      for (const l of (data || [])) map[l.id] = l.name;
      return map;
    },
    enabled: sourceListIds.length > 0,
  });

  const getStageLabel = (campaignId: string): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const stage = stageData?.[campaignId];
    if (!stage || stage.emailsSent === 0) return { label: 'Borrador', variant: 'secondary' };
    if (stage.maxFollowup > 0) return { label: `Follow Up ${stage.maxFollowup}`, variant: 'default' };
    return { label: '1r Envío', variant: 'outline' };
  };

  const campaignsByType = useMemo(() => {
    return campaigns.filter(c => (c as any).campaign_type === activeTab || (!((c as any).campaign_type) && activeTab === 'valuation'));
  }, [campaigns, activeTab]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaignsByType;
    const q = searchQuery.toLowerCase();
    return campaignsByType.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.sector?.toLowerCase().includes(q)
    );
  }, [campaignsByType, searchQuery]);

  // Group campaigns by sector
  const groupedCampaigns = useMemo(() => {
    const groups = new Map<string, typeof filteredCampaigns>();
    for (const c of filteredCampaigns) {
      const key = c.sector?.trim() || 'Sin sector';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return [...groups.entries()].sort((a, b) => {
      if (a[0] === 'Sin sector') return 1;
      if (b[0] === 'Sin sector') return -1;
      return a[0].localeCompare(b[0], 'es');
    });
  }, [filteredCampaigns]);

  useEffect(() => {
    if (groupedCampaigns.length > 0 && !foldersInitialized) {
      setOpenFolders(new Set(groupedCampaigns.map(([key]) => key)));
      setFoldersInitialized(true);
    }
  }, [groupedCampaigns, foldersInitialized]);

  const toggleFolder = useCallback((key: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === 'flat' ? 'grouped' : 'flat';
      localStorage.setItem('campanas-view-mode', next);
      return next;
    });
  }, []);

  const totalCompanies = campaignsByType.reduce((s, c) => s + c.total_companies, 0);
  const totalSent = campaignsByType.reduce((s, c) => s + (stageData?.[c.id]?.emailsSent ?? c.total_sent), 0);
  const totalValuation = campaignsByType.reduce((s, c) => s + c.total_valuation, 0);


  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Campañas Outbound
          </h1>
          <p className="text-muted-foreground mt-1">Campañas masivas de valoración y documentos por sector</p>
        </div>
        <Button onClick={() => navigate(`/admin/campanas-valoracion/nueva?type=${activeTab}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'valuation' | 'document')}>
        <TabsList>
          <TabsTrigger value="valuation" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Valoración
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Documento PDF
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className={`grid grid-cols-1 gap-4 ${activeTab === 'valuation' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Campañas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaignsByType.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Building2 className="h-4 w-4" />Empresas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalCompanies}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Mail className="h-4 w-4" />Enviadas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalSent}</p></CardContent>
        </Card>
        {activeTab === 'valuation' && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" />Valor Total</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrencyEUR(totalValuation)}</p></CardContent>
          </Card>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Button
              variant={viewMode === 'grouped' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={toggleViewMode}
              title={viewMode === 'grouped' ? 'Vista plana' : 'Agrupar por sector'}
            >
              {viewMode === 'grouped' ? <FolderTree className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
              {viewMode === 'grouped' ? 'Por sector' : 'Lista'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay campañas</h3>
              <p className="text-sm text-muted-foreground mt-1">Crea tu primera campaña de valoración outbound</p>
              <Button className="mt-4" onClick={() => navigate('/admin/campanas-valoracion/nueva')}>
                <Plus className="h-4 w-4 mr-2" />Nueva Campaña
              </Button>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No se encontraron campañas</div>
          ) : viewMode === 'flat' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-center">Empresas</TableHead>
                  <TableHead className="text-center">Enviadas</TableHead>
                  {activeTab === 'valuation' && <TableHead className="text-right">Valor Total</TableHead>}
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((c) => renderCampaignRow(c, true))}
              </TableBody>
            </Table>
          ) : (
            <div className="divide-y divide-border">
              {groupedCampaigns.map(([sectorName, sectorCampaigns]) => {
                const isOpen = openFolders.has(sectorName);
                const folderCompanies = sectorCampaigns.reduce((s, c) => s + c.total_companies, 0);
                const folderSent = sectorCampaigns.reduce((s, c) => s + (stageData?.[c.id]?.emailsSent ?? c.total_sent), 0);
                return (
                  <Collapsible key={sectorName} open={isOpen} onOpenChange={() => toggleFolder(sectorName)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left">
                        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                        {isOpen ? <FolderOpen className="h-4 w-4 text-primary shrink-0" /> : <FolderClosed className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <span className="font-medium text-sm">{sectorName}</span>
                        <Badge variant="secondary" size="sm" className="ml-1">{sectorCampaigns.length}</Badge>
                        <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{folderCompanies}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{folderSent}</span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 pr-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Campaña</TableHead>
                              <TableHead className="text-center">Empresas</TableHead>
                              <TableHead className="text-center">Enviadas</TableHead>
                              {activeTab === 'valuation' && <TableHead className="text-right">Valor Total</TableHead>}
                              <TableHead className="text-center">Estado</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sectorCampaigns.map((c) => renderCampaignRow(c, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar campaña
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  ¿Estás seguro de que quieres eliminar <strong>"{deleteTarget?.name}"</strong>? Se borrarán todas las empresas, valoraciones, emails y follow ups asociados. Esta acción no se puede deshacer.
                </p>
                <p className="text-sm">
                  Escribe <strong className="text-destructive">CONFIRMAR</strong> para proceder:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Escribe CONFIRMAR"
                  className="text-sm"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmText !== 'CONFIRMAR'}
              onClick={() => {
                if (deleteTarget) deleteCampaign(deleteTarget.id);
                setDeleteTarget(null);
                setDeleteConfirmText('');
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
