
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO title="Política de Privacidad" description="Cómo recopilamos, usamos y protegemos tus datos personales." />
      
      <section className="pt-32 pb-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              En Capittal, nos comprometemos a proteger y respetar su privacidad. Esta política explica cómo recopilamos, 
              utilizamos y protegemos su información personal.
            </p>

            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">1. Información que Recopilamos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Recopilamos información cuando usted:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Completa formularios en nuestro sitio web</li>
                  <li>• Se registra para recibir información o servicios</li>
                  <li>• Participa en encuestas o promociones</li>
                  <li>• Se comunica con nosotros por cualquier medio</li>
                  <li>• Navega por nuestro sitio web (datos técnicos)</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">2. Cómo Utilizamos su Información</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Proporcionar y mejorar nuestros servicios</li>
                  <li>• Comunicarnos con usted sobre nuestros servicios</li>
                  <li>• Enviar información comercial relevante</li>
                  <li>• Cumplir con obligaciones legales</li>
                  <li>• Mejorar la experiencia del usuario en nuestro sitio web</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">3. Protección de Datos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                  su información personal contra el acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">4. Sus Derechos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conforme al RGPD, usted tiene derecho a:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Acceder a sus datos personales</li>
                  <li>• Rectificar datos inexactos</li>
                  <li>• Suprimir sus datos</li>
                  <li>• Limitar el tratamiento</li>
                  <li>• Portabilidad de datos</li>
                  <li>• Oponerse al tratamiento</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">5. Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Para ejercer sus derechos o realizar consultas sobre esta política, puede contactarnos en:
                </p>
                <div className="mt-4 text-gray-600">
                  <p>Email: privacy@capittal.com</p>
                  <p>Direcciones: Carrer Ausias March, 36, Principal (Barcelona)</p>
                  <p>P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: Enero 2024
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidad;
