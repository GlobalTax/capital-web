
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Building2, Calculator, TrendingUp } from 'lucide-react';
import { 
  validateEmail, 
  validateCompanyName, 
  validateContactName, 
  validateSpanishPhone,
  formatSpanishPhone 
} from '@/utils/validationUtils';
import { sanitizeObject } from '@/utils/sanitization';

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
    baseValuation: '',
    whatsapp_opt_in: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'contactName':
        const nameValidation = validateContactName(value);
        return nameValidation.isValid ? null : nameValidation.message || 'Nombre inválido';
      
      case 'companyName':
        const companyValidation = validateCompanyName(value);
        return companyValidation.isValid ? null : companyValidation.message || 'Nombre de empresa inválido';
      
      case 'email':
        if (!value) return null; // Email es opcional en este formulario
        const emailValidation = validateEmail(value);
        return emailValidation.isValid ? null : emailValidation.message || 'Email inválido';
      
      case 'phone':
        if (!value) return null; // Teléfono es opcional
        const phoneValidation = validateSpanishPhone(value);
        return phoneValidation.isValid ? null : phoneValidation.message || 'Teléfono inválido';
      
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitizar todos los campos antes de procesar
    const sanitizedData = sanitizeObject(formData, {
      contactName: 'STRICT',
      companyName: 'STRICT',
      email: 'STRICT',
      phone: 'STRICT',
      industry: 'STRICT',
      revenue: 'STRICT',
      ebitda: 'STRICT',
      baseValuation: 'STRICT'
    });

    // Validar campos requeridos
    const newErrors: Record<string, string> = {};
    
    if (!sanitizedData.contactName) {
      newErrors.contactName = 'El nombre es requerido';
    } else {
      const error = validateField('contactName', sanitizedData.contactName);
      if (error) newErrors.contactName = error;
    }

    if (!sanitizedData.companyName) {
      newErrors.companyName = 'El nombre de la empresa es requerido';
    } else {
      const error = validateField('companyName', sanitizedData.companyName);
      if (error) newErrors.companyName = error;
    }

    // Validar campos opcionales si están presentes
    if (sanitizedData.email) {
      const error = validateField('email', sanitizedData.email);
      if (error) newErrors.email = error;
    }

    if (sanitizedData.phone) {
      const error = validateField('phone', sanitizedData.phone);
      if (error) newErrors.phone = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Limpiar errores
    setErrors({});
    
    const revenue = parseFloat(sanitizedData.revenue) || 0;
    const ebitda = parseFloat(sanitizedData.ebitda) || 0;
    let baseValuation = parseFloat(sanitizedData.baseValuation) || 0;
    
    // Si no hay valoración base, calcular una aproximada (4x EBITDA)
    if (baseValuation === 0 && ebitda > 0) {
      baseValuation = ebitda * 4;
    }

    const processedData: CompanyDataV4 = {
      contactName: sanitizedData.contactName || 'Usuario',
      companyName: sanitizedData.companyName || 'Mi Empresa',
      email: sanitizedData.email || 'contacto@empresa.com',
      phone: sanitizedData.phone ? sanitizedData.phone.trim() : '',
      industry: sanitizedData.industry || 'Otros',
      revenue,
      ebitda,
      baseValuation,
      whatsapp_opt_in: true // Consentimiento unificado activado automáticamente
    };

    onSubmit(processedData);
  };

  const handleInputChange = (field: string, value: string) => {
    // Aplicar sanitización en tiempo real para campos de texto
    let sanitizedValue = value;
    
    if (field === 'phone') {
      sanitizedValue = formatSpanishPhone(value);
    }
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
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
                  <Label htmlFor="contactName">Nombre de contacto *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    onBlur={(e) => handleBlur('contactName', e.target.value)}
                    placeholder="Tu nombre"
                    className={errors.contactName ? 'border-destructive' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-destructive mt-1">{errors.contactName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="companyName">Nombre de la empresa *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={(e) => handleBlur('companyName', e.target.value)}
                    placeholder="Nombre de tu empresa"
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                  )}
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
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    placeholder="contacto@empresa.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder="600 000 000"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                   )}
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

              {/* Consentimiento y botón de envío */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-5">
                    Al hacer clic en "Calcular Valoración", acepto que Capittal procese mis datos para generar el informe de valoración y enviármelo por WhatsApp si he proporcionado mi número de teléfono. Puedo darme de baja en cualquier momento.
                  </p>
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calcular Valoración
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StandaloneCompanyForm;
