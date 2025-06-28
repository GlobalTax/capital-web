
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Home, MapPin, TrendingUp, Award, CheckCircle } from 'lucide-react';

const Inmobiliario = () => {
  const services = [
    {
      icon: Building,
      title: "Real Estate Comercial",
      description: "M&A en oficinas, centros comerciales, naves industriales y activos inmobiliarios comerciales."
    },
    {
      icon: Home,
      title: "Promoción Residencial",
      description: "Transacciones en promotoras, constructoras y desarrolladores de proyectos residenciales."
    },
    {
      icon: MapPin,
      title: "Gestión de Activos",
      description: "Valoración de portfolios inmobiliarios, SOCIMIs y fondos de inversión inmobiliaria."
    },
    {
      icon: TrendingUp,
      title: "PropTech M&A",
      description: "Due diligence en empresas de tecnología inmobiliaria, plataformas digitales y servicios."
    }
  ];

  const expertise = [
    "Promoción y Construcción",
    "Centros Comerciales y Retail",
    "Oficinas y Espacios Corporativos",
    "Logística e Industrial",
    "SOCIMIs y REITs",
    "PropTech y Servicios"
  ];

  const stats = [
    { number: "30+", label: "Transacciones Inmobiliarias" },
    { number: "€2.8B", label: "Valor de Activos" },
    { number: "15M m²", label: "Superficie Gestionada" },
    { number: "95%", label: "Due Diligence Exitosa" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-stone-900 to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sector Inmobiliario
            </h1>
            <p className="text-xl text-stone-100 max-w-3xl mx-auto mb-8">
              Especialistas en M&A inmobiliario con experiencia en todos los segmentos, 
              desde promoción residencial hasta activos comerciales e industriales.
            </p>
            <Button className="capittal-button text-lg px-8 py-4 bg-white text-black hover:bg-gray-100">
              Explorar Real Estate M&A
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
              Servicios adaptados a la complejidad del mercado inmobiliario español y europeo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <service.icon className="w-12 h-12 mx-auto mb-4 text-stone-600" />
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
                Expertise Inmobiliario
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Comprendemos los ciclos inmobiliarios, la regulación urbanística, y las 
                complejidades fiscales del sector. Nuestro equipo incluye arquitectos, 
                urbanistas y especialistas en derecho inmobiliario.
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
            <div className="bg-stone-50 p-8 rounded-lg">
              <Award className="w-16 h-16 text-stone-600 mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">
                Líderes en Real Estate
              </h3>
              <p className="text-gray-600 mb-4">
                Reconocidos como "Real Estate M&A Advisor of the Year" por Real Estate 
                Finance por nuestro trabajo en transacciones complejas.
              </p>
              <p className="text-gray-600">
                Hemos gestionado más de €2.8B en transacciones inmobiliarias, 
                incluyendo portfolios complejos y operaciones internacionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Caso de Éxito Destacado
          </h2>
          <p className="text-xl text-stone-100 mb-8 max-w-4xl mx-auto">
            Asesoramos la venta de un portfolio de centros comerciales españoles 
            a un REIT europeo por €650M, incluyendo reestructuración de contratos de arrendamiento.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€650M</div>
              <div className="text-stone-300">Valor de Portfolio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-stone-300">Centros Comerciales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-stone-300">Ocupación Media</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100">
            Ver Casos Inmobiliarios
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene un proyecto inmobiliario?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nuestros especialistas inmobiliarios están preparados para analizar 
            su portfolio y maximizar el valor de sus activos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Inmobiliaria
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Real Estate Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Inmobiliario;
