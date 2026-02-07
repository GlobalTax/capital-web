import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDealsuitDeals } from '@/hooks/useDealsuitDeals';
import { useFavoriteDealIds, useToggleDealFavorite } from '@/hooks/useDealsuiteFavorites';
import { useDealsuiteEmpresas } from '@/hooks/useDealsuiteEmpresas';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, Upload, ImagePlus, Trash2, MapPin,
  Sparkles, Star, Building2, Users
} from 'lucide-react';
import { DealsuitePreviewCard } from './DealsuitePreviewCard';
import { DealsuiteEmpresaCard } from './DealsuiteEmpresaCard';
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

// --- Upsert helpers ---

const upsertEmpresa = async (nombreEmpresa: string, dealId: string): Promise<string | null> => {
  if (!nombreEmpresa?.trim()) return null;
  const nombre = nombreEmpresa.trim();

  try {
    // Search by name
    const { data: existing } = await supabase
      .from('dealsuite_empresas' as any)
      .select('id, deal_ids')
      .eq('nombre', nombre)
      .maybeSingle();

    if (existing) {
      const currentIds = ((existing as any).deal_ids as string[]) || [];
      if (!currentIds.includes(dealId)) {
        await supabase
          .from('dealsuite_empresas' as any)
          .update({ deal_ids: [...currentIds, dealId], updated_at: new Date().toISOString() } as any)
          .eq('id', (existing as any).id);
      }
      return (existing as any).id as string;
    }

    // Create new
    const { data: created, error } = await supabase
      .from('dealsuite_empresas' as any)
      .insert({ nombre, deal_ids: [dealId] } as any)
      .select('id')
      .single();

    if (error) throw error;
    return (created as any).id as string;
  } catch (err) {
    console.error('Error upserting empresa:', err);
    return null;
  }
};

const upsertContact = async (
  deal: ExtractedDeal,
  dealId: string,
  empresaId: string | null
) => {
  const name = deal.contact_name?.trim();
  const email = deal.contact_email?.trim() || null;

  // Need at least a name or email
  if (!name && !email) return;

  try {
    let existing: any = null;

    // Try to find by email first
    if (email) {
      const { data } = await supabase
        .from('dealsuite_contacts' as any)
        .select('id, deal_ids')
        .eq('email', email)
        .maybeSingle();
      existing = data;
    }

    // If no email match, try name + empresa
    if (!existing && name) {
      const { data } = await supabase
        .from('dealsuite_contacts' as any)
        .select('id, deal_ids')
        .eq('nombre', name)
        .eq('empresa', deal.contact_company || deal.advisor || '')
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      const currentIds = (existing.deal_ids as string[]) || [];
      if (!currentIds.includes(dealId)) {
        await supabase
          .from('dealsuite_contacts' as any)
          .update({
            nombre: name || existing.nombre,
            empresa: deal.contact_company || deal.advisor || null,
            deal_ids: [...currentIds, dealId],
            empresa_id: empresaId || undefined,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', existing.id);
      }
    } else {
      await supabase
        .from('dealsuite_contacts' as any)
        .insert({
          nombre: name || 'Sin nombre',
          empresa: deal.contact_company || deal.advisor || null,
          email,
          deal_ids: [dealId],
          empresa_id: empresaId,
        } as any);
    }
  } catch (err) {
    console.error('Error upserting contact:', err);
  }
};

// --- Component ---

export const DealsuiteSyncPanel = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedDeal, setExtractedDeal] = useState<ExtractedDeal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<ExtractedDeal | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedDealNotes, setSelectedDealNotes] = useState('');
  const [activeTab, setActiveTab] = useState('favorites');
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const { toast } = useToast();
  const { data: deals, isLoading: isLoadingDeals, refetch } = useDealsuitDeals(100);
  const { data: favoriteIds } = useFavoriteDealIds();
  const toggleFavorite = useToggleDealFavorite();
  const { data: empresas, isLoading: isLoadingEmpresas } = useDealsuiteEmpresas();
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
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
      toast({ title: 'Error al extraer', description: err.message, variant: 'destructive' });
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

      // Upsert empresa + contact
      const companyName = extractedDeal.contact_company || extractedDeal.advisor;
      const empresaId = companyName ? await upsertEmpresa(companyName, dealId) : null;
      await upsertContact(extractedDeal, dealId, empresaId);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['dealsuite-empresas'] });
      queryClient.invalidateQueries({ queryKey: ['dealsuite-contactos'] });

      toast({ title: 'Deal guardado', description: `"${extractedDeal.title}" guardado correctamente.` });
      setExtractedDeal(null);
      setImagePreview(null);
      setImageBase64(null);
      setNotes('');
      refetch();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
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
    setSelectedDealNotes((deal.raw_data as any)?.notes || '');
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  // Directorio: empresa detail view
  if (activeTab === 'directorio' && selectedEmpresa) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dealsuite — Captura de Deals</h1>
          <p className="text-muted-foreground mt-1">
            Sube una captura de pantalla de un deal de Dealsuite y la IA extraerá los datos automáticamente.
          </p>
        </div>
        <DealsuiteEmpresaCard empresa={selectedEmpresa} onBack={() => setSelectedEmpresa(null)} />
      </div>
    );
  }

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
                <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" /> Quitar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExtract} disabled={isExtracting} className="flex-1">
                  {isExtracting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Extrayendo datos con IA...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />Extraer datos con IA</>
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

      {/* Deals / Directorio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {activeTab === 'directorio' ? 'Directorio de empresas' : 'Deals guardados'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'directorio'
                  ? `${empresas?.length || 0} empresas registradas`
                  : `${deals?.length || 0} deals en la base de datos`}
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedEmpresa(null); }}>
              <TabsList>
                <TabsTrigger value="favorites" className="gap-1.5">
                  <Star className="h-3.5 w-3.5" /> Favoritos
                </TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="directorio" className="gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Directorio
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'directorio' ? (
            // Directorio view
            isLoadingEmpresas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !empresas?.length ? (
              <p className="text-center text-muted-foreground py-8">
                No hay empresas registradas. Se crearán automáticamente al guardar deals con empresa o advisor.
              </p>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {empresas.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-4 py-3 px-2 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedEmpresa(emp)}
                  >
                    {emp.imagen_url ? (
                      <img src={emp.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{emp.nombre}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {emp.ubicacion && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {emp.ubicacion}
                          </span>
                        )}
                        {emp.tipo_empresa && <span>{emp.tipo_empresa}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {emp.deal_ids.length} deal{emp.deal_ids.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Deals view (favorites/all)
            isLoadingDeals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (() => {
              const filteredDeals = activeTab === 'favorites'
                ? (deals || []).filter(d => favoriteIds?.has(d.deal_id))
                : (deals || []);

              if (!filteredDeals.length) {
                return (
                  <p className="text-center text-muted-foreground py-8">
                    {activeTab === 'favorites' ? 'No tienes deals favoritos.' : 'No hay deals guardados todavía.'}
                  </p>
                );
              }

              return (
                <div className="space-y-0 divide-y divide-border">
                  {filteredDeals.map((deal) => {
                    const sectors = deal.sector?.split(',').map(s => s.trim()).filter(Boolean) || [];
                    const isFav = favoriteIds?.has(deal.deal_id) || false;
                    return (
                      <div key={deal.id} className="flex gap-4 py-4 px-2 hover:bg-muted/30 transition-colors cursor-pointer">
                        <button
                          className="flex-shrink-0 mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite.mutate({ dealId: deal.deal_id, isFavorite: isFav });
                          }}
                        >
                          <Star className={`h-4 w-4 transition-colors ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                        </button>
                        {deal.image_url && (
                          <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border bg-muted" onClick={() => handleSelectDeal(deal)}>
                            <img src={deal.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0" onClick={() => handleSelectDeal(deal)}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                {deal.scraped_at ? format(new Date(deal.scraped_at), 'dd MMM yyyy', { locale: es }) : ''}
                              </p>
                              <h3 className="text-sm font-semibold text-foreground truncate">{deal.title || 'Sin título'}</h3>
                            </div>
                            {(deal.revenue_min || deal.revenue_max) && (
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-muted-foreground font-medium">Facturación</p>
                                {deal.revenue_min && <p className="text-xs text-foreground">mín. {formatCurrency(deal.revenue_min)}</p>}
                                {deal.revenue_max && <p className="text-xs text-foreground">máx. {formatCurrency(deal.revenue_max)}</p>}
                              </div>
                            )}
                          </div>
                          {deal.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{deal.description}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {(deal.country || deal.location) && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {deal.location || deal.country}
                              </span>
                            )}
                            {sectors.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsuiteSyncPanel;
