// ============= CAMPAIGN MAPPING PANEL =============
// UI para vincular campañas de ads con patrones de lead forms
// Parte del sistema de consolidación de costes

import React, { useState, useMemo } from 'react';
import { 
  Link2, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  Loader2,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useCampaignMapping, CampaignWithMapping, CampaignLeadsMapping } from '@/hooks/useCampaignMapping';
import { useUnifiedCosts } from '@/hooks/useUnifiedCosts';

interface AddMappingDialogProps {
  open: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignName?: string;
  availableLeadForms: string[];
  availableCampaignNames: string[];
  onSubmit: (data: {
    campaign_id: string;
    lead_form_pattern?: string;
    campaign_name_pattern?: string;
    utm_campaign_pattern?: string;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
}

const AddMappingDialog: React.FC<AddMappingDialogProps> = ({
  open,
  onClose,
  campaignId,
  campaignName,
  availableLeadForms,
  availableCampaignNames,
  onSubmit,
  isSubmitting,
}) => {
  const [leadFormPattern, setLeadFormPattern] = useState('');
  const [campaignNamePattern, setCampaignNamePattern] = useState('');
  const [utmPattern, setUtmPattern] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!campaignId) return;
    
    if (!leadFormPattern && !campaignNamePattern && !utmPattern) {
      toast.error('Debes especificar al menos un patrón');
      return;
    }

    onSubmit({
      campaign_id: campaignId,
      lead_form_pattern: leadFormPattern || undefined,
      campaign_name_pattern: campaignNamePattern || undefined,
      utm_campaign_pattern: utmPattern || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setLeadFormPattern('');
    setCampaignNamePattern('');
    setUtmPattern('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Añadir Mapeo de Leads
          </DialogTitle>
          <DialogDescription>
            Vincula leads con la campaña "{campaignName}" usando patrones.
            Usa % como comodín (ej: form_nov_2025%).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Lead Form Pattern */}
          <div className="space-y-2">
            <Label>Patrón de Lead Form</Label>
            <div className="flex gap-2">
              <Input
                placeholder="form_nov_2025%"
                value={leadFormPattern}
                onChange={(e) => setLeadFormPattern(e.target.value)}
              />
              <Select onValueChange={setLeadFormPattern}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sugerencias" />
                </SelectTrigger>
                <SelectContent>
                  {availableLeadForms.slice(0, 10).map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Patrón para matching con company_valuations.lead_form
            </p>
          </div>

          {/* Campaign Name Pattern */}
          <div className="space-y-2">
            <Label>Patrón de Nombre de Campaña</Label>
            <div className="flex gap-2">
              <Input
                placeholder="%Valoración%"
                value={campaignNamePattern}
                onChange={(e) => setCampaignNamePattern(e.target.value)}
              />
              <Select onValueChange={setCampaignNamePattern}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Campañas" />
                </SelectTrigger>
                <SelectContent>
                  {availableCampaignNames.slice(0, 10).map((name) => (
                    <SelectItem key={name} value={`%${name.substring(0, 20)}%`}>
                      {name.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Patrón para matching con company_valuations.last_campaign_name
            </p>
          </div>

          {/* UTM Campaign Pattern */}
          <div className="space-y-2">
            <Label>Patrón de UTM Campaign</Label>
            <Input
              placeholder="%valoracion%"
              value={utmPattern}
              onChange={(e) => setUtmPattern(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Patrón para matching con company_valuations.utm_campaign
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              placeholder="Notas sobre este mapeo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Mapeo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Single campaign card with its mappings
interface CampaignMappingCardProps {
  campaign: CampaignWithMapping;
  onAddMapping: () => void;
  onToggleMapping: (id: string, isActive: boolean) => void;
  onDeleteMapping: (id: string) => void;
}

const CampaignMappingCard: React.FC<CampaignMappingCardProps> = ({
  campaign,
  onAddMapping,
  onToggleMapping,
  onDeleteMapping,
}) => {
  const [isOpen, setIsOpen] = useState(campaign.mappings.length > 0);
  const activeMappings = campaign.mappings.filter(m => m.is_active).length;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <CardTitle className="text-base">{campaign.name}</CardTitle>
                  {campaign.external_name && campaign.external_name !== campaign.name && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                      Meta: {campaign.external_name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={activeMappings > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {activeMappings} mapeo{activeMappings !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {campaign.channel}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {campaign.mappings.length === 0 ? (
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Sin mapeos configurados</span>
                </div>
                <Button size="sm" variant="outline" onClick={onAddMapping}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </div>
            ) : (
              <>
                {campaign.mappings.map((mapping) => (
                  <div 
                    key={mapping.id}
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-lg border",
                      mapping.is_active ? "bg-background" : "bg-muted/30 opacity-60"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {mapping.lead_form_pattern && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            form: {mapping.lead_form_pattern}
                          </Badge>
                        )}
                        {mapping.campaign_name_pattern && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            campaign: {mapping.campaign_name_pattern}
                          </Badge>
                        )}
                        {mapping.utm_campaign_pattern && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            utm: {mapping.utm_campaign_pattern}
                          </Badge>
                        )}
                      </div>
                      {mapping.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {mapping.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={mapping.is_active}
                        onCheckedChange={(checked) => onToggleMapping(mapping.id, checked)}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDeleteMapping(mapping.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full mt-2" 
                  onClick={onAddMapping}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir otro mapeo
                </Button>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// ============= MAIN COMPONENT =============

export const CampaignMappingPanel: React.FC = () => {
  const {
    campaignsWithMappings,
    availableLeadForms,
    availableCampaignNames,
    isLoading,
    createMapping,
    toggleMappingActive,
    deleteMapping,
    isCreating,
  } = useCampaignMapping();

  const { globalStats, refreshView } = useUnifiedCosts();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithMapping | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!searchTerm) return campaignsWithMappings;
    
    const term = searchTerm.toLowerCase();
    return campaignsWithMappings.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.external_name?.toLowerCase().includes(term)
    );
  }, [campaignsWithMappings, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const totalCampaigns = campaignsWithMappings.length;
    const campaignsWithActiveMappings = campaignsWithMappings.filter(
      c => c.mappings.some(m => m.is_active)
    ).length;
    const totalMappings = campaignsWithMappings.reduce(
      (sum, c) => sum + c.mappings.filter(m => m.is_active).length, 
      0
    );
    
    return { totalCampaigns, campaignsWithActiveMappings, totalMappings };
  }, [campaignsWithMappings]);

  const handleAddMapping = (campaign: CampaignWithMapping) => {
    setSelectedCampaign(campaign);
    setShowAddDialog(true);
  };

  const handleSubmitMapping = (data: Parameters<typeof createMapping>[0]) => {
    createMapping(data);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshView();
    setIsRefreshing(false);
  };

  const handleDeleteMapping = async (id: string) => {
    if (window.confirm('¿Eliminar este mapeo?')) {
      deleteMapping(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Mapeo de Campañas → Leads
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vincula campañas de Meta/Google Ads con leads para calcular CPL real
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refrescar Vista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Campañas totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.campaignsWithActiveMappings}</div>
            <p className="text-xs text-muted-foreground">Con mapeos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalMappings}</div>
            <p className="text-xs text-muted-foreground">Mapeos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {globalStats.totalLeads > 0 
                ? `€${Math.round(globalStats.realCPL || 0).toLocaleString()}`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">CPL Real calculado</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline">
          {filteredCampaigns.length} de {campaignsWithMappings.length}
        </Badge>
      </div>

      {/* Campaign Cards */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay campañas configuradas</p>
          <p className="text-sm">
            Importa datos de Meta Ads para ver las campañas disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignMappingCard
              key={campaign.id}
              campaign={campaign}
              onAddMapping={() => handleAddMapping(campaign)}
              onToggleMapping={toggleMappingActive}
              onDeleteMapping={handleDeleteMapping}
            />
          ))}
        </div>
      )}

      {/* Add Mapping Dialog */}
      <AddMappingDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedCampaign(null);
        }}
        campaignId={selectedCampaign?.id}
        campaignName={selectedCampaign?.name}
        availableLeadForms={availableLeadForms}
        availableCampaignNames={availableCampaignNames}
        onSubmit={handleSubmitMapping}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default CampaignMappingPanel;
