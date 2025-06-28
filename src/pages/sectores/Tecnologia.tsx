
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Laptop, Code, Smartphone, Database, Award, CheckCircle } from 'lucide-react';

const Tecnologia = () => {
  const services = [
    {
      icon: Laptop,
      title: "M&A Tech Empresarial",
      description: "Asesoramiento en fusiones y adquisiciones para empresas de software, SaaS y servicios tecnológicos."
    },
    {
      icon: Code,
      title: "Valoración de Startups",
      description: "Evaluación especializada de activos digitales, propiedad intelectual y modelos de negocio escalables."
    },
    {
      icon: Smartphone,
      title: "Mobile & Apps",
      description: "Análisis de aplicaciones móviles, plataformas digitales y ecosistemas de desarrollo tecnológico."
    },
    {
      icon: Database,
      title: "Due Diligence Técnica",
      description: "Revisión exhaustiva de arquitectura, seguridad, escalabilidad y stack tecnológico."
    }
  ];

  const expertise = [
    "Software y SaaS",
    "Fintech y Medtech",
    "E-commerce y Marketplaces",
    "Inteligencia Artificial",
    "Ciberseguridad",
    "Cloud Computing"
  ];

  const stats = [
    { number: "60+", label: "Transacciones Tech" },
    { number: "€2.1B", label: "Valor Transaccional" },
    { number: "18", label: "Países de Operación" },
    { number: "92%", label: "Éxito en Startups" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Tecnología"
        title="Sector Tecnología"
        description="Especialistas en M&A para empresas tecnológicas, desde startups innovadoras hasta corporaciones tech establecidas. Entendemos los modelos de negocio tecnológicos y las métricas SaaS."
        primaryButtonText="Explorar Oportunidades Tech"
        secondaryButtonText="Ver Casos Tech"
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
              Servicios adaptados al ecosistema tecnológico y sus particularidades
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
                Experiencia en Tecnología
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Entendemos los modelos de negocio tecnológicos, métricas SaaS, escalabilidad 
                y los desafíos únicos del sector tech. Nuestro equipo combina experiencia 
                financiera con conocimiento técnico profundo.
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
                Líderes en Tech M&A
              </h3>
              <p className="text-slate-600 mb-4">
                Reconocidos como "Top Tech M&A Advisor" por TechCrunch y Forbes 
                por nuestro trabajo con unicornios europeos.
              </p>
              <p className="text-slate-600">
                Hemos asesorado más de 60 transacciones tech, incluyendo 12 exits 
                superiores a €100M en los últimos 3 años.
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
            Asesoramos la venta de una plataforma SaaS española de gestión empresarial 
            a un grupo tecnológico europeo por €180M, logrando un múltiplo de 8x ARR.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€180M</div>
              <div className="text-slate-400">Valor de Transacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">8x ARR</div>
              <div className="text-slate-400">Múltiplo Alcanzado</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-slate-400">Usuarios Activos</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Ver Más Casos Tech
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene una empresa tecnológica?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Nuestros expertos en tech están listos para analizar su empresa 
            y maximizar su valoración en el mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Valoración Tech Gratuita
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Tech Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tecnologia;
