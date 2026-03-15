import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Image, Loader2, X } from 'lucide-react';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { useToast } from '@/hooks/use-toast';
import type { LeadMagnet } from '@/types/leadMagnets';

interface LeadMagnetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMagnet?: LeadMagnet | null;
}

const SECTORS = [
  'Tecnología', 'Salud', 'Finanzas', 'Industria', 'Retail',
  'Hostelería', 'Logística', 'Energía', 'Educación', 'Inmobiliario', 'General'
];

const TYPES = [
  { value: 'report', label: 'Informe' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'template', label: 'Plantilla' },
];

const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const LeadMagnetFormDialog: React.FC<LeadMagnetFormDialogProps> = ({
  open, onOpenChange, editingMagnet
}) => {
  const { createLeadMagnet, updateLeadMagnet, uploadFile } = useLeadMagnets();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('report');
  const [sector, setSector] = useState('General');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [downloadCount, setDownloadCount] = useState(0);
  const [conversionCount, setConversionCount] = useState(0);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMagnet) {
      setTitle(editingMagnet.title);
      setType(editingMagnet.type);
      setSector(editingMagnet.sector);
      setDescription(editingMagnet.description);
      setSlug(editingMagnet.landing_page_slug || '');
      setMetaTitle(editingMagnet.meta_title || '');
      setMetaDescription(editingMagnet.meta_description || '');
      setStatus(editingMagnet.status);
      setContent(editingMagnet.content || '');
      setDownloadCount(editingMagnet.download_count || 0);
      setConversionCount(editingMagnet.lead_conversion_count || 0);
      setFileUrl(editingMagnet.file_url || '');
      setImageUrl(editingMagnet.featured_image_url || '');
      setSlugManual(true);
    } else {
      resetForm();
    }
  }, [editingMagnet, open]);

  const resetForm = () => {
    setTitle(''); setType('report'); setSector('General');
    setDescription(''); setSlug(''); setMetaTitle('');
    setMetaDescription(''); setStatus('draft'); setContent('');
    setFileUrl(''); setImageUrl(''); setSlugManual(false);
    setDownloadCount(0); setConversionCount(0);
  };

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleFileUpload = async (file: File, folder: string, setter: (url: string) => void) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      setter(url);
      toast({ title: 'Archivo subido', description: file.name });
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo subir el archivo', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: 'Error', description: 'Título y descripción son obligatorios', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        title: title.trim(),
        type: type as LeadMagnet['type'],
        sector,
        description: description.trim(),
        landing_page_slug: slug || slugify(title),
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        status: status as LeadMagnet['status'],
        content: content || undefined,
        file_url: fileUrl || undefined,
        featured_image_url: imageUrl || undefined,
      };

      if (editingMagnet) {
        await updateLeadMagnet.mutateAsync({ id: editingMagnet.id, ...basePayload });
        toast({ title: 'Recurso actualizado' });
      } else {
        await createLeadMagnet.mutateAsync(basePayload);
        toast({ title: 'Recurso creado' });
      }

      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingMagnet ? 'Editar Recurso' : 'Nuevo Recurso'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Guía de valoración de empresas tecnológicas" />
          </div>

          {/* Type + Sector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="desc">Descripción *</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Breve descripción del recurso..." />
          </div>

          {/* Slug */}
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" value={slug} onChange={e => { setSlug(e.target.value); setSlugManual(true); }} placeholder="guia-valoracion-tech" />
            <p className="text-xs text-muted-foreground">/recursos/biblioteca/{slug || '...'}</p>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download & Conversion counts (edit only) */}
          {editingMagnet && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="downloadCount">Nº de descargas</Label>
                <Input id="downloadCount" type="number" min={0} value={downloadCount} onChange={e => setDownloadCount(parseInt(e.target.value) || 0)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conversionCount">Nº de conversiones</Label>
                <Input id="conversionCount" type="number" min={0} value={conversionCount} onChange={e => setConversionCount(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Archivo PDF</Label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, 'pdfs', setFileUrl);
              }}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
                {fileUrl ? 'Cambiar PDF' : 'Subir PDF'}
              </Button>
              {fileUrl && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span className="truncate max-w-48">PDF subido</span>
                  <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => setFileUrl('')}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label>Imagen destacada</Label>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, 'images', setImageUrl);
              }}
            />
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Image className="h-4 w-4 mr-1" />}
                {imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </Button>
              {imageUrl && (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="h-16 w-24 object-cover rounded border" />
                  <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-5 w-5 bg-background border rounded-full" onClick={() => setImageUrl('')}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium mb-3 text-muted-foreground">SEO (opcional)</p>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta título</Label>
                <Input id="metaTitle" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Título para buscadores" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDesc">Meta descripción</Label>
                <Textarea id="metaDesc" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} placeholder="Descripción para buscadores" />
              </div>
            </div>
          </div>

          {/* Content (optional rich text) */}
          <div className="grid gap-2">
            <Label htmlFor="content">Contenido adicional (opcional)</Label>
            <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Contenido HTML o texto que se mostrará en la landing..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {editingMagnet ? 'Guardar cambios' : 'Crear recurso'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadMagnetFormDialog;
