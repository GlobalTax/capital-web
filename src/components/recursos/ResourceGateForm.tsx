import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeadMagnetDownloads } from '@/hooks/useLeadMagnets';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Download, Loader2, Shield } from 'lucide-react';

interface ResourceGateFormProps {
  resourceSlug: string;
  fileUrl?: string;
  resourceTitle: string;
}

const ResourceGateForm: React.FC<ResourceGateFormProps> = ({ resourceSlug, fileUrl, resourceTitle }) => {
  const { toast } = useToast();
  const { recordDownload } = useLeadMagnetDownloads();

  const [formData, setFormData] = useState({
    user_email: '',
    user_name: '',
    user_company: '',
    user_phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_email) return;

    setIsSubmitting(true);
    try {
      await recordDownload(resourceSlug, {
        user_email: formData.user_email,
        user_name: formData.user_name || undefined,
        user_company: formData.user_company || undefined,
        user_phone: formData.user_phone || undefined,
      });

      setIsSuccess(true);

      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }

      toast({
        title: '¡Recurso desbloqueado!',
        description: 'Tu descarga ha comenzado.',
      });
    } catch (error) {
      console.error('Error recording download:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar tu solicitud. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">¡Descarga iniciada!</h3>
        <p className="text-muted-foreground">
          Hemos enviado <strong>{resourceTitle}</strong> a tu navegador.
        </p>
        {fileUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(fileUrl, '_blank')}
            className="mt-4"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar de nuevo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8">
      <h3 className="text-lg font-semibold text-foreground mb-1">Accede gratis al recurso</h3>
      <p className="text-sm text-muted-foreground mb-6">Completa el formulario para desbloquear la descarga.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="gate-email">Email profesional *</Label>
          <Input
            id="gate-email"
            type="email"
            required
            placeholder="tu@empresa.com"
            value={formData.user_email}
            onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="gate-name">Nombre completo</Label>
          <Input
            id="gate-name"
            type="text"
            placeholder="Juan García"
            value={formData.user_name}
            onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="gate-company">Empresa</Label>
          <Input
            id="gate-company"
            type="text"
            placeholder="Nombre de tu empresa"
            value={formData.user_company}
            onChange={(e) => setFormData(prev => ({ ...prev, user_company: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="gate-phone">Teléfono</Label>
          <Input
            id="gate-phone"
            type="tel"
            placeholder="+34 600 000 000"
            value={formData.user_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, user_phone: e.target.value }))}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
          ) : (
            <><Download className="w-4 h-4 mr-2" /> Descargar gratis</>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          Tus datos están protegidos. No spam.
        </p>
      </form>
    </div>
  );
};

export default ResourceGateForm;
