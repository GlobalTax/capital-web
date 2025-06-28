
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CreditCard, TrendingUp, Shield, Award, CheckCircle } from 'lucide-react';

const FinancialServices = () => {
  const services = [
    {
      icon: Banknote,
      title: "M&A Bancario",
      description: "Asesoramiento en fusiones y adquisiciones para bancos, cajas de ahorro y entidades de crédito."
    },
    {
      icon: CreditCard,
      title: "Fintech M&A",
      description: "Especialización en transacciones de empresas fintech, neobancos y servicios de pago."
    },
    {
      icon: TrendingUp,
      title: "Gestión de Activos",
      description: "Transacciones en gestoras de fondos, family offices y servicios de inversión."
    },
    {
      icon: Shield,
      title: "Seguros y Reaseguros",
      description: "Due diligence especializada en compañías de seguros, actuarial y análisis de riesgos."
    }
  ];

  const expertise = [
    "Banca Comercial y de Inversión",
    "Fintech y Pagos Digitales",
    "Seguros y Reaseguros",
    "Gestión de Activos",
    "Private Equity y Venture Capital",
    "Servicios Financieros Corporativos"
  ];

  const stats = [
    { number: "45+", label: "Transacciones Financieras" },
    { number: "€3.2B", label: "Valor Transaccional" },
    { number: "15", label: "Jurisdicciones" },
    { number: "100%", label: "Aprobación Regulatoria" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <SectorHero
        sector="Financial Services"
        title="Financial Services"
        description="Especialistas en M&A para el sector financiero con profundo conocimiento regulatorio y experiencia en transacciones complejas. Navegamos las complejidades normativas europeas."
        primaryButtonText="Consulta Financiera Especializada"
        secondaryButtonText="Ver Casos Financieros"
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
              Servicios adaptados a las complejidades regulatorias del sector financiero
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
                Expertise Financiero
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Comprendemos las complejidades regulatorias, los requisitos de capital, 
                y los marcos normativos específicos del sector financiero europeo. 
                Nuestro equipo incluye ex-reguladores y especialistas bancarios.
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
                Reconocimiento Regulatorio
              </h3>
              <p className="text-slate-600 mb-4">
                Reconocidos por el Banco Central Europeo como "Outstanding M&A Advisor" 
                en transacciones bancarias por tres años consecutivos.
              </p>
              <p className="text-slate-600">
                100% de éxito en obtención de aprobaciones regulatorias en 
                transacciones financieras durante los últimos 5 años.
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
            Asesoramos la fusión de dos entidades bancarias regionales españolas 
            creando el quinto banco regional de España con €580M en activos combinados.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€580M</div>
              <div className="text-slate-400">Activos Combinados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">14 meses</div>
              <div className="text-slate-400">Proceso Regulatorio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">85</div>
              <div className="text-slate-400">Oficinas Integradas</div>
            </div>
          </div>
          <Button className="capittal-button bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Ver Casos Financieros
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Tiene un proyecto financiero?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Nuestros especialistas regulatorios están preparados para navegar 
            las complejidades de su transacción financiera.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Regulatoria
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
              Descargar Financial Services Report
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FinancialServices;
