import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, Upload, Loader2, Mail } from 'lucide-react';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml, EmailSignatureData } from '@/hooks/useEmailSignature';
import { useAdminAuth } from '@/hooks/useAdminAuth';

type FormData = Omit<EmailSignatureData, 'id' | 'user_id' | 'html_preview'>;

const EmailSignatureConfigPage: React.FC = () => {
  const { user } = useAdminAuth();
  const { signature, isLoading, saveSignature, isSaving, uploadLogo, isUploadingLogo } = useEmailSignature();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaults = (): FormData => ({
    ...DEFAULT_SIGNATURE,
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
  });

  const [form, setForm] = useState<FormData>(getDefaults());

  useEffect(() => {
    if (signature) {
      setForm({
        full_name: signature.full_name || '',
        job_title: signature.job_title || '',
        phone: signature.phone || '',
        website_url: signature.website_url || '',
        linkedin_url: signature.linkedin_url || '',
        logo_url: signature.logo_url || null,
        confidentiality_note: signature.confidentiality_note || '',
        privacy_note: signature.privacy_note || '',
        extra_note: signature.extra_note || '',
      });
    } else if (!isLoading) {
      setForm(getDefaults());
    }
  }, [signature, isLoading]);

  const update = (field: keyof FormData, value: string | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveSignature(form);
  };

  const handleRestore = () => {
    setForm(getDefaults());
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo no puede superar los 2MB');
      return;
    }
    const url = await uploadLogo(file);
    if (url) update('logo_url', url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewHtml = generateSignatureHtml(form);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Firma de Email
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura tu firma personal para emails de campañas outbound
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestore} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar valores
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar firma
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          {/* Datos personales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre completo</Label>
                <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Ej: Oriol Iglesias" />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input value={form.job_title} onChange={e => update('job_title', e.target.value)} placeholder="Ej: M&A - Deal Advisory" />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+34 653 374 569" />
              </div>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL Web</Label>
                <Input value={form.website_url} onChange={e => update('website_url', e.target.value)} placeholder="https://capittal.es" />
              </div>
              <div>
                <Label>URL LinkedIn</Label>
                <Input value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/capittal" />
              </div>
              <div>
                <Label>Logo de empresa</Label>
                <div className="flex items-center gap-3 mt-1">
                  {form.logo_url && (
                    <img src={form.logo_url} alt="Logo" className="h-12 border rounded" />
                  )}
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo}>
                    {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                    {form.logo_url ? 'Cambiar logo' : 'Subir logo'}
                  </Button>
                  {form.logo_url && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => update('logo_url', null)}>
                      Eliminar
                    </Button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                <p className="text-xs text-muted-foreground mt-1">JPG o PNG, máx. 2MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Textos legales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Textos legales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nota de confidencialidad</Label>
                <Textarea value={form.confidentiality_note} onChange={e => update('confidentiality_note', e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Política de privacidad</Label>
                <Textarea value={form.privacy_note} onChange={e => update('privacy_note', e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Nota ambiental</Label>
                <Input value={form.extra_note} onChange={e => update('extra_note', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vista previa</CardTitle>
              <p className="text-xs text-muted-foreground">Así se verá tu firma en los emails enviados</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-muted-foreground mb-3 italic">
                  [...cuerpo del email...]
                </div>
                <Separator className="my-4" />
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailSignatureConfigPage;
