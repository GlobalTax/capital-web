import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Database, BarChart3 } from 'lucide-react';
interface Statistic {
  id: string;
  metric_key: string;
  metric_value: string;
  metric_label: string;
  display_order: number;
  is_active: boolean;
}
const MarketInsights = () => {
  const [insights, setInsights] = useState<Statistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchInsights();
  }, []);
  const fetchInsights = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('key_statistics').select('*').eq('is_active', true).order('display_order').limit(3);
      if (error) {
        console.error('Error fetching statistics:', error);
        // Use fallback data if database fetch fails
        setInsights([{
          id: '1',
          metric_key: 'volumen_transaccional',
          metric_value: '€300M',
          metric_label: 'Volumen Transaccional Q4',
          display_order: 1,
          is_active: true
        }, {
          id: '2',
          metric_key: 'transacciones_activas',
          metric_value: '47',
          metric_label: 'Transacciones Activas',
          display_order: 2,
          is_active: true
        }, {
          id: '3',
          metric_key: 'empresas_valoradas',
          metric_value: '156',
          metric_label: 'Empresas Valoradas',
          display_order: 3,
          is_active: true
        }]);
      } else {
        setInsights(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      // Use fallback data
      setInsights([{
        id: '1',
        metric_key: 'volumen_transaccional',
        metric_value: '€300M',
        metric_label: 'Volumen Transaccional Q4',
        display_order: 1,
        is_active: true
      }, {
        id: '2',
        metric_key: 'transacciones_activas',
        metric_value: '47',
        metric_label: 'Transacciones Activas',
        display_order: 2,
        is_active: true
      }, {
        id: '3',
        metric_key: 'empresas_valoradas',
        metric_value: '156',
        metric_label: 'Empresas Valoradas',
        display_order: 3,
        is_active: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  return <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Capittal Market
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Accede a análisis de mercado en tiempo real y datos exclusivos del sector M&A 
            con nuestro sistema propietario de inteligencia de mercado.
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isLoading ?
        // Loading skeleton
        [...Array(3)].map((_, index) => <Card key={index} className="bg-white border border-gray-300 rounded-lg shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                </CardContent>
              </Card>) : insights.map((insight, index) => <Card key={insight.id} className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-out text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-black mb-1">
                    {insight.metric_value}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">
                    {insight.metric_label}
                  </div>
                  <div className="text-sm font-medium text-green-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15% vs Q3
                  </div>
                </CardContent>
              </Card>)}
        </div>

        {/* Market Intelligence CTA */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-black mb-4">
            Inteligencia de Mercado Capittal
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Nuestro sistema propietario ofrece acceso exclusivo a valoraciones de mercado, 
            análisis de transacciones comparables y datos de inteligencia M&A actualizados en tiempo real.
          </p>
          
          <div className="flex justify-center mb-8">
            <Button variant="outline" className="px-6 py-3 text-lg font-medium hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all duration-300 ease-out" onClick={() => window.open('https://capittalmarket.com', '_blank')}>
              Acceder a Capittal Market
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-black mb-2 text-base">Valoraciones en Tiempo Real</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Metodologías DCF, múltiplos y transacciones comparables actualizadas diariamente.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Database className="w-6 h-6 text-black mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-black mb-2 text-base">Base de Datos M&A</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Acceso a más de 10,000 transacciones históricas con detalles financieros.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-black mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-black mb-2 text-base">Analytics Avanzados</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dashboards interactivos y reportes personalizados para decisiones informadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default MarketInsights;