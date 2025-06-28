
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Store, Truck, Users, Award, CheckCircle } from 'lucide-react';

const RetailConsumer = () => {
  const services = [
    {
      icon: Store,
      title: "M&A Retail",
      description: "Asesoramiento en fusiones y adquisiciones para cadenas retail, franquicias y comercio especializado."
    },
    {
      icon: ShoppingBag,
      title: "E-commerce M&A",
      description: "Especialización en plataformas de comercio electrónico, marketplaces y retail digital."
    },
    {
      icon: Truck,
      title: "Supply Chain",
      description: "Análisis de cadenas de suministro, logística y optimización de operaciones retail."
    },
    {
      icon: Users,
      title: "Consumer Brands",
      description: "Valoración de marcas de consumo, análisis de market share y posicionamiento competitivo."
    }
  ];

  const expertise = [
    "Retail Tradicional y Moderno",
    "E-commerce y Marketplaces",
    "Moda y Lifestyle",
    "Alimentación y Bebidas",
    "Electrodomésticos y Electrónica",
    "Franquicias y Licencias"
  ];

  const stats = [
    { number: "40+", label: "Transacciones Retail" },
    { number: "€1.6B", label: "Valor Transaccional" },
    { number: "22", label: "Países Europeos" },
    { number: "88%", label: "Integración Exitosa" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Retail & Consumer"
        title="Retail & Consumer"
        description="Especialistas en transacciones para empresas de retail, bienes de consumo y marcas con experiencia en transformación digital y omnicanalidad. Comprendemos las dinámicas del consumo moderno."
        primaryButtonText="Explorar Retail M&A"
        secondaryButtonText="Ver Casos Retail"
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
              Servicios adaptados al ecosistema retail y consumer en constante evolución
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
                Expertise en Retail & Consumer
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Comprendemos las dinámicas del consumo, la transformación digital del retail, 
                y los desafíos de la omnicanalidad. Nuestro equipo tiene experiencia directa 
                en operaciones retail y marcas de consumo.
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
                Líderes en Retail M&A
              </h3>
              <p className="text-slate-600 mb-4">
                Reconocidos como "Best Retail M&A Advisor" por Retail Week 
                y premiados por nuestro trabajo en transformación digital retail.
              </p>
              <p className="text-slate-600">
                Hemos asesorado la integración exitosa de más de 40 transacciones 
                retail, incluyendo procesos de digitalización post-fusión.
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
            Asesoramos la adquisición de una cadena de moda española con 120 tiendas 
            por un grupo retail europeo por €250M, incluyendo plan de digitalización integral.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€250M</div>
              <div className="text-slate-400">Valor de Transacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">120</div>
              <div className="text-slate-400">Tiendas Integradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div className="text-slate-400">Digitalización Lograda</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Ver Casos Retail
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene una empresa retail o consumer?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Nuestros especialistas están preparados para analizar su negocio 
            y maximizar el valor en su proceso de M&A.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Retail Gratuita
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Retail Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RetailConsumer;
