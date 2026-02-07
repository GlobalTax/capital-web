import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useDealsuitDeals } from '@/hooks/useDealsuitDeals';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { 
  Loader2, 
  Upload, 
  ImagePlus, 
  Trash2, 
  ExternalLink,
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
  const { toast } = useToast();
  const { data: deals, isLoading: isLoadingDeals, refetch } = useDealsuitDeals(20);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Extract base64 without the data URI prefix
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setExtractedDeal(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Paste from clipboard (e.g. Snipping Tool)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (imagePreview) return; // Don't overwrite existing image
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
          scraped_at: new Date().toISOString(),
        } as any,
        { onConflict: 'deal_id' }
      );

      if (error) throw error;

      toast({ title: 'Deal guardado', description: `"${extractedDeal.title}" guardado correctamente.` });
      setExtractedDeal(null);
      setImagePreview(null);
      setImageBase64(null);
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
  };

  const updateField = (field: keyof ExtractedDeal, value: string | number | null) => {
    if (!extractedDeal) return;
    setExtractedDeal({ ...extractedDeal, [field]: value });
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

      {/* Extracted Data Preview — Dealsuite style */}
      {extractedDeal && (
        <DealsuitePreviewCard
          deal={extractedDeal}
          imagePreview={imagePreview}
          isSaving={isSaving}
          onUpdate={updateField}
          onSave={handleSave}
          onDiscard={() => setExtractedDeal(null)}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>EBITDA</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        <div className="flex items-center gap-2">
                          {deal.title || 'Sin título'}
                          {deal.image_url && (
                            <a href={deal.image_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.sector ? (
                          <Badge variant="secondary" className="text-xs truncate max-w-[150px]">
                            {deal.sector}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{deal.country || '-'}</TableCell>
                      <TableCell className="text-xs">
                        {deal.revenue_min || deal.revenue_max 
                          ? `${formatCurrency(deal.revenue_min)} - ${formatCurrency(deal.revenue_max)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {deal.ebitda_min || deal.ebitda_max
                          ? `${formatCurrency(deal.ebitda_min)} - ${formatCurrency(deal.ebitda_max)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {deal.contact_name || deal.advisor || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {deal.scraped_at
                          ? format(new Date(deal.scraped_at), 'dd MMM yyyy', { locale: es })
                          : '-'}
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

export default DealsuiteSyncPanel;
