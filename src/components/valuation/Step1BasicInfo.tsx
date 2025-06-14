import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const isContactNameValid = Boolean(companyData.contactName);
  const isCompanyNameValid = Boolean(companyData.companyName);
  const isCifValid = Boolean(companyData.cif && validateCIF(companyData.cif));
  const isEmailValid = Boolean(companyData.email);
  const isIndustryValid = Boolean(companyData.industry);
  const isYearsValid = Boolean(companyData.yearsOfOperation > 0);
  const isEmployeeRangeValid = Boolean(companyData.employeeRange);

  const getFieldClassName = (isValid: boolean, hasValue: boolean, fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    
    if (!showValidation && !isTouched) {
      return "w-full border-black focus:ring-black focus:border-black";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full border-green-500 focus:ring-green-500 focus:border-green-500 pr-10";
    } else if (!isValid && (showValidation || (isTouched && hasValue))) {
      return "w-full border-red-500 focus:ring-red-500 focus:border-red-500";
    }
    
    return "w-full border-black focus:ring-black focus:border-black";
  };

  const shouldShowCheckIcon = (isValid: boolean, hasValue: boolean, fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    return isValid && hasValue && (isTouched || showValidation);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Básica</h2>
        <p className="text-gray-600">Proporciona los datos fundamentales de tu empresa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre de contacto */}
        <div className="relative">
          <Label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la persona de contacto *
          </Label>
          <Input
            id="contactName"
            value={companyData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            onBlur={() => handleBlur('contactName')}
            placeholder="Tu nombre completo"
            className={getFieldClassName(isContactNameValid, Boolean(companyData.contactName), 'contactName')}
          />
          {shouldShowCheckIcon(isContactNameValid, Boolean(companyData.contactName), 'contactName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isContactNameValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Nombre de la empresa */}
        <div className="relative">
          <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la empresa *
          </Label>
          <Input
            id="companyName"
            value={companyData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            onBlur={() => handleBlur('companyName')}
            placeholder="Nombre de tu empresa"
            className={getFieldClassName(isCompanyNameValid, Boolean(companyData.companyName), 'companyName')}
          />
          {shouldShowCheckIcon(isCompanyNameValid, Boolean(companyData.companyName), 'companyName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isCompanyNameValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* CIF */}
        <div className="relative">
          <Label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">
            CIF *
          </Label>
          <Input
            id="cif"
            value={companyData.cif}
            onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('cif')}
            placeholder="A12345678"
            className={getFieldClassName(isCifValid, Boolean(companyData.cif), 'cif')}
            maxLength={9}
          />
          {shouldShowCheckIcon(isCifValid, Boolean(companyData.cif), 'cif') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && companyData.cif && !isCifValid && (
            <p className="text-red-500 text-sm mt-1">
              CIF inválido. Formato: Letra + 7 dígitos + dígito/letra de control
            </p>
          )}
          {showValidation && !companyData.cif && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico *
          </Label>
          <Input
            id="email"
            type="email"
            value={companyData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="tu@empresa.com"
            className={getFieldClassName(isEmailValid, Boolean(companyData.email), 'email')}
          />
          {shouldShowCheckIcon(isEmailValid, Boolean(companyData.email), 'email') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isEmailValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Sector */}
        <div className="relative">
          <Label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Sector *
          </Label>
          <Select 
            value={companyData.industry} 
            onValueChange={(value) => {
              updateField('industry', value);
              handleBlur('industry');
            }}
          >
            <SelectTrigger className={getFieldClassName(isIndustryValid, Boolean(companyData.industry), 'industry')}>
              <SelectValue placeholder="Selecciona el sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnologia">Tecnología</SelectItem>
              <SelectItem value="salud">Salud y Farmacéutico</SelectItem>
              <SelectItem value="manufactura">Manufactura</SelectItem>
              <SelectItem value="retail">Retail y Comercio</SelectItem>
              <SelectItem value="servicios">Servicios</SelectItem>
              <SelectItem value="finanzas">Servicios Financieros</SelectItem>
              <SelectItem value="inmobiliario">Inmobiliario</SelectItem>
              <SelectItem value="energia">Energía</SelectItem>
              <SelectItem value="consultoria">Consultoría</SelectItem>
              <SelectItem value="educacion">Educación</SelectItem>
              <SelectItem value="turismo">Turismo y Hostelería</SelectItem>
              <SelectItem value="agricultura">Agricultura</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          {shouldShowCheckIcon(isIndustryValid, Boolean(companyData.industry), 'industry') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isIndustryValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Años de operación */}
        <div className="relative">
          <Label htmlFor="yearsOfOperation" className="block text-sm font-medium text-gray-700 mb-2">
            Años de operación *
          </Label>
          <Input
            id="yearsOfOperation"
            type="number"
            min="0"
            value={companyData.yearsOfOperation || ''}
            onChange={(e) => updateField('yearsOfOperation', Number(e.target.value))}
            onBlur={() => handleBlur('yearsOfOperation')}
            placeholder="0"
            className={getFieldClassName(isYearsValid, Boolean(companyData.yearsOfOperation), 'yearsOfOperation')}
          />
          {shouldShowCheckIcon(isYearsValid, Boolean(companyData.yearsOfOperation), 'yearsOfOperation') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isYearsValid && (
            <p className="text-red-500 text-sm mt-1">Debe ser mayor que 0</p>
          )}
        </div>

        {/* Número de empleados */}
        <div className="md:col-span-2 relative">
          <Label htmlFor="employeeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Número de empleados *
          </Label>
          <Select 
            value={companyData.employeeRange} 
            onValueChange={(value) => {
              updateField('employeeRange', value);
              handleBlur('employeeRange');
            }}
          >
            <SelectTrigger className={getFieldClassName(isEmployeeRangeValid, Boolean(companyData.employeeRange), 'employeeRange')}>
              <SelectValue placeholder="Selecciona el rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1 - 10 empleados</SelectItem>
              <SelectItem value="11-50">11 - 50 empleados</SelectItem>
              <SelectItem value="51-200">51 - 200 empleados</SelectItem>
              <SelectItem value="201-500">201 - 500 empleados</SelectItem>
              <SelectItem value="500+">Más de 500 empleados</SelectItem>
            </SelectContent>
          </Select>
          {shouldShowCheckIcon(isEmployeeRangeValid, Boolean(companyData.employeeRange), 'employeeRange') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && !isEmployeeRangeValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
