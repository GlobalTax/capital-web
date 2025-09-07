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
  is_value_confidential?: boolean;
  logo_url?: string;
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
              <Card key={case_.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 ease-out group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    {case_.sector && (
                      <Badge variant="secondary" className="rounded-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
                        {case_.sector}
                      </Badge>
                    )}
                    {case_.is_featured && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  {/* Logo - larger and better positioned */}
                  {case_.logo_url && (
                    <div className="w-20 h-20 mb-6 bg-gray-50 rounded-lg p-3 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 mx-auto">
                      <img 
                        src={case_.logo_url} 
                        alt={`${case_.title} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200 rounded text-gray-500 text-xs font-medium';
                          fallback.textContent = 'Logo';
                          e.currentTarget.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-black mb-4 leading-tight text-center group-hover:text-blue-700 transition-colors duration-200">
                    {case_.title}
                  </h3>
                    
                    {case_.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                        {case_.description}
                      </p>
                    )}

                    <div className="space-y-3 mb-4">
                      {case_.is_value_confidential ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Valoración:</span>
                          <div className="inline-flex items-center px-3 py-1 text-sm font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-lg">
                            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                            </svg>
                            Confidencial
                          </div>
                        </div>
                      ) : case_.value_amount ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Valoración:</span>
                          <span className="text-xl font-bold text-black">
                            {case_.value_amount}M{case_.value_currency}
                          </span>
                        </div>
                      ) : null}
                      
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