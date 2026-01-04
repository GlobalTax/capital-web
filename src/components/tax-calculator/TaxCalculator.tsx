import React from 'react';
import { useTaxCalculator } from '@/hooks/useTaxCalculator';
import { TaxCalculatorForm } from './TaxCalculatorForm';
import { TaxCalculatorResults } from './TaxCalculatorResults';

export const TaxCalculator: React.FC = () => {
  const {
    formData,
    updateField,
    isFormValid,
    taxResult,
    showResults,
    setShowResults,
    calculateTax,
    article21Eligibility,
  } = useTaxCalculator();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header moderno */}
      <div className="text-center space-y-4 mb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Normativa España 2025</span>
        </div>
        
        {/* Título principal */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Calculadora Fiscal
          <span className="block text-xl md:text-2xl font-normal text-muted-foreground mt-2">
            Venta de Empresas
          </span>
        </h1>
        
        {/* Descripción */}
        <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
          Estima el impacto fiscal de la venta de tu empresa: IRPF, Impuesto de Sociedades y beneficios fiscales aplicables.
        </p>
      </div>

      {/* Contenido */}
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
          article21Eligibility={article21Eligibility}
        />
      )}
    </div>
  );
};

export default TaxCalculator;
