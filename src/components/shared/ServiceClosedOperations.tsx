import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ServiceClosedOperationsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

const ServiceClosedOperations: React.FC<ServiceClosedOperationsProps> = ({
  title = 'Operaciones que avalan nuestra experiencia',
  subtitle,
  limit = 3,
}) => {
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['service-closed-operations', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, sector, value_amount, value_currency, is_value_confidential, year, logo_url, counterpart_logo_url')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('year', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: stats } = useQuery({
    queryKey: ['service-key-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('key_statistics')
        .select('metric_key, metric_value, metric_label')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const getStatValue = (key: string, fallback: string) => {
    const stat = stats?.find((s) => s.metric_key === key);
    return stat?.metric_value || fallback;
  };

  const getStatLabel = (key: string, fallback: string) => {
    const stat = stats?.find((s) => s.metric_key === key);
    return stat?.metric_label || fallback;
  };

  const formatValue = (amount: number | null, currency: string | null, confidential: boolean | null) => {
    if (confidential) return 'Confidencial';
    if (!amount) return 'Confidencial';
    const millions = amount / 1_000_000;
    if (millions >= 1) return `€${millions.toFixed(0)}M`;
    const thousands = amount / 1_000;
    return `€${thousands.toFixed(0)}K`;
  };

  if (casesLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!cases || cases.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {cases.map((cs) => (
            <div
              key={cs.id}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20"
            >
              {/* Logo */}
              <div className="h-14 mb-4 flex items-center">
                {cs.logo_url ? (
                  <img
                    src={cs.logo_url}
                    alt={cs.title}
                    className="h-10 max-w-[140px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>

              {/* Sector badge */}
              <span className="inline-block text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                {cs.sector}
              </span>

              {/* Title */}
              <h3 className="text-base font-semibold text-foreground mb-3 line-clamp-2">
                {cs.title}
              </h3>

              {/* Value & Year */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">
                  {formatValue(cs.value_amount, cs.value_currency, cs.is_value_confidential)}
                </span>
                {cs.year && (
                  <span className="text-muted-foreground">{cs.year}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Bar */}
        <div className="bg-card border border-border rounded-xl p-6 max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {getStatValue('total_operations', '200+')}
              </span>
              <span className="text-sm text-muted-foreground">
                {getStatLabel('total_operations', 'Operaciones Cerradas')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {getStatValue('total_value', '€902M')}
              </span>
              <span className="text-sm text-muted-foreground">
                {getStatLabel('total_value', 'Valor Transaccionado')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {getStatValue('success_rate', '98.7%')}
              </span>
              <span className="text-sm text-muted-foreground">
                {getStatLabel('success_rate', 'Tasa de Éxito')}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/casos-exito"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline transition-colors"
          >
            Ver todos los casos de éxito
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceClosedOperations;
