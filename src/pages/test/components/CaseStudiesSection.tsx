import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import { Lock, ArrowRight, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Mapeo de símbolos de moneda a códigos ISO 4217
const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  const cleanCurrency = currency.trim();
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    'â¬': 'EUR', // Handle corrupted euro symbol
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY',
  };
  
  return currencyMap[cleanCurrency] || 'EUR';
};

const formatValue = (amount: number | undefined, currency: string, isConfidential: boolean | undefined) => {
  if (isConfidential || !amount) {
    return null;
  }
  
  // Convertir símbolo a código ISO válido
  const currencyCode = mapCurrencySymbolToCode(currency);
  
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: amount >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(amount);
  
  return formatted;
};

const CaseStudiesSection: React.FC = () => {
  const { caseStudies, isLoading } = useCaseStudies();
  
  // Mostrar solo 3 casos destacados
  const featuredCases = caseStudies
    .filter(c => c.is_featured)
    .slice(0, 3);

  return (
    <section className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-slate-400 text-sm tracking-[0.2em] uppercase block mb-4">
            Casos de éxito
          </span>
          <h2 className="font-serif-display text-slate-900 text-4xl md:text-5xl lg:text-6xl leading-tight">
            Operaciones que hablan
            <br />
            <span className="text-slate-500">por sí mismas</span>
          </h2>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 shadow-sm">
                <Skeleton className="h-12 w-24 bg-slate-200 mb-8" />
                <Skeleton className="h-4 w-32 bg-slate-200 mb-4" />
                <Skeleton className="h-8 w-full bg-slate-200 mb-4" />
                <Skeleton className="h-16 w-full bg-slate-200 mb-6" />
                <Skeleton className="h-6 w-20 bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && featuredCases.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              Próximamente nuevos casos de éxito
            </p>
          </div>
        )}

        {/* Cases Grid */}
        {!isLoading && featuredCases.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredCases.map((caseStudy) => (
              <motion.div
                key={caseStudy.id}
                variants={cardVariants}
                className="group bg-white p-8 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Logo */}
                <div className="h-12 mb-8 flex items-center">
                  {caseStudy.logo_url ? (
                    <img 
                      src={caseStudy.logo_url} 
                      alt={caseStudy.title}
                      className="h-full w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Badge */}
                <div className="mb-4">
                  <span className="text-slate-400 text-xs tracking-[0.15em] uppercase">
                    {caseStudy.sector}
                    {caseStudy.year && ` • ${caseStudy.year}`}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif-display text-slate-900 text-xl md:text-2xl mb-4 leading-tight group-hover:text-slate-700 transition-colors">
                  {caseStudy.title}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {caseStudy.description}
                </p>

                {/* Value */}
                <div className="pt-6 border-t border-slate-200">
                  {caseStudy.is_value_confidential ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Valor confidencial</span>
                    </div>
                  ) : (
                    <div className="text-slate-900 font-medium text-lg">
                      {formatValue(caseStudy.value_amount, caseStudy.value_currency, caseStudy.is_value_confidential) || (
                        <span className="text-slate-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm">Valor confidencial</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover CTA */}
                <div className="mt-4 flex items-center gap-2 text-transparent group-hover:text-slate-500 transition-all duration-300">
                  <span className="text-sm">Ver caso</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-slate-200 pt-12 mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <p className="text-slate-500 text-lg">
            Más de <span className="text-slate-900 font-medium">200 operaciones</span> cerradas con éxito
          </p>
          <Link 
            to="/casos-exito"
            className="inline-flex items-center gap-3 text-slate-900 text-sm tracking-wide hover:text-slate-600 transition-colors group"
          >
            Ver todos los casos
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
