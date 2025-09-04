import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Utility function for number formatting
const formatNumberWithDots = (value: number | string): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
  if (isNaN(numValue)) return '';
  return numValue.toLocaleString('es-ES');
};

const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '')) || 0;
};

// Opciones de formulario inline
const industryOptions = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'industria', label: 'Industria' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'hosteleria', label: 'Hostelería' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'otros', label: 'Otros' }
];

const employeeRangeOptions = [
  { value: '1', label: '1 empleado' },
  { value: '2-5', label: '2-5 empleados' },
  { value: '6-10', label: '6-10 empleados' },
  { value: '11-25', label: '11-25 empleados' },
  { value: '26-50', label: '26-50 empleados' },
  { value: '51-100', label: '51-100 empleados' },
  { value: '100+', label: 'Más de 100 empleados' }
];

const locationOptions = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'valencia', label: 'Valencia' },
  { value: 'sevilla', label: 'Sevilla' },
  { value: 'bilbao', label: 'Bilbao' },
  { value: 'otros', label: 'Otros' }
];

const ownershipOptions = [
  { value: '100%', label: '100%' },
  { value: '75-99%', label: '75-99%' },
  { value: '50-74%', label: '50-74%' },
  { value: '25-49%', label: '25-49%' },
  { value: '<25%', label: 'Menos del 25%' }
];

const competitiveAdvantageOptions = [
  { value: 'tecnologia', label: 'Tecnología propia' },
  { value: 'marca', label: 'Marca reconocida' },
  { value: 'ubicacion', label: 'Ubicación privilegiada' },
  { value: 'experiencia', label: 'Experiencia del equipo' },
  { value: 'costes', label: 'Ventaja en costes' },
  { value: 'otros', label: 'Otros' }
];

interface BasicInfoFinancialFormV2Props {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
  getFieldState?: (field: string) => {
    isTouched: boolean;
    hasError: boolean;
    isValid: boolean;
    errorMessage?: string;
  };
  handleFieldBlur?: (field: string) => void;
  errors?: Record<string, string>;
}

const BasicInfoFinancialFormV2: React.FC<BasicInfoFinancialFormV2Props> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const getFieldError = (field: string) => {
    if (!showValidation) return '';
    const fieldState = getFieldState?.(field);
    return fieldState?.hasError && fieldState?.isTouched ? fieldState.errorMessage : '';
  };

  const getFieldClass = (field: string) => {
    if (!showValidation) return '';
    const fieldState = getFieldState?.(field);
    if (!fieldState?.isTouched) return '';
    return fieldState?.hasError ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500';
  };

  return (
    <div className="space-y-8">
      {/* Información de Contacto */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Nombre completo *</Label>
            <Input
              id="contactName"
              type="text"
              value={companyData.contactName || ''}
              onChange={(e) => updateField('contactName', e.target.value)}
              onBlur={() => handleFieldBlur?.('contactName')}
              placeholder="Tu nombre completo"
              className={getFieldClass('contactName')}
            />
            {getFieldError('contactName') && (
              <p className="text-sm text-red-600">{getFieldError('contactName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email corporativo *</Label>
            <Input
              id="email"
              type="email"
              value={companyData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleFieldBlur?.('email')}
              placeholder="tu@email.com"
              className={getFieldClass('email')}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-600">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (WhatsApp) *</Label>
            <Input
              id="phone"
              type="tel"
              value={companyData.phone || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateField('phone', value);
                updateField('phone_e164', value); // Por simplicidad, usar el mismo valor
              }}
              onBlur={() => handleFieldBlur?.('phone')}
              placeholder="+34 600 000 000"
              className={getFieldClass('phone')}
            />
            {getFieldError('phone') && (
              <p className="text-sm text-red-600">{getFieldError('phone')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Datos de la Empresa */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa *</Label>
            <Input
              id="companyName"
              type="text"
              value={companyData.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              onBlur={() => handleFieldBlur?.('companyName')}
              placeholder="Nombre de tu empresa"
              className={getFieldClass('companyName')}
            />
            {getFieldError('companyName') && (
              <p className="text-sm text-red-600">{getFieldError('companyName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cif">CIF/NIF</Label>
            <Input
              id="cif"
              type="text"
              value={companyData.cif || ''}
              onChange={(e) => updateField('cif', e.target.value)}
              onBlur={() => handleFieldBlur?.('cif')}
              placeholder="B12345678"
              className={getFieldClass('cif')}
            />
            {getFieldError('cif') && (
              <p className="text-sm text-red-600">{getFieldError('cif')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Sector de actividad *</Label>
            <Select value={companyData.industry || ''} onValueChange={(value) => updateField('industry', value)}>
              <SelectTrigger className={getFieldClass('industry')}>
                <SelectValue placeholder="Selecciona el sector" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('industry') && (
              <p className="text-sm text-red-600">{getFieldError('industry')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeRange">Número de empleados *</Label>
            <Select value={companyData.employeeRange || ''} onValueChange={(value) => updateField('employeeRange', value)}>
              <SelectTrigger className={getFieldClass('employeeRange')}>
                <SelectValue placeholder="Selecciona el rango" />
              </SelectTrigger>
              <SelectContent>
                {employeeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('employeeRange') && (
              <p className="text-sm text-red-600">{getFieldError('employeeRange')}</p>
            )}
          </div>

        </div>
      </div>

      {/* Datos Financieros */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Financieros</h3>
        <p className="text-sm text-gray-600 mb-4">Información del último ejercicio fiscal completo</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Facturación anual *</Label>
            <Input
              id="revenue"
              type="text"
              value={formatNumberWithDots(companyData.revenue)}
              onChange={(e) => {
                const numValue = parseFormattedNumber(e.target.value);
                updateField('revenue', numValue);
              }}
              onBlur={() => handleFieldBlur?.('revenue')}
              placeholder="500.000"
              className={getFieldClass('revenue')}
            />
            {getFieldError('revenue') && (
              <p className="text-sm text-red-600">{getFieldError('revenue')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ebitda">EBITDA *</Label>
            <Input
              id="ebitda"
              type="text"
              value={formatNumberWithDots(companyData.ebitda)}
              onChange={(e) => {
                const numValue = parseFormattedNumber(e.target.value);
                updateField('ebitda', numValue);
              }}
              onBlur={() => handleFieldBlur?.('ebitda')}
              placeholder="75.000"
              className={getFieldClass('ebitda')}
            />
            {getFieldError('ebitda') && (
              <p className="text-sm text-red-600">{getFieldError('ebitda')}</p>
            )}
          </div>
        </div>


        {/* Información sobre datos financieros */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información sobre estos datos financieros</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los ingresos incluyen todas las ventas y servicios facturados</li>
            <li>• El EBITDA es el beneficio antes de intereses, impuestos, depreciación y amortización</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default BasicInfoFinancialFormV2;