
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

const FusionesAdquisiciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Fusiones y Adquisiciones
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Asesoramiento integral en operaciones de M&A, desde la estrategia inicial 
              hasta el cierre exitoso de la transacción.
            </p>
            <Button className="capittal-button text-lg px-8 py-4">
              Consulta Gratuita
            </Button>
          </div>
        </div>
      </section>

      {/* Services Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                Experiencia en M&A
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Con más de 15 años de experiencia en el mercado español, nuestro equipo 
                ha asesorado en más de 200 transacciones de M&A, con un valor total superior 
                a €2.5 billones.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">200+</div>
                  <div className="text-gray-600">Transacciones</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
                  <div className="text-gray-600">Valor Total</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="/api/placeholder/600/400" 
                alt="M&A Advisory" 
                className="w-full h-80 object-cover rounded-lg border border-black"
              />
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-black mb-8 text-center">
              Nuestro Proceso de M&A
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: <Target size={32} />, title: "Estrategia", desc: "Definición de objetivos y targets" },
                { icon: <Users size={32} />, title: "Ejecución", desc: "Gestión del proceso completo" },
                { icon: <CheckCircle size={32} />, title: "Due Diligence", desc: "Análisis exhaustivo" },
                { icon: <TrendingUp size={32} />, title: "Cierre", desc: "Negociación y finalización" }
              ].map((step, index) => (
                <Card key={index} className="capittal-card text-center">
                  <CardContent className="p-6">
                    <div className="text-black mb-4 flex justify-center">
                      {step.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-black mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FusionesAdquisiciones;
