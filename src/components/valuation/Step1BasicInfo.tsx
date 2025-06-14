import React from 'react';
import { validateEmail, validateCompanyName, validateContactName, validateSpanishPhone, formatSpanishPhone } from '@/utils/validationUtils';
import { Check } from 'lucide-react';

interface Step1Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

// Función para validar CIF español
const validateCIF = (cif: string): boolean => {
  if (!cif || cif.length !== 9) return false;
  
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  if (!cifRegex.test(cif.toUpperCase())) return false;
  
  const letter = cif.charAt(0).toUpperCase();
  const numbers = cif.substring(1, 8);
  const control = cif.charAt(8).toUpperCase();
  
  // Calcular dígito de control
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    let digit = parseInt(numbers.charAt(i));
    if (i % 2 === 1) { // posiciones pares (índice impar)
      sum += digit;
    } else { // posiciones impares (índice par)
      digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    }
  }
  
  const controlNumber = (10 - (sum % 10)) % 10;
  const controlLetter = 'JABCDEFGHI'.charAt(controlNumber);
  
  // Verificar según el tipo de organización
  const numberControl = ['A', 'B', 'E', 'H'].includes(letter);
  const letterControl = ['K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'W'].includes(letter);
  
  if (numberControl) {
    return control === controlNumber.toString();
  } else if (letterControl) {
    return control === controlLetter;
  } else {
    return control === controlNumber.toString() || control === controlLetter;
  }
};

const Step1BasicInfo: React.FC<Step1Props> = ({ companyData, updateField, showValidation = false }) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatSpanishPhone(value);
    updateField('phone', formattedPhone);
  };

  const contactNameValidation = validateContactName(companyData.contactName);
  const companyNameValidation = validateCompanyName(companyData.companyName);
  const emailValidation = validateEmail(companyData.email);
  const phoneValidation = validateSpanishPhone(companyData.phone);
  const cifValid = Boolean(companyData.cif) && validateCIF(companyData.cif);

  const getFieldClassName = (isValid: boolean, hasValue: boolean, fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    
    if (!showValidation && !isTouched) {
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-green-500 pr-10";
    } else if (!isValid && (showValidation || (isTouched && hasValue))) {
      return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 border-red-500";
    }
    
    return "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300";
  };

  const shouldShowCheckIcon = (isValid: boolean, hasValue: boolean, fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    return isValid && hasValue && (isTouched || showValidation);
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
            value={companyData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            onBlur={() => handleBlur('contactName')}
            className={getFieldClassName(contactNameValidation.isValid, Boolean(companyData.contactName), 'contactName')}
            placeholder="Ingrese su nombre completo"
          />
          {shouldShowCheckIcon(contactNameValidation.isValid, Boolean(companyData.contactName), 'contactName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !contactNameValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{contactNameValidation.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la empresa *
          </label>
          <input
            type="text"
            id="companyName"
            value={companyData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            onBlur={() => handleBlur('companyName')}
            className={getFieldClassName(companyNameValidation.isValid, Boolean(companyData.companyName), 'companyName')}
            placeholder="Ingrese el nombre de su empresa"
          />
          {shouldShowCheckIcon(companyNameValidation.isValid, Boolean(companyData.companyName), 'companyName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !companyNameValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{companyNameValidation.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">
            CIF *
          </label>
          <input
            type="text"
            id="cif"
            value={companyData.cif}
            onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('cif')}
            className={getFieldClassName(cifValid, Boolean(companyData.cif), 'cif')}
            placeholder="A12345674"
            maxLength={9}
          />
          {shouldShowCheckIcon(cifValid, Boolean(companyData.cif), 'cif') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !cifValid && (
            <p className="mt-1 text-sm text-red-600">Por favor, ingrese un CIF válido</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={companyData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={getFieldClassName(emailValidation.isValid, Boolean(companyData.email), 'email')}
            placeholder="empresa@ejemplo.com"
          />
          {shouldShowCheckIcon(emailValidation.isValid, Boolean(companyData.email), 'email') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !emailValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{emailValidation.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            value={companyData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={getFieldClassName(phoneValidation.isValid, Boolean(companyData.phone), 'phone')}
            placeholder="+34 123 456 789"
            maxLength={15}
          />
          {shouldShowCheckIcon(phoneValidation.isValid, Boolean(companyData.phone), 'phone') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !phoneValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{phoneValidation.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Sector de actividad *
          </label>
          <select
            id="industry"
            value={companyData.industry}
            onChange={(e) => {
              updateField('industry', e.target.value);
              handleBlur('industry');
            }}
            className={getFieldClassName(Boolean(companyData.industry), Boolean(companyData.industry), 'industry')}
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
          {shouldShowCheckIcon(Boolean(companyData.industry), Boolean(companyData.industry), 'industry') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {showValidation && !companyData.industry && (
            <p className="mt-1 text-sm text-red-600">El sector es obligatorio</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="yearsOfOperation" className="block text-sm font-medium text-gray-700 mb-2">
            Años de funcionamiento *
          </label>
          <input
            type="number"
            id="yearsOfOperation"
            value={companyData.yearsOfOperation || ''}
            onChange={(e) => updateField('yearsOfOperation', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('yearsOfOperation')}
            className={getFieldClassName(Boolean(companyData.yearsOfOperation > 0), Boolean(companyData.yearsOfOperation), 'yearsOfOperation')}
            placeholder="5"
            min="1"
          />
          {shouldShowCheckIcon(Boolean(companyData.yearsOfOperation > 0), Boolean(companyData.yearsOfOperation), 'yearsOfOperation') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !(companyData.yearsOfOperation > 0) && (
            <p className="mt-1 text-sm text-red-600">Los años de funcionamiento son obligatorios</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="employeeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Número de empleados *
          </label>
          <select
            id="employeeRange"
            value={companyData.employeeRange}
            onChange={(e) => {
              updateField('employeeRange', e.target.value);
              handleBlur('employeeRange');
            }}
            className={getFieldClassName(Boolean(companyData.employeeRange), Boolean(companyData.employeeRange), 'employeeRange')}
          >
            <option value="">Seleccione un rango</option>
            <option value="2-5">2-5 empleados</option>
            <option value="6-25">6-25 empleados</option>
            <option value="26-99">26-99 empleados</option>
            <option value="100-249">100-249 empleados</option>
            <option value="250-499">250-499 empleados</option>
            <option value="500+">500+ empleados</option>
          </select>
          {shouldShowCheckIcon(Boolean(companyData.employeeRange), Boolean(companyData.employeeRange), 'employeeRange') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {showValidation && !companyData.employeeRange && (
            <p className="mt-1 text-sm text-red-600">El rango de empleados es obligatorio</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
