import React from 'react';
import { useTaxCalculator } from '@/hooks/useTaxCalculator';
import { TaxCalculatorForm } from './TaxCalculatorForm';
import { TaxCalculatorResults } from './TaxCalculatorResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export const TaxCalculator: React.FC = () => {
  const {
    formData,
    updateField,
    isFormValid,
    taxResult,
    showResults,
    setShowResults,
    calculateTax,
  } = useTaxCalculator();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Calculadora Fiscal de Venta de Empresas
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Calcula el impacto fiscal orientativo de la venta de tu empresa en España.
            Incluye IRPF, Impuesto de Sociedades y beneficios fiscales aplicables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showResults && taxResult ? (
            <TaxCalculatorResults
              result={taxResult}
              formData={formData}
              onBack={() => setShowResults(false)}
            />
          ) : (
            <TaxCalculatorForm
              formData={formData}
              updateField={updateField}
              onCalculate={calculateTax}
              isFormValid={isFormValid}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculator;
