
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Users, TrendingUp, Handshake, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProgramaColaboradores = () => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrar con Supabase/HubSpot
    console.log('Formulario enviado');
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Comisiones Atractivas",
      description: "Obtén comisiones competitivas por cada empresa que nos refiera y cierre exitosamente."
    },
    {
      icon: Users,
      title: "Red de Contactos",
      description: "Forma parte de nuestra red exclusiva de profesionales del M&A y amplía tu networking."
    },
    {
      icon: Handshake,
      title: "Soporte Completo",
      description: "Te acompañamos en todo el proceso con materiales de apoyo y seguimiento personalizado."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Regístrate",
      description: "Completa el formulario con tu información profesional y área de especialización."
    },
    {
      number: "02", 
      title: "Evaluación",
      description: "Nuestro equipo evaluará tu perfil y experiencia para aprobar tu participación."
    },
    {
      number: "03",
      title: "Refiere Empresas",
      description: "Identifica y refiere empresas que puedan estar interesadas en nuestros servicios."
    },
    {
      number: "04",
      title: "Recibe Comisiones",
      description: "Obtén tu comisión por cada transacción exitosa que resulte de tu referencia."
    }
  ];

  const faqs = [
    {
      question: "¿Qué tipo de profesionales pueden participar?",
      answer: "Buscamos consultores, abogados, asesores fiscales, auditores y otros profesionales que tengan contacto con empresarios y pymes."
    },
    {
      question: "¿Cómo se calculan las comisiones?",
      answer: "Las comisiones se calculan como un porcentaje del fee final de la transacción, con tarifas competitivas que varían según el tipo de operación."
    },
    {
      question: "¿Cuándo se pagan las comisiones?",
      answer: "Las comisiones se pagan una vez completada exitosamente la transacción y cobrado el fee correspondiente."
    },
    {
      question: "¿Hay exclusividad requerida?",
      answer: "No requerimos exclusividad. Puedes colaborar con otras firmas siempre que no genere conflictos de interés."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Únete a Nuestro
            <span className="block">Programa de Colaboradores</span>
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto mb-8">
            Forma parte de nuestra red de profesionales y genera ingresos adicionales 
            refiriendo empresas que necesiten servicios de M&A
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Comenzar Ahora
            </Button>
            <Link to="/contacto">
              <Button variant="outline" className="text-lg px-8 py-4 border-0.5 border-border">
                Más Información
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              ¿Por Qué Colaborar con Capittal?
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Ofrecemos las mejores condiciones del mercado para nuestros colaboradores
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="capittal-card text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">{benefit.title}</h3>
                  <p className="text-black">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Perfil Ideal de Colaborador
              </h2>
              <p className="text-lg text-black mb-8">
                Buscamos profesionales que tengan contacto regular con empresarios 
                y pymes que puedan beneficiarse de nuestros servicios de M&A.
              </p>
              
              <div className="space-y-4">
                {[
                  "Consultores de empresas y estrategia",
                  "Abogados especializados en derecho mercantil",
                  "Asesores fiscales y contables",
                  "Auditores y consultores financieros",
                  "Brokers de seguros empresariales",
                  "Consultores en transformación digital"
                ].map((profile, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black" />
                    <span className="text-black">{profile}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="capittal-card">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Star className="w-12 h-12 text-black mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">¿Eres el candidato ideal?</h3>
                  <p className="text-black">
                    Si tienes experiencia profesional y contactos en el mundo empresarial, 
                    ¡queremos conocerte!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-black" />
                    <span className="text-black">+34 91 234 56 78</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-black" />
                    <span className="text-black">colaboradores@capittal.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Un proceso simple y transparente en 4 pasos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-black mb-4">{step.title}</h3>
                <p className="text-black">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Solicita Unirte al Programa
            </h2>
            <p className="text-lg text-black">
              Completa el formulario y nos pondremos en contacto contigo
            </p>
          </div>
          
          <Card className="capittal-card">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nombre Completo *
                    </label>
                    <Input 
                      className="capittal-input" 
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email *
                    </label>
                    <Input 
                      type="email"
                      className="capittal-input" 
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Teléfono *
                    </label>
                    <Input 
                      className="capittal-input" 
                      placeholder="+34 XXX XXX XXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Empresa
                    </label>
                    <Input 
                      className="capittal-input" 
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Profesión/Especialización *
                  </label>
                  <Input 
                    className="capittal-input" 
                    placeholder="Ej: Consultor de empresas, Abogado mercantilista..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Experiencia Profesional
                  </label>
                  <Textarea 
                    className="capittal-input min-h-32" 
                    placeholder="Cuéntanos sobre tu experiencia y tipo de clientes con los que trabajas..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    ¿Por qué te interesa el programa?
                  </label>
                  <Textarea 
                    className="capittal-input min-h-24" 
                    placeholder="Explícanos tu motivación..."
                  />
                </div>
                
                <Button type="submit" className="capittal-button w-full text-lg py-4">
                  Enviar Solicitud
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Preguntas Frecuentes
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="capittal-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-black mb-3">{faq.question}</h3>
                  <p className="text-black">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramaColaboradores;
