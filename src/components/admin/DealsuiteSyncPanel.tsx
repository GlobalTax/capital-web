import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDealsuitDeals } from '@/hooks/useDealsuitDeals';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { 
  Loader2, 
  Upload, 
  ImagePlus, 
  Trash2, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { DealsuitePreviewCard } from './DealsuitePreviewCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExtractedDeal {
  title: string;
  deal_type?: string | null;
  sector?: string | null;
  country?: string | null;
  location?: string | null;
  description?: string | null;
  revenue_min?: number | null;
  revenue_max?: number | null;
  ebitda_min?: number | null;
  ebitda_max?: number | null;
  stake_offered?: string | null;
  customer_types?: string | null;
  reference?: string | null;
  advisor?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_company?: string | null;
  published_at?: string | null;
  image_url?: string | null;
}

export const DealsuiteSyncPanel = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedDeal, setExtractedDeal] = useState<ExtractedDeal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<ExtractedDeal | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedDealNotes, setSelectedDealNotes] = useState('');
  const { toast } = useToast();
  const { data: deals, isLoading: isLoadingDeals, refetch } = useDealsuitDeals(20);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setExtractedDeal(null);
      setNotes('');
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (imagePreview) return;
      const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageBase64(result.split(',')[1]);
        setExtractedDeal(null);
        setNotes('');
      };
      reader.readAsDataURL(file);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [imagePreview]);

  // Upsert contact in dealsuite_contacts
  const upsertContact = async (deal: ExtractedDeal, dealId: string) => {
    if (!deal.contact_email) return;
    try {
      // Check if contact exists
      const { data: existing } = await supabase
        .from('dealsuite_contacts' as any)
        .select('id, deal_ids')
        .eq('email', deal.contact_email)
        .maybeSingle();

      if (existing) {
        const currentDealIds = (existing as any).deal_ids || [];
        if (!currentDealIds.includes(dealId)) {
          await supabase
            .from('dealsuite_contacts' as any)
            .update({
              nombre: deal.contact_name || 'Sin nombre',
              empresa: deal.contact_company || deal.advisor || null,
              deal_ids: [...currentDealIds, dealId],
              updated_at: new Date().toISOString(),
            } as any)
            .eq('id', (existing as any).id);
        }
      } else {
        await supabase
          .from('dealsuite_contacts' as any)
          .insert({
            nombre: deal.contact_name || 'Sin nombre',
            empresa: deal.contact_company || deal.advisor || null,
            email: deal.contact_email,
            deal_ids: [dealId],
          } as any);
      }
    } catch (err) {
      console.error('Error upserting contact:', err);
    }
  };

  const handleExtract = async () => {
    if (!imageBase64) return;

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('dealsuite-extract-image', {
        body: { image_base64: imageBase64 },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setExtractedDeal(data.data);
        toast({ title: 'Datos extraídos', description: `Deal: ${data.data.title}` });
      } else {
        throw new Error(data?.error || 'No se pudieron extraer datos');
      }
    } catch (err: any) {
      console.error('Extract error:', err);
      toast({
        title: 'Error al extraer',
        description: err.message || 'No se pudieron extraer los datos de la imagen',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!extractedDeal) return;

    setIsSaving(true);
    try {
      const dealId = extractedDeal.reference || `img-${Date.now()}`;
      
      const rawData: Record<string, unknown> = {};
      if (notes.trim()) rawData.notes = notes.trim();

      const { error } = await supabase.from('dealsuite_deals').upsert(
        {
          deal_id: dealId,
          title: extractedDeal.title,
          deal_type: extractedDeal.deal_type,
          sector: extractedDeal.sector,
          country: extractedDeal.country,
          location: extractedDeal.location,
          description: extractedDeal.description,
          revenue_min: extractedDeal.revenue_min,
          revenue_max: extractedDeal.revenue_max,
          ebitda_min: extractedDeal.ebitda_min,
          ebitda_max: extractedDeal.ebitda_max,
          stake_offered: extractedDeal.stake_offered,
          customer_types: extractedDeal.customer_types,
          reference: extractedDeal.reference,
          advisor: extractedDeal.advisor,
          contact_name: extractedDeal.contact_name,
          contact_email: extractedDeal.contact_email,
          contact_company: extractedDeal.contact_company,
          published_at: extractedDeal.published_at,
          image_url: extractedDeal.image_url,
          raw_data: Object.keys(rawData).length > 0 ? rawData : null,
          scraped_at: new Date().toISOString(),
        } as any,
        { onConflict: 'deal_id' }
      );

      if (error) throw error;

      // Upsert contact
      await upsertContact(extractedDeal, dealId);

      toast({ title: 'Deal guardado', description: `"${extractedDeal.title}" guardado correctamente.` });
      setExtractedDeal(null);
      setImagePreview(null);
      setImageBase64(null);
      setNotes('');
      refetch();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: 'Error al guardar',
        description: err.message || 'No se pudo guardar el deal',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setImageBase64(null);
    setExtractedDeal(null);
    setNotes('');
  };

  const updateField = (field: keyof ExtractedDeal, value: string | number | null) => {
    if (!extractedDeal) return;
    setExtractedDeal({ ...extractedDeal, [field]: value });
  };

  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal);
    const rawNotes = (deal.raw_data as any)?.notes || '';
    setSelectedDealNotes(rawNotes);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dealsuite — Captura de Deals</h1>
        <p className="text-muted-foreground mt-1">
          Sube una captura de pantalla de un deal de Dealsuite y la IA extraerá los datos automáticamente.
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Subir captura de deal
          </CardTitle>
          <CardDescription>
            Haz una captura de pantalla de un deal en Dealsuite y arrástrala aquí.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!imagePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Suelta la imagen aquí...' : 'Arrastra, haz clic o pega (Ctrl+V) una captura'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WebP (máx. 10MB)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                <img src={imagePreview} alt="Captura del deal" className="w-full max-h-[400px] object-contain" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Quitar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="flex-1"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extrayendo datos con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extraer datos con IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {extractedDeal && (
        <DealsuitePreviewCard
          deal={extractedDeal}
          imagePreview={imagePreview}
          isSaving={isSaving}
          notes={notes}
          onNotesChange={setNotes}
          onUpdate={updateField}
          onSave={handleSave}
          onDiscard={() => setExtractedDeal(null)}
        />
      )}

      {/* Selected deal detail view */}
      {selectedDeal && !extractedDeal && (
        <DealsuitePreviewCard
          deal={selectedDeal}
          imagePreview={selectedDeal.image_url || null}
          isSaving={false}
          readOnly
          notes={selectedDealNotes}
          onNotesChange={setSelectedDealNotes}
          onUpdate={() => {}}
          onSave={() => {}}
          onDiscard={() => setSelectedDeal(null)}
        />
      )}

      {/* Existing Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deals guardados</CardTitle>
          <CardDescription>
            {deals?.length || 0} deals en la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDeals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !deals?.length ? (
            <p className="text-center text-muted-foreground py-8">No hay deals guardados todavía.</p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {deals.map((deal) => {
                const sectors = deal.sector?.split(',').map(s => s.trim()).filter(Boolean) || [];
                return (
                  <div key={deal.id} className="flex gap-4 py-4 px-2 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleSelectDeal(deal)}>
                    {/* Thumbnail */}
                    {deal.image_url && (
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border bg-muted">
                        <img src={deal.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {deal.scraped_at
                              ? format(new Date(deal.scraped_at), 'dd MMM yyyy', { locale: es })
                              : ''}
                          </p>
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {deal.title || 'Sin título'}
                          </h3>
                        </div>
                        {/* Revenue column */}
                        {(deal.revenue_min || deal.revenue_max) && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-muted-foreground font-medium">Facturación</p>
                            {deal.revenue_min && (
                              <p className="text-xs text-foreground">mín. {formatCurrency(deal.revenue_min)}</p>
                            )}
                            {deal.revenue_max && (
                              <p className="text-xs text-foreground">máx. {formatCurrency(deal.revenue_max)}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {deal.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{deal.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {(deal.country || deal.location) && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {deal.location || deal.country}
                          </span>
                        )}
                        {sectors.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsuiteSyncPanel;
