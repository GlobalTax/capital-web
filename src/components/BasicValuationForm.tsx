import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calculator, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';

interface BasicValuationFormProps {
  onSubmit?: (data: any) => void;
}

const BasicValuationForm = ({ onSubmit }: BasicValuationFormProps) => {
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    industry: 'tecnologia',
    revenue: '1000000',
    ebitda: '200000'
  });

  const [result, setResult] = useState<any>(null);

  const industries = [
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'retail', label: 'Retail/Comercio' },
    { value: 'manufacturado', label: 'Manufacturado' },
    { value: 'sanitario', label: 'Sanitario' },
    { value: 'inmobiliario', label: 'Inmobiliario' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'consultoria', label: 'Consultoría' },
    { value: 'otros', label: 'Otros' }
  ];

  const calculateValuation = () => {
    const revenue = parseFloat(formData.revenue) || 0;
    const ebitda = parseFloat(formData.ebitda) || 0;
    
    // Simple calculation using EBITDA multiple
    const ebitdaMultiple = 5.5; // Average multiple
    const revenueMultiple = 1.2; // Conservative revenue multiple
    
    const ebitdaValuation = ebitda * ebitdaMultiple;
    const revenueValuation = revenue * revenueMultiple;
    
    // Use higher of the two, but cap at reasonable levels
    const baseValuation = Math.max(ebitdaValuation, revenueValuation * 0.8);
    const minValuation = baseValuation * 0.8;
    const maxValuation = baseValuation * 1.2;

    const calculationResult = {
      baseValuation: Math.round(baseValuation),
      minValuation: Math.round(minValuation),
      maxValuation: Math.round(maxValuation),
      ebitdaMultiple,
      revenueMultiple,
      companyData: formData
    };

    setResult(calculationResult);
    
    if (onSubmit) {
      onSubmit(calculationResult);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resultado de Valoración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Datos de la Empresa</h3>
                <div className="space-y-2">
                  <p><strong>Empresa:</strong> {formData.companyName}</p>
                  <p><strong>Contacto:</strong> {formData.contactName}</p>
                  <p><strong>Sector:</strong> {industries.find(i => i.value === formData.industry)?.label}</p>
                  <p><strong>Facturación:</strong> {formatCurrency(parseFloat(formData.revenue))}</p>
                  <p><strong>EBITDA:</strong> {formatCurrency(parseFloat(formData.ebitda))}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Valoración Estimada</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valoración Base</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(result.baseValuation)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Mínimo</p>
                      <p className="font-bold">{formatCurrency(result.minValuation)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Máximo</p>
                      <p className="font-bold">{formatCurrency(result.maxValuation)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Metodología:</strong> Múltiplo EBITDA de {result.ebitdaMultiple}x aplicado. 
                Esta es una estimación orientativa. Para una valoración precisa, contacta con nuestros expertos.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setResult(null)} variant="outline">
                  Nueva Valoración
                </Button>
                <Button onClick={() => window.open('https://calendly.com/capittal', '_blank')}>
                  Solicitar Valoración Profesional
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Calculadora de Valoración</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Obtén una estimación rápida del valor de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Datos de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Nombre de contacto</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Nombre de la empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="600 000 000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="industry">Sector</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu sector" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue">Facturación anual (€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  placeholder="1000000"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="ebitda">EBITDA anual (€)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  value={formData.ebitda}
                  onChange={(e) => handleInputChange('ebitda', e.target.value)}
                  placeholder="200000"
                  min="0"
                />
              </div>
            </div>

            <Button 
              onClick={calculateValuation} 
              className="w-full" 
              size="lg"
              disabled={!formData.companyName || !formData.revenue || !formData.ebitda}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Calcular Valoración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicValuationForm;