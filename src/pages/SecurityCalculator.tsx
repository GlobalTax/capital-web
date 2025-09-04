import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SecurityCalculatorForm {
  cif: string;
  email: string;
  contact_name: string;
  company_name: string;
  website: string;
  phone: string;
  security_subtype: string;
  revenue_band: string;
  ebitda_band: string;
}

interface ValuationResult {
  ev_low: number;
  ev_base: number;
  ev_high: number;
  ebitda_multiple_low: number;
  ebitda_multiple_base: number;
  ebitda_multiple_high: number;
}

const SECURITY_SUBTYPES = [
  { value: 'integrador_mantenimiento', label: 'Integrador / Mantenimiento', multiple_range: '5.0x - 7.0x' },
  { value: 'cra_monitorizacion', label: 'CRA / Monitorización', multiple_range: '6.0x - 8.5x' },
  { value: 'distribucion', label: 'Distribución', multiple_range: '4.0x - 5.5x' },
  { value: 'mixto', label: 'Mixto', multiple_range: '5.5x - 7.5x' }
];

const REVENUE_BANDS = [
  { value: '0-500k', label: '0€ - 500.000€', midpoint: 250000 },
  { value: '500k-1m', label: '500.000€ - 1M€', midpoint: 750000 },
  { value: '1m-2m', label: '1M€ - 2M€', midpoint: 1500000 },
  { value: '2m-5m', label: '2M€ - 5M€', midpoint: 3500000 },
  { value: '5m-10m', label: '5M€ - 10M€', midpoint: 7500000 },
  { value: '10m+', label: '10M€+', midpoint: 15000000 }
];

const EBITDA_BANDS = [
  { value: '0-50k', label: '0€ - 50.000€', midpoint: 25000 },
  { value: '50k-100k', label: '50.000€ - 100.000€', midpoint: 75000 },
  { value: '100k-200k', label: '100.000€ - 200.000€', midpoint: 150000 },
  { value: '200k-500k', label: '200.000€ - 500.000€', midpoint: 350000 },
  { value: '500k-1m', label: '500.000€ - 1M€', midpoint: 750000 },
  { value: '1m+', label: '1M€+', midpoint: 1500000 }
];

export default function SecurityCalculator() {
  const [formData, setFormData] = useState<SecurityCalculatorForm>({
    cif: '',
    email: '',
    contact_name: '',
    company_name: '',
    website: '',
    phone: '',
    security_subtype: '',
    revenue_band: '',
    ebitda_band: ''
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const { toast } = useToast();

  const getMultiplesBySubtype = (subtype: string) => {
    switch (subtype) {
      case 'integrador_mantenimiento':
        return { low: 5.0, base: 6.0, high: 7.0 };
      case 'cra_monitorizacion':
        return { low: 6.0, base: 7.25, high: 8.5 };
      case 'distribucion':
        return { low: 4.0, base: 4.75, high: 5.5 };
      case 'mixto':
        return { low: 5.5, base: 6.5, high: 7.5 };
      default:
        return { low: 5.0, base: 6.0, high: 7.0 };
    }
  };

  const calculateValuation = async () => {
    setIsCalculating(true);

    try {
      // Get EBITDA midpoint
      const ebitdaBand = EBITDA_BANDS.find(b => b.value === formData.ebitda_band);
      const ebitdaMidpoint = ebitdaBand?.midpoint || 0;

      // Get multiples for subtype
      const multiples = getMultiplesBySubtype(formData.security_subtype);

      // Calculate valuation ranges
      const ev_low = ebitdaMidpoint * multiples.low;
      const ev_base = ebitdaMidpoint * multiples.base;
      const ev_high = ebitdaMidpoint * multiples.high;

      const calculationResult: ValuationResult = {
        ev_low,
        ev_base,
        ev_high,
        ebitda_multiple_low: multiples.low,
        ebitda_multiple_base: multiples.base,
        ebitda_multiple_high: multiples.high
      };

      // Call edge function for complete processing
      const { error: functionError } = await supabase.functions.invoke('security-valuation-quick', {
        body: {
          ...formData,
          calculation_result: calculationResult,
          ip_address: null, // Will be set server-side
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        toast({
          title: "Error",
          description: "Hubo un problema al procesar la valoración. Inténtalo de nuevo.",
          variant: "destructive"
        });
        return;
      }

      setResult(calculationResult);
      setShowForm(false);

      toast({
        title: "¡Valoración Completada!",
        description: "Hemos calculado una valoración inicial de tu empresa de seguridad.",
      });

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al calcular la valoración. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k€`;
    }
    return `${amount.toFixed(0)}€`;
  };

  const isFormValid = () => {
    return formData.contact_name && 
           formData.company_name && 
           formData.email && 
           formData.security_subtype && 
           formData.revenue_band && 
           formData.ebitda_band;
  };

  if (!showForm && result) {
    const selectedSubtype = SECURITY_SUBTYPES.find(s => s.value === formData.security_subtype);
    
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto pt-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-foreground mb-3">
              Valoración Calculada
            </h1>
            <p className="text-foreground/70">
              {formData.company_name}
            </p>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {/* Main Valuation */}
            <div className="text-center">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-6 border border-border rounded-lg">
                  <div className="text-sm text-foreground/60 mb-2">Conservador</div>
                  <div className="text-2xl font-light text-foreground">{formatCurrency(result.ev_low)}</div>
                  <div className="text-xs text-foreground/50 mt-1">{result.ebitda_multiple_low}x EBITDA</div>
                </div>
                <div className="p-6 border-2 border-foreground rounded-lg bg-foreground/5">
                  <div className="text-sm text-foreground/60 mb-2">Base</div>
                  <div className="text-3xl font-light text-foreground">{formatCurrency(result.ev_base)}</div>
                  <div className="text-xs text-foreground/50 mt-1">{result.ebitda_multiple_base}x EBITDA</div>
                </div>
                <div className="p-6 border border-border rounded-lg">
                  <div className="text-sm text-foreground/60 mb-2">Optimista</div>
                  <div className="text-2xl font-light text-foreground">{formatCurrency(result.ev_high)}</div>
                  <div className="text-xs text-foreground/50 mt-1">{result.ebitda_multiple_high}x EBITDA</div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <span className="text-sm text-foreground/60">{selectedSubtype?.label}</span>
                <span className="text-sm text-foreground/40">•</span>
                <span className="text-sm text-foreground/60">{selectedSubtype?.multiple_range}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-center p-8 border border-border rounded-lg">
              <h3 className="text-xl font-light text-foreground mb-4">Análisis Profesional</h3>
              <p className="text-sm text-foreground/70 mb-6 max-w-md mx-auto">
                Obtén una valoración detallada con nuestros expertos en el sector seguridad
              </p>
              <Button className="px-8" size="lg">
                Solicitar Análisis Completo
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForm(true);
                setResult(null);
              }}
            >
              Nueva Valoración
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-foreground mb-3">
            Calculadora de Valoración
          </h1>
          <p className="text-foreground/70">
            Sector Seguridad
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_name" className="text-foreground">Nombre *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Tu nombre"
                  className="border-border focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@empresa.com"
                  className="border-border focus:border-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-foreground">Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Nombre de tu empresa"
                className="border-border focus:border-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cif" className="text-foreground">CIF/NIF</Label>
                <Input
                  id="cif"
                  value={formData.cif}
                  onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                  placeholder="B12345678"
                  className="border-border focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.empresa.com"
                  className="border-border focus:border-foreground"
                />
              </div>
            </div>
          </div>

          {/* Company Type - Visual Cards */}
          <div className="space-y-4">
            <Label className="text-foreground text-base">Tipo de Empresa *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECURITY_SUBTYPES.map((subtype) => (
                <div
                  key={subtype.value}
                  onClick={() => setFormData(prev => ({ ...prev, security_subtype: subtype.value }))}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.security_subtype === subtype.value
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  <div className="text-foreground font-medium mb-1">{subtype.label}</div>
                  <div className="text-sm text-foreground/60">Múltiplos {subtype.multiple_range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="revenue_band" className="text-foreground">Facturación *</Label>
              <Select value={formData.revenue_band} onValueChange={(value) => setFormData(prev => ({ ...prev, revenue_band: value }))}>
                <SelectTrigger className="border-border focus:border-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_BANDS.map((band) => (
                    <SelectItem key={band.value} value={band.value}>
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ebitda_band" className="text-foreground">EBITDA *</Label>
              <Select value={formData.ebitda_band} onValueChange={(value) => setFormData(prev => ({ ...prev, ebitda_band: value }))}>
                <SelectTrigger className="border-border focus:border-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {EBITDA_BANDS.map((band) => (
                    <SelectItem key={band.value} value={band.value}>
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <Button 
              onClick={calculateValuation} 
              disabled={!isFormValid() || isCalculating}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              size="lg"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Calculando...
                </div>
              ) : (
                "Calcular Valoración"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}