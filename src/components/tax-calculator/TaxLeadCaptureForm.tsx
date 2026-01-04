import React from 'react';
import { TaxCalculationResult } from '@/utils/taxCalculation';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { useTaxLeadCapture } from '@/hooks/useTaxLeadCapture';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, User, Phone, Building2, Lock, TrendingUp, Euro, Percent } from 'lucide-react';

interface TaxLeadCaptureFormProps {
  taxResult: TaxCalculationResult;
  formData: TaxFormData;
  onSubmit: () => void;
  onBack: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const TaxLeadCaptureForm: React.FC<TaxLeadCaptureFormProps> = ({
  taxResult,
  formData: taxFormData,
  onSubmit,
  onBack,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    submit,
  } = useTaxLeadCapture({
    taxFormData,
    taxResult,
    onSuccess: onSubmit,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Modificar datos
      </Button>

      {/* Preview borroso */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              ✓
            </span>
            <h3 className="text-lg font-semibold text-foreground">Tu simulación está lista</h3>
          </div>

          {/* Preview con blur */}
          <div className="relative overflow-hidden rounded-xl bg-primary/5 p-4 border border-primary/20">
            <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Lock className="h-6 w-6 text-primary mx-auto" />
                <p className="text-sm font-medium text-foreground">Introduce tu email para ver el resultado</p>
              </div>
            </div>
            
            <div className="relative z-0 space-y-3 opacity-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm">Ganancia Patrimonial</span>
                </div>
                <span className="font-bold">{formatCurrency(taxResult.capitalGain)}</span>
              </div>
              <div className="flex justify-between items-center text-destructive">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm">Impuesto Estimado</span>
                </div>
                <span className="font-bold">{formatCurrency(taxResult.totalTax)}</span>
              </div>
              <div className="flex justify-between items-center text-primary">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="text-sm">Neto Después de Impuestos</span>
                </div>
                <span className="font-bold text-lg">{formatCurrency(taxResult.netAfterTax)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de captura */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 pb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Datos de contacto</h3>
            </div>

            {/* Email - Obligatorio */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm font-medium">
                Email <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`pl-10 h-12 bg-background ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Nombre - Opcional */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center text-sm font-medium">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.fullName || ''}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={`pl-10 h-12 bg-background ${errors.fullName ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            {/* Teléfono - Opcional */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 612 345 678"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`pl-10 h-12 bg-background ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Empresa - Opcional */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center text-sm font-medium">
                Empresa
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  placeholder="Nombre de tu empresa"
                  value={formData.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  className={`pl-10 h-12 bg-background ${errors.company ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
            </div>

            {/* Checkbox privacidad */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptPrivacy"
                  checked={formData.acceptPrivacy === true}
                  onCheckedChange={(checked) => updateField('acceptPrivacy', checked === true ? true : undefined as any)}
                  className={errors.acceptPrivacy ? 'border-destructive' : ''}
                />
                <Label htmlFor="acceptPrivacy" className="text-sm leading-relaxed cursor-pointer">
                  Acepto la{' '}
                  <a 
                    href="https://capittal.es/politica-de-privacidad" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    política de privacidad
                  </a>
                  {' '}y el tratamiento de mis datos para recibir información sobre servicios de asesoramiento fiscal.
                </Label>
              </div>
              {errors.acceptPrivacy && <p className="text-xs text-destructive">{errors.acceptPrivacy}</p>}
            </div>

            {/* Botón submit */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  Ver mi resultado fiscal
                  <TrendingUp className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Tus datos están seguros y no serán compartidos con terceros.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
