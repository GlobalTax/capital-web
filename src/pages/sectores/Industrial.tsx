
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Cog, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

const Industrial = () => {
  const services = [
    {
      icon: Factory,
      title: "M&A Industrial",
      description: "Asesoramiento en fusiones y adquisiciones para empresas manufactureras, químicas y de ingeniería."
    },
    {
      icon: Cog,
      title: "Valoración de Activos",
      description: "Evaluación especializada de maquinaria, plantas industriales y activos técnicos complejos."
    },
    {
      icon: TrendingUp,
      title: "Optimización Operativa",
      description: "Análisis de eficiencia y oportunidades de mejora en procesos industriales."
    },
    {
      icon: Users,
      title: "Due Diligence Técnica",
      description: "Revisión exhaustiva de procesos, tecnología y capacidades operativas."
    }
  ];

  const expertise = [
    "Industria Química y Petroquímica",
    "Manufactura y Automoción",
    "Ingeniería y Construcción",
    "Energía y Utilities",
    "Minería y Materiales",
    "Equipamiento Industrial"
  ];

  const stats = [
    { number: "50+", label: "Transacciones Industriales" },
    { number: "€2.5B", label: "Valor Transaccional" },
    { number: "15", label: "Países de Operación" },
    { number: "95%", label: "Éxito en Cierres" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Industrial"
        title="Sector Industrial"
        description="Especialistas en M&A para empresas industriales, manufactureras y de ingeniería con experiencia probada en transacciones complejas. Comprendemos las dinámicas operativas del sector."
        primaryButtonText="Analizar Oportunidad"
        secondaryButtonText="Ver Casos Industriales"
      />

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Servicios Especializados
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ofrecemos servicios adaptados a las particularidades del sector industrial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-0.5 border-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="text-center">
                  <service.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-center">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Nuestra Experiencia Industrial
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Comprendemos las complejidades operativas, regulatorias y técnicas 
                del sector industrial. Nuestro equipo combina experiencia financiera 
                con conocimiento sectorial profundo.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {expertise.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-lg border-0.5 border-black">
              <Award className="w-16 h-16 text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">
                Reconocimiento Sectorial
              </h3>
              <p className="text-slate-600 mb-4">
                Premiados como "Mejor Asesor M&A Industrial" por tres años consecutivos 
                por la Asociación Europea de Investment Banking.
              </p>
              <p className="text-slate-600">
                Nuestro expertise en due diligence técnica y valoración de activos 
                industriales es reconocido a nivel internacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Caso de Éxito Reciente
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto">
            Asesoramos la adquisición de una empresa química europea por un grupo industrial 
            asiático por €450M, incluyendo due diligence técnica completa y estructuración 
            financiera optimizada.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€450M</div>
              <div className="text-slate-400">Valor de Transacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">6 meses</div>
              <div className="text-slate-400">Tiempo de Ejecución</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-slate-400">Plantas Evaluadas</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Ver Casos Completos
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene un proyecto industrial?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Nuestros especialistas están listos para analizar su oportunidad 
            y proporcionar el asesoramiento que necesita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Gratuita
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Sector Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Industrial;
