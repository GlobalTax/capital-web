import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CaseStudy {
  id: string;
  title: string;
  description?: string;
  sector?: string;
  value_amount?: number;
  value_currency?: string;
  year?: number;
  company_size?: string;
  highlights?: string[];
  is_featured: boolean;
}

const CaseStudiesCompact = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await supabase
          .from('case_studies')
          .select('*')
          .eq('is_featured', true)
          .order('year', { ascending: false })
          .limit(3);

        setCases(data || []);
      } catch (error) {
        console.error('Error fetching case studies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Casos de Éxito Destacados
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestro historial habla por sí mismo. Estas son algunas de las operaciones más destacadas que hemos liderado.
          </p>
        </div>

        {cases.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {cases.map((case_) => (
                <Card key={case_.id} className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-out group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {case_.sector && (
                        <Badge variant="secondary" className="rounded-lg">
                          {case_.sector}
                        </Badge>
                      )}
                      {case_.is_featured && (
                        <Award className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
                      {case_.title}
                    </h3>
                    
                    {case_.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                        {case_.description}
                      </p>
                    )}

                    <div className="space-y-3 mb-4">
                      {case_.value_amount && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Valoración:</span>
                          <span className="text-xl font-bold text-black">
                            {case_.value_amount}M{case_.value_currency}
                          </span>
                        </div>
                      )}
                      
                      {case_.year && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Año:
                          </span>
                          <span className="font-medium text-black">{case_.year}</span>
                        </div>
                      )}

                      {case_.company_size && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tamaño:</span>
                          <span className="font-medium text-black">{case_.company_size}</span>
                        </div>
                      )}
                    </div>

                    {case_.highlights && case_.highlights.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-black mb-2">Destacados:</h4>
                        {case_.highlights.slice(0, 2).map((highlight, idx) => (
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

          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No hay casos destacados disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CaseStudiesCompact;