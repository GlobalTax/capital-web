import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calculator, TrendingUp, Users, Building2, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Valoración Sector Seguridad</h1>
            </div>
            <p className="text-muted-foreground">
              Valoración inicial para {formData.company_name}
            </p>
          </div>

          {/* Results */}
          <div className="grid gap-6 mb-8">
            {/* Main Valuation Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rango de Valoración Estimado
                </CardTitle>
                <CardDescription>
                  Basado en múltiplos del sector seguridad - {selectedSubtype?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Conservador</div>
                    <div className="text-xl font-bold">{formatCurrency(result.ev_low)}</div>
                    <div className="text-xs text-muted-foreground">{result.ebitda_multiple_low}x EBITDA</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-primary bg-primary/5">
                    <div className="text-sm text-muted-foreground mb-1">Base</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(result.ev_base)}</div>
                    <div className="text-xs text-muted-foreground">{result.ebitda_multiple_base}x EBITDA</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Optimista</div>
                    <div className="text-xl font-bold">{formatCurrency(result.ev_high)}</div>
                    <div className="text-xs text-muted-foreground">{result.ebitda_multiple_high}x EBITDA</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    {selectedSubtype?.label}
                  </Badge>
                  <Badge variant="outline">
                    Múltiplos: {selectedSubtype?.multiple_range}
                  </Badge>
                  <Badge variant="outline">
                    EBITDA: {EBITDA_BANDS.find(b => b.value === formData.ebitda_band)?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Próximos Pasos
                </CardTitle>
                <CardDescription>
                  ¿Quieres una valoración más detallada y precisa?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <h3 className="font-semibold mb-2">🎯 Análisis Profesional Completo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Nuestros expertos en el sector seguridad realizarán un análisis detallado de tu empresa, 
                      incluyendo múltiplos ajustados, benchmarking sectorial y análisis de sensibilidad.
                    </p>
                    <Button className="w-full" size="sm">
                      Solicitar Análisis Completo
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded border">
                      <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="font-semibold text-sm">Valoración Detallada</div>
                      <div className="text-xs text-muted-foreground">Con ajustes específicos</div>
                    </div>
                    <div className="text-center p-3 rounded border">
                      <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="font-semibold text-sm">Informe PDF</div>
                      <div className="text-xs text-muted-foreground">Documento profesional</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Calculadora Sector Seguridad</h1>
          </div>
          <p className="text-muted-foreground">
            Obtén una valoración inicial de tu empresa de seguridad en menos de 3 minutos
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Información de tu Empresa
            </CardTitle>
            <CardDescription>
              Completa los datos básicos para obtener una valoración inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nombre de Contacto *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF/NIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                    placeholder="B12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="security_subtype">Tipo de Empresa de Seguridad *</Label>
              <Select value={formData.security_subtype} onValueChange={(value) => setFormData(prev => ({ ...prev, security_subtype: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de empresa" />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_SUBTYPES.map((subtype) => (
                    <SelectItem key={subtype.value} value={subtype.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{subtype.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {subtype.multiple_range}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue_band">Facturación Anual *</Label>
                <Select value={formData.revenue_band} onValueChange={(value) => setFormData(prev => ({ ...prev, revenue_band: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rango de facturación" />
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
                <Label htmlFor="ebitda_band">EBITDA Anual *</Label>
                <Select value={formData.ebitda_band} onValueChange={(value) => setFormData(prev => ({ ...prev, ebitda_band: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rango de EBITDA" />
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
            <Button
              onClick={calculateValuation}
              disabled={!isFormValid() || isCalculating}
              className="w-full"
              size="lg"
            >
              {isCalculating ? "Calculando..." : "Calcular Valoración"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Esta es una valoración inicial basada en múltiplos del sector seguridad.</p>
          <p>Para obtener una valoración detallada, solicita nuestro análisis profesional completo.</p>
        </div>
      </div>
    </div>
  );
}