import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, RotateCcw, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageCropEditorProps {
  imageUrl: string;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

const ASPECT_OPTIONS = [
  { label: 'Libre', value: 'free' },
  { label: '1:1', value: '1' },
  { label: '16:9', value: `${16 / 9}` },
  { label: '4:3', value: `${4 / 3}` },
  { label: '3:2', value: `${3 / 2}` },
  { label: '2:3', value: `${2 / 3}` },
];

const ImageCropEditor: React.FC<ImageCropEditorProps> = ({ imageUrl, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(100);
  const [aspect, setAspect] = useState<string>('free');
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, undefined as any, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }, []);

  const handleAspectChange = (value: string) => {
    setAspect(value);
    if (value === 'free') {
      // Keep current crop, just remove aspect lock
      return;
    }
    const numAspect = parseFloat(value);
    if (imgRef.current) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, numAspect, width, height),
        width,
        height
      );
      setCrop(newCrop);
    }
  };

  const resetCrop = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(100);
    setAspect('free');
  };

  const insertOriginal = () => {
    onConfirm(imageUrl);
  };

  const cropAndInsert = async () => {
    if (!completedCrop || !imgRef.current) {
      onConfirm(imageUrl);
      return;
    }

    setIsSaving(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropW = completedCrop.width * scaleX;
      const cropH = completedCrop.height * scaleY;

      // Apply scale
      const scaleFactor = scale / 100;
      canvas.width = Math.round(cropW * scaleFactor);
      canvas.height = Math.round(cropH * scaleFactor);

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          b => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/webp',
          0.85
        );
      });

      const fileName = `cropped/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const { data, error } = await supabase.storage
        .from('admin-photos')
        .upload(fileName, blob, { contentType: 'image/webp' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('admin-photos')
        .getPublicUrl(data.path);

      toast({ title: '✅ Imagen recortada', description: `${canvas.width}×${canvas.height}px` });
      onConfirm(publicUrl);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const aspectNum = aspect === 'free' ? undefined : parseFloat(aspect);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Proporción</Label>
          <Select value={aspect} onValueChange={handleAspectChange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <Label className="text-xs whitespace-nowrap">Escala {scale}%</Label>
          <Slider
            value={[scale]}
            onValueChange={([v]) => setScale(v)}
            min={10}
            max={100}
            step={5}
            className="flex-1"
          />
        </div>

        <Button type="button" size="sm" variant="ghost" onClick={resetCrop} className="h-8 px-2">
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>

      <div className="border border-border rounded-[var(--radius)] overflow-hidden bg-muted/30 flex items-center justify-center max-h-[50vh]">
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setCompletedCrop(c)}
          aspect={aspectNum}
          className="max-h-[50vh]"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Editar"
            onLoad={onImageLoad}
            crossOrigin="anonymous"
            className="max-h-[50vh] object-contain"
          />
        </ReactCrop>
      </div>

      {completedCrop && imgRef.current && (
        <p className="text-xs text-muted-foreground text-center">
          Resultado: {Math.round(completedCrop.width * (imgRef.current.naturalWidth / imgRef.current.width) * scale / 100)}
          ×{Math.round(completedCrop.height * (imgRef.current.naturalHeight / imgRef.current.height) * scale / 100)}px
        </p>
      )}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={insertOriginal}>
            <Maximize2 className="h-3.5 w-3.5 mr-1" /> Original
          </Button>
          <Button type="button" size="sm" onClick={cropAndInsert} disabled={isSaving}>
            <Check className="h-3.5 w-3.5 mr-1" />
            {isSaving ? 'Guardando...' : 'Recortar e insertar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropEditor;
