import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Building2, Calculator, TrendingUp } from 'lucide-react';

interface StandaloneCompanyFormProps {
  onSubmit: (data: CompanyDataV4) => void;
}

const StandaloneCompanyForm = ({ onSubmit }: StandaloneCompanyFormProps) => {
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    revenue: '',
    ebitda: '',
    baseValuation: ''
  });

  const industries = [
    'Tecnología',
    'Servicios',
    'Retail/Comercio',
    'Manufacturado',
    'Sanitario',
    'Inmobiliario',
    'Construcción',
    'Alimentación',
    'Consultoría',
    'Educación',
    'Hostelería',
    'Transporte',
    'Energía',
    'Fintech',
    'Otros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const revenue = parseFloat(formData.revenue) || 0;
    const ebitda = parseFloat(formData.ebitda) || 0;
    let baseValuation = parseFloat(formData.baseValuation) || 0;
    
    // Si no hay valoración base, calcular una aproximada (4x EBITDA)
    if (baseValuation === 0 && ebitda > 0) {
      baseValuation = ebitda * 4;
    }

    const companyData: CompanyDataV4 = {
      contactName: formData.contactName || 'Usuario',
      companyName: formData.companyName || 'Mi Empresa',
      email: formData.email || 'contacto@empresa.com',
      phone: formData.phone || '+34 000 000 000',
      industry: formData.industry || 'Otros',
      revenue,
      ebitda,
      baseValuation
    };

    onSubmit(companyData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Calculadora de Valoración
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Versión Standalone - Calcula la valoración de tu empresa
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Introduce los datos básicos para comenzar el análisis
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Información básica */}
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

              {/* Contacto */}
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
                    placeholder="+34 000 000 000"
                  />
                </div>
              </div>

              {/* Sector */}
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
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Datos financieros */}
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

              {/* Valoración base (opcional) */}
              <div>
                <Label htmlFor="baseValuation">Valoración base (€) - Opcional</Label>
                <Input
                  id="baseValuation"
                  type="number"
                  value={formData.baseValuation}
                  onChange={(e) => handleInputChange('baseValuation', e.target.value)}
                  placeholder="Se calculará automáticamente si no se especifica"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si no se especifica, se usará un múltiplo de 4x EBITDA
                </p>
              </div>

              {/* Botón de envío */}
              <Button type="submit" className="w-full" size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Calcular Valoración
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StandaloneCompanyForm;