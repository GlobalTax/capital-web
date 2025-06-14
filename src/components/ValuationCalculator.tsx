
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { Calculator, TrendingUp, Building2, DollarSign } from 'lucide-react';

const ValuationCalculator = () => {
  const { 
    companyData, 
    result, 
    isCalculating, 
    updateField, 
    calculateValuation, 
    resetCalculator 
  } = useValuationCalculator();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isFormValid = companyData.companyName && 
                     companyData.industry && 
                     companyData.revenue > 0 && 
                     companyData.ebitda > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Business Valuation Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Get an estimated valuation of your business using industry-standard methodologies
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Enter company name"
                className="w-full"
              />
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </Label>
              <Select value={companyData.industry} onValueChange={(value) => updateField('industry', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="finance">Financial Services</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Annual Revenue */}
            <div>
              <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue ($) *
              </Label>
              <Input
                id="revenue"
                type="number"
                value={companyData.revenue || ''}
                onChange={(e) => updateField('revenue', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* EBITDA */}
            <div>
              <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
                EBITDA ($) *
              </Label>
              <Input
                id="ebitda"
                type="number"
                value={companyData.ebitda || ''}
                onChange={(e) => updateField('ebitda', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Number of Employees */}
            <div>
              <Label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </Label>
              <Input
                id="employees"
                type="number"
                value={companyData.employees || ''}
                onChange={(e) => updateField('employees', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Year Founded */}
            <div>
              <Label htmlFor="yearFounded" className="block text-sm font-medium text-gray-700 mb-2">
                Year Founded
              </Label>
              <Input
                id="yearFounded"
                type="number"
                value={companyData.yearFounded}
                onChange={(e) => updateField('yearFounded', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </Label>
              <Input
                id="location"
                value={companyData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="City, State/Country"
                className="w-full"
              />
            </div>

            {/* Growth Rate */}
            <div>
              <Label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
                Annual Growth Rate (%)
              </Label>
              <Input
                id="growthRate"
                type="number"
                value={companyData.growthRate}
                onChange={(e) => updateField('growthRate', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              onClick={calculateValuation}
              disabled={!isFormValid || isCalculating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Valuation
                </>
              )}
            </Button>
            
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="px-8"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
              Valuation Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Estimated Valuation</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(result.finalValuation)}
                </p>
                <p className="text-sm text-gray-600">
                  Range: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Revenue Multiple</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {(result.finalValuation / companyData.revenue).toFixed(1)}x
                </p>
                <p className="text-sm text-gray-600">
                  Based on {formatCurrency(companyData.revenue)} revenue
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Revenue Multiple</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.revenueMultiple)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">EBITDA Multiple</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.ebitdaMultiple)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">DCF Valuation</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.dcfValue)}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Disclaimer
              </h3>
              <p className="text-sm text-yellow-700">
                This valuation is an estimate based on general market multiples and should not be considered 
                as professional financial advice. For accurate business valuations, please consult with a 
                qualified financial advisor or business valuation expert.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Ready to Calculate
            </h3>
            <p className="text-gray-500">
              Fill in the required fields above and click "Calculate Valuation" to get your estimate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationCalculator;
