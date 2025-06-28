
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollaboratorApplicationForm from '@/components/CollaboratorApplicationForm';

const ProgramaColaboradores = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Programa de Colaboradores Capittal
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Únete a nuestra red de profesionales especializados en M&A, valoraciones y finanzas corporativas
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">¿Por qué ser colaborador de Capittal?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Red Profesional</h3>
                  <p className="text-gray-600">
                    Accede a una amplia red de profesionales y oportunidades de negocio
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Proyectos Exclusivos</h3>
                  <p className="text-gray-600">
                    Participa en proyectos de M&A y valoraciones de alto nivel
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Crecimiento Profesional</h3>
                  <p className="text-gray-600">
                    Desarrolla tu carrera con formación continua y mentoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Solicita tu participación</h2>
                <p className="text-xl text-gray-600">
                  Completa el formulario y nos pondremos en contacto contigo
                </p>
              </div>
              
              <CollaboratorApplicationForm />
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Requisitos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Experiencia Profesional</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Mínimo 3 años en M&A, valoraciones o finanzas corporativas</li>
                    <li>• Experiencia en due diligence financiera</li>
                    <li>• Conocimiento de múltiplos de valoración</li>
                    <li>• Experiencia en modelado financiero</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Competencias</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Dominio de Excel/Google Sheets avanzado</li>
                    <li>• Conocimientos de contabilidad y finanzas</li>
                    <li>• Capacidad analítica y atención al detalle</li>
                    <li>• Excelentes habilidades de comunicación</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProgramaColaboradores;
