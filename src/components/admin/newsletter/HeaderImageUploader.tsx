import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface HeaderImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
}

export const HeaderImageUploader: React.FC<HeaderImageUploaderProps> = ({
  imageUrl,
  onImageChange,
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlInput);
      onImageChange(urlInput.trim());
      setUrlInput('');
      toast({
        title: 'Imagen añadida',
        description: 'La URL de la imagen se ha configurado correctamente',
      });
    } catch {
      toast({
        title: 'URL inválida',
        description: 'Por favor, introduce una URL válida',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor, selecciona una imagen (PNG, JPG, WEBP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo es 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `newsletter-header-${Date.now()}.${fileExt}`;
      const filePath = `newsletter-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      toast({
        title: 'Imagen subida',
        description: 'La imagen se ha subido correctamente',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo subir la imagen. Intenta con una URL externa.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    setUrlInput('');
  };

  return (
    <div className="space-y-4">
      <Label>Imagen de cabecera (opcional)</Label>

      {imageUrl ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <img
            src={imageUrl}
            alt="Header preview"
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/600x200?text=Error+al+cargar+imagen';
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link className="h-4 w-4" />
              URL Externa
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Subir Imagen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                Añadir
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="header-image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="header-image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Haz clic para seleccionar una imagen
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (máx. 2MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
