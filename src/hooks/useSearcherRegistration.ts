import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SearcherRegistrationData } from '@/schemas/searcherSchema';

export function useSearcherRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submitRegistration = async (data: SearcherRegistrationData) => {
    setIsSubmitting(true);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const { error } = await supabase
        .from('searcher_leads')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone || null,
          linkedin_url: data.linkedinUrl || null,
          job_title: data.jobTitle || null,
          background: data.background || null,
          investor_backing: data.investorBacking,
          investor_names: data.investorNames || null,
          fund_raised: data.fundRaised,
          search_phase: data.searchPhase,
          preferred_sectors: data.preferredSectors,
          preferred_locations: data.preferredLocations,
          min_revenue: data.minRevenue || null,
          max_revenue: data.maxRevenue || null,
          min_ebitda: data.minEbitda || null,
          max_ebitda: data.maxEbitda || null,
          deal_type_preferences: data.dealTypePreferences || [],
          additional_criteria: data.additionalCriteria || null,
          how_found_us: data.howFoundUs || null,
          referrer: document.referrer || null,
          utm_source: urlParams.get('utm_source') || null,
          utm_medium: urlParams.get('utm_medium') || null,
          utm_campaign: urlParams.get('utm_campaign') || null,
          user_agent: navigator.userAgent,
          gdpr_consent: data.gdprConsent,
          marketing_consent: data.marketingConsent || false
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email ya está registrado');
        }
        throw error;
      }

      toast({
        title: '¡Registro completado!',
        description: 'Hemos recibido tu perfil. Nos pondremos en contacto contigo pronto.'
      });

      navigate('/search-funds/registro-confirmado');
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast({
        title: 'Error al registrar',
        description: error instanceof Error ? error.message : 'Por favor, inténtalo de nuevo',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRegistration,
    isSubmitting
  };
}
