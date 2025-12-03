import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePdfSignatureConfig, useUpdatePdfSignatureConfig } from '@/hooks/usePdfSignatureConfig';
import { FileSignature, Save, Loader2, User, Briefcase, Mail, Phone, Globe } from 'lucide-react';

const PdfSignatureConfigPage: React.FC = () => {
  const { data: config, isLoading } = usePdfSignatureConfig();
  const { mutate: updateConfig, isPending } = useUpdatePdfSignatureConfig();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    website: '',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        role: config.role,
        email: config.email,
        phone: config.phone,
        website: config.website,
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💾 [PdfSignature] Submitting form data:', formData);
    updateConfig(formData);
  };

  const handleFieldChange = (field: string, value: string) => {
    console.log(`📝 [PdfSignature] Field "${field}" changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Firma del Informe PDF</h1>
        <p className="text-muted-foreground">
          Configura la información de contacto que aparece al final de los informes de valoración profesional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Datos de la Firma
          </CardTitle>
          <CardDescription>
            Esta información aparecerá en la sección "Preparado por" de todos los PDFs generados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre / Equipo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Equipo Capittal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Cargo / Rol
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  placeholder="Consultor de M&A"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="info@capittal.es"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="+34 XXX XXX XXX"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Web
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="www.capittal.es"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm">Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Preparado por</p>
            <p className="font-semibold">{formData.name || 'Equipo Capittal'}</p>
            <p className="text-muted-foreground">{formData.role || 'Consultor de M&A'}</p>
            <p className="text-sm text-muted-foreground">{formData.email || 'info@capittal.es'}</p>
            <p className="text-sm text-muted-foreground">
              {formData.website || 'www.capittal.es'} | {formData.phone || '+34 XXX XXX XXX'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfSignatureConfigPage;
