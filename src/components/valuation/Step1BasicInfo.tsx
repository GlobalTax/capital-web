
import React from 'react';
import { formatSpanishPhone } from '@/utils/validationUtils';
import { validateCIF } from '@/utils/valuationValidation';
import { Check } from 'lucide-react';

interface Step1Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
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

const Step1BasicInfo: React.FC<Step1Props> = ({ 
  companyData, 
  updateField, 
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors = {}
}) => {
  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatSpanishPhone(value);
    updateField('phone', formattedPhone);
  };

  const getFieldClassName = (fieldName: string, hasValue: boolean) => {
    if (!getFieldState) {
      // Fallback al comportamiento anterior si no hay getFieldState
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300";
    }
    
    const state = getFieldState(fieldName);
    
    if (state.isValid && hasValue) {
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-green-500 pr-10";
    } else if (state.hasError && (showValidation || state.isTouched)) {
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 border-red-500";
    }
    
    return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300";
  };

  const shouldShowCheckIcon = (fieldName: string, hasValue: boolean) => {
    if (!getFieldState) return false;
    const state = getFieldState(fieldName);
    return state.isValid && hasValue;
  };

  const shouldShowError = (fieldName: string) => {
    if (!getFieldState) {
      return showValidation && errors[fieldName];
    }
    const state = getFieldState(fieldName);
    return state.hasError && (showValidation || state.isTouched);
  };

  const getErrorMessage = (fieldName: string) => {
    if (!getFieldState) {
      return errors[fieldName];
    }
    const state = getFieldState(fieldName);
    return state.errorMessage;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Básica</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de contacto *
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            autoComplete="given-name"
            value={companyData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            onBlur={() => handleFieldBlur?.('contactName')}
            className={getFieldClassName('contactName', Boolean(companyData.contactName))}
            placeholder="Ingrese su nombre completo"
          />
          {shouldShowCheckIcon('contactName', Boolean(companyData.contactName)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('contactName') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('contactName')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la empresa *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            autoComplete="organization"
            value={companyData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            onBlur={() => handleFieldBlur?.('companyName')}
            className={getFieldClassName('companyName', Boolean(companyData.companyName))}
            placeholder="Ingrese el nombre de su empresa"
          />
          {shouldShowCheckIcon('companyName', Boolean(companyData.companyName)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('companyName') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('companyName')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">
            CIF
          </label>
          <input
            type="text"
            id="cif"
            name="cif"
            autoComplete="off"
            value={companyData.cif}
            onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
            onBlur={() => handleFieldBlur?.('cif')}
            className={getFieldClassName('cif', Boolean(companyData.cif))}
            placeholder="A12345674"
            maxLength={9}
          />
          {shouldShowCheckIcon('cif', Boolean(companyData.cif)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('cif') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('cif')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={companyData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => handleFieldBlur?.('email')}
            className={getFieldClassName('email', Boolean(companyData.email))}
            placeholder="empresa@ejemplo.com"
          />
          {shouldShowCheckIcon('email', Boolean(companyData.email)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('email') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            value={companyData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => handleFieldBlur?.('phone')}
            className={getFieldClassName('phone', Boolean(companyData.phone))}
            placeholder="+34 123 456 789"
            maxLength={15}
          />
          {shouldShowCheckIcon('phone', Boolean(companyData.phone)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('phone')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Sector de actividad *
          </label>
          <select
            id="industry"
            name="industry"
            autoComplete="off"
            value={companyData.industry}
            onChange={(e) => {
              updateField('industry', e.target.value);
              handleFieldBlur?.('industry');
            }}
            className={getFieldClassName('industry', Boolean(companyData.industry))}
          >
            <option value="">Seleccione un sector</option>
            <option value="tecnologia">Tecnología</option>
            <option value="salud">Salud</option>
            <option value="manufactura">Manufactura</option>
            <option value="retail">Retail</option>
            <option value="servicios">Servicios</option>
            <option value="finanzas">Finanzas</option>
            <option value="inmobiliario">Inmobiliario</option>
            <option value="energia">Energía</option>
            <option value="consultoria">Consultoría</option>
            <option value="educacion">Educación</option>
            <option value="turismo">Turismo</option>
            <option value="agricultura">Agricultura</option>
            <option value="construccion">Construcción</option>
            <option value="otro">Otro</option>
          </select>
          {shouldShowCheckIcon('industry', Boolean(companyData.industry)) && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {shouldShowError('industry') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('industry')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="yearsOfOperation" className="block text-sm font-medium text-gray-700 mb-2">
            Años de funcionamiento *
          </label>
          <input
            type="number"
            id="yearsOfOperation"
            name="yearsOfOperation"
            autoComplete="off"
            value={companyData.yearsOfOperation || ''}
            onChange={(e) => updateField('yearsOfOperation', parseInt(e.target.value) || 0)}
            onBlur={() => handleFieldBlur?.('yearsOfOperation')}
            className={getFieldClassName('yearsOfOperation', Boolean(companyData.yearsOfOperation))}
            placeholder="5"
            min="1"
          />
          {shouldShowCheckIcon('yearsOfOperation', Boolean(companyData.yearsOfOperation > 0)) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {shouldShowError('yearsOfOperation') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('yearsOfOperation')}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="employeeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Número de empleados *
          </label>
          <select
            id="employeeRange"
            name="employeeRange"
            autoComplete="off"
            value={companyData.employeeRange}
            onChange={(e) => {
              updateField('employeeRange', e.target.value);
              handleFieldBlur?.('employeeRange');
            }}
            className={getFieldClassName('employeeRange', Boolean(companyData.employeeRange))}
          >
            <option value="">Seleccione un rango</option>
            <option value="2-5">2-5 empleados</option>
            <option value="6-25">6-25 empleados</option>
            <option value="26-99">26-99 empleados</option>
            <option value="100-249">100-249 empleados</option>
            <option value="250-499">250-499 empleados</option>
            <option value="500+">500+ empleados</option>
          </select>
          {shouldShowCheckIcon('employeeRange', Boolean(companyData.employeeRange)) && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {shouldShowError('employeeRange') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('employeeRange')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
