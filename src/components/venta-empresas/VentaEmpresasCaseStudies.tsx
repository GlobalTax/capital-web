import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const VentaEmpresasCaseStudies = () => {
  const caseStudies = [
    {
      sector: "SaaS B2B",
      company: "TechFlow Solutions",
      valuation: "12M€",
      multiple: "4.2x EBITDA",
      roi: "25% primer año",
      beforeAfter: {
        before: "Empresa familiar con crecimiento limitado",
        after: "Adquirida por grupo internacional, expansión europea"
      },
      highlights: ["Diversificación de ingresos", "Escalabilidad tecnológica", "Equipo directivo consolidado"]
    },
    {
      sector: "Distribución Industrial",
      company: "Industrial Parts Group",
      valuation: "8.5M€",
      multiple: "3.8x EBITDA",
      roi: "+2M€ en sinergias",
      beforeAfter: {
        before: "Distribución regional con márgenes comprimidos",
        after: "Integración con red nacional, optimización logística"
      },
      highlights: ["Red de distribución ampliada", "Sinergias logísticas", "Diversificación geográfica"]
    },
    {
      sector: "Retail & Consumo",
      company: "Premium Retail Chain",
      valuation: "10M€",
      multiple: "4.0x EBITDA",
      roi: "Expansión internacional",
      beforeAfter: {
        before: "Cadena regional con potencial sin explotar",
        after: "Plataforma para expansión en mercados emergentes"
      },
      highlights: ["Marca consolidada", "Ubicaciones premium", "Sistema de gestión escalable"]
    },
    {
      sector: "Servicios Profesionales",
      company: "Consulting Excellence",
      valuation: "6.2M€",
      multiple: "3.5x EBITDA",
      roi: "30% crecimiento anual",
      beforeAfter: {
        before: "Consultora boutique con dependencia de fundadores",
        after: "Integrada en grupo multinacional, procesos estandarizados"
      },
      highlights: ["Metodología diferenciada", "Cartera de clientes fidelizada", "Equipo especializado"]
    }
  ];

  return (
    <section id="casos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Casos de Éxito Reales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo hemos ayudado a empresarios a maximizar el valor de sus negocios 
            y conseguir resultados excepcionales en la venta.
          </p>
        </div>

        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {caseStudies.map((study, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {study.sector}
                        </span>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{study.roi}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {study.company}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{study.valuation}</div>
                          <div className="text-sm text-gray-600">Valoración</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{study.multiple}</div>
                          <div className="text-sm text-gray-600">Múltiplo</div>
                        </div>
                      </div>

                      {/* Before/After */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Antes:</div>
                          <p className="text-sm text-gray-700">{study.beforeAfter.before}</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Después:</div>
                          <p className="text-sm text-gray-700">{study.beforeAfter.after}</p>
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Factores clave:</div>
                        <ul className="space-y-1">
                          {study.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Global Results */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">+200</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Empresas Vendidas</div>
            <div className="text-sm text-gray-600">Desde 2018</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">€2.5B</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Valor Total</div>
            <div className="text-sm text-gray-600">En transacciones</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">4.2x</div>
            <div className="text-lg font-medium text-gray-900 mb-1">Múltiplo Promedio</div>
            <div className="text-sm text-gray-600">EBITDA</div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
          >
            Ver más casos de éxito
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasCaseStudies;