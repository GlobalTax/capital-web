
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, Euro, Calendar, Percent } from 'lucide-react';

interface TaxDataFormProps {
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

const TaxDataForm: React.FC<TaxDataFormProps> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calculator className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Datos Fiscales para Cálculo de Impacto
        </h2>
        <p className="text-gray-600">
          Información necesaria para calcular el impacto fiscal de la venta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coste de Adquisición */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Euro className="h-5 w-5 mr-2" />
              Coste de Adquisición
            </CardTitle>
            <CardDescription>
              Precio pagado originalmente por la empresa o inversión inicial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="acquisitionCost">Coste de Adquisición (€)</Label>
            <Input
              id="acquisitionCost"
              type="number"
              value={companyData.acquisitionCost || ''}
              onChange={(e) => updateField('acquisitionCost', Number(e.target.value))}
              onBlur={() => handleFieldBlur && handleFieldBlur('acquisitionCost')}
              placeholder="0"
              className="mt-2"
            />
            {showValidation && errors?.acquisitionCost && (
              <p className="text-red-500 text-sm mt-1">{errors.acquisitionCost}</p>
            )}
          </CardContent>
        </Card>

        {/* Años de Tenencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              Años de Tenencia
            </CardTitle>
            <CardDescription>
              Tiempo que ha poseído la empresa (afecta a las reducciones fiscales)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="yearsHeld">Años de Tenencia</Label>
            <Input
              id="yearsHeld"
              type="number"
              value={companyData.yearsHeld || ''}
              onChange={(e) => updateField('yearsHeld', Number(e.target.value))}
              onBlur={() => handleFieldBlur && handleFieldBlur('yearsHeld')}
              placeholder="1"
              min="0"
              className="mt-2"
            />
            {showValidation && errors?.yearsHeld && (
              <p className="text-red-500 text-sm mt-1">{errors.yearsHeld}</p>
            )}
          </CardContent>
        </Card>

        {/* Porcentaje de Venta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Percent className="h-5 w-5 mr-2" />
              Porcentaje a Vender
            </CardTitle>
            <CardDescription>
              Qué porcentaje de la empresa planea vender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="salePercentage">Porcentaje de Venta (%)</Label>
            <Input
              id="salePercentage"
              type="number"
              value={companyData.salePercentage || ''}
              onChange={(e) => updateField('salePercentage', Number(e.target.value))}
              onBlur={() => handleFieldBlur && handleFieldBlur('salePercentage')}
              placeholder="100"
              min="1"
              max="100"
              className="mt-2"
            />
            {showValidation && errors?.salePercentage && (
              <p className="text-red-500 text-sm mt-1">{errors.salePercentage}</p>
            )}
          </CardContent>
        </Card>

        {/* Régimen Fiscal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Régimen Fiscal</CardTitle>
            <CardDescription>
              Seleccione el régimen fiscal aplicable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="taxRegime">Régimen Fiscal</Label>
            <Select
              value={companyData.taxRegime || ''}
              onValueChange={(value) => updateField('taxRegime', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Seleccione régimen fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General (19%)</SelectItem>
                <SelectItem value="pyme">PYME (15%/25%)</SelectItem>
                <SelectItem value="startup">Startup (15%)</SelectItem>
              </SelectContent>
            </Select>
            {showValidation && errors?.taxRegime && (
              <p className="text-red-500 text-sm mt-1">{errors.taxRegime}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan de Reinversión */}
      <Card>
        <CardHeader>
          <CardTitle>Plan de Reinversión</CardTitle>
          <CardDescription>
            Beneficios fiscales por reinvertir las ganancias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reinvestmentPlan">¿Planea reinvertir parte de las ganancias?</Label>
              <p className="text-sm text-gray-500 mt-1">
                Puede reducir hasta un 20% de los impuestos si reinvierte al menos el 50%
              </p>
            </div>
            <Switch
              id="reinvestmentPlan"
              checked={companyData.reinvestmentPlan || false}
              onCheckedChange={(checked) => updateField('reinvestmentPlan', checked)}
            />
          </div>

          {companyData.reinvestmentPlan && (
            <div>
              <Label htmlFor="reinvestmentAmount">Cantidad a Reinvertir (€)</Label>
              <Input
                id="reinvestmentAmount"
                type="number"
                value={companyData.reinvestmentAmount || ''}
                onChange={(e) => updateField('reinvestmentAmount', Number(e.target.value))}
                placeholder="0"
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Información Fiscal
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Régimen General:</strong> 19% sobre plusvalías</li>
          <li>• <strong>PYME:</strong> 15% hasta 300.000€, 25% el exceso</li>
          <li>• <strong>Startup:</strong> 15% con incentivos especiales</li>
          <li>• <strong>Reducción por años:</strong> Hasta 30% por permanencia</li>
          <li>• <strong>Reinversión:</strong> Hasta 20% de bonificación adicional</li>
        </ul>
      </div>
    </div>
  );
};

export default TaxDataForm;
