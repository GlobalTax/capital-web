import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LandingLayout from '@/components/shared/LandingLayout';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import CapittalBrief from '@/components/landing/CapittalBrief';

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
      <LandingLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Valoración de {formData.company_name}
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Sector Seguridad - {selectedSubtype?.label}
              </p>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="admin-card text-center p-6">
                  <div className="text-sm text-gray-500 mb-2 font-medium">Conservador</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.ev_low)}</div>
                  <div className="text-xs text-gray-400 mt-1">{result.ebitda_multiple_low}x EBITDA</div>
                </div>
                <div className="admin-card text-center p-6 border-2 border-gray-900 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-2 font-medium">Valoración Base</div>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(result.ev_base)}</div>
                  <div className="text-xs text-gray-400 mt-1">{result.ebitda_multiple_base}x EBITDA</div>
                </div>
                <div className="admin-card text-center p-6">
                  <div className="text-sm text-gray-500 mb-2 font-medium">Optimista</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.ev_high)}</div>
                  <div className="text-xs text-gray-400 mt-1">{result.ebitda_multiple_high}x EBITDA</div>
                </div>
              </div>

              <div className="text-center mb-8">
                <span className="text-sm text-gray-500">Múltiplos aplicados: {selectedSubtype?.multiple_range}</span>
              </div>

              {/* CTA Section */}
              <div className="admin-card p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">¿Quieres un análisis más detallado?</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  Obtén una valoración profesional completa de tu empresa con nuestros expertos en el sector seguridad.
                </p>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 px-8" size="lg">
                  Solicitar Valoración Profesional
                </Button>
              </div>

              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(true);
                    setResult(null);
                  }}
                  className="border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  Nueva Valoración
                </Button>
              </div>
            </div>
          </Card>
          
          <ConfidentialityBlock />
          <CapittalBrief />
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="sr-only">Calculadora de Valoración - Sector Seguridad</h1>
        
        <Card className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Calculadora de Valoración
            </h2>
            <p className="text-lg text-gray-600">
              Sector Seguridad
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-field">
                  <Label htmlFor="contact_name" className="text-gray-900 font-medium">Nombre *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="Tu nombre completo"
                    className="admin-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="email" className="text-gray-900 font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@empresa.com"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <Label htmlFor="company_name" className="text-gray-900 font-medium">Nombre de la Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Nombre completo de tu empresa"
                  className="admin-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-field">
                  <Label htmlFor="cif" className="text-gray-900 font-medium">CIF/NIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                    placeholder="B12345678"
                    className="admin-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="website" className="text-gray-900 font-medium">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.tuempresa.com"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Company Type Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Tipo de Empresa de Seguridad *
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECURITY_SUBTYPES.map((subtype) => (
                  <div
                    key={subtype.value}
                    onClick={() => setFormData(prev => ({ ...prev, security_subtype: subtype.value }))}
                    className={`admin-card p-6 cursor-pointer transition-all hover:shadow-md ${
                      formData.security_subtype === subtype.value
                        ? 'border-2 border-gray-900 bg-gray-50'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">{subtype.label}</div>
                    <div className="text-sm text-gray-600">Múltiplos EBITDA: {subtype.multiple_range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Metrics Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Métricas Financieras
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-field">
                  <Label htmlFor="revenue_band" className="text-gray-900 font-medium">Facturación Anual *</Label>
                  <Select value={formData.revenue_band} onValueChange={(value) => setFormData(prev => ({ ...prev, revenue_band: value }))}>
                    <SelectTrigger className="admin-input">
                      <SelectValue placeholder="Selecciona tu facturación" />
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

                <div className="form-field">
                  <Label htmlFor="ebitda_band" className="text-gray-900 font-medium">EBITDA *</Label>
                  <Select value={formData.ebitda_band} onValueChange={(value) => setFormData(prev => ({ ...prev, ebitda_band: value }))}>
                    <SelectTrigger className="admin-input">
                      <SelectValue placeholder="Selecciona tu EBITDA" />
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
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                onClick={calculateValuation} 
                disabled={!isFormValid() || isCalculating}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg font-medium"
              >
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Calculando Valoración...
                  </div>
                ) : (
                  "Calcular Valoración"
                )}
              </Button>
            </div>
          </div>
        </Card>
        
        <ConfidentialityBlock />
        <CapittalBrief />
      </div>
    </LandingLayout>
  );
}