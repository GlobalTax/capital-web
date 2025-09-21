import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UnifiedLayout from '@/components/shared/UnifiedLayout';
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
  connections_count: string;
  revenue_recurrence: string;
  contract_duration: string;
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

const CONNECTIONS_RANGES = [
  { value: '1-50', label: '1 - 50 conexiones' },
  { value: '51-100', label: '51 - 100 conexiones' },
  { value: '101-250', label: '101 - 250 conexiones' },
  { value: '251-500', label: '251 - 500 conexiones' },
  { value: '501-1000', label: '501 - 1,000 conexiones' },
  { value: '1000+', label: 'Más de 1,000 conexiones' }
];

const REVENUE_RECURRENCE = [
  { value: 'mensual', label: 'Facturación Mensual Recurrente' },
  { value: 'trimestral', label: 'Facturación Trimestral' },
  { value: 'anual', label: 'Facturación Anual' },
  { value: 'mixta', label: 'Mixta (Recurrente + Proyectos)' },
  { value: 'proyecto', label: 'Solo Proyectos Puntuales' }
];

const CONTRACT_DURATION = [
  { value: '1-2-años', label: '1-2 años' },
  { value: '3-5-años', label: '3-5 años' },
  { value: '5+-años', label: 'Más de 5 años' },
  { value: 'indefinido', label: 'Contratos indefinidos' },
  { value: 'mixto', label: 'Duración mixta' }
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
    connections_count: '',
    revenue_recurrence: '',
    contract_duration: '',
    revenue_band: '',
    ebitda_band: ''
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const getValidationState = (fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    const hasValue = Boolean(formData[fieldName as keyof SecurityCalculatorForm]);
    return {
      isTouched,
      hasError: false,
      isValid: hasValue,
      errorMessage: ''
    };
  };

  const getFieldClassName = (fieldName: string, isRequired: boolean = true) => {
    const state = getValidationState(fieldName);
    const hasValue = Boolean(formData[fieldName as keyof SecurityCalculatorForm]);
    
    if (!state.isTouched) {
      return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
    }
    
    if (state.isValid && hasValue && state.isTouched) {
      return "w-full border-0.5 border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-lg px-4 py-3 pr-10";
    } else if (!state.isValid && isRequired && (state.isTouched && !hasValue)) {
      return "w-full border-0.5 border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg px-4 py-3";
    }
    
    return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
  };

  const shouldShowCheckIcon = (fieldName: string) => {
    const state = getValidationState(fieldName);
    const hasValue = Boolean(formData[fieldName as keyof SecurityCalculatorForm]);
    return state.isValid && hasValue && state.isTouched;
  };

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
      <UnifiedLayout variant="landing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Valoración de {formData.company_name}
              </h1>
              <p className="text-lg text-gray-600 mb-8 text-center">
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
                <span className="text-sm text-gray-500 text-center">Múltiplos aplicados: {selectedSubtype?.multiple_range}</span>
              </div>

              {/* CTA Section */}
              <div className="admin-card p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">¿Quieres un análisis más detallado?</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto text-center">
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
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout variant="landing">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="sr-only">Calculadora de Valoración - Sector Seguridad</h1>
        
        <Card className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Calculadora de Valoración
            </h2>
            <p className="text-lg text-gray-600 text-center">
              Sector Seguridad
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 text-center">
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">Nombre *</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      onBlur={() => handleBlur('contact_name')}
                      placeholder="Tu nombre completo"
                      className={getFieldClassName('contact_name')}
                    />
                    {shouldShowCheckIcon('contact_name') && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
                </div>

                {/* Email */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      onBlur={() => handleBlur('email')}
                      placeholder="tu@empresa.com"
                      className={getFieldClassName('email')}
                    />
                    {shouldShowCheckIcon('email') && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
                </div>
              </div>

              {/* Nombre de la Empresa */}
              <div className="h-[100px] flex flex-col">
                <div className="relative flex-1">
                  <Label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    onBlur={() => handleBlur('company_name')}
                    placeholder="Nombre completo de tu empresa"
                    className={getFieldClassName('company_name')}
                  />
                  {shouldShowCheckIcon('company_name') && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="h-[20px] mt-1">
                  {/* Reserved space for consistency */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CIF */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">CIF/NIF</Label>
                    <Input
                      id="cif"
                      value={formData.cif}
                      onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                      onBlur={() => handleBlur('cif')}
                      placeholder="B12345678"
                      className={getFieldClassName('cif', false)}
                    />
                    {shouldShowCheckIcon('cif') && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
                </div>

                {/* Sitio Web */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      onBlur={() => handleBlur('website')}
                      placeholder="www.tuempresa.com"
                      className={getFieldClassName('website', false)}
                    />
                    {shouldShowCheckIcon('website') && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Type Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 text-center">
                Tipo de Empresa de Seguridad
              </h3>
              
              <div className="h-[120px] flex flex-col">
                <div className="relative flex-1">
                  <Label htmlFor="security_subtype" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Empresa *</Label>
                  <Select
                    value={formData.security_subtype}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, security_subtype: value }));
                      handleBlur('security_subtype');
                    }}
                  >
                    <SelectTrigger 
                      id="security_subtype"
                      className={getFieldClassName('security_subtype')}
                    >
                      <SelectValue placeholder="Selecciona el tipo de empresa" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-lg border border-gray-200 z-[100]">
                      {SECURITY_SUBTYPES.map((subtype) => (
                        <SelectItem key={subtype.value} value={subtype.value} className="hover:bg-gray-100">
                          <div>
                            <div className="font-medium">{subtype.label}</div>
                            <div className="text-xs text-gray-500">Múltiplos EBITDA: {subtype.multiple_range}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shouldShowCheckIcon('security_subtype') && (
                    <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                  )}
                </div>
                <div className="h-[40px] mt-1 space-y-1">
                  <p className="text-sm text-gray-500">Selecciona la categoría que mejor describe tu empresa de seguridad</p>
                  <div className="h-[20px]">
                    {/* Reserved space for consistency */}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Security Details Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 text-center">
                Detalles Específicos de Seguridad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número de Conexiones */}
                <div className="h-[120px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="connections_count" className="block text-sm font-medium text-gray-700 mb-2">Número de Conexiones</Label>
                    <Select 
                      value={formData.connections_count} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, connections_count: value }));
                        setTouchedFields(prev => new Set(prev).add('connections_count'));
                      }}
                    >
                      <SelectTrigger className={getFieldClassName('connections_count', false)}>
                        <SelectValue placeholder="Selecciona el rango de conexiones" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                        {CONNECTIONS_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value} className="hover:bg-gray-50">
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shouldShowCheckIcon('connections_count') && (
                      <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    <span className="text-xs text-gray-500">Conexiones monitorizadas o gestionadas</span>
                  </div>
                </div>

                {/* Recurrencia de Ingresos */}
                <div className="h-[120px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="revenue_recurrence" className="block text-sm font-medium text-gray-700 mb-2">Modelo de Ingresos</Label>
                    <Select 
                      value={formData.revenue_recurrence} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, revenue_recurrence: value }));
                        setTouchedFields(prev => new Set(prev).add('revenue_recurrence'));
                      }}
                    >
                      <SelectTrigger className={getFieldClassName('revenue_recurrence', false)}>
                        <SelectValue placeholder="Selecciona el modelo de ingresos" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                        {REVENUE_RECURRENCE.map((model) => (
                          <SelectItem key={model.value} value={model.value} className="hover:bg-gray-50">
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shouldShowCheckIcon('revenue_recurrence') && (
                      <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    <span className="text-xs text-gray-500">Frecuencia de facturación principal</span>
                  </div>
                </div>
              </div>

              {/* Duración de Contratos */}
              <div className="h-[120px] flex flex-col">
                <div className="relative flex-1">
                  <Label htmlFor="contract_duration" className="block text-sm font-medium text-gray-700 mb-2">Duración Promedio de Contratos</Label>
                  <Select 
                    value={formData.contract_duration} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, contract_duration: value }));
                      setTouchedFields(prev => new Set(prev).add('contract_duration'));
                    }}
                  >
                    <SelectTrigger className={getFieldClassName('contract_duration', false)}>
                      <SelectValue placeholder="Selecciona la duración típica" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                      {CONTRACT_DURATION.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value} className="hover:bg-gray-50">
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {shouldShowCheckIcon('contract_duration') && (
                    <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                  )}
                </div>
                <div className="h-[20px] mt-1">
                  <span className="text-xs text-gray-500">Duración típica de tus contratos de seguridad</span>
                </div>
              </div>
            </div>

            {/* Financial Metrics Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 text-center">
                Métricas Financieras
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facturación Anual */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="revenue_band" className="block text-sm font-medium text-gray-700 mb-2">Facturación Anual *</Label>
                    <Select 
                      value={formData.revenue_band} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, revenue_band: value }));
                        handleBlur('revenue_band');
                      }}
                    >
                      <SelectTrigger 
                        id="revenue_band"
                        className={getFieldClassName('revenue_band')}
                      >
                        <SelectValue placeholder="Selecciona tu facturación" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg border border-gray-200 z-[100]">
                        {REVENUE_BANDS.map((band) => (
                          <SelectItem key={band.value} value={band.value} className="hover:bg-gray-100">
                            {band.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shouldShowCheckIcon('revenue_band') && (
                      <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
                </div>

                {/* EBITDA */}
                <div className="h-[100px] flex flex-col">
                  <div className="relative flex-1">
                    <Label htmlFor="ebitda_band" className="block text-sm font-medium text-gray-700 mb-2">EBITDA *</Label>
                    <Select 
                      value={formData.ebitda_band} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, ebitda_band: value }));
                        handleBlur('ebitda_band');
                      }}
                    >
                      <SelectTrigger 
                        id="ebitda_band"
                        className={getFieldClassName('ebitda_band')}
                      >
                        <SelectValue placeholder="Selecciona tu EBITDA" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg border border-gray-200 z-[100]">
                        {EBITDA_BANDS.map((band) => (
                          <SelectItem key={band.value} value={band.value} className="hover:bg-gray-100">
                            {band.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shouldShowCheckIcon('ebitda_band') && (
                      <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                    )}
                  </div>
                  <div className="h-[20px] mt-1">
                    {/* Reserved space for consistency */}
                  </div>
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
    </UnifiedLayout>
  );
}