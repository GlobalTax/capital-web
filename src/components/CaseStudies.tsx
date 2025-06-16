
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaseStudy {
  id: string;
  title: string;
  sector: string;
  value_amount?: number;
  value_currency: string;
  description: string;
  highlights?: string[];
  is_featured: boolean;
  is_active: boolean;
}

const CaseStudies = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching case studies:', error);
        return;
      }

      setCases(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="casos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="casos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Casos de Éxito
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestro historial habla por sí mismo. Descubra cómo hemos ayudado a empresas 
            a alcanzar sus objetivos estratégicos.
          </p>
        </div>

        {cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((case_) => (
              <Card key={case_.id} className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-white border border-gray-300 text-black rounded-lg">
                      {case_.sector}
                    </Badge>
                    {case_.value_amount && (
                      <span className="text-xl font-bold text-black">
                        {case_.value_amount}M{case_.value_currency}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-3">
                    {case_.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {case_.description}
                  </p>

                  {case_.highlights && case_.highlights.length > 0 && (
                    <div className="space-y-2">
                      {case_.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">No hay casos de éxito disponibles en este momento.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quiere conocer más detalles sobre nuestros casos de éxito?
          </p>
          <button className="bg-white text-black border border-gray-300 rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Descargar Case Studies
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
