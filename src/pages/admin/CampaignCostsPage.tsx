// ============= CAMPAIGN COSTS PAGE =============
// Página de análisis de costes de campañas vs leads

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Euro, Image as ImageIcon, Clipboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaignCosts, CampaignCost, CampaignCostInput } from '@/hooks/useCampaignCosts';
import CostEntryForm from '@/components/admin/campaigns/CostEntryForm';
import ChannelCACCards from '@/components/admin/campaigns/ChannelCACCards';
import CostVsLeadsChart from '@/components/admin/campaigns/CostVsLeadsChart';
import CostsTable from '@/components/admin/campaigns/CostsTable';
import ExcelStyleCostsTable from '@/components/admin/campaigns/ExcelStyleCostsTable';
import { ScreenshotUploader, ExtractedCampaignData } from '@/components/admin/campaigns/ScreenshotUploader';
import { PasteImageProcessor } from '@/components/admin/campaigns/PasteImageProcessor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

const CampaignCostsPage: React.FC = () => {
  const {
    costs,
    channelAnalytics,
    monthlyAnalytics,
    totalSpend,
    currentMonthSpend,
    isLoadingCosts,
    isLoadingAnalytics,
    addCost,
    updateCost,
    updateCell,
    deleteCost,
    isAdding,
    isUpdating
  } = useCampaignCosts();

  const [showForm, setShowForm] = useState(false);
  const [showScreenshotUploader, setShowScreenshotUploader] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<CampaignCostInput> | undefined>(undefined);
  const [editingCost, setEditingCost] = useState<CampaignCost | null>(null);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Listen for paste events (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            setPastedImage(file);
            toast.info('Imagen detectada, procesando...');
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleAddCost = (data: CampaignCostInput) => {
    addCost(data);
    setShowForm(false);
    setPrefillData(undefined);
  };

  const handleScreenshotData = (data: ExtractedCampaignData) => {
    setPrefillData({
      channel: data.channel,
      campaign_name: data.campaign_name || undefined,
      period_start: data.period_start,
      period_end: data.period_end,
      amount: data.amount,
      impressions: data.impressions || undefined,
      clicks: data.clicks || undefined,
      ctr: data.ctr || undefined,
      cpc: data.cpc || undefined,
    });
    setShowScreenshotUploader(false);
    setPastedImage(null);
    setShowForm(true);
  };

  const handleSaveDirectly = useCallback((data: ExtractedCampaignData) => {
    addCost({
      channel: data.channel,
      campaign_name: data.campaign_name || undefined,
      period_start: data.period_start,
      period_end: data.period_end,
      amount: data.amount,
      impressions: data.impressions || undefined,
      clicks: data.clicks || undefined,
      ctr: data.ctr || undefined,
      cpc: data.cpc || undefined,
    });
    setPastedImage(null);
  }, [addCost]);

  const handleUpdateCost = (data: CampaignCostInput) => {
    if (editingCost) {
      updateCost({ ...data, id: editingCost.id });
      setEditingCost(null);
    }
  };

  const handleEdit = (cost: CampaignCost) => {
    setEditingCost(cost);
  };

  const handleDelete = (id: string) => {
    deleteCost(id);
  };

  // Handle cell update from Excel table
  const handleCellUpdate = useCallback(async (id: string, field: string, value: any) => {
    await updateCell({ id, field, value });
  }, [updateCell]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Euro className="h-6 w-6 text-primary" />
            Control de Costes
          </h1>
          <p className="text-muted-foreground">
            Gestiona presupuestos y analiza el rendimiento de campañas
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Paste hint */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Clipboard className="h-3 w-3" />
            <span>Ctrl+V para pegar pantallazo</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowScreenshotUploader(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button onClick={() => { setPrefillData(undefined); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </div>
        </div>
      </div>

      {/* Pasted Image Processor (inline) */}
      {pastedImage && (
        <PasteImageProcessor
          imageFile={pastedImage}
          onDataExtracted={handleScreenshotData}
          onDiscard={() => setPastedImage(null)}
          onSaveDirectly={handleSaveDirectly}
        />
      )}

      {/* MAIN: Excel-style Costs Table - AT THE TOP */}
      <ExcelStyleCostsTable 
        data={costs}
        onCellUpdate={handleCellUpdate}
        isLoading={isLoadingCosts}
      />

      {/* Collapsible Analytics Section */}
      <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              Ver Gráficas y KPIs
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${analyticsOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          {/* KPI Cards */}
          <ChannelCACCards 
            analytics={channelAnalytics} 
            isLoading={isLoadingAnalytics}
          />

          {/* Chart */}
          <CostVsLeadsChart 
            data={monthlyAnalytics}
            isLoading={isLoadingCosts}
          />

          {/* Legacy Costs Table (for detailed view) */}
          <CostsTable 
            costs={costs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoadingCosts}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Add Form Modal */}
      <CostEntryForm
        open={showForm}
        onClose={() => { setShowForm(false); setPrefillData(undefined); }}
        onSubmit={handleAddCost}
        isSubmitting={isAdding}
        mode="create"
        defaultValues={prefillData}
      />

      {/* Screenshot Uploader */}
      <ScreenshotUploader
        open={showScreenshotUploader}
        onOpenChange={setShowScreenshotUploader}
        onDataExtracted={handleScreenshotData}
      />

      {/* Edit Form Modal */}
      {editingCost && (
        <CostEntryForm
          open={!!editingCost}
          onClose={() => setEditingCost(null)}
          onSubmit={handleUpdateCost}
          isSubmitting={isUpdating}
          mode="edit"
          defaultValues={{
            channel: editingCost.channel,
            campaign_name: editingCost.campaign_name || undefined,
            period_start: editingCost.period_start,
            period_end: editingCost.period_end,
            amount: Number(editingCost.amount),
            impressions: editingCost.impressions || undefined,
            clicks: editingCost.clicks || undefined,
            ctr: editingCost.ctr || undefined,
            cpc: editingCost.cpc || undefined,
            notes: editingCost.notes || undefined
          }}
        />
      )}
    </div>
  );
};

export default CampaignCostsPage;
