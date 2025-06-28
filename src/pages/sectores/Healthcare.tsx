
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Stethoscope, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

const Healthcare = () => {
  const services = [
    {
      icon: Heart,
      title: "M&A Farmacéutico",
      description: "Asesoramiento en fusiones y adquisiciones para empresas farmacéuticas, biotecnológicas y de dispositivos médicos."
    },
    {
      icon: Stethoscope,
      title: "Valoración de Activos Médicos",
      description: "Evaluación especializada de patentes, pipeline de productos y tecnologías sanitarias innovadoras."
    },
    {
      icon: TrendingUp,
      title: "Regulación y Compliance",
      description: "Análisis de cumplimiento regulatorio y evaluación de riesgos normativos específicos del sector."
    },
    {
      icon: Users,
      title: "Due Diligence Clínica",
      description: "Revisión exhaustiva de ensayos clínicos, aprobaciones regulatorias y pipeline de desarrollo."
    }
  ];

  const expertise = [
    "Farmacéuticas y Biotecnología",
    "Dispositivos Médicos",
    "Servicios Sanitarios",
    "HealthTech y Telemedicina",
    "Diagnóstico y Laboratorios",
    "Investigación Clínica"
  ];

  const stats = [
    { number: "35+", label: "Transacciones Healthcare" },
    { number: "€1.8B", label: "Valor Transaccional" },
    { number: "12", label: "Países Europeos" },
    { number: "98%", label: "Éxito Regulatorio" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Healthcare"
        title="Sector Healthcare"
        description="Especialistas en M&A para el sector sanitario, farmacéutico y biotecnológico con profundo conocimiento regulatorio y técnico. Comprendemos las complejidades del desarrollo de productos médicos."
        primaryButtonText="Consulta Especializada"
        secondaryButtonText="Ver Casos Healthcare"
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
              Ofrecemos servicios adaptados a las complejidades del sector sanitario
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
                Expertise en Healthcare
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Comprendemos las complejidades regulatorias, los ciclos de desarrollo de productos 
                y los marcos normativos específicos del sector sanitario europeo.
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
                Reconocidos como "Mejor Asesor M&A Healthcare" por la European Healthcare 
                Investment Banking Association durante dos años consecutivos.
              </p>
              <p className="text-slate-600">
                Nuestro conocimiento en valoración de biotecnología y análisis regulatorio 
                es referencia en el mercado europeo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Caso de Éxito Destacado
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto">
            Asesoramos la adquisición de una biotecnológica española especializada en oncología 
            por un grupo farmacéutico internacional por €320M, incluyendo valoración de pipeline 
            y análisis regulatorio completo.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€320M</div>
              <div className="text-slate-400">Valor de Transacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">8 meses</div>
              <div className="text-slate-400">Proceso Completo</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">5</div>
              <div className="text-slate-400">Productos en Pipeline</div>
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
            ¿Tiene un proyecto en Healthcare?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Nuestros especialistas están preparados para analizar su oportunidad 
            y proporcionar el asesoramiento experto que necesita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Gratuita
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Healthcare Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Healthcare;
