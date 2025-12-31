import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useCampaignValuationForm } from '@/hooks/useCampaignValuationForm';

export function CampaignValuationForm() {
  const { formData, errors, isSubmitting, isSuccess, updateField, submitForm } = useCampaignValuationForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          ¡Solicitud recibida!
        </h3>
        <p className="text-muted-foreground">
          Nuestro equipo revisará tu información y se pondrá en contacto contigo en las próximas 24-48 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
      {/* Hidden honeypot field */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Input
          type="text"
          name="website"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-foreground font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="cif" className="text-foreground font-medium">
            CIF de la empresa <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cif"
            type="text"
            placeholder="B12345678"
            value={formData.cif}
            onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
            maxLength={9}
            className={errors.cif ? 'border-destructive' : ''}
          />
          {errors.cif && (
            <p className="text-destructive text-sm mt-1">{errors.cif}</p>
          )}
        </div>

        <div>
          <Label htmlFor="revenue" className="text-foreground font-medium">
            Facturación 2025 (€) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="revenue"
            type="text"
            placeholder="1.500.000"
            value={formData.revenue}
            onChange={(e) => updateField('revenue', e.target.value)}
            className={errors.revenue ? 'border-destructive' : ''}
          />
          {errors.revenue && (
            <p className="text-destructive text-sm mt-1">{errors.revenue}</p>
          )}
        </div>

        <div>
          <Label htmlFor="ebitda" className="text-foreground font-medium">
            EBITDA 2025 (€) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ebitda"
            type="text"
            placeholder="300.000"
            value={formData.ebitda}
            onChange={(e) => updateField('ebitda', e.target.value)}
            className={errors.ebitda ? 'border-destructive' : ''}
          />
          {errors.ebitda && (
            <p className="text-destructive text-sm mt-1">{errors.ebitda}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          'Solicitar Valoración Profesional'
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Shield className="w-4 h-4" />
        <span>Información 100% confidencial</span>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground text-center">
          📋 Campaña: Valoración Cierre de Año 2025
        </p>
      </div>
    </form>
  );
}
