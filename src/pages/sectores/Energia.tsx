
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Sun, Wind, Battery, Award, CheckCircle } from 'lucide-react';

const Energia = () => {
  const services = [
    {
      icon: Sun,
      title: "Energías Renovables",
      description: "M&A especializado en parques solares, eólicos y proyectos de energía renovable a gran escala."
    },
    {
      icon: Zap,
      title: "Infraestructura Energética",
      description: "Transacciones en redes de distribución, transmisión y infraestructura energética crítica."
    },
    {
      icon: Battery,
      title: "Almacenamiento y Smart Grid",
      description: "Valoración de tecnologías de almacenamiento, redes inteligentes y soluciones innovadoras."
    },
    {
      icon: Wind,
      title: "Utilities y Servicios",
      description: "Due diligence en empresas de servicios públicos, utilities y comercializadoras energéticas."
    }
  ];

  const expertise = [
    "Energía Solar y Fotovoltaica",
    "Energía Eólica Onshore/Offshore",
    "Biomasa y Biogás",
    "Infraestructura de Distribución",
    "Smart Grids y Storage",
    "Utilities y Comercializadoras"
  ];

  const stats = [
    { number: "25+", label: "Proyectos Energéticos" },
    { number: "€1.4B", label: "Valor en Renovables" },
    { number: "850MW", label: "Capacidad Instalada" },
    { number: "90%", label: "Éxito Regulatorio" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-yellow-900 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Energía y Renovables
            </h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto mb-8">
              Especialistas en M&A para el sector energético y renovables con profundo 
              conocimiento técnico y regulatorio de la transición energética.
            </p>
            <Button className="capittal-button text-lg px-8 py-4 bg-white text-black hover:bg-gray-100">
              Explorar Oportunidades Energéticas
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Servicios Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Servicios adaptados a la complejidad técnica y regulatoria del sector energético
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <service.icon className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
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
                Expertise en Energía
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Comprendemos las complejidades técnicas, los marcos regulatorios, y las 
                dinámicas de financiación del sector energético. Nuestro equipo incluye 
                ingenieros energéticos y especialistas en regulación.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {expertise.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 p-8 rounded-lg">
              <Award className="w-16 h-16 text-yellow-600 mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">
                Líderes en Energía
              </h3>
              <p className="text-gray-600 mb-4">
                Reconocidos como "Energy M&A Advisor of the Year" por Energy Finance 
                Magazine por nuestro trabajo en transición energética.
              </p>
              <p className="text-gray-600">
                Hemos participado en más de €1.4B en transacciones de energías 
                renovables, representando más de 850MW de capacidad instalada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-20 bg-yellow-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Caso de Éxito Destacado
          </h2>
          <p className="text-xl text-yellow-100 mb-8 max-w-4xl mx-auto">
            Asesoramos la venta de un portfolio de parques solares españoles de 200MW 
            a un fondo de infraestructura europeo por €380M, incluyendo PPA a 20 años.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€380M</div>
              <div className="text-yellow-300">Valor de Transacción</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">200MW</div>
              <div className="text-yellow-300">Capacidad Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">20 años</div>
              <div className="text-yellow-300">Contratos PPA</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100">
            Ver Casos Energéticos
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene un proyecto energético?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nuestros especialistas en energía están preparados para analizar 
            su proyecto y maximizar su valor en el mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Energética
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Energy Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Energia;
