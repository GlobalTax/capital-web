
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Award } from 'lucide-react';
import { useCache } from '@/hooks/useCache';
import { globalCache } from '@/utils/cache';

interface CaseStudy {
  id: string;
  title: string;
  sector: string;
  company_size?: string;
  value_amount?: number;
  value_currency: string;
  description: string;
  highlights?: string[];
  year?: number;
  is_featured: boolean;
  is_active: boolean;
}

const CaseStudies = () => {
  const fetchCaseStudies = React.useCallback(async (): Promise<CaseStudy[]> => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching case studies:', error);
      throw error;
    }

    return data || [];
  }, []);

  const { 
    data: cases, 
    isLoading, 
    error 
  } = useCache(
    'case_studies_featured',
    fetchCaseStudies,
    globalCache,
    10 * 60 * 1000 // 10 minutos de cache
  );

  if (isLoading) {
    return (
      <section id="casos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                ))}
              </div>
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

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error al cargar los casos de éxito.</p>
          </div>
        ) : cases && cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((case_) => (
              <Card key={case_.id} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-white border-0.5 border-black text-black rounded-lg">
                      {case_.sector}
                    </Badge>
                    {case_.is_featured && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
                    {case_.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {case_.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    {case_.value_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Valoración:</span>
                        <span className="text-xl font-bold text-black">
                          {case_.value_amount}M{case_.value_currency}
                        </span>
                      </div>
                    )}
                    
                    {case_.year && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Año:
                        </span>
                        <span className="font-medium text-black">{case_.year}</span>
                      </div>
                    )}

                    {case_.company_size && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tamaño:</span>
                        <span className="font-medium text-black">{case_.company_size}</span>
                      </div>
                    )}
                  </div>

                  {case_.highlights && case_.highlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-black mb-2">Destacados:</h4>
                      {case_.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-start text-sm text-gray-600">
                          <TrendingUp className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="leading-relaxed">{highlight}</span>
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

        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quiere conocer más detalles sobre nuestros casos de éxito?
          </p>
          <button className="bg-white text-black border-0.5 border-black rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Descargar Case Studies
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
