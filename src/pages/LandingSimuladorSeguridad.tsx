import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import CapittalBrief from '@/components/landing/CapittalBrief';
import SecuritySimulatorForm from '@/components/security-simulator/SecuritySimulatorForm';
import SecuritySimulatorResults from '@/components/security-simulator/SecuritySimulatorResults';
import { SUBSECTOR_CONFIGS } from '@/components/security-simulator/subsectorFields';
import { calculateSecurityValuation, type SecurityInputData, type SecurityValuationResult } from '@/utils/securityValuation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LandingSimuladorSeguridad = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [result, setResult] = useState<SecurityValuationResult | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [subsectorLabel, setSubsectorLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: SecurityInputData & { contactName: string; contactEmail: string; contactCompany: string; contactPhone?: string }) => {
    setIsSubmitting(true);
    try {
      // Calculate locally
      const valuation = calculateSecurityValuation(data);
      setResult(valuation);
      setCompanyName(data.contactCompany);
      setSubsectorLabel(SUBSECTOR_CONFIGS.find(s => s.id === data.subsector)?.label || data.subsector);

      // Send lead to backend
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            type: 'contact',
            data: {
              full_name: data.contactName,
              email: data.contactEmail,
              company: data.contactCompany,
              phone: data.contactPhone || '',
              source: 'simulador-seguridad',
              message: `Simulación sector seguridad - Subsector: ${data.subsector}, Revenue: ${data.annualRevenue}€, EBITDA: ${data.ebitda}€, Valoración estimada: ${valuation.totalValuation}€`,
              utm_source: new URLSearchParams(location.search).get('utm_source') || 'organic',
              utm_medium: new URLSearchParams(location.search).get('utm_medium') || '',
              utm_campaign: new URLSearchParams(location.search).get('utm_campaign') || '',
            },
          },
        });
      } catch (leadError) {
        console.error('Lead submission error (non-blocking):', leadError);
      }

      toast({
        title: '¡Simulación completada!',
        description: 'Hemos calculado la valoración estimada de tu empresa.',
      });
    } catch (error) {
      console.error('Valuation error:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al calcular. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [location.search, toast]);

  const handleReset = useCallback(() => {
    setResult(null);
    setCompanyName('');
    setSubsectorLabel('');
  }, []);

  return (
    <>
      <SEOHead
        title="Simulador de Operación Seguridad Privada | Capittal M&A"
        description="Simula la compraventa de tu empresa de seguridad privada. Valoración específica para alarmas, vigilancia, sistemas electrónicos, contra incendios y ciberseguridad."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración empresa seguridad, vender empresa alarmas, compraventa vigilancia, simulador M&A seguridad privada, valoración CRA"
        structuredData={[
          getServiceSchema(
            'Simulador de Operación Seguridad Privada',
            'Herramienta de simulación de compraventa para empresas de seguridad privada con valoración sectorial específica.',
            'Business Valuation Service'
          ),
          getWebPageSchema(
            'Simulador de Operación Seguridad Privada',
            'Simula la compraventa de tu empresa de seguridad privada con múltiplos y estructura de deal específicos del sector.',
            `https://capittal.es${location.pathname}`
          ),
        ]}
      />
      <UnifiedLayout variant="landing">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {!result ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Simulador de Operación — Sector Seguridad
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                  Descubre el valor estimado de tu empresa de seguridad privada y cómo se estructuraría 
                  una operación de compraventa con parámetros reales del mercado español.
                </p>
              </div>
              <SecuritySimulatorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </>
          ) : (
            <SecuritySimulatorResults
              result={result}
              companyName={companyName}
              subsectorLabel={subsectorLabel}
              onReset={handleReset}
            />
          )}
          <div className="mt-12">
            <ConfidentialityBlock />
          </div>
          <CapittalBrief />
        </div>
      </UnifiedLayout>
    </>
  );
};

export default LandingSimuladorSeguridad;
